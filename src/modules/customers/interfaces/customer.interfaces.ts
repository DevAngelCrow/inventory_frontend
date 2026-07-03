export interface CustomerAddressResponse {
  id: string;
  label: string;
  address_line1: string;
  address_line2?: string;
  zip_code?: string;
  is_primary: boolean;
  active: boolean;
  id_geographic_division?: string;
  geographic_division_name?: string;
  state_name?: string;
}

export interface CustomerResponse {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email?: string;
  phone: string;
  phone_secondary?: string;
  company_name?: string;
  tax_id?: string;
  notes?: string;
  active: boolean;
  id_country: string;
  country_name?: string;
  country_phone_code?: string;
  addresses: CustomerAddressResponse[];
  created_at?: string;
  updated_at?: string;
}

export interface CustomerAddressForm {
  id?: string;
  label: string;
  address_line1: string;
  address_line2?: string;
  zip_code?: string;
  is_primary: boolean;
  id_geographic_division?: string;
  active?: boolean;
}

export interface CustomerForm {
  id?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email?: string;
  phone: string;
  phone_secondary?: string;
  company_name?: string;
  tax_id?: string;
  notes?: string;
  id_country: string;
  addresses: CustomerAddressForm[];
  active?: boolean;
}

export interface CustomerHistoryResponse {
  id: string;
  id_customer: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: string;
  created_at: string;
}
