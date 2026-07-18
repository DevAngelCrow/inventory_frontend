<template>
  <div class="py-5 px-5 h-full max-h-full flex items-start justify-center">
    <section id="reservation_detail_content" class="w-full xl:w-[95%] flex flex-col gap-6">
      <div class="flex items-center gap-3">
        <Button icon="pi pi-arrow-left" severity="secondary" outlined @click="goBack" />
        <AppTitle :title="pageTitle" />
      </div>

      <form @submit.prevent="onSubMit" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Event Info Card (Left Column) -->
        <AppCard class="lg:col-span-2">
          <template #title>
            <h3>Detalles del Evento y Entrega</h3>
          </template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppSelect class="w-full" id="id_customer" label="Cliente*" v-model="id_customer"
                :error-messages="errors.id_customer" v-bind="idCustomerAttrs" :options="customersList"
                optionLabel="first_name" optionValue="id" :readonly="isReadonly" />

              <div class="flex justify-end items-center" v-if="status">
                <AppChipStatus :label="computedStatusLabel" :backgroundColor="computedStatusColor" />
              </div>

              <div
                class="md:col-span-2 flex flex-col gap-4 mt-2 mb-2 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                <h4 class="font-semibold text-lg text-surface-900 dark:text-surface-0">
                  Dirección de Entrega
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AppSelect class="w-full md:col-span-2" id="id_customer_address"
                    label="Rellenar con dirección guardada del cliente" v-model="id_customer_address"
                    :error-messages="errors.id_customer_address" v-bind="idCustomerAddressAttrs"
                    :options="customerAddresses" optionLabel="label" optionValue="id" :readonly="isReadonly"
                    @change="onCustomerAddressChange" />

                  <AppInputText class="w-full" id="delivery_address" label="Dirección Línea 1"
                    v-model="delivery_address" :error-messages="errors.delivery_address" v-bind="deliveryAddressAttrs"
                    :readonly="isReadonly" />
                  <AppInputText class="w-full" id="delivery_address_line2" label="Dirección Línea 2"
                    v-model="delivery_address_line2" :error-messages="errors.delivery_address_line2"
                    v-bind="deliveryAddressLine2Attrs" :readonly="isReadonly" />

                  <AppGeographicCascade class="w-full" id="id_geographic_division" v-model="id_geographic_division"
                    :error-messages="errors.id_geographic_division" :id_country="selectedCustomerCountryId"
                    :readonly="isReadonly" />
                  <AppInputText class="w-full" id="delivery_zip" label="Código Postal" v-model="delivery_zip"
                    :error-messages="errors.delivery_zip" v-bind="deliveryZipAttrs" :readonly="isReadonly" />

                  <AppInputextArea class="w-full md:col-span-2" id="delivery_notes" label="Notas de Entrega"
                    v-model="delivery_notes" :error-messages="errors.delivery_notes" v-bind="deliveryNotesAttrs"
                    :readonly="isReadonly" />
                </div>
              </div>

              <AppDatePicker class="w-full" id="event_start" label="Inicio del Evento*" v-model="event_start"
                :error-messages="errors.event_start" v-bind="eventStartAttrs" showTime :readonly="isReadonly" />

              <AppDatePicker class="w-full" id="event_end" label="Fin del Evento*" v-model="event_end"
                :error-messages="errors.event_end" v-bind="eventEndAttrs" showTime :readonly="isReadonly" />
            </div>
          </template>
        </AppCard>

        <!-- Totals & Save (Right Column) -->
        <div class="flex flex-col gap-6">
          <AppCard>
            <template #title>
              <h3>Resumen de Cobro (USD)</h3>
            </template>
            <template #content>
              <div class="flex flex-col gap-4">
                <div class="flex justify-between border-b pb-2">
                  <span>Subtotal Mobiliario:</span>
                  <span class="font-semibold">${{ cartSubtotal.toFixed(2) }}</span>
                </div>
                <!--
                <div class="flex justify-between border-b pb-2">
                  <span>Impuestos (13% IVA):</span>
                  <span class="font-semibold"
                    >${{ cartTaxAmount.toFixed(2) }}</span
                  >
                </div>
                -->

                <AppInputMoney class="w-full" id="delivery_fee" label="Costo de Envío" v-model="delivery_fee"
                  :error-messages="errors.delivery_fee" v-bind="deliveryFeeAttrs" :readonly="isReadonly" />

                <AppInputMoney class="w-full" id="discount_amount" label="Descuento Aplicado" v-model="discount_amount"
                  :error-messages="errors.discount_amount" v-bind="discountAmountAttrs" :readonly="isReadonly" />

                <div class="flex justify-between border-b pb-2 text-lg font-bold">
                  <span>Total Alquiler:</span>
                  <span class="text-primary">${{ cartTotal.toFixed(2) }}</span>
                </div>

                <AppInputMoney class="w-full" id="deposit_amount" label="Anticipo / Depósito Pagado"
                  v-model="deposit_amount" :error-messages="errors.deposit_amount" v-bind="depositAmountAttrs"
                  :readonly="isReadonly" />

                <div class="flex justify-between text-lg font-bold text-red-600">
                  <span>Saldo Pendiente:</span>
                  <span>${{ cartBalanceDue.toFixed(2) }}</span>
                </div>

                <AppInputextArea class="w-full" id="notes" label="Notas Factura" v-model="notes"
                  :error-messages="errors.notes" v-bind="notesAttrs" :readonly="isReadonly" />

                <div class="flex gap-2 justify-end mt-4" v-if="!isReadonly">
                  <Button label="Cancelar" severity="secondary" outlined @click="goBack" />
                  <Button label="Guardar Reserva" type="submit" />
                </div>
              </div>
            </template>
          </AppCard>
        </div>

        <!-- Selected Products Basket (Full Width Below) -->
        <AppCard class="lg:col-span-3">
          <template #title>
            <div class="flex justify-between items-center flex-wrap gap-3">
              <h3>Artículos Seleccionados para Alquiler</h3>
              <!-- Add Item Form (Inline) -->
              <div class="flex flex-wrap gap-3 items-center" v-if="!isReadonly">
                <AppSelect class="flex-1 min-w-[300px]" id="add_product" label="Seleccionar Producto"
                  v-model="selectedProductToAdd" :options="productsList" optionLabel="name" />
                <AppInputNumber class="flex grow" id="add_qty" label="Cant." v-model="selectedQtyToAdd" />
                <Button label="Agregar" class="flex grow rounded-md" icon="pi pi-plus" size="small"
                  @click="addItemToCart" />
              </div>
            </div>
          </template>
          <template #content>
            <AppDataTable :items="cartItems" :headers="cartHeaders" class="p-datatable-sm w-full">
              <template #body-unit_price="{ data }">
                ${{ Number(data.unit_price).toFixed(2) }}
              </template>
              <template #body-subtotal="{ data }">
                ${{ Number(data.subtotal).toFixed(2) }}
              </template>
              <template #body-accion="{ data }">
                <Button icon="pi pi-trash" severity="danger" variant="text" rounded
                  @click="removeFromCart(data.id_product)" />
              </template>
            </AppDataTable>
            <div v-if="!cartItems.length" class="text-center py-5 text-gray-500">
              No hay productos agregados en el carrito para esta reserva.
            </div>
          </template>
        </AppCard>

        <!-- Invoices List (Facturas) -->
        <AppCard class="lg:col-span-3" v-if="currentReservation?.mnt_invoice?.length">
          <template #title>
            <h3>Facturas de la Reserva</h3>
          </template>
          <template #content>
            <AppDataTable :items="currentReservation.mnt_invoice" :headers="invoiceHeaders" class="p-datatable-sm w-full">
              <template #body-total="{ data }">
                ${{ Number(data.total).toFixed(2) }}
              </template>
              <template #body-status="{ data }">
                <span :class="data.ctl_status?.text_color || 'text-gray-600'">
                  {{ data.ctl_status?.name || 'Desconocido' }}
                </span>
              </template>
              <template #body-accion="{ data }">
                <Button 
                  icon="pi pi-file-pdf" 
                  class="p-button-secondary p-button-sm p-button-text"
                  v-tooltip.top="'Descargar PDF'"
                  @click="downloadPdf(data.id, data.invoice_number)"
                />
              </template>
            </AppDataTable>
          </template>
        </AppCard>
      </form>
    </section>
    
    <PaymentFormModal
      v-if="showPaymentModal"
      :modal-state="paymentModalState"
      :reservation="currentReservation"
      :invoice="selectedInvoice"
      @close-modal="closePaymentModal"
      @payment-registered="onPaymentRegistered"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button } from 'primevue';

import type { TableHeaders } from '@/core/interfaces/datatable.interface';
import AppTitle from '@/core/components/AppTitle.vue';
import AppCard from '@/core/components/AppCard.vue';
import AppDataTable from '@/core/components/AppDataTable.vue';
import AppChipStatus from '@/core/components/AppChipStatus.vue';
import AppInputText from '@/core/components/AppInputText.vue';
import AppInputNumber from '@/core/components/AppInputNumber.vue';
import AppInputMoney from '@/core/components/AppInputMoney.vue';
import AppSelect from '@/core/components/AppSelect.vue';
import AppGeographicCascade from '@/core/components/AppGeographicCascade.vue';
import AppInputextArea from '@/core/components/AppInputextArea.vue';
import AppDatePicker from '@/core/components/AppDatePicker.vue';
import { useLoaderStore } from '@/core/store';

import { ProductResponse } from '../../inventory/interfaces/inventory.interfaces';
import { useReservation } from '../composables/useReservation';
import reservationServices from '../Services/reservation.services';
import { ReservationForm } from '../interfaces/reservation.interfaces';
import PaymentFormModal from '../../payments/components/PaymentFormModal.vue';
import { useInvoice } from '../../billing/composables/useInvoice';

const route = useRoute();
const router = useRouter();
const loaderStore = useLoaderStore();

const reservationInstance = useReservation();
provide('useReservation', reservationInstance);

const { downloadPdf } = useInvoice();

const {
  errors,
  id_customer,
  idCustomerAttrs,
  event_start,
  eventStartAttrs,
  event_end,
  eventEndAttrs,
  delivery_address,
  deliveryAddressAttrs,
  delivery_address_line2,
  deliveryAddressLine2Attrs,
  delivery_zip,
  deliveryZipAttrs,
  delivery_notes,
  deliveryNotesAttrs,
  id_customer_address,
  idCustomerAddressAttrs,
  id_geographic_division,
  discount_amount,
  discountAmountAttrs,
  delivery_fee,
  deliveryFeeAttrs,
  deposit_amount,
  depositAmountAttrs,
  notes,
  notesAttrs,
  status,
  delivery_datetime,
  pickup_datetime,
  loadDependencies,
  addToCart,
  removeFromCart,
  saveReservation,
  setReservationItem,
  cartItems,
  cartSubtotal,
  //cartTaxAmount,
  cartTotal,
  cartBalanceDue,
  customersList,
  productsList,
  handleSubmit,
  currentReservation,
} = reservationInstance;

const selectedProductToAdd = ref<ProductResponse>();
const selectedQtyToAdd = ref<number>(1);

const selectedCustomerCountryId = computed(() => {
  if (!id_customer.value) return undefined;
  const customer = customersList.value.find(c => c.id === id_customer.value);
  return customer?.id_country;
});
const customerAddresses = computed(() => {
  if (!id_customer.value) return [];
  const customer = customersList.value.find(c => c.id === id_customer.value);
  return customer?.addresses || [];
});

const computedStatusLabel = computed(() => {
  if (!currentReservation.value?.status) return '';
  const baseStatus = currentReservation.value.status;
  if (baseStatus?.code === 'IN_PROGRESS') {
    if (pickup_datetime.value) return 'Retornado al almacén';
    if (delivery_datetime.value) return 'Entregado al cliente';
  }
  return baseStatus?.name || '';
});

const computedStatusColor = computed(() => {
  if (!currentReservation.value?.status) return '';
  const baseStatus = currentReservation.value.status;
  if (baseStatus?.code === 'IN_PROGRESS') {
    if (pickup_datetime.value) return '#f59e0b'; // amber
    if (delivery_datetime.value) return '#10b981'; // emerald
  }
  return baseStatus?.state_color || '';
});

const onCustomerAddressChange = () => {
  if (!id_customer_address.value) return;
  const selectedAddr = customerAddresses.value.find(
    a => a.id === id_customer_address.value,
  );
  if (selectedAddr) {
    delivery_address.value = selectedAddr.address_line1;
    delivery_address_line2.value = selectedAddr.address_line2;
    id_geographic_division.value = selectedAddr.id_geographic_division;
    delivery_zip.value = selectedAddr.zip_code;
  }
};

const isReadonly = computed(() => {
  const isUrlView = route.query.mode === 'view';

  let isStatusLocked = false;
  if (status.value) {
    const statusCode = (status.value as any).code;
    isStatusLocked = statusCode === 'COMPLETED' || statusCode === 'CANCELLED';
  }

  return isUrlView || isStatusLocked;
});

const pageTitle = computed(() => {
  if (route.params.id) {
    return isReadonly.value ? 'Detalles de Alquiler' : 'Editar Reserva';
  }
  return 'Nueva Reserva';
});

const cartHeaders = computed<TableHeaders[]>(() => {
  const headers: TableHeaders[] = [
    { field: 'product_name', header: 'Producto', sortable: false },
    { field: 'sku', header: 'SKU', sortable: false, width: 15 },
    {
      field: 'quantity',
      header: 'Cantidad',
      sortable: false,
      width: 15,
      alignItems: 'center',
      alignHeaders: 'center',
    },
    {
      field: 'unit_price',
      header: 'Precio Unit.',
      sortable: false,
      width: 15,
      alignItems: 'end',
      alignHeaders: 'end',
    },
    {
      field: 'subtotal',
      header: 'Subtotal',
      sortable: false,
      width: 15,
      alignItems: 'end',
      alignHeaders: 'end',
    },
  ];
  if (!isReadonly.value) {
    headers.push({
      field: 'accion',
      header: 'Acción',
      sortable: false,
      width: 10,
      alignItems: 'center',
      alignHeaders: 'center',
    });
  }
  return headers;
});

const addItemToCart = async () => {
  if (!selectedProductToAdd.value || selectedQtyToAdd.value <= 0) return;
  const success = await addToCart(
    selectedProductToAdd.value,
    selectedQtyToAdd.value,
  );
  if (success) {
    selectedProductToAdd.value = undefined;
    selectedQtyToAdd.value = 1;
  }
};

const onSubMit = handleSubmit(async values => {
  const result = await saveReservation(values as unknown as ReservationForm);
  if (result) {
    router.push({ name: 'reservations-list' });
  }
});

const goBack = () => {
  router.push({ name: 'reservations-list' });
};

const invoiceHeaders: TableHeaders[] = [
  { field: 'invoice_number', header: 'Número', sortable: false },
  { field: 'issue_date', header: 'Fecha Emisión', sortable: false },
  { field: 'total', header: 'Total', sortable: false },
  { field: 'status', header: 'Estado', sortable: false },
  { field: 'accion', header: 'Acción', sortable: false, width: 10, alignHeaders: 'center', alignItems: 'center' }
];

const showPaymentModal = ref(false);
const paymentModalState = ref({ show: false, mode: 'add' as 'add' | 'view', title: 'Registrar Pago' });
const selectedInvoice = ref<any>(null);

const openPaymentModal = (invoice: any) => {
  selectedInvoice.value = invoice;
  paymentModalState.value = { show: true, mode: 'add', title: `Registrar Pago (Factura ${invoice.invoice_number})` };
  showPaymentModal.value = true;
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
  selectedInvoice.value = null;
};

const onPaymentRegistered = async () => {
  closePaymentModal();
  if (route.params.id) {
    try {
      const resp = await reservationServices.getReservation(route.params.id as string);
      if (resp.statusCode === 200) {
        setReservationItem(resp.data);
      }
    } catch (e) {
      console.error(e);
    }
  }
};

onMounted(async () => {
  loaderStore.startLoading();
  await loadDependencies();
  if (route.params.id) {
    try {
      const resp = await reservationServices.getReservation(
        route.params.id as string,
      );
      if (resp.statusCode === 200) {
        setReservationItem(resp.data);
      }
    } catch (e) {
      console.error(e);
    }
  }
  loaderStore.finishLoading();
});
</script>
