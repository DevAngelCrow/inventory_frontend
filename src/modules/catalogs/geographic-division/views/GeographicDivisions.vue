<template>
  <div class="py-5 px-5 h-full max-h-full flex items-start justify-center">
    <section
      id="geographic_divisions_content"
      class="w-full xl:w-[80%] flex flex-row flex-wrap gap-5"
    >
      <AppTitle
        title="Divisiones Geográficas"
        class="w-full md:w-auto flex justify-center items-center"
      />
      <div
        id="inputs"
        class="flex rounded-lg py-0.5 px-0.5 gap-3 flex-wrap grow lg:grow-0 w-full"
      >
        <AppInputText
          label="Buscar..."
          class="min-w-auto w-full sm:w-[50%] grow lg:grow-0 shrink-0 md:w-45 lg:w-83.75"
          v-model="filter.filter"
          append-icon="pi pi-search"
          @update:modelValue="validateAlphaInput(filter.filter)"
          v-debounce:700.keydown.enter="() => findDivision(filter)"
        />
        <AppSelect
          class="w-full sm:w-[20%] lg:w-auto min-w-0 grow lg:grow-0 shrink-0"
          :options="countries"
          option-label="name"
          label="País"
          v-model="filter.id_country"
          optionValue="id"
        />
        <AppSelect
          class="w-full sm:w-[20%] lg:w-auto min-w-0 grow lg:grow-0 shrink-0"
          :options="divisionTypesList"
          option-label="name"
          label="Tipo"
          v-model="filter.id_type"
          optionValue="id"
        />
        <AppSelect
          class="w-full sm:w-[20%] lg:w-auto min-w-0 grow lg:grow-0 shrink-0"
          :options="statusOptions"
          option-label="name"
          label="Estado"
          v-model="filter.status"
          optionValue="value"
        />
        <Button
          class="shrink-0 grow rounded-md md:grow-0"
          v-debounce:700.click="() => findDivision(filter)"
          >Buscar</Button
        >
        <Button
          class="shrink-0 grow md:grow-0 rounded-md"
          outlined
          v-debounce:700.click="cleanSearch"
          label="Limpiar"
          :icon="iconFilter"
        ></Button>
        <Button
          class="shrink-0 grow rounded-md md:grow-0 ml-auto"
          @click="openModal('add')"
          ><i
            class="pi pi-plus-circle flex justify-center items-center text-center"
            style="font-size: 1.1rem; font-weight: bold"
          ></i
          ><span>Agregar</span></Button
        >
      </div>
      <AppDataTable
        class="w-full"
        :headers="headers"
        :items="divisions"
        :paginator="true"
        :per_page="pagination.per_page"
        :total_items="pagination.total_items"
        :page="pagination.page"
        :show-per-page-options="true"
        :per-page-options="[10, 20, 50, 100]"
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
              v-tooltip.bottom="'Ver Detalle'"
            ></Button>
            <Button
              class="rounded-full mx-0 my-0 px-0 py-0"
              variant="text"
              icon="pi pi-pencil"
              @click="openModal('edit', data)"
              v-tooltip.bottom="'Editar'"
              :disabled="!data?.active"
            ></Button>
            <Button
              class="rounded-full"
              variant="text"
              :severity="data?.active ? 'danger' : 'success'"
              :icon="data?.active ? 'pi pi-trash' : 'pi pi-check-circle'"
              @click="openModal('delete', data)"
              v-tooltip.bottom="data?.active ? 'Desactivar' : 'Activar'"
            ></Button>
          </div>
        </template>
        <template #body-active="{ data }">
          <AppChipStatus
            :label="data?.status?.name"
            :background-color="data?.status?.state_color"
            :text-color="data?.status?.text_color"
          >
          </AppChipStatus>
        </template>
      </AppDataTable>
    </section>
    <GeographicDivisionFormModal
      :modal-state="modalState"
      @close-modal="closeModal"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, provide, reactive, ref } from 'vue';
import { Button } from 'primevue';

import { useGeographicDivision } from '../../composables/useGeographicDivision';
import { GeographicDivisionResponse } from '../../interfaces/geographic-division/geographic-division.response.interface';
import GeographicDivisionFormModal from '../components/GeographicDivisionFormModal.vue';

const divisionInstance = useGeographicDivision();
provide('useGeographicDivision', divisionInstance);

const {
  filter,
  resetForm,
  cleanSearch,
  findDivision,
  validateAlphaInput,
  setDivisionItem,
  getCountries,
  getDivisionTypesList,
  getParentDivisionsList,
  getDivisions,
  headers,
  pagination,
  divisions,
  countries,
  divisionTypesList,
} = divisionInstance;

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

const openModal = (
  action: 'add' | 'view' | 'edit' | 'delete',
  data?: GeographicDivisionResponse,
) => {
  modalState.mode = action;
  modalState.isReadonly = action === 'view';

  switch (action) {
    case 'add':
      modalState.title = 'Agregar División Geográfica';
      break;
    case 'view':
      modalState.title = 'Ver División Geográfica';
      setDivisionItem(data!);
      break;
    case 'edit':
      modalState.title = 'Editar División Geográfica';
      setDivisionItem(data!);
      break;
    case 'delete':
      setDivisionItem(data!);
      modalState.title = data!.active
        ? 'Desactivar División Geográfica'
        : 'Activar División Geográfica';
      modalState.description = `¿Está seguro de cambiar el estado de la división geográfica a ${data!.active ? 'inactivo' : 'activo'}?`;
      modalState.selectedItem = data!.id;
      break;
  }
  modalState.show = true;
};

const statusOptions = ref<{ name: string; value: boolean | null | 'Todos' }[]>([
  { name: 'Todos', value: 'Todos' },
  { name: 'Activo', value: true },
  { name: 'Inactivo', value: false },
]);

const closeModal = () => {
  modalState.show = false;
  modalState.mode = 'closed';
  modalState.title = '';
  modalState.description = '';
  modalState.isReadonly = false;
  modalState.selectedItem = null;
  resetForm();
};

const iconFilter = computed(() => {
  const filterValues = Object.values(filter).some(Boolean);
  if (!filterValues) {
    return 'pi pi-filter';
  }
  return 'pi pi-filter-slash';
});

const handlePagination = async (page: number) => {
  if (page + 1 === pagination.page) return;
  pagination.page = page + 1;
  getDivisions();
};

const handlePerPagePagination = async (perPage: number) => {
  if (perPage === pagination.per_page) return;
  pagination.per_page = perPage;
  pagination.page = 1;
  getDivisions();
};

onMounted(async () => {
  await getCountries();
  await getDivisionTypesList();
  await getParentDivisionsList();
  await getDivisions();
});
</script>
