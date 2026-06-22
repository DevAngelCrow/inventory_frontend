<template>
  <AppModal :title="props.modalState.title" :show="props.modalState.show" :title-btn-cancel="modalButtons.cancelText"
    :title-btn-confirm="modalButtons.confirmText" footer-buttons show-icon-close width="55rem" @close-modal="closeModal"
    @confirm-modal="onSubMit" :showBtnConfirmFooter="props.modalState.mode !== 'view'">
    
    <section v-if="props.modalState.mode !== 'delete'" id="body_modal"
      class="grid grid-cols-1 md:grid-cols-2 gap-5 py-1.5 w-full">
      
      <AppInputText class="w-full min-w-0" id="first_name" label="Nombres*" v-model="first_name" :error-messages="errors.first_name"
        v-bind="firstNameAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0" id="middle_name" label="Segundo Nombre" v-model="middle_name" :error-messages="errors.middle_name"
        v-bind="middleNameAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0" id="last_name" label="Apellidos*" v-model="last_name" :error-messages="errors.last_name"
        v-bind="lastNameAttrs" :readonly="props.modalState.isReadonly" />

      <AppSelect class="w-full min-w-0" id="id_country" label="País*" v-model="id_country" :options="countryOptions"
        optionLabel="name" optionValue="id" :error-messages="errors.id_country" v-bind="idCountryAttrs"
        :readonly="props.modalState.isReadonly" @change="onCountryChange" />

      <AppInputMask class="w-full min-w-0" id="phone" label="Teléfono principal*" v-model="phone" :error-messages="errors.phone"
        v-bind="phoneAttrs" :readonly="props.modalState.isReadonly" :mask="currentPhoneMask" />

      <AppInputMask class="w-full min-w-0" id="phone_secondary" label="Teléfono secundario" v-model="phone_secondary" :error-messages="errors.phone_secondary"
        v-bind="phoneSecondaryAttrs" :readonly="props.modalState.isReadonly" :mask="currentPhoneMask" />

      <AppInputText class="w-full min-w-0" id="email" label="Email" v-model="email" :error-messages="errors.email"
        v-bind="emailAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0" id="company_name" label="Nombre de Empresa" v-model="company_name" :error-messages="errors.company_name"
        v-bind="companyNameAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0" id="tax_id" label="Registro Fiscal (EIN/DUI/NIT)" v-model="tax_id" :error-messages="errors.tax_id"
        v-bind="taxIdAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputextArea class="w-full min-w-0 md:col-span-2" id="notes" label="Notas Adicionales del Cliente" v-model="notes"
        :error-messages="errors.notes" v-bind="notesAttrs" :readonly="props.modalState.isReadonly" />

      <!-- Addresses Section -->
      <div class="col-span-1 md:col-span-2 mt-4 border-t pt-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Direcciones</h3>
          <button v-if="!props.modalState.isReadonly" type="button" @click="addNewAddress" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
            + Agregar Dirección
          </button>
        </div>

        <div v-for="(address, idx) in addresses" :key="address.key" class="border border-gray-300 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          <button v-if="!props.modalState.isReadonly && addresses.length > 1" type="button" @click="removeAddress(idx)" class="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold" title="Eliminar">
             &times;
          </button>

          <AppInputText class="w-full min-w-0 md:col-span-2" :id="`label_${idx}`" label="Etiqueta (Ej. Casa, Trabajo)*" v-model="address.value.label" 
            :error-messages="errors[`addresses[${idx}].label`]" :readonly="props.modalState.isReadonly" />

          <AppInputText class="w-full min-w-0 md:col-span-2" :id="`address_line1_${idx}`" label="Dirección Línea 1*" v-model="address.value.address_line1" 
            :error-messages="errors[`addresses[${idx}].address_line1`]" :readonly="props.modalState.isReadonly" />

          <AppInputText class="w-full min-w-0 md:col-span-2" :id="`address_line2_${idx}`" label="Dirección Línea 2" v-model="address.value.address_line2" 
            :error-messages="errors[`addresses[${idx}].address_line2`]" :readonly="props.modalState.isReadonly" />

          <AppGeographicCascade class="w-full min-w-0 md:col-span-2" :id="`state_${idx}`" v-model="address.value.id_geographic_division" 
            :id_country="id_country as string" :error-messages="errors[`addresses[${idx}].id_geographic_division`]" 
            :readonly="props.modalState.isReadonly || !id_country" :isRequired="true" />

          <AppInputText class="w-full min-w-0" :id="`zip_code_${idx}`" label="Código Postal" v-model="address.value.zip_code" 
            :error-messages="errors[`addresses[${idx}].zip_code`]" :readonly="props.modalState.isReadonly" />
          
          <div class="flex items-center md:col-span-2">
            <AppCheckBox :id="`is_primary_${idx}`" label="Dirección Principal" v-model="address.value.is_primary" :disabled="props.modalState.isReadonly" @change="setPrimary(idx)" />
          </div>
        </div>
        <div v-if="!addresses.length" class="text-sm text-gray-500 italic">No hay direcciones registradas.</div>
      </div>
    </section>

    <section v-else id="body_delete_modal" class="w-full flex flex-wrap gap-5">
      <div class="w-full flex justify-center text-center items-center">
        <span class="text-center flex">{{ props.modalState.description }}</span>
      </div>
    </section>
  </AppModal>
</template>
<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue';

import AppModal from '@/core/components/AppModal.vue';
import AppInputText from '@/core/components/AppInputText.vue';
import AppInputextArea from '@/core/components/AppInputextArea.vue';
import AppSelect from '@/core/components/AppSelect.vue';
import AppGeographicCascade from '@/core/components/AppGeographicCascade.vue';
import AppInputMask from '@/core/components/AppInputMask.vue';
import AppCheckBox from '@/core/components/AppCheckBox.vue';
import { useLoaderStore } from '@/core/store';

import { useCustomer } from '../composables/useCustomer';
import { CustomerForm, CustomerAddressForm } from '../interfaces/customer.interfaces';
import { useCountries } from '@/modules/catalogs/composables/useCountries';
import { useGeographicDivision } from '@/modules/catalogs/composables/useGeographicDivision';
import { CountryResponse } from '@/modules/catalogs/interfaces/country.response.interface';

type CustomerType = ReturnType<typeof useCustomer>;

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
const customerInstance = inject<CustomerType>('useCustomer')!;
const { startLoading, finishLoading } = useLoaderStore();

const {
  errors,
  first_name,
  firstNameAttrs,
  middle_name,
  middleNameAttrs,
  last_name,
  lastNameAttrs,
  email,
  emailAttrs,
  phone,
  phoneAttrs,
  phone_secondary,
  phoneSecondaryAttrs,
  company_name,
  companyNameAttrs,
  tax_id,
  taxIdAttrs,
  notes,
  notesAttrs,
  id_country,
  idCountryAttrs,
  addresses,
  pushAddress,
  removeAddress,
  handleSubmit,
  addCustomer,
  editCustomer,
  patchCustomer,
} = customerInstance;

const { getCountries } = useCountries();
const { } = useGeographicDivision();
const countryOptions = ref<CountryResponse[]>([]);

const loadCountries = async () => {
  const result = await getCountries();
  if (result) {
    countryOptions.value = result;
  }
};


onMounted(async () => {
  await loadCountries();
});

watch(
  () => props.modalState.show,
  async (newVal) => {
    if (newVal) {
      if (props.modalState.mode === 'add' && addresses.value.length === 0) {
        addNewAddress();
      }
    }
  }
);



const onCountryChange = () => {
  addresses.value.forEach(addr => {
    addr.value.id_geographic_division = undefined;
  });
};

const currentPhoneMask = computed(() => {
  const country = countryOptions.value.find(c => c.id === id_country.value);
  if (country?.iso2 === 'US') {
    return '(999) 999-9999';
  } else if (country?.iso2 === 'SV') {
    return '9999-9999';
  }
  return '99999999999999999999'; // Default no specific mask
});

const addNewAddress = () => {
  const newAddr: CustomerAddressForm = {
    label: '',
    address_line1: '',
    address_line2: '',
    zip_code: '',
    is_primary: addresses.value.length === 0,
    id_geographic_division: undefined,
  };
  pushAddress(newAddr);
};

const setPrimary = (selectedIndex: number) => {
  if (!addresses.value[selectedIndex].value.is_primary) {
    return; // Cannot uncheck the only primary, must check another one
  }
  addresses.value.forEach((addr, idx) => {
    if (idx !== selectedIndex) {
      addr.value.is_primary = false;
    }
  });
};

const onSubMit = handleSubmit(async values => {
  try {
    startLoading();
    const form: CustomerForm = {
      first_name: values.first_name,
      middle_name: values.middle_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone,
      phone_secondary: values.phone_secondary,
      company_name: values.company_name,
      tax_id: values.tax_id,
      notes: values.notes,
      id_country: values.id_country,
      addresses: values.addresses || [],
    };
    let success = false;
    switch (props.modalState.mode) {
      case 'add':
        success = !!(await addCustomer(form));
        break;
      case 'edit':
        form.id = values.id;
        form.active = values.active;
        success = !!(await editCustomer(form));
        break;
      case 'delete':
        success = !!(await patchCustomer(values.id));
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
