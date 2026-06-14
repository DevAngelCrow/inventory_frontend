<template>
  <div
    class="loader-container fade-in"
    style="background: rgba(0, 0, 0, 0.3); z-index: 9999"
  >
    <div class="Loader"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

defineOptions({ name: 'AppLoader' });

const bloquearTeclado = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
};

const bloquearCursor = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
};

onMounted(() => {
  document.body.style.pointerEvents = 'none';
  document.addEventListener('keydown', bloquearTeclado, true);
  document.addEventListener('click', bloquearCursor, true);
  document.addEventListener('mousedown', bloquearCursor, true);
  document.addEventListener('mouseup', bloquearCursor, true);
  document.addEventListener('touchstart', bloquearCursor, true);
  document.addEventListener('touchend', bloquearCursor, true);
});

onUnmounted(() => {
  document.body.style.pointerEvents = 'auto';
  document.removeEventListener('keydown', bloquearTeclado, true);
  document.removeEventListener('click', bloquearCursor, true);
  document.removeEventListener('mousedown', bloquearCursor, true);
  document.removeEventListener('mouseup', bloquearCursor, true);
  document.removeEventListener('touchstart', bloquearCursor, true);
  document.removeEventListener('touchend', bloquearCursor, true);
});
</script>

<style scoped>
/* El fondo del loader es neutro, el color lo da el overlay del contenedor */

/* Contenedor principal con fondo semi-transparente */
.loader-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  visibility: visible;
  transition:
    opacity 0.4s ease-in-out,
    visibility 0.4s ease-in-out;
}

.Loader {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25vmin;
  height: 25vmin;
  max-width: 200px;
  max-height: 200px;
  transform: scale(0.8);
  transition: transform 0.3s ease-out;
}

.loader-container.fade-in .Loader {
  animation: scaleIn 0.5s ease-out forwards;
}

.loader-container.fade-out .Loader {
  animation: scaleOut 0.3s ease-in forwards;
}

.Loader:before,
.Loader:after {
  content: '';
  position: absolute;
  border-radius: 50%;
  animation-duration: 1.8s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  /* Usar sombra con el color primario */
  filter: drop-shadow(0 0 7px var(--p-primary-color));
}

.Loader:before {
  width: 100%;
  height: 100%;
  /* Usar el color primario de PrimeVue/Tailwind */
  box-shadow: inset 0 0 0 17px var(--p-primary-color);
  animation-name: pulsA;
}

.Loader:after {
  width: calc(100% - 34px);
  height: calc(100% - 34px);
  top: 17px;
  left: 17px;
  /* Usar el color surface de PrimeVue/Tailwind */
  box-shadow: 0 0 0 0 var(--p-surface-color);
  animation-name: pulsB;
}

@keyframes pulsA {
  0% {
    box-shadow: inset 0 0 0 17px var(--p-primary-color);
    opacity: 1;
  }
  50%,
  100% {
    box-shadow: inset 0 0 0 0 var(--p-primary-color);
    opacity: 0;
  }
}

@keyframes pulsB {
  0%,
  50% {
    box-shadow: 0 0 0 0 var(--p-surface-color);
    opacity: 0;
  }
  100% {
    box-shadow: 0 0 0 17px var(--p-surface-color);
    opacity: 1;
  }
}

/* Animaciones de entrada y salida */
@keyframes fadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(2px);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    backdrop-filter: blur(2px);
  }
  to {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  60% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes scaleOut {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.5);
    opacity: 0;
  }
}
</style>
