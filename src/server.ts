import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/orders";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
	next();
});

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
	res.json({
		message: "Marketplace Backend API",
		version: "1.0.0",
		status: "running",
	});
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
	res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
	console.error("Error:", err);
	res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
	console.log(`\n🚀 Server is running on port ${PORT}`);
	console.log(`📍 API Base URL: http://localhost:${PORT}`);
	console.log(`\n🔐 Auth endpoints:`);
	console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
	console.log(`   - POST http://localhost:${PORT}/api/auth/refresh`);
	console.log(`   - POST http://localhost:${PORT}/api/auth/logout`);
	console.log(
		`   - GET  http://localhost:${PORT}/api/auth/profile/:id (requires token)`
	);
	console.log(`\n📦 Product endpoints (all require token):`);
	console.log(`   - GET  http://localhost:${PORT}/api/products`);
	console.log(`   - GET  http://localhost:${PORT}/api/products/:id`);
	console.log(`\n🛒 Cart endpoints (all require token):`);
	console.log(`   - GET   http://localhost:${PORT}/api/cart`);
	console.log(`   - POST  http://localhost:${PORT}/api/cart`);
	console.log(`   - PATCH http://localhost:${PORT}/api/cart`);
	console.log(`\n📦 Order endpoints (all require token):`);
	console.log(`   - POST http://localhost:${PORT}/api/order`);
	console.log(`   - GET  http://localhost:${PORT}/api/order`);
	console.log("\n");
});

export default app;
