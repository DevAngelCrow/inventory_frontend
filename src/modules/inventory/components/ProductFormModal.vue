<template>
  <AppModal :title="props.modalState.title" :show="props.modalState.show" :title-btn-cancel="modalButtons.cancelText"
    :title-btn-confirm="modalButtons.confirmText" footer-buttons show-icon-close width="55rem" @close-modal="closeModal"
    @confirm-modal="onSubMit" :showBtnConfirmFooter="props.modalState.mode !== 'view'">
    <section v-if="props.modalState.mode !== 'delete'" id="body_modal"
      class="grid grid-cols-1 md:grid-cols-2 gap-5 py-1.5 w-full">
      <AppInputText class="w-full min-w-0" id="name" label="Nombre del Producto*" v-model="name" :error-messages="errors.name"
        v-bind="nameAttrs" :readonly="props.modalState.isReadonly" />
      <AppInputText class="w-full min-w-0" id="sku" label="SKU*" v-model="sku" :error-messages="errors.sku"
        v-bind="skuAttrs" :readonly="props.modalState.isReadonly" />
      
      <AppSelect class="w-full min-w-0" id="id_category" label="Categoría*" v-model="id_category"
        :error-messages="errors.id_category" v-bind="idCategoryAttrs" :options="categoriesList"
        optionLabel="name" optionValue="id" :readonly="props.modalState.isReadonly" />
      <AppInputMoney class="w-full min-w-0" id="rental_price" label="Precio de Alquiler*" v-model="rental_price"
        :error-messages="errors.rental_price" v-bind="rentalPriceAttrs" :readonly="props.modalState.isReadonly" />
      
      <AppInputMoney class="w-full min-w-0" id="replacement_cost" label="Costo de Reposición" v-model="replacement_cost"
        :error-messages="errors.replacement_cost" v-bind="replacementCostAttrs" :readonly="props.modalState.isReadonly" />
      <AppInputNumber class="w-full min-w-0" id="total_stock" label="Stock Total*" v-model="total_stock"
        :error-messages="errors.total_stock" v-bind="totalStockAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputNumber class="w-full min-w-0" id="min_stock_alert" label="Alerta de Stock Mínimo" v-model="min_stock_alert"
        :error-messages="errors.min_stock_alert" v-bind="minStockAlertAttrs" :readonly="props.modalState.isReadonly" />
      <AppInputText class="w-full min-w-0" id="color" label="Color" v-model="color" :error-messages="errors.color"
        v-bind="colorAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0" id="dimensions" label="Dimensiones (ej: 6ft x 2.5ft)" v-model="dimensions"
        :error-messages="errors.dimensions" v-bind="dimensionsAttrs" :readonly="props.modalState.isReadonly" />
      <AppInputNumber class="w-full min-w-0" id="weight_lbs" label="Peso (libras)" v-model="weight_lbs"
        :error-messages="errors.weight_lbs" v-bind="weightLbsAttrs" :readonly="props.modalState.isReadonly" />

      <AppInputText class="w-full min-w-0 md:col-span-2" id="image_url" label="URL de Imagen" v-model="image_url"
        :error-messages="errors.image_url" v-bind="imageUrlAttrs" :readonly="props.modalState.isReadonly" />
      
      <AppInputextArea class="w-full min-w-0 md:col-span-2" id="description" label="Descripción" v-model="description"
        :error-messages="errors.description" v-bind="descriptionAttrs" :readonly="props.modalState.isReadonly" />
      
      <AppInputextArea class="w-full min-w-0 md:col-span-2" id="notes" label="Notas Internas" v-model="notes"
        :error-messages="errors.notes" v-bind="notesAttrs" :readonly="props.modalState.isReadonly" />
    </section>
    <section v-else id="body_delete_modal" class="w-full flex flex-wrap gap-5">
      <div class="w-full flex justify-center text-center items-center">
        <span class="text-center flex">{{ props.modalState.description }}</span>
      </div>
    </section>
  </AppModal>
</template>
<script setup lang="ts">
import { computed, inject } from 'vue';

import AppModal from '@/core/components/AppModal.vue';
import AppInputText from '@/core/components/AppInputText.vue';
import AppInputNumber from '@/core/components/AppInputNumber.vue';
import AppInputMoney from '@/core/components/AppInputMoney.vue';
import AppSelect from '@/core/components/AppSelect.vue';
import AppInputextArea from '@/core/components/AppInputextArea.vue';
import { useLoaderStore } from '@/core/store';

import { useProduct } from '../composables/useProduct';
import { ProductForm } from '../interfaces/inventory.interfaces';

type ProductType = ReturnType<typeof useProduct>;

const props = defineProps<{
  modalState: {
    show: boolean;
    mode: 'closed' | 'add' | 'view' | 'edit' | 'delete';
    title: string;
    description: string;
    isReadonly: boolean;
    selectedItem: null | string;
  };
}>();

const emit = defineEmits(['close-modal']);
const productInstance = inject<ProductType>('useProduct')!;
const { startLoading, finishLoading } = useLoaderStore();

const {
  errors,
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
  id_category,
  idCategoryAttrs,
  categoriesList,
  handleSubmit,
  addProduct,
  editProduct,
  patchProduct,
} = productInstance;

const onSubMit = handleSubmit(async values => {
  try {
    startLoading();
    const form: ProductForm = {
      name: values?.name,
      description: values?.description,
      sku: values?.sku,
      rental_price: Number(values?.rental_price),
      replacement_cost: values?.replacement_cost ? Number(values?.replacement_cost) : undefined,
      total_stock: Number(values?.total_stock),
      min_stock_alert: values?.min_stock_alert ? Number(values?.min_stock_alert) : 0,
      color: values?.color,
      dimensions: values?.dimensions,
      weight_lbs: values?.weight_lbs ? Number(values?.weight_lbs) : undefined,
      image_url: values?.image_url,
      notes: values?.notes,
      id_category: values?.id_category,
    };
    let success = false;
    switch (props.modalState.mode) {
      case 'add':
        success = !!(await addProduct(form));
        break;
      case 'edit':
        form.id = values.id;
        form.active = values.active;
        success = !!(await editProduct(form));
        break;
      case 'delete':
        success = !!(await patchProduct(values.id));
        break;
    }
    if (success) {
      emit('close-modal');
    }
  } catch (error) {
    console.error(error);
  } finally {
    finishLoading();
  }
});

const closeModal = () => {
  emit('close-modal');
};

const modalButtons = computed(() => {
  switch (props.modalState.mode) {
    case 'edit':
      return { confirmText: 'Editar', cancelText: 'Cancelar' };
    case 'delete':
      return { confirmText: 'Aceptar', cancelText: 'Cancelar' };
    case 'view':
      return { confirmText: '', cancelText: 'Cerrar' };
    default:
      return { confirmText: 'Agregar', cancelText: 'Cancelar' };
  }
});
</script>
