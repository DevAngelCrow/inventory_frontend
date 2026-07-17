<template>
  <div class="py-5 px-5 h-full max-h-full flex items-start justify-center">
    <section
      id="products_content"
      class="w-full xl:w-[90%] flex flex-col flex-wrap gap-5"
    >
      <div class="w-full flex flex-row gap-3 flex-wrap items-center">
        <AppTitle
          title="Inventario de Productos"
          class="w-full md:w-auto flex justify-center items-center"
        />
        <div
          id="inputs"
          class="flex rounded-lg py-0.5 px-0.5 gap-3 flex-wrap grow lg:grow-0 w-full"
        >
          <AppInputText
            label="Nombre..."
            class="min-w-auto w-full sm:w-[20%] grow lg:grow-0 shrink-0 md:w-30 lg:w-45"
            v-model="filter.filter_name"
            append-icon="pi pi-search"
            @update:modelValue="
              validateAlphaInput(filter.filter_name, 'filter_name')
            "
            @keydown.enter="debouncedFindProduct"
          />
          <AppInputText
            label="SKU..."
            class="min-w-auto w-full sm:w-[20%] grow lg:grow-0 shrink-0 md:w-30 lg:w-45"
            v-model="filter.sku"
            @update:modelValue="validateAlphaInput(filter.sku, 'sku')"
            @keydown.enter="debouncedFindProduct"
          />
          <AppSelect
            class="w-full sm:w-[20%] grow lg:grow-0 shrink-0 md:w-30 lg:w-45 min-w-0"
            :options="categoriesOptions"
            option-label="name"
            label="Categoría"
            v-model="filter.category_id"
            optionValue="id"
          />
          <AppSelect
            class="w-full sm:w-[20%] lg:w-auto min-w-0 grow lg:grow-0 shrink-0"
            :options="statusOptions"
            option-label="name"
            label="Estado"
            v-model="filter.active"
            optionValue="value"
          />
          <Button
            class="shrink-0 grow md:grow-0 rounded-md"
            @click="debouncedFindProduct"
            >Buscar</Button
          >
          <Button
            class="shrink-0 grow md:grow-0 rounded-md"
            outlined
            @click="debouncedCleanSearch"
            label="Limpiar"
            :icon="iconFilter"
          ></Button>
          <Button
            class="shrink-0 grow md:grow-0 rounded-md ml-auto"
            @click="openModal('add')"
            ><i
              class="pi pi-plus-circle flex justify-center items-center text-center mr-1"
              style="font-size: 1.1rem; font-weight: bold"
            ></i
            ><span>Agregar Producto</span></Button
          >
        </div>
      </div>

      <AppDataTable
        class="w-full"
        :headers="headers"
        :items="products"
        :paginator="true"
        :per_page="pagination.per_page"
        :total_items="pagination.total_items"
        :page="pagination.page"
        :show-per-page-options="true"
        :per-page-options="[10, 20, 50, 100]"
        @page-update="handlePagination"
        @per-page-update="handlePerPagePagination"
      >
        <template #body-rental_price="{ data }">
          ${{ Number(data.rental_price).toFixed(2) }}
        </template>
        <template #body-category_id="{ data }">
          {{ categoriesList.find(c => c.id === data.category_id)?.name || '-' }}
        </template>
        <template #body-active="{ data }">
          <AppChipStatus
            :label="data?.status?.name"
            :backgroundColor="data?.status?.state_color"
            :textColor="data?.status?.text_color"
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
      </AppDataTable>
    </section>

    <ProductFormModal :modal-state="modalState" @close-modal="closeModal" />
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, provide, reactive, ref } from 'vue';
import { Button } from 'primevue';

import AppTitle from '@/core/components/AppTitle.vue';
import AppInputText from '@/core/components/AppInputText.vue';
import AppSelect from '@/core/components/AppSelect.vue';
import AppDataTable from '@/core/components/AppDataTable.vue';
import { useLoaderStore } from '@/core/store';
import AppChipStatus from '@/core/components/AppChipStatus.vue';

import { useProduct } from '../composables/useProduct';
import { ProductResponse } from '../interfaces/inventory.interfaces';
import ProductFormModal from '../components/ProductFormModal.vue';
import inventoryServices from '../Services/inventory.services';

const productInstance = useProduct();
provide('useProduct', productInstance);
const { startLoading, finishLoading } = useLoaderStore();

const {
  filter,
  resetForm,
  debouncedCleanSearch,
  debouncedFindProduct,
  validateAlphaInput,
  setProductItem,
  getProducts,
  loadCategories,
  loadMeasurementUnits,
  headers,
  pagination,
  products,
  categoriesList,
} = productInstance;

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

const openModal = async (
  action: 'add' | 'view' | 'edit' | 'delete',
  data?: ProductResponse,
) => {
  modalState.mode = action;
  modalState.isReadonly = action === 'view';

  switch (action) {
    case 'add':
      modalState.title = 'Agregar Producto al Inventario';
      break;
    case 'view':
    case 'edit':
      modalState.title =
        action === 'view'
          ? 'Ver Detalle de Producto'
          : 'Editar Producto de Inventario';
      startLoading();
      try {
        const response = await inventoryServices.getProductById(data!.id);
        if (response) {
          setProductItem(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        finishLoading();
      }
      break;
    case 'delete':
      setProductItem(data!);
      modalState.title = data!.active
        ? 'Desactivar Producto'
        : 'Activar Producto';
      modalState.description = `¿Está seguro de cambiar el estado del producto "${data!.name}" a ${data!.active ? 'inactivo' : 'activo'}?`;
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

const categoriesOptions = computed(() => {
  return [{ id: 'Todos', name: 'Todos' }, ...categoriesList.value];
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
  await getProducts();
  finishLoading();
};

const handlePerPagePagination = async (perPage: number) => {
  if (perPage === pagination.per_page) return;
  pagination.per_page = perPage;
  pagination.page = 1;
  startLoading();
  await getProducts();
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
    await loadCategories();
    await loadMeasurementUnits();
    await getProducts();
  } catch (error) {
    console.error(error);
  } finally {
    finishLoading();
  }
});
</script>
