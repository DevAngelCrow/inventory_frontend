export interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  delivery_fee: number;
  damage_charges: number;
  total: number;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'VOIDED';
  notes: string | null;
  id_reservation: string;
  id_customer: string;
  id_currency: string;
  created_at: string;
  updated_at: string;
  mnt_customer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface GenerateInvoicePayload {
  id_reservation: string;
  notes?: string;
}
