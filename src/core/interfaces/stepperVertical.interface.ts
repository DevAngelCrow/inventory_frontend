import type { Component } from 'vue';
export interface StepperVerticalInterface {
  component: Component;
  header: string;
  ref: string;
  props?: Record<string, any>;
}
