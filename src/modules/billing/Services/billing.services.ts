import { httpClient } from '@/core/utils/httpClient';
import type { ApiResponseGeneric } from '@/core/services/interfaces/apiResponseGeneric.interface';

import type {
  Invoice,
  GenerateInvoicePayload,
} from '../interfaces/billing.interfaces';

export const billingService = {
  getInvoices: async (params?: any): Promise<ApiResponseGeneric<Invoice>> => {
    const response = await httpClient.get<ApiResponseGeneric<Invoice>>(
      'billing/invoices',
      params,
    );
    return response.data;
  },

  getInvoiceById: async (id: string): Promise<ApiResponseGeneric<Invoice>> => {
    const response = await httpClient.get<ApiResponseGeneric<Invoice>>(
      `billing/invoices/${id}`,
    );
    return response.data;
  },

  generateInvoice: async (
    payload: GenerateInvoicePayload,
  ): Promise<ApiResponseGeneric<Invoice>> => {
    const response = await httpClient.post<ApiResponseGeneric<Invoice>>(
      'billing/invoices/generate',
      payload,
    );
    return response.data;
  },

  issueInvoice: async (id: string): Promise<ApiResponseGeneric<Invoice>> => {
    const response = await httpClient.patch<ApiResponseGeneric<Invoice>>(
      `billing/invoices/${id}/issue`,
    );
    return response.data;
  },

  voidInvoice: async (id: string): Promise<ApiResponseGeneric<Invoice>> => {
    const response = await httpClient.patch<ApiResponseGeneric<Invoice>>(
      `billing/invoices/${id}/void`,
    );
    return response.data;
  },

  downloadPdf: async (id: string): Promise<Blob> => {
    const response = await httpClient.instance.get(
      `billing/invoices/${id}/pdf`,
      { responseType: 'blob' },
    );
    return response.data;
  },
};
