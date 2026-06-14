<template>
  <div class="py-5 px-5 h-full max-h-full flex items-start justify-center">
    <section
      id="document_type_content"
      class="w-full xl:w-[80%] flex flex-row flex-wrap gap-5"
    >
      <AppTitle
        title="Tipos de Documento"
        class="w-full md:w-auto flex justify-center items-center"
      />
      <div
        id="inputs"
        class="flex rounded-lg py-0.5 px-0.5 gap-3 flex-wrap grow lg:grow-0 w-full"
      >
        <AppInputText
          label="Buscar..."
          class="min-w-auto w-full sm:w-[50%] grow lg:grow-0 shrink-0 md:w-45 lg:w-83.75"
          v-model="filter.filter_name"
          append-icon="pi pi-search"
          @update:modelValue="validateAlphaInput(filter.filter_name)"
          v-debounce:700.keydown.enter="() => findDocumentType(filter)"
        />
        <AppSelect
          class="min-w-0 grow lg:grow-0 shrink-0 w-full sm:w-[40%] md:w-auto"
          :options="statusOptions"
          option-label="name"
          label="Estado"
          v-model="filter.status"
          optionValue="value"
        />
        <Button
          class="shrink-0 grow md:grow-0 rounded-md"
          v-debounce:700.click="() => findDocumentType(filter)"
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
          class="shrink-0 grow md:grow-0 rounded-md ml-auto"
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
        :items="documentTypes"
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
              v-tooltip.bottom="'Ver detalle'"
            ></Button>
            <Button
              class="rounded-full mx-0 my-0 px-0 py-0"
              variant="text"
              icon="pi pi-pencil"
              @click="openModal('edit', data)"
              :disabled="!data?.active"
              v-tooltip.bottom="'Editar'"
            ></Button>
            <Button
              class="rounded-full"
              variant="text"
              :severity="data?.active ? 'danger' : 'success'"
              :icon="data?.active ? 'pi pi-trash' : 'pi pi-check-circle'"
              v-tooltip.bottom="data?.active ? 'Desactivar' : 'Activar'"
              @click="openModal('delete', data)"
            ></Button>
          </div>
        </template>
        <template #body-active="{ data }">
          <AppChipStatus
            :label="data?.status?.name"
            :background-color="data?.status?.state_color"
            :text-color="data?.status?.text_color"
          ></AppChipStatus>
        </template>
      </AppDataTable>
    </section>
    <DocumentTypeFormModal
      :modal-state="modalState"
      @close-modal="closeModal"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, provide, reactive, ref } from 'vue';
import { Button } from 'primevue';

import { useDocumentType } from '../../composables/useDocumentType';
import DocumentTypeFormModal from '../components/DocumentTypeFormModal.vue';
import { DocumentTypeResponse } from '../../interfaces/document-type/document-type.response.interface';

const documentTypeInstance = useDocumentType();
provide('useDocumentType', documentTypeInstance);

const {
  filter,
  resetForm,
  cleanSearch,
  findDocumentType,
  validateAlphaInput,
  setDocumentTypeItem,
  getDocumentTypes,
  headers,
  pagination,
  documentTypes,
} = documentTypeInstance;

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
  data?: DocumentTypeResponse,
) => {
  modalState.mode = action;
  modalState.isReadonly = action === 'view';

  switch (action) {
    case 'add':
      modalState.title = 'Agregar Tipo de Documento';
      break;
    case 'view':
      modalState.title = 'Ver Tipo de Documento';
      setDocumentTypeItem(data!);
      break;
    case 'edit':
      modalState.title = 'Editar Tipo de Documento';
      setDocumentTypeItem(data!);
      break;
    case 'delete':
      setDocumentTypeItem(data!);
      modalState.title = data!.active
        ? 'Desactivar Tipo de Documento'
        : 'Activar Tipo de Documento';
      modalState.description = `¿Está seguro de cambiar el estado del tipo de documento a ${data!.active ? 'inactivo' : 'activo'}?`;
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
  getDocumentTypes();
};
const handlePerPagePagination = async (perPage: number) => {
  if (perPage === pagination.per_page) return;

  pagination.per_page = perPage;
  pagination.page = 1;
  getDocumentTypes();
};
const iconFilter = computed(() => {
  const filterValues = Object.values(filter).some(Boolean);
  if (!filterValues) {
    return 'pi pi-filter';
  }
  return 'pi pi-filter-slash';
});
onMounted(async () => {
  await getDocumentTypes();
});
</script>
