<template>
  <div
    class="flex justify-center md:justify-between items-center gap-2 flex-wrap"
  >
    <span class="text-xs"
      >Mostrando <span class="font-bold">{{ first + 1 }}</span> a
      <span class="font-bold">{{ first + rows }}</span> de
      <span class="font-bold">{{ totalRecords }}</span> registros</span
    >
    <Paginator
      class="flex justify-end"
      :rows
      :totalRecords
      @page="updatePage"
      :first
      @update:rows="perPageUpdate"
      :rowsPerPageOptions="showPerPageOptions ? rowsPerPageOptions : undefined"
    />
  </div>
</template>
<script setup lang="ts">
import { Paginator, type PageState } from 'primevue';
import { PropType } from 'vue';

defineOptions({ name: 'AppPaginator' });

const { rows, totalRecords, rowsPerPageOptions, showPerPageOptions } =
  defineProps({
    rows: {
      type: Number,
      default: 10,
    },
    totalRecords: {
      type: Number,
      default: 10,
    },
    first: {
      type: Number,
      default: 0,
    },
    rowsPerPageOptions: {
      type: Array as PropType<number[]>,
      default: () => [10, 20, 50, 100],
    },
    showPerPageOptions: {
      type: Boolean,
      default: false,
    },
    justify: {
      type: String,
      default: '',
    },
  });

const emit = defineEmits(['pageUpdate', 'perPageUpdate']);

const updatePage = (value: PageState) => {
  emit('pageUpdate', value.page);
};

const perPageUpdate = (value: number) => {
  emit('perPageUpdate', value);
};
</script>
