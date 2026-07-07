export interface ClientOptions {
  apiKey: string;
  baseURL?: string;
  retries?: number;
}

export class Client {
  private apiKey: string;
  private baseURL: string;
  private retries: number;

  constructor(options: ClientOptions) {
    this.apiKey = options.apiKey;
    this.baseURL = options.baseURL || 'https://api.your-org.com';
    this.retries = options.retries ?? 2;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    let attempt = 0;
    while (attempt <= this.retries) {
      try {
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }
        return await response.json() as T;
      } catch (error) {
        attempt++;
        if (attempt > this.retries) {
          throw error;
        }
        // Basic exponential backoff
        await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 100));
      }
    }
    throw new Error('Request failed');
  }

  // --- WebSocket Logic ---

  private socket: WebSocket | null = null;
  private listeners: Record<string, Function[]> = {};

  connectSocket(wsUrl?: string) {
    if (this.socket) return;
    
    // Automatically convert http:// to ws:// if no custom URL provided
    const url = wsUrl || this.baseURL.replace(/^http/, 'ws');
    
    // Note: native WebSocket in Node requires 'ws' package, but in browser it's native.
    // For a universal SDK, we assume browser environment or global.WebSocket exists.
    if (typeof WebSocket === 'undefined') {
      console.warn('WebSocket is not supported in this environment');
      return;
    }

    this.socket = new WebSocket(`${url}?token=${this.apiKey}`);
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event) {
          this.emitLocal(data.event, data.payload);
        }
      } catch (e) {
        // ignore parse errors
      }
    };
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  on(event: string, callback: Function): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Return an unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  private emitLocal(event: string, payload: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(payload));
    }
  }

  // --- Getters ---

  getApiKey(): string {
    return this.apiKey;
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}
