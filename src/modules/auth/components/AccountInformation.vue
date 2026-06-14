<template>
  <div class="w-full h-full flex flex-col justify-start gap-5">
    <section name="title">
      <span class="text-2xl font-extrabold">Información de la cuenta</span>
    </section>
    <section name="content" class="w-full gap-3 flex flex-row flex-wrap">
      <AppInputText
        class="flex-1"
        id="email"
        v-model="email"
        :error-messages="errors.email"
        label="Email*"
        placeholder="juan@mail.com"
        v-bind="emailAttrs"
        @update:modelValue="validationInputEmail(email, 'email')"
        :readonly="!editMode"
      />
      <AppInputText
        class="flex-1"
        id="user_name"
        label="Nombre usuario*"
        v-model="userName"
        v-bind="userNameAttrs"
        :error-messages="errors.userName"
        @update:modelValue="validationInputAlphanumeric(userName, 'userName')"
        :readonly="!editMode"
      />
    </section>
  </div>
</template>
<script setup lang="ts">
import { inject } from 'vue';

import { useAuth } from '../composables/useAuth';
type useAuthType = ReturnType<typeof useAuth>;

const useAuthInstance = inject<useAuthType>('useAuthInstance')!;
const {
  email,
  emailAttrs,
  userName,
  userNameAttrs,
  errors,
  validationInputEmail,
  validationInputAlphanumeric,
  editMode,
} = useAuthInstance;
</script>
