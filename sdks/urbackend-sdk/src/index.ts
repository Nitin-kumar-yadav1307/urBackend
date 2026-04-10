import { UrBackendClient } from './client';
import { UrBackendConfig } from './types';
import { AuthModule } from './modules/auth';
import { DatabaseModule } from './modules/database';
import { StorageModule } from './modules/storage';
import { SchemaModule } from './modules/schema';
import { MailModule } from './modules/mail';

export * from './types';
export * from './errors';
export { UrBackendClient, AuthModule, DatabaseModule, StorageModule, SchemaModule, MailModule };

/**
 * Factory function to create a new urBackend client
 */
export default function urBackend(config: UrBackendConfig): UrBackendClient {
  return new UrBackendClient(config);
}
