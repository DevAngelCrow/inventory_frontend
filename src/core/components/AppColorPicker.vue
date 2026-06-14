<template>
  <div
    :class="[
      'min-w-[150px]',
      'relative',
      props.class || 'w-auto',
      'flex',
      'flex-col',
      'gap-0',
    ]"
  >
    <div class="flex flex-row items-center gap-2">
      <ColorPicker
        name="color"
        :inline
        :model-value="modelValue"
        :format
        @update:model-value="onUpdate"
      />
      <div id="inputs-color-picker" class="flex flex-col items-center">
        <FloatLabel v-if="showInputText" :variant="variantLabel">
          <IconField class="w-full group">
            <InputMask
              :size
              :model-value="modelValue"
              :mask="computedMask"
              @update:model-value="onUpdate"
              :id="inputId"
              :placeholder="displayPlaceholder"
              @focus="isFocused = true"
              @blur="isFocused = false"
              :invalid
            />
            <InputIcon :class="appendIconDynamic" @click="clearable" />
          </IconField>
          <label :class="{ 'text-red-600': invalid }" :for="inputId">
            {{ label }}
          </label>
        </FloatLabel>
      </div>
    </div>
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
<script lang="ts" setup>
import {
  ColorPicker,
  Message,
  InputMask,
  InputIcon,
  IconField,
  FloatLabel,
} from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
  },
  class: {
    type: String,
    default: 'w-full max-w-[322px]',
  },
  label: {
    type: String,
    default: '',
  },
  id: {
    type: String,
  },
  errorMessages: {
    type: String,
    default: '',
  },
  severity: {
    type: String,
    default: 'error',
  },
  size: {
    type: String,
    default: 'normal',
  },
  variant: {
    type: String,
    default: 'simple',
  },
  variantLabel: {
    type: String,
    default: 'on',
  },
  showInputText: {
    type: Boolean,
    default: true,
  },
  inline: {
    type: Boolean,
    default: false,
  },
  format: {
    type: String,
    default: 'hex',
  },
  mask: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'click-clear']);

const getDefaultPlaceholder = () => {
  switch (props.format) {
    case 'hex':
      return '#000000';
    case 'rgb':
      return 'rgb(0, 0, 0)';
    case 'hsb':
      return 'hsb(0, 0, 0)';
    default:
      return '#000000';
  }
};

const getDefaultMask = () => {
  switch (props.format) {
    case 'hex':
      return '#******';
    case 'rgb':
      return 'rgb(999, 999, 999)';
    case 'hsb':
      return 'hsb(999, 999, 999)';
    default:
      return '#******';
  }
};

const computedPlaceholder = computed(
  () => props.placeholder || getDefaultPlaceholder(),
);
const computedMask = computed(() => props.mask || getDefaultMask());

const onUpdate = (value: string | undefined) => {
  if (!value) {
    emit('update:modelValue', value);
    return;
  }

  let formattedValue = value;

  switch (props.format) {
    case 'hex':
      // Asegurar que el valor hex siempre tenga el '#'
      if (!value.startsWith('#')) {
        formattedValue = `#${value}`;
      }
      break;
    case 'rgb':
      // Asegurar formato RGB correcto
      if (!value.startsWith('rgb')) {
        formattedValue = value; // El ColorPicker debería devolver el formato correcto
      }
      break;
    case 'hsb':
      // Asegurar formato HSB correcto
      if (!value.startsWith('hsb')) {
        formattedValue = value; // El ColorPicker debería devolver el formato correcto
      }
      break;
    default:
      formattedValue = value;
  }

  emit('update:modelValue', formattedValue);
};

const clearable = () => {
  let defaultValue = '#000000';

  switch (props.format) {
    case 'hex':
      defaultValue = '#000000';
      break;
    case 'rgb':
      defaultValue = 'rgb(0, 0, 0)';
      break;
    case 'hsb':
      defaultValue = 'hsb(0, 0, 0)';
      break;
  }

  emit('update:modelValue', defaultValue);
  emit('click-clear');
};

const inputId = ref<string>(props.id || '');
const invalid = ref<boolean>(false);
const isFocused = ref<boolean>(false);

const appendIconDynamic = computed(() => {
  if (props.modelValue) {
    return 'pi pi-times cursor-pointer';
  }
  return '';
});
const displayPlaceholder = computed(() => {
  if (isFocused.value && props.label) {
    return computedPlaceholder.value;
  }
  if (!props.label.length) {
    return computedPlaceholder.value;
  }
  return '';
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
onMounted(() => {
  if (!props.id) {
    inputId.value = `input-${Math.random().toString(36).substring(2, 9)}`;
  }
});
</script>
