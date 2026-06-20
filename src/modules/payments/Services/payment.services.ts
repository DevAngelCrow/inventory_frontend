import { httpClient } from '@/core/utils/httpClient';
import { ApiResponseGeneric } from '@/core/services/interfaces/apiResponseGeneric.interface';
import { ApiPostResponse } from '@/core/services/apiPostResponse.interface';
import { PaymentResponse, PaymentForm } from '../interfaces/payment.interfaces';

const registerPayment = async (data: PaymentForm) => {
  const response = await httpClient.post<ApiPostResponse>(
    'payments',
    data
  );
  return response;
};

const getPayments = async (params?: any) => {
  const response = await httpClient.get<ApiResponseGeneric<PaymentResponse>>(
    'payments',
    params
  );
  return response.data;
};

const getPaymentsByReservation = async (reservationId: string) => {
  const response = await httpClient.get<any>(
    'payments',
    { filter_reservation: reservationId }
  );
  return response.data;
};

const getPaymentMethods = async () => {
  const response = await httpClient.get<any>(
    'payments/methods'
  );
  return response.data;
};

const voidPayment = async (id: string) => {
  const response = await httpClient.patch<ApiPostResponse>(
    `payments/${id}/void`
  );
  return response;
};

export default {
  registerPayment,
  getPayments,
  getPaymentsByReservation,
  getPaymentMethods,
  voidPayment,
};

