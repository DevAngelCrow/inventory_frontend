<template>
  <div class="flex flex-col align-top h-screen">
    <HeroSection />
    <FeaturesBenefitsSection />
    <HowItWorksSection />
    <TestimonialsSection />
    <PricingSection />
    <FAQSection />
    <CTASection />
    <FooterSection />
  </div>
</template>
<script setup lang="ts">
import { defineComponent } from 'vue';

import HeroSection from './components/landing/HeroSection.vue';
import FeaturesBenefitsSection from './components/landing/FeaturesBenefitsSection.vue';
import HowItWorksSection from './components/landing/HowItWorksSection.vue';
import TestimonialsSection from './components/landing/TestimonialsSection.vue';
import PricingSection from './components/landing/PricingSection.vue';
import FAQSection from './components/landing/FAQSection.vue';
import CTASection from './components/landing/CTASection.vue';
import FooterSection from './components/landing/FooterSection.vue';
defineComponent({
  name: 'Landing',
});
</script>
