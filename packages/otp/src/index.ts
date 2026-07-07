import { Client } from '@your-org/core';

export interface SendOTPOptions {
  type: 'email' | 'sms';
  to: string;
}

export interface VerifyOTPOptions {
  to: string;
  code: string;
}

export class OTP {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async send(options: SendOTPOptions): Promise<void> {
    await this.client.request('/otp/send', {
      method: 'POST',
      body: JSON.stringify(options)
    });
  }

  async verify(options: VerifyOTPOptions): Promise<boolean> {
    const response = await this.client.request<{ isValid: boolean }>('/otp/verify', {
      method: 'POST',
      body: JSON.stringify(options)
    });
    return response.isValid;
  }

  on(event: 'verified' | 'failed' | 'expired', callback: (data: any) => void): () => void {
    return this.client.on(`otp:${event}`, callback);
  }
}
