export interface AuthInfo {
  scopes: string[];
  tokenType: string;
}

export interface DeveloperProfile {
  id: string;
  email: string;
  plan: string;
  isVerified?: boolean;
  githubUsername?: string | null;
  avatarUrl?: string | null;
}

export interface CLIProfile {
  developer: DeveloperProfile;
  auth: AuthInfo;
}