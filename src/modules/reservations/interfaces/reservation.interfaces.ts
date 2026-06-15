import { CustomerResponse } from '../../customers/interfaces/customer.interfaces';
import { ProductResponse } from '../../inventory/interfaces/inventory.interfaces';

export interface ReservationItem {
  id?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
  id_product: string;
  mnt_product?: ProductResponse;
}

export interface ReservationResponse {
  id: string;
  reservation_number: string;
  event_start: string;
  event_end: string;
  delivery_datetime?: string;
  pickup_datetime?: string;
  transit_time_minutes: number;
  delivery_address?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_zip?: string;
  delivery_notes?: string;
  delivery_contact_name?: string;
  delivery_contact_phone?: string;
  event_type?: string;
  venue_name?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  discount_reason?: string;
  delivery_fee: number;
  total: number;
  deposit_amount: number;
  balance_due: number;
  notes?: string;
  internal_notes?: string;
  status: string;
  id_customer: string;
  id_currency: string;
  created_at?: string;
  updated_at?: string;
  confirmed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  mnt_customer?: CustomerResponse;
  mnt_reservation_item?: ReservationItem[];
}

export interface ReservationForm {
  id?: string;
  event_start: string;
  event_end: string;
  delivery_datetime?: string;
  pickup_datetime?: string;
  transit_time_minutes: number;
  delivery_address?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_zip?: string;
  delivery_notes?: string;
  delivery_contact_name?: string;
  delivery_contact_phone?: string;
  event_type?: string;
  venue_name?: string;
  discount_amount: number;
  discount_reason?: string;
  delivery_fee: number;
  deposit_amount: number;
  notes?: string;
  internal_notes?: string;
  id_customer: string;
  items: {
    quantity: number;
    id_product: string;
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
