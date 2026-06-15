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
  ctl_product_category?: {
    id: string;
    name: string;
  };
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
  mnt_product?: {
    id: string;
    name: string;
    sku: string;
  };
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
