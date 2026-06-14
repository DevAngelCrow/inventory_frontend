<template>
  <Dialog
    class="!min-w-[180px]"
    v-model:visible="showModal"
    modal
    :header="title"
    :style="{ width }"
    :draggable="false"
    :close-on-escape="false"
    :closable="false"
    :stylesShowDocument="stylesShowDocument"
    :pt="{
      content: {
        class: 'scrollbar-hide px-0.5 md:pr-[1.25rem] md:pl-[1.25rem]',
      },
    }"
    :pt-options="{ mergeProps: true }"
  >
    <template #header>
      <div
        class="w-full text-center text-primary font-bold text-2xl md:text-3xl"
      >
        <slot name="header">
          <h3>{{ title }}</h3>
        </slot>
      </div>
      <div class="flex justify-end absolute right-5">
        <Button
          v-if="showIconClose"
          class="bg-transparent text-primary border-none"
          icon="pi pi-times"
          rounded
          @click="closeModal"
        />
      </div>
    </template>
    <template #default>
      <div class="flex justify-center w-full h-full overflow-hidden">
        <slot name="default"> </slot>
      </div>
    </template>
    <template #footer>
      <slot name="footer">
        <div
          v-if="footerButtons"
          class="w-full flex justify-center columns-2 gap-8"
        >
          <Button v-if="showBtnCancelFooter" outlined @click="closeModal">{{
            titleBtnCancel
          }}</Button>
          <Button v-if="showBtnConfirmFooter" @click="confirmModal">{{
            titleBtnConfirm
          }}</Button>
        </div>
      </slot>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { computed } from 'vue';

defineOptions({ name: 'AppModal' });

const emits = defineEmits(['close-modal', 'confirm-modal', 'update:show']);
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  show: {
    type: Boolean,
    default: false,
  },
  titleBtnCancel: {
    type: String,
    default: 'Cancel',
  },
  titleBtnConfirm: {
    type: String,
    default: 'Confirm',
  },
  width: {
    type: String,
    default: '50rem',
  },
  footerButtons: {
    type: Boolean,
    default: true,
  },
  showIconClose: {
    type: Boolean,
    default: false,
  },
  stylesShowDocument: {
    type: Boolean,
    default: false,
  },
  showBtnCancelFooter: {
    type: Boolean,
    default: true,
  },
  showBtnConfirmFooter: {
    type: Boolean,
    default: true,
  },
});

const showModal = computed({
  get: () => props.show,
  set: value => emits('update:show', value),
});

const closeModal = () => {
  emits('close-modal', false);
};

const confirmModal = () => {
  emits('confirm-modal');
};
</script>
<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none !important;
}
</style>
