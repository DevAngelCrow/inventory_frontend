<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
// import { Button } from 'primevue';

//import { TableHeaders } from '../interfaces';
// const show = ref<boolean>(false);

// const openModal = (value: boolean) => {
//   show.value = !value;
// };

// const closeModal = (value: boolean) => {
//   show.value = value;
// };

// const confirmModal = () => {
//   //TODO
//   //aca debe hacer algo
//   closeModal(false);
// };

// const permisos = ref<any[][]>([
//   [
//     { id: 1, name: 'view_users' },
//     { id: 2, name: 'create_users' },
//     { id: 3, name: 'delete_users' },
//     { id: 4, name: 'view_routes' },
//     { id: 5, name: 'edit_routes' },
//     { id: 6, name: 'edit_user'},
//     { id: 7, name: 'create_routes'},
//     { id: 8, name: 'create_permissions'},
//     { id: 9, name: 'create_type_document'}
//   ],
//   [],
// ]);
onMounted(() => {});
const fecha = ref();

watch(fecha, newVale => {
  console.log(newVale);
});

// const headers = ref<TableHeaders[]>([
//   {
//     field: 'estado',
//     header: 'cabecera_Uno',
//     sortable: false,
//     alignHeaders: 'center',
//     alignItems: 'center',
//     width: 5,
//   },
//   {
//     field: 'vinculador_dos',
//     header: 'cabecera_Dos',
//     sortable: false,
//     alignHeaders: 'center',
//     alignItems: 'center',
//   },
//   {
//     field: 'vinculador_tres',
//     header: 'cabecera_Tres',
//     sortable: false,
//     alignHeaders: 'center',
//     alignItems: 'center',
//   },
//   {
//     field: 'acciones',
//     header: 'Acciones',
//     sortable: false,
//     alignHeaders: 'center',
//     alignItems: 'center',
//   },
// ]);

// const items = ref([
//   {
//     estado: false,
//     vinculador_dos: 'item_cabecera_dos_pagina_1',
//     vinculador_tres: 'item_cabecera_tres_pagina_1',
//   },
//   {
//     estado: false,
//     vinculador_dos: 'item_cabecera_dos_pagina_2',
//     vinculador_tres: 'item_cabecera_tres_pagina_2',
//   },
//   {
//     estado: false,
//     vinculador_dos: 'item_cabecera_dos_pagina_3',
//     vinculador_tres: 'item_cabecera_tres_pagina_3',
//   },
// ]);

// const selectAll = ref<boolean>(false);
// const checkAll = (flag: boolean) => {
//   items.value = items.value.map(item => ({
//     ...item,
//     estado: flag,
//   }));
// };
// const updateItemState = (index: number, flag: boolean) => {
//   items.value[index].estado = flag;
//   selectAll.value = items.value.every(item => item.estado);
// };
</script>

<template>
  <!-- <Button class="mt-10" @click="openModal(show)">Modal</Button>
  <AppModal
    :show="show"
    @close-modal="closeModal"
    @confirm-modal="confirmModal"
    show-icon-close
    title="AppModal"
  >
    <div>
      <h1>Aca esta el body del modal</h1>
    </div>
  </AppModal>
  <h1>Esto es un texto</h1>

  <span>Probando appdatepicker</span>
  <AppDatePicker v-model="fecha" />

  <AppDataTable
    :headers="headers"
    :items="items"
    :paginator="true"
    :per_page="10"
    :total_pages="1"
  >
    <template #body-acciones="{ data }">
      <i class="pi pi-pencil"></i>
      <i class="pi pi-trash"></i>
      <i class="pi pi-times-circle"></i>
    </template>
</AppDataTable> -->
  <br />
  <!-- <AppPickList v-model="permisos" :label-key="'name'" /> -->
  <!-- <AppDataTable :headers :items>
    <template #header-cabecera_Uno>
      <div class="flex justify-center flex-row">
        <AppCheckBox
          binary
          @update:model-value="checkAll"
          v-model="selectAll"
        ></AppCheckBox>
        <span>Seleccion</span>
      </div>
    </template>
    <template #body-estado="{ data, index }">
      <div class="flex justify-center">
        <AppCheckBox
          binary
          v-model="data.estado"
          :id="index"
          @update:model-value="updateItemState(index, data.estado)"
        />
      </div>
    </template>
  </AppDataTable> -->
  <AppCircularCounter :selected="3" :total="10" color="#082f49" />
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
