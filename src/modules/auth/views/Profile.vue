<template>
  <div
    class="py-3 px-3 h-full max-h-full flex flex-col items-start justify-center"
  >
    <AppTitle title="Perfil" />
    <Card class="w-full h-full" v-if="!loading">
      <template #header>
        <div class="w-full flex justify-end items-center">
          <Button
            :class="[
              'mx-1 my-1 transition-opacity duration-500 ease-in-out',
              editMode
                ? 'opacity-0 pointer-events-none absolute'
                : 'opacity-100',
            ]"
            icon="pi pi-pencil"
            rounded
            @click="toggleEditionMode(true)"
          />
          <div :class="[classActions]">
            <Button
              label="Guardar"
              :class="['mx-1 my-1']"
              icon="pi pi-check"
              rounded
              @click="debouncedUpdateProfile()"
            />
            <Button
              label="Cancelar"
              :class="['mx-1 my-1']"
              outlined
              icon="pi pi-times"
              @click="toggleEditionMode(false)"
              rounded
            />
          </div>
        </div>
      </template>
      <template #content>
        <div class="w-full h-full flex flex-col md:flex-row gap-4">
          <section
            name="profile-right"
            class="w-full md:w-[30%] h-full flex justify-start items-start flex-col"
          >
            <ProfileAvatar />
            <AccountInformation />
          </section>
          <Divider layout="vertical" class="h-full hidden md:flex" />
          <Divider layout="horizontal" class="w-full flex md:hidden" />
          <section
            name="profile-left"
            class="w-full md:w-[70%] h-full justify-start items-start flex-col gap-8 flex"
          >
            <PersonalInformation />
            <DocumentInformation />
            <AddressInformation />
          </section>
        </div>
      </template>
    </Card>
  </div>
</template>
<script setup lang="ts">
import { Card, Divider, Button } from 'primevue';
import { computed, onMounted, provide, ref } from 'vue';

import AppTitle from '@/core/components/AppTitle.vue';

import ProfileAvatar from '../components/ProfileAvatar.vue';
import { useAuth } from '../composables/useAuth';
import AccountInformation from '../components/AccountInformation.vue';
import PersonalInformation from '../components/PersonalInformation.vue';
import DocumentInformation from '../components/DocumentInformation.vue';
import AddressInformation from '../components/AddressInformation.vue';
import { debounce } from '@/core/utils/debounceFunction';

const useAuthInstance = useAuth();
provide('useAuthInstance', useAuthInstance);
const {
  getNationalities,
  getMaritalStatuses,
  getGenders,
  getDocumentTypes,
  getDetailsProfile,
  startLoading,
  finishLoading,
  editMode,
  updateProfile,
} = useAuthInstance;
const loading = ref<boolean>(false);
onMounted(async () => {
  startLoading();
  loading.value = true;
  await Promise.all([
    getDocumentTypes(),
    getDetailsProfile(),
    getNationalities(),
    getMaritalStatuses(),
    getGenders(),
  ]);
  finishLoading();
  loading.value = false;
});

const toggleEditionMode = (flag: boolean) => {
  editMode.value = flag;
};
const classActions = computed(() => {
  return editMode.value
    ? 'flex justify-end items-center gap-1 transition-opacity duration-500 ease-in-out opacity-100'
    : 'opacity-0 pointer-events-none absolute';
});

const debouncedUpdateProfile = debounce(updateProfile, 700);
</script>
