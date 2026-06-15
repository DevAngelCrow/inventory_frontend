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
  const response = await httpClient.get<ApiResponseGeneric<ReservationResponse>>(
    'reservations',
    params
  );
  return response.data;
};

const getCalendarReservations = async (params: {
  start: string;
  end: string;
}): Promise<{ data: ReservationResponse[] }> => {
  const response = await httpClient.get<{ data: ReservationResponse[] }>(
    'reservations/calendar',
    params
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
  const response = await httpClient.patch<ApiPostResponse>(
    `reservations/${id}/confirm`
  );
  return response;
};

const cancelReservation = async (id: string, reason: string) => {
  const response = await httpClient.patch<ApiPostResponse>(
    `reservations/${id}/cancel`,
    { reason }
  );
  return response;
};

const markInTransit = async (id: string) => {
  const response = await httpClient.patch<ApiPostResponse>(
    `reservations/${id}/transit`
  );
  return response;
};

const markDelivered = async (id: string) => {
  const response = await httpClient.patch<ApiPostResponse>(
    `reservations/${id}/delivered`
  );
  return response;
};

const markPickedUp = async (id: string) => {
  const response = await httpClient.patch<ApiPostResponse>(
    `reservations/${id}/picked-up`
  );
  return response;
};

const registerInspection = async (id: string, data: any) => {
  const response = await httpClient.post<ApiPostResponse>(
    `reservations/${id}/inspection`,
    data
  );
  return response;
};

const getInspection = async (id: string) => {
  const response = await httpClient.get<ApiResponseGeneric<any>>(
    `reservations/${id}/inspection`
  );
  return response.data;
};

export default {
  getReservations,
  getCalendarReservations,
  getReservation,
  postReservation,
  putReservation,
  confirmReservation,
  cancelReservation,
  markInTransit,
  markDelivered,
  markPickedUp,
  registerInspection,
  getInspection,
};
