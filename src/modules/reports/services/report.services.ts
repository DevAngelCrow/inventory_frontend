import { httpClient } from '@/core/utils/httpClient';
import { ApiPostResponse } from '@/core/services/apiPostResponse.interface';
export interface DashboardSummaryResponse {
  reservas: { hoy: number; semana: number; mes: number };
  ingresos: { hoy: number; semana: number; mes: number };
  logistica: { en_transito: number; entregados: number; en_mantenimiento: number };
  cuentas_por_cobrar: { balance_pendiente: number; facturas_draft: number };
  top_productos: { nombre: string; cantidad: number }[];
  proximos_eventos: { cliente: string; direccion: string; fecha: string; tipo: string }[];
}

const getDashboardSummary = async () => {
  const response = await httpClient.get<ApiPostResponse<DashboardSummaryResponse>>('reports/dashboard-summary');
  return response.data;
};

export const reportServices = {
  getDashboardSummary,
};
