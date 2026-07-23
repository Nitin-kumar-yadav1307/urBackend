'use strict';

const mockFindOne = jest.fn();

const mockDeleteProjectById = jest.fn();
const mockSetProjectById = jest.fn();

jest.mock('@urbackend/common', () => ({
    Project: {
        findOne: mockFindOne,
    },
    getProjectAccessQuery: jest.fn((userId) => ({ $or: [{ owner: userId }, { "members.user": userId }] })),
    editCollectionSchema: {
        parse: jest.fn()
    },
    deleteProjectById: mockDeleteProjectById,
    setProjectById: mockSetProjectById
}));

const mockEmitEvent = jest.fn();

jest.mock('../utils/emitEvent', () => ({
    emitEvent: mockEmitEvent
}));

const projectController = require('../controllers/project.controller');
const { editCollectionSchema, Project } = require('@urbackend/common');
const { z } = require('zod');

describe('projectController.updateCollection', () => {
    let req;
    let res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            user: { _id: 'user123' },
            params: { projectId: 'project123', collectionName: 'myCollection' },
            body: {
                schema: [
                    { key: 'title', type: 'String', required: true }
                ]
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        editCollectionSchema.parse.mockReturnValue({
            projectId: req.params.projectId,
            collectionName: req.params.collectionName,
            schema: req.body.schema
        });
    });

    it('should return 400 if validation fails', async () => {
        const zodError = new z.ZodError([{ message: 'Invalid data' }]);
        editCollectionSchema.parse.mockImplementation(() => { throw zodError; });

        await projectController.updateCollection(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(Array) }));
    });

    it('should return 404 if project not found', async () => {
        Project.findOne.mockResolvedValue(null);
        await projectController.updateCollection(req, res);
        
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
    });

    it('should return 404 if collection not found in project', async () => {
        const mockProject = {
            _id: 'project123',
            collections: [
                { name: 'otherCollection', model: [] }
            ],
            save: jest.fn()
        };
        Project.findOne.mockResolvedValue(mockProject);
        
        await projectController.updateCollection(req, res);
        
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Collection not found' });
    });

    it('should return 422 if users validation fails when editing users collection', async () => {
        req.params.collectionName = 'users';
        req.body.schema = [{ key: 'username', type: 'String', required: true }]; // Invalid users schema
        editCollectionSchema.parse.mockReturnValue({
            projectId: req.params.projectId,
            collectionName: req.params.collectionName,
            schema: req.body.schema
        });
        
        const mockProject = {
            _id: 'project123',
            collections: [
                { name: 'users', model: [] }
            ],
            save: jest.fn()
        };
        Project.findOne.mockResolvedValue(mockProject);
        
        await projectController.updateCollection(req, res);
        
        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({ error: "The 'users' collection must have required 'email' and 'password' string fields." });
    });

    it('should successfully update a collection schema', async () => {
        const mockProject = {
            _id: 'project123',
            collections: [
                { 
                    name: 'myCollection', 
                    model: [{ key: 'oldTitle', type: 'String' }]
                }
            ],
            save: jest.fn().mockResolvedValue(true),
            toObject: jest.fn().mockReturnValue({
                _id: 'project123',
                collections: [
                    { name: 'myCollection', model: [{ key: 'title', type: 'String', required: true }] }
                ]
            })
        };
        Project.findOne.mockResolvedValue(mockProject);
        
        await projectController.updateCollection(req, res);
        
        expect(mockProject.collections[0].model).toEqual(req.body.schema);
        expect(mockProject.save).toHaveBeenCalled();
        expect(mockDeleteProjectById).toHaveBeenCalledWith('project123');
        expect(mockSetProjectById).toHaveBeenCalled();
        expect(mockEmitEvent).toHaveBeenCalledWith('user123', 'collection_updated', { collectionName: 'myCollection', isUsersCollection: false }, 'project123');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should successfully update users collection if valid', async () => {
        req.params.collectionName = 'users';
        req.body.schema = [
            { key: 'email', type: 'String', required: true },
            { key: 'password', type: 'String', required: true }
        ];
        editCollectionSchema.parse.mockReturnValue({
            projectId: req.params.projectId,
            collectionName: req.params.collectionName,
            schema: req.body.schema
        });

        const mockProject = {
            _id: 'project123',
            collections: [
                { name: 'users', model: [] }
            ],
            save: jest.fn().mockResolvedValue(true),
            toObject: jest.fn().mockReturnValue({
                _id: 'project123',
                collections: [
                    { name: 'users', model: req.body.schema }
                ]
            })
        };
        Project.findOne.mockResolvedValue(mockProject);
        
        await projectController.updateCollection(req, res);
        
        expect(mockProject.collections[0].model).toEqual(req.body.schema);
        expect(mockProject.save).toHaveBeenCalled();
        expect(mockEmitEvent).toHaveBeenCalledWith('user123', 'collection_updated', { collectionName: 'users', isUsersCollection: true }, 'project123');
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
