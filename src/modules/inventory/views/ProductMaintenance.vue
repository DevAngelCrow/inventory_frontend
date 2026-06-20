<template>
  <div class="py-5 px-5 h-full max-h-full flex items-start justify-center">
    <section
      id="maintenance_content"
      class="w-full xl:w-[90%] flex flex-col flex-wrap gap-5"
    >
      <div class="w-full flex flex-row gap-3 flex-wrap items-center">
        <AppTitle
          title="Mantenimiento de Mobiliario"
          class="w-full md:w-auto flex justify-center items-center"
        />
        <div
          id="inputs"
          class="flex rounded-lg py-0.5 px-0.5 gap-3 flex-wrap grow lg:grow-0 w-full"
        >
          <AppSelect
            class="w-full sm:w-[220px] min-w-0"
            :options="productsOptions"
            option-label="name"
            label="Filtrar por Producto"
            v-model="filter.id_product"
            optionValue="id"
          />
          <AppSelect
            class="w-full sm:w-[150px] min-w-0"
            :options="resolvedOptions"
            option-label="name"
            label="Estado"
            v-model="filter.resolved"
            optionValue="value"
          />
          <Button
            class="rounded-md"
            v-debounce:700.click="findMaintenance"
            >Buscar</Button
          >
          <Button
            class="rounded-md"
            outlined
            v-debounce:700.click="cleanSearch"
            label="Limpiar"
            :icon="iconFilter"
          ></Button>
          <Button
            class="rounded-md ml-auto"
            @click="openModal('add')"
            ><i
              class="pi pi-plus-circle flex justify-center items-center text-center mr-1"
              style="font-size: 1.1rem; font-weight: bold"
            ></i
            ><span>Registrar Reparación</span></Button
          >
        </div>
      </div>

      <AppDataTable
        class="w-full"
        :headers="headers"
        :items="maintenances"
        :paginator="true"
        :per_page="pagination.per_page"
        :total_items="pagination.total_items"
        :page="pagination.page"
        :show-per-page-options="true"
        :per-page-options="[10, 20, 50, 100]"
        @page-update="handlePagination"
        @per-page-update="handlePerPagePagination"
      >
        <template #body-date_start="{ data }">
          {{ FormatDate(data.date_start, 'DD/MM/YYYY') }}
        </template>
        <template #body-id_product="{ data }">
          {{ productsList.find(p => p.id === data.id_product)?.name || '-' }}
        </template>
        <template #body-resolved="{ data }">
          <AppStatusChip
            :status="data?.resolved"
            :label="data?.resolved ? 'Resuelto' : 'En Reparación'"
          />
        </template>
        <template #body-acciones="{ data }">
          <div class="flex gap-0 justify-center">
            <Button
              class="rounded-full mx-0 my-0 px-0 py-0"
              variant="text"
              icon="pi pi-eye"
              @click="openModal('view', data)"
              v-tooltip.bottom="'Ver Detalle'"
            ></Button>
            <Button
              class="rounded-full mx-0 my-0 px-0 py-0"
              variant="text"
              icon="pi pi-pencil"
              @click="openModal('edit', data)"
              v-tooltip.bottom="'Editar'"
              :disabled="data?.resolved"
            ></Button>
          </div>
        </template>
      </AppDataTable>
    </section>

    <MaintenanceFormModal
      :modal-state="modalState"
      @close-modal="closeModal"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, provide, reactive, ref } from 'vue';
import { Button } from 'primevue';

import AppTitle from '@/core/components/AppTitle.vue';
import AppSelect from '@/core/components/AppSelect.vue';
import AppDataTable from '@/core/components/AppDataTable.vue';
import AppStatusChip from '@/core/components/AppStatusChip.vue';
import { FormatDate } from '@/core/utils/dates';

import { useMaintenance } from '../composables/useMaintenance';
import { ProductMaintenanceResponse } from '../interfaces/inventory.interfaces';
import MaintenanceFormModal from '../components/MaintenanceFormModal.vue';
import { useLoaderStore } from '@/core/store';

const maintenanceInstance = useMaintenance();
provide('useMaintenance', maintenanceInstance);
const { startLoading, finishLoading } = useLoaderStore();

const {
  filter,
  resetForm,
  cleanSearch,
  findMaintenance,
  setMaintenanceItem,
  getMaintenances,
  loadProducts,
  headers,
  pagination,
  maintenances,
  productsList,
} = maintenanceInstance;

const modalState = reactive<{
  show: boolean;
  mode: 'closed' | 'add' | 'view' | 'edit';
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
  selectedItem: null,
});

const openModal = (
  action: 'add' | 'view' | 'edit',
  data?: ProductMaintenanceResponse,
) => {
  modalState.mode = action;
  modalState.isReadonly = action === 'view';

  switch (action) {
    case 'add':
      modalState.title = 'Registrar Reparación / Mantenimiento';
      break;
    case 'view':
      modalState.title = 'Ver Detalle de Mantenimiento';
      setMaintenanceItem(data!);
      // Format start and end date formatted to DD/MM/YYYY for calendar select
      if (data?.date_start) {
        maintenanceInstance.setFieldValue('date_start', FormatDate(data.date_start, 'DD/MM/YYYY'));
      }
      if (data?.date_end) {
        maintenanceInstance.setFieldValue('date_end', FormatDate(data.date_end, 'DD/MM/YYYY'));
      }
      break;
    case 'edit':
      modalState.title = 'Resolver / Editar Mantenimiento';
      setMaintenanceItem(data!);
      if (data?.date_start) {
        maintenanceInstance.setFieldValue('date_start', FormatDate(data.date_start, 'DD/MM/YYYY'));
      }
      if (data?.date_end) {
        maintenanceInstance.setFieldValue('date_end', FormatDate(data.date_end, 'DD/MM/YYYY'));
      }
      break;
  }
  modalState.show = true;
};

const resolvedOptions = ref<{ name: string; value: boolean | null | 'Todos' }[]>([
  { name: 'Todos', value: 'Todos' },
  { name: 'En Reparación', value: false },
  { name: 'Resuelto', value: true },
]);

const productsOptions = computed(() => {
  return [
    { id: 'Todos', name: 'Todos' },
    ...productsList.value,
  ];
});

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
  startLoading();
  await getMaintenances();
  finishLoading();
};

const handlePerPagePagination = async (perPage: number) => {
  if (perPage === pagination.per_page) return;
  pagination.per_page = perPage;
  pagination.page = 1;
  startLoading();
  await getMaintenances();
  finishLoading();
};

const iconFilter = computed(() => {
  const filterValues = Object.values(filter).some(v => v !== undefined);
  if (!filterValues) {
    return 'pi pi-filter';
  }
  return 'pi pi-filter-slash';
});

onMounted(async () => {
  try {
    startLoading();
    await loadProducts();
    await getMaintenances();
  } catch (error) {
    console.error(error);
  } finally {
    finishLoading();
  }
});
</script>
