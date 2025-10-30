import fs from "fs";
import path from "path";
import { Cart, CartProduct } from "../types/cart";
import { findProductById } from "./productDatabase";

const cartsPath = path.join(__dirname, "../../database/carts.json");

let carts: Cart[] = [];

export const loadCarts = (): void => {
	try {
		const cartsData = fs.readFileSync(cartsPath, "utf-8");
		carts = JSON.parse(cartsData);
		console.log(`Loaded ${carts.length} carts from database`);
	} catch (error) {
		console.error("Error loading carts:", error);
		carts = [];
	}
};

export const saveCarts = (): void => {
	try {
		fs.writeFileSync(cartsPath, JSON.stringify(carts, null, "\t"), "utf-8");
	} catch (error) {
		console.error("Error saving carts:", error);
		throw new Error("Failed to save cart data");
	}
};

export const findCartByUserId = (userId: number): Cart | undefined => {
	return carts.find((cart) => cart.userId === userId);
};

export const createCart = (userId: number): Cart => {
	const newCart: Cart = {
		id: carts.length > 0 ? Math.max(...carts.map((c) => c.id)) + 1 : 1,
		products: [],
		total: 0,
		discountedTotal: 0,
		userId,
		totalProducts: 0,
		totalQuantity: 0,
	};

	carts.push(newCart);
	saveCarts();
	return newCart;
};

const calculateProductTotal = (
	price: number,
	quantity: number,
	discountPercentage: number
): { total: number; discountedTotal: number } => {
	const total = price * quantity;
	const discountedTotal = total - (total * discountPercentage) / 100;
	return { total, discountedTotal };
};

const recalculateCartTotals = (cart: Cart): void => {
	cart.total = 0;
	cart.discountedTotal = 0;
	cart.totalProducts = cart.products.length;
	cart.totalQuantity = 0;

	cart.products.forEach((product) => {
		cart.total += product.total;
		cart.discountedTotal += product.discountedTotal;
		cart.totalQuantity += product.quantity;
	});
};

export const addProductToCart = (
	userId: number,
	productId: number,
	quantity: number
): Cart => {
	// Find or create cart
	let cart = findCartByUserId(userId);
	if (!cart) {
		cart = createCart(userId);
	}

	// Get product details
	const product = findProductById(productId);
	if (!product) {
		throw new Error("Product not found");
	}

	// Check if product already exists in cart
	const existingProductIndex = cart.products.findIndex((p) => p.id === productId);

	if (existingProductIndex !== -1) {
		// Update quantity of existing product
		const existingProduct = cart.products[existingProductIndex];
		existingProduct.quantity += quantity;

		const { total, discountedTotal } = calculateProductTotal(
			existingProduct.price,
			existingProduct.quantity,
			existingProduct.discountPercentage
		);

		existingProduct.total = total;
		existingProduct.discountedTotal = discountedTotal;
	} else {
		// Add new product to cart
		const { total, discountedTotal } = calculateProductTotal(
			product.price,
			quantity,
			product.discountPercentage
		);

		const cartProduct: CartProduct = {
			id: product.id,
			title: product.title,
			price: product.price,
			quantity,
			total,
			discountPercentage: product.discountPercentage,
			discountedTotal,
			thumbnail: product.thumbnail,
		};

		cart.products.push(cartProduct);
	}

	// Recalculate cart totals
	recalculateCartTotals(cart);
	saveCarts();

	return cart;
};

export const updateCartProductQuantity = (
	userId: number,
	productId: number,
	quantityChange: number
): Cart => {
	const cart = findCartByUserId(userId);
	if (!cart) {
		throw new Error("Cart not found");
	}

	const productIndex = cart.products.findIndex((p) => p.id === productId);
	if (productIndex === -1) {
		throw new Error("Product not found in cart");
	}

	const product = cart.products[productIndex];

	// Update quantity
	if (quantityChange === 0) {
		// Remove product from cart
		cart.products.splice(productIndex, 1);
	} else {
		product.quantity += quantityChange;

		// If quantity becomes 0 or negative, remove the product
		if (product.quantity <= 0) {
			cart.products.splice(productIndex, 1);
		} else {
			// Recalculate product totals
			const { total, discountedTotal } = calculateProductTotal(
				product.price,
				product.quantity,
				product.discountPercentage
			);

			product.total = total;
			product.discountedTotal = discountedTotal;
		}
	}

	// Recalculate cart totals
	recalculateCartTotals(cart);
	saveCarts();

	return cart;
};

export const removeProductFromCart = (
	userId: number,
	productId: number
): Cart => {
	const cart = findCartByUserId(userId);
	if (!cart) {
		throw new Error("Cart not found");
	}

	const productIndex = cart.products.findIndex((p) => p.id === productId);
	if (productIndex === -1) {
		throw new Error("Product not found in cart");
	}

	// Remove product from cart
	cart.products.splice(productIndex, 1);

	// Recalculate cart totals
	recalculateCartTotals(cart);
	saveCarts();

	return cart;
};

export const clearCart = (userId: number): Cart => {
	const cart = findCartByUserId(userId);
	if (!cart) {
		throw new Error("Cart not found");
	}

	// Clear all products
	cart.products = [];
	cart.total = 0;
	cart.discountedTotal = 0;
	cart.totalProducts = 0;
	cart.totalQuantity = 0;

	saveCarts();

	return cart;
};

// Initialize carts on module load
loadCarts();
