<template>
  <Drawer
    class="bg-primary-100 border-2 border-neutral-800"
    v-model:visible="sideBarVisible.sideBar"
    dismissable
    block-scroll
    :pt="{
      header: {
        class: 'flex justify-end items-end',
      },
    }"
    :pt-options="{
      mergeProps: true,
    }"
  >
    <template #container="{ closeCallback }">
      <div class="flex items-center justify-between px-1 pt-4 shrink-0">
        <span class="inline-flex items-center gap-2">
          <svg
            width="35"
            height="40"
            viewBox="0 0 35 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M25.87 18.05L23.16 17.45L25.27 20.46V29.78L32.49 23.76V13.53L29.18 14.73L25.87 18.04V18.05ZM25.27 35.49L29.18 31.58V27.67L25.27 30.98V35.49ZM20.16 17.14H20.03H20.17H20.16ZM30.1 5.19L34.89 4.81L33.08 12.33L24.1 15.67L30.08 5.2L30.1 5.19ZM5.72 14.74L2.41 13.54V23.77L9.63 29.79V20.47L11.74 17.46L9.03 18.06L5.72 14.75V14.74ZM9.63 30.98L5.72 27.67V31.58L9.63 35.49V30.98ZM4.8 5.2L10.78 15.67L1.81 12.33L0 4.81L4.79 5.19L4.8 5.2ZM24.37 21.05V34.59L22.56 37.29L20.46 39.4H14.44L12.34 37.29L10.53 34.59V21.05L12.42 18.23L17.45 26.8L22.48 18.23L24.37 21.05ZM22.85 0L22.57 0.69L17.45 13.08L12.33 0.69L12.05 0H22.85Z"
              fill="var(--p-primary-color)"
            />
            <path
              d="M30.69 4.21L24.37 4.81L22.57 0.69L22.86 0H26.48L30.69 4.21ZM23.75 5.67L22.66 3.08L18.05 14.24V17.14H19.7H20.03H20.16H20.2L24.1 15.7L30.11 5.19L23.75 5.67ZM4.21002 4.21L10.53 4.81L12.33 0.69L12.05 0H8.43002L4.22002 4.21H4.21002ZM21.9 17.4L20.6 18.2H14.3L13 17.4L12.4 18.2L12.42 18.23L17.45 26.8L22.48 18.23L22.5 18.2L21.9 17.4ZM4.79002 5.19L10.8 15.7L14.7 17.14H14.74H15.2H16.85V14.24L12.24 3.09L11.15 5.68L4.79002 5.2V5.19Z"
              fill="var(--p-text-color)"
            />
          </svg>
          <span class="font-semibold text-2xl text-primary">Your Logo</span>
        </span>
        <span>
          <Button
            type="button"
            @click="closeCallback"
            icon="pi pi-times"
            rounded
            variant="outlined"
          ></Button>
        </span>
      </div>
      <AppMenuItemSideBar :mappedMenu="mappedMenu" />
    </template>
  </Drawer>
</template>
<script setup lang="ts">
import { Button, Drawer } from 'primevue';
import { onMounted, ref, watch } from 'vue';

import { useLayoutStore } from '../store/useLayoutStore';
import AppMenuItemSideBar from './AppMenuItemSideBar.vue';
import { MenuBar } from '../interfaces/menu.bar.dinamic.interface';

defineOptions({ name: 'AppSideBar' });

const sideBarVisible = useLayoutStore();
const mappedMenu = ref<MenuBar[]>([]);

const props = defineProps<{
  menu: MenuBar[];
}>();

const transformMenu = (menu: MenuBar[]) => {
  return menu.filter(item => {
    if (
      (item.children && item.children.length > 0) ||
      (!item.children.length && item.parent === null)
    ) {
      return item;
    }
  });
};

onMounted(() => {
  mappedMenu.value = transformMenu(props.menu);
});

watch(
  () => props.menu,
  new_value => {
    mappedMenu.value = transformMenu(new_value);
  },
);
</script>
