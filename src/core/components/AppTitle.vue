<template>
  <div :class="['flex', 'flex-col', 'justify-center', 'text-center']">
    <h1 :class="`text-2xl lg:text-4xl font-semibold text-primary`">
      {{ title }}
    </h1>
  </div>
</template>
<script setup lang="ts">
defineOptions({ name: 'AppTitle' });

defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>
