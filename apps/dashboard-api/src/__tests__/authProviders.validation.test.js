'use strict';

const {
    updateAuthProvidersSchema,
} = require('../../../../packages/common/src/utils/input.validation');

describe('updateAuthProvidersSchema', () => {
    test('allows clientSecret to be omitted for PATCH updates', () => {
        const parsed = updateAuthProvidersSchema.parse({
            github: {
                enabled: true,
                clientId: 'github_client_id',
            },
        });

        expect(parsed.github.clientSecret).toBeUndefined();
        expect(parsed.github.clientId).toBe('github_client_id');
    });

    test('rejects an explicitly empty clientSecret', () => {
        expect(() => updateAuthProvidersSchema.parse({
            github: {
                clientId: 'github_client_id',
                clientSecret: '',
            },
        })).toThrow('clientSecret cannot be empty when provided.');
    });
});
