<template>
  <div class="py-5 px-5 h-full max-h-full flex items-start justify-center">
    <section id="content" class="w-full xl:w-[80%] flex flex-row flex-wrap gap-5">
      <AppTitle title="Roles" class="w-full md:w-auto flex justify-center items-center" />
      <div id="inputs" class="flex rounded-lg py-0.5 px-0.5 gap-3 flex-wrap grow lg:grow-0 w-full">
        <AppInputText label="Buscar..." class="min-w-auto w-full sm:w-[50%] grow lg:grow-0 shrink-0 md:w-45 lg:w-83.75"
          v-model="filter.filter_name" append-icon="pi pi-search"
          @update:modelValue="validateAlphaInput(filter.filter_name)" @keydown.enter="debouncedFindRole" />
        <AppSelect class="min-w-0 grow lg:grow-0 shrink-0 w-full sm:w-[40%] md:w-auto" :options="globalStatus"
          option-label="name" label="Estado" v-model="filter.id_status" optionValue="id" />
        <Button class="shrink-0 grow md:grow-0 rounded-md" @click="debouncedFindRole">Buscar</Button>
        <Button class="shrink-0 grow md:grow-0 rounded-md" outlined @click="debouncedCleanSearch" label="Limpiar"
          :icon="iconFilter"></Button>
        <Button class="shrink-0 grow md:grow-0 rounded-md ml-auto" @click="goToRoleMaintenance()"><i
            class="pi pi-plus-circle flex justify-center items-center text-center"
            style="font-size: 1.1rem; font-weight: bold"></i><span>Agregar</span></Button>
      </div>
      <AppDataTable class="w-full" :headers="headers" :items="role" :paginator="true" :per_page="pagination.per_page"
        :total_items="pagination.total_items" :page="pagination.page" :show-per-page-options="true"
        :per-page-options="[10, 20, 50, 100]" @page-update="handlePagination"
        @per-page-update="handlePerPagePagination">
        <template #body-acciones="{ data }">
          <div class="flex gap-0 justify-center">
            <Button class="rounded-full mx-0 my-0 px-0 py-0" variant="text" icon="pi pi-eye"
              @click="goToRoleMaintenance(data.id)" v-tooltip.bottom="'Ver detalle'"></Button>
            <Button class="rounded-full" variant="text" :severity="data?.status?.name === 'Inactivo' ? 'success' : 'danger'
              " :icon="data?.status?.name === 'Inactivo'
                  ? 'pi pi-check-circle'
                  : 'pi pi-trash'
                " @click="openModal('delete', data)" v-tooltip.bottom="data?.status?.name === 'Inactivo' ? 'Activar' : 'Desactivar'
                "></Button>
          </div>
        </template>
        <template #body-icon="{ data }">
          <i :class="data.icon"></i>
        </template>
        <template #body-status.name="{ data }">
          <AppChipStatus :label="data?.status?.name" :background-color="data?.status?.state_color"
            :text-color="data?.status?.text_color">
          </AppChipStatus>
        </template>
        <template #body-show="{ data }">
          <i :class="data.show ? 'pi pi-eye' : 'pi pi-eye-slash'"></i>
        </template>
      </AppDataTable>
    </section>
    <RoleFormModal :modal-state="modalState" @close-modal="closeModal" />
  </div>
</template>
<script setup lang="ts">
import { Button } from 'primevue';
import { computed, onMounted, reactive, provide } from 'vue';
import { useRouter } from 'vue-router';

import AppSelect from '@/core/components/AppSelect.vue';

import { useRole } from '../composables/useRole';
import { RoleResponse } from '../interfaces/role/role.response.interface';
import RoleFormModal from '../components/roles/RoleFormModal.vue';

const roleInstance = useRole();
provide('useRole', roleInstance);

const router = useRouter();

const {
  getRole,
  role,
  filter,
  resetForm,
  validateAlphaInput,
  setRoleItem,
  pagination,
  headers,
  getPermissions,
  getStatus,
  getRolById,
  globalStatus,
  debouncedFindRole,
  debouncedCleanSearch,
} = roleInstance;

const modalState = reactive<{
  show: boolean;
  mode: 'closed' | 'add' | 'view' | 'edit' | 'delete';
  title: string;
  description: string;
  isReadonly: boolean;
  selectedItem: null | string;
}>({
  show: false,
  mode: 'closed',
  title: '',
  description: '',
  isReadonly: false,
  selectedItem: null as string | null,
});

const goToRoleMaintenance = (id?: string) => {
  if (id) {
    router.push({ name: 'role-maintenance', params: { id } });
  } else {
    router.push({ name: 'role-maintenance' });
  }
};

const openModal = (
  action: 'add' | 'view' | 'edit' | 'delete',
  data?: RoleResponse,
) => {
  modalState.mode = action;
  modalState.isReadonly = action === 'view';

  switch (action) {
    case 'add':
      modalState.title = 'Agregar Rol';
      break;
    case 'view':
      getRolById(data!.id);
      modalState.title = 'Ver Rol';
      setRoleItem(data!);
      break;
    case 'edit':
      modalState.title = 'Editar Rol';
      setRoleItem(data!);
      break;
    case 'delete':
      setRoleItem(data!);
      modalState.title =
        data!.status.name === 'Activo' ? 'Desactivar Rol' : 'Activar Rol';
      modalState.description = `¿Está seguro de cambiar el estado del rol a ${data!.status.name === 'Activo' ? 'inactivo' : 'activo'}?`;
      modalState.selectedItem = data!.id;
      break;
  }
  modalState.show = true;
};

const closeModal = () => {
  modalState.show = false;
  modalState.mode = 'closed';
  modalState.title = '';
  modalState.description = '';
  modalState.isReadonly = false;
  modalState.selectedItem = null;
  resetForm();
};

const handlePagination = async (page: number) => {
  if (page + 1 === pagination.page) {
    return;
  }
  pagination.page = page + 1;
  getRole();
};
const handlePerPagePagination = async (perPage: number) => {
  if (perPage === pagination.per_page) return;

  pagination.per_page = perPage;
  pagination.page = 1;
  getRole();
};
const iconFilter = computed(() => {
  const filterValues = Object.values(filter).some(Boolean);
  if (!filterValues) {
    return 'pi pi-filter';
  }
  return 'pi pi-filter-slash';
});
onMounted(async () => {
  try {
    await getRole();
    await getPermissions();
    await getStatus();
  } catch (error) {
    console.error(error);
  }
});
</script>
