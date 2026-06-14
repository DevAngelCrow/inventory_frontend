<template>
  <div class="w-full flex flex-col justify-start gap-5">
    <section name="title">
      <span class="text-2xl font-extrabold">Información personal</span>
    </section>
    <section name="content" class="w-full gap-3 flex flex-col flex-wrap">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppInputText
          class="grow"
          id="first_name"
          v-model="firstName"
          label="Nombre*"
          :error-messages="errors.firstName"
          v-bind="firstNameAttrs"
          @update:modelValue="
            validationInputAlphanumeric(firstName, 'firstName')
          "
          :readonly="!editMode"
        />
        <AppInputText
          class="grow"
          id="middle_name"
          v-model="middleName"
          label="Segundo nombre"
          :error-messages="errors.middleName"
          v-bind="middleNameAttrs"
          @update:modelValue="
            validationInputAlphanumeric(middleName, 'middleName')
          "
          :readonly="!editMode"
        />
        <AppInputText
          class="grow"
          id="last_name"
          v-model="lastName"
          :error-messages="errors.lastName"
          label="Apellidos*"
          v-bind="lastNameAttrs"
          @update:modelValue="validationInputAlphanumeric(lastName, 'lastName')"
          :readonly="!editMode"
        />
        <AppSelect
          class="grow"
          id="marital_status"
          v-model="maritalStatus"
          :error-messages="errors.maritalStatus"
          label="Estado civil*"
          v-bind="maritalStatusAttrs"
          option-label="name"
          option-value="id"
          :options="maritalStatusesOptions"
          :readonly="!editMode"
        />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppDatePicker
          class="grow"
          id="birthdate"
          v-model="birthDate"
          label="Fecha de nacimiento*"
          :error-messages="errors.birthDate"
          v-bind="birthDateAttrs"
          placeholder="DD/MM/AAAA"
          :max-date="maxDate"
          :readonly="!editMode"
        />
        <AppAutocomplete
          class="grow min-w-42.5"
          input-id="nationalities"
          v-model="nationalities"
          label="Nacionalidades*"
          :error-messages="errors.nationalities"
          v-bind="nationalitiesAttrs"
          option-label="name"
          :options="nationalitiesOptions"
          :suggestions="countriesFiltered"
          dropdown
          multiple
          @complete="findAutocomplete"
          :readonly="!editMode"
        />
        <AppSelect
          class="grow"
          id="gender"
          v-model="gender"
          label="Género*"
          :error-messages="errors.gender"
          v-bind="genderAttrs"
          option-label="name"
          option-value="id"
          :options="gendersOptions"
          :readonly="!editMode"
        />
        <AppInputMask
          class="grow"
          id="phone_number"
          v-model="phoneNumber"
          label="Teléfono*"
          :error-messages="errors.phoneNumber"
          v-bind="phoneNumberAttrs"
          mask="9999-9999"
          placeholder="2222-2222"
          :readonly="!editMode"
        />
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { AutoCompleteCompleteEvent } from 'primevue';
import dayjs from 'dayjs';

import { Country } from '@/modules/catalogs/interfaces/deparments/deparment.country.interface';

import { useAuth } from '../composables/useAuth';

type useAuthType = ReturnType<typeof useAuth>;
const useAuthInstance = inject<useAuthType>('useAuthInstance')!;
const {
  firstName,
  firstNameAttrs,
  middleName,
  middleNameAttrs,
  lastName,
  lastNameAttrs,
  birthDate,
  birthDateAttrs,
  gender,
  genderAttrs,
  maritalStatus,
  maritalStatusAttrs,
  phoneNumber,
  phoneNumberAttrs,
  nationalities,
  nationalitiesAttrs,
  errors,
  nationalitiesOptions,
  gendersOptions,
  maritalStatusesOptions,
  validationInputAlphanumeric,
  editMode,
} = useAuthInstance;

const countriesFiltered = ref<Country[]>([]);

const findAutocomplete = (event: AutoCompleteCompleteEvent) => {
  let query = event?.query;
  let _filteredItems = [];

  for (let i = 0; i < nationalitiesOptions.value.length; i++) {
    let item = nationalitiesOptions.value[i];

    if (item?.name?.toLowerCase().indexOf(query.toLowerCase()) === 0) {
      _filteredItems.push(item);
    }
  }
  countriesFiltered.value = _filteredItems;
};

const maxDate = computed(() => {
  const date = dayjs();
  const limitDate = date.subtract(18, 'years');
  return limitDate.toDate();
});
</script>
