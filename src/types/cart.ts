export interface CartProduct {
	id: number;
	title: string;
	price: number;
	quantity: number;
	total: number;
	discountPercentage: number;
	discountedTotal: number;
	thumbnail: string;
}

export interface Cart {
	id: number;
	products: CartProduct[];
	total: number;
	discountedTotal: number;
	userId: number;
	totalProducts: number;
	totalQuantity: number;
}

export interface AddToCartRequest {
	productId: number;
	quantity: number;
}

export interface UpdateCartRequest {
	productId: number;
	quantity: number; // positive to add, negative to reduce, 0 to remove
}

export interface CartResponse {
	success: boolean;
	data: Cart;
}
