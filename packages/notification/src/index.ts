import { Client } from '@your-org/core';

export interface SendNotificationOptions {
  channels: string[];
  user: string;
  template: string;
}

export class Notification {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async send(options: SendNotificationOptions): Promise<void> {
    await this.client.request('/notification/send', {
      method: 'POST',
      body: JSON.stringify(options)
    });
  }

  on(event: 'sent' | 'failed', callback: (data: any) => void): () => void {
    return this.client.on(`notification:${event}`, callback);
  }
}
