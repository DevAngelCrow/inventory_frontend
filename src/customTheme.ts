import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
export const CustomTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{emerald.50}',
      100: '{emerald.100}',
      200: '{emerald.200}',
      300: '{emerald.300}',
      400: '{emerald.400}',
      500: '{emerald.500}',
      600: '{emerald.600}',
      700: '{emerald.700}',
      800: '{emerald.800}',
      900: '{emerald.900}',
      950: '{emerald.950}',
    },
    surface: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{emerald.950}',
          inverseColor: '#FFFFFF',
          hoverColor: '{emerald.900}',
          //activeColor: '{emerald.800}',
          //outlined: '{emerald.950}'
        },
        // highlight: {
        //   background: '{emerald.700}',
        //   focusBackground: '{emerald.600}',
        //   color: '#FFFFFF',
        //   focusColor: '#FFFFFF',
        // },
      },
    },
  },
  components: {
    button: {
      colorScheme: {
        light: {
          outlined: {
            primary: {
              color: '{emerald.950}',
              borderColor: '{emerald.950}',
            },
          },
        },
      },
    },
    dialog: {
      root: {
        borderColor: '{emerald.950}',
      },
    },
  },
});
