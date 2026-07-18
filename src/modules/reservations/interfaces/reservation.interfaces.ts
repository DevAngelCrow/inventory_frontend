export interface ReservationItem {
  id?: string;
  id_product: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
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
  delivery_fee?: number;
  discount_amount?: number;
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
    full_address?: string;
  };
  mnt_invoice?: any[];
}

export interface ReservationForm {
  id?: string;
  id_customer: string;
  event_start: string;
  event_end: string;
  total_amount?: number;
  balance_due?: number;
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
  status?: string;
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

export interface InspectionPayload {
  inspection_date: string;
  general_notes?: string;
  overall_condition: string;
  status?: string;
  damageItems: DamageItem[];
}

export interface InspectionForm {
  id_reservation: string;
  inspection_date: string;
  general_notes?: string;
  overall_condition: string;
  status?: string;
}
