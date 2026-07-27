process.env.REDIS_URL = "redis://localhost:6379";
jest.mock('marked', () => ({
  marked: { parse: jest.fn() }
}), { virtual: true });
const mongoose = require("mongoose");
jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  }));
});
const { createProject } = require("../controllers/project.controller");
const { Project, PROJECT_TEMPLATES } = require("@urbackend/common");

jest.mock("@urbackend/common", () => {
  const original = jest.requireActual("@urbackend/common");
  return {
    ...original,
    generateApiKey: jest.fn(() => "test_api_key"),
    hashApiKey: jest.fn(() => "hashed_key"),
    encrypt: jest.fn(() => "encrypted_key"),
    markDeveloperOnboardingStep: jest.fn().mockResolvedValue(),
  };
});

jest.mock("../utils/emitEvent", () => ({
  emitEvent: jest.fn(),
}));

jest.setTimeout(15000);

describe("Project Controller - Clone Template", () => {
  let req, res;
  let saveSpy, countDocumentsSpy;

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

    jest.spyOn(mongoose, "startSession").mockRejectedValue(new Error("No replica set / standalone mode fallback"));
    saveSpy = jest.spyOn(Project.prototype, "save").mockImplementation(function() {
      this._id = this._id || new mongoose.Types.ObjectId();
      return Promise.resolve(this);
    });
    countDocumentsSpy = jest.spyOn(Project, "countDocuments").mockResolvedValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should create a project with template configuration", async () => {
    req.body = {
      name: "Test Clone Project",
      templateId: "sdk-kanban",
    };

    await createProject(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();

    const responseObj = res.json.mock.calls[0][0];
    expect(responseObj.success).toBe(true);
    expect(responseObj.data.name).toBe("Test Clone Project");
    expect(responseObj.data.isAuthEnabled).toBe(true);

    const collectionNames = responseObj.data.collections.map(c => c.name);
    expect(collectionNames).toContain("boards");
    expect(collectionNames).toContain("tasks");
    expect(collectionNames).toContain("users");

    const boardsCol = responseObj.data.collections.find(c => c.name === "boards");
    expect(boardsCol.rls).toBe("private");
  });

  it("should ignore invalid templateId and create a normal project", async () => {
    req.body = {
      name: "Normal Project",
      templateId: "invalid-template",
    };

    await createProject(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const responseObj = res.json.mock.calls[0][0];
    expect(responseObj.success).toBe(true);
    expect(responseObj.data.name).toBe("Normal Project");
    expect(responseObj.data.collections).toHaveLength(0);
    expect(responseObj.data.isAuthEnabled).toBe(false);
  });
});
