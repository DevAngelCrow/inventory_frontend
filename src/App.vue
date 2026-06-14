<template>
  <div class="max-h-screen h-screen">
    <Transition name="fade">
      <AppLoader v-if="showLoader" class="transition-all transition-discrete" />
    </Transition>
    <AppAlert />
    <router-view />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';

import AppAlert from './core/components/AppAlert.vue';
import AppLoader from './core/components/AppLoader.vue';
import { useLoaderStore } from './core/store';

const storeLoader = useLoaderStore();

const showLoader = computed(() => storeLoader.isLoading);
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
