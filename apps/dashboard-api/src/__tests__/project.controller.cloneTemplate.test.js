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
  });

  afterEach(async () => {
    await Project.deleteMany({});
  });

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/urbackend_test_clone_template");
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should create a project with template configuration", async () => {
    req.body = {
      name: "Test Clone Project",
      templateId: "sdk-kanban",
    };

    await createProject(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    
    const createdProject = await Project.findOne({ name: "Test Clone Project" });
    expect(createdProject).toBeDefined();
    
    // Check if auth is enabled
    expect(createdProject.isAuthEnabled).toBe(true);

    // Check collections
    const collectionNames = createdProject.collections.map(c => c.name);
    expect(collectionNames).toContain("boards");
    expect(collectionNames).toContain("tasks");
    expect(collectionNames).toContain("users"); // auto added for auth

    const boardsCol = createdProject.collections.find(c => c.name === "boards");
    expect(boardsCol.rls).toBe("private");
  });

  it("should ignore invalid templateId and create a normal project", async () => {
    req.body = {
      name: "Normal Project",
      templateId: "invalid-template",
    };

    await createProject(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const createdProject = await Project.findOne({ name: "Normal Project" });
    expect(createdProject.collections).toHaveLength(0);
    expect(createdProject.isAuthEnabled).toBe(false);
  });
});
