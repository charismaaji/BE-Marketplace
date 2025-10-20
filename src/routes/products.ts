import { Router, Response } from "express";
import { AuthRequest } from "../types";
import { ProductListQuery } from "../types/product";
import { getAllProducts, findProductById } from "../utils/productDatabase";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All product routes require authentication
router.use(authenticateToken);

/**
 * GET /api/products
 * Get list of products with pagination and filtering
 * Requires: Authorization header with valid access token
 * Query params: page, limit, category, search
 */
router.get("/", (req: AuthRequest, res: Response): void => {
	try {
		const query: ProductListQuery = {
			page: req.query.page ? parseInt(req.query.page as string) : 1,
			limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
			category: req.query.category as string,
			search: req.query.search as string,
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

		const { products, total } = getAllProducts(query);

		const page = query.page || 1;
		const limit = query.limit || 10;
		const totalPages = Math.ceil(total / limit);

		res.status(200).json({
			success: true,
			data: products,
			pagination: {
				page,
				limit,
				total,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Get products error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

/**
 * GET /api/products/:id
 * Get product by ID
 * Requires: Authorization header with valid access token
 */
router.get("/:id", (req: AuthRequest, res: Response): void => {
	try {
		const productId = parseInt(req.params.id);

		// Validate product ID
		if (isNaN(productId)) {
			res.status(400).json({ error: "Invalid product ID" });
			return;
		}

		// Find product
		const product = findProductById(productId);

		if (!product) {
			res.status(404).json({ error: "Product not found" });
			return;
		}

		res.status(200).json({
			success: true,
			data: product,
		});
	} catch (error) {
		console.error("Get product error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
