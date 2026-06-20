import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useLoaderStore } from '@/core/store';
import { billingService } from '../Services/billing.services';
import type { Invoice, GenerateInvoicePayload } from '../interfaces/billing.interfaces';

export function useInvoice() {
  const toast = useToast();
  const { startLoading, finishLoading } = useLoaderStore();
  const loading = ref(false);
  const invoices = ref<Invoice[]>([]);
  const currentInvoice = ref<Invoice | null>(null);

  const fetchInvoices = async (params?: any) => {
    try {
      loading.value = true;
      startLoading();
      const response = await billingService.getInvoices(params);
      invoices.value = (response.data as any).data || response.data; // Handle both paginated and direct array
    } catch (error: any) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las facturas', life: 3000 });
    } finally {
      loading.value = false;
      finishLoading();
    }
  };

  const getInvoice = async (id: string) => {
    try {
      loading.value = true;
      startLoading();
      const response = await billingService.getInvoiceById(id);
      currentInvoice.value = response.data as any;
      return response.data;
    } catch (error: any) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la factura', life: 3000 });
    } finally {
      loading.value = false;
      finishLoading();
    }
  };

  const generateInvoice = async (payload: GenerateInvoicePayload) => {
    try {
      loading.value = true;
      startLoading();
      const response = await billingService.generateInvoice(payload);
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Factura generada', life: 3000 });
      await fetchInvoices();
      return response.data;
    } catch (error: any) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar la factura', life: 3000 });
    } finally {
      loading.value = false;
      finishLoading();
    }
  };

  const issueInvoice = async (id: string) => {
    try {
      loading.value = true;
      startLoading();
      await billingService.issueInvoice(id);
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Factura emitida', life: 3000 });
      await fetchInvoices();
    } catch (error: any) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo emitir la factura', life: 3000 });
    } finally {
      loading.value = false;
      finishLoading();
    }
  };

  const voidInvoice = async (id: string) => {
    try {
      loading.value = true;
      startLoading();
      await billingService.voidInvoice(id);
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Factura anulada', life: 3000 });
      await fetchInvoices();
    } catch (error: any) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo anular la factura', life: 3000 });
    } finally {
      loading.value = false;
      finishLoading();
    }
  };

  const downloadPdf = async (id: string, invoiceNumber: string) => {
    try {
      loading.value = true;
      startLoading();
      const blob = await billingService.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([blob as any], { type: 'application/pdf' }));
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Factura_${invoiceNumber}.pdf`;
      link.target = '_blank'; // Fallback to avoid navigation if download attribute is ignored
      
      // Dispatch click without appending to DOM to avoid router interception
      link.click();
      
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Descargando factura', life: 3000 });
    } catch (error: any) {
      console.error("PDF Download Error:", error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el PDF', life: 3000 });
    } finally {
      loading.value = false;
      finishLoading();
    }
  };

  return {
    loading,
    invoices,
    currentInvoice,
    fetchInvoices,
    getInvoice,
    generateInvoice,
    issueInvoice,
    voidInvoice,
    downloadPdf
  };
}
