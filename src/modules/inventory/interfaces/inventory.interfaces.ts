export interface ProductCategoryResponse {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductCategoryForm {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  active?: boolean;
}

export type CreateCategoryPayload = Omit<ProductCategoryForm, 'id' | 'active'>;
export type UpdateCategoryPayload = Omit<ProductCategoryForm, 'id' | 'active'>;

export interface GetCategoriesParams {
  page?: number;
  per_page?: number;
  filter_name?: string | null;
  active?: boolean | null;
}

export interface ProductResponse {
  id: string;
  name: string;
  description?: string;
  sku: string;
  rental_price: number;
  replacement_cost?: number;
  total_stock: number;
  min_stock_alert: number;
  color?: string;
  dimensions?: string;
  weight_lbs?: number;
  image_url?: string;
  notes?: string;
  active: boolean;
  category_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductForm {
  id?: string;
  name: string;
  description?: string;
  sku: string;
  rental_price: number;
  replacement_cost?: number;
  total_stock: number;
  min_stock_alert: number;
  color?: string;
  dimensions?: string;
  weight_lbs?: number;
  image_url?: string;
  notes?: string;
  active?: boolean;
  category_id: string;
}

export type CreateProductPayload = Omit<ProductForm, 'id' | 'active'>;
export type UpdateProductPayload = Omit<ProductForm, 'id' | 'active'>;

export interface ProductMaintenanceResponse {
  id: string;
  description: string;
  cost?: number;
  quantity: number;
  date_start: string;
  date_end?: string;
  resolved: boolean;
  id_product: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductMaintenanceForm {
  id?: string;
  description: string;
  cost?: number;
  quantity: number;
  date_start: string;
  date_end?: string;
  resolved?: boolean;
  id_product: string;
}

export type CreateMaintenancePayload = Omit<
  ProductMaintenanceForm,
  'id' | 'resolved' | 'date_end'
> & { date_end?: string };
export type UpdateMaintenancePayload = Omit<
  ProductMaintenanceForm,
  'id' | 'resolved' | 'date_end'
> & { cost?: number };
export type ResolveMaintenancePayload = { date_end: string; cost?: number };
