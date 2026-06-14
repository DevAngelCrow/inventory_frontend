import type { AxiosRequestConfig, AxiosResponseHeaders } from 'axios';

export interface SuccessResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: AxiosResponseHeaders;
  config: AxiosRequestConfig;
  request?: unknown;
}

export interface ErrorResponse {
  message: string;
  statusCode?: number;
  errors?: unknown;
}
