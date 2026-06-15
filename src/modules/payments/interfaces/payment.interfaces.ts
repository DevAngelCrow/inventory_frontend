export interface PaymentMethodResponse {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

export interface PaymentResponse {
  id: string;
  payment_number: string;
  amount: number;
  payment_date: string;
  reference_number?: string;
  notes?: string;
  status: string;
  id_reservation: string;
  id_payment_method: string;
  ctl_payment_method?: PaymentMethodResponse;
}

export interface PaymentForm {
  amount: number;
  id_reservation: string;
  id_payment_method: string;
  reference_number?: string;
  notes?: string;
}
