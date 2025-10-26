import jwt from "jsonwebtoken";
import { TokenPayload, RefreshTokenPayload } from "../types";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret";
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "1h";
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d";

export const generateAccessToken = (payload: TokenPayload): string => {
	return jwt.sign(payload, ACCESS_SECRET, {
		expiresIn: ACCESS_EXPIRY as string,
	} as jwt.SignOptions);
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
	return jwt.sign(payload, REFRESH_SECRET, {
		expiresIn: REFRESH_EXPIRY as string,
	} as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload => {
	return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
	return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
};
