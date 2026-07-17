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
      v-if="props.modalState.mode !== 'delete'"
      id="body_modal"
      class="flex justify-center items-center flex-wrap flex-row gap-5 py-1.5 w-full"
    >
      <AppInputText
        class="w-full min-w-0"
        id="name"
        label="Nombre*"
        v-model="name"
        :error-messages="errors.name"
        v-bind="nameAttrs"
        :readonly="props.modalState.isReadonly"
      />
      <AppInputText
        class="w-full min-w-0"
        id="abbreviation"
        label="Abreviatura*"
        v-model="abbreviation"
        :error-messages="errors.abbreviation"
        v-bind="abbreviationAttrs"
        :readonly="props.modalState.isReadonly"
      />
    </section>
    <section v-else id="body_delete_modal" class="w-full flex flex-wrap gap-5">
      <div class="w-full flex justify-center text-center items-center">
        <span class="text-center flex">{{ props.modalState.description }}</span>
      </div>
    </section>
  </AppModal>
</template>
<script setup lang="ts">
import { computed, inject } from 'vue';

import AppModal from '@/core/components/AppModal.vue';
import AppInputText from '@/core/components/AppInputText.vue';
import { useLoaderStore } from '@/core/store';

import { useMeasurementUnit } from '../composables/useMeasurementUnit';
import { MeasurementUnitForm } from '../interfaces/inventory.interfaces';

type MeasurementUnitType = ReturnType<typeof useMeasurementUnit>;

const props = defineProps<{
  modalState: {
    show: boolean;
    mode: 'closed' | 'add' | 'view' | 'edit' | 'delete';
    title: string;
    description: string;
    isReadonly: boolean;
    selectedItem: null | string;
  };
}>();

const emit = defineEmits(['close-modal']);
const measurementUnitInstance =
  inject<MeasurementUnitType>('useMeasurementUnit')!;
const { startLoading, finishLoading } = useLoaderStore();

const {
  errors,
  name,
  nameAttrs,
  abbreviation,
  abbreviationAttrs,
  handleSubmit,
  addMeasurementUnit,
  editMeasurementUnit,
  patchMeasurementUnit,
} = measurementUnitInstance;

const onSubMit = handleSubmit(async values => {
  try {
    startLoading();
    const form: MeasurementUnitForm = {
      name: values?.name,
      abbreviation: values?.abbreviation,
    };
    let success = false;
    switch (props.modalState.mode) {
      case 'add':
        success = !!(await addMeasurementUnit(form));
        break;
      case 'edit':
        success = !!(await editMeasurementUnit(values as MeasurementUnitForm));
        break;
      case 'delete':
        success = !!(await patchMeasurementUnit(values.id));
        break;
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
      return { confirmText: 'Editar', cancelText: 'Cancelar' };
    case 'delete':
      return { confirmText: 'Aceptar', cancelText: 'Cancelar' };
    case 'view':
      return { confirmText: '', cancelText: 'Cerrar' };
    default:
      return { confirmText: 'Agregar', cancelText: 'Cancelar' };
  }
});
</script>
