export function isValidPAT(token: string): boolean {
  return token.startsWith("ubpat_");
}