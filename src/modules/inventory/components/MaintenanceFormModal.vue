<template>
  <AppModal
    :title="props.modalState.title"
    :show="props.modalState.show"
    :title-btn-cancel="modalButtons.cancelText"
    :title-btn-confirm="modalButtons.confirmText"
    footer-buttons
    show-icon-close
    width="45rem"
    @close-modal="closeModal"
    @confirm-modal="onSubMit"
    :showBtnConfirmFooter="props.modalState.mode !== 'view'"
  >
    <section
      id="body_modal"
      class="flex justify-center items-center flex-wrap flex-row gap-5 py-1.5 w-full"
    >
      <AppSelect
        class="w-full min-w-0"
        id="id_product"
        label="Producto*"
        v-model="id_product"
        :error-messages="errors.id_product"
        v-bind="idProductAttrs"
        :options="productsList"
        optionLabel="name"
        optionValue="id"
        :readonly="
          props.modalState.mode === 'edit' || props.modalState.isReadonly
        "
      />

      <AppInputNumber
        class="w-full min-w-0"
        id="quantity"
        label="Cantidad de Unidades*"
        v-model="quantity"
        :error-messages="errors.quantity"
        v-bind="quantityAttrs"
        :readonly="props.modalState.isReadonly"
      />

      <AppInputMoney
        class="w-full min-w-0"
        id="cost"
        label="Costo de Reparación"
        v-model="cost"
        :error-messages="errors.cost"
        v-bind="costAttrs"
        :readonly="props.modalState.isReadonly"
      />

      <AppDatePicker
        class="w-full min-w-0"
        id="date_start"
        label="Fecha de Inicio*"
        v-model="date_start"
        :error-messages="errors.date_start"
        v-bind="dateStartAttrs"
        :readonly="props.modalState.isReadonly"
      />

      <AppDatePicker
        class="w-full min-w-0"
        id="date_end"
        label="Fecha de Resolución"
        v-model="date_end"
        :error-messages="errors.date_end"
        v-bind="dateEndAttrs"
        :readonly="props.modalState.isReadonly"
      />

      <div
        class="w-full flex justify-start items-center py-2"
        v-if="props.modalState.mode === 'edit' || props.modalState.isReadonly"
      >
        <AppCheckBox
          id="resolved"
          label="Mantenimiento Resuelto / Completado"
          v-model="resolved"
          :error-messages="errors.resolved"
          v-bind="resolvedAttrs"
          :disabled="props.modalState.isReadonly"
        />
      </div>

      <AppInputextArea
        class="w-full min-w-0"
        id="description"
        label="Descripción de Falla / Mantenimiento*"
        v-model="description"
        :error-messages="errors.description"
        v-bind="descriptionAttrs"
        :readonly="props.modalState.isReadonly"
      />
    </section>
  </AppModal>
</template>
<script setup lang="ts">
import { computed, inject } from 'vue';

import AppModal from '@/core/components/AppModal.vue';
import AppSelect from '@/core/components/AppSelect.vue';
import AppInputNumber from '@/core/components/AppInputNumber.vue';
import AppInputMoney from '@/core/components/AppInputMoney.vue';
import AppDatePicker from '@/core/components/AppDatePicker.vue';
import AppCheckBox from '@/core/components/AppCheckBox.vue';
import AppInputextArea from '@/core/components/AppInputextArea.vue';
import { useLoaderStore } from '@/core/store';
import { FormatDateToISO } from '@/core/utils/dates';

import { useMaintenance } from '../composables/useMaintenance';
import { ProductMaintenanceForm } from '../interfaces/inventory.interfaces';

type MaintenanceType = ReturnType<typeof useMaintenance>;

const props = defineProps<{
  modalState: {
    show: boolean;
    mode: 'closed' | 'add' | 'view' | 'edit';
    title: string;
    description: string;
    isReadonly: boolean;
    selectedItem: null | string;
  };
}>();

const emit = defineEmits(['close-modal']);
const maintenanceInstance = inject<MaintenanceType>('useMaintenance')!;
const { startLoading, finishLoading } = useLoaderStore();

const {
  errors,
  description,
  descriptionAttrs,
  cost,
  costAttrs,
  quantity,
  quantityAttrs,
  date_start,
  dateStartAttrs,
  date_end,
  dateEndAttrs,
  resolved,
  resolvedAttrs,
  id_product,
  idProductAttrs,
  productsList,
  handleSubmit,
  addMaintenance,
  editMaintenance,
} = maintenanceInstance;

const onSubMit = handleSubmit(async values => {
  try {
    startLoading();

    // Convert date string formatted from AppDatePicker (DD/MM/YYYY) to ISO string for backend
    const startIso = FormatDateToISO(values.date_start, 'DD/MM/YYYY') || '';
    const endIso = values.date_end
      ? FormatDateToISO(values.date_end, 'DD/MM/YYYY') || undefined
      : undefined;

    const form: ProductMaintenanceForm = {
      description: values.description,
      cost: values.cost ? Number(values.cost) : undefined,
      quantity: Number(values.quantity),
      date_start: startIso,
      date_end: endIso,
      resolved: !!values.resolved,
      id_product: values.id_product,
    };

    let success = false;
    if (props.modalState.mode === 'add') {
      success = !!(await addMaintenance(form));
    } else if (props.modalState.mode === 'edit') {
      form.id = values.id;
      success = !!(await editMaintenance(form));
    }

    if (success) {
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

const modalButtons = computed(() => {
  switch (props.modalState.mode) {
    case 'edit':
      return { confirmText: 'Guardar', cancelText: 'Cancelar' };
    case 'view':
      return { confirmText: '', cancelText: 'Cerrar' };
    default:
      return { confirmText: 'Registrar', cancelText: 'Cancelar' };
  }
});
</script>
