<template>
  <AppModal :title="props.modalState.title" :show="props.modalState.show" :title-btn-cancel="modalButtons.cancelText"
    :title-btn-confirm="modalButtons.confirmText" footer-buttons show-icon-close width="45rem" @close-modal="closeModal"
    @confirm-modal="onSubMit" :showBtnConfirmFooter="props.modalState.mode !== 'view'">
    <section v-if="props.modalState.mode !== 'delete'" id="body_modal"
      class="flex justify-center items-center flex-wrap flex-row gap-5 py-1.5 w-full">
      <div class="flex justify-center items-center flex-wrap flex-row gap-5 w-full">
        <RoleFormComponent :modal-state="modalState" />
        <RolePermissionDataTable :modal-state="props.modalState.mode" @update:selected-permissions-ids="
          value => (selectedPermissionsIds = value)
        " ref="rolePermissionDataTable" :readonly="props.modalState.isReadonly" />
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

import RoleFormComponent from './RoleForm.vue';
import RolePermissionDataTable from './RolePermissionDataTable.vue';
import { RoleForm } from '../../interfaces/role/role.form.interface';
import { useRole } from '../../composables/useRole';

type RoleType = ReturnType<typeof useRole>;

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
const rol = inject<RoleType>('useRole')!;
const { startLoading, finishLoading } = useLoaderStore();
const { handleSubmit, addRol, toggleRole, editRole } = rol;

const selectedPermissionsIds = ref<Set<string>>(new Set());
const rolePermissionDataTable = ref<InstanceType<
  typeof RolePermissionDataTable
> | null>(null);

const onSubMit = handleSubmit(async values => {
  try {
    startLoading();
    const form: RoleForm = {
      name: values.name,
      description: values.description,
      id_status: values.status.id,
      code: values.code,
      permissions_id: [...selectedPermissionsIds.value],
    };
    let success = false;
    switch (props.modalState.mode) {
      case 'add':
        success = (await addRol(form)) ? true : false;
        break;
      case 'edit':
        form.id = values.id;
        success = (await editRole(form)) ? true : false;
        break;
      case 'delete':
        success = (await toggleRole(values.id)) ? true : false;
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
  rolePermissionDataTable.value?.closeModal();
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
