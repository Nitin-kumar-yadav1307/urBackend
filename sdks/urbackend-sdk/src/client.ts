import { UrBackendConfig, RequestOptions } from './types';
import { UrBackendError, parseApiError } from './errors';
import { AuthModule } from './modules/auth';
import { DatabaseModule } from './modules/database';
import { StorageModule } from './modules/storage';

export class UrBackendClient {
  private apiKey: string;
  private baseUrl: string;
  private _auth?: AuthModule;
  private _db?: DatabaseModule;
  private _storage?: StorageModule;
  private headers: Record<string, string>;

  constructor(config: UrBackendConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.ub.bitbros.in';
    this.headers = config.headers || {};

    if (typeof window !== 'undefined') {
      console.warn(
        '⚠️ urbackend-sdk: Avoid exposing your SK-API key in client-side code(instead use pk_live key). This can lead to unauthorized access to your account and data.',
      );
    }
  }

  get auth(): AuthModule {
    if (!this._auth) {
      this._auth = new AuthModule(this);
    }
    return this._auth;
  }

  get db(): DatabaseModule {
    if (!this._db) {
      this._db = new DatabaseModule(this);
    }
    return this._db;
  }

  get storage(): StorageModule {
    if (!this._storage) {
      this._storage = new StorageModule(this);
    }
    return this._storage;
  }

  /**
   * Internal request handler
   */
  public async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'x-api-key': this.apiKey,
      'User-Agent': `urbackend-sdk-js/0.1.1`,
      ...this.headers,
    };

    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }

    let requestBody: BodyInit | undefined;

    if (options.isMultipart) {
      // Fetch handles FormData content type and boundary
      requestBody = options.body as FormData;
    } else if (options.body) {
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: requestBody,
      });

      if (!response.ok) {
        throw await parseApiError(response);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        // The API returns { data, success, message }
        return json.data !== undefined ? json.data : json;
      }

      return (await response.text()) as unknown as T;
    } catch (error) {
      if (error instanceof UrBackendError) {
        throw error;
      }
      throw new UrBackendError(
        error instanceof Error ? error.message : 'Network request failed',
        0,
        path,
      );
    }
  }
}
