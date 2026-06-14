<template>
  <div
    class="flex flex-col justify-start w-full h-full bg-primary-50 overflow-auto"
  >
    <router-view />
  </div>
</template>
<script setup lang="ts">
defineOptions({ name: 'AppMainContent' });
</script>
