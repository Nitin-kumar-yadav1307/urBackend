process.env.REDIS_URL = "redis://localhost:6379";
process.env.PUBLIC_API_URL = "http://localhost:3000";
process.env.INTERNAL_SECRET = "secret";

jest.mock("@urbackend/common/src/utils/emailService", () => ({}));
jest.mock("marked", () => ({ marked: jest.fn() }));

jest.mock("@urbackend/common", () => {
    const original = jest.requireActual("@urbackend/common");
    return {
        ...original,
        isSafeUri: jest.fn(),
        getPublicIp: jest.fn().mockResolvedValue("192.168.1.1"),
        encrypt: jest.fn().mockReturnValue("encrypted"),
        decrypt: jest.fn().mockReturnValue("decrypted"),
    };
});

jest.mock("mongoose", () => ({
    createConnection: jest.fn()
}));

jest.mock("axios");

const { updateExternalConfig } = require("../controllers/project.controller");
const Project = require("@urbackend/common").Project;
const { isSafeUri } = require("@urbackend/common");
const mongoose = require("mongoose");
const axios = require("axios");

describe("project.controller - BYOD Verification", () => {
    let req, res;
    
    beforeEach(() => {
        req = {
            params: { projectId: "test-id" },
            body: { dbUri: "mongodb://somehost" },
            user: { _id: "user-id" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        
        const mockProject = { _id: "test-id", publishableKey: "pk", secretKey: "sk" };
        Project.findByIdAndUpdate = jest.fn().mockResolvedValue(mockProject);
        Project.findOneAndUpdate = jest.fn().mockResolvedValue(mockProject);
        isSafeUri.mockReset();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if dbUri is unsafe", async () => {
        isSafeUri.mockResolvedValue({ isSafe: false, reason: "Restricted IP" });
        await updateExternalConfig(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: expect.stringContaining("restricted host")
        }));
    });

    it("should verify connection locally and remotely", async () => {
        isSafeUri.mockResolvedValue({ isSafe: true, resolvedIps: { "somehost": ["10.0.0.1"] } });
        
        const mockConn = { asPromise: jest.fn().mockResolvedValue(true), close: jest.fn().mockResolvedValue(true) };
        mongoose.createConnection.mockReturnValue(mockConn);
        axios.post.mockResolvedValue({ data: { success: true } });
        
        await updateExternalConfig(req, res);
        
        expect(mongoose.createConnection).toHaveBeenCalledWith("mongodb://somehost", expect.objectContaining({
            lookup: expect.any(Function)
        }));
        expect(axios.post).toHaveBeenCalledWith(
            "http://localhost:3000/api/internal/test-db",
            { dbUri: "mongodb://somehost" },
            expect.any(Object)
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 502 if public api times out (axios network error)", async () => {
        isSafeUri.mockResolvedValue({ isSafe: true, resolvedIps: { "somehost": ["10.0.0.1"] } });
        
        const mockConn = { asPromise: jest.fn().mockResolvedValue(true), close: jest.fn().mockResolvedValue(true) };
        mongoose.createConnection.mockReturnValue(mockConn);
        
        const axiosErr = new Error("Network Error");
        axiosErr.isAxiosError = true;
        axiosErr.response = undefined; // No response
        axios.post.mockRejectedValue(axiosErr);
        
        await updateExternalConfig(req, res);
        
        expect(res.status).toHaveBeenCalledWith(502);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining("Public API verification could not be completed")
        }));
    });
});
