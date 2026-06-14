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
    :showBtnConfirmFooter="props.modalState.mode === 'edit'"
  >
    <section
      id="body_modal"
      class="flex justify-center items-center flex-wrap flex-row gap-5 py-1.5 w-full"
    >
      <div class="w-full flex flex-wrap gap-3">
        <div class="w-full flex flex-wrap gap-2">
          <span class="font-semibold text-sm">Usuario:</span>
          <span class="text-sm">{{ props.modalState.userName }}</span>
        </div>
        <div class="w-full flex flex-wrap gap-2">
          <span class="font-semibold text-sm">Correo:</span>
          <span class="text-sm">{{ props.modalState.userEmail }}</span>
        </div>
      </div>
      <UserRoleRoleDataTable
        :modal-state="props.modalState.mode"
        :readonly="props.modalState.mode === 'view'"
        @update:selected-roles-ids="value => (selectedRolesIds = value)"
        ref="userRoleRoleDataTable"
      />
    </section>
  </AppModal>
</template>
<script setup lang="ts">
import { computed, inject, ref } from 'vue';

import { useLoaderStore } from '@/core/store';

import { useUserRole } from '../../composables/useUserRole';
import UserRoleRoleDataTable from './UserRoleRoleDataTable.vue';

type UserRoleType = ReturnType<typeof useUserRole>;

const props = defineProps<{
  modalState: {
    show: boolean;
    mode: 'closed' | 'view' | 'edit';
    title: string;
    isReadonly: boolean;
    selectedItem: null | string;
    userName: string;
    userEmail: string;
  };
}>();

const emit = defineEmits(['close-modal']);
const userRoleInstance = inject<UserRoleType>('useUserRole')!;
const { startLoading, finishLoading } = useLoaderStore();
const { updateUserRole } = userRoleInstance;

const selectedRolesIds = ref<Set<string>>(new Set());
const userRoleRoleDataTable = ref<InstanceType<
  typeof UserRoleRoleDataTable
> | null>(null);

const onSubmit = async () => {
  if (props.modalState.selectedItem === null) return;
  try {
    startLoading();
    const result = await updateUserRole(props.modalState.selectedItem, {
      id_role: [...selectedRolesIds.value],
    });
    if (result) {
      emit('close-modal');
    }
  } catch (error) {
    console.error(error);
  } finally {
    finishLoading();
  }
};

const closeModal = () => {
  userRoleRoleDataTable.value?.closeModal();
  emit('close-modal');
};

const modalButtons = computed(() => {
  if (props.modalState.mode === 'edit') {
    return { confirmText: 'Guardar', cancelText: 'Cancelar' };
  }
  return { confirmText: '', cancelText: 'Cerrar' };
});
</script>
<style scoped></style>
