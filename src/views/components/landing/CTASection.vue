<template>
  <section class="py-24 bg-surface-900 relative overflow-hidden">
    <!-- Círculos decorativos -->
    <div
      class="absolute top-0 left-0 w-64 h-64 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"
    ></div>
    <div
      class="absolute bottom-0 right-0 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/3 translate-y-1/3"
    ></div>

    <div class="container mx-auto px-4 text-center relative z-10">
      <h2 class="text-4xl md:text-5xl font-extrabold text-white mb-6">
        Haz que tu evento brille
      </h2>
      <p class="text-xl text-surface-300 mb-10 max-w-2xl mx-auto">
        No dejes la comodidad y la elegancia de tus invitados al azar. Reserva
        hoy y asegura el mejor mobiliario para tu fecha.
      </p>
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <button
          class="px-10 py-5 bg-primary-600 text-white text-xl font-bold rounded-xl shadow-xl hover:bg-primary-500 transition-colors"
        >
          Cotizar mi Evento
        </button>
        <button
          class="px-10 py-5 bg-transparent border-2 border-surface-600 text-white text-xl font-bold rounded-xl hover:border-surface-400 hover:bg-surface-800 transition-colors"
        >
          Ver Catálogo Completo
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
defineComponent({
  name: 'CTASection',
});
</script>
