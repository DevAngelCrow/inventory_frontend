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
        id="description"
        label="Descripción"
        v-model="description"
        :error-messages="errors.description"
        v-bind="descriptionAttrs"
        :readonly="props.modalState.isReadonly"
      />
      <AppAutocomplete
        class="grow"
        id="municipality"
        label="Municipio*"
        v-model="municipality"
        v-bind="municipalityAttrs"
        :error-messages="errors?.municipality"
        option-label="name"
        :suggestions="municipalitiesFiltered"
        dropdown
        @complete="findAutocomplete"
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
import { computed, inject, ref } from 'vue';
import { AutoCompleteCompleteEvent } from 'primevue';

import AppModal from '@/core/components/AppModal.vue';
import { useLoaderStore } from '@/core/store';

import { useDistrict } from '../../composables/useDistrict';
import { DistrictForm } from '../../interfaces/districts/district.form.interface';

type DistrictType = ReturnType<typeof useDistrict>;

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
const district = inject<DistrictType>('useDistrict')!;
const { startLoading, finishLoading } = useLoaderStore();

const {
  errors,
  name,
  nameAttrs,
  //id, idAttrs,
  description,
  descriptionAttrs,
  municipalities,
  handleSubmit,
  municipality,
  municipalityAttrs,
  //getCountries,
  addDistrict,
  editDistrict,
  toggleDistrict,
} = district;

const municipalitiesFiltered = ref<unknown[]>([]);

const onSubMit = handleSubmit(async values => {
  try {
    startLoading();
    const form: DistrictForm = {
      name: values?.name,
      description: values?.description,
      id_municipality: values?.municipality?.id,
    };
    let success = false;
    switch (props.modalState.mode) {
      case 'add':
        success = (await addDistrict(form)) ? true : false;
        break;
      case 'edit':
        form.id = values.id;
        form.active = values.active;
        success = (await editDistrict(form)) ? true : false;
        break;
      case 'delete':
        success = (await toggleDistrict(values.id)) ? true : false;
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

const findAutocomplete = (event: AutoCompleteCompleteEvent) => {
  let query = event?.query;
  let _filteredItems = [];
  for (let i = 0; i < municipalities.value.length; i++) {
    let item = municipalities.value[i];

    if (item?.name?.toLowerCase().indexOf(query.toLowerCase()) === 0) {
      _filteredItems.push(item);
    }
  }
  municipalitiesFiltered.value = _filteredItems;
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
<style scoped></style>
