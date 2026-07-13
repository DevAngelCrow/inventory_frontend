<template>
  <section id="features" class="py-24 bg-surface-0">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
          ¿Por qué elegir nuestro mobiliario?
        </h2>
        <p class="text-surface-600 max-w-2xl mx-auto text-lg">
          Nos aseguramos de que cada detalle cuente para que tu evento sea
          exactamente como lo imaginaste.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <!-- Beneficio 1 -->
        <div
          class="p-8 bg-surface-50 rounded-2xl border border-surface-100 hover:shadow-lg transition-shadow"
        >
          <div
            class="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6 text-2xl"
          >
            <i class="pi pi-th-large"></i>
          </div>
          <h3 class="text-xl font-bold mb-3 text-surface-900">
            Catálogo Premium
          </h3>
          <p class="text-surface-600">
            Piezas exclusivas, modernas y clásicas. Desde sillas Tiffany y Avant
            Garde hasta salas lounge iluminadas y vintage.
          </p>
        </div>

        <!-- Beneficio 2 -->
        <div
          class="p-8 bg-surface-50 rounded-2xl border border-surface-100 hover:shadow-lg transition-shadow"
        >
          <div
            class="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6 text-2xl"
          >
            <i class="pi pi-truck"></i>
          </div>
          <h3 class="text-xl font-bold mb-3 text-surface-900">
            Entrega y Montaje
          </h3>
          <p class="text-surface-600">
            Nos encargamos del transporte, carga, descarga y acomodo según el
            layout de tu evento con puntualidad garantizada.
          </p>
        </div>

        <!-- Beneficio 3 -->
        <div
          class="p-8 bg-surface-50 rounded-2xl border border-surface-100 hover:shadow-lg transition-shadow"
        >
          <div
            class="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6 text-2xl"
          >
            <i class="pi pi-check-circle"></i>
          </div>
          <h3 class="text-xl font-bold mb-3 text-surface-900">
            Calidad Impecable
          </h3>
          <p class="text-surface-600">
            Nuestro inventario recibe mantenimiento constante. Recibirás
            mobiliario limpio, seguro y en perfectas condiciones.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
defineComponent({
  name: 'FeaturesBenefitsSection',
});
</script>
