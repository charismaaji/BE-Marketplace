import { Router, Response } from "express";
import { AuthRequest } from "../types";
import { AddToCartRequest, UpdateCartRequest } from "../types/cart";
import {
	findCartByUserId,
	addProductToCart,
	updateCartProductQuantity,
	removeProductFromCart,
	createCart,
} from "../utils/cartDatabase";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All cart routes require authentication
router.use(authenticateToken);

/**
 * GET /api/cart
 * Get user's cart
 * Requires: Authorization header with valid access token
 */
router.get("/", (req: AuthRequest, res: Response): void => {
	try {
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const userId = req.user.userId;

		// Find cart by userId
		let cart = findCartByUserId(userId);

		// If cart doesn't exist, create an empty one
		if (!cart) {
			cart = createCart(userId);
		}

		res.status(200).json({
			success: true,
			data: cart,
		});
	} catch (error) {
		console.error("Get cart error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

/**
 * POST /api/cart
 * Add product to cart
 * Requires: Authorization header with valid access token
 * Body: { productId: number, quantity: number }
 */
router.post("/", (req: AuthRequest, res: Response): void => {
	try {
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const { productId, quantity }: AddToCartRequest = req.body;

		// Validate request body
		if (!productId || !quantity) {
			res.status(400).json({
				error: "Missing required fields",
				required: ["productId", "quantity"],
			});
			return;
		}

		if (typeof productId !== "number" || typeof quantity !== "number") {
			res.status(400).json({
				error: "Invalid data types",
				expected: { productId: "number", quantity: "number" },
			});
			return;
		}

		if (quantity <= 0) {
			res.status(400).json({ error: "Quantity must be greater than 0" });
			return;
		}

		const userId = req.user.userId;

		// Add product to cart
		const cart = addProductToCart(userId, productId, quantity);

		res.status(200).json({
			success: true,
			message: "Product added to cart successfully",
			data: cart,
		});
	} catch (error: any) {
		console.error("Add to cart error:", error);
		if (error.message === "Product not found") {
			res.status(404).json({ error: "Product not found" });
		} else {
			res.status(500).json({ error: "Internal server error" });
		}
	}
});

/**
 * PATCH /api/cart
 * Update product quantity in cart
 * Requires: Authorization header with valid access token
 * Body: { productId: number, quantity: number }
 * - Positive quantity: add to existing quantity
 * - Negative quantity: reduce from existing quantity
 * - Zero quantity: remove product from cart
 */
router.patch("/", (req: AuthRequest, res: Response): void => {
	try {
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const { productId, quantity }: UpdateCartRequest = req.body;

		// Validate request body
		if (productId === undefined || quantity === undefined) {
			res.status(400).json({
				error: "Missing required fields",
				required: ["productId", "quantity"],
			});
			return;
		}

		if (typeof productId !== "number" || typeof quantity !== "number") {
			res.status(400).json({
				error: "Invalid data types",
				expected: { productId: "number", quantity: "number" },
			});
			return;
		}

		const userId = req.user.userId;

		// Update cart
		const cart = updateCartProductQuantity(userId, productId, quantity);

		const message =
			quantity === 0
				? "Product removed from cart"
				: quantity > 0
				? "Product quantity increased"
				: "Product quantity decreased";

		res.status(200).json({
			success: true,
			message,
			data: cart,
		});
	} catch (error: any) {
		console.error("Update cart error:", error);
		if (error.message === "Cart not found") {
			res.status(404).json({ error: "Cart not found" });
		} else if (error.message === "Product not found in cart") {
			res.status(404).json({ error: "Product not found in cart" });
		} else {
			res.status(500).json({ error: "Internal server error" });
		}
	}
});

/**
 * DELETE /api/cart/:productId
 * Remove product from cart
 * Requires: Authorization header with valid access token
 * Params: productId (number)
 */
router.delete("/:productId", (req: AuthRequest, res: Response): void => {
	try {
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const productId = parseInt(req.params.productId);

		// Validate productId
		if (isNaN(productId)) {
			res.status(400).json({ error: "Invalid product ID" });
			return;
		}

		const userId = req.user.userId;

		// Remove product from cart
		const cart = removeProductFromCart(userId, productId);

		res.status(200).json({
			success: true,
			message: "Product removed from cart successfully",
			data: cart,
		});
	} catch (error: any) {
		console.error("Remove from cart error:", error);
		if (error.message === "Cart not found") {
			res.status(404).json({ error: "Cart not found" });
		} else if (error.message === "Product not found in cart") {
			res.status(404).json({ error: "Product not found in cart" });
		} else {
			res.status(500).json({ error: "Internal server error" });
		}
	}
});

export default router;
