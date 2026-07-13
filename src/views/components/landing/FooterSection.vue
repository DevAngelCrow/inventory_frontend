<template>
  <footer
    class="bg-surface-950 text-surface-300 py-16 border-t border-surface-800"
  >
    <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
      <!-- Brand -->
      <div class="col-span-1 md:col-span-1">
        <div class="text-2xl font-bold text-primary-600 mb-4">
          Eventura Mobiliario
        </div>
        <p class="text-sm text-surface-400 mb-6">
          Proveedores de experiencias inolvidables. Alquiler de equipo de
          vanguardia para todo tipo de eventos.
        </p>
        <div class="flex space-x-4">
          <a
            href="#"
            class="w-10 h-10 bg-surface-800 rounded-full flex items-center justify-center text-surface-400 hover:text-white hover:bg-primary-600 transition-colors"
            ><i class="pi pi-instagram"></i
          ></a>
          <a
            href="#"
            class="w-10 h-10 bg-surface-800 rounded-full flex items-center justify-center text-surface-400 hover:text-white hover:bg-primary-600 transition-colors"
            ><i class="pi pi-facebook"></i
          ></a>
          <a
            href="#"
            class="w-10 h-10 bg-surface-800 rounded-full flex items-center justify-center text-surface-400 hover:text-white hover:bg-primary-600 transition-colors"
            ><i class="pi pi-whatsapp"></i
          ></a>
        </div>
      </div>

      <!-- Links -->
      <div>
        <h4 class="text-white font-bold mb-4 uppercase text-sm tracking-wider">
          Catálogo
        </h4>
        <ul class="space-y-3 text-sm">
          <li>
            <a href="#" class="hover:text-primary-500 transition-colors"
              >Sillas y Mesas</a
            >
          </li>
          <li>
            <a href="#" class="hover:text-primary-500 transition-colors"
              >Salas Lounge</a
            >
          </li>
          <li>
            <a href="#" class="hover:text-primary-500 transition-colors"
              >Mantelería y Cristalería</a
            >
          </li>
          <li>
            <a href="#" class="hover:text-primary-500 transition-colors"
              >Carpas y Toldos</a
            >
          </li>
        </ul>
      </div>

      <div>
        <h4 class="text-white font-bold mb-4 uppercase text-sm tracking-wider">
          Servicios
        </h4>
        <ul class="space-y-3 text-sm">
          <li>
            <a href="#" class="hover:text-primary-500 transition-colors"
              >Bodas</a
            >
          </li>
          <li>
            <a href="#" class="hover:text-primary-500 transition-colors"
              >Eventos Corporativos</a
            >
          </li>
          <li>
            <a href="#" class="hover:text-primary-500 transition-colors"
              >Cumpleaños y Fiestas</a
            >
          </li>
          <li>
            <a href="#" class="hover:text-primary-500 transition-colors"
              >Asesoría de Layout</a
            >
          </li>
        </ul>
      </div>

      <div>
        <h4 class="text-white font-bold mb-4 uppercase text-sm tracking-wider">
          Contacto
        </h4>
        <ul class="space-y-3 text-sm">
          <li class="flex items-start">
            <i class="pi pi-map-marker mt-1 mr-2 text-primary-600"></i
            ><span class="text-surface-400"
              >Av. Las Palmas 123, Ciudad, CP 00000</span
            >
          </li>
          <li class="flex items-start">
            <i class="pi pi-phone mt-1 mr-2 text-primary-600"></i
            ><span class="text-surface-400">+52 555 123 4567</span>
          </li>
          <li class="flex items-start">
            <i class="pi pi-envelope mt-1 mr-2 text-primary-600"></i
            ><span class="text-surface-400">contacto@eventura.com</span>
          </li>
        </ul>
      </div>
    </div>
    <div
      class="container mx-auto px-4 mt-16 pt-8 border-t border-surface-800 flex flex-col md:flex-row justify-between items-center text-sm text-surface-500"
    >
      <div class="mb-4 md:mb-0">
        &copy; {{ new Date().getFullYear() }} Eventura Mobiliario. Todos los
        derechos reservados.
      </div>
      <div class="flex space-x-6">
        <a href="#" class="hover:text-white">Términos y Condiciones</a>
        <a href="#" class="hover:text-white">Aviso de Privacidad</a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
defineComponent({
  name: 'FooterSection',
});
</script>
