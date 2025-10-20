import { Router, Request, Response } from "express";
import { findUserByUsername, findUserById } from "../utils/database";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} from "../utils/jwt";
import { tokenStore } from "../utils/tokenStore";
import { LoginRequest, RefreshTokenRequest, AuthResponse, AuthRequest } from "../types";
import { authenticateToken } from "../middleware/auth";

const router = Router();

/**
 * POST /api/auth/login
 * Login with username and password
 * Requires: username, password, ipAddress, deviceId
 */
router.post("/login", (req: Request, res: Response): void => {
	try {
		const { username, password, ipAddress, deviceId }: LoginRequest = req.body;

		// Validate request body
		if (!username || !password || !ipAddress || !deviceId) {
			res.status(400).json({
				error: "Missing required fields",
				required: ["username", "password", "ipAddress", "deviceId"],
			});
			return;
		}

		// Find user by username
		const user = findUserByUsername(username);

		if (!user) {
			res.status(401).json({ error: "Invalid username or password" });
			return;
		}

		// Verify password (in production, use bcrypt to hash passwords)
		if (user.password !== password) {
			res.status(401).json({ error: "Invalid username or password" });
			return;
		}

		// Generate tokens
		const tokenPayload = {
			userId: user.id,
			username: user.username,
			email: user.email,
		};

		const accessToken = generateAccessToken(tokenPayload);

		const refreshTokenPayload = {
			...tokenPayload,
			ipAddress,
			deviceId,
		};

		const refreshToken = generateRefreshToken(refreshTokenPayload);

		// Store refresh token
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
		tokenStore.addToken(refreshToken, user.id, ipAddress, deviceId, expiresAt);

		// Prepare response
		const response: AuthResponse = {
			accessToken,
			refreshToken,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
			},
		};

		res.status(200).json(response);
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

/**
 * POST /api/auth/refresh
 * Get new access token using refresh token
 * Requires: refreshToken, ipAddress, deviceId
 */
router.post("/refresh", (req: Request, res: Response): void => {
	try {
		const { refreshToken, ipAddress, deviceId }: RefreshTokenRequest = req.body;

		// Validate request body
		if (!refreshToken || !ipAddress || !deviceId) {
			res.status(400).json({
				error: "Missing required fields",
				required: ["refreshToken", "ipAddress", "deviceId"],
			});
			return;
		}

		// Verify refresh token
		let payload;
		try {
			payload = verifyRefreshToken(refreshToken);
		} catch (error) {
			res.status(403).json({ error: "Invalid or expired refresh token" });
			return;
		}

		// Check if token exists in store
		const storedToken = tokenStore.getToken(refreshToken);
		if (!storedToken) {
			res.status(403).json({ error: "Refresh token not found or expired" });
			return;
		}

		// Verify IP address and device ID match
		if (
			storedToken.ipAddress !== ipAddress ||
			storedToken.deviceId !== deviceId
		) {
			// Security: Token might be stolen, invalidate it
			tokenStore.deleteToken(refreshToken);
			res
				.status(403)
				.json({ error: "Security violation: IP address or device ID mismatch" });
			return;
		}

		// Generate new access token
		const tokenPayload = {
			userId: payload.userId,
			username: payload.username,
			email: payload.email,
		};

		const newAccessToken = generateAccessToken(tokenPayload);

		res.status(200).json({
			accessToken: newAccessToken,
		});
	} catch (error) {
		console.error("Refresh token error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

/**
 * POST /api/auth/logout
 * Logout and invalidate refresh token
 * Requires: refreshToken
 */
router.post("/logout", (req: Request, res: Response): void => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			res.status(400).json({ error: "Refresh token required" });
			return;
		}

		// Delete refresh token from store
		const deleted = tokenStore.deleteToken(refreshToken);

		if (deleted) {
			res.status(200).json({ message: "Logged out successfully" });
		} else {
			res
				.status(404)
				.json({ message: "Token not found, but considered logged out" });
		}
	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

/**
 * GET /api/auth/profile/:id
 * Get user profile by ID
 * Requires: Authorization header with valid access token
 * User can only access their own profile
 */
router.get("/profile/:id", authenticateToken, (req: AuthRequest, res: Response): void => {
	try {
		const requestedUserId = parseInt(req.params.id);

		// Validate user ID parameter
		if (isNaN(requestedUserId)) {
			res.status(400).json({ error: "Invalid user ID" });
			return;
		}

		// Check if authenticated user matches requested profile
		if (!req.user || req.user.userId !== requestedUserId) {
			res.status(403).json({ 
				error: "Forbidden: You can only access your own profile" 
			});
			return;
		}

		// Find user by ID
		const user = findUserById(requestedUserId);

		if (!user) {
			res.status(404).json({ error: "User not found" });
			return;
		}

		// Remove password from response
		const { password, ...userWithoutPassword } = user;

		res.status(200).json({
			success: true,
			data: userWithoutPassword,
		});
	} catch (error) {
		console.error("Get profile error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
