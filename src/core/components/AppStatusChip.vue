<template>
  <Chip :label="displayLabel" :class="color" :unstyled="unstyled" />
</template>

<script setup lang="ts">
import Chip from 'primevue/chip';
import { computed } from 'vue';

defineOptions({ name: 'AppStatusChip' });

const props = defineProps({
  statusName: {
    type: String,
    required: false,
  },
  label: {
    type: String,
    required: false,
  },
  status: {
    type: [Boolean, String, Number],
    required: false,
  },
  unstyled: {
    type: Boolean,
    default: false,
  },
});

const displayLabel = computed(
  () => props.label || props.statusName || 'Desconocido',
);

const color = computed(() => {
  switch (displayLabel.value) {
    case 'Activo':
    case 'Resuelto':
    case 'Confirmada':
    case 'Completada':
    case 'Pagada':
      return 'bg-green-600 text-white';
    case 'Inactivo':
    case 'Cancelada':
    case 'Vencida':
      return 'bg-red-600 text-white';
    case 'Pendiente':
      return 'bg-yellow-500 text-white';
    default:
      return 'bg-slate-300 text-white';
  }
});
</script>
