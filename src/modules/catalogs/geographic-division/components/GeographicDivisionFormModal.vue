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
        id="country"
        label="País*"
        v-model="country"
        v-bind="countryAttrs"
        :error-messages="errors.country"
        option-label="name"
        :suggestions="countriesFiltered"
        dropdown
        @complete="findCountry"
        :readonly="props.modalState.isReadonly"
        @update:modelValue="onCountryChange"
      />
      <AppAutocomplete
        class="grow"
        id="divisionType"
        label="Tipo de División*"
        v-model="divisionType"
        v-bind="divisionTypeAttrs"
        :error-messages="errors.divisionType"
        option-label="name"
        :suggestions="divisionTypesFiltered"
        dropdown
        @complete="findDivisionType"
        :readonly="props.modalState.isReadonly"
        :disabled="divisionTypeLoading || !country"
      />
      <AppAutocomplete
        class="grow"
        id="parent"
        label="División Padre"
        v-model="parent"
        v-bind="parentAttrs"
        :error-messages="errors.parent"
        option-label="name"
        :suggestions="parentsFiltered"
        dropdown
        @complete="findParent"
        :readonly="props.modalState.isReadonly"
        :disabled="parentLoading || !country"
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
import { GeographicDivisionTypeSimple } from '@/modules/catalogs/interfaces/geographic-division/geographic-division.type.interface';
import { GeographicDivisionParent } from '@/modules/catalogs/interfaces/geographic-division/geographic-division.parent.interface';

import { useGeographicDivision } from '../../composables/useGeographicDivision';
import { GeographicDivisionForm } from '../../interfaces/geographic-division/geographic-division.form.interface';

type GeographicDivisionInstance = ReturnType<typeof useGeographicDivision>;

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
const divisionInstance = inject<GeographicDivisionInstance>(
  'useGeographicDivision',
)!;
const { startLoading, finishLoading } = useLoaderStore();

const {
  errors,
  name,
  nameAttrs,
  description,
  descriptionAttrs,
  country,
  countryAttrs,
  divisionType,
  divisionTypeAttrs,
  parent,
  parentAttrs,
  handleSubmit,
  countries,
  divisionTypesList,
  parentDivisionsList,
  addDivision,
  editDivision,
  toggleDivision,
} = divisionInstance;

const countriesFiltered = ref<CountryResponse[]>([]);
const divisionTypesFiltered = ref<GeographicDivisionTypeSimple[]>([]);
const parentsFiltered = ref<GeographicDivisionParent[]>([]);
const divisionTypeLoading = ref(false);
const parentLoading = ref(false);

const onSubmit = handleSubmit(async values => {
  try {
    startLoading();
    const form: GeographicDivisionForm = {
      name: values.name,
      description: values.description ?? '',
      id_country: values.country?.id,
      id_type: values.divisionType?.id,
      id_parent: values.parent?.id ?? null,
    };
    let success = false;
    switch (props.modalState.mode) {
      case 'add':
        success = !!(await addDivision(form));
        break;
      case 'edit':
        form.id = values.id;
        form.active = values.active;
        success = !!(await editDivision(form));
        break;
      case 'delete':
        success = !!(await toggleDivision(values.id));
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

const findCountry = (event: AutoCompleteCompleteEvent) => {
  const query = event?.query.toLowerCase();
  const filtered: CountryResponse[] = [];
  for (const item of countries.value) {
    if (item?.name?.toLowerCase().indexOf(query) === 0) {
      filtered.push(item);
    }
  }
  countriesFiltered.value = filtered;
};

const findDivisionType = (event: AutoCompleteCompleteEvent) => {
  const query = event?.query.toLowerCase();
  const filtered: GeographicDivisionTypeSimple[] = [];
  for (const item of divisionTypesList.value) {
    if (
      item?.id_country === country.value?.id &&
      item?.name?.toLowerCase().indexOf(query) === 0
    ) {
      filtered.push(item);
    }
  }
  divisionTypesFiltered.value = filtered;
};

const findParent = (event: AutoCompleteCompleteEvent) => {
  const query = event?.query.toLowerCase();
  const filtered: GeographicDivisionParent[] = [];
  for (const item of parentDivisionsList.value) {
    if (
      item?.id_country === country.value?.id &&
      item?.name?.toLowerCase().indexOf(query) === 0
    ) {
      filtered.push(item);
    }
  }
  parentsFiltered.value = filtered;
};

const onCountryChange = async (selectedCountry: CountryResponse | null) => {
  // Limpiar selección actual de tipo y padre
  divisionType.value = null;
  parent.value = null;
  divisionTypesFiltered.value = [];
  parentsFiltered.value = [];
  if (!selectedCountry) {
    return;
  }
  divisionTypeLoading.value = true;
  parentLoading.value = true;
  try {
    // Cargar tipos de división filtrados por país
    await divisionInstance.getDivisionTypesList({
      id_country: selectedCountry.id,
    });
    divisionTypesFiltered.value = divisionTypesList.value.filter(
      item => item.id_country === selectedCountry.id,
    );
    // Cargar divisiones padre filtradas por país
    await divisionInstance.getParentDivisionsList({
      id_country: selectedCountry.id,
    });
    parentsFiltered.value = parentDivisionsList.value.filter(
      item => item.id_country === selectedCountry.id,
    );
  } finally {
    divisionTypeLoading.value = false;
    parentLoading.value = false;
  }
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
