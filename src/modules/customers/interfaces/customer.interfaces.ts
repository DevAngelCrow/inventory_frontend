export interface CustomerResponse {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  phone_secondary?: string;
  company_name?: string;
  tax_id?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  active: boolean;
  id_user?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerForm {
  id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  phone_secondary?: string;
  company_name?: string;
  tax_id?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  active?: boolean;
}
