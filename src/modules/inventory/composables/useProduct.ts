import { useForm } from 'vee-validate';
import { nextTick, reactive, ref } from 'vue';
import * as yup from 'yup';

import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';
import { debounce } from '@/core/utils/debounceFunction';

import { ProductResponse, ProductForm, ProductCategoryResponse, CreateProductPayload, UpdateProductPayload } from '../interfaces/inventory.interfaces';
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
      color: yup.string().max(50, 'El color no puede tener más de 50 caracteres').nullable(),
      dimensions: yup.string().max(100, 'Las dimensiones no pueden tener más de 100 caracteres').nullable(),
      weight_lbs: yup.number().typeError('El peso debe ser un número').min(0).nullable(),
      image_url: yup.string().max(500).nullable(),
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
  const [replacement_cost, replacementCostAttrs] = defineField('replacement_cost');
  const [total_stock, totalStockAttrs] = defineField('total_stock');
  const [min_stock_alert, minStockAlertAttrs] = defineField('min_stock_alert');
  const [color, colorAttrs] = defineField('color');
  const [dimensions, dimensionsAttrs] = defineField('dimensions');
  const [weight_lbs, weightLbsAttrs] = defineField('weight_lbs');
  const [image_url, imageUrlAttrs] = defineField('image_url');
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
        category_id: filter.category_id === 'Todos' ? undefined : filter.category_id,
        active: filter.active === 'Todos' ? undefined : filter.active as boolean | undefined,
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
      const response = await inventoryServices.getCategories({ active: true, per_page: 100 });
      if (response.statusCode === 200) {
        categoriesList.value = response.data.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addProduct = async (form: ProductForm) => {
    try {
      startLoading();
      const createPayload: CreateProductPayload = {
        name: form.name,
        description: form.description,
        sku: form.sku,
        rental_price: form.rental_price,
        replacement_cost: form.replacement_cost,
        total_stock: form.total_stock,
        min_stock_alert: form.min_stock_alert,
        color: form.color,
        dimensions: form.dimensions,
        weight_lbs: form.weight_lbs,
        image_url: form.image_url,
        notes: form.notes,
        category_id: form.category_id,
      };
      const response = await inventoryServices.postProduct(createPayload);
      if (response.status === 201) {
        getProducts();
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
      const updatePayload: UpdateProductPayload = {
        name: form.name,
        description: form.description,
        sku: form.sku,
        rental_price: form.rental_price,
        replacement_cost: form.replacement_cost,
        total_stock: form.total_stock,
        min_stock_alert: form.min_stock_alert,
        color: form.color,
        dimensions: form.dimensions,
        weight_lbs: form.weight_lbs,
        image_url: form.image_url,
        notes: form.notes,
        category_id: form.category_id,
      };
      const response = await inventoryServices.putProduct(form.id!, updatePayload);
      if (response.status === 200) {
        getProducts();
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
        getProducts();
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
    setFieldValue('replacement_cost', value?.replacement_cost !== null && value?.replacement_cost !== undefined ? Number(value?.replacement_cost) : undefined);
    setFieldValue('total_stock', value?.total_stock);
    setFieldValue('min_stock_alert', value?.min_stock_alert);
    setFieldValue('color', value?.color);
    setFieldValue('dimensions', value?.dimensions);
    setFieldValue('weight_lbs', value?.weight_lbs !== null && value?.weight_lbs !== undefined ? Number(value?.weight_lbs) : undefined);
    setFieldValue('image_url', value?.image_url);
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
    addProduct,
    editProduct,
    patchProduct,
  };
}
