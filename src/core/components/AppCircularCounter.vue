<template>
  <div class="flex" :style="{ width: size, height: size }">
    <div class="relative w-full h-full">
      <svg class="w-full h-full" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="#e5e7eb"
          :stroke-width="strokeWidth"
        />

        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          :stroke="resolvedColor"
          :stroke-width="strokeWidth"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          stroke-linecap="round"
          style="
            transition: stroke-dashoffset 0.3s ease-in-out;
            transform: rotate(-90deg);
            transform-origin: 100px 100px;
          "
        />
      </svg>

      <div class="absolute inset-0 flex justify-center items-center">
        <div
          class="rounded-full bg-white w-[80%] h-[80%] flex justify-center items-center"
        >
          <div class="flex flex-col w-[75%] justify-center">
            <span
              :class="textSizeClass"
              class="tracking-tighter font-semibold border-b text-center"
              >{{ selected }}</span
            >
            <span
              :class="textSizeClass"
              class="tracking-tighter font-semibold text-center"
              >{{ total }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const {
  total,
  selected,
  color,
  size = '50px',
  strokeWidth = 20,
} = defineProps<{
  total: number;
  selected: number;
  color?: string;
  size?: string;
  strokeWidth?: number;
}>();

const radius = 90;
const circumference = computed(() => 2 * Math.PI * radius);
//const progress = computed(() => (selected / total) * 100)
const strokeDashoffset = computed(
  () => circumference.value - (selected / total) * circumference.value,
);

const resolvedColor = computed(() => {
  const col = color;
  if (col?.startsWith('#') || col?.startsWith('rgb')) {
    return col;
  }
  const element = document.documentElement;
  const style = getComputedStyle(element);
  const varName = `--color-${col}`;
  const value = style.getPropertyValue(varName).trim();
  return value ? `rgb(${value})` : '#000000';
});

const textSizeClass = computed(() => {
  const sizeValue = parseInt(size);
  if (sizeValue <= 40) return 'text-[8px]';
  if (sizeValue <= 60) return 'text-[9px]';
  if (sizeValue <= 80) return 'text-[10px]';
  return 'text-[12px]';
});
</script>

<style scoped></style>
