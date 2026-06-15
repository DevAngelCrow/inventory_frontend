<template>
  <AppModal :title="props.modalState.title" :show="props.modalState.show" title-btn-cancel="Cerrar"
    title-btn-confirm="Registrar Inspección" footer-buttons show-icon-close width="55rem" @close-modal="closeModal"
    @confirm-modal="onSubMit" :showBtnConfirmFooter="props.modalState.mode === 'add'">
    
    <div class="flex flex-col gap-5 w-full">
      <!-- Reservation summary banner -->
      <div class="p-4 bg-gray-50 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
        <div>
          <span class="block"><strong>Reserva:</strong> {{ reservation?.reservation_number }}</span>
          <span class="block"><strong>Cliente:</strong> {{ reservation?.mnt_customer?.first_name }} {{ reservation?.mnt_customer?.last_name }}</span>
        </div>
        <div class="text-right">
          <span class="block text-gray-600">Total Alquiler: ${{ Number(reservation?.total || 0).toFixed(2) }}</span>
          <span class="block text-red-600 font-bold">Saldo Pendiente: ${{ Number(reservation?.balance_due || 0).toFixed(2) }}</span>
        </div>
      </div>

      <!-- Inspection Form Fields -->
      <section v-if="props.modalState.mode === 'add'" id="body_modal"
        class="grid grid-cols-1 md:grid-cols-2 gap-5 py-1.5 w-full">
        
        <AppDatePicker class="w-full min-w-0" id="inspection_date" label="Fecha de Inspección*" v-model="inspection_date"
          :error-messages="errors.inspection_date" v-bind="inspectionDateAttrs" />

        <AppSelect class="w-full min-w-0" id="overall_condition" label="Condición General*" v-model="overall_condition"
          :error-messages="errors.overall_condition" v-bind="overallConditionAttrs" :options="conditionOptions"
          optionLabel="name" optionValue="value" />

        <AppInputextArea class="w-full min-w-0 md:col-span-2" id="general_notes" label="Notas Generales de Inspección"
          v-model="general_notes" :error-messages="errors.general_notes" v-bind="generalNotesAttrs" />
      </section>

      <!-- Add Damage Item sub-form (Inline) -->
      <div v-if="props.modalState.mode === 'add'" class="border p-4 rounded-lg bg-gray-50 flex flex-col gap-4">
        <h4 class="font-semibold text-sm border-b pb-1">Agregar Daño / Pérdida de Mobiliario</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AppSelect class="w-full" id="damage_product" label="Artículo de la Reserva" v-model="damageForm.id_product"
            :options="reservationProducts" optionLabel="mnt_product.name" optionValue="id_product" />

          <AppSelect class="w-full" id="damage_type" label="Tipo de Daño" v-model="damageForm.damage_type"
            :options="damageTypeOptions" optionLabel="name" optionValue="value" />

          <AppInputNumber class="w-full" id="damage_qty" label="Cant. Afectada" v-model="damageForm.quantity_affected" />

          <AppInputMoney class="w-full" id="damage_charge" label="Cargo al Cliente" v-model="damageForm.charge_amount" />

          <AppInputText class="w-full md:col-span-2" id="damage_desc" label="Descripción detallada del daño" v-model="damageForm.description" />
        </div>
        <div class="flex justify-end">
          <Button label="Agregar Daño" icon="pi pi-plus" size="small" @click="addDamage" />
        </div>
      </div>

      <!-- Damage items list -->
      <div class="flex flex-col gap-3">
        <h4 class="font-semibold text-base border-b pb-1">Artículos Dañados / Cargos Aplicados</h4>
        <DataTable :value="damageItems" class="p-datatable-sm">
          <Column header="Artículo">
            <template #body="{ data }">
              {{ getProductName(data.id_product) }}
            </template>
          </Column>
          <Column field="damage_type" header="Tipo">
            <template #body="{ data }">
              {{ getDamageTypeLabel(data.damage_type) }}
            </template>
          </Column>
          <Column field="quantity_affected" header="Cant." headerStyle="width: 10%"></Column>
          <Column field="charge_amount" header="Monto Cargo" headerStyle="width: 15%">
            <template #body="{ data }">
              ${{ Number(data.charge_amount).toFixed(2) }}
            </template>
          </Column>
          <Column field="description" header="Descripción"></Column>
          <Column header="Acción" headerStyle="width: 10%" v-if="props.modalState.mode === 'add'">
            <template #body="{ index }">
              <Button icon="pi pi-trash" severity="danger" variant="text" rounded @click="removeDamageItem(index)" />
            </template>
          </Column>
        </DataTable>
        <div v-if="!damageItems.length" class="text-center py-4 text-gray-500 text-sm">
          No se han registrado daños para este alquiler.
        </div>
        <div class="text-right font-bold text-lg text-primary mr-4" v-if="damageItems.length">
          Total Cargos Adicionales: ${{ totalCharges.toFixed(2) }}
        </div>
      </div>
    </div>
  </AppModal>
</template>
<script setup lang="ts">
import { computed, inject, onMounted, reactive, watch } from 'vue';
import { DataTable, Column, Button } from 'primevue';

import AppModal from '@/core/components/AppModal.vue';
import AppInputText from '@/core/components/AppInputText.vue';
import AppInputNumber from '@/core/components/AppInputNumber.vue';
import AppInputMoney from '@/core/components/AppInputMoney.vue';
import AppSelect from '@/core/components/AppSelect.vue';
import AppInputextArea from '@/core/components/AppInputextArea.vue';
import AppDatePicker from '@/core/components/AppDatePicker.vue';
import { useLoaderStore } from '@/core/store';
import { FormatDate } from '@/core/utils/dates';

import { useInspection } from '../composables/useInspection';
import { ReservationResponse, DamageItem } from '../interfaces/reservation.interfaces';

type InspectionType = ReturnType<typeof useInspection>;

const props = defineProps<{
  modalState: {
    show: boolean;
    mode: 'add' | 'view';
    title: string;
  };
  reservation: ReservationResponse | null;
}>();

const emit = defineEmits(['close-modal', 'inspection-registered']);
const inspectionInstance = useInspection();
const { startLoading, finishLoading } = useLoaderStore();

const {
  errors,
  inspection_date,
  general_notes,
  overall_condition,
  damageItems,
  addDamageItem,
  removeDamageItem,
  clearDamageItems,
  totalCharges,
  submitInspection,
  handleSubmit,
  resetForm,
  setFieldValue,
  inspectionDateAttrs,
  overallConditionAttrs,
  generalNotesAttrs,
} = inspectionInstance;

const damageForm = reactive({
  id_product: '',
  damage_type: 'BROKEN',
  quantity_affected: 1,
  charge_amount: 0,
  description: '',
});

const conditionOptions = ref([
  { name: 'Todo en perfecto estado (OK)', value: 'OK' },
  { name: 'Daño Menor', value: 'MINOR_DAMAGE' },
  { name: 'Daño Mayor', value: 'MAJOR_DAMAGE' },
  { name: 'Pérdida Total / Artículo Extraviado', value: 'LOSS' },
]);

const damageTypeOptions = ref([
  { name: 'Mancha', value: 'STAIN' },
  { name: 'Rasgadura', value: 'TEAR' },
  { name: 'Quebrado / Dañado', value: 'BROKEN' },
  { name: 'Extraviado / No Retornado', value: 'MISSING' },
]);

const reservationProducts = computed(() => {
  return props.reservation?.mnt_reservation_item || [];
});

watch(() => props.modalState.show, (newVal) => {
  if (newVal && props.reservation) {
    resetForm();
    clearDamageItems();
    setFieldValue('id_reservation', props.reservation.id);
    setFieldValue('inspection_date', FormatDate(new Date().toISOString(), 'DD/MM/YYYY'));
    setFieldValue('overall_condition', 'OK');
  }
});

const getProductName = (id_product: string) => {
  const item = reservationProducts.value.find((p) => p.id_product === id_product);
  return item?.mnt_product?.name || 'Mobiliario';
};

const getDamageTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    STAIN: 'Mancha',
    TEAR: 'Rasgadura',
    BROKEN: 'Quebrado',
    MISSING: 'Extraviado',
  };
  return map[type] || type;
};

const addDamage = () => {
  if (!damageForm.id_product || damageForm.quantity_affected <= 0 || damageForm.charge_amount < 0) return;
  addDamageItem({
    id_product: damageForm.id_product,
    damage_type: damageForm.damage_type,
    description: damageForm.description || 'Daño reportado',
    quantity_affected: Number(damageForm.quantity_affected),
    charge_amount: Number(damageForm.charge_amount),
  });
  // reset subform
  damageForm.id_product = '';
  damageForm.quantity_affected = 1;
  damageForm.charge_amount = 0;
  damageForm.description = '';
};

const onSubMit = handleSubmit(async (values) => {
  try {
    startLoading();
    const result = await submitInspection(values);
    if (result) {
      emit('inspection-registered');
      emit('close-modal');
    }
  } catch (error) {
    console.error(error);
  } finally {
    finishLoading();
  }
});

const closeModal = () => {
  emit('close-modal');
};
</script>
