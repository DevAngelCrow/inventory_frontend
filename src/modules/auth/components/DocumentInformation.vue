<template>
  <div class="w-full flex flex-col justify-start gap-5">
    <section name="title">
      <span class="text-2xl font-extrabold">Información de documentos</span>
    </section>
    <section name="content" class="w-full gap-3 flex flex-col flex-wrap">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppSelect
          class="flex-1"
          id="document_type"
          label="Tipo de documento*"
          v-model="documentType"
          v-bind="documentTypeAttrs"
          :error-messages="errors.documentType"
          option-label="name"
          :options="documentTypesOptions"
          :readonly="!editMode"
        />
        <AppInputMask
          class="flex-1"
          id="document"
          label="Número de documento*"
          v-model="documentNumber"
          v-bind="documentNumberAttrs"
          :error-messages="errors.documentNumber"
          :mask="documentType?.mask"
          :placeholder="documentType?.mask"
          :readonly="!editMode"
        />
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { inject, onMounted } from 'vue';

import { useAuth } from '../composables/useAuth';

type useAuthType = ReturnType<typeof useAuth>;
const useAuthInstance = inject<useAuthType>('useAuthInstance')!;
const {
  documentType,
  documentTypeAttrs,
  documentNumber,
  documentNumberAttrs,
  errors,
  documentTypesOptions,
  editMode,
} = useAuthInstance;

onMounted(() => {
  console.log('DocumentInformation component mounted', documentType.value);
  console.log('Document types options:', documentTypesOptions.value);
});
</script>
