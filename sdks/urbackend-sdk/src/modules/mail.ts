import { UrBackendClient } from '../client';
import { SendMailPayload, SendMailResponse } from '../types';

export class MailModule {
  constructor(private client: UrBackendClient) {}

  /**
   * Send an email using the urBackend mail service.
   * Note: This requires a Secret Key (sk_live_...) and should be called from a server environment.
   */
  public async send(payload: SendMailPayload): Promise<SendMailResponse> {
    return this.client.request<SendMailResponse>('POST', '/api/mail/send', {
      body: payload,
    });
  }
}
