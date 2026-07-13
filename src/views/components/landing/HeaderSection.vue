<template>
  <header class="w-full bg-surface-0 shadow-sm sticky top-0 z-50">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <div class="text-2xl font-bold text-primary-600">Eventura Mobiliario</div>
      <nav class="hidden md:flex space-x-6">
        <a
          href="#catalogo"
          class="text-surface-600 hover:text-primary-600 font-medium"
          >Catálogo</a
        >
        <a
          href="#como-funciona"
          class="text-surface-600 hover:text-primary-600 font-medium"
          >Cómo Funciona</a
        >
        <a
          href="#paquetes"
          class="text-surface-600 hover:text-primary-600 font-medium"
          >Paquetes</a
        >
      </nav>
      <div class="flex space-x-4">
        <button
          class="px-4 py-2 text-primary-600 font-medium hover:bg-primary-50 rounded transition-colors"
        >
          Iniciar Sesión
        </button>
        <button
          class="px-4 py-2 bg-primary-600 text-white font-medium rounded hover:bg-primary-700 transition-colors"
        >
          Cotizar Ahora
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
defineComponent({
  name: 'HeaderSection',
});
</script>
