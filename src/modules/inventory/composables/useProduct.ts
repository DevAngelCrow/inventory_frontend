import { useForm } from 'vee-validate';
import { nextTick, reactive, ref } from 'vue';
import * as yup from 'yup';

import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';
import { debounce } from '@/core/utils/debounceFunction';

import {
  ProductResponse,
  ProductForm,
  ProductCategoryResponse,
  MeasurementUnitResponse,
} from '../interfaces/inventory.interfaces';
import inventoryServices from '../Services/inventory.services';

type filterType = {
  filter_name?: string;
  sku?: string;
  category_id?: string;
  active?: boolean | 'Todos';
};

export function useProduct() {
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
      id: yup.string().nullable(),
      name: yup
        .string()
        .required('El nombre del producto es requerido')
        .max(200, 'El nombre no puede tener más de 200 caracteres'),
      description: yup
        .string()
        .max(500, 'La descripción no puede tener más de 500 caracteres')
        .nullable(),
      sku: yup
        .string()
        .required('El SKU es requerido')
        .max(50, 'El SKU no puede tener más de 50 caracteres'),
      rental_price: yup
        .number()
        .typeError('El precio debe ser un número')
        .required('El precio de alquiler es requerido')
        .min(0, 'El precio no puede ser negativo'),
      replacement_cost: yup
        .number()
        .typeError('El costo de reposición debe ser un número')
        .min(0, 'El costo no puede ser negativo')
        .nullable(),
      total_stock: yup
        .number()
        .typeError('El stock debe ser un número entero')
        .integer('El stock debe ser un número entero')
        .required('El stock total es requerido')
        .min(0, 'El stock no puede ser negativo'),
      min_stock_alert: yup
        .number()
        .typeError('El stock de alerta debe ser un número entero')
        .integer('El stock de alerta debe ser un número entero')
        .min(0, 'El stock no puede ser negativo')
        .nullable(),
      color: yup
        .string()
        .max(50, 'El color no puede tener más de 50 caracteres')
        .nullable(),
      dimensions: yup
        .object({
          width: yup
            .number()
            .typeError('El ancho debe ser numérico')
            .min(0, 'No puede ser negativo')
            .optional()
            .nullable(),
          height: yup
            .number()
            .typeError('El alto debe ser numérico')
            .min(0, 'No puede ser negativo')
            .optional()
            .nullable(),
          depth: yup
            .number()
            .typeError('La profundidad debe ser numérica')
            .nullable()
            .min(0, 'No puede ser negativo')
            .transform((value, originalValue) =>
              String(originalValue).trim() === '' ? null : value,
            ),
          unitId: yup.string().optional().nullable(),
        })
        .nullable()
        .optional(),
      weight_lbs: yup
        .number()
        .typeError('El peso debe ser un número')
        .min(0)
        .nullable(),
      image_url: yup.string().nullable(),
      image_file: yup.array().nullable(),
      notes: yup.string().nullable(),
      category_id: yup.string().required('La categoría es requerida'),
      active: yup.boolean(),
    }),
  });

  const headers = ref<TableHeaders[]>([
    {
      field: 'name',
      header: 'Producto',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'sku',
      header: 'SKU',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'rental_price',
      header: 'Precio Alquiler',
      sortable: false,
      alignHeaders: 'end',
      alignItems: 'end',
      width: 10,
    },
    {
      field: 'total_stock',
      header: 'Stock Total',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
      width: 10,
    },
    {
      field: 'category_id',
      header: 'Categoría',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
      width: 15,
    },
    {
      field: 'active',
      header: 'Estado',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
      width: 10,
    },
    {
      field: 'acciones',
      header: 'Acciones',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
    },
  ]);

  const products = ref<ProductResponse[]>([]);
  const categoriesList = ref<ProductCategoryResponse[]>([]);
  const measurementUnitsList = ref<MeasurementUnitResponse[]>([]);
  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
  });

  const { startLoading, finishLoading } = useLoaderStore();
  const alert = useAlertStore();

  const [id, idAttrs] = defineField('id');
  const [name, nameAttrs] = defineField('name');
  const [description, descriptionAttrs] = defineField('description');
  const [sku, skuAttrs] = defineField('sku');
  const [rental_price, rentalPriceAttrs] = defineField('rental_price');
  const [replacement_cost, replacementCostAttrs] =
    defineField('replacement_cost');
  const [total_stock, totalStockAttrs] = defineField('total_stock');
  const [min_stock_alert, minStockAlertAttrs] = defineField('min_stock_alert');
  const [color, colorAttrs] = defineField('color');
  const [dimensions, dimensionsAttrs] = defineField('dimensions');
  const [weight_lbs, weightLbsAttrs] = defineField('weight_lbs');
  const [image_url, imageUrlAttrs] = defineField('image_url');
  const [image_file, imageFileAttrs] = defineField('image_file');
  const [notes, notesAttrs] = defineField('notes');
  const [category_id, categoryIdAttrs] = defineField('category_id');
  const [active, activeAttrs] = defineField('active');

  const filter = reactive<filterType>({
    filter_name: undefined,
    sku: undefined,
    category_id: undefined,
    active: undefined,
  });
  const findRegex = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ.0-9 -]/g;

  const getProducts = async () => {
    try {
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        filter_name: filter.filter_name,
        sku: filter.sku,
        category_id:
          filter.category_id === 'Todos' ? undefined : filter.category_id,
        active:
          filter.active === 'Todos'
            ? undefined
            : (filter.active as boolean | undefined),
      };
      const response = await inventoryServices.getProducts(params);

      if (response.statusCode === 200) {
        products.value = response.data.data;
        pagination.page = response.data.current_page;
        pagination.per_page = response.data.per_page;
        pagination.total_items = response.data.total_items;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await inventoryServices.getCategories({
        active: true,
        per_page: 100,
      });
      if (response.statusCode === 200) {
        categoriesList.value = response.data.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadMeasurementUnits = async () => {
    try {
      const data = await inventoryServices.getActiveMeasurementUnits();
      measurementUnitsList.value = data;
    } catch (error) {
      console.error(error);
    }
  };

  const buildProductFormData = (form: ProductForm): FormData => {
    const formData = new FormData();
    if (form.name) formData.append('name', form.name);
    if (form.description) formData.append('description', form.description);
    if (form.sku) formData.append('sku', form.sku);
    if (form.rental_price !== undefined && form.rental_price !== null)
      formData.append('rental_price', String(form.rental_price));
    if (form.replacement_cost !== undefined && form.replacement_cost !== null)
      formData.append('replacement_cost', String(form.replacement_cost));
    if (form.total_stock !== undefined && form.total_stock !== null)
      formData.append('total_stock', String(form.total_stock));
    if (form.min_stock_alert !== undefined && form.min_stock_alert !== null)
      formData.append('min_stock_alert', String(form.min_stock_alert));
    if (form.color) formData.append('color', form.color);
    if (form.dimensions)
      formData.append('dimensions', JSON.stringify(form.dimensions));
    if (form.weight_lbs !== undefined && form.weight_lbs !== null)
      formData.append('weight_lbs', String(form.weight_lbs));
    if (form.notes) formData.append('notes', form.notes);
    if (form.category_id) formData.append('category_id', form.category_id);
    if (form.image_url) formData.append('image_url', form.image_url);

    if (form.image_file && form.image_file.length > 0) {
      const file = form.image_file[0];
      // Only append if it's a real File object with size > 0, to avoid uploading the mocked objectURL
      if (file instanceof File && file.size > 0) {
        formData.append('image_file', file);
      }
    }
    return formData;
  };

  const addProduct = async (form: ProductForm) => {
    try {
      startLoading();
      const formData = buildProductFormData(form);
      const response = await inventoryServices.postProduct(formData);
      if (response.status === 201) {
        await getProducts();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message || 'Producto creado con éxito'}`,
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

  const editProduct = async (form: ProductForm) => {
    try {
      startLoading();
      const formData = buildProductFormData(form);
      const response = await inventoryServices.putProduct(form.id!, formData);
      if (response.status === 200) {
        await getProducts();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message || 'Producto actualizado con éxito'}`,
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

  const patchProduct = async (id: string) => {
    try {
      startLoading();
      const response = await inventoryServices.toggleProduct(id);
      if (response.status === 200) {
        await getProducts();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message || 'Estado del producto modificado'}`,
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

  const validateAlphaInput = (
    value: string | null | undefined,
    field: 'filter_name' | 'sku',
    regex: RegExp = findRegex,
  ) => {
    if (!value) {
      value = '';
    }
    const sanitizedValue = sanitizedValueInput(value, regex);
    nextTick(() => {
      filter[field] = sanitizedValue;
    });
  };

  const cleanSearch = async () => {
    startLoading();
    filter.filter_name = undefined;
    filter.sku = undefined;
    filter.category_id = undefined;
    filter.active = undefined;
    await getProducts();
    finishLoading();
  };

  const setProductItem = (value: ProductResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('name', value?.name);
    setFieldValue('description', value?.description);
    setFieldValue('sku', value?.sku);
    setFieldValue('rental_price', Number(value?.rental_price));
    setFieldValue(
      'replacement_cost',
      value?.replacement_cost !== null && value?.replacement_cost !== undefined
        ? Number(value?.replacement_cost)
        : undefined,
    );
    setFieldValue('total_stock', value?.total_stock);
    setFieldValue('min_stock_alert', value?.min_stock_alert);
    setFieldValue('color', value?.color);
    setFieldValue('dimensions', value?.dimensions);
    setFieldValue(
      'weight_lbs',
      value?.weight_lbs !== null && value?.weight_lbs !== undefined
        ? Number(value?.weight_lbs)
        : undefined,
    );
    setFieldValue('image_url', value?.image_url);
    if (value?.image_url) {
      setFieldValue('image_file', [
        {
          name: 'imagen-actual',
          size: 0,
          type: 'image/jpeg',
          objectURL: value.image_url,
        } as unknown as File,
      ]);
    } else {
      setFieldValue('image_file', []);
    }
    setFieldValue('notes', value?.notes);
    setFieldValue('category_id', value?.category_id);
    setFieldValue('active', value?.active);
  };

  const findProduct = async () => {
    startLoading();
    await getProducts();
    finishLoading();
  };

  const debouncedFindProduct = debounce(findProduct, 700);
  const debouncedCleanSearch = debounce(cleanSearch, 700);

  return {
    headers,
    errors,
    defineField,
    handleSubmit,
    validateField,
    resetForm,
    resetField,
    setFieldError,
    setFieldValue,
    getProducts,
    loadCategories,
    validateAlphaInput,
    cleanSearch,
    debouncedCleanSearch,
    setProductItem,
    findProduct,
    debouncedFindProduct,
    id,
    idAttrs,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    sku,
    skuAttrs,
    rental_price,
    rentalPriceAttrs,
    replacement_cost,
    replacementCostAttrs,
    total_stock,
    totalStockAttrs,
    min_stock_alert,
    minStockAlertAttrs,
    color,
    colorAttrs,
    dimensions,
    dimensionsAttrs,
    weight_lbs,
    weightLbsAttrs,
    image_url,
    imageUrlAttrs,
    image_file,
    imageFileAttrs,
    notes,
    notesAttrs,
    category_id,
    categoryIdAttrs,
    active,
    activeAttrs,
    alert,
    filter,
    pagination,
    products,
    categoriesList,
    measurementUnitsList,
    addProduct,
    editProduct,
    patchProduct,
    loadMeasurementUnits,
  };
}
