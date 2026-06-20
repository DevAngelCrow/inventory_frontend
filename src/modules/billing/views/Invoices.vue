<template>
  <AppTitle title="Facturación" />
  <div class="w-full flex flex-col gap-6">
    <Card>
      <template #content>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Listado de Facturas</h2>
          <div class="flex gap-2">
            <!-- Add future filters here -->
          </div>
        </div>

        <AppDataTable
          :headers="headers"
          :items="invoices"
          :loading="loading"
        >
          <template #body-status="{ data }">
            <Tag :value="data.status?.name" :severity="getStatusSeverity(data.status?.code)" />
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
              <Button
                v-if="data.status?.code === 'DRAFT'"
                icon="pi pi-check-circle"
                class="p-button-success p-button-sm p-button-text"
                v-tooltip.top="'Emitir Factura'"
                @click="onIssue(data)"
              />
              <Button
                v-if="data.status?.code === 'ISSUED'"
                icon="pi pi-times-circle"
                class="p-button-danger p-button-sm p-button-text"
                v-tooltip.top="'Anular Factura'"
                @click="onVoid(data)"
              />
              <Button
                icon="pi pi-file-pdf"
                class="p-button-secondary p-button-sm p-button-text"
                v-tooltip.top="'Descargar PDF'"
                @click="onDownload(data)"
              />
            </div>
          </template>
        </AppDataTable>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Card, Button, Tag } from 'primevue';
import AppTitle from '@/core/components/AppTitle.vue';
import AppDataTable from '@/core/components/AppDataTable.vue';
import dayjs from 'dayjs';
import { useInvoice } from '../composables/useInvoice';
import type { Invoice } from '../interfaces/billing.interfaces';

const { loading, invoices, fetchInvoices, issueInvoice, voidInvoice, downloadPdf } = useInvoice();

const headers = [
  { field: 'invoice_number', header: 'N° Factura' },
  { field: 'customer', header: 'Cliente' },
  { field: 'issue_date', header: 'Fecha Emisión' },
  { field: 'total', header: 'Total' },
  { field: 'status', header: 'Estado' },
  { field: 'acciones', header: 'Acciones' }
];

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return dayjs(dateString).format('DD/MM/YYYY');
};

const getStatusSeverity = (status: string | undefined) => {
  switch (status) {
    case 'DRAFT': return 'warn';
    case 'ISSUED': return 'info';
    case 'PAID': return 'success';
    case 'VOIDED': return 'danger';
    default: return 'info';
  }
};

const onIssue = async (invoice: Invoice) => {
  if(confirm(`¿Seguro que desea emitir la factura ${invoice.invoice_number}?`)) {
    await issueInvoice(invoice.id);
  }
};

const onVoid = async (invoice: Invoice) => {
  if(confirm(`¿Seguro que desea anular la factura ${invoice.invoice_number}?`)) {
    await voidInvoice(invoice.id);
  }
};

const onDownload = async (invoice: Invoice) => {
  await downloadPdf(invoice.id, invoice.invoice_number);
};

onMounted(() => {
  fetchInvoices();
});
</script>
