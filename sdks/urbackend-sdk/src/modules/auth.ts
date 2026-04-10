import { UrBackendClient } from '../client';
import {
  AuthUser,
  AuthResponse,
  SignUpPayload,
  LoginPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  VerifyEmailPayload,
  ResendOtpPayload,
  RequestPasswordResetPayload,
  ResetPasswordPayload,
  SocialExchangePayload,
  SocialExchangeResponse,
  ApiResponse,
} from '../types';
import { AuthError } from '../errors';

export class AuthModule {
  private sessionToken?: string;

  constructor(private client: UrBackendClient) {}

  /**
   * Create a new user account
   */
  public async signUp(payload: SignUpPayload): Promise<AuthUser> {
    return this.client.request<AuthUser>('POST', '/api/userAuth/signup', { body: payload });
  }

  /**
   * Log in an existing user and store the session token
   */
  public async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await this.client.request<AuthResponse>('POST', '/api/userAuth/login', {
      body: payload,
    });

    this.sessionToken = response.accessToken || response.token;

    if (!response.accessToken && response.token) {
      console.warn(
        'urbackend-sdk: The server returned "token" which is deprecated. Please update your backend to return "accessToken".',
      );
    }

    return response;
  }

  /**
   * Get the current authenticated user's profile
   */
  public async me(token?: string): Promise<AuthUser> {
    const activeToken = token || this.sessionToken;

    if (!activeToken) {
      throw new AuthError(
        'Authentication token is required for /me endpoint',
        401,
        '/api/userAuth/me',
      );
    }

    return this.client.request<AuthUser>('GET', '/api/userAuth/me', { token: activeToken });
  }

  /**
   * Update the current authenticated user's profile
   */
  public async updateProfile(payload: UpdateProfilePayload, token?: string): Promise<{ message: string }> {
    const activeToken = token || this.sessionToken;
    if (!activeToken) {
      throw new AuthError('Authentication token is required to update profile', 401, '/api/userAuth/update-profile');
    }
    return this.client.request<{ message: string }>('PUT', '/api/userAuth/update-profile', {
      body: payload,
      token: activeToken,
    });
  }

  /**
   * Change the current authenticated user's password
   */
  public async changePassword(payload: ChangePasswordPayload, token?: string): Promise<{ message: string }> {
    const activeToken = token || this.sessionToken;
    if (!activeToken) {
      throw new AuthError('Authentication token is required to change password', 401, '/api/userAuth/change-password');
    }
    return this.client.request<{ message: string }>('PUT', '/api/userAuth/change-password', {
      body: payload,
      token: activeToken,
    });
  }

  /**
   * Verify user email with OTP
   */
  public async verifyEmail(payload: VerifyEmailPayload): Promise<{ message: string }> {
    return this.client.request<{ message: string }>('POST', '/api/userAuth/verify-email', {
      body: payload,
    });
  }

  /**
   * Resend verification OTP
   */
  public async resendVerificationOtp(payload: ResendOtpPayload): Promise<{ message: string }> {
    return this.client.request<{ message: string }>('POST', '/api/userAuth/resend-verification-otp', {
      body: payload,
    });
  }

  /**
   * Request password reset OTP
   */
  public async requestPasswordReset(payload: RequestPasswordResetPayload): Promise<{ message: string }> {
    return this.client.request<{ message: string }>('POST', '/api/userAuth/request-password-reset', {
      body: payload,
    });
  }

  /**
   * Reset user password with OTP
   */
  public async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    return this.client.request<{ message: string }>('POST', '/api/userAuth/reset-password', {
      body: payload,
    });
  }

  /**
   * Get public-safe profile by username
   */
  public async publicProfile(username: string): Promise<AuthUser> {
    return this.client.request<AuthUser>('GET', `/api/userAuth/public/${username}`);
  }

  /**
   * Refresh the access token
   * @param refreshToken Optional refresh token for header mode. If omitted, uses cookie mode.
   */
  public async refreshToken(refreshToken?: string): Promise<AuthResponse> {
    const options: any = {};
    if (refreshToken) {
      options.headers = { 'x-refresh-token': refreshToken, 'x-refresh-token-mode': 'header' };
    } else {
      options.credentials = 'include';
    }

    const response = await this.client.request<AuthResponse>('POST', '/api/userAuth/refresh-token', options);
    this.sessionToken = response.accessToken || response.token;
    return response;
  }

  /**
   * Returns the start URL for social authentication.
   * Redirect the user's browser to this URL to begin the flow.
   */
  public socialStart(provider: 'github' | 'google'): string {
    return `${this.client['baseUrl']}/api/userAuth/social/${provider}/start?key=${this.client['apiKey']}`;
  }

  /**
   * Exchange social auth rtCode for a refresh token
   */
  public async socialExchange(payload: SocialExchangePayload): Promise<ApiResponse<SocialExchangeResponse>> {
    const response = await this.client.request<ApiResponse<SocialExchangeResponse>>('POST', '/api/userAuth/social/exchange', {
      body: payload,
    });
    return response;
  }

  /**
   * Revoke the current session and clear local state
   */
  public async logout(token?: string): Promise<{ success: boolean; message: string }> {
    const activeToken = token || this.sessionToken;
    let result = { success: true, message: 'Logged out locally' };

    if (activeToken) {
      try {
        result = await this.client.request<{ success: boolean; message: string }>(
          'POST',
          '/api/userAuth/logout',
          { token: activeToken, credentials: 'include' },
        );
      } catch (e) {
        // Silently fail if server logout fails, we still want to clear local state
        console.warn('urbackend-sdk: Server logout failed', e);
      }
    }

    this.sessionToken = undefined;
    return result;
  }

  /**
   * Manually set the session token (e.g. after social auth exchange)
   */
  public setToken(token: string): void {
    this.sessionToken = token;
  }

  /**
   * Get the current stored session token
   */
  public getToken(): string | undefined {
    return this.sessionToken;
  }
}
