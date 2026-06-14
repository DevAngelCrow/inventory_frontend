import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { nextTick, reactive, ref } from 'vue';

import adminServices from '@/core/services/index.services';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';
import { TableHeaders } from '@/core/interfaces';

import { RouteForm } from '../interfaces/routes/route-form.interface';
import { RouteParentAutocomplete } from '../interfaces/routes/route-parent-autocomplete-obj.interface';
import { RoutesResponse } from '../interfaces/routes/routes.response.interface';
import { CategoryPermissionsResponse } from '../interfaces/role/role.category-permisions.response.interface';

type FilterType = {
  filter_name?: string;
  active?: boolean;
  show?: boolean;
  id_parent?: string;
  required_auth?: boolean;
};
export function useAdmin() {
  const {
    errors,
    defineField,
    handleSubmit,
    validateField,
    resetForm,
    resetField,
    setFieldError,
    setFieldValue,
  } = useForm({
    validationSchema: yup.object({
      id: yup.string().typeError('El campo id debe ser de tipo string'),
      name: yup
        .string()
        .required('El nombre de la ruta es requerido')
        .max(150, 'El nombre no puede tener más de 150 caracteres')
        .min(4, 'El nombre debe tener al menos 3 caracteres'),
      title: yup
        .string()
        .required('El título de la ruta es requerido')
        .max(150, 'El título no puede tener más de 150 caracteres')
        .min(3, 'El título debe tener al menos 3 caracteres'),
      uri: yup
        .string()
        .required('El campo uri es requerido')
        .max(150, 'El uri no puede tener más de 150 caracteres')
        .min(4, 'El campo uri debe tener al menos 3 caracteres')
        .test(
          'valid_uri',
          'El nombre de la uri no es del formato valido',
          value => {
            if (routeValidRegex.test(value)) {
              return true;
            }
            return false;
          },
        ),
      description: yup
        .string()
        .max(255, 'La descripción no puede tener más de 255 caracteres'),
      order: yup
        .number()
        .typeError('El campo debe ser de tipo entero')
        .required('El campo es requerido'),
      icon: yup
        .string()
        .min(2)
        .max(150, 'El icono no puede tener más de 255 caracteres'),
      child_route: yup.boolean(),
      show: yup.boolean(),
      active: yup.boolean(),
      parent: yup.mixed<RouteParentAutocomplete>().when('child_route', {
        is: true,
        then: schema => schema.required('El campo de ruta padre es requerido'),
        otherwise: schema => schema.nullable().notRequired(),
      }),
      permissions_ids: yup.array(),
      required_auth: yup.boolean(),
    }),
  });

  const headers = ref<TableHeaders[]>([
    {
      field: 'name',
      header: 'Nombre',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'description',
      header: 'Descripción',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'uri',
      header: 'Uri',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'parent.uri',
      header: 'Ruta padre',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'icon',
      header: 'Ícono',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
    },

    {
      field: 'show',
      header: 'Mostrar en menú',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
    },
    {
      field: 'order',
      header: 'Orden',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
    },

    {
      field: 'active',
      header: 'Estado',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
    },
    {
      field: 'acciones',
      header: 'Acciones',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
    },
  ]);

  const headerPermissions = ref<TableHeaders[]>([
    {
      field: 'state',
      header: 'Seleccion',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
      width: 10,
    },
    {
      field: 'name',
      header: 'Nombre',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
  ]);

  const parentRoutes = ref<
    { title: string; id: string; uri: string; name: string }[]
  >([]);

  const items = ref<RoutesResponse[] | undefined>([]);
  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
  });
  const permissionsPagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
  });
  const { startLoading, finishLoading } = useLoaderStore();
  const alert = useAlertStore();

  const [id, idAttrs] = defineField('id');
  const [name, nameAttrs] = defineField('name');
  const [title, titleAttrs] = defineField('title');
  const [uri, uriAttrs] = defineField('uri');
  const [description, descriptionAttrs] = defineField('description');
  const [order, orderAttrs] = defineField('order');
  const [icon, iconAttrs] = defineField('icon');
  const [child_route, child_routeAttrs] = defineField('child_route');
  const [show, showAttrs] = defineField('show');
  const [active, activeAttrs] = defineField('active');
  const [parent, parentAttrs] = defineField('parent');
  const [permissions_ids, permissions_idsAttrs] =
    defineField('permissions_ids');
  const [required_auth, required_authAttrs] = defineField('required_auth');

  const filter = reactive<FilterType>({
    active: undefined,
    show: undefined,
    id_parent: undefined,
    required_auth: undefined,
  });
  const filter_permission = ref<{
    name: string;
    category?: {
      id: string;
      name: string;
      description: string;
    };
  }>({ name: '' });
  const categories = ref<CategoryPermissionsResponse[]>([]);
  const invalidRouteRegex = /[^A-Za-z0-9\-/]/g;
  const routeValidRegex =
    /^(?:\/|\/[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*(?:\/[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)*)$/;

  const findRegex = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ.0-9 ]/g;

  const permissionsList = ref<
    {
      id: string;
      name: string;
      description: string;
      active: boolean;
    }[]
  >([]);

  const getRoutes = async () => {
    try {
      startLoading();
      const params: {
        page?: number;
        per_page?: number;
        name?: string;
        active?: boolean;
        show?: boolean;
        id_parent?: string;
        required_auth?: boolean;
      } = {
        page: pagination.page,
        per_page: pagination.per_page,
        name: filter.filter_name,
        ...filter,
      };
      const response = await adminServices.getAllRoutes(params);
      if (response.statusCode === 200) {
        pagination.page = response.data.current_page;
        pagination.per_page = response.data.per_page;
        pagination.total_items = response.data.total_items;
        items.value = response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error al obtener el listado de rutas', error);
    } finally {
      finishLoading();
    }
  };

  // Nueva función para cargar solo rutas padre
  const loadParentRoutes = async () => {
    try {
      startLoading();
      const response = await adminServices.getAllRoutesWithOutPaginate();
      if (response.statusCode === 200) {
        parentRoutes.value = response.data
          .filter(item => item.parent === null || item.parent === undefined)
          .map(item => ({
            title: item.title,
            id: item.id,
            uri: item.uri,
            name: item.name,
          }));
      }
    } catch (error) {
      console.error('Error al cargar rutas padre', error);
    } finally {
      finishLoading();
    }
  };
  const getRouteById = async (id: string) => {
    try {
      startLoading();
      permissionsList.value = [];
      permissionsPagination.per_page = 0;
      permissionsPagination.total_items = 0;
      const response = await adminServices.getRoute(id);
      if (response.statusCode === 200) {
        permissionsList.value = response.data.permissions
          ? response.data.permissions
          : [];
        permissionsPagination.per_page = 10;
        permissionsPagination.total_items = response?.data?.permissions?.length;
      }
      return response;
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };
  const addRoute = async (form: RouteForm) => {
    try {
      startLoading();
      if (form.id_parent) {
        form.uri = `${form.uri}`;
      }
      const response = await adminServices.addRoute({ ...form, active: true });
      if (response.status === 201) {
        getRoutes();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message}`,
          show: true,
        });
        return response.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };
  const editRoute = async (form: RouteForm) => {
    try {
      startLoading();
      const { id, ...body } = form;
      const response = await adminServices.editRoute(id!, body);
      if (response.status === 200) {
        getRoutes();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message}`,
          show: true,
        });
        return response.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  const toggleRoute = async (id: string) => {
    try {
      startLoading();
      const response = await adminServices.toggleRoute(id);
      if (response.status === 200) {
        getRoutes();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message}`,
          show: true,
        });
        return response.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  const findPermission = (value: {
    name: string;
    category?: {
      id: string;
      name: string;
      description: string;
    };
  }) => {
    if (value) {
      getPermissions();
    }
  };
  const getPermissions = async () => {
    try {
      startLoading();
      const filter = {
        page: permissionsPagination.page,
        per_page: permissionsPagination.per_page,
        name: filter_permission.value.name
          ? filter_permission.value.name
          : undefined,
        category_permission_id: filter_permission.value.category?.id,
        active: true,
      };
      const response = await adminServices.getPermissions(filter);
      if (response.statusCode === 200) {
        permissionsList.value = response.data.data;
        permissionsPagination.page = response.data.current_page;
        permissionsPagination.per_page = response.data.per_page;
        permissionsPagination.total_items = response.data.total_items;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };
  const getCategoryPermissions = async () => {
    try {
      startLoading();
      const filters = {
        active: true,
      };
      const response = await adminServices.getCategoryPermissions(filters);
      if (response.statusCode === 200) {
        categories.value = response.data.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };
  const validateInputUri = (
    value: string,
    input: string,
    regex: RegExp = invalidRouteRegex,
  ) => {
    const sanitizedValue = sanitizedValueInput(value, regex);

    if (!routeValidRegex.test(sanitizedValue)) {
      console.error('Ruta invalida', sanitizedValue);
    }
    nextTick(() => {
      setFieldValue(input, sanitizedValue);
    });
  };

  const validateAlphaInput = (
    value: string | undefined,
    regex: RegExp = findRegex,
  ) => {
    if (!value) {
      value = '';
    }
    const sanitizedValue = sanitizedValueInput(value, regex);
    nextTick(() => {
      filter.filter_name = sanitizedValue;
    });
  };

  const cleanSearch = () => {
    if (
      (!filter.filter_name || filter.filter_name === '') &&
      !filter.active &&
      !filter.show &&
      !filter.id_parent &&
      !filter.required_auth
    ) {
      return;
    }
    filter.filter_name = undefined;
    filter.active = undefined;
    filter.show = undefined;
    filter.id_parent = undefined;
    filter.required_auth = undefined;
    getRoutes();
  };

  const setRouteItem = (value: RoutesResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('name', value?.name);
    setFieldValue('title', value?.title);
    setFieldValue('uri', value?.uri);
    setFieldValue('description', value?.description);
    setFieldValue('order', value?.order);
    setFieldValue('icon', value?.icon);
    setFieldValue('parent', value?.parent);
    setFieldValue('child_route', !!parent.value);
    setFieldValue('show', value?.show);
    setFieldValue('active', value.active);
    setFieldValue(
      'permissions_ids',
      value.permissions?.length
        ? value.permissions.map(permission => permission.id)
        : [],
    );
    setFieldValue('required_auth', value.required_auth);
  };

  const findRoute = (value: FilterType) => {
    if (value) {
      getRoutes();
    }
  };
  return {
    getRoutes,
    loadParentRoutes,
    addRoute,
    editRoute,
    toggleRoute,
    getRouteById,
    id,
    idAttrs,
    name,
    nameAttrs,
    title,
    titleAttrs,
    uri,
    uriAttrs,
    description,
    descriptionAttrs,
    order,
    orderAttrs,
    icon,
    iconAttrs,
    child_route,
    child_routeAttrs,
    show,
    showAttrs,
    active,
    activeAttrs,
    parent,
    parentAttrs,
    permissions_ids,
    permissions_idsAttrs,
    required_auth,
    required_authAttrs,
    errors,
    handleSubmit,
    validateField,
    parentRoutes,
    resetForm,
    resetField,
    setFieldError,
    items,
    validateInputUri,
    filter,
    validateAlphaInput,
    cleanSearch,
    setRouteItem,
    findRoute,
    pagination,
    headers,
    getPermissions,
    permissionsList,
    headerPermissions,
    permissionsPagination,
    findPermission,
    filter_permission,
    getCategoryPermissions,
    categories,
  };
}
