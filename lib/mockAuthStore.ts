// Simple in-memory store for mock OAuth data
// This works in development since all requests go to the same Node process
// Using globalThis to survive hot module reloads

interface MockAuthData {
  Userid: string;
  name?: string;
  inschool?: string;
  uuid?: string;
  timestamp: number;
}

class MockAuthStore {
  private store: Map<string, MockAuthData>;

  constructor() {
    // Use globalThis to survive hot reloads in development
    if (!(globalThis as any).__mockAuthStore) {
      (globalThis as any).__mockAuthStore = new Map<string, MockAuthData>();
    }
    this.store = (globalThis as any).__mockAuthStore;
  }

  set(code: string, data: MockAuthData) {
    this.store.set(code, { ...data, timestamp: Date.now() });
    this.cleanup();
  }

  get(code: string): MockAuthData | null {
    const data = this.store.get(code);
    if (data) {
      this.store.delete(code); // One-time use
      return data;
    }
    return null;
  }

  private cleanup() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [key, value] of this.store.entries()) {
      if (value.timestamp < fiveMinutesAgo) {
        this.store.delete(key);
      }
    }
  }
}

// Export a singleton instance
export const mockAuthStore = new MockAuthStore();
