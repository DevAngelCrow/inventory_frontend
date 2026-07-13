<template>
  <Chip
    class="flex justify-center items-center max-w-35 min-w-35"
    :style="{
      backgroundColor: `color-mix(in srgb, ${props.backgroundColor} 40%, transparent)`,
      color: props.textColor,
      '--p-chip-icon-color': props.backgroundColor,
    }"
    icon="pi pi-circle-fill"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}"> </slot>
    </template>
  </Chip>
</template>

<script setup lang="ts">
import { Chip } from 'primevue';

const props = defineProps({
  backgroundColor: {
    type: String,
    default: '',
  },
  textColor: {
    type: String,
    default: '',
  },
});
</script>

<style scoped></style>
