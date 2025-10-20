import { StoredRefreshToken } from '../types';

// In-memory storage for refresh tokens
// In production, use a database like Redis or PostgreSQL
class TokenStore {
  private tokens: Map<string, StoredRefreshToken> = new Map();

  addToken(token: string, userId: number, ipAddress: string, deviceId: string, expiresAt: Date): void {
    this.tokens.set(token, {
      token,
      userId,
      ipAddress,
      deviceId,
      expiresAt,
    });
  }

  getToken(token: string): StoredRefreshToken | undefined {
    const storedToken = this.tokens.get(token);
    
    // Check if token is expired
    if (storedToken && storedToken.expiresAt < new Date()) {
      this.tokens.delete(token);
      return undefined;
    }
    
    return storedToken;
  }

  deleteToken(token: string): boolean {
    return this.tokens.delete(token);
  }

  deleteAllUserTokens(userId: number): void {
    for (const [token, storedToken] of this.tokens.entries()) {
      if (storedToken.userId === userId) {
        this.tokens.delete(token);
      }
    }
  }

  // Clean up expired tokens periodically
  cleanExpiredTokens(): void {
    const now = new Date();
    for (const [token, storedToken] of this.tokens.entries()) {
      if (storedToken.expiresAt < now) {
        this.tokens.delete(token);
      }
    }
  }
}

export const tokenStore = new TokenStore();

// Clean expired tokens every hour
setInterval(() => {
  tokenStore.cleanExpiredTokens();
}, 60 * 60 * 1000);
