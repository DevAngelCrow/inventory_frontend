<template>
  <div class="py-5 px-5 h-full max-h-full flex items-start justify-center">
    <section
      id="content"
      class="w-full xl:w-[80%] flex flex-col flex-wrap gap-5"
    >
      <AppTitle
        title="Usuarios"
        class="w-full md:w-auto flex justify-start items-start"
      />
      <div
        id="inputs"
        class="flex rounded-lg py-0.5 px-0.5 gap-3 flex-wrap grow lg:grow-0 w-full"
      >
        <AppInputText
          label="Buscar..."
          class="min-w-auto w-auto grow lg:grow-0 shrink-0 md:w-83.75"
          v-model="filter_name"
          append-icon="pi pi-search"
          @update:modelValue="validateAlphaInput(filter_name)"
          @keydown.enter="debouncedFindUser"
        />
        <Button
          class="shrink-0 grow md:grow-0 rounded-md"
          @click="debouncedFindUser"
          >Buscar</Button
        >
        <Button
          class="shrink-0 grow md:grow-0 rounded-md"
          outlined
          @click="debouncedCleanSearch"
          label="Limpiar"
          :icon="iconFilter"
        ></Button>
      </div>
      <AppDataTable
        class="w-full"
        :headers="headers"
        :items="users"
        :paginator="true"
        :per_page="pagination.per_page"
        :total_items="pagination.total_items"
        :page="pagination.page"
        :show-per-page-options="true"
        :per-page-options="[10, 2, 50, 100]"
        @page-update="handlePagination"
        @per-page-update="handlePerPagePagination"
      >
        <template #body-acciones="{ data }">
          <div class="flex gap-0 justify-center">
            <Button
              class="rounded-full mx-0 my-0 px-0 py-0"
              variant="text"
              icon="pi pi-eye"
              @click="openModal('view', data)"
              v-tooltip.bottom="'Ver roles'"
            />
            <Button
              class="rounded-full mx-0 my-0 px-0 py-0"
              variant="text"
              icon="pi pi-pencil"
              @click="openModal('edit', data)"
              v-tooltip.bottom="'Editar roles'"
            />
          </div>
        </template>
        <template #body-is_validated="{ data }">
          <i
            :class="
              data.is_validated
                ? 'pi pi-check-circle text-green-500'
                : 'pi pi-times-circle text-red-500'
            "
          />
        </template>
        <template #body-status.name="{ data }">
          <AppChipStatus
            :label="data?.status?.name"
            :background-color="data?.status?.state_color"
            :text-color="data?.status?.text_color"
          />
        </template>
      </AppDataTable>
    </section>
    <UserRoleFormModal :modal-state="modalState" @close-modal="closeModal" />
  </div>
</template>
<script setup lang="ts">
import { Button } from 'primevue';
import { computed, onMounted, reactive, provide } from 'vue';

import { useUserRole } from '../composables/useUserRole';
import { UsersResponse } from '../interfaces/user-role/users.response.interface';
import UserRoleFormModal from '../components/user-role/UserRoleFormModal.vue';

const userRoleInstance = useUserRole();
provide('useUserRole', userRoleInstance);

const {
  getUsers,
  getUserRoleById,
  getRoles,
  users,
  pagination,
  headers,
  filter_name,
  validateAlphaInput,
  rolesPagination,
  debouncedFindUser,
  debouncedCleanSearch,
} = userRoleInstance;

const modalState = reactive<{
  show: boolean;
  mode: 'closed' | 'view' | 'edit';
  title: string;
  isReadonly: boolean;
  selectedItem: null | string;
  userName: string;
  userEmail: string;
}>({
  show: false,
  mode: 'closed',
  title: '',
  isReadonly: false,
  selectedItem: null,
  userName: '',
  userEmail: '',
});

const openModal = async (action: 'view' | 'edit', data: UsersResponse) => {
  modalState.selectedItem = data.id;
  modalState.userName = data.user_name;
  modalState.userEmail = data.email;
  modalState.isReadonly = action === 'view';

  if (action === 'view') {
    modalState.mode = 'view';
    modalState.title = `Roles de ${data.user_name}`;
    rolesPagination.page = 1;
    rolesPagination.per_page = 10;
    await getUserRoleById(data.id);
  } else {
    modalState.mode = 'edit';
    modalState.title = `Editar roles de ${data.user_name}`;
    rolesPagination.page = 1;
    rolesPagination.per_page = 10;
    await Promise.all([getUserRoleById(data.id), getRoles()]);
  }

  modalState.show = true;
};

const closeModal = () => {
  modalState.show = false;
  modalState.mode = 'closed';
  modalState.title = '';
  modalState.isReadonly = false;
  modalState.selectedItem = null;
  modalState.userName = '';
  modalState.userEmail = '';
};

const handlePagination = async (page: number) => {
  if (page + 1 === pagination.page) return;
  pagination.page = page + 1;
  await getUsers();
};
const handlePerPagePagination = async (perPage: number) => {
  if (perPage === pagination.per_page) return;

  pagination.per_page = perPage;
  pagination.page = 1;
  await getUsers();
};
const iconFilter = computed(() => {
  return filter_name.value ? 'pi pi-filter-slash' : 'pi pi-filter';
});
onMounted(async () => {
  try {
    await Promise.all([getUsers()]);
  } catch (error) {
    console.error(error);
  }
});
</script>
<style scoped></style>
