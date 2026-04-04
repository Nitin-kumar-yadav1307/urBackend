'use strict';

const mockFind = jest.fn();
const mockFindOne = jest.fn();

const mockQueryEngine = jest.fn((query) => ({
    filter: () => ({
        sort: () => ({
            paginate: () => ({ query }),
        }),
    }),
}));

jest.mock('@urbackend/common', () => ({
    sanitize: (v) => v,
    Project: {},
    getConnection: jest.fn().mockResolvedValue({}),
    getCompiledModel: jest.fn(() => ({
        find: (...args) => {
            mockFind(...args);
            return { lean: jest.fn().mockResolvedValue([]) };
        },
        findOne: (...args) => {
            mockFindOne(...args);
            return { lean: jest.fn().mockResolvedValue({ _id: 'doc_1' }) };
        },
    })),
    QueryEngine: mockQueryEngine,
    validateData: jest.fn(),
    validateUpdateData: jest.fn(),
}));

const { getAllData, getSingleDoc } = require('../controllers/data.controller');

function makeReq(overrides = {}) {
    return {
        params: { collectionName: 'posts', id: '507f1f77bcf86cd799439011' },
        project: {
            _id: 'proj_1',
            resources: { db: { isExternal: false } },
            collections: [{ name: 'posts', model: [] }],
        },
        query: {},
        rlsFilter: {},
        ...overrides,
    };
}

function makeRes() {
    const res = {
        statusCode: null,
        body: null,
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
    res.status.mockImplementation((code) => {
        res.statusCode = code;
        return res;
    });
    res.json.mockImplementation((data) => {
        res.body = data;
        return res;
    });
    return res;
}

describe('data.controller read RLS filters', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAllData applies rlsFilter to find()', async () => {
        const req = makeReq({ rlsFilter: { userId: 'user_1' } });
        const res = makeRes();

        await getAllData(req, res);

        expect(mockFind).toHaveBeenCalledWith({ userId: 'user_1' });
        expect(res.json).toHaveBeenCalled();
    });

    test('getSingleDoc applies rlsFilter to findOne()', async () => {
        const req = makeReq({ rlsFilter: { userId: 'user_1' } });
        const res = makeRes();

        await getSingleDoc(req, res);

        expect(mockFindOne).toHaveBeenCalledWith({
            _id: '507f1f77bcf86cd799439011',
            userId: 'user_1',
        });
        expect(res.json).toHaveBeenCalled();
    });
});
