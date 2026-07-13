<template>
  <div class="py-5 px-5 h-full max-h-full flex items-start justify-center">
    <section
      id="gender_content"
      class="w-full xl:w-[80%] flex flex-col flex-wrap gap-5"
    >
      <div class="w-full flex flex-row gap-3 flex-wrap">
        <AppTitle
          title="Géneros"
          class="w-full md:w-auto flex justify-center items-center"
        />
        <div
          id="inputs"
          class="flex rounded-lg py-0.5 px-0.5 gap-3 flex-wrap grow lg:grow-0 w-full"
        >
          <AppInputText
            label="Buscar"
            class="min-w-auto w-auto grow lg:grow-0 shrink-0 md:w-[335px]"
            v-model="filter_name"
            @update:modelValue="validateAlphaInput(filter_name)"
            @keydown.enter="debouncedFindGender"
          />
          <Button
            class="shrink-0 grow md:grow-0 rounded-md"
            @click="debouncedFindGender"
            >Buscar</Button
          >
          <Button
            class="shrink-0 grow md:grow-0 rounded-md"
            outlined
            @click="debouncedCleanSearch"
            >Limpiar</Button
          >
        </div>
      </div>
      <AppDataTable
        class="w-full"
        :headers="headers"
        :items="genders"
        :paginator="true"
        :per_page="pagination.per_page"
        :total_items="pagination.total_items"
        :page="pagination.page"
        @page-update="handlePagination"
      >
        <template #body-acciones="{ data }">
          <div class="flex gap-0 justify-center">
            <Button
              class="rounded-full mx-0 my-0 px-0 py-0"
              variant="text"
              icon="pi pi-eye"
              @click="openModal(data)"
              v-tooltip.bottom="'Ver detalle'"
            ></Button>
          </div>
        </template>
      </AppDataTable>
    </section>
    <GenderFormModal :modal-state="modalState" @close-modal="closeModal" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { Button } from 'primevue';

import { useGender } from '../../composables/useGender';
import GenderFormModal from '../components/GenderFormModal.vue';
import { GenderResponse } from '../../interfaces/gender/gender.response.interface';

const {
  debouncedCleanSearch,
  debouncedFindGender,
  filter_name,
  validateAlphaInput,
  getGenders,
  headers,
  pagination,
  genders,
} = useGender();

const modalState = reactive<{
  show: boolean;
  title: string;
  selectedItem: GenderResponse | null;
}>({
  show: false,
  title: '',
  selectedItem: null,
});

const openModal = (data: GenderResponse) => {
  modalState.title = 'Ver Género';
  modalState.selectedItem = data;
  modalState.show = true;
};

const closeModal = () => {
  modalState.show = false;
  modalState.title = '';
  modalState.selectedItem = null;
};

const handlePagination = async (page: number) => {
  if (page + 1 === pagination.page) {
    return;
  }
  pagination.page = page + 1;
  getGenders();
};

onMounted(async () => {
  await getGenders();
});
</script>
