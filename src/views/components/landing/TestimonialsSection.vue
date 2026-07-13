<template>
  <section class="py-24 bg-surface-0">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
          Lo que dicen nuestros clientes
        </h2>
        <p class="text-surface-600 max-w-2xl mx-auto text-lg">
          Eventos exitosos que contaron con nuestro mobiliario.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <!-- Testimonio 1 -->
        <div class="p-10 bg-surface-50 rounded-2xl border border-surface-100">
          <div class="flex items-center mb-6 text-primary-500">
            <i v-for="i in 5" :key="i" class="pi pi-star-fill mr-1"></i>
          </div>
          <p class="text-surface-700 mb-8 italic leading-relaxed">
            "Las sillas Tiffany doradas lucieron espectaculares en mi boda. El
            equipo fue muy profesional desde la cotización hasta el desmontaje
            en la madrugada."
          </p>
          <div class="flex items-center">
            <div
              class="w-14 h-14 bg-surface-300 rounded-full mr-4 flex-shrink-0"
            ></div>
            <div>
              <h4 class="font-bold text-surface-900">Valeria M.</h4>
              <p class="text-sm text-surface-500">Novia</p>
            </div>
          </div>
        </div>

        <!-- Testimonio 2 -->
        <div class="p-10 bg-surface-50 rounded-2xl border border-surface-100">
          <div class="flex items-center mb-6 text-primary-500">
            <i v-for="i in 5" :key="i" class="pi pi-star-fill mr-1"></i>
          </div>
          <p class="text-surface-700 mb-8 italic leading-relaxed">
            "Excelente servicio para nuestro evento corporativo. Alquilamos las
            salas lounge iluminadas y las mesas de cóctel. Todo llegó
            impecable."
          </p>
          <div class="flex items-center">
            <div
              class="w-14 h-14 bg-surface-300 rounded-full mr-4 flex-shrink-0"
            ></div>
            <div>
              <h4 class="font-bold text-surface-900">Carlos R.</h4>
              <p class="text-sm text-surface-500">Organizador de Eventos</p>
            </div>
          </div>
        </div>

        <!-- Testimonio 3 -->
        <div class="p-10 bg-surface-50 rounded-2xl border border-surface-100">
          <div class="flex items-center mb-6 text-primary-500">
            <i v-for="i in 5" :key="i" class="pi pi-star-fill mr-1"></i>
          </div>
          <p class="text-surface-700 mb-8 italic leading-relaxed">
            "Puntualidad al 100%. Me salvaron cuando tuve un imprevisto y
            necesité 50 sillas extra un día antes del evento. Muy recomendados."
          </p>
          <div class="flex items-center">
            <div
              class="w-14 h-14 bg-surface-300 rounded-full mr-4 flex-shrink-0"
            ></div>
            <div>
              <h4 class="font-bold text-surface-900">Ana T.</h4>
              <p class="text-sm text-surface-500">Decoradora</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
defineComponent({
  name: 'TestimonialsSection',
});
</script>
