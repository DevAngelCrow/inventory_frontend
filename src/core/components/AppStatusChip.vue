<template>
  <AppChip :label="statusName" :class="color" :unstyled />
</template>

<script setup lang="ts">
import Chip from 'primevue/chip';
import { computed } from 'vue';

defineOptions({ name: 'AppStatusChip' });

const { statusName } = defineProps({
  statusName: {
    type: String,
    required: true,
  },
  unstyled: {
    type: Boolean,
    default: false,
  },
});

const color = computed(() => {
  switch (statusName) {
    case 'Activo':
      return 'bg-green-600 text-white';
    case 'Inactivo':
      return 'bg-red-600 text-white';
    default:
      return 'bg-slate-300 text-white';
  }
});
</script>
