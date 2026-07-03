<template>
  <section id="paquetes" class="py-24 bg-surface-100">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-surface-900 mb-4">Paquetes Populares</h2>
        <p class="text-surface-600 max-w-2xl mx-auto text-lg">Soluciones completas para diferentes tipos de celebraciones.</p>
      </div>

      <div class="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-6xl mx-auto">
        <!-- Paquete Básico -->
        <div class="flex-1 bg-surface-0 p-10 rounded-3xl shadow-sm border border-surface-200 flex flex-col">
          <h3 class="text-2xl font-bold text-surface-900 mb-2">Reunión Íntima</h3>
          <p class="text-surface-500 mb-6">Perfecto para cumpleaños y reuniones en casa.</p>
          <div class="mb-8">
            <span class="text-sm text-surface-500">Desde</span>
            <div class="text-4xl font-extrabold text-surface-900">$150<span class="text-lg text-surface-500 font-normal">/evento</span></div>
          </div>
          <ul class="mb-10 space-y-4 flex-grow">
            <li class="flex items-start"><i class="pi pi-check text-primary-500 mt-1 mr-3"></i><span class="text-surface-600">Mesa tablón rectangular (capacidad 10 pax)</span></li>
            <li class="flex items-start"><i class="pi pi-check text-primary-500 mt-1 mr-3"></i><span class="text-surface-600">10 Sillas plegables acojinadas</span></li>
            <li class="flex items-start"><i class="pi pi-check text-primary-500 mt-1 mr-3"></i><span class="text-surface-600">Mantelería básica (color a elegir)</span></li>
            <li class="flex items-start"><i class="pi pi-check text-primary-500 mt-1 mr-3"></i><span class="text-surface-600">Flete y montaje incluido (zona centro)</span></li>
          </ul>
          <button class="w-full py-4 px-4 border-2 border-primary-600 text-primary-600 font-bold rounded-xl hover:bg-primary-50 transition-colors">Cotizar Paquete</button>
        </div>

        <!-- Paquete VIP -->
        <div class="flex-1 bg-primary-600 p-10 rounded-3xl shadow-xl transform md:-translate-y-4 text-white relative flex flex-col">
          <div class="absolute top-0 right-0 bg-surface-900 text-white text-xs font-bold px-4 py-2 rounded-bl-xl rounded-tr-3xl uppercase tracking-wider">Más Solicitado</div>
          <h3 class="text-2xl font-bold mb-2">Boda Elegance</h3>
          <p class="text-primary-100 mb-6">Mobiliario premium para un día inolvidable.</p>
          <div class="mb-8">
            <span class="text-sm text-primary-200">Personalizable</span>
            <div class="text-4xl font-extrabold">Cotización<span class="text-lg text-primary-200 font-normal">/a medida</span></div>
          </div>
          <ul class="mb-10 space-y-4 flex-grow">
            <li class="flex items-start"><i class="pi pi-check text-white mt-1 mr-3"></i><span class="text-primary-50">Sillas Avant Garde o Crossback</span></li>
            <li class="flex items-start"><i class="pi pi-check text-white mt-1 mr-3"></i><span class="text-primary-50">Mesas vintage de madera o cuadradas</span></li>
            <li class="flex items-start"><i class="pi pi-check text-white mt-1 mr-3"></i><span class="text-primary-50">Salas Lounge para zona de cóctel</span></li>
            <li class="flex items-start"><i class="pi pi-check text-white mt-1 mr-3"></i><span class="text-primary-50">Silla y mesa especial para novios</span></li>
            <li class="flex items-start"><i class="pi pi-check text-white mt-1 mr-3"></i><span class="text-primary-50">Prioridad en agenda y montaje</span></li>
          </ul>
          <button class="w-full py-4 px-4 bg-surface-0 text-primary-600 font-bold rounded-xl hover:bg-surface-50 transition-colors">Agendar Asesoría</button>
        </div>

        <!-- Paquete Corporativo -->
        <div class="flex-1 bg-surface-0 p-10 rounded-3xl shadow-sm border border-surface-200 flex flex-col">
          <h3 class="text-2xl font-bold text-surface-900 mb-2">Corporativo</h3>
          <p class="text-surface-500 mb-6">Formalidad y comodidad para tus congresos.</p>
          <div class="mb-8">
            <span class="text-sm text-surface-500">Para 50+ personas</span>
            <div class="text-4xl font-extrabold text-surface-900">Cotización</div>
          </div>
          <ul class="mb-10 space-y-4 flex-grow">
            <li class="flex items-start"><i class="pi pi-check text-primary-500 mt-1 mr-3"></i><span class="text-surface-600">Montaje tipo auditorio o escuela</span></li>
            <li class="flex items-start"><i class="pi pi-check text-primary-500 mt-1 mr-3"></i><span class="text-surface-600">Mesas periqueras para coffee break</span></li>
            <li class="flex items-start"><i class="pi pi-check text-primary-500 mt-1 mr-3"></i><span class="text-surface-600">Pódium y tarima</span></li>
            <li class="flex items-start"><i class="pi pi-check text-primary-500 mt-1 mr-3"></i><span class="text-surface-600">Facturación empresarial</span></li>
          </ul>
          <button class="w-full py-4 px-4 border-2 border-primary-600 text-primary-600 font-bold rounded-xl hover:bg-primary-50 transition-colors">Contactar a Ventas</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
defineComponent({
  name: 'PricingSection',
});
</script>
