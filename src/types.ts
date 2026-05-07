export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  image_url: string;
  images: string[];
  description: string;
  status: 'draft' | 'published';
  stock_quantity: number;
  created_at: string;
}

export interface ProductVariation {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price_modifier: number;
  stock_quantity: number;
  image_url: string;
  sort_order: number;
}

export interface CartItem {
  product: Product;
  variation?: ProductVariation;
  quantity: number;
}
