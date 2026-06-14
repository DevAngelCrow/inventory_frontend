import { createApp } from 'vue';
import '../src/core/assets/style.css';
import PrimeVue from 'primevue/config';
import { createPinia } from 'pinia';
import ToastService from 'primevue/toastservice';
import { ConfirmationService } from 'primevue';

import router from '../src/core/router/index';
import App from './App.vue';
import { registerDirectives } from './core/directives';
import { globalFunctions, GlobalFunctions } from './core/utils/globalFunctions';
import { registerGlobalComponents } from './core/plugins/globalComponents';
import { CustomTheme } from './customTheme';

const app = createApp(App);
const pinia = createPinia();

registerDirectives(app);

app.use(ConfirmationService);
app.use(PrimeVue, {
  ripple: true,
  locale: {
    monthNames: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
    monthNamesShort: [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ],
    firstDayOfWeek: 0,
    dayNames: [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
    emptyMessage: 'No se encontraron resultados',
  },
  theme: {
    preset: CustomTheme,
    options: {
      darkModeSelector: 'none',
      cssLayer: { name: 'primevue', order: 'theme, base, primevue' },
    },
  },
});
app.use(pinia);
app.use(router);
app.use(ToastService);

//funciones globales

const entries = Object.entries(globalFunctions) as [
  keyof GlobalFunctions,
  GlobalFunctions[keyof GlobalFunctions],
][];
entries.forEach(([key, fn]) => {
  (app.config.globalProperties as Record<string, unknown>)[`$${key}`] = fn;
});

//Registro de componentes globales

registerGlobalComponents(app);

app.mount('#app');
