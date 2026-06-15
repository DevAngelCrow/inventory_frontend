import { httpClient } from '@/core/utils/httpClient';
import { ApiResponseGeneric } from '@/core/services/interfaces/apiResponseGeneric.interface';
import { ApiPostResponse } from '@/core/services/apiPostResponse.interface';
import { PaymentResponse, PaymentMethodResponse, PaymentForm } from '../interfaces/payment.interfaces';

const registerPayment = async (data: PaymentForm) => {
  const response = await httpClient.post<ApiPostResponse>(
    'payments',
    data
  );
  return response;
};

const getPaymentsByReservation = async (reservationId: string): Promise<{ data: PaymentResponse[] }> => {
  const response = await httpClient.get<{ data: PaymentResponse[] }>(
    `payments/reservation/${reservationId}`
  );
  return response.data;
};

const getPaymentMethods = async (): Promise<ApiResponseGeneric<PaymentMethodResponse>> => {
  const response = await httpClient.get<ApiResponseGeneric<PaymentMethodResponse>>(
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
  getPaymentsByReservation,
  getPaymentMethods,
  voidPayment,
};
