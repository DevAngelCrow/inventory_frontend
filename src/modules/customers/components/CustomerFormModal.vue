<template>
  <AppModal :title="props.modalState.title" :show="props.modalState.show" :title-btn-cancel="modalButtons.cancelText"
    :title-btn-confirm="modalButtons.confirmText" footer-buttons show-icon-close width="55rem" @close-modal="closeModal"
    @confirm-modal="onSubMit" :showBtnConfirmFooter="props.modalState.mode !== 'view'">
    
    <section v-if="props.modalState.mode !== 'delete'" id="body_modal"
      class="grid grid-cols-1 md:grid-cols-2 gap-5 py-1.5 w-full">
      
      <AppInputText class="w-full min-w-0" id="first_name" label="Nombres*" v-model="first_name" :error-messages="errors.first_name"
        v-bind="firstNameAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0" id="last_name" label="Apellidos*" v-model="last_name" :error-messages="errors.last_name"
        v-bind="lastNameAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0" id="phone" label="Teléfono principal*" v-model="phone" :error-messages="errors.phone"
        v-bind="phoneAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0" id="phone_secondary" label="Teléfono secundario" v-model="phone_secondary" :error-messages="errors.phone_secondary"
        v-bind="phoneSecondaryAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0" id="email" label="Email" v-model="email" :error-messages="errors.email"
        v-bind="emailAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0" id="company_name" label="Nombre de Empresa" v-model="company_name" :error-messages="errors.company_name"
        v-bind="companyNameAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0" id="tax_id" label="Registro Fiscal (EIN/DUI/NIT)" v-model="tax_id" :error-messages="errors.tax_id"
        v-bind="taxIdAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0" id="zip_code" label="Código Postal" v-model="zip_code" :error-messages="errors.zip_code"
        v-bind="zipCodeAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0 md:col-span-2" id="address_line1" label="Dirección Línea 1" v-model="address_line1" :error-messages="errors.address_line1"
        v-bind="addressLine1Attrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0 md:col-span-2" id="address_line2" label="Dirección Línea 2" v-model="address_line2" :error-messages="errors.address_line2"
        v-bind="addressLine2Attrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0" id="city" label="Ciudad" v-model="city" :error-messages="errors.city"
        v-bind="cityAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0" id="state" label="Estado / Departamento" v-model="state" :error-messages="errors.state"
        v-bind="stateAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputextArea class="w-full min-w-0 md:col-span-2" id="notes" label="Notas Adicionales del Cliente" v-model="notes"
        :error-messages="errors.notes" v-bind="notesAttrs" :readonly="props.modalState.isReadonly" />
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
import AppInputextArea from '@/core/components/AppInputextArea.vue';
import { useLoaderStore } from '@/core/store';

import { useCustomer } from '../composables/useCustomer';
import { CustomerForm } from '../interfaces/customer.interfaces';

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
  address_line1,
  addressLine1Attrs,
  address_line2,
  addressLine2Attrs,
  city,
  cityAttrs,
  state,
  stateAttrs,
  zip_code,
  zipCodeAttrs,
  notes,
  notesAttrs,
  handleSubmit,
  addCustomer,
  editCustomer,
  patchCustomer,
} = customerInstance;

const onSubMit = handleSubmit(async values => {
  try {
    startLoading();
    const form: CustomerForm = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone,
      phone_secondary: values.phone_secondary,
      company_name: values.company_name,
      tax_id: values.tax_id,
      address_line1: values.address_line1,
      address_line2: values.address_line2,
      city: values.city,
      state: values.state,
      zip_code: values.zip_code,
      notes: values.notes,
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
