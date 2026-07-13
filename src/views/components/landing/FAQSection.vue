<template>
  <section class="py-24 bg-surface-0">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
          Preguntas Frecuentes
        </h2>
        <p class="text-surface-600 text-lg">
          Todo lo que necesitas saber antes de rentar con nosotros.
        </p>
      </div>

      <div class="space-y-6">
        <!-- FAQ 1 -->
        <div class="bg-surface-50 rounded-2xl p-6 md:p-8">
          <h3 class="text-xl font-bold text-surface-900 mb-3">
            ¿Con cuánto tiempo de anticipación debo reservar?
          </h3>
          <p class="text-surface-600">
            Sugerimos reservar al menos con 2 a 4 semanas de anticipación para
            garantizar la disponibilidad del mobiliario, especialmente en
            temporadas altas como noviembre y diciembre.
          </p>
        </div>

        <!-- FAQ 2 -->
        <div class="bg-surface-50 rounded-2xl p-6 md:p-8">
          <h3 class="text-xl font-bold text-surface-900 mb-3">
            ¿El montaje y desmontaje están incluidos en el precio?
          </h3>
          <p class="text-surface-600">
            El flete y montaje básico están incluidos para zonas dentro del área
            metropolitana. El desmontaje se coordina según el horario del
            evento; horarios de madrugada pueden tener un cargo extra.
          </p>
        </div>

        <!-- FAQ 3 -->
        <div class="bg-surface-50 rounded-2xl p-6 md:p-8">
          <h3 class="text-xl font-bold text-surface-900 mb-3">
            ¿Qué sucede si algún mueble se daña durante el evento?
          </h3>
          <p class="text-surface-600">
            Se solicita un depósito en garantía al momento de la renta. En caso
            de daños irreparables o quemaduras, se deducirá el costo de
            reposición de dicho depósito.
          </p>
        </div>

        <!-- FAQ 4 -->
        <div class="bg-surface-50 rounded-2xl p-6 md:p-8">
          <h3 class="text-xl font-bold text-surface-900 mb-3">
            ¿Puedo ver el mobiliario físicamente antes de rentarlo?
          </h3>
          <p class="text-surface-600">
            ¡Por supuesto! Puedes agendar una cita en nuestro showroom para
            conocer la calidad de las sillas, texturas de la mantelería y
            opciones de cristalería.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
defineComponent({
  name: 'FAQSection',
});
</script>
