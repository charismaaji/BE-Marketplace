export interface OrderProduct {
	id: number;
	title: string;
	price: number;
	quantity: number;
	total: number;
	discountPercentage: number;
	discountedTotal: number;
	thumbnail: string;
}

export interface PaymentMethod {
	paymentType: "card" | "virtual account";
	provider: string; // "bca", "mastercard", "mandiri", etc.
}

export interface Order {
	id: number;
	userId: number;
	products: OrderProduct[];
	total: number;
	discountedTotal: number;
	totalProducts: number;
	totalQuantity: number;
	status: "paid" | "not paid";
	paymentMethod: PaymentMethod;
	createdAt: string;
	updatedAt: string;
}

export interface CreateOrderRequest {
	products: {
		productId: number;
		quantity: number;
	}[];
	paymentMethod: PaymentMethod;
	status?: "paid" | "not paid";
}

export interface OrderListQuery {
	page?: number;
	limit?: number;
	status?: "paid" | "not paid";
}

export interface OrderResponse {
	success: boolean;
	data: Order;
}

export interface OrderListResponse {
	success: boolean;
	data: Order[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}
