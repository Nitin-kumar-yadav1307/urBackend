process.env.INTERNAL_SECRET = "test-secret";
process.env.REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379/0";

jest.mock("marked", () => ({ marked: { parse: jest.fn() } }));
jest.mock("@urbackend/common/src/utils/emailService", () => ({}));

jest.mock("@urbackend/common", () => {
  const original = jest.requireActual("@urbackend/common");
  return {
    ...original,
    getPublicIp: jest.fn().mockResolvedValue("203.0.113.1"),
    isSafeUri: jest.fn()
  };
});

jest.mock("mongoose", () => ({
  createConnection: jest.fn()
}));

const request = require("supertest");
const app = require("../app");
const { isSafeUri } = require("@urbackend/common");
const mongoose = require("mongoose");

describe("Internal Routes /api/internal", () => {
    const validSecret = "test-secret";
    
    afterAll(() => {
        delete process.env.INTERNAL_SECRET;
        jest.restoreAllMocks();
    });

    describe("POST /api/internal/test-db", () => {
        it("should return 403 if missing internal secret", async () => {
            const res = await request(app).post("/api/internal/test-db").send({ dbUri: "mongodb://host" });
            expect(res.status).toBe(403);
            expect(res.body.message).toMatch(/Invalid internal secret/);
        });

        it("should return 403 if invalid internal secret", async () => {
            const res = await request(app).post("/api/internal/test-db")
                .set("x-internal-secret", "wrong-secret")
                .send({ dbUri: "mongodb://host" });
            expect(res.status).toBe(403);
            expect(res.body.message).toMatch(/Invalid internal secret/);
        });

        it("should return 400 if dbUri is missing", async () => {
            const res = await request(app).post("/api/internal/test-db")
                .set("x-internal-secret", validSecret)
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/dbUri is required/);
        });

        it("should return 400 if URI is unsafe", async () => {
            isSafeUri.mockResolvedValueOnce({ isSafe: false, reason: "Restricted IP" });
            
            const res = await request(app).post("/api/internal/test-db")
                .set("x-internal-secret", validSecret)
                .send({ dbUri: "mongodb://127.0.0.1:27017" });
            
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/restricted host/);
        });

        it("should return 400 with server IP if connection fails (simulating timeout)", async () => {
            isSafeUri.mockResolvedValueOnce({ isSafe: true, resolvedIps: { "fake-host": ["93.184.216.34"] } });
            
            const mockConn = {
                asPromise: jest.fn().mockRejectedValue(new Error("Server selection timed out")),
                close: jest.fn().mockResolvedValue(true)
            };
            mongoose.createConnection.mockReturnValueOnce(mockConn);

            const res = await request(app).post("/api/internal/test-db")
                .set("x-internal-secret", validSecret)
                .send({ dbUri: "mongodb://fake-host:27017/test" });
            
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/Access Denied/);
            expect(res.body.message).toMatch(/203\.0\.113\.1/);
            expect(mockConn.close).toHaveBeenCalled();
        });

        it("should return 200 on successful connection verification", async () => {
            isSafeUri.mockResolvedValueOnce({ isSafe: true, resolvedIps: { "fake-host": ["93.184.216.34"] } });
            
            const mockConn = {
                asPromise: jest.fn().mockResolvedValue(true),
                close: jest.fn().mockResolvedValue(true)
            };
            mongoose.createConnection.mockReturnValueOnce(mockConn);

            const res = await request(app).post("/api/internal/test-db")
                .set("x-internal-secret", validSecret)
                .send({ dbUri: "mongodb://fake-host:27017/test" });
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual(expect.any(Object));
            expect(res.body.message).toMatch(/Connection verified/i);
            expect(mockConn.close).toHaveBeenCalled();
        });
    });
});
