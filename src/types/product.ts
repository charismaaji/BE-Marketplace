export interface Product {
	id: number;
	title: string;
	description: string;
	category: string;
	price: number;
	discountPercentage: number;
	rating: number;
	stock: number;
	tags: string[];
	brand: string;
	sku: string;
	weight: number;
	dimensions: {
		width: number;
		height: number;
		depth: number;
	};
	warrantyInformation: string;
	shippingInformation: string;
	availabilityStatus: string;
	reviews: Review[];
	returnPolicy: string;
	minimumOrderQuantity: number;
	meta: {
		createdAt: string;
		updatedAt: string;
		barcode: string;
		qrCode: string;
	};
	images: string[];
	thumbnail: string;
}

export interface Review {
	rating: number;
	comment: string;
	date: string;
	reviewerName: string;
	reviewerEmail: string;
}

export interface ProductListQuery {
	page?: number;
	limit?: number;
	category?: string;
	search?: string;
}

export interface ProductListResponse {
	success: boolean;
	data: Product[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}
