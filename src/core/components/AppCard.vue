<template>
  <Card v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </Card>
</template>
<script setup lang="ts">
import { Card } from 'primevue';
</script>
