<template>
  <div class="relative w-full h-screen flex justify-center items-center overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-primary-950 z-0" />
    <div class="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(var(--p-primary-500-rgb),0.15),transparent)]" />

    <!-- Card -->
    <Transition name="fade-up" appear>
      <Card
        class="relative z-10 w-[95%] xs:w-[85%] sm:w-[60%] md:w-[46%] lg:w-[38%] lg:max-w-[460px] shadow-2xl border border-white/10"
        :pt="{
          root: { class: 'bg-zinc-900/80 backdrop-blur-md' },
          body: { class: 'flex flex-col gap-0 p-0' },
          content: { class: 'p-0' },
        }"
      >
        <!-- Header -->
        <template #header>
          <div class="flex flex-col items-center pt-8 pb-2 px-8 gap-3">
            <div class="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg">
              <i class="pi pi-shield text-white text-xl" />
            </div>
            <div class="text-center">
              <h1 class="text-2xl font-semibold text-white tracking-tight">Bienvenido</h1>
              <p class="text-sm text-zinc-400 mt-1">Ingresa tus credenciales para continuar</p>
            </div>
          </div>
        </template>

        <!-- Content -->
        <template #content>
          <form
            class="flex flex-col gap-5 px-8 pb-8 pt-4"
            @submit.prevent="onSubMit"
          >
            <!-- Error alert -->
            <Transition name="fade">
              <div
                v-if="authError"
                class="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                <i class="pi pi-exclamation-circle mt-0.5 shrink-0" />
                <span>{{ authError }}</span>
              </div>
            </Transition>

            <!-- Inputs -->
            <div class="flex flex-col gap-4">
              <AppInputText
                placeholder="Correo o nombre de usuario"
                v-model="user"
                show-icon
                prepend-inner-icon="pi pi-user"
                :error-messages="errors.user"
                v-bind="userAttrs"
                label="Usuario"
                class="w-full"
                :disabled="isLoading"
              />
              <AppInputText
                placeholder="Contraseña"
                v-model="password"
                show-icon
                prepend-inner-icon="pi pi-lock"
                :error-messages="errors.password"
                v-bind="passwordAttrs"
                autocomplete="current-password"
                type="password"
                label="Contraseña"
                class="w-full"
                :disabled="isLoading"
              />
            </div>

            <!-- Remember + Forgot -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Checkbox binary v-model="rememberDevice" :disabled="isLoading" inputId="remember" />
                <label for="remember" class="text-sm text-zinc-400 cursor-pointer select-none">
                  Recordar dispositivo
                </label>
              </div>
              <router-link
                to="/forgot-password"
                class="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </router-link>
            </div>

            <!-- Submit -->
            <Button
              type="submit"
              :loading="isLoading"
              :disabled="isLoading"
              class="w-full mt-1"
              size="large"
            >
              <template #default>
                <span class="flex items-center justify-center gap-2">
                  <i v-if="!isLoading" class="pi pi-sign-in" />
                  {{ isLoading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
                </span>
              </template>
            </Button>
          </form>
        </template>
      </Card>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Card, Button, Checkbox } from 'primevue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

import AppInputText from '@/core/components/AppInputText.vue';
import { useAuth } from '../composables/useAuth';

const { errors, defineField, handleSubmit } = useForm({
  validationSchema: yup.object({
    user: yup
      .string()
      .required('El nombre de usuario es requerido')
      .min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
    password: yup
      .string()
      .required('La contraseña es requerida')
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  }),
});

const [user, userAttrs] = defineField('user');
const [password, passwordAttrs] = defineField('password');
const rememberDevice = ref(false);

const { login, isLoading, error: authError } = useAuth();

const onSubMit = handleSubmit(async values => {
  await login(values.user, values.password);
});
</script>

<style scoped>
.fade-up-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>