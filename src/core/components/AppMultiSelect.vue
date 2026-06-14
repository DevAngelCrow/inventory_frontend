<template>
  <div :class="['min-w-[150px]', 'relative', props.class || 'w-auto']">
    <FloatLabel :variant="labelVariant">
      <IconField class="w-full group">
        <InputIcon
          :class="
            invalid ? `${prependInnerIcon} text-red-600` : prependInnerIcon
          "
          v-if="showIcon"
          id="append-icon"
        />
        <MultiSelect
          class="w-full"
          :inputId="inputId"
          :type="typeInputLocal"
          :model-value="modelValue"
          @update:model-value="onUpdate"
          :invalid="invalid"
          v-bind="$attrs"
          :autocomplete
          :placeholder="displayPlaceholder"
          @focus="() => (isFocused = true)"
          @blur="() => (isFocused = false)"
          :variant="inputVarian"
          :options
          :optionLabel
        />
        <InputIcon
          v-if="showIcon"
          :class="
            invalid
              ? ` ${appendIconLocal} text-red-600 ${passwordInputType} absolute right-4 top-5.5`
              : `${appendIconLocal} ${passwordInputType} absolute right-4 top-5.5`
          "
          id="append-icon"
          @click="clickSecondIcon"
        />
      </IconField>
      <label :class="invalid ? 'text-red-600' : ''" :for="inputId">{{
        label
      }}</label>
    </FloatLabel>
    <Message
      class="left-0 top-full mt-0 text-xs z-10"
      v-if="errorMessages.length"
      :severity
      :size
      :variant
      >{{ messageErrorField }}</Message
    >
  </div>
</template>
<script setup lang="ts">
import { ref, computed, defineEmits, watch, onMounted } from 'vue';
import {
  MultiSelect,
  InputIcon,
  Message,
  IconField,
  FloatLabel,
} from 'primevue';

defineOptions({ inheritAttrs: false, name: 'AppInputText' });

const props = defineProps({
  modelValue: {
    type: Array,
  },
  class: {
    type: String,
    default: 'w-full max-w-[322px]',
  },
  type: {
    type: String,
    default: 'select',
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
    default: 'simple',
  },
  inputVarian: {
    type: String,
    default: 'large',
  },
  errorMessages: {
    type: String,
    default: '',
  },
  showIcon: {
    type: Boolean,
    default: false,
  },
  appendIcon: {
    //final, dentro del input
    type: String,
    default: '',
  },
  prependInnerIcon: {
    //Inicio dentro y al principio del input
    type: String,
    default: '',
  },
  clearIcon: {
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
    //Opciones que apareceran en el desplegable del select
    type: Array,
    default: () => [],
  },
  optionLabel: {
    //Campo que aparecera si se envia un arreglo de objetos
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'click-end-icon']);

const errors = ref<string>();
const invalid = ref<boolean>();
const appendIconLocal = ref<string>(props.appendIcon);
const typeInputLocal = ref<string>(props.type);
const inputId = ref<string>(props.id || '');
const isFocused = ref<boolean>(false);

const onUpdate = (value: string | undefined) => {
  return emit('update:modelValue', value ?? '');
};
const messageErrorField = computed(() => {
  if (props.errorMessages.length) {
    errors.value = props.errorMessages;
  }
  return errors.value;
});

const passwordInputType = computed(() => {
  if (props.type === 'password') {
    appendIconLocal.value = 'pi pi-eye';
    return 'hover:cursor-pointer';
  }
  return '';
});

const displayPlaceholder = computed(() => {
  if (isFocused.value && props.label) {
    return props.placeholder;
  }
  if (!props.label.length) {
    return props.placeholder;
  }
});

const clickSecondIcon = () => {
  if (props.type === 'password' && appendIconLocal.value === 'pi pi-eye') {
    appendIconLocal.value = 'pi pi-eye-slash';
    typeInputLocal.value = 'text';
  } else if (
    appendIconLocal.value === 'pi pi-eye-slash' &&
    props.type === 'password'
  ) {
    appendIconLocal.value = 'pi pi-eye';
    typeInputLocal.value = 'password';
  }
  emit('click-end-icon');
};

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
