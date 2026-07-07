import { Client } from '@your-org/core';

export interface SendMailOptions {
  to: string;
  subject: string;
  template?: string;
  data?: any;
}

export class Mail {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async send(options: SendMailOptions): Promise<void> {
    await this.client.request('/mail/send', {
      method: 'POST',
      body: JSON.stringify(options)
    });
  }

  on(event: 'sent' | 'failed' | 'bounced', callback: (data: any) => void): () => void {
    return this.client.on(`mail:${event}`, callback);
  }
}
