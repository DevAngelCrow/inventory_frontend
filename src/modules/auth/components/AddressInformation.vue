<template>
  <div class="w-full flex flex-col justify-start gap-5">
    <section name="title">
      <span class="text-2xl font-extrabold">Información de ubicación</span>
    </section>
    <section name="content" class="w-full gap-3 flex flex-col flex-wrap">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AppAutocomplete
          v-model="country"
          class="flex-1"
          label="País*"
          id="countries"
          v-bind="countryAttrs"
          :error-messages="errors.country"
          option-label="name"
          :suggestions="countriesFiltered"
          :options="countriesOptions"
          dropdown
          @complete="findAutocompleteCountries"
          @change="wrappedGetGeographicalDivisionsTypesByCountry"
          :readonly="!editMode"
        />
        <AppGeographicCascade
          class="col-span-1 sm:col-span-2 xl:col-span-3"
          :id_country="country?.id"
          :modelValue="geographic_divisions?.id || geographic_divisions"
          @update:modelValue="val => geographic_divisions = { id: val }"
          :readonly="!editMode"
          :error-messages="errors.geographic_divisions"
          :isRequired="true"
        />
        <AppInputText
          v-model="street"
          class="flex-1"
          label="Calle*"
          id="street"
          v-bind="streetAttrs"
          :error-messages="errors.street"
          @update:modelValue="validationInputAlphanumeric(street, 'street')"
          :readonly="!editMode"
        />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AppInputText
          v-model="streetNumber"
          class="flex-1"
          label="No. de calle*"
          id="street_number"
          v-bind="streetNumberAttrs"
          :error-messages="errors.streetNumber"
          @update:modelValue="
            validationInputAlphanumeric(streetNumber, 'streetNumber')
          "
          :readonly="!editMode"
        />
        <AppInputText
          v-model="houseNumber"
          class="flex-1"
          label="No. de casa*"
          id="house_number"
          v-bind="houseNumberAttrs"
          :error-messages="errors.houseNumber"
          @update:modelValue="
            validationInputAlphanumeric(houseNumber, 'houseNumber')
          "
          :readonly="!editMode"
        />
        <AppInputText
          v-model="neighborhood"
          class="flex-1"
          label="Colonia/Reparto*"
          id="neighborhood"
          v-bind="neighborhoodAttrs"
          :error-messages="errors.neighborhood"
          @update:modelValue="
            validationInputAlphanumeric(neighborhood, 'neighborhood')
          "
          :readonly="!editMode"
        />
        <AppInputText
          v-model="block"
          class="flex-1"
          label="Block*"
          id="block"
          v-bind="blockAttrs"
          :error-messages="errors.block"
          @update:modelValue="
            validationInputAlphanumeric(streetNumber, 'streetNumber')
          "
          :readonly="!editMode"
        />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppInputText
          v-model="pathway"
          class="flex-1"
          label="Pasaje"
          id="pathway"
          v-bind="pathwayAttrs"
          :error-messages="errors.pathway"
          @update:modelValue="validationInputAlphanumeric(pathway, 'pathway')"
          :readonly="!editMode"
        />
        <div class="flex items-center gap-2 flex-1">
          <Checkbox
            v-model="current"
            id="current"
            binary
            name="Actual"
            value="Actual"
            input-id="actual"
            v-bind="currentAttrs"
            :error-messages="errors.current"
            :readonly="!editMode"
          />
          <label for="actual">Actual</label>
        </div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import {
  AutoCompleteChangeEvent,
  AutoCompleteCompleteEvent,
  Checkbox,
} from 'primevue';
import AppGeographicCascade from '@/core/components/AppGeographicCascade.vue';

import { Country } from '@/core/services/interfaces/auth/country.interface';
import { GeographicDivisionResponse } from '@/modules/catalogs/interfaces/geographic-division/geographic-division.response.interface';
import { GeographicDivisionTypeResponse } from '@/modules/catalogs/interfaces/geographic-division-type/geographic-division-type.response.interface';

import { useAuth } from '../composables/useAuth';
type useAuthType = ReturnType<typeof useAuth>;
const useAuthInstance = inject<useAuthType>('useAuthInstance')!;
const {
  street,
  streetAttrs,
  streetNumber,
  streetNumberAttrs,
  neighborhood,
  neighborhoodAttrs,
  geographic_divisions,
  geographicDivisionsAttrs,
  houseNumber,
  houseNumberAttrs,
  block,
  blockAttrs,
  pathway,
  pathwayAttrs,
  current,
  currentAttrs,
  country,
  countryAttrs,
  errors,
  geographicDivisionsOptions,
  countriesOptions,
  validationInputAlphanumeric,
  getGeographicalDivisions,
  form,
  editMode,
} = useAuthInstance;

const geographicDivisionsFiltered = ref<GeographicDivisionResponse[]>([]);
const countriesFiltered = ref<Country[]>([]);

const findAutocomplete = (event: AutoCompleteCompleteEvent) => {
  const query = event?.query;
  const filtered: GeographicDivisionResponse[] = [];
  for (const item of geographicDivisionsOptions.value) {
    if (item?.name?.toLowerCase().indexOf(query.toLowerCase()) === 0) {
      filtered.push(item);
    }
  }
  geographicDivisionsFiltered.value = filtered;
};


const findAutocompleteCountries = (event: AutoCompleteCompleteEvent) => {
  let query = event?.query;
  let _filteredItems = [];

  for (let i = 0; i < countriesOptions.value.length; i++) {
    let item = countriesOptions.value[i];

    if (item?.name?.toLowerCase().indexOf(query.toLowerCase()) === 0) {
      _filteredItems.push(item);
    }
  }
  countriesFiltered.value = _filteredItems;
};

const wrappedGetGeographicalDivisions = async (
  event: AutoCompleteChangeEvent,
) => {
  const params = event?.value.id as string;
  await getGeographicalDivisions(params);
};
const wrappedGetGeographicalDivisionsTypesByCountry = async (
  event: AutoCompleteChangeEvent,
) => {
  try {
    form.resetField('geographic_divisions');
    geographicDivisionsOptions.value = [];
    const params = event.value.id as string;
    // getGeographicalDivisionsTypes ya no es necesario
  } catch (error) {
    console.error(error);
  }
};


watch(editMode, async newValue => {
  if (newValue) {
    // Si queremos cargar algo extra
  }
});
</script>
