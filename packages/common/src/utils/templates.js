module.exports.PROJECT_TEMPLATES = {
  'sdk-kanban': {
    name: 'Kanban Board',
    description: 'Full-featured Kanban board with drag-and-drop tasks.',
    isAuthEnabled: true,
    collections: [
      {
        name: 'boards',
        rls: 'private',
        model: [
          { key: 'title', type: 'String', required: true }
        ]
      },
      {
        name: 'tasks',
        rls: 'private',
        model: [
          { key: 'boardId', type: 'Ref', required: true },
          { key: 'title', type: 'String', required: true },
          { key: 'status', type: 'String', required: true, default: 'todo' }
        ]
      }
    ]
  },
  'social-demo': {
    name: 'Social Media (X Clone)',
    description: 'A Twitter/X.com clone.',
    isAuthEnabled: true,
    collections: [
      {
        name: 'profiles',
        rls: 'public-read',
        model: [
          { key: 'handle', type: 'String', required: true, unique: true },
          { key: 'bio', type: 'String' },
          { key: 'avatarUrl', type: 'String' }
        ]
      },
      {
        name: 'posts',
        rls: 'public-read',
        model: [
          { key: 'content', type: 'String', required: true },
          { key: 'authorId', type: 'Ref', required: true },
          { key: 'imageUrls', type: 'Array' }
        ]
      },
      {
        name: 'comments',
        rls: 'public-read',
        model: [
          { key: 'postId', type: 'Ref', required: true },
          { key: 'content', type: 'String', required: true },
          { key: 'authorId', type: 'Ref', required: true }
        ]
      },
      {
        name: 'likes',
        rls: 'public-read',
        model: [
          { key: 'postId', type: 'Ref', required: true },
          { key: 'userId', type: 'Ref', required: true }
        ]
      },
      {
        name: 'follows',
        rls: 'public-read',
        model: [
          { key: 'followerId', type: 'Ref', required: true },
          { key: 'followingId', type: 'Ref', required: true }
        ]
      }
    ]
  },
  'react-sdk-demo': {
    name: 'React SDK Demo',
    description: 'A modern React app showcasing auth components.',
    isAuthEnabled: true,
    collections: []
  },
  'python-sdk-demo': {
    name: 'Python SDK Demo',
    description: 'A complete Python CLI demo.',
    isAuthEnabled: true,
    collections: []
  },
  'quickstart-ts': {
    name: 'TypeScript Quickstart',
    description: 'Scaffold a new TypeScript project.',
    isAuthEnabled: true,
    collections: []
  },
  'quickstart-python': {
    name: 'Python Quickstart',
    description: 'Scaffold a new Python project.',
    isAuthEnabled: true,
    collections: []
  }
};
