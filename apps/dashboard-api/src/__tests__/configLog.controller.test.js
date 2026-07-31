'use strict';

/**
 * Tests for configLog.controller.js — getConfigLogs
 *
 * Coverage:
 *   - 200 happy path (no filter)
 *   - 200 happy path with valid category filter
 *   - 400 on unknown category string
 *   - 400 on non-string category (object injection attempt)
 *   - Correct pagination maths (totalPages, skip, limit clamping)
 *   - DB error forwarded via next()
 */

// --- Mocks -------------------------------------------------------------------

const mockFind          = jest.fn();
const mockCountDocuments = jest.fn();

class MockAppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

jest.mock('@urbackend/common', () => ({
  ProjectConfigLog: {
    find:           mockFind,
    countDocuments: mockCountDocuments,
  },
  AppError: MockAppError,
}));

// -----------------------------------------------------------------------------

const { getConfigLogs } = require('../controllers/configLog.controller');

// Helpers
const makeReq = (params = {}, query = {}) => ({
  params: { projectId: 'proj_abc123', ...params },
  query,
});

const makeRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json:   jest.fn().mockReturnThis(),
  };
  return res;
};

/** Chainable Mongoose query stub: find().sort().skip().limit().select().lean() */
const makeQueryChain = (resolvedValue) => ({
  sort:   jest.fn().mockReturnThis(),
  skip:   jest.fn().mockReturnThis(),
  limit:  jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  lean:   jest.fn().mockResolvedValue(resolvedValue),
});

// -----------------------------------------------------------------------------

describe('configLog.controller — getConfigLogs', () => {
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn();
  });

  // ---------------------------------------------------------------------------
  // Happy paths
  // ---------------------------------------------------------------------------

  it('returns 200 with logs and pagination when no category filter is given', async () => {
    const fakeLogs = [
      { _id: 'log1', category: 'auth', label: 'Auth enabled', changedAt: new Date() },
    ];
    mockFind.mockReturnValue(makeQueryChain(fakeLogs));
    mockCountDocuments.mockResolvedValue(1);

    const req = makeReq({}, {});
    const res = makeRes();

    await getConfigLogs(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);

    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.message).toBe('Configuration change logs retrieved successfully.');
    expect(body.data.logs).toEqual(fakeLogs);
    expect(body.data.pagination).toEqual({
      page: 1,
      limit: 30,
      total: 1,
      totalPages: 1,
    });
  });

  it('filters by a valid category and passes it to the DB query', async () => {
    mockFind.mockReturnValue(makeQueryChain([]));
    mockCountDocuments.mockResolvedValue(0);

    const req = makeReq({}, { category: 'auth' });
    const res = makeRes();

    await getConfigLogs(req, res, next);

    expect(next).not.toHaveBeenCalled();
    // Both DB calls must receive the category in the filter
    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: 'proj_abc123', category: 'auth' }),
    );
    expect(mockCountDocuments).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: 'proj_abc123', category: 'auth' }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('accepts every value in ALLOWED_CATEGORIES without error', async () => {
    const ALLOWED = [
      'project_info', 'api_key', 'auth', 'public_signup', 'auth_providers',
      'allowed_domains', 'byod_db', 'byod_storage', 'collection_schema',
      'collection_rls', 'mail_template', 'resend', 'member',
    ];

    for (const cat of ALLOWED) {
      jest.clearAllMocks();
      mockFind.mockReturnValue(makeQueryChain([]));
      mockCountDocuments.mockResolvedValue(0);

      const req = makeReq({}, { category: cat });
      const res = makeRes();

      await getConfigLogs(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    }
  });

  // ---------------------------------------------------------------------------
  // Pagination maths
  // ---------------------------------------------------------------------------

  it('computes skip correctly for page > 1', async () => {
    mockFind.mockReturnValue(makeQueryChain([]));
    mockCountDocuments.mockResolvedValue(100);

    const req = makeReq({}, { page: '3', limit: '10' });
    const res = makeRes();

    await getConfigLogs(req, res, next);

    const chain = mockFind.mock.results[0].value;
    expect(chain.skip).toHaveBeenCalledWith(20);   // (3-1) * 10
    expect(chain.limit).toHaveBeenCalledWith(10);

    const body = res.json.mock.calls[0][0];
    expect(body.data.pagination).toMatchObject({ page: 3, limit: 10, total: 100, totalPages: 10 });
  });

  it('clamps limit to a maximum of 100', async () => {
    mockFind.mockReturnValue(makeQueryChain([]));
    mockCountDocuments.mockResolvedValue(0);

    const req = makeReq({}, { limit: '999' });
    const res = makeRes();

    await getConfigLogs(req, res, next);

    const chain = mockFind.mock.results[0].value;
    expect(chain.limit).toHaveBeenCalledWith(100);
    const body = res.json.mock.calls[0][0];
    expect(body.data.pagination.limit).toBe(100);
  });

  it('defaults page to 1 and limit to 30 when query params are absent', async () => {
    mockFind.mockReturnValue(makeQueryChain([]));
    mockCountDocuments.mockResolvedValue(0);

    const req = makeReq({}, {});
    const res = makeRes();

    await getConfigLogs(req, res, next);

    const chain = mockFind.mock.results[0].value;
    expect(chain.skip).toHaveBeenCalledWith(0);
    expect(chain.limit).toHaveBeenCalledWith(30);
  });

  it('floors page to 1 when page=0 or negative is supplied', async () => {
    mockFind.mockReturnValue(makeQueryChain([]));
    mockCountDocuments.mockResolvedValue(0);

    const req = makeReq({}, { page: '-5' });
    const res = makeRes();

    await getConfigLogs(req, res, next);

    const chain = mockFind.mock.results[0].value;
    expect(chain.skip).toHaveBeenCalledWith(0);
    const body = res.json.mock.calls[0][0];
    expect(body.data.pagination.page).toBe(1);
  });

  // ---------------------------------------------------------------------------
  // Security — NoSQL injection prevention
  // ---------------------------------------------------------------------------

  it('rejects an unknown category string with 400', async () => {
    const req = makeReq({}, { category: 'unknown_bad_value' });
    const res = makeRes();

    await getConfigLogs(req, res, next);

    expect(mockFind).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(MockAppError));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
    expect(err.message).toMatch(/Invalid category/);
  });

  it('rejects a MongoDB operator object injected via query string with 400', async () => {
    // Simulates ?category[$ne]=null parsed by Express as { category: { $ne: null } }
    const req = makeReq({}, { category: { $ne: null } });
    const res = makeRes();

    await getConfigLogs(req, res, next);

    expect(mockFind).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(MockAppError));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
  });

  it('rejects an empty string category with 400', async () => {
    const req = makeReq({}, { category: '' });
    const res = makeRes();

    await getConfigLogs(req, res, next);

    // Empty string is not in ALLOWED_CATEGORIES
    expect(next).toHaveBeenCalledWith(expect.any(MockAppError));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
  });

  // ---------------------------------------------------------------------------
  // Error handling
  // ---------------------------------------------------------------------------

  it('forwards a DB error to next() without swallowing it', async () => {
    const dbError = new Error('MongoDB timeout');
    mockFind.mockReturnValue({
      sort:   jest.fn().mockReturnThis(),
      skip:   jest.fn().mockReturnThis(),
      limit:  jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean:   jest.fn().mockRejectedValue(dbError),
    });
    mockCountDocuments.mockResolvedValue(0);

    const req = makeReq({}, {});
    const res = makeRes();

    await getConfigLogs(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
    expect(res.json).not.toHaveBeenCalled();
  });
});
