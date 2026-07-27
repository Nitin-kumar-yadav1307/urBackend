'use strict';

const mongoose = require('mongoose');

/**
 * PROJECT_TEMPLATES — inline copy of just the templates createProject uses.
 * We keep this in the test so we never pull in the real @urbackend/common
 * (which initialises Redis, BullMQ, GC timers — all blow up in CI).
 */
const PROJECT_TEMPLATES = {
  'sdk-kanban': {
    name: 'Kanban Board',
    description: 'Full-featured Kanban board with drag-and-drop tasks.',
    isAuthEnabled: true,
    collections: [
      {
        name: 'boards',
        rls: 'private',
        model: [{ key: 'title', type: 'String', required: true }],
      },
      {
        name: 'tasks',
        rls: 'private',
        model: [
          { key: 'boardId', type: 'Ref', required: true },
          { key: 'title', type: 'String', required: true },
          { key: 'status', type: 'String', required: true, default: 'todo' },
        ],
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Real Zod — needed for schema validation inside createProject      */
/* ------------------------------------------------------------------ */
const { z } = require('zod');

/*  Reconstruct the real createProjectSchema so parse() actually works */
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  templateId: z.string().optional(),
  siteUrl: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z
      .string()
      .url('Invalid Site URL format')
      .refine((url) => {
        try {
          const parsed = new URL(url);
          return (
            parsed.protocol === 'https:' ||
            (parsed.protocol === 'http:' &&
              ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname))
          );
        } catch {
          return false;
        }
      }, 'Site URL must use HTTPS (or http://localhost for local development)')
      .optional(),
  ),
});

/* ------------------------------------------------------------------ */
/*  Mock @urbackend/common — NO jest.requireActual to avoid side-     */
/*  effects (Redis, BullMQ queues, GC timers, email service, etc.)    */
/* ------------------------------------------------------------------ */
const mockSave = jest.fn();
const mockCountDocuments = jest.fn();

// Minimal Project constructor mock that behaves like a Mongoose model
function MockProject(data) {
  Object.assign(this, data);
  this._id = data._id || new mongoose.Types.ObjectId();
  this.collections = this.collections || [];
  this.isAuthEnabled = this.isAuthEnabled || false;
}
MockProject.prototype.save = mockSave;
MockProject.prototype.toObject = function () {
  const obj = { ...this };
  // Simulate toObject stripping prototype methods
  delete obj.save;
  delete obj.toObject;
  return obj;
};
MockProject.countDocuments = mockCountDocuments;
// For spying / instanceof checks
MockProject.schema = { obj: {} };

jest.mock('@urbackend/common', () => ({
  Project: MockProject,
  PROJECT_TEMPLATES,
  createProjectSchema,
  generateApiKey: jest.fn(() => 'test_api_key'),
  hashApiKey: jest.fn(() => 'hashed_key'),
  encrypt: jest.fn(() => ({ encrypted: 'enc', iv: 'iv', tag: 'tag' })),
  markDeveloperOnboardingStep: jest.fn().mockResolvedValue(),
  AppError: class AppError extends Error {
    constructor(statusCode, message, error = null) {
      super(message);
      this.name = 'AppError';
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.error = error || (statusCode >= 500 ? 'Internal Server Error' : 'Error');
      this.isOperational = true;
    }
  },
  // Stubs for other imports used at module-level by project.controller.js
  Developer: { findById: jest.fn() },
  Log: { aggregate: jest.fn() },
  getStorage: jest.fn(),
  getConnection: jest.fn(),
  getCompiledModel: jest.fn(),
  QueryEngine: jest.fn(),
  storageRegistry: {},
  webhookQueue: { add: jest.fn() },
  enqueueCollectionCleanup: jest.fn(),
  syncCollectionCleanup: jest.fn(),
  resolveEffectivePlan: jest.fn(() => ({ name: 'free' })),
  deleteProjectByApiKeyCache: jest.fn(),
  setProjectById: jest.fn(),
  getProjectById: jest.fn(),
  deleteProjectById: jest.fn(),
  isProjectStorageExternal: jest.fn(() => false),
  getBucket: jest.fn(() => 'default'),
  getPresignedUploadUrl: jest.fn(),
  verifyUploadedFile: jest.fn(),
  getPublicIp: jest.fn(),
  clearCompiledModel: jest.fn(),
  createUniqueIndexes: jest.fn(),
  ApiAnalytics: { aggregate: jest.fn() },
  MailLog: { aggregate: jest.fn() },
  getProjectAccessQuery: jest.fn((userId) => ({
    $or: [{ owner: userId }, { 'members.user': userId }],
  })),
  getProjectRole: jest.fn(),
  Invitation: { find: jest.fn() },
  sanitizeObjectId: jest.fn((v) => v),
  sanitizeNonEmptyString: jest.fn((v) => v),
  createCollectionSchema: { parse: jest.fn((v) => v) },
  editCollectionSchema: { parse: jest.fn((v) => v) },
  updateExternalConfigSchema: { parse: jest.fn((v) => v) },
  updateAuthProvidersSchema: { parse: jest.fn((v) => v) },
  decrypt: jest.fn(() => 'decrypted'),
  getS3CompatibleStorage: jest.fn(),
}));

jest.mock('../utils/emitEvent', () => ({
  emitEvent: jest.fn(),
}));

jest.setTimeout(15000);

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */
describe('Project Controller - Clone Template', () => {
  let req, res;

  // Import AFTER mocks are set up
  const { createProject } = require('../controllers/project.controller');

  beforeEach(() => {
    req = {
      body: {},
      user: { _id: new mongoose.Types.ObjectId(), isVerified: true },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();

    // Simulate standalone MongoDB (no replica set) — triggers fallback path
    jest.spyOn(mongoose, 'startSession').mockRejectedValue(
      new Error('Transaction numbers are only allowed on a replica set member or mongos'),
    );

    // Mock save to behave like Mongoose save
    mockSave.mockImplementation(function () {
      this._id = this._id || new mongoose.Types.ObjectId();
      return Promise.resolve(this);
    });

    mockCountDocuments.mockResolvedValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a project with template configuration', async () => {
    req.body = {
      name: 'Test Clone Project',
      templateId: 'sdk-kanban',
    };

    await createProject(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();

    const responseObj = res.json.mock.calls[0][0];
    expect(responseObj.success).toBe(true);
    expect(responseObj.data.name).toBe('Test Clone Project');
    expect(responseObj.data.isAuthEnabled).toBe(true);

    const collectionNames = responseObj.data.collections.map((c) => c.name);
    expect(collectionNames).toContain('boards');
    expect(collectionNames).toContain('tasks');
    expect(collectionNames).toContain('users');

    const boardsCol = responseObj.data.collections.find((c) => c.name === 'boards');
    const mode = typeof boardsCol.rls === 'string' ? boardsCol.rls : boardsCol.rls?.mode;
    expect(mode).toBe('private');
  });

  it('should ignore invalid templateId and create a normal project', async () => {
    req.body = {
      name: 'Normal Project',
      templateId: 'invalid-template',
    };

    await createProject(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const responseObj = res.json.mock.calls[0][0];
    expect(responseObj.success).toBe(true);
    expect(responseObj.data.name).toBe('Normal Project');
    expect(responseObj.data.collections).toHaveLength(0);
    expect(responseObj.data.isAuthEnabled).toBeFalsy();
  });

  it('should create a project without templateId', async () => {
    req.body = {
      name: 'Blank Project',
    };

    await createProject(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const responseObj = res.json.mock.calls[0][0];
    expect(responseObj.success).toBe(true);
    expect(responseObj.data.name).toBe('Blank Project');
    expect(responseObj.data.collections).toHaveLength(0);
  });

  it('should return 400 for missing project name', async () => {
    req.body = {};

    await createProject(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should enforce project limit when set', async () => {
    req.body = { name: 'Over Limit' };
    req.projectLimit = 2;
    mockCountDocuments.mockResolvedValue(2);

    await createProject(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should add users collection with auth-enabled template', async () => {
    req.body = {
      name: 'Auth Template Project',
      templateId: 'sdk-kanban',
    };

    await createProject(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const responseObj = res.json.mock.calls[0][0];
    const usersCol = responseObj.data.collections.find((c) => c.name === 'users');
    expect(usersCol).toBeDefined();

    const usersMode = typeof usersCol.rls === 'string' ? usersCol.rls : usersCol.rls?.mode;
    expect(usersMode).toBe('private');

    const emailField = usersCol.model.find((f) => f.key === 'email');
    const passwordField = usersCol.model.find((f) => f.key === 'password');
    expect(emailField).toBeDefined();
    expect(passwordField).toBeDefined();
  });
});
