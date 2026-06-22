import { ref, reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useLoaderStore } from '@/core/store';
import { billingService } from '../Services/billing.services';
import type { Invoice, GenerateInvoicePayload } from '../interfaces/billing.interfaces';
import catalogServices from '@/modules/catalogs/Services/catalog.services';
import customerServices from '@/modules/customers/Services/customer.services';
import type { AutoCompleteCompleteEvent } from 'primevue';
import type { CustomerResponse } from '@/modules/customers/interfaces/customer.interfaces';

type filterType = { filter_reservation?: string; filter_customer?: string; filter_status?: string | 'Todos' };

export function useInvoice() {
  const toast = useToast();
  const { startLoading, finishLoading } = useLoaderStore();
  const loading = ref(false);
  const invoices = ref<Invoice[]>([]);
  const currentInvoice = ref<Invoice | null>(null);

  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
  });

  const filter = reactive<filterType>({
    filter_reservation: undefined,
    filter_customer: undefined,
    filter_status: 'Todos',
  });

  const invoiceStatuses = ref<{name: string, id: string | 'Todos'}[]>([{name: 'Todos', id: 'Todos'}]);
  const customerSuggestions = ref<(CustomerResponse & { fullName: string })[]>([]);
  const selectedCustomer = ref<(CustomerResponse & { fullName: string }) | undefined>();

  const fetchInvoiceStatuses = async () => {
    try {
      const response = await catalogServices.getGlobalStatus({ code_category: 'INV', per_page: 100 } as any);
      if (response && response.data && response.data.data) {
         const statuses = response.data.data.map(s => ({ name: s.name, id: s.id }));
         invoiceStatuses.value = [{ name: 'Todos', id: 'Todos' }, ...statuses];
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onCustomerComplete = async (event: AutoCompleteCompleteEvent) => {
    try {
      const response = await customerServices.getCustomers({ filter_name: event.query, per_page: 50, status: true });
      if (response && response.data && response.data.data) {
        customerSuggestions.value = response.data.data.map((c: any) => ({
          ...c,
          fullName: `${c.first_name} ${c.last_name}`.trim(),
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onCustomerSelect = (newValue: any) => {
    const selectedObj = typeof newValue === 'string' || !newValue ? undefined : newValue;
    selectedCustomer.value = selectedObj;
    filter.filter_customer = selectedObj ? selectedObj.id : undefined;
    findInvoice();
  };

  const fetchInvoices = async () => {
    try {
      loading.value = true;
      startLoading();
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        filter_reservation: filter.filter_reservation,
        filter_customer: filter.filter_customer,
        filter_status: filter.filter_status === 'Todos' ? undefined : filter.filter_status,
      };
      const response = await billingService.getInvoices(params);
      const responseData = (response as any).data || response;
      invoices.value = responseData.data || responseData; 
      if (responseData.current_page) pagination.page = responseData.current_page;
      if (responseData.per_page) pagination.per_page = responseData.per_page;
      if (responseData.total_items !== undefined) pagination.total_items = responseData.total_items;
    } catch (error: any) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las facturas', life: 3000 });
    } finally {
      loading.value = false;
      finishLoading();
    }
  };

  const findInvoice = () => {
    pagination.page = 1;
    fetchInvoices();
  };

  const cleanSearch = () => {
    filter.filter_reservation = undefined;
    filter.filter_customer = undefined;
    filter.filter_status = 'Todos';
    selectedCustomer.value = undefined;
    pagination.page = 1;
    fetchInvoices();
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
    pagination,
    filter,
    findInvoice,
    cleanSearch,
    fetchInvoices,
    fetchInvoiceStatuses,
    invoiceStatuses,
    customerSuggestions,
    selectedCustomer,
    onCustomerComplete,
    onCustomerSelect,
    getInvoice,
    generateInvoice,
    issueInvoice,
    voidInvoice,
    downloadPdf
  };
}
