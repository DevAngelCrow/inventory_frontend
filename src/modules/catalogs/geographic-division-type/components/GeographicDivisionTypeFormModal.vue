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
    @confirm-modal="onSubmit"
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
      <AppInputNumber
        class="w-full min-w-0"
        id="level"
        label="Nivel*"
        v-model="level"
        :error-messages="errors.level"
        v-bind="levelAttrs"
        :readonly="props.modalState.isReadonly"
        :min="1"
      />
      <AppAutocomplete
        class="grow"
        id="country"
        label="País*"
        v-model="country"
        v-bind="countryAttrs"
        :error-messages="errors.country"
        option-label="name"
        :suggestions="countriesFiltered"
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
import { CountryResponse } from '@/modules/catalogs/interfaces/country.response.interface';

import { useGeographicDivisionType } from '../../composables/useGeographicDivisionType';
import { GeographicDivisionTypeForm } from '../../interfaces/geographic-division-type/geographic-division-type.form.interface';

type GeographicDivisionTypeInstance = ReturnType<
  typeof useGeographicDivisionType
>;

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
const divisionTypeInstance = inject<GeographicDivisionTypeInstance>(
  'useGeographicDivisionType',
)!;
const { startLoading, finishLoading } = useLoaderStore();

const {
  errors,
  name,
  nameAttrs,
  level,
  levelAttrs,
  country,
  countryAttrs,
  handleSubmit,
  countries,
  addDivisionType,
  editDivisionType,
  toggleDivisionType,
} = divisionTypeInstance;

const countriesFiltered = ref<CountryResponse[]>([]);

const onSubmit = handleSubmit(async values => {
  try {
    startLoading();
    const form: GeographicDivisionTypeForm = {
      name: values.name,
      level: values.level,
      id_country: values.country?.id,
    };
    let success = false;
    switch (props.modalState.mode) {
      case 'add':
        success = !!(await addDivisionType(form));
        break;
      case 'edit':
        form.id = values.id;
        form.active = values.active;
        success = !!(await editDivisionType(form));
        break;
      case 'delete':
        success = !!(await toggleDivisionType(values.id));
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
  const query = event?.query;
  const filtered: CountryResponse[] = [];
  for (const item of countries.value) {
    if (item?.name?.toLowerCase().indexOf(query.toLowerCase()) === 0) {
      filtered.push(item);
    }
  }
  countriesFiltered.value = filtered;
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
