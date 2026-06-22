<template>
  <div class="py-5 px-5 h-full max-h-full flex items-start justify-center">
    <section id="product_categories_content" class="w-full xl:w-[80%] flex flex-row flex-wrap gap-5">

      <AppTitle title="Categorías de Inventario" class="w-full md:w-auto flex justify-center items-center" />
      <div id="inputs" class="flex rounded-lg py-0.5 px-0.5 gap-3 flex-wrap grow lg:grow-0 w-full">
        <AppInputText label="Buscar..." class="min-w-auto w-full sm:w-[250px] shrink-0" v-model="filter.filter_name"
          append-icon="pi pi-search" @update:modelValue="validateAlphaInput(filter.filter_name)"
          v-debounce:700.keydown.enter="() => findCategory(filter)" />
        <AppSelect class="w-full sm:w-[150px] min-w-0 shrink-0" :options="statusOptions" option-label="name"
          label="Estado" v-model="filter.active" optionValue="value" />
        <Button class="shrink-0 rounded-md" v-debounce:700.click="() => findCategory(filter)">Buscar</Button>
        <Button class="shrink-0 rounded-md" outlined v-debounce:700.click="cleanSearch" label="Limpiar"
          :icon="iconFilter"></Button>
        <Button class="shrink-0 rounded-md ml-auto" @click="openModal('add')"><i
            class="pi pi-plus-circle flex justify-center items-center text-center mr-1"
            style="font-size: 1.1rem; font-weight: bold"></i><span>Agregar</span></Button>
      </div>

      <AppDataTable class="w-full" :headers="headers" :items="categories" :paginator="true"
        :per_page="pagination.per_page" :total_items="pagination.total_items" :page="pagination.page"
        :show-per-page-options="true" :per-page-options="[10, 20, 50, 100]" @page-update="handlePagination"
        @per-page-update="handlePerPagePagination">
        <template #body-icon="{ data }">
          <i :class="data.icon || 'pi pi-tag'" class="text-xl"></i>
        </template>
        <template #body-active="{ data }">
          <AppChipStatus :label="data?.status?.name" :backgroundColor="data?.status?.state_color"
            :textColor="data?.status?.text_color" />
        </template>
        <template #body-acciones="{ data }">
          <div class="flex gap-0 justify-center">
            <Button class="rounded-full mx-0 my-0 px-0 py-0" variant="text" icon="pi pi-eye"
              @click="openModal('view', data)" v-tooltip.bottom="'Ver Detalle'"></Button>
            <Button class="rounded-full mx-0 my-0 px-0 py-0" variant="text" icon="pi pi-pencil"
              @click="openModal('edit', data)" v-tooltip.bottom="'Editar'" :disabled="!data?.active"></Button>
            <Button class="rounded-full" variant="text" :severity="data?.active ? 'danger' : 'success'"
              :icon="data?.active ? 'pi pi-trash' : 'pi pi-check-circle'" @click="openModal('delete', data)"
              v-tooltip.bottom="data?.active ? 'Desactivar' : 'Activar'"></Button>
          </div>
        </template>
      </AppDataTable>
    </section>

    <CategoryFormModal :modal-state="modalState" @close-modal="closeModal" />
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, provide, reactive, ref } from 'vue';
import { Button } from 'primevue';

import AppTitle from '@/core/components/AppTitle.vue';
import AppInputText from '@/core/components/AppInputText.vue';
import AppSelect from '@/core/components/AppSelect.vue';
import AppDataTable from '@/core/components/AppDataTable.vue';
import AppChipStatus from '@/core/components/AppChipStatus.vue';

import { useProductCategory } from '../composables/useProductCategory';
import { ProductCategoryResponse } from '../interfaces/inventory.interfaces';
import CategoryFormModal from '../components/CategoryFormModal.vue';
import { useLoaderStore } from '@/core/store';

const categoryInstance = useProductCategory();
provide('useProductCategory', categoryInstance);
const { startLoading, finishLoading } = useLoaderStore();

const {
  filter,
  resetForm,
  cleanSearch,
  findCategory,
  validateAlphaInput,
  setCategoryItem,
  getCategories,
  headers,
  pagination,
  categories,
} = categoryInstance;

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
  selectedItem: null,
});

const openModal = (
  action: 'add' | 'view' | 'edit' | 'delete',
  data?: ProductCategoryResponse,
) => {
  modalState.mode = action;
  modalState.isReadonly = action === 'view';

  switch (action) {
    case 'add':
      modalState.title = 'Agregar Categoría de Inventario';
      break;
    case 'view':
      modalState.title = 'Ver Categoría de Inventario';
      setCategoryItem(data!);
      break;
    case 'edit':
      modalState.title = 'Editar Categoría de Inventario';
      setCategoryItem(data!);
      break;
    case 'delete':
      setCategoryItem(data!);
      modalState.title = data!.active
        ? 'Desactivar Categoría'
        : 'Activar Categoría';
      modalState.description = `¿Está seguro de cambiar el estado de la categoría a ${data!.active ? 'inactivo' : 'activo'}?`;
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

const handlePagination = async (page: number) => {
  if (page + 1 === pagination.page) {
    return;
  }
  pagination.page = page + 1;
  startLoading();
  await getCategories();
  finishLoading();
};

const handlePerPagePagination = async (perPage: number) => {
  if (perPage === pagination.per_page) return;
  pagination.per_page = perPage;
  pagination.page = 1;
  startLoading();
  await getCategories();
  finishLoading();
};

const iconFilter = computed(() => {
  const filterValues = Object.values(filter).some(v => v);
  if (!filterValues) {
    return 'pi pi-filter';
  }
  return 'pi pi-filter-slash';
});

onMounted(async () => {
  try {
    startLoading();
    await getCategories();
  } catch (error) {
    console.error(error);
  } finally {
    finishLoading();
  }
});
</script>
