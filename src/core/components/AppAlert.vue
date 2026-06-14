<template>
  <Toast position="top-right" />
</template>
<script setup lang="ts">
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { watch } from 'vue';

import { useAlertStore } from '../store/useAlertStore';

defineOptions({ name: 'AppAlert' });

const toast = useToast();
const alert = useAlertStore();
const showTopRight = () => {
  toast.add({
    severity: alert.type,
    summary: alert?.title,
    detail: alert?.content,
    life: alert.timeout,
  });
};

watch(
  () => alert.show,
  (newValue) => {
    if (newValue) {
      showTopRight();
    } else {
      alert.close();
    }
  },
);
</script>
