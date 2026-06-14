<template>
  <AppModal :title="props.modalState.title" :show="props.modalState.show" :title-btn-cancel="modalButtons.cancelText"
    :title-btn-confirm="modalButtons.confirmText" footer-buttons show-icon-close width="45rem" @close-modal="closeModal"
    @confirm-modal="onSubMit" :showBtnConfirmFooter="props.modalState.mode !== 'view'">
    <section v-if="props.modalState.mode !== 'delete'" id="body_modal"
      class="flex justify-center items-center flex-wrap flex-row gap-5 py-1.5 w-full">
      <AppInputText class="w-full min-w-0" id="name" label="Nombre*" v-model="name" :error-messages="errors.name"
        v-bind="nameAttrs" :readonly="props.modalState.isReadonly" />
      <AppInputText class="w-full min-w-0" id="description" label="Descripción*" v-model="description"
        :error-messages="errors.description" v-bind="descriptionAttrs" :readonly="props.modalState.isReadonly" />
      <AppInputText class="w-full min-w-0" id="code" label="Código*" v-model="code" :error-messages="errors.code"
        v-bind="codeAttrs" :readonly="props.modalState.isReadonly" :disabled="code_status.includes(code) &&
          code_status.includes(category_status?.code) &&
          !props.modalState.isReadonly
          " />
      <AppAutocomplete class="w-full" id="category_status" label="Categoría de estado*" v-model="category_status"
        v-bind="categoryStatusAttrs" :error-messages="errors.category_status" option-label="name"
        :suggestions="categoryStatusFiltered" dropdown @complete="findAutocomplete"
        :readonly="props.modalState.isReadonly" />
      <div class="flex justify-between w-full flex-wrap gap-2">
        <AppColorPicker class="w-auto min-w-0" v-model="state_color" id="state_color"
          :error-messages="errors.state_color" v-bind="stateColorAttrs" label="Color de estado" />
        <AppColorPicker class="w-auto min-w-0" v-model="text_color" id="text_color" :error-messages="errors.text_color"
          v-bind="textColorAttrs" label="Color de texto" />
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
import { computed, inject, ref } from 'vue';
import { AutoCompleteCompleteEvent } from 'primevue';

import AppModal from '@/core/components/AppModal.vue';
import { useLoaderStore } from '@/core/store';
import AppColorPicker from '@/core/components/AppColorPicker.vue';

import { useGlobalStatus } from '../../composables/useGlobalStatus';
import { GlobalStatusForm } from '../../interfaces/global-status/global-status.form.interface';

type GlobalStateType = ReturnType<typeof useGlobalStatus>;

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
const useGlobalStatusComposable = inject<GlobalStateType>('useGlobalStatus')!;
const { startLoading, finishLoading } = useLoaderStore();
const {
  errors,
  name,
  nameAttrs,
  description,
  descriptionAttrs,
  code,
  codeAttrs,
  state_color,
  stateColorAttrs,
  text_color,
  textColorAttrs,
  category_status,
  categoryStatusAttrs,
  handleSubmit,
  addGlobalStatus,
  editGlobalStatus,
  toggleGlobalStatus,
  categoryStatuses,
} = useGlobalStatusComposable;
const categoryStatusFiltered = ref<unknown[]>([]);
const code_status = ['AC', 'INA', 'BL'];
const onSubMit = handleSubmit(async values => {
  try {
    startLoading();
    const form: GlobalStatusForm = {
      name: values?.name,
      description: values?.description,
      code: values?.code,
      state_color: values?.state_color,
      text_color: values?.text_color,
      id_category_status: values?.category_status?.id,
    };
    let success = false;
    switch (props.modalState.mode) {
      case 'add':
        success = (await addGlobalStatus(form)) ? true : false;
        break;
      case 'edit':
        form.id = values.id;
        form.active = values.active;
        success = (await editGlobalStatus(form)) ? true : false;
        break;
      case 'delete':
        success = (await toggleGlobalStatus(values.id)) ? true : false;
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
  for (let i = 0; i < categoryStatuses.value.length; i++) {
    let item = categoryStatuses.value[i];

    if (item?.name?.toLowerCase().indexOf(query.toLowerCase()) === 0) {
      _filteredItems.push(item);
    }
  }
  categoryStatusFiltered.value = _filteredItems;
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
