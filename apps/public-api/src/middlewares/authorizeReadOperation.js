module.exports = async (req, res, next) => {
    try {
        if (req.keyRole === 'secret') {
            req.rlsFilter = {};
            return next();
        }

        const { collectionName } = req.params;
        const project = req.project;
        const collectionConfig = project.collections.find(c => c.name === collectionName);

        if (!collectionConfig) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        const rls = collectionConfig.rls || {};
        if (!rls.enabled) {
            req.rlsFilter = {};
            return next();
        }

        const modeRaw = rls.mode || 'public-read';
        const mode = modeRaw === 'owner-write-only' ? 'public-read' : modeRaw;

        if (mode === 'private') {
            if (!req.authUser?.userId) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'Provide a valid user Bearer token for private reads.'
                });
            }

            const ownerField = rls.ownerField || 'userId';
            req.rlsFilter = { [ownerField]: req.authUser.userId };
            return next();
        }

        if (mode === 'public-read') {
            req.rlsFilter = {};
            return next();
        }

        return res.status(403).json({ error: 'Unsupported RLS mode' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
