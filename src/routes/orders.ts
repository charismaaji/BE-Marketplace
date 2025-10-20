import { Router, Response } from "express";
import { AuthRequest } from "../types";
import { CreateOrderRequest, OrderListQuery } from "../types/order";
import { createOrder, getUserOrders } from "../utils/orderDatabase";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All order routes require authentication
router.use(authenticateToken);

/**
 * POST /api/orders
 * Create a new order
 * Requires: Authorization header with valid access token
 * Body: { 
 *   products: [{ productId: number, quantity: number }],
 *   paymentMethod: { paymentType: "card" | "virtual account", provider: string }
 * }
 */
router.post("/", (req: AuthRequest, res: Response): void => {
	try {
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const orderRequest: CreateOrderRequest = req.body;

		// Validate request body
		if (!orderRequest.products || !Array.isArray(orderRequest.products)) {
			res.status(400).json({
				error: "Missing or invalid 'products' field",
				expected: "products: [{ productId: number, quantity: number }]",
			});
			return;
		}

		if (orderRequest.products.length === 0) {
			res.status(400).json({
				error: "Order must contain at least one product",
			});
			return;
		}

		// Validate each product in the order
		for (const product of orderRequest.products) {
			if (!product.productId || !product.quantity) {
				res.status(400).json({
					error: "Each product must have productId and quantity",
				});
				return;
			}

			if (
				typeof product.productId !== "number" ||
				typeof product.quantity !== "number"
			) {
				res.status(400).json({
					error: "productId and quantity must be numbers",
				});
				return;
			}

			if (product.quantity <= 0) {
				res.status(400).json({
					error: "Quantity must be greater than 0",
				});
				return;
			}
		}

		// Validate payment method
		if (!orderRequest.paymentMethod) {
			res.status(400).json({
				error: "Missing required field: paymentMethod",
				expected: {
					paymentType: "card or virtual account",
					provider: "string (e.g., bca, mastercard, mandiri)",
				},
			});
			return;
		}

		if (
			!orderRequest.paymentMethod.paymentType ||
			!orderRequest.paymentMethod.provider
		) {
			res.status(400).json({
				error: "paymentMethod must have paymentType and provider",
			});
			return;
		}

		if (
			orderRequest.paymentMethod.paymentType !== "card" &&
			orderRequest.paymentMethod.paymentType !== "virtual account"
		) {
			res.status(400).json({
				error: "paymentType must be either 'card' or 'virtual account'",
			});
			return;
		}

		if (typeof orderRequest.paymentMethod.provider !== "string") {
			res.status(400).json({
				error: "provider must be a string",
			});
			return;
		}

		const userId = req.user.userId;

		// Create order with default "not paid" status
		const order = createOrder(userId, {
			...orderRequest,
			status: "not paid"
		});

		res.status(201).json({
			success: true,
			message: "Order created successfully",
			data: order,
		});
	} catch (error: any) {
		console.error("Create order error:", error);
		if (error.message && error.message.includes("not found")) {
			res.status(404).json({ error: error.message });
		} else {
			res.status(500).json({ error: "Internal server error" });
		}
	}
});

/**
 * GET /api/orders
 * Get list of user's orders
 * Requires: Authorization header with valid access token
 * Query params: page, limit, status
 */
router.get("/", (req: AuthRequest, res: Response): void => {
	try {
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const query: OrderListQuery = {
			page: req.query.page ? parseInt(req.query.page as string) : 1,
			limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
			status: req.query.status as "paid" | "not paid" | undefined,
		};

		// Validate pagination parameters
		if (query.page && query.page < 1) {
			res.status(400).json({ error: "Page must be greater than 0" });
			return;
		}

		if (query.limit && (query.limit < 1 || query.limit > 100)) {
			res.status(400).json({ error: "Limit must be between 1 and 100" });
			return;
		}

		// Validate status if provided
		if (query.status && query.status !== "paid" && query.status !== "not paid") {
			res.status(400).json({
				error: "Status must be either 'paid' or 'not paid'",
			});
			return;
		}

		const userId = req.user.userId;

		// Get user's orders
		const { orders, total } = getUserOrders(userId, query);

		const page = query.page || 1;
		const limit = query.limit || 10;
		const totalPages = Math.ceil(total / limit);

		res.status(200).json({
			success: true,
			data: orders,
			pagination: {
				page,
				limit,
				total,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Get orders error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
