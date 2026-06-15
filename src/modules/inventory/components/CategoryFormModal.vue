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
      <AppInputText class="w-full min-w-0" id="icon" label="Icono (ej: pi pi-tag)" v-model="icon"
        :error-messages="errors.icon" v-bind="iconAttrs" :readonly="props.modalState.isReadonly" />
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

import { useProductCategory } from '../composables/useProductCategory';
import { ProductCategoryForm } from '../interfaces/inventory.interfaces';

type CategoryType = ReturnType<typeof useProductCategory>;

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
const categoryInstance = inject<CategoryType>('useProductCategory')!;
const { startLoading, finishLoading } = useLoaderStore();

const {
  errors,
  name,
  nameAttrs,
  description,
  descriptionAttrs,
  icon,
  iconAttrs,
  handleSubmit,
  addCategory,
  editCategory,
  patchCategory,
} = categoryInstance;

const onSubMit = handleSubmit(async values => {
  try {
    startLoading();
    const form: ProductCategoryForm = {
      name: values?.name,
      description: values?.description,
      icon: values?.icon,
    };
    let success = false;
    switch (props.modalState.mode) {
      case 'add':
        success = !!(await addCategory(form));
        break;
      case 'edit':
        form.id = values.id;
        form.active = values.active;
        success = !!(await editCategory(form));
        break;
      case 'delete':
        success = !!(await patchCategory(values.id));
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
