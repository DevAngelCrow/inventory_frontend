<template>
  <AppModal :title="props.modalState.title" :show="props.modalState.show" :title-btn-cancel="modalButtons.cancelText"
    :title-btn-confirm="modalButtons.confirmText" footer-buttons show-icon-close width="45rem" @close-modal="closeModal"
    @confirm-modal="onSubMit" :showBtnConfirmFooter="props.modalState.mode !== 'view'">
    <section v-if="props.modalState.mode !== 'delete'" id="body_modal"
      class="flex justify-center items-center flex-wrap flex-row gap-5 py-1.5 w-full">
      <AppInputText class="w-full min-w-0" id="name" label="Nombre*" v-model="name" :error-messages="errors.name"
        v-bind="nameAttrs" :readonly="props.modalState.isReadonly" />
      <AppInputText class="w-full min-w-0" id="description" label="Descripción" v-model="description"
        :error-messages="errors.description" v-bind="descriptionAttrs" :readonly="props.modalState.isReadonly" />
      <AppAutocomplete class="grow" id="country" label="País*" v-model="country" v-bind="countryAttrs"
        :error-messages="errors.country" option-label="name" :suggestions="countriesFiltered" dropdown
        @complete="findAutocomplete" :readonly="props.modalState.isReadonly" />
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

import { useDepartment } from '../../composables/useDepartment';
import { DepartmentForm } from '../../interfaces/deparments/deparment.form.interface';

type DepartmentType = ReturnType<typeof useDepartment>;

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
const department = inject<DepartmentType>('useDepartment')!;
const { startLoading, finishLoading } = useLoaderStore();

const {
  errors,
  name,
  nameAttrs,
  //id, idAttrs,
  description,
  descriptionAttrs,
  country,
  countryAttrs,
  handleSubmit,
  //getCountries,
  countries,
  addDepartment,
  editDepartment,
  toggleDepartment,
} = department;

const countriesFiltered = ref<unknown[]>([]);

const onSubMit = handleSubmit(async values => {
  try {
    startLoading();
    const form: DepartmentForm = {
      name: values?.name,
      description: values?.description,
      id_country: values?.country?.id,
    };
    let success = false;
    switch (props.modalState.mode) {
      case 'add':
        success = (await addDepartment(form)) ? true : false;
        break;
      case 'edit':
        form.id = values.id;
        form.active = values.active;
        success = (await editDepartment(form)) ? true : false;
        break;
      case 'delete':
        success = (await toggleDepartment(values.id)) ? true : false;
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
  for (let i = 0; i < countries.value.length; i++) {
    let item = countries.value[i];

    if (item?.name?.toLowerCase().indexOf(query.toLowerCase()) === 0) {
      _filteredItems.push(item);
    }
  }
  countriesFiltered.value = _filteredItems;
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
