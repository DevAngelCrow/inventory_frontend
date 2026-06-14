<template>
  <SelectButton
    :class="[props.class]"
    :model-value="modelValue"
    v-bind="$attrs"
    @update:model-value="onUpdate"
  />
</template>
<script setup lang="ts">
import { SelectButton } from 'primevue';

defineOptions({ inheritAttrs: false, name: 'AppSelectButton' });

const props = defineProps({
  modelValue: {
    type: [String, Array<string>],
  },
  class: {
    type: String,
    default: 'w-full',
  },
});

const emit = defineEmits(['update:modelValue']);

const onUpdate = (value: string | string[] | undefined) => {
  emit('update:modelValue', value ?? '');
};
</script>
<style scoped></style>
