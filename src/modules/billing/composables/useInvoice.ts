import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { billingService } from '../Services/billing.services';
import type { Invoice, GenerateInvoicePayload } from '../interfaces/billing.interfaces';

export function useInvoice() {
  const toast = useToast();
  const loading = ref(false);
  const invoices = ref<Invoice[]>([]);
  const currentInvoice = ref<Invoice | null>(null);

  const fetchInvoices = async (params?: any) => {
    try {
      loading.value = true;
      const response = await billingService.getInvoices(params);
      invoices.value = response.data;
    } catch (error: any) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las facturas', life: 3000 });
    } finally {
      loading.value = false;
    }
  };

  const getInvoice = async (id: string) => {
    try {
      loading.value = true;
      const response = await billingService.getInvoiceById(id);
      currentInvoice.value = response.data;
      return response.data;
    } catch (error: any) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la factura', life: 3000 });
    } finally {
      loading.value = false;
    }
  };

  const generateInvoice = async (payload: GenerateInvoicePayload) => {
    try {
      loading.value = true;
      const response = await billingService.generateInvoice(payload);
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Factura generada', life: 3000 });
      await fetchInvoices();
      return response.data;
    } catch (error: any) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar la factura', life: 3000 });
    } finally {
      loading.value = false;
    }
  };

  const issueInvoice = async (id: string) => {
    try {
      loading.value = true;
      await billingService.issueInvoice(id);
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Factura emitida', life: 3000 });
      await fetchInvoices();
    } catch (error: any) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo emitir la factura', life: 3000 });
    } finally {
      loading.value = false;
    }
  };

  const voidInvoice = async (id: string) => {
    try {
      loading.value = true;
      await billingService.voidInvoice(id);
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Factura anulada', life: 3000 });
      await fetchInvoices();
    } catch (error: any) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo anular la factura', life: 3000 });
    } finally {
      loading.value = false;
    }
  };

  const downloadPdf = async (id: string, invoiceNumber: string) => {
    try {
      loading.value = true;
      const blob = await billingService.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Factura_${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Descargando factura', life: 3000 });
    } catch (error: any) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el PDF', life: 3000 });
    } finally {
      loading.value = false;
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
