import { UrBackendClient } from '../client';
import { CollectionSchema } from '../types';

export class SchemaModule {
  constructor(private client: UrBackendClient) {}

  /**
   * Fetch the schema definition for a collection
   */
  public async getSchema(collection: string): Promise<CollectionSchema> {
    return this.client.request<CollectionSchema>('GET', `/api/schemas/${collection}`);
  }
}
