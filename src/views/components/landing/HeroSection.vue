<template>
  <section
    id="hero-section"
    class="flex flex-col w-screen bg-primary text-white"
  >
    <HeaderSection class="flex justify-end" />
    <section class="flex flex-row items-center justify-around">
      <div class="w-[70%]">
        <h1>Bienvenido a Facturación Electrónica SV</h1>
        <p>
          La solución definitiva para la integración de facturación electrónica
          en tu negocio.
        </p>
      </div>
      <div
        class="perspective-normal animate-fadeinleft text-white flex justify-end items-center w-[30%] h-full overflow-x-clip"
      >
        <img
          class="translate-z-1 -rotate-y-15 rotate-x-1 text-white w-[100%] h-[91%]"
          src="../../../../public/images/factura_icon_oulined.svg"
          alt="logo"
        />
      </div>
    </section>
  </section>
</template>
<script setup lang="ts">
import HeaderSection from './HeaderSection.vue';
</script>
<style scoped></style>
