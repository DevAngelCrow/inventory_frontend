<template>
  <div class="w-full flex flex-wrap justify-start gap-2">
    <div class="flex w-full flex-wrap items-center gap-5">
      <AppInputText
        class="order-1 md:flex-1 grow"
        label="Buscar rol..."
        v-model="filter_role_name"
        @keydown.enter="debouncedSearchRole"
      />
      <div class="flex order-2 md:flex-1 grow items-center gap-2">
        <Button
          class="rounded_btn_search"
          icon="pi pi-search"
          @click="debouncedSearchRole"
        />
        <Button
          class="rounded_btn_clean"
          :icon="filter_role_name ? 'pi pi-filter-slash' : 'pi pi-filter'"
          variant="outlined"
          @click="debouncedCleanSearch"
          v-tooltip.bottom="
            filter_role_name ? 'Quitar filtro' : 'Escriba para filtrar'
          "
        />
      </div>
      <div class="rounded_counter flex-1 order-3 opacity-65">
        <div class="flex justify-end items-center flex-col">
          <AppCircularCounter
            :selected="selectedRolesIds.size"
            :total="totalRoles"
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
      :headers="headersRole"
      :items="roleItemsFormatted"
      :paginator="true"
      :show-per-page-options="true"
      :per-page-options="[10, 20, 50, 100]"
      :per_page="rolesPagination.per_page"
      :total_items="totalRoles"
      :page="rolesPagination.page"
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
          />
          <span>{{ `Selección (${allSelectionsPerPage})` }}</span>
        </div>
      </template>
      <template #body-state="{ data, index }">
        <div class="flex justify-center">
          <AppCheckBox
            :readonly="props.readonly"
            binary
            :model-value="isRoleSelected(data.id)"
            :id="`${index}`"
            @update:model-value="toggleRole(data.id, $event)"
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
import { Button } from 'primevue';

import { debounce } from '@/core/utils/debounceFunction';

import { useUserRole } from '../../composables/useUserRole';

type UserRoleType = ReturnType<typeof useUserRole>;

const userRoleInstance = inject<UserRoleType>('useUserRole')!;

const props = defineProps<{
  modalState: 'add' | 'view' | 'edit' | 'delete' | 'closed';
  readonly: boolean;
}>();
const modalState = toRef(props, 'modalState');
const emit = defineEmits(['update:selected-roles-ids', 'close-modal']);

const {
  headersRole,
  rolesPagination,
  rolesList,
  userAssignedRoles,
  roles_ids,
  filter_role_name,
  getRoles,
} = userRoleInstance;

const selectedRolesIds = ref<Set<string>>(new Set());
const selectAll = ref<boolean>(false);
const roleItemsFormatted = ref<
  {
    id: string;
    name: string;
    description: string;
    code: string;
    state: boolean;
  }[]
>([]);
const totalRoles = ref<number>(0);
const rolesItemsLocal = ref<
  {
    id: string;
    name: string;
    description: string;
    code: string;
    state: boolean;
  }[]
>([]);
const rolesItemsFindLocal = ref<
  {
    id: string;
    name: string;
    description: string;
    code: string;
    state: boolean;
  }[]
>([]);

const searchRole = async () => {
  if (modalState.value === 'view') {
    const query = filter_role_name.value?.toLowerCase() ?? '';
    let filtered = rolesItemsLocal.value;
    if (query) {
      filtered = rolesItemsLocal.value.filter(item =>
        item.name.toLowerCase().startsWith(query),
      );
    }
    rolesItemsFindLocal.value = filtered;
    totalRoles.value = filtered.length;
    rolesPagination.total_items = filtered.length;
    localPaginationViewMode(0, true);
    return;
  }
  await getRoles();
  setRolesItems(rolesList.value);
};

const debouncedSearchRole = debounce(searchRole, 700);

const handlePagination = async (page: number) => {
  if (modalState.value === 'view') {
    rolesPagination.page = page + 1;
    localPaginationViewMode(page);
    updateSelectAllState();
    return;
  }
  if (page + 1 === rolesPagination.page) return;
  rolesPagination.page = page + 1;
  await getRoles();
  updateSelectAllState();
};

const handlePerPagePagination = async (perPage: number) => {
  if (modalState.value === 'view') {
    rolesPagination.per_page = perPage;
    localPaginationViewMode(0);
    updateSelectAllState();
    return;
  }
  if (perPage === rolesPagination.per_page) return;
  rolesPagination.per_page = perPage;
  rolesPagination.page = 1;
  await getRoles();
  updateSelectAllState();
};

const isRoleSelected = (roleId: string) => {
  return selectedRolesIds.value.has(roleId);
};

const checkAll = (flag: boolean) => {
  if (flag) {
    roleItemsFormatted.value.forEach(item => {
      selectedRolesIds.value.add(item.id);
    });
  } else {
    roleItemsFormatted.value.forEach(item => {
      selectedRolesIds.value.delete(item.id);
    });
  }
};

const toggleRole = (roleId: string, isChecked: boolean) => {
  if (isChecked) {
    selectedRolesIds.value.add(roleId);
  } else {
    selectedRolesIds.value.delete(roleId);
  }
  updateSelectAllState();
};

const updateSelectAllState = (): void => {
  if (roleItemsFormatted.value.length === 0) {
    selectAll.value = false;
    return;
  }
  const allCurrentSelected = roleItemsFormatted.value.every(item =>
    selectedRolesIds.value.has(item.id),
  );
  selectAll.value = allCurrentSelected;
};

const setRolesItems = (
  value: { id: string; name: string; description: string; code: string }[],
) => {
  if (value.length) {
    roleItemsFormatted.value = value.map(item => ({
      ...item,
      state: false,
    }));
  }
};

const closeModal = () => {
  selectedRolesIds.value.clear();
  if (rolesPagination.page > 1) {
    rolesPagination.page = 1;
    getRoles();
  }
  filter_role_name.value = null;
  roleItemsFormatted.value = [];
  cleanSearch();
  emit('close-modal');
};

const cleanSearch = () => {
  filter_role_name.value = null;
  if (modalState.value === 'view') {
    roleItemsFormatted.value = [...rolesItemsLocal.value];
    totalRoles.value = rolesItemsLocal.value.length;
    rolesPagination.total_items = totalRoles.value;
    localPaginationViewMode(0);
    return;
  }
  getRoles();
  totalRoles.value = rolesPagination.total_items;
};

const debouncedCleanSearch = debounce(cleanSearch, 700);

const localPaginationViewMode = (page: number, find?: boolean) => {
  let itemsSource = find ? rolesItemsFindLocal.value : rolesItemsLocal.value;
  const currentPage = page + 1;
  const start = (currentPage - 1) * rolesPagination.per_page;
  const end = currentPage * rolesPagination.per_page;
  roleItemsFormatted.value = itemsSource.slice(start, end);
};

const tooltipContent = computed(() => {
  return `<div style='text-align: center; display: flex; flex-direction: column; gap: 5px; font-weight: 200;'>
    <div><strong>Seleccionados</strong></div>
    <span style='text-align: center; border-top: 1px solid;'></span>
    <div><strong>Disponibles</strong></div>
  </div>`;
});

const allSelectionsPerPage = computed(() => {
  if (roleItemsFormatted.value.length < rolesPagination.per_page) {
    return roleItemsFormatted.value.length;
  }
  return rolesPagination.per_page;
});

watch(
  () => selectedRolesIds.value.size,
  () => {
    emit('update:selected-roles-ids', selectedRolesIds.value);
  },
);

watch(rolesList, newVal => {
  roleItemsFormatted.value = [];
  setRolesItems(newVal);
  updateSelectAllState();
  if (modalState.value === 'view') {
    rolesItemsLocal.value = [...roleItemsFormatted.value];
    localPaginationViewMode(0);
    totalRoles.value = rolesItemsLocal.value.length;
  }
  totalRoles.value = rolesPagination.total_items;
});

watch(
  () => roles_ids.value,
  newIds => {
    if (newIds && newIds.length > 0) {
      selectedRolesIds.value.clear();
      newIds.forEach((id: string) => {
        selectedRolesIds.value.add(id);
      });
      updateSelectAllState();
    }
  },
  { immediate: true, deep: true },
);

watch(
  () => userAssignedRoles.value,
  newRoles => {
    if (modalState.value === 'view' && newRoles && newRoles.length > 0) {
      const formatted = newRoles.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        code: r.code,
        state: false,
      }));
      rolesItemsLocal.value = formatted;
      rolesItemsFindLocal.value = formatted;
      totalRoles.value = formatted.length;
      rolesPagination.total_items = formatted.length;
      localPaginationViewMode(0);
    }
  },
  { immediate: true, deep: true },
);

onMounted(async () => {
  if (modalState.value !== 'view') {
    totalRoles.value = rolesPagination.total_items;
    setRolesItems(rolesList.value);
    updateSelectAllState();
  }
});

defineComponent({
  name: 'UserRoleRoleDataTable',
});
defineExpose({
  closeModal,
});
</script>
<style scoped>
@reference "@/core/assets/style.css";

.rounded_counter {
  @apply flex justify-end items-center;
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
</style>
