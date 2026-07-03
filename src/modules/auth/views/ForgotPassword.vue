<template>
  <div class="relative w-full h-screen flex justify-center items-center overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-primary-950 z-0" />
    <div
      class="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(var(--p-primary-500-rgb),0.15),transparent)]" />

    <!-- Card -->
    <Transition name="fade-up" appear>
      <Card
        class="relative z-10 w-[95%] xs:w-[85%] sm:w-[60%] md:w-[46%] lg:w-[38%] lg:max-w-[460px] shadow-2xl border border-white/10"
        :pt="{
          root: { class: 'bg-zinc-900/80 backdrop-blur-md' },
          body: { class: 'flex flex-col gap-0 p-0' },
          content: { class: 'p-0' },
        }">
        <!-- Header -->
        <template #header>
          <div class="flex flex-col items-center pt-8 pb-2 px-8 gap-3">
            <div class="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg">
              <i class="pi pi-key text-white text-xl" />
            </div>
            <div class="text-center">
              <h1 class="text-2xl font-semibold text-white tracking-tight">Recuperar contraseña</h1>
              <p class="text-sm text-zinc-400 mt-1">Ingresa tu correo para recibir un enlace de recuperación</p>
            </div>
          </div>
        </template>

        <!-- Content -->
        <template #content>
          <form class="flex flex-col gap-5 px-8 pb-8 pt-4" @submit.prevent="debouncedSubmit">
            <!-- Error alert -->
            <Transition name="fade">
              <div v-if="authError"
                class="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <i class="pi pi-exclamation-circle mt-0.5 shrink-0" />
                <span>{{ authError }}</span>
              </div>
            </Transition>

            <!-- Success alert -->
            <Transition name="fade">
              <div v-if="successMessage"
                class="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                <i class="pi pi-check-circle mt-0.5 shrink-0" />
                <span>{{ successMessage }}</span>
              </div>
            </Transition>

            <!-- Inputs -->
            <div class="flex flex-col gap-4">
              <AppInputText placeholder="Correo electrónico" v-model="email" show-icon
                prepend-inner-icon="pi pi-envelope" :error-messages="errors.email" v-bind="emailAttrs"
                label="Correo electrónico" class="w-full" :disabled="isLoading || isSuccess"
                @update:modelValue="validationInputEmail(email, 'email')" />
            </div>

            <!-- Submit -->
            <Button type="submit" :loading="isLoading" :disabled="isLoading || isSuccess" class="w-full mt-1"
              size="large">
              <template #default>
                <span class="flex items-center justify-center gap-2">
                  <i v-if="!isLoading" class="pi pi-send" />
                  {{ isLoading ? 'Enviando enlace...' : 'Enviar enlace' }}
                </span>
              </template>
            </Button>

            <!-- Back to Login link -->
            <p class="text-center text-sm text-zinc-400">
              <router-link to="/login" class="text-primary-400 hover:text-primary-300 transition-colors ml-1">
                Volver al inicio de sesión
              </router-link>
            </p>
          </form>
        </template>
      </Card>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Card, Button } from 'primevue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

import AppInputText from '@/core/components/AppInputText.vue';
import { emailFormat } from '@/core/utils/validationRules';
import { useAuth } from '../composables/useAuth';
import authServices from '@/core/services/auth.services';
import { debounce } from '@/core/utils/debounceFunction';

const { validationInputEmail } = useAuth();

const { errors, defineField, handleSubmit } = useForm({
  validationSchema: yup.object({
    email: emailFormat(undefined, true, undefined),
  }),
});

const [email, emailAttrs] = defineField('email');

const isLoading = ref(false);
const isSuccess = ref(false);
const authError = ref('');
const successMessage = ref('');

const debouncedSubmit = debounce(
  handleSubmit(async values => {
    isLoading.value = true;
    authError.value = '';
    successMessage.value = '';

    try {
      // Aquí se conectaría la llamada real a la API para enviar el enlace de recuperación
      // await authServices.forgotPassword({ email: values.email });
      await authServices.generateLinkResetPassword(values.email);
      // Simulación de carga
      await new Promise(resolve => setTimeout(resolve, 1500));

      successMessage.value = 'Se ha enviado un enlace de recuperación a tu correo electrónico.';
      isSuccess.value = true;
    } catch (error: any) {
      authError.value = error.message || 'Ocurrió un error al enviar el correo. Por favor, inténtalo de nuevo.';
    } finally {
      isLoading.value = false;
    }
  }),
  700,
);
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
