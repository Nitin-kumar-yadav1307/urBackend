/**
 * Shared Project Helpers
 */

/**
 * Check if the project is configured to use external storage (Supabase BYOD)
 * @param {Object} project - The project object (lean or document)
 * @returns {Boolean}
 */
const isProjectStorageExternal = (project) => {
    return !!project.resources?.storage?.isExternal;
};

/**
 * Check if the project is configured to use an external database
 * @param {Object} project - The project object
 * @returns {Boolean}
 */
const isProjectDbExternal = (project) => {
    return !!project.resources?.db?.isExternal;
};


/**
 * Get the bucket name for the project
 * @param {Object} project - The project object
 * @returns {String}
 */
const getBucket = (project) =>
    project.resources?.storage?.isExternal ? "files" : "dev-files";


module.exports = {
    isProjectStorageExternal,
    isProjectDbExternal,
    getBucket
};
