<template>
  <section id="como-funciona" class="py-24 bg-surface-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-20">
        <h2 class="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
          ¿Cómo alquilar tu mobiliario?
        </h2>
        <p class="text-surface-600 max-w-2xl mx-auto text-lg">
          Un proceso sencillo para que te enfoques en disfrutar tu evento.
        </p>
      </div>

      <div class="relative max-w-5xl mx-auto">
        <!-- Línea conectora de fondo -->
        <div
          class="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-primary-200 -translate-y-1/2 z-0"
        ></div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          <!-- Paso 1 -->
          <div
            class="flex flex-col items-center text-center bg-surface-50 md:bg-transparent"
          >
            <div
              class="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-xl border-4 border-surface-0"
            >
              1
            </div>
            <h3 class="text-xl font-bold mb-3 text-surface-900">
              Explora el Catálogo
            </h3>
            <p class="text-surface-600">
              Revisa nuestras categorías, selecciona las sillas, mesas y
              accesorios que mejor se adapten al estilo de tu celebración.
            </p>
          </div>

          <!-- Paso 2 -->
          <div
            class="flex flex-col items-center text-center bg-surface-50 md:bg-transparent"
          >
            <div
              class="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-xl border-4 border-surface-0"
            >
              2
            </div>
            <h3 class="text-xl font-bold mb-3 text-surface-900">
              Verifica Disponibilidad
            </h3>
            <p class="text-surface-600">
              Ingresa la fecha de tu evento, cantidad de personas y ubicación
              para obtener una cotización al instante.
            </p>
          </div>

          <!-- Paso 3 -->
          <div
            class="flex flex-col items-center text-center bg-surface-50 md:bg-transparent"
          >
            <div
              class="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-xl border-4 border-surface-0"
            >
              3
            </div>
            <h3 class="text-xl font-bold mb-3 text-surface-900">
              Relájate y Disfruta
            </h3>
            <p class="text-surface-600">
              Confirma tu reserva. Nosotros nos encargamos de entregar y montar
              todo el mobiliario en tu locación a la hora acordada.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
defineComponent({
  name: 'HowItWorksSection',
});
</script>
