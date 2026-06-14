<template>
  <div :class="['min-w-[150px]', 'relative', props.class || 'w-auto']">
    <FloatLabel :variant="labelVariant">
      <IconField class="w-full group">
        <InputIcon
          v-if="prependInnerIcon"
          :class="[prependInnerIcon, { 'text-red-600': invalid }]"
        />
        <InputText
          class="w-full"
          :type="typeInputLocal"
          :model-value="modelValue"
          @update:model-value="onUpdate"
          :invalid="invalid"
          v-bind="$attrs"
          :autocomplete
          :placeholder="displayPlaceholder"
          :id="inputId"
          @focus="isFocused = true"
          @blur="isFocused = false"
          :variant="inputVarian"
          :size="inputSize"
        />
        <InputIcon
          v-if="appendIconLocal"
          :class="[
            appendIconLocal,
            'absolute right-4 top-5.5',
            { 'text-red-600': invalid },
            { 'hover:cursor-pointer': type === 'password' },
          ]"
          @click="clickSecondIcon"
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
import { InputText, InputIcon, Message, IconField, FloatLabel } from 'primevue';

defineOptions({ inheritAttrs: false, name: 'AppInputText' });

const props = defineProps({
  modelValue: {
    type: String,
  },
  class: {
    type: String,
    default: 'w-full max-w-[322px]',
  },
  type: {
    type: String,
    default: 'text',
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
  inputSize: {
    type: String,
    default: 'normal',
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
});

const emit = defineEmits(['update:modelValue', 'click-end-icon']);

const invalid = ref<boolean>(false);
const appendIconLocal = ref<string>(props.appendIcon);
const typeInputLocal = ref<string>(props.type);
const inputId = ref<string>(props.id || '');
const isFocused = ref<boolean>(false);

const onUpdate = (value: string | undefined) => {
  emit('update:modelValue', value ?? '');
};

const displayPlaceholder = computed(() => {
  if (isFocused.value && props.label) {
    return props.placeholder;
  }
  if (!props.label.length) {
    return props.placeholder;
  }
});

const clickSecondIcon = () => {
  if (props.type === 'password') {
    if (appendIconLocal.value === 'pi pi-eye') {
      appendIconLocal.value = 'pi pi-eye-slash';
      typeInputLocal.value = 'text';
    } else {
      appendIconLocal.value = 'pi pi-eye';
      typeInputLocal.value = 'password';
    }
  }
  emit('click-end-icon');
};

onMounted(() => {
  if (!props.id) {
    inputId.value = `input-${Math.random().toString(36).substring(2, 9)}`;
  }

  if (props.type === 'password') {
    appendIconLocal.value = 'pi pi-eye';
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
