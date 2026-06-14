<template>
  <div class="flex flex-col overflow-hidden border-1 rounded-md">
    <DataTable :value="items" :loading :loadingIcon :row-hover :rows="per_page">
      <Column
        :style="`width:${widthColumn(header)}; text-align: ${txtAlignItems(header)}`"
        v-for="header in headers"
        :key="header.field"
        :field="header.field"
        :sortable="header.sortable"
        :pt="columHeader(header)"
      >
        <template #header>
          <slot :name="`header-${header.header}`" :header="header.header">
            {{ header.header }}
          </slot>
        </template>
        <template #body="slotProps">
          <div :class="['flex', 'w-full', `justify-${txtAlignItems(header)}`]">
            <slot
              :name="`body-${header.field}`"
              :data="slotProps.data"
              :index="slotProps.index"
            >
              {{ getNestedValue(slotProps.data, header.field) ?? '-' }}
            </slot>
          </div>
        </template>
      </Column>
      <template #footer>
        <AppPaginator
          :rows="per_page"
          :total-records="total_items"
          v-if="paginator"
          @page-update="updatePage"
          @per-page-update="perPageUpdate"
          :first="(page - 1) * per_page"
          :rowsPerPageOptions="perPageOptions"
          :showPerPageOptions="showPerPageOptions"
        />
      </template>
    </DataTable>
  </div>
</template>
<script setup lang="ts" generic="T">
import { Column, DataTable } from 'primevue';
import { computed } from 'vue';

import AppPaginator from './AppPaginator.vue';
import type {
  TableHeaders,
  TableProps,
} from '../interfaces/datatable.interface';

defineOptions({ name: 'AppDataTable' });
const {
  headers = [],
  items = [],
  per_page = 10,
  total_items = 0,
  loading = false,
  loadingIcon = 'pi pi-spin pi-spinner',
  rowHover = true,
  paginator = false,
  page = 1,
  showPerPageOptions = false,
  perPageOptions = [10, 20, 50, 100],
} = defineProps<TableProps<T>>();

const emit = defineEmits(['pageUpdate', 'perPageUpdate']);

const getNestedValue = <T extends Record<string, any>>(
  object: T,
  path: string,
): unknown => {
  return path.split('.').reduce<unknown>((currentObject, propertyKey) => {
    if (
      currentObject &&
      typeof currentObject === 'object' &&
      propertyKey in currentObject
    ) {
      return (currentObject as Record<string, any>)[propertyKey];
    }
    return null;
  }, object);
};

const columHeader = computed(() => {
  return (value: TableHeaders) => {
    if (value.alignHeaders?.length) {
      return {
        ColumnHeaderContent: {
          class: `${txtAlignHeaders(value)} font-extrabold`,
          mergeProps: true,
        },
      };
    }
    return {
      ColumnHeaderContent: {
        class: `text-start justify-start font-extrabold`,
        mergeProps: true,
      },
    };
  };
});

const widthColumn = (value: TableHeaders) => {
  if (typeof value.width === 'number') {
    return `${value.width}%`;
  }

  if (value?.width === undefined) {
    return 'auto';
  }
};

const txtAlignItems = (value: TableHeaders) => {
  if (!value.alignItems) {
    return 'start';
  }
  return value.alignItems;
};

const txtAlignHeaders = (value: TableHeaders) => {
  if (!value.alignHeaders) {
    return;
  }
  return `text-${value.alignHeaders} justify-${value.alignHeaders}`;
};

const updatePage = (value: number) => {
  emit('pageUpdate', value);
};
const perPageUpdate = (value: number) => {
  emit('perPageUpdate', value);
};
</script>
<style scoped></style>
