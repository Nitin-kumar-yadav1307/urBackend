const PREFIX = "ub";

export const logger = {
  info(message: string) {
    console.log(`${PREFIX}: ${message}`);
  },

  success(message: string) {
    console.log(`✓ ${message}`);
  },

  warn(message: string) {
    console.warn(`⚠ ${message}`);
  },

  error(message: string) {
    console.error(`✖ ${message}`);
  },
};