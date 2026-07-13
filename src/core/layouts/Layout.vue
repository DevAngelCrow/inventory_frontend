<template>
  <div class="w-full h-full flex flex-col">
    <!-- <AppLoader v-if="showLoader" /> -->
    <AppSideBar v-if="menuAppSideBar?.length" :menu="menuAppSideBar" />
    <div class="w-full min-h-screen flex flex-col">
      <header
        id="header-section"
        class="w-full h-[7%] min-h-[70px] shrink-0 fixed top-0 left-0 z-50"
      >
        <AppHeader @update:menu-sidebar="toggleMenuSidebar" />
      </header>
      <main id="main-content-section" class="w-full grow pt-[70px]">
        <AppMainContent />
      </main>
      <footer id="footer-section" class="w-full h-[6%] min-h-[50px] shrink-0">
        <AppFooter />
      </footer>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import AppHeader from '../components/AppHeader.vue';
import AppMainContent from '../components/AppMainContent.vue';
import AppFooter from '../components/AppFooter.vue';
import AppSideBar from '../components/AppSideBar.vue';
import { useAuthStore } from '../store/useAuthStore';
import { MenuBar } from '../interfaces/menu.bar.dinamic.interface';

const useAuth = useAuthStore();
const router = useRouter();

const menuAppSideBar = ref<MenuBar[]>();

const toggleMenuSidebar = (value: MenuBar[]) => {
  menuAppSideBar.value = [...value];
};

onMounted(() => {
  if (!useAuth.user && !useAuth.token) {
    router.push({ name: 'login' });
  }
});
</script>
