<template>
  <ul class="flex flex-col h-full overflow-y-auto m-0 p-0 list-none">
    <li v-for="section in mappedMenu" :key="section.id || section.title"
      class="flex items-start justify-center px-2 py-1.5 shrink-0 flex-wrap flex-col gap-1">
      <!--Si tiene hijos, no usamos router-link -->
      <div v-if="isChildren(section.children)" :class="[
        'flex flex-row justify-start items-center flex-wrap w-full overflow-hidden hover:bg-primary-200 hover:rounded-md hover:outline',
      ]" :id="section.title">
        <div v-ripple class="flex w-full items-center">
          <i :class="`${section.icon} w-[10%] pl-2`"></i>
          <span class="w-[80%]">{{ section.title }}</span>
          <Button icon="pi pi-chevron-down" variant="text" rounded
            class="bg-transparent border-none text-primary-950 w-[10%] transform transition rounded-full no-ripple"
            :class="section.is_open ? 'rotate-180' : 'rotate-0'" @click="() => (section.is_open = !section.is_open)" />
        </div>
        <Transition name="slide-accordion">
          <ul v-if="section.is_open" class="w-full overflow-hidden">
            <AppMenuItemSideBar :mapped-menu="section.children" class="bg-primary-200 rounded-md" />
          </ul>
        </Transition>
      </div>

      <!--Si NO tiene hijos, sí usamos router-link -->
      <router-link v-else :to="section.uri" :id="section.title"
        class="flex flex-row justify-start items-center flex-wrap w-full overflow-hidden hover:border-dashed hover:border hover:rounded-md hover:cursor-pointer">
        <div v-ripple class="flex w-full items-center">
          <i :class="`${section.icon} w-[10%] pl-2`"></i>
          <span class="w-[90%]">{{ section.title }}</span>
        </div>
      </router-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { Button } from 'primevue';

import { Menu } from '../interfaces/userState.store.interface';

const { mappedMenu } = defineProps<{
  mappedMenu: Menu[];
}>();

const isChildren = (value: Menu[]) => value && value.length > 0;
</script>

<style scoped>
.no-ripple :deep(.p-ink) {
  display: none !important;
}

.slide-accordion-enter-active,
.slide-accordion-leave-active {
  transition:
    max-height 0.5s ease-in-out,
    opacity 0.4s ease-in-out;
}

.slide-accordion-leave-active {
  transition:
    max-height 0.3s ease-in,
    opacity 0.3s ease-in;
}

.slide-accordion-enter-from,
.slide-accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-accordion-enter-to,
.slide-accordion-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
