import fs from "fs";
import path from "path";
import { Order, OrderProduct, CreateOrderRequest, OrderListQuery } from "../types/order";
import { findProductById } from "./productDatabase";

const ordersPath = path.join(__dirname, "../../database/orders.json");

let orders: Order[] = [];

export const loadOrders = (): void => {
	try {
		const ordersData = fs.readFileSync(ordersPath, "utf-8");
		orders = JSON.parse(ordersData);
		console.log(`Loaded ${orders.length} orders from database`);
	} catch (error) {
		console.error("Error loading orders:", error);
		orders = [];
	}
};

export const saveOrders = (): void => {
	try {
		fs.writeFileSync(ordersPath, JSON.stringify(orders, null, "\t"), "utf-8");
	} catch (error) {
		console.error("Error saving orders:", error);
		throw new Error("Failed to save order data");
	}
};

export const createOrder = (
	userId: number,
	orderRequest: CreateOrderRequest
): Order => {
	const orderProducts: OrderProduct[] = [];
	let total = 0;
	let discountedTotal = 0;
	let totalQuantity = 0;

	// Process each product in the order
	for (const item of orderRequest.products) {
		const product = findProductById(item.productId);
		
		if (!product) {
			throw new Error(`Product with ID ${item.productId} not found`);
		}

		if (item.quantity <= 0) {
			throw new Error(`Quantity must be greater than 0 for product ${item.productId}`);
		}

		// Calculate totals for this product
		const productTotal = product.price * item.quantity;
		const productDiscountedTotal = 
			productTotal - (productTotal * product.discountPercentage) / 100;

		const orderProduct: OrderProduct = {
			id: product.id,
			title: product.title,
			price: product.price,
			quantity: item.quantity,
			total: productTotal,
			discountPercentage: product.discountPercentage,
			discountedTotal: productDiscountedTotal,
			thumbnail: product.thumbnail,
		};

		orderProducts.push(orderProduct);
		total += productTotal;
		discountedTotal += productDiscountedTotal;
		totalQuantity += item.quantity;
	}

	// Create new order
	const newOrder: Order = {
		id: orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 1,
		userId,
		products: orderProducts,
		total,
		discountedTotal,
		totalProducts: orderProducts.length,
		totalQuantity,
		status: orderRequest.status || "not paid",
		paymentMethod: orderRequest.paymentMethod,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	orders.push(newOrder);
	saveOrders();

	return newOrder;
};

export const getUserOrders = (
	userId: number,
	query: OrderListQuery
): {
	orders: Order[];
	total: number;
} => {
	// Filter orders by userId
	let userOrders = orders.filter((order) => order.userId === userId);

	// Filter by status if provided
	if (query.status) {
		userOrders = userOrders.filter((order) => order.status === query.status);
	}

	// Sort by createdAt descending (newest first)
	userOrders.sort((a, b) => 
		new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);

	const total = userOrders.length;

	// Pagination
	const page = query.page || 1;
	const limit = query.limit || 10;
	const startIndex = (page - 1) * limit;
	const endIndex = startIndex + limit;

	const paginatedOrders = userOrders.slice(startIndex, endIndex);

	return {
		orders: paginatedOrders,
		total,
	};
};

export const findOrderById = (orderId: number): Order | undefined => {
	return orders.find((order) => order.id === orderId);
};

// Initialize orders on module load
loadOrders();
