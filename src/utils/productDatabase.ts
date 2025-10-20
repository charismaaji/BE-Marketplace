import fs from "fs";
import path from "path";
import { Product, ProductListQuery } from "../types/product";

let products: Product[] = [];

export const loadProducts = (): void => {
	try {
		const productsPath = path.join(__dirname, "../../database/products.json");
		const productsData = fs.readFileSync(productsPath, "utf-8");
		products = JSON.parse(productsData);
		console.log(`Loaded ${products.length} products from database`);
	} catch (error) {
		console.error("Error loading products:", error);
		products = [];
	}
};

export const getAllProducts = (
	query: ProductListQuery
): {
	products: Product[];
	total: number;
} => {
	let filteredProducts = [...products];

	// Filter by category
	if (query.category) {
		filteredProducts = filteredProducts.filter(
			(p) => p.category.toLowerCase() === query.category?.toLowerCase()
		);
	}

	// Filter by search term (title or description)
	if (query.search) {
		const searchTerm = query.search.toLowerCase();
		filteredProducts = filteredProducts.filter(
			(p) =>
				p.title.toLowerCase().includes(searchTerm) ||
				p.description.toLowerCase().includes(searchTerm)
		);
	}

	const total = filteredProducts.length;

	// Pagination
	const page = query.page || 1;
	const limit = query.limit || 20;
	const startIndex = (page - 1) * limit;
	const endIndex = startIndex + limit;

	const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

	return {
		products: paginatedProducts,
		total,
	};
};

export const findProductById = (id: number): Product | undefined => {
	return products.find((product) => product.id === id);
};

// Initialize products on module load
loadProducts();
