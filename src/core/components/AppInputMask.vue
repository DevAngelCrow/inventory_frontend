<template>
  <div :class="['min-w-[150px]', 'relative', props.class || 'w-auto']">
    <FloatLabel :variant="labelVariant">
      <IconField class="w-full group">
        <InputIcon
          v-if="prependInnerIcon"
          :class="[prependInnerIcon, { 'text-red-600': invalid }]"
        />
        <InputMask
          class="w-full"
          :model-value="modelValue"
          @update:model-value="onUpdate"
          :invalid="invalid"
          v-bind="$attrs"
          :autocomplete
          :placeholder="displayPlaceholder"
          :id="inputId"
          @focus="isFocused = true"
          @blur="isFocused = false"
          :mask="primeMask"
          :variant="inputVariant"
        />
        <InputIcon
          v-if="appendIcon"
          :class="[
            appendIcon,
            'absolute right-4 top-5.5',
            { 'text-red-600': invalid },
          ]"
          @click="emit('click-end-icon')"
        />
      </IconField>
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
import { InputMask, InputIcon, Message, IconField, FloatLabel } from 'primevue';

defineOptions({ inheritAttrs: false, name: 'AppInputMask' });

const props = defineProps({
  modelValue: {
    type: String,
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
  inputVariant: {
    type: String,
    default: 'large',
  },
  errorMessages: {
    type: String,
    default: '',
  },
  appendIcon: {
    type: String,
    default: '',
  },
  prependInnerIcon: {
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
  mask: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'click-end-icon']);

const invalid = ref<boolean>(false);
const inputId = ref<string>(props.id || '');
const isFocused = ref<boolean>(false);

const onUpdate = (value: string | undefined) => {
  emit('update:modelValue', value ?? '');
};

const displayPlaceholder = computed(() => {
  if (isFocused.value) {
    return props.placeholder;
  }
  if (!props.label.length) {
    return props.placeholder;
  }
});

const primeMask = computed(() => {
  if (isFocused.value) {
    return props.mask;
  }
  if (!props.label.length) {
    return '';
  }
  if (props.modelValue?.length) {
    return props.mask;
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
