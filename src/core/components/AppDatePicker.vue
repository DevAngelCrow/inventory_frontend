<template>
  <div :class="['w-auto', 'min-w-[150px]', 'relative', props.class]">
    <FloatLabel :variant="labelVariant">
      <DatePicker
        class="w-full"
        v-model="temporal"
        :selection-mode
        date-format="dd/mm/yy"
        :show-other-months
        show-icon
        :icon
        :icon-display
        :number-of-months="1"
        :min-date
        :max-date
        :disabled-dates
        :disabled-days
        hour-format="12"
        :disabled
        :readonly
        :placeholder="displayPlaceholder"
        :manual-input="false"
        fluid
        :show-time
        @focus="isFocused = true"
        @blur="isFocused = false"
        :invalid="invalid"
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
import { DatePicker, FloatLabel, Message } from 'primevue';
import { computed, onMounted, ref, watch, type PropType } from 'vue';

import { CreateDateFromFormat, FormatDate, IsDateAfter } from '../utils/dates';

defineOptions({ name: 'AppDatePicker' });

const props = defineProps({
  class: {
    type: String,
    default: 'w-full max-w-[322px]',
  },
  icon: {
    type: String,
    default: 'pi pi-calendar',
  },
  selectionMode: {
    type: String,
    default: 'single',
  },
  showOtherMonths: {
    type: Boolean,
    default: true,
  },
  minDate: {
    type: Date,
    default: null,
  },
  maxDate: {
    type: Date,
    default: null,
  },
  disabledDates: {
    type: Array as PropType<Date[]>,
    default: () => [],
  },
  disabledDays: {
    type: Array as PropType<number[]>,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: 'DD/MM/AAAA',
  },
  iconDisplay: {
    type: String,
    default: '',
  },
  showTime: {
    type: Boolean,
    default: false,
  },
  labelVariant: {
    type: String,
    default: 'on',
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
  errorMessages: {
    type: String,
    default: '',
  },
  id: {
    type: String,
  },
  label: {
    type: String,
    default: '',
  },
});

const invalid = ref<boolean>(false);
const inputId = ref<string>(props.id || '');
const isFocused = ref<boolean>(false);

const dateModel = defineModel<string | string[] | null>({
  type: [String, Array],
  default: null,
});
const validation = () => {
  const validSelectionMode: string[] = ['single', 'multiple', 'range'];
  if (!validSelectionMode.includes(props.selectionMode)) {
    return;
  }

  if (props.selectionMode === 'single' && Array.isArray(dateModel.value)) {
    return;
  }

  if (props.selectionMode !== 'single' && typeof dateModel.value === 'string') {
    return;
  }

  if (
    props.selectionMode === 'range' &&
    Array.isArray(dateModel.value) &&
    dateModel.value.length === 2
  ) {
    if (IsDateAfter(dateModel.value[0], dateModel.value[1])) {
      return;
    }
  }
};

const temporal = computed<Date | Date[] | null>({
  get: () => {
    if (typeof dateModel.value === 'string' && dateModel.value !== '') {
      if (props.showTime) {
        return CreateDateFromFormat(dateModel.value, 'DD/MM/YYYY hh:mm a');
      } else {
        return CreateDateFromFormat(dateModel.value);
      }
    } else if (Array.isArray(dateModel.value)) {
      const dias = dateModel.value;
      const diasFormated = dias
        .map(dia => CreateDateFromFormat(dia))
        .filter((d): d is Date => d !== null); // filtra los null
      return diasFormated;
    } else {
      return null;
    }
  },
  set: (value: Date | Date[] | null) => {
    if (!value) {
      dateModel.value = '';
    } else if (Array.isArray(value)) {
      const dias = value
        .map(dia => FormatDate(dia.toISOString(), 'DD/MM/YYYY'))
        .filter((d): d is string => d !== null);
      dateModel.value = dias;
    } else {
      dateModel.value = props.showTime
        ? FormatDate(value.toISOString(), 'DD/MM/YYYY hh:mm a')
        : FormatDate(value.toISOString(), 'DD/MM/YYYY');
    }
  },
});

const displayPlaceholder = computed(() => {
  return isFocused.value ? props.placeholder : undefined;
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

validation();
</script>
