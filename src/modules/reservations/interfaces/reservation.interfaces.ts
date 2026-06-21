

export interface ReservationItem {
  id?: string;
  id_product: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  mnt_product?: {
    name: string;
    sku: string;
  };
}

export interface ReservationResponse {
  id: string;
  id_customer: string;
  status: {
    id: string;
    code: string;
    name: string;
    state_color: string;
    text_color: string;
  };
  event_start: string;
  event_end: string;
  total_amount: number;
  delivery_address?: string;
  delivery_address_line2?: string;
  delivery_zip?: string;
  delivery_notes?: string;
  id_customer_address?: string;
  id_geographic_division?: string;
  geographic_division_name?: string;
  deposit_amount?: number;
  balance_due?: number;
  notes?: string;
  items: ReservationItem[];
  created_at?: string;
  updated_at?: string;
  reservation_number?: string;
  delivery_datetime?: string;
  pickup_datetime?: string;
  transit_time_minutes?: number;
  mnt_customer?: {
    first_name: string;
    last_name: string;
    email?: string | null;
    phone?: string | null;
  };
}

export interface ReservationForm {
  id?: string;
  id_customer: string;
  event_start: string;
  event_end: string;
  delivery_address?: string;
  delivery_address_line2?: string;
  delivery_zip?: string;
  delivery_notes?: string;
  id_customer_address?: string;
  id_geographic_division?: string;
  delivery_datetime?: string;
  pickup_datetime?: string;
  transit_time_minutes?: number;
  event_type?: string;
  venue_name?: string;
  discount_amount?: number;
  discount_reason?: string;
  delivery_fee?: number;
  deposit_amount?: number;
  notes?: string;
  internal_notes?: string;
  items: {
    id_product: string;
    quantity: number;
    unit_price?: number;
    total_price?: number;
    notes?: string;
  }[];
}

export interface DamageItem {
  id_product: string;
  damage_type: string;
  description: string;
  quantity_affected: number;
  charge_amount: number;
}

export interface InspectionForm {
  inspection_date: string;
  general_notes?: string;
  overall_condition: string;
  damageItems: DamageItem[];
}
