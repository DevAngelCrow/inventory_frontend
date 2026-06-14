// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import tailwindcss from '@tailwindcss/vite';

import vue from '@astrojs/vue';

import mdx from '@astrojs/mdx';

import { fileURLToPath, URL } from "node:url";

import { contentGuide } from './src/content/docs/guides/content.guide';
// https://astro.build/config
export default defineConfig({
  integrations: [starlight({
      title: 'Inicio',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/DevAngelCrow/vue-3-template.git' }],
      customCss: ["./src/styles/global.css"],
      sidebar: [
          {
              label: 'Guía',
              items: contentGuide
          },
          {
              label: 'Componentes',
              autogenerate: { directory: 'components' },
          },
          {
            label: "Script",
            autogenerate: {directory: "scripts"}
          }
      ],
  }), vue(), mdx()],

  vite: {
    resolve: {
        alias: {
            "@main":fileURLToPath(new URL("../src", import.meta.url))
        }
    },
    plugins: [tailwindcss()],
  },
});