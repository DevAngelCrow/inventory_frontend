export interface ProductCategoryResponse {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MeasurementUnitResponse {
  id: string;
  name: string;
  abbreviation: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  status?: {
    id?: string;
    name: string;
    code: string;
    description: string;
    active: boolean;
    state_color: string;
    text_color: string;
    id_category_status: string;
  };
}

export interface MeasurementUnitForm {
  id?: string;
  name: string;
  abbreviation: string;
  active?: boolean;
}

export type CreateMeasurementUnitPayload = Omit<
  MeasurementUnitForm,
  'id' | 'active'
>;
export type UpdateMeasurementUnitPayload = Omit<
  MeasurementUnitForm,
  'id' | 'active'
>;

export interface GetMeasurementUnitsParams {
  page?: number;
  per_page?: number;
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
  dimensions?: {
    width: number;
    height: number;
    depth?: number | null;
    unitId: string;
  };
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
  dimensions?: {
    width: number;
    height: number;
    depth?: number | null;
    unitId: string;
  };
  weight_lbs?: number;
  image_url?: string;
  image_file?: any[];
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
