<template>
  <div class="py-5 px-5 h-full max-h-full flex gap-3 flex-col">
    <AppTitle :title="actionMode.title" />
    <section
      id="options"
      class="w-full flex justify-center md:justify-end gap-2 flex-wrap"
    >
      <Button
        v-if="actionMode.mode === 'view'"
        class="transform animate-ease-in min-w-25 grow md:grow-0"
        icon="pi pi-pencil"
        label="Editar"
        @click="showEditConfirmModal = true"
        severity="primary"
      />
      <Button
        v-if="actionMode.mode === 'edit' || actionMode.mode === 'add'"
        class="transform animate-ease-in min-w-25 grow md:grow-0"
        icon="pi pi-save"
        label="Guardar"
        @click="showSaveConfirmModal = true"
        severity="primary"
      />
      <Button
        v-if="actionMode.mode === 'edit' || actionMode.mode === 'add'"
        class="transform animate-ease-in min-w-25 grow md:grow-0"
        icon="pi pi-times"
        :label="actionMode.mode === 'add' ? 'Volver' : 'Cancelar'"
        @click="goBack"
        outlined
      />
      <Button
        v-if="actionMode.mode !== 'add'"
        class="transform animate-ease-in min-w-25 grow md:grow-0"
        icon="pi pi-arrow-left"
        label="Volver"
        @click="router.push({ name: 'routes-administration' })"
        outlined
      />
    </section>
    <section
      id="form"
      class="flex justify-center items-center w-full rounded-lg border-2 border-primary p-5 flex-col gap-5"
    >
      <div class="w-full flex flex-wrap gap-5">
        <h4 class="gap-3 flex justify-center items-center !font-bold">
          <i class="pi pi-directions !font-bold"></i>Información de la ruta
        </h4>
      </div>
      <RouteFormComponent :modal-state="formModalState" />
    </section>
    <section
      id="permissions"
      class="w-full flex justify-center items-center rounded-lg border-2 border-primary p-5 flex-col gap-5"
    >
      <div class="w-full flex flex-wrap gap-5">
        <h4 class="gap-3 flex justify-center items-center !font-bold">
          <i class="pi pi-key !font-bold"></i>Permisos
        </h4>
      </div>
      <RoutePermissionDataTable
        :modal-state="actionMode.mode ?? 'add'"
        @update:selected-permissions-ids="
          value => (selectedPermissionsIds = value)
        "
        ref="routePermissionDataTable"
        :readonly="actionMode.isReadonly"
      />
    </section>

    <!-- Modal de confirmación para editar -->
    <AppModal
      :show="showEditConfirmModal"
      title="Confirmar para iniciar la edición"
      titleBtnCancel="Cancelar"
      titleBtnConfirm="Aceptar"
      width="30rem"
      @close-modal="showEditConfirmModal = false"
      @confirm-modal="confirmEdit"
    >
      <div class="p-4 text-center">
        <p class="text-lg">
          ¿Está seguro que desea iniciar la edición de esta ruta?
        </p>
      </div>
    </AppModal>

    <!-- Modal de confirmación para guardar -->
    <AppModal
      :show="showSaveConfirmModal"
      title="Confirmar guardado"
      titleBtnCancel="Cancelar"
      titleBtnConfirm="Guardar"
      width="30rem"
      @close-modal="showSaveConfirmModal = false"
      @confirm-modal="confirmSave"
    >
      <div class="p-4 text-center">
        <p class="text-lg">
          ¿Está seguro que desea
          {{ actionMode.mode === 'add' ? 'crear' : 'guardar los cambios de' }}
          esta ruta?
        </p>
      </div>
    </AppModal>
  </div>
</template>
<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  onMounted,
  provide,
  nextTick,
  watch,
} from 'vue';
import { Button } from 'primevue';
import { useRoute, useRouter } from 'vue-router';

import { useLoaderStore } from '@/core/store';

import { useAdmin } from '../composables/useAdmin';
import RoutePermissionDataTable from '../components/routes/RoutePermissionDataTable.vue';
import RouteFormComponent from '../components/routes/RouteForm.vue';
import { RouteForm } from '../interfaces/routes/route-form.interface';
import { RoutesResponse } from '../interfaces/routes/routes.response.interface';

const adminInstance = useAdmin();
provide('useAdmin', adminInstance);

const route = useRoute();
const router = useRouter();

const actionMode = reactive<{
  mode?: 'add' | 'view' | 'edit';
  title: string;
  isReadonly: boolean;
}>({
  title: 'Crear nueva ruta',
  isReadonly: false,
});

const {
  child_route,
  resetField,
  handleSubmit,
  addRoute,
  editRoute,
  getPermissions,
  getCategoryPermissions,
  getRouteById,
  setRouteItem,
  permissionsPagination,
  loadParentRoutes,
} = adminInstance;

const { startLoading, finishLoading } = useLoaderStore();
const selectedPermissionsIds = ref<Set<string>>(new Set());
const showEditConfirmModal = ref(false);
const showSaveConfirmModal = ref(false);

const formModalState = computed(() => ({
  show: true,
  mode: (actionMode.mode ?? 'add') as
    | 'add'
    | 'view'
    | 'edit'
    | 'delete'
    | 'closed',
  title: actionMode.title,
  description: '',
  isReadonly: actionMode.isReadonly,
  selectedItem: null as null | string,
}));

const confirmSave = handleSubmit(async values => {
  showSaveConfirmModal.value = false;
  try {
    startLoading();
    const form: RouteForm = {
      name: values.name,
      description: values.description,
      icon: values.icon,
      order: values.order,
      show: values.show ? true : false,
      uri: values.uri,
      id_parent: values.parent?.id ?? null,
      title: values.title,
      permissions_id: [...selectedPermissionsIds.value],
      required_auth: values.required_auth ?? false,
      child_route: values.child_route ?? false,
    };
    switch (actionMode.mode) {
      case 'add':
        await addRoute(form);
        router.push({ name: 'routes-administration' });
        break;
      case 'edit':
        form.id = values.id;
        form.active = values.active;
        await editRoute(form);
        goBack();
        break;
    }
  } catch (error) {
    console.error(error);
  } finally {
    finishLoading();
  }
});

const confirmEdit = async () => {
  showEditConfirmModal.value = false;
  actionMode.mode = 'edit';
  actionMode.title = 'Editar ruta';
  actionMode.isReadonly = false;
  permissionsPagination.page = 1;
  await getPermissions();
};

const goBack = async () => {
  if (actionMode.mode === 'add') {
    router.push({ name: 'routes-administration' });
    return;
  }
  actionMode.mode = 'view';
  actionMode.title = 'Detalle de la ruta';
  actionMode.isReadonly = true;
  const routeData = await getRouteById(route.params.id as string);
  if (!routeData || !routeData.data) {
    console.error('No se pudo obtener la ruta');
    return;
  }
  const data = {
    id: routeData.data.id,
    name: routeData.data.name,
    title: routeData.data.title,
    uri: routeData.data.uri,
    description: routeData.data.description,
    order: routeData.data.order,
    icon: routeData.data.icon,
    parent: routeData.data.parent,
    show: routeData.data.show,
    active: routeData.data.active,
    permissions: routeData.data.permissions,
    required_auth: (routeData.data as any).required_auth ?? false,
  };
  setRouteItem(data as RoutesResponse);
};

watch(
  child_route,
  (newValue, oldValue) => {
    if (oldValue === true && newValue === false) {
      try {
        nextTick(() => {
          resetField('parent', { errors: undefined, value: null });
        });
      } catch (error) {
        console.error(error);
      }
    }
  },
  { immediate: false },
);

onMounted(async () => {
  try {
    await loadParentRoutes();
    await getPermissions();
    await getCategoryPermissions();
    if (route?.params?.id) {
      actionMode.mode = 'view';
      actionMode.title = 'Detalle de la ruta';
      actionMode.isReadonly = true;
      const routeData = await getRouteById(route.params.id as string);
      if (!routeData || !routeData.data) {
        console.error('No se pudo obtener la ruta');
        return;
      }
      // console.log('Route data:', routeData.data);
      const data = {
        id: routeData.data.id,
        name: routeData.data.name,
        title: routeData.data.title,
        uri: routeData.data.uri,
        description: routeData.data.description,
        order: routeData.data.order,
        icon: routeData.data.icon,
        parent: routeData.data.parent,
        show: routeData.data.show,
        active: routeData.data.active,
        permissions: routeData.data.permissions,
        required_auth: (routeData.data as any).required_auth ?? false,
      };
      setRouteItem(data as RoutesResponse);
      return;
    }
    actionMode.mode = 'add';
    actionMode.title = 'Crear nueva ruta';
  } catch (error) {
    console.error(error);
  }
});
</script>
