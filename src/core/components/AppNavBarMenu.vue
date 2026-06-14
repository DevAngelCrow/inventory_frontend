<template>
  <div class="w-full xs:mr-2 md:w-full h-full border-none rounded-none">
    <Menubar
      class="rounded-none bg-primary border-none h-full hidden md:flex"
      breakpoint="767px"
      :model="menuMapped"
      ref="menuBar"
    >
      <template #item="{ item, props, hasSubmenu, root }">
        <router-link
          v-if="item.uri"
          v-slot="{ href, navigate }"
          :to="root && item.items?.length ? '' : item.uri"
          custom
          class="flex items-center text-white hover:text-primary-950 group"
        >
          <a
            ripple
            :href="href"
            v-bind="props.action"
            @click="hasSubmenu ? $event.preventDefault() : navigate($event)"
          >
            <i :class="`${item.icon} group-hover:text-primary-700`"></i>
            <span class="group-hover:text-primary-700">
              {{ item.label }}
            </span>
            <i
              v-if="hasSubmenu"
              :class="[
                'pi pi-angle-down ml-auto',
                { 'pi-angle-down': root, 'pi-angle-right': !root },
                'group-focus:text-primary-700',
                'group-active:text-primary-700',
                'group-hover:text-primary-700',
              ]"
            ></i>
          </a>
        </router-link>
      </template>
    </Menubar>
    <div
      class="hover:bg-surface-400 hover:scale-90 transform transition-all flex justify-center items-center rounded-full aspect-square"
      @click="toggle"
      aria-haspopup="true"
      aria-controls="overlay_menu"
    >
      <Avatar
        class="hover:scale-110 hover:px-1 hover:py-1 transform transition-all"
        :image="avatarImage"
        shape="circle"
        alt="prueba"
        size="xlarge"
      />
      <MenuPrime
        class="mt-2"
        ref="popUp"
        id="overlay_menu"
        :popup="true"
        :model="menuUser"
      >
        <template #item="{ item }">
          <div
            class="flex items-center w-full px-3 primary hover:cursor-pointer"
          >
            <div
              class="flex items-center gap-2 primary"
              @click="addFunctionItemMenuUser(`${item.label}`)"
            >
              <i :class="`${item.icon} primary`"></i>
              <span class="primary">{{ item.label }}</span>
            </div>
          </div>
        </template>
      </MenuPrime>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  ComponentPublicInstance,
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  watch,
  type PropType,
} from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Menubar, Avatar, Menu as MenuPrime } from 'primevue';

import { useAuth } from '@/modules/auth/composables/useAuth';
import { useAuthStore } from '@/core/store/useAuthStore';

import type { MenuBar as MenuModel } from '../interfaces/menu.bar.dinamic.interface';

defineOptions({ name: 'AppNavBarMenu' });

const { menu } = defineProps({
  menu: {
    type: Array as PropType<MenuModel[]>,
    default: () => [],
  },
});

const router = useRouter();
const emit = defineEmits(['update:menu-sidebar']);

const authStore = useAuthStore();
const avatarImage = computed(
  () => authStore.profileImg ?? 'https://i.pravatar.cc/150',
);

const logout = useAuth().logout;
const menuMapped = ref<MenuModel[]>();
const menuAppsideBar = ref<MenuModel[]>();
const menuUser = ref<MenuModel[]>();
const popUp = ref<InstanceType<typeof MenuPrime>>();
const menuBar = ref<ComponentPublicInstance>();

const menuCopy = ref<MenuModel[]>([]);
const widthNavBarMenu = ref<number>(0);

const toggle = (event: MouseEvent | KeyboardEvent) => {
  popUp.value?.toggle(event);
};

const mapperMenuUser = () => {
  const cleanMenu = JSON.parse(JSON.stringify(menu));
  menuCopy.value = structuredClone(cleanMenu);
  if (menuCopy.value.length) {
    menuUser.value = menuCopy.value.filter(item => item.isUser);
    menuMapped.value = menuCopy.value.filter(item => !item.isUser);
  }
};

const checkWrapMenu = () => {
  menuMapped.value = menuCopy.value.filter(item => !item.isUser);

  //isMenuVisible.value = true;
  nextTick(() => {
    // Ahora que el menú está completo, verificamos si hay desbordamiento (wrap)
    window.requestAnimationFrame(() => {
      const root = menuBar.value?.$el?.querySelector?.(
        '.p-menubar-root-list',
      ) as HTMLElement;
      if (!root) return;

      const children = Array.from(root.children) as HTMLElement[];
      let wrapIndex: number | null = null;

      if (children.length > 0) {
        const firstTop = children[0].offsetTop;
        for (let i = 0; i < children.length; i++) {
          if (children[i].offsetTop > firstTop) {
            wrapIndex = i; // Encontramos el primer elemento que saltó de línea
            break;
          }
        }
      }

      if (wrapIndex !== null) {
        // Si hay desbordamiento, cortamos el menú visible y emitimos el resto
        const menuAppSideBarWithoutUser = menuCopy.value.slice(wrapIndex);

        menuAppsideBar.value = menuAppSideBarWithoutUser.filter(
          item => !item.isUser,
        );
        menuMapped.value = menuCopy.value.slice(0, wrapIndex);
      } else {
        // Si no hay desbordamiento, nos aseguramos de que el sidebar esté vacío
        menuAppsideBar.value = [];
        menuMapped.value = menuCopy.value.filter(item => !item.isUser);
      }
      emit('update:menu-sidebar', menuAppsideBar.value);
    });
  });
};

const addFunctionItemMenuUser = (item: string) => {
  const itemsMenuUser = ['Mi perfil', 'Cerrar sesión'];
  if (item === itemsMenuUser[0]) {
    router.push('/profile');
  }
  if (item === itemsMenuUser[1]) {
    logout();
  }
  return undefined;
};
watch(widthNavBarMenu, new_value => {
  if (new_value <= 769) {
    const menuAppSideBarWithoutUser = [...menuCopy.value];
    menuAppsideBar.value = menuAppSideBarWithoutUser.filter(
      item => !item.isUser,
    );
    emit('update:menu-sidebar', menuAppsideBar.value);
  } else {
    checkWrapMenu();
  }
});

const handleResize = () => {
  widthNavBarMenu.value = window.innerWidth;
};

onMounted(async () => {
  await mapperMenuUser();

  window.addEventListener('resize', handleResize);

  // Disparamos una comprobación inicial

  widthNavBarMenu.value = window.innerWidth;
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>
<style scoped>
@reference "@/core/assets/style.css";

/* Evitamos que los ítems del menubar se estiren */
:deep(.p-menubar-root-list > li),
:deep(.p-menubar-root-list > .p-menuitem),
:deep(.p-menubar-root-list > .p-menubar-item) {
  flex: 0 0 auto !important;
}

/* Aseguramos que el end slot no crezca */
:deep(.app-navbar-end) {
  flex: 0 0 auto !important;
  width: auto !important;
  height: auto !important;
}

:deep(.p-menubar-item-active > .p-menubar-item-content > .p-menubar-item-link) {
  @apply text-primary transform transition-all;
}

:deep(
  .p-menubar-item.p-focus > .p-menubar-item-content > .p-menubar-item-link
) {
  @apply text-primary transform transition-all;
}

:deep(.p-menubar-submenu .p-menubar-item-link) {
  @apply text-primary;
}
</style>
