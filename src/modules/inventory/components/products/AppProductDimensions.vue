<template>
  <div :class="['flex flex-col gap-2', $attrs.class]" :id="id">
    <label class="text-sm font-medium text-surface-900 dark:text-surface-0">{{
      label
    }}</label>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Width -->
      <AppInputNumber
        class="w-full"
        :id="`${id}_width`"
        label="Ancho*"
        :model-value="modelValue?.width"
        @update:model-value="updateValue('width', $event)"
        :error-messages="errorMessages['dimensions.width']"
        :readonly="readonly"
      />
      <!-- Height -->
      <AppInputNumber
        class="w-full"
        :id="`${id}_height`"
        label="Alto*"
        :model-value="modelValue?.height"
        @update:model-value="updateValue('height', $event)"
        :error-messages="errorMessages['dimensions.height']"
        :readonly="readonly"
      />
      <!-- Depth -->
      <AppInputNumber
        class="w-full"
        :id="`${id}_depth`"
        label="Profundidad"
        :model-value="modelValue?.depth ?? undefined"
        @update:model-value="updateValue('depth', $event)"
        :error-messages="errorMessages['dimensions.depth']"
        :readonly="readonly"
      />
      <!-- Unit -->
      <AppSelect
        class="w-full"
        :id="`${id}_unit`"
        label="Unidad de Medida*"
        :model-value="modelValue?.unitId"
        @update:model-value="updateValue('unitId', $event)"
        :error-messages="errorMessages['dimensions.unitId']"
        :options="units"
        optionLabel="abbreviation"
        optionValue="id"
        :readonly="readonly"
      />
    </div>
    <!-- General error for dimensions object -->
    <small v-if="errorMessages['dimensions']" class="p-error">{{
      errorMessages['dimensions']
    }}</small>
  </div>
</template>

<script setup lang="ts">
import AppInputNumber from '@/core/components/AppInputNumber.vue';
import AppSelect from '@/core/components/AppSelect.vue';
import { MeasurementUnitResponse } from '@/modules/inventory/interfaces/inventory.interfaces';

const props = defineProps<{
  id: string;
  label: string;
  modelValue?: {
    width?: number;
    height?: number;
    depth?: number | null;
    unitId?: string;
  } | null;
  errorMessages?: any;
  readonly?: boolean;
  units: MeasurementUnitResponse[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>();

const updateValue = (field: string, val: any) => {
  if (props.readonly) return;
  const newValue = { ...props.modelValue, [field]: val };
  emit('update:modelValue', newValue);
};
</script>
