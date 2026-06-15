<template>
  <div class="py-5 px-5 h-full max-h-full flex items-start justify-center">
    <section
      id="reservation_detail_content"
      class="w-full xl:w-[95%] flex flex-col gap-6"
    >
      <div class="flex items-center gap-3">
        <Button icon="pi pi-arrow-left" severity="secondary" outlined @click="goBack" />
        <AppTitle :title="pageTitle" />
      </div>

      <form @submit.prevent="onSubMit" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Event Info Card (Left Column) -->
        <Card class="lg:col-span-2">
          <template #title>
            <h3>Detalles del Evento y Entrega</h3>
          </template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppSelect class="w-full" id="id_customer" label="Cliente*" v-model="id_customer"
                :error-messages="errors.id_customer" v-bind="idCustomerAttrs" :options="customersList"
                optionLabel="first_name" optionValue="id" :readonly="isReadonly" />

              <AppInputText class="w-full" id="event_type" label="Tipo de Evento (ej: Boda)" v-model="event_type"
                :error-messages="errors.event_type" v-bind="eventTypeAttrs" :readonly="isReadonly" />

              <AppDatePicker class="w-full" id="event_start" label="Inicio del Evento*" v-model="event_start"
                :error-messages="errors.event_start" v-bind="eventStartAttrs" showTime :readonly="isReadonly" />

              <AppDatePicker class="w-full" id="event_end" label="Fin del Evento*" v-model="event_end"
                :error-messages="errors.event_end" v-bind="eventEndAttrs" showTime :readonly="isReadonly" />

              <AppDatePicker class="w-full" id="delivery_datetime" label="Fecha/Hora de Entrega" v-model="delivery_datetime"
                :error-messages="errors.delivery_datetime" v-bind="deliveryDatetimeAttrs" showTime :readonly="isReadonly" />

              <AppDatePicker class="w-full" id="pickup_datetime" label="Fecha/Hora de Retorno" v-model="pickup_datetime"
                :error-messages="errors.pickup_datetime" v-bind="pickupDatetimeAttrs" showTime :readonly="isReadonly" />

              <AppInputNumber class="w-full" id="transit_time_minutes" label="Tiempo de Traslado (minutos)" v-model="transit_time_minutes"
                :error-messages="errors.transit_time_minutes" v-bind="transitTimeMinutesAttrs" :readonly="isReadonly" />

              <AppInputText class="w-full" id="venue_name" label="Lugar / Salón" v-model="venue_name"
                :error-messages="errors.venue_name" v-bind="venueNameAttrs" :readonly="isReadonly" />

              <AppInputText class="w-full md:col-span-2" id="delivery_address" label="Dirección de Entrega" v-model="delivery_address"
                :error-messages="errors.delivery_address" v-bind="deliveryAddressAttrs" :readonly="isReadonly" />

              <AppInputText class="w-full" id="delivery_city" label="Ciudad" v-model="delivery_city"
                :error-messages="errors.delivery_city" v-bind="deliveryCityAttrs" :readonly="isReadonly" />

              <AppInputText class="w-full" id="delivery_state" label="Estado / Depto" v-model="delivery_state"
                :error-messages="errors.delivery_state" v-bind="deliveryStateAttrs" :readonly="isReadonly" />

              <AppInputText class="w-full" id="delivery_contact_name" label="Nombre de Contacto Recibe" v-model="delivery_contact_name"
                :error-messages="errors.delivery_contact_name" v-bind="deliveryContactNameAttrs" :readonly="isReadonly" />

              <AppInputText class="w-full" id="delivery_contact_phone" label="Teléfono de Contacto Recibe" v-model="delivery_contact_phone"
                :error-messages="errors.delivery_contact_phone" v-bind="deliveryContactPhoneAttrs" :readonly="isReadonly" />

              <AppInputextArea class="w-full md:col-span-2" id="delivery_notes" label="Instrucciones Especiales" v-model="delivery_notes"
                :error-messages="errors.delivery_notes" v-bind="deliveryNotesAttrs" :readonly="isReadonly" />
            </div>
          </template>
        </Card>

        <!-- Totals & Save (Right Column) -->
        <div class="flex flex-col gap-6">
          <Card>
            <template #title>
              <h3>Resumen de Cobro (USD)</h3>
            </template>
            <template #content>
              <div class="flex flex-col gap-4">
                <div class="flex justify-between border-b pb-2">
                  <span>Subtotal Mobiliario:</span>
                  <span class="font-semibold">${{ cartSubtotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                  <span>Impuestos (13% IVA):</span>
                  <span class="font-semibold">${{ cartTaxAmount.toFixed(2) }}</span>
                </div>

                <AppInputMoney class="w-full" id="delivery_fee" label="Costo de Envío" v-model="delivery_fee"
                  :error-messages="errors.delivery_fee" v-bind="deliveryFeeAttrs" :readonly="isReadonly" />

                <AppInputMoney class="w-full" id="discount_amount" label="Descuento Aplicado" v-model="discount_amount"
                  :error-messages="errors.discount_amount" v-bind="discountAmountAttrs" :readonly="isReadonly" />

                <AppInputText class="w-full" id="discount_reason" label="Razón de Descuento" v-model="discount_reason"
                  :error-messages="errors.discount_reason" v-bind="discountReasonAttrs" :readonly="isReadonly" />

                <div class="flex justify-between border-b pb-2 text-lg font-bold">
                  <span>Total Alquiler:</span>
                  <span class="text-primary">${{ cartTotal.toFixed(2) }}</span>
                </div>

                <AppInputMoney class="w-full" id="deposit_amount" label="Anticipo / Depósito Pagado" v-model="deposit_amount"
                  :error-messages="errors.deposit_amount" v-bind="depositAmountAttrs" :readonly="isReadonly" />

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
          </Card>
        </div>

        <!-- Selected Products Basket (Full Width Below) -->
        <Card class="lg:col-span-3">
          <template #title>
            <div class="flex justify-between items-center flex-wrap gap-3">
              <h3>Artículos Seleccionados para Alquiler</h3>
              <!-- Add Item Form (Inline) -->
              <div class="flex gap-3 items-center flex-wrap" v-if="!isReadonly">
                <AppSelect class="w-[250px]" id="add_product" label="Seleccionar Producto" v-model="selectedProductToAdd"
                  :options="productsList" optionLabel="name" />
                <AppInputNumber class="w-[100px]" id="add_qty" label="Cant." v-model="selectedQtyToAdd" />
                <Button label="Agregar" icon="pi pi-plus" size="small" @click="addItemToCart" />
              </div>
            </div>
          </template>
          <template #content>
            <DataTable :value="cartItems" class="p-datatable-sm">
              <Column field="product_name" header="Producto"></Column>
              <Column field="sku" header="SKU" headerStyle="width: 15%"></Column>
              <Column field="quantity" header="Cantidad" headerStyle="width: 15%; text-align: center" bodyStyle="text-align: center"></Column>
              <Column field="unit_price" header="Precio Unit." headerStyle="width: 15%; text-align: right" bodyStyle="text-align: right">
                <template #body="{ data }">
                  ${{ Number(data.unit_price).toFixed(2) }}
                </template>
              </Column>
              <Column field="subtotal" header="Subtotal" headerStyle="width: 15%; text-align: right" bodyStyle="text-align: right">
                <template #body="{ data }">
                  ${{ Number(data.subtotal).toFixed(2) }}
                </template>
              </Column>
              <Column header="Acción" headerStyle="width: 10%; text-align: center" bodyStyle="text-align: center" v-if="!isReadonly">
                <template #body="{ data }">
                  <Button icon="pi pi-trash" severity="danger" variant="text" rounded @click="removeFromCart(data.id_product)" />
                </template>
              </Column>
            </DataTable>
            <div v-if="!cartItems.length" class="text-center py-5 text-gray-500">
              No hay productos agregados en el carrito para esta reserva.
            </div>
          </template>
        </Card>
      </form>
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Card, Button, DataTable, Column } from 'primevue';

import AppTitle from '@/core/components/AppTitle.vue';
import AppInputText from '@/core/components/AppInputText.vue';
import AppInputNumber from '@/core/components/AppInputNumber.vue';
import AppInputMoney from '@/core/components/AppInputMoney.vue';
import AppSelect from '@/core/components/AppSelect.vue';
import AppInputextArea from '@/core/components/AppInputextArea.vue';
import AppDatePicker from '@/core/components/AppDatePicker.vue';
import { useLoaderStore } from '@/core/store';
import { FormatDate, CreateDateFromFormat } from '@/core/utils/dates';

import { useReservation } from '../composables/useReservation';
import reservationServices from '../Services/reservation.services';

const route = useRoute();
const router = useRouter();
const loaderStore = useLoaderStore();

const reservationInstance = useReservation();
provide('useReservation', reservationInstance);

const {
  errors,
  id_customer,
  event_start,
  event_end,
  delivery_datetime,
  pickup_datetime,
  transit_time_minutes,
  delivery_address,
  delivery_city,
  delivery_state,
  delivery_zip,
  delivery_notes,
  delivery_contact_name,
  delivery_contact_phone,
  event_type,
  venue_name,
  discount_amount,
  discount_reason,
  delivery_fee,
  deposit_amount,
  notes,
  internal_notes,
  loadDependencies,
  addToCart,
  removeFromCart,
  saveReservation,
  setReservationItem,
  cartItems,
  cartSubtotal,
  cartTaxAmount,
  cartTotal,
  cartBalanceDue,
  customersList,
  productsList,
  handleSubmit,
} = reservationInstance;

const selectedProductToAdd = ref<ProductResponse | null>(null);
const selectedQtyToAdd = ref<number>(1);

const isReadonly = computed(() => {
  return route.query.mode === 'view';
});

const pageTitle = computed(() => {
  if (route.params.id) {
    return isReadonly.value ? 'Detalles de Alquiler' : 'Editar Reserva';
  }
  return 'Nueva Reserva';
});

const addItemToCart = () => {
  if (!selectedProductToAdd.value || selectedQtyToAdd.value <= 0) return;
  addToCart(selectedProductToAdd.value, selectedQtyToAdd.value);
  selectedProductToAdd.value = null;
  selectedQtyToAdd.value = 1;
};

const onSubMit = handleSubmit(async (values) => {
  const result = await saveReservation(values);
  if (result) {
    router.push({ name: 'reservations' });
  }
});

const goBack = () => {
  router.push({ name: 'reservations' });
};

onMounted(async () => {
  loaderStore.startLoading();
  await loadDependencies();
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
  loaderStore.finishLoading();
});
</script>
