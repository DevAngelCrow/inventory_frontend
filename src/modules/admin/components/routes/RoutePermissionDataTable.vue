<template>
  <div class="w-full flex flex-wrap justify-start gap-2">
    <div class="flex w-full flex-wrap items-center gap-5">
      <AppInputText
        class="order-1 md:flex-1 grow"
        label="Buscar permiso..."
        v-model="filter_permission.name"
        @keydown.enter="debouncedSearchPermission"
      />
      <AppAutocomplete
        class="order-2 md:flex-1 grow"
        id="category"
        label="Categoría"
        v-model="filter_permission.category"
        option-label="name"
        :suggestions="filterCategories"
        dropdown
        @complete="findAutocomplete"
      />
      <div class="flex order-3 md:flex-1 grow items-center gap-2">
        <Button
          class="rounded_btn_search"
          icon="pi pi-search"
          @click="debouncedSearchPermission"
        />
        <Button
          class="rounded_btn_clean"
          :icon="
            filter_permission.name.length || filter_permission.category
              ? 'pi pi-filter-slash'
              : 'pi pi-filter'
          "
          variant="outlined"
          @click="debouncedCleanSearch"
          v-tooltip.bottom="
            filter_permission.name.length || filter_permission.category
              ? 'Quitar filtro'
              : 'Escriba para filtrar'
          "
        />
      </div>
      <div class="rounded_counter flex-1 order-4 opacity-65">
        <div class="flex justify-end items-center flex-col">
          <AppCircularCounter
            :selected="selectedPermissionsIds.size"
            :total="totalPermissions"
            color="#082f49"
            size="50px"
            v-tooltip.left="{ value: tooltipContent, escape: false }"
          />
          <span class="text-sm">Seleccionados</span>
        </div>
      </div>
    </div>
    <AppDataTable
      class="w-full"
      :headers="headerPermissions"
      :items="permissionItemsFormated"
      :paginator="true"
      :show-per-page-options="true"
      :per-page-options="[10, 20, 50, 100]"
      :per_page="permissionsPagination.per_page"
      :total_items="permissionsPagination.total_items"
      :page="permissionsPagination.page"
      @page-update="handlePagination"
      @per-page-update="handlePerPagePagination"
    >
      <template #header-Seleccion>
        <div class="flex justify-center flex-row">
          <AppCheckBox
            :readonly="props.readonly"
            binary
            @update:model-value="checkAll"
            v-model="selectAll"
          >
          </AppCheckBox>
          <span>{{ `Selección (${allSelectionsPerPage})` }}</span>
        </div>
      </template>
      <template #body-state="{ data, index }">
        <div class="flex justify-center">
          <AppCheckBox
            :readonly="props.readonly"
            binary
            :model-value="isPermissionSelected(data.id)"
            :id="`${index}`"
            @update:model-value="togglePermission(data.id, $event)"
          />
        </div>
      </template>
    </AppDataTable>
  </div>
</template>
<script setup lang="ts">
import {
  computed,
  defineComponent,
  inject,
  onMounted,
  ref,
  toRef,
  watch,
} from 'vue';
import { AutoCompleteCompleteEvent, Button } from 'primevue';

import { debounce } from '@/core/utils/debounceFunction';

import { useAdmin } from '../../composables/useAdmin';
import { CategoryPermissionsResponse } from '../../interfaces/role/role.category-permisions.response.interface';

type AdminType = ReturnType<typeof useAdmin>;

const admin = inject<AdminType>('useAdmin')!;

const props = defineProps<{
  modalState: 'add' | 'view' | 'edit' | 'delete' | 'closed';
  readonly: boolean;
}>();
const modalState = toRef(props, 'modalState');
const emit = defineEmits(['update:selected-permissions-ids', 'close-modal']);

const {
  headerPermissions,
  permissionsPagination,
  permissionsList,
  permissions_ids,
  filter_permission,
  getPermissions,
  findPermission,
  categories,
} = admin;

const selectedPermissionsIds = ref<Set<string>>(new Set());
const selectAll = ref<boolean>(false);
const permissionItemsFormated = ref<
  {
    id: string;
    name: string;
    description: string;
    active: boolean;
    state: boolean;
  }[]
>([]);
const totalPermissions = ref<number>(0);
const permissionsItemsLocal = ref<any>([]);
const permissionsItemsFindLocal = ref<any>([]);
const filterCategories = ref<CategoryPermissionsResponse[]>([]);

const searchPermission = async (value: {
  name: string;
  category?: { id: string; name: string; description: string };
}) => {
  if (!value) return;
  if (modalState.value === 'view') {
    let _filteredItems = [];

    const hasNameFilter = value.name && value.name.trim().length > 0;
    const hasCategoryFilter = value.category?.id && value.category.id !== '';

    for (let i = 0; i < permissionsItemsLocal.value.length; i++) {
      let item = permissionsItemsLocal.value[i];

      if (!hasNameFilter && !hasCategoryFilter) {
        _filteredItems.push(item);
        continue;
      }

      const matchesName =
        hasNameFilter &&
        item?.name?.toLowerCase().indexOf(value?.name?.toLowerCase() ?? '') ===
          0;

      const matchesCategory =
        hasCategoryFilter &&
        item?.id_category_permissions === value.category?.id;

      if (matchesName || matchesCategory) {
        _filteredItems.push(item);
      }
    }
    permissionItemsFormated.value = _filteredItems;
    permissionsItemsFindLocal.value = _filteredItems;
    permissionsPagination.total_items = permissionItemsFormated.value.length;
    localPaginationViewMode(0, true);
    return;
  }
  await findPermission(value);
  setPermissionsIds(permissionsList.value);
};

const debouncedSearchPermission = debounce(
  () => searchPermission(filter_permission.value),
  700,
);

const handlePagination = async (page: number) => {
  if (modalState.value === 'view') {
    permissionsPagination.page = page + 1;
    localPaginationViewMode(page);
    updateSelectAllState();
    return;
  }
  if (page + 1 === permissionsPagination.page) {
    return;
  }
  permissionsPagination.page = page + 1;
  await getPermissions();
  updateSelectAllState();
};

const handlePerPagePagination = async (perPage: number) => {
  if (modalState.value === 'view') {
    permissionsPagination.per_page = perPage;
    localPaginationViewMode(0);
    updateSelectAllState();
    return;
  }
  if (perPage === permissionsPagination.per_page) {
    return;
  }
  permissionsPagination.per_page = perPage;
  permissionsPagination.page = 1;
  await getPermissions();
  updateSelectAllState();
};

const isPermissionSelected = (permissionId: string) => {
  return selectedPermissionsIds.value.has(permissionId);
};

const checkAll = (flag: boolean) => {
  if (flag) {
    permissionItemsFormated.value.forEach(item => {
      selectedPermissionsIds.value.add(item.id);
    });
  } else {
    permissionItemsFormated.value.forEach(item => {
      selectedPermissionsIds.value.delete(item.id);
    });
  }
};

const togglePermission = (permissionId: string, isChecked: boolean) => {
  if (isChecked) {
    selectedPermissionsIds.value.add(permissionId);
  } else {
    selectedPermissionsIds.value.delete(permissionId);
  }
  updateSelectAllState();
};

const updateSelectAllState = (): void => {
  if (permissionItemsFormated.value.length === 0) {
    selectAll.value = false;
    return;
  }
  const allCurrentItemsSelected = permissionItemsFormated.value.every(item =>
    selectedPermissionsIds.value.has(item.id),
  );
  selectAll.value = allCurrentItemsSelected;
};

const setPermissionsIds = (
  value: {
    id: string;
    name: string;
    description: string;
    active: boolean;
  }[],
) => {
  if (value.length) {
    permissionItemsFormated.value = value.map(item => {
      return {
        ...item,
        state: false,
      };
    });
  }
};

const closeModal = () => {
  selectedPermissionsIds.value.clear();
  if (permissionsPagination.page > 1) {
    permissionsPagination.page = 1;
    getPermissions();
  }
  filter_permission.value = {
    name: '',
    category: { id: '', name: '', description: '' },
  };
  permissionItemsFormated.value = [];
  if (modalState.value === 'view') {
    getPermissions();
  }
  cleanSearch();
  emit('close-modal');
};

const cleanSearch = () => {
  filter_permission.value = {
    name: '',
    category: undefined,
  };
  if (modalState.value === 'view') {
    permissionItemsFormated.value = [...permissionsItemsLocal.value];
    totalPermissions.value = permissionsItemsLocal.value.length;
    permissionsPagination.total_items = totalPermissions.value;
    localPaginationViewMode(0);
    return;
  }
  getPermissions();
  totalPermissions.value = permissionsPagination.total_items;
};

const debouncedCleanSearch = debounce(cleanSearch, 700);

const localPaginationViewMode = (page: number, find?: boolean) => {
  let permissionsTemporalItems = [...permissionsItemsLocal.value];
  if (find) {
    permissionsTemporalItems = [...permissionsItemsFindLocal.value];
  }
  const currentPage = page + 1;
  const start = (currentPage - 1) * permissionsPagination.per_page;
  const end = currentPage * permissionsPagination.per_page;
  permissionItemsFormated.value = permissionsTemporalItems.slice(start, end);
};

const findAutocomplete = (event: AutoCompleteCompleteEvent) => {
  let query = event?.query;
  let _filteredItems = [];
  for (let i = 0; i < categories.value.length; i++) {
    let item = categories.value[i];
    if (item?.name?.toLowerCase().indexOf(query.toLowerCase()) === 0) {
      _filteredItems.push(item);
    }
  }
  filterCategories.value = _filteredItems;
};

const tooltipContent = computed(() => {
  return `<div style='text-align: center; display: flex; flex-direction: column; gap: 5px; font-weight: 200;'>
    <div><strong>Seleccionados</strong></div>
    <span style='text-align: center; border-top: 1px solid;'></span>
    <div><strong>Disponibles</strong></div>
  </div>`;
});

const allSelectionsPerPage = computed(() => {
  if (permissionItemsFormated.value.length < permissionsPagination.per_page) {
    return permissionItemsFormated.value.length;
  }
  return permissionsPagination.per_page;
});

watch(
  () => selectedPermissionsIds.value.size,
  () => {
    emit('update:selected-permissions-ids', selectedPermissionsIds.value);
  },
);

watch(permissionsList, newVal => {
  permissionItemsFormated.value = [];
  setPermissionsIds(newVal);
  updateSelectAllState();
  if (modalState.value === 'view') {
    permissionsItemsLocal.value = [...permissionItemsFormated.value];
    localPaginationViewMode(0);
    totalPermissions.value = permissionsItemsLocal.value.length;
  }
  totalPermissions.value = permissionsPagination.total_items;
});

watch(
  () => permissions_ids.value,
  newIds => {
    if (newIds && newIds.length > 0 && modalState.value === 'view') {
      selectedPermissionsIds.value.clear();
      newIds.forEach((id: string) => {
        selectedPermissionsIds.value.add(id);
      });
      updateSelectAllState();
    }
  },
  { immediate: true, deep: true },
);

onMounted(async () => {
  totalPermissions.value = permissionsPagination.total_items;
  setPermissionsIds(permissionsList.value);
  updateSelectAllState();
});

defineComponent({
  name: 'RoutePermissionDataTable',
});
defineExpose({
  closeModal,
});
</script>
<style scoped>
.rounded_counter {
  @apply flex justify-end items-center;
}

.item_justify_counter {
  @apply flex justify-end;
}

@media (min-width: 595px) {
  .rounded_btn_search {
    @apply rounded-full;
  }

  .rounded_btn_clean {
    @apply rounded-full;
  }
}

@media (min-width: 452px) and (max-width: 594px) {
  .rounded_btn_search {
    @apply rounded-full;
  }

  .rounded_btn_clean {
    @apply rounded-full;
  }
}

@media (min-width: 200px) and (max-width: 451px) {
  .rounded_btn_search {
    @apply rounded-full;
  }

  .rounded_btn_clean {
    @apply rounded-full;
  }
}

@media (max-width: 309px) {
  .item_justify_counter {
    @apply flex justify-start;
  }
}
</style>
