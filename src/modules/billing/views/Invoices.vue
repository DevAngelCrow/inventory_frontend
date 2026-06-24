<template>
  <div class="py-5 px-5 h-full max-h-full flex items-start justify-center">
    <section id="invoices_content" class="w-full xl:w-[80%] flex flex-row flex-wrap gap-5">
      <AppTitle title="Facturación" class="w-full md:w-auto flex justify-center items-center" />
      <div id="inputs" class="flex rounded-lg py-0.5 px-0.5 gap-3 flex-wrap grow lg:grow-0 w-full">
        <AppInputText label="ID Reserva" class="min-w-auto w-full sm:w-[25%] grow lg:grow-0 shrink-0 md:w-45 lg:w-60" v-model="filter.filter_reservation"
          @update:modelValue="validateAlphaInput(filter.filter_reservation)"
          @keydown.enter="debouncedFindInvoice" />
        <AppAutocomplete class="min-w-auto w-full sm:w-[25%] grow lg:grow-0 shrink-0 md:w-45 lg:w-60" label="Cliente" v-model="selectedCustomer"
          :suggestions="customerSuggestions" optionLabel="fullName" @complete="onCustomerComplete"
          @update:modelValue="onCustomerSelect" dropdown />
        <AppSelect class="w-full sm:w-[20%] lg:w-auto min-w-0 grow lg:grow-0 shrink-0" label="Estado" v-model="filter.filter_status" :options="invoiceStatuses"
          optionLabel="name" optionValue="id" @change="findInvoice" />
        <Button class="shrink-0 grow rounded-md md:grow-0" @click="debouncedFindInvoice">Buscar</Button>
        <Button class="shrink-0 grow md:grow-0 rounded-md" outlined @click="debouncedCleanSearch" label="Limpiar"
          :icon="iconFilter"></Button>
      </div>

      <AppDataTable class="w-full" :headers="headers" :items="invoices" :paginator="true"
        :per_page="pagination.per_page" :total_items="pagination.total_items" :page="pagination.page"
        :show-per-page-options="true" :per-page-options="[10, 20, 50, 100]" @page-update="handlePagination"
        @per-page-update="handlePerPagePagination">
        <template #body-status="{ data }">
          <AppChipStatus :label="data?.status?.name || 'Desconocido'"
            :backgroundColor="data?.status?.state_color || '#cccccc'"
            :textColor="data?.status?.text_color || '#ffffff'" />
        </template>
        <template #body-total="{ data }">
          ${{ Number(data.total).toFixed(2) }}
        </template>
        <template #body-issue_date="{ data }">
          {{ formatDate(data.issue_date) }}
        </template>
        <template #body-customer="{ data }">
          {{ data.mnt_customer?.first_name }} {{ data.mnt_customer?.last_name }}
        </template>

        <template #body-acciones="{ data }">
          <div class="flex gap-2">
            <Button v-if="data.status?.code === 'DRAFT'" icon="pi pi-check-circle"
              class="p-button-success p-button-sm p-button-text" v-tooltip.top="'Emitir Factura'"
              @click="onIssue(data)" />
            <Button v-if="data.status?.code === 'ISSUED'" icon="pi pi-times-circle"
              class="p-button-danger p-button-sm p-button-text" v-tooltip.top="'Anular Factura'"
              @click="onVoid(data)" />
            <Button icon="pi pi-file-pdf" class="p-button-secondary p-button-sm p-button-text"
              v-tooltip.top="'Descargar PDF'" @click="onDownload(data)" />
          </div>
        </template>
      </AppDataTable>
    </section>

    <AppModal :show="actionModal.show" :title="actionModal.title" title-btn-confirm="Confirmar"
      title-btn-cancel="Cancelar" width="30rem" @close-modal="actionModal.show = false"
      @update:show="(val: boolean) => actionModal.show = val" @confirm-modal="executeAction">
      <div class="py-4 text-center text-lg">
        {{ actionModal.message }}
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { Button } from 'primevue';
import AppTitle from '@/core/components/AppTitle.vue';
import AppInputText from '@/core/components/AppInputText.vue';
import AppAutocomplete from '@/core/components/AppAutocomplete.vue';
import AppSelect from '@/core/components/AppSelect.vue';
import AppDataTable from '@/core/components/AppDataTable.vue';
import AppChipStatus from '@/core/components/AppChipStatus.vue';
import AppModal from '@/core/components/AppModal.vue';
import dayjs from 'dayjs';
import { useInvoice } from '../composables/useInvoice';
import type { Invoice } from '../interfaces/billing.interfaces';
import type { TableHeaders } from '@/core/interfaces/datatable.interface';

const { invoices, fetchInvoices, fetchInvoiceStatuses, invoiceStatuses, customerSuggestions, selectedCustomer, onCustomerComplete, onCustomerSelect, issueInvoice, voidInvoice, downloadPdf, filter, pagination, debouncedCleanSearch, debouncedFindInvoice, findInvoice, validateAlphaInput } = useInvoice();

const headers: TableHeaders[] = [
  { field: 'invoice_number', header: 'N° Factura', sortable: false, alignHeaders: 'start', alignItems: 'start' },
  { field: 'customer', header: 'Cliente', sortable: false, alignHeaders: 'start', alignItems: 'start' },
  { field: 'issue_date', header: 'Fecha Emisión', sortable: false, alignHeaders: 'start', alignItems: 'start' },
  { field: 'total', header: 'Total', sortable: false, alignHeaders: 'start', alignItems: 'start' },
  { field: 'status', header: 'Estado', sortable: false, alignHeaders: 'center', alignItems: 'center' },
  { field: 'acciones', header: 'Acciones', sortable: false, alignHeaders: 'center', alignItems: 'center' }
];

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return dayjs(dateString).format('DD/MM/YYYY');
};

const handlePagination = async (page: number) => {
  if (page + 1 === pagination.page) return;
  pagination.page = page + 1;
  fetchInvoices();
};

const handlePerPagePagination = async (perPage: number) => {
  if (perPage === pagination.per_page) return;
  pagination.per_page = perPage;
  pagination.page = 1;
  fetchInvoices();
};

const iconFilter = computed(() => {
  const filterValues = Object.values(filter).some(v => v !== undefined);
  if (!filterValues) {
    return 'pi pi-filter';
  }
  return 'pi pi-filter-slash';
});

const actionModal = reactive({
  show: false,
  title: '',
  message: '',
  id: '',
  actionType: '',
});

const onIssue = (invoice: Invoice) => {
  actionModal.id = invoice.id;
  actionModal.actionType = 'issue';
  actionModal.title = 'Emitir Factura';
  actionModal.message = `¿Seguro que desea emitir la factura ${invoice.invoice_number}?`;
  actionModal.show = true;
};

const onVoid = (invoice: Invoice) => {
  actionModal.id = invoice.id;
  actionModal.actionType = 'void';
  actionModal.title = 'Anular Factura';
  actionModal.message = `¿Seguro que desea anular la factura ${invoice.invoice_number}?`;
  actionModal.show = true;
};

const executeAction = async () => {
  if (actionModal.id) {
    if (actionModal.actionType === 'issue') {
      await issueInvoice(actionModal.id);
    } else if (actionModal.actionType === 'void') {
      await voidInvoice(actionModal.id);
    }
    actionModal.show = false;
  }
};

const onDownload = async (invoice: Invoice) => {
  await downloadPdf(invoice.id, invoice.invoice_number);
};

onMounted(() => {
  fetchInvoices();
  fetchInvoiceStatuses();
});
</script>
