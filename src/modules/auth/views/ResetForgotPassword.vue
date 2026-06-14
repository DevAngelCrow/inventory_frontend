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
                            <i class="pi pi-lock text-white text-xl" />
                        </div>
                        <div class="text-center">
                            <h1 class="text-2xl font-semibold text-white tracking-tight">Nueva contraseña</h1>
                            <p class="text-sm text-zinc-400 mt-1">Ingresa tu nueva contraseña para continuar</p>
                        </div>
                    </div>
                </template>

                <!-- Content -->
                <template #content>
                    <form class="flex flex-col gap-5 px-8 pb-8 pt-4" @submit.prevent="onSubmit">
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
                            <AppInputText placeholder="Nueva contraseña" v-model="password" show-icon
                                prepend-inner-icon="pi pi-lock" :error-messages="errors.password" v-bind="passwordAttrs"
                                type="password" label="Nueva contraseña" class="w-full"
                                :disabled="isLoading || isSuccess" />
                            <AppInputText placeholder="Confirmar contraseña" v-model="confirmPassword" show-icon
                                prepend-inner-icon="pi pi-lock" :error-messages="errors.confirmPassword"
                                v-bind="confirmPasswordAttrs" type="password" label="Confirmar contraseña"
                                class="w-full" :disabled="isLoading || isSuccess" />
                        </div>

                        <!-- Submit -->
                        <Button type="submit" :loading="isLoading" :disabled="isLoading || isSuccess"
                            class="w-full mt-1" size="large" @click="onSubmit">
                            <template #default>
                                <span class="flex items-center justify-center gap-2">
                                    <i v-if="!isLoading" class="pi pi-save" />
                                    {{ isLoading ? 'Cambiando...' : 'Cambiar contraseña' }}
                                </span>
                            </template>
                        </Button>

                        <!-- Back to Login link -->
                        <p class="text-center text-sm text-zinc-400">
                            <router-link to="/login"
                                class="text-primary-400 hover:text-primary-300 transition-colors ml-1">
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
import { onMounted, ref } from 'vue';
import { Card, Button } from 'primevue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useRoute, useRouter } from 'vue-router';

import AppInputText from '@/core/components/AppInputText.vue';
import authServices from '@/core/services/auth.services';

const route = useRoute();
const router = useRouter();

const { errors, defineField, handleSubmit } = useForm({
    validationSchema: yup.object({
        password: yup
            .string()
            .required('La nueva contraseña es requerida')
            .min(6, 'La contraseña debe tener al menos 6 caracteres'),
        confirmPassword: yup
            .string()
            .required('Debes confirmar tu contraseña')
            .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
    }),
});

const [password, passwordAttrs] = defineField('password');
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword');

const isLoading = ref(false);
const isSuccess = ref(false);
const authError = ref('');
const successMessage = ref('');

const onSubmit = handleSubmit(async values => {
    isLoading.value = true;
    authError.value = '';
    successMessage.value = '';

    try {
        // Aquí se conectaría la llamada real a la API para restablecer la contraseña
        await authServices.resetPassword(
            {
                password: values.password,
            },
            {
                id: route.query.id as string,
                token: route.query.token as string,
            }
        );

        // Simulación de carga
        await new Promise(resolve => setTimeout(resolve, 1500));

        successMessage.value = 'Tu contraseña ha sido restablecida correctamente.';
        isSuccess.value = true;

        // Redirigir al login después de unos segundos
        setTimeout(() => {
            router.push('/login');
        }, 2000);
    } catch (error: any) {
        authError.value = error.message || 'Ocurrió un error al restablecer la contraseña. Por favor, inténtalo de nuevo.';
    } finally {
        isLoading.value = false;
    }
});

onMounted(() => {
    console.log('route.query', route);
})
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