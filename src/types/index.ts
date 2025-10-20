import { Request } from 'express';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  maidenName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  birthDate: string;
  image: string;
  bloodGroup: string;
  height: number;
  weight: number;
  eyeColor: string;
  hair: {
    color: string;
    type: string;
  };
  ip: string;
  address: {
    address: string;
    city: string;
    state: string;
    stateCode: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    country: string;
  };
  macAddress: string;
  university: string;
  bank: {
    cardExpire: string;
    cardNumber: string;
    cardType: string;
    currency: string;
    iban: string;
  };
  company: {
    department: string;
    name: string;
    title: string;
    address: {
      address: string;
      city: string;
      state: string;
      stateCode: string;
      postalCode: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      country: string;
    };
  };
  ein: string;
  ssn: string;
  userAgent: string;
  crypto: {
    coin: string;
    wallet: string;
    network: string;
  };
  role: string;
}

export interface TokenPayload {
  userId: number;
  username: string;
  email: string;
}

export interface RefreshTokenPayload extends TokenPayload {
  ipAddress: string;
  deviceId: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export interface LoginRequest {
  username: string;
  password: string;
  ipAddress: string;
  deviceId: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  ipAddress: string;
  deviceId: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// In-memory storage for refresh tokens (in production, use a database)
export interface StoredRefreshToken {
  token: string;
  userId: number;
  ipAddress: string;
  deviceId: string;
  expiresAt: Date;
}
