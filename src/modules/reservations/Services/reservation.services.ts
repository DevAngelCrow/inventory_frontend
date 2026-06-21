import { httpClient } from '@/core/utils/httpClient';
import { ApiResponseGeneric } from '@/core/services/interfaces/apiResponseGeneric.interface';
import { ApiPostResponse } from '@/core/services/apiPostResponse.interface';
import { ReservationResponse, ReservationForm } from '../interfaces/reservation.interfaces';

const getReservations = async (params?: {
  page?: number;
  per_page?: number;
  status?: string | null;
  id_customer?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}): Promise<ApiResponseGeneric<ReservationResponse>> => {
  const queryParams: any = {
    page: params?.page,
    per_page: params?.per_page,
    filter_status: params?.status,
    filter_customer: params?.id_customer,
    filter_date_start: params?.start_date,
    filter_date_end: params?.end_date,
  };
  const response = await httpClient.get<ApiResponseGeneric<ReservationResponse>>(
    'reservations',
    queryParams
  );
  return response.data;
};

const getReservation = async (id: string): Promise<{ data: ReservationResponse; statusCode: number }> => {
  const response = await httpClient.get<{ data: ReservationResponse; statusCode: number }>(
    `reservations/${id}`
  );
  return response.data;
};

const postReservation = async (data: ReservationForm) => {
  const response = await httpClient.post<ApiPostResponse>(
    'reservations',
    data
  );
  return response;
};

const putReservation = async (id: string, data: ReservationForm) => {
  const response = await httpClient.put<ApiPostResponse>(
    `reservations/${id}`,
    data
  );
  return response;
};

const confirmReservation = async (id: string) => {
  const response = await httpClient.patch<ApiResponseGeneric<any>>(
    `reservations/${id}/status`, { status: 'CONFIRMED' }
  );
  return response;
};

const cancelReservation = async (id: string, reason: string) => {
  const response = await httpClient.patch<ApiResponseGeneric<any>>(
    `reservations/${id}/status`, { status: 'CANCELLED', reason }
  );
  return response;
};

const markInProgress = async (id: string) => {
  const response = await httpClient.patch<ApiResponseGeneric<any>>(
    `reservations/${id}/status`, { status: 'IN_PROGRESS' }
  );
  return response;
};

const markCompleted = async (id: string) => {
  const response = await httpClient.patch<ApiResponseGeneric<any>>(
    `reservations/${id}/status`, { status: 'COMPLETED' }
  );
  return response;
};

const registerInspection = async (id: string, data: any) => {
  // Map payload to backend DTO expectations
  const backendData = {
    ...data,
    id_reservation: id,
    damage_items: data.damageItems,
  };
  delete backendData.damageItems;

  const response = await httpClient.post<ApiPostResponse>(
    `inspections`,
    backendData
  );
  return response;
};

const getInspection = async (id: string) => {
  const response = await httpClient.get<ApiResponseGeneric<any>>(
    `inspections?filter_reservation=${id}`
  );
  return response.data;
};

export default {
  getReservations,
  getReservation,
  postReservation,
  putReservation,
  confirmReservation,
  cancelReservation,
  markInProgress,
  markCompleted,
  registerInspection,
  getInspection,
};
