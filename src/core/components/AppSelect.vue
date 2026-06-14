<template>
  <div :class="['min-w-37.5', 'relative', props.class || 'w-auto']">
    <FloatLabel :variant="labelVariant">
      <Select
        :class="['w-full', { 'pointer-events-none': readonly }]"
        :inputId="inputId"
        :model-value="modelValue"
        @update:model-value="onUpdateReadonly"
        :invalid="invalid"
        v-bind="$attrs"
        :autocomplete
        :placeholder="displayPlaceholder"
        @focus="isFocused = true"
        @blur="isFocused = false"
        :variant="inputVarian"
        :options
        :optionLabel
      />
      <label :class="{ 'text-red-600': invalid }" :for="inputId">
        {{ label }}
      </label>
    </FloatLabel>
    <Message
      v-if="errorMessages.length"
      class="left-0 top-full mt-0 text-xs z-10"
      :severity
      :size
      :variant
    >
      {{ errorMessages }}
    </Message>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Select, Message, FloatLabel } from 'primevue';

defineOptions({ inheritAttrs: false, name: 'AppSelect' });

const props = defineProps({
  modelValue: {
    type: [String, Number, Object, Boolean],
  },
  class: {
    type: String,
    default: 'w-full max-w-[322px]',
  },
  placeholder: {
    type: String,
    default: '',
  },
  severity: {
    type: String,
    default: 'error',
  },
  size: {
    type: String,
    default: 'small',
  },
  variant: {
    type: String,
    default: 'simple',
  },
  labelVariant: {
    type: String,
    default: 'on',
  },
  inputVarian: {
    type: String,
    default: 'large',
  },
  errorMessages: {
    type: String,
    default: '',
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
  label: {
    type: String,
    default: '',
  },
  id: {
    type: String,
  },
  options: {
    type: Array,
    default: () => [],
  },
  optionLabel: {
    type: String,
    default: '',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const invalid = ref<boolean>(false);
const inputId = ref<string>(props.id || '');
const isFocused = ref<boolean>(false);

const onUpdateReadonly = (value: string | number | object | undefined) => {
  if (!props.readonly) {
    emit('update:modelValue', value ?? '');
  }
};

const displayPlaceholder = computed(() => {
  if (isFocused.value && props.label) {
    return props.placeholder;
  }
  if (!props.label.length) {
    return props.placeholder;
  }
});

onMounted(() => {
  if (!props.id) {
    inputId.value = `input-${Math.random().toString(36).substring(2, 9)}`;
  }
});

watch(
  () => props.errorMessages,
  newValue => {
    invalid.value = true;
    if (!newValue.length) {
      invalid.value = false;
    }
  },
);
</script>
