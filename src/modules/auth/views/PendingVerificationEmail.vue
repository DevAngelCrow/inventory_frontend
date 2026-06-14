<template>
  <div
    class="px-5 py-3 flex justify-center flex-wrap text-center items-center gap-1 w-full h-full"
  >
    <div
      class="flex justify-center flex-wrap flex-col gap-12 bg-surface-200 rounded-xl px-8 py-9"
    >
      <section
        id="user_register_status"
        class="flex justify-center flex-wrap flex-col gap-7"
      >
        <i
          class="pi pi-check-circle text-green-700"
          style="font-size: 5rem"
        ></i>
        <span>Registro de usuario exitoso</span>
      </section>
      <section
        id="info_action"
        class="flex justify-center flex-wrap flex-col gap-6"
      >
        <i class="material-symbols-outlined" style="font-size: 5rem"
          >mark_email_unread</i
        >
        <span>
          Para poder acceder a las funcionalidades del sistema de facturacion es
          necesario que revises el correo electronico (<em
            class="font-extrabold"
            >{{ email }}</em
          >) proporcionado para proceder con la validacion.
        </span>
      </section>
      <section
        id="resend_email_action"
        class="flex justify-center flex-wrap flex-col gap-6"
      >
        <i class="material-icons" style="font-size: 5rem">forward_to_inbox</i>
        <span>
          Si no recibiste el correo de verificacion,
          <a class="underline" href="">has click aqui para reenviarlo</a>
        </span>
      </section>
      <!-- <section
        id="update_email_action"
        class="flex justify-center flex-wrap flex-col gap-6"
      >
        <i class="material-icons" style="font-size: 5rem">edit_note</i>
        <span>
          Si deseas cambiar el correo por algun error de escritura da click aca
        </span>
      </section> -->
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';

const email = ref<string>('');
onMounted(() => {
  email.value = history.state.email;
});
</script>
<style scoped></style>
