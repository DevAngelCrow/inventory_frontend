<template>
  <AppModal :title="props.modalState.title" :show="props.modalState.show" :title-btn-cancel="modalButtons.cancelText"
    :title-btn-confirm="modalButtons.confirmText" footer-buttons show-icon-close width="45rem" @close-modal="closeModal"
    @confirm-modal="onSubMit" :showBtnConfirmFooter="props.modalState.mode !== 'view'">
    <section v-if="props.modalState.mode !== 'delete'" id="body_modal"
      class="flex justify-center items-center flex-wrap flex-row gap-5 py-1.5 w-full">
      <div class="flex justify-center items-center flex-wrap flex-row gap-5 w-full">
        <RouteFormComponent :modal-state="modalState" />
        <RoutePermissionDataTable :modal-state="props.modalState.mode" @update:selected-permissions-ids="
          value => (selectedPermissionsIds = value)
        " ref="routePermissionDataTable" :readonly="props.modalState.isReadonly" />
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
import { computed, ref, inject } from 'vue';

import { useLoaderStore } from '@/core/store';

import { useAdmin } from '../../composables/useAdmin';
import { RouteForm } from '../../interfaces/routes/route-form.interface';
import RoutePermissionDataTable from './RoutePermissionDataTable.vue';
import RouteFormComponent from './RouteForm.vue';

type AdminType = ReturnType<typeof useAdmin>;

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
const admin = inject<AdminType>('useAdmin')!;
const { startLoading, finishLoading } = useLoaderStore();
const { handleSubmit, addRoute, toggleRoute, editRoute } = admin;

const selectedPermissionsIds = ref<Set<string>>(new Set());
const routePermissionDataTable = ref<InstanceType<
  typeof RoutePermissionDataTable
> | null>(null);

const onSubMit = handleSubmit(async values => {
  try {
    startLoading();
    const form: RouteForm = {
      name: values.name,
      description: values.description,
      icon: values.icon,
      order: values.order,
      show: values.show ? true : false,
      uri: values.uri,
      id_parent: values.parent?.id ?? null,
      title: values.title,
      permissions_id: [...selectedPermissionsIds.value],
      required_auth: values.required_auth ?? false,
      child_route: values.child_route ?? false,
    };
    let success = false;
    switch (props.modalState.mode) {
      case 'add':
        success = (await addRoute(form)) ? true : false;
        break;
      case 'edit':
        form.id = values.id;
        form.active = values.active;
        success = (await editRoute(form)) ? true : false;
        break;
      case 'delete':
        success = (await toggleRoute(values.id)) ? true : false;
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
  routePermissionDataTable.value?.closeModal();
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
<style scoped></style>
