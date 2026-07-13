<template>
  <section class="py-24 bg-surface-50 relative overflow-hidden">
    <div class="container mx-auto px-4 flex flex-col md:flex-row items-center">
      <div class="md:w-1/2 mb-12 md:mb-0 relative z-10">
        <h1
          class="text-5xl md:text-6xl font-extrabold text-surface-900 leading-tight mb-6 tracking-tight"
        >
          Crea el ambiente perfecto para tu
          <span
            class="text-primary-600 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500"
            >Evento</span
          >
        </h1>
        <p class="text-xl text-surface-600 mb-8 max-w-lg">
          Alquiler de mobiliario exclusivo, sillas, mesas, y salas lounge para
          bodas, eventos corporativos y celebraciones inolvidables.
        </p>
        <div
          class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <button
            class="px-8 py-4 bg-primary-600 text-white text-lg font-bold rounded shadow-lg hover:bg-primary-700 transition-transform transform hover:-translate-y-1"
          >
            Ver Catálogo
          </button>
          <button
            class="px-8 py-4 bg-surface-0 text-surface-800 text-lg font-bold rounded shadow border border-surface-200 hover:bg-surface-50 transition-colors"
          >
            Solicitar Asesoría
          </button>
        </div>
      </div>
      <div
        class="md:w-1/2 relative h-96 w-full rounded-2xl bg-surface-200 flex items-center justify-center text-surface-400 overflow-hidden shadow-2xl"
      >
        <!-- Placeholder para imagen de montaje de evento / mobiliario elegante -->
        <span class="z-10">[ Imagen de Mobiliario Elegante / Boda ]</span>
        <div class="absolute inset-0 bg-surface-300 opacity-20"></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
defineComponent({
  name: 'HeroSection',
});
</script>
