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
        <AppCard class="lg:col-span-2">
          <template #title>
            <h3>Detalles del Evento y Entrega</h3>
          </template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppSelect class="w-full" id="id_customer" label="Cliente*" v-model="id_customer"
                :error-messages="errors.id_customer" v-bind="idCustomerAttrs" :options="customersList"
                optionLabel="first_name" optionValue="id" :readonly="isReadonly" />

              <div class="md:col-span-2 flex flex-col gap-4 mt-2 mb-2 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                <h4 class="font-semibold text-lg text-surface-900 dark:text-surface-0">Dirección de Entrega</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AppSelect class="w-full md:col-span-2" id="id_customer_address" label="Rellenar con dirección guardada del cliente" v-model="id_customer_address" :error-messages="errors.id_customer_address" v-bind="idCustomerAddressAttrs" :options="customerAddresses" optionLabel="label" optionValue="id" :readonly="isReadonly" @change="onCustomerAddressChange" />

                  <AppInputText class="w-full" id="delivery_address" label="Dirección Línea 1" v-model="delivery_address" :error-messages="errors.delivery_address" v-bind="deliveryAddressAttrs" :readonly="isReadonly" />
                  <AppInputText class="w-full" id="delivery_address_line2" label="Dirección Línea 2" v-model="delivery_address_line2" :error-messages="errors.delivery_address_line2" v-bind="deliveryAddressLine2Attrs" :readonly="isReadonly" />
                  
                  <AppSelect class="w-full" id="id_geographic_division" label="Estado / Departamento" v-model="id_geographic_division" :error-messages="errors.id_geographic_division" v-bind="idGeographicDivisionAttrs" :options="geographicDivisions" optionLabel="name" optionValue="id" :readonly="isReadonly" />
                  <AppInputText class="w-full" id="delivery_zip" label="Código Postal" v-model="delivery_zip" :error-messages="errors.delivery_zip" v-bind="deliveryZipAttrs" :readonly="isReadonly" />
                  
                  <AppInputextArea class="w-full md:col-span-2" id="delivery_notes" label="Notas de Entrega" v-model="delivery_notes" :error-messages="errors.delivery_notes" v-bind="deliveryNotesAttrs" :readonly="isReadonly" />
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
                <div class="flex justify-between border-b pb-2">
                  <span>Impuestos (13% IVA):</span>
                  <span class="font-semibold">${{ cartTaxAmount.toFixed(2) }}</span>
                </div>

                <AppInputMoney class="w-full" id="delivery_fee" label="Costo de Envío" v-model="delivery_fee"
                  :error-messages="errors.delivery_fee" v-bind="deliveryFeeAttrs" :readonly="isReadonly" />

                <AppInputMoney class="w-full" id="discount_amount" label="Descuento Aplicado" v-model="discount_amount"
                  :error-messages="errors.discount_amount" v-bind="discountAmountAttrs" :readonly="isReadonly" />

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
          </AppCard>
        </div>

        <!-- Selected Products Basket (Full Width Below) -->
        <AppCard class="lg:col-span-3">
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
        </AppCard>
      </form>
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button, DataTable, Column } from 'primevue';
import { ProductResponse } from '../../inventory/interfaces/inventory.interfaces';

import AppTitle from '@/core/components/AppTitle.vue';
import AppCard from '@/core/components/AppCard.vue';
import AppInputText from '@/core/components/AppInputText.vue';
import AppInputNumber from '@/core/components/AppInputNumber.vue';
import AppInputMoney from '@/core/components/AppInputMoney.vue';
import AppSelect from '@/core/components/AppSelect.vue';
import AppInputextArea from '@/core/components/AppInputextArea.vue';
import AppDatePicker from '@/core/components/AppDatePicker.vue';
import { useLoaderStore } from '@/core/store';
import { useGeographicDivision } from '@/modules/catalogs/composables/useGeographicDivision';

import { useReservation } from '../composables/useReservation';
import reservationServices from '../Services/reservation.services';

const route = useRoute();
const router = useRouter();
const loaderStore = useLoaderStore();

const reservationInstance = useReservation();
provide('useReservation', reservationInstance);

const {
  errors,
  id_customer, idCustomerAttrs,
  event_start, eventStartAttrs,
  event_end, eventEndAttrs,
  delivery_address, deliveryAddressAttrs,
  delivery_address_line2, deliveryAddressLine2Attrs,
  delivery_zip, deliveryZipAttrs,
  delivery_notes, deliveryNotesAttrs,
  id_customer_address, idCustomerAddressAttrs,
  id_geographic_division, idGeographicDivisionAttrs,
  discount_amount, discountAmountAttrs,
  delivery_fee, deliveryFeeAttrs,
  deposit_amount, depositAmountAttrs,
  notes, notesAttrs,
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

const selectedProductToAdd = ref<ProductResponse>();
const selectedQtyToAdd = ref<number>(1);

const { getDivisions, filter: geoFilter, divisions: geographicDivisions } = useGeographicDivision();

const customerAddresses = computed(() => {
  if (!id_customer.value) return [];
  const customer = customersList.value.find((c: any) => c.id === id_customer.value);
  return customer?.addresses || [];
});

watch(id_customer, async (newVal) => {
  if (newVal) {
    const customer = customersList.value.find((c: any) => c.id === newVal);
    if (customer && customer.id_country) {
      geoFilter.id_country = customer.id_country;
      geoFilter.status = true;
      await getDivisions();
    } else {
      geographicDivisions.value = [];
    }
  } else {
    geographicDivisions.value = [];
  }
});

const onCustomerAddressChange = () => {
  if (!id_customer_address.value) return;
  const selectedAddr = customerAddresses.value.find((a: any) => a.id === id_customer_address.value);
  if (selectedAddr) {
    delivery_address.value = selectedAddr.address_line1;
    delivery_address_line2.value = selectedAddr.address_line2;
    id_geographic_division.value = selectedAddr.id_geographic_division;
    delivery_zip.value = selectedAddr.zip_code;
  }
};

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
  selectedProductToAdd.value = undefined;
  selectedQtyToAdd.value = 1;
};

const onSubMit = handleSubmit(async (values) => {
  const result = await saveReservation(values as any);
  if (result) {
    router.push({ name: 'reservations-list' });
  }
});

const goBack = () => {
  router.push({ name: 'reservations-list' });
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
