const { storageRegistry } = require("./registry");
const { createClient } = require("@supabase/supabase-js");
const { decrypt } = require("./encryption");

const defaultSupabase = createClient(
    process.env.SUPABASE_URL || "https://dummy.supabase.co",
    process.env.SUPABASE_KEY || "dummy-key"
);

async function getStorage(project) {
    if (!project?._id) {
        throw new Error("Project document is required");
    }

    const key = project._id.toString();

    // Reuse cached client
    if (storageRegistry.has(key)) {
        const entry = storageRegistry.get(key);
        entry.lastUsed = Date.now();
        return entry.client;
    }

    let client;

    // Internal storage
    if (!project.resources?.storage?.isExternal) {
        client = defaultSupabase;
    }
    // External BYOD storage
    else {
        try {
            const decrypted = decrypt(project.resources.storage.config);
            const config = JSON.parse(decrypted);

            if (!config.storageUrl || !config.storageKey) {
                throw new Error("Incomplete storage config");
            }

            client = createClient(
                config.storageUrl,
                config.storageKey
            );
        } catch (err) {
            console.error("Storage config error:", err);
            throw new Error("Invalid storage configuration");
        }
    }

    // Register client for pooling + GC
    storageRegistry.set(key, {
        client,
        lastUsed: Date.now(),
        isExternal: !!project.resources?.storage?.isExternal
    });

    return client;
}

module.exports = { getStorage };
