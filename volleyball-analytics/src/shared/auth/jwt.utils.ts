import { sign, verify, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { createLogger } from '../shared/logger';

const logger = createLogger('JWTUtils');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JWTPayload {
  sub: string;
  email: string;
  roles: string[];
  organizationId?: string;
  permissions?: string[];
  sessionId?: string;
  type: 'access' | 'refresh';
}

export function generateAccessToken(payload: Omit<JWTPayload, 'type'>): string {
  return sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function generateRefreshToken(payload: Omit<JWTPayload, 'type'>): string {
  return sign(
    { ...payload, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
}

export function generateTokenPair(payload: Omit<JWTPayload, 'type'>): {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  const expiresIn = parseInt(JWT_EXPIRES_IN) || 900;
  
  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      logger.warn('Token expired', { error: error.message });
    } else if (error instanceof JsonWebTokenError) {
      logger.warn('Invalid token', { error: error.message });
    }
    return null;
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}