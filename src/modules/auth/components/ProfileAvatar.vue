<template>
  <div class="w-full h-full flex flex-col justify-center items-center">
    <div class="relative w-max">
      <img
        :src="avatarImage"
        alt="prueba"
        class="rounded-full object-cover cursor-pointer"
        style="width: 225px; height: 225px"
      />
      <Button
        class="absolute bottom-10 left-40"
        icon="pi pi-camera"
        rounded
        :disabled="!editMode"
        @click="toggleImgProfile"
      />
    </div>
    <div :class="['w-full', dragDropContainerClasses]">
      <AppDragDropFile
        accept="image/*"
        v-model="file_img"
        v-bind="fileImgAttrs"
        :error-messages="errors.file_img"
        empty-message="Arrastre y suelte la foto de perfil aquí para cargarla"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from 'primevue';
import { computed, inject, ref, watch } from 'vue';

import { useAuthStore } from '@/core/store/useAuthStore';

import { useAuth } from '../composables/useAuth';

type UseAuthType = ReturnType<typeof useAuth>;
const useAuthInstance = inject<UseAuthType>('useAuthInstance')!;

const { file_img, fileImgAttrs, errors, editMode } = useAuthInstance;

const authStore = useAuthStore();
const avatarImage = computed(
  () => authStore.profileImg ?? 'https://i.pravatar.cc/150',
);

const showDragDrop = ref<boolean>(false);

const dragDropContainerClasses = computed(() => {
  if (!showDragDrop.value)
    return 'opacity-0 h-1 transition-all duration-500 ease-out';
  return 'transition-all duration-300 ease-in';
});

const toggleImgProfile = () => {
  showDragDrop.value = !showDragDrop.value;
};

watch(editMode, newVal => {
  if (!newVal) showDragDrop.value = false;
});
</script>
