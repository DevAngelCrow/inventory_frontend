<template>
  <div id="header-section" class="my-5">
    <Button class="bg-white" label="Sign Up" outlined @click="signUp" />
    <Button class="bg-white" label="Login" outlined @click="login" />
  </div>
</template>
<script setup lang="ts">
import { Button } from 'primevue';
import { useRouter } from 'vue-router';
const route = useRouter();
const signUp = () => {
  route.push('/sign-up');
};
const login = () => {
  route.push('/login');
};
</script>
<style scoped></style>
