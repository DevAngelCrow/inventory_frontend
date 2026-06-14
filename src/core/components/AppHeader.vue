<template>
  <section class="w-full h-full bg-primary">
    <div
      class="w-full h-full bg-transparent flex justify-start items-center align-baseline"
    >
      <Button
        v-if="menuSideBar?.length"
        class="bg-transparent border-none flex"
        @click="sideBar.showSideBar(!sideBar.sideBar)"
      >
        <i class="pi pi-bars"></i>
      </Button>
      <AppNavBarMenu
        class="flex justify-end align-baseline content-center"
        :menu="items"
        @update:menu-sidebar="toggleMenu"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { Button } from 'primevue';
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useLayoutStore } from '../store/useLayoutStore';
import AppNavBarMenu from './AppNavBarMenu.vue';
import { useAuthStore } from '../store/useAuthStore';
import { MenuBar } from '../interfaces/menu.bar.dinamic.interface';

defineOptions({ name: 'AppHeader' });
const emit = defineEmits(['update:menu-sidebar']);

const sideBar = useLayoutStore();
const { menuInfo } = storeToRefs(useAuthStore());
const menuSideBar = ref<MenuBar[]>();

const toggleMenu = (value: MenuBar[]) => {
  menuSideBar.value = value;
  emit('update:menu-sidebar', menuSideBar.value);
};
const items = computed<MenuBar[]>(() => {
  return menuInfo.value
    .filter(
      item =>
        (item.show && item.children.length > 0 && item.title) ||
        (item.show && item.children.length === 0 && item.parent === null),
    )
    .map(m => {
      const menuItem: MenuBar = {
        ...m,
        label: m.title,
        icon: m.icon,
        uri: m.uri,
        isUser: false,
      };
      if (m.title === 'Usuario') {
        menuItem.isUser = true;
      }

      if (m.children && m.children.length > 0) {
        menuItem.items = m.children.map(c => ({
          ...c,
          label: c.title,
          icon: c.icon,
          url: c.uri,
        }));
      }

      return menuItem;
    });
});
</script>
<style scoped></style>
