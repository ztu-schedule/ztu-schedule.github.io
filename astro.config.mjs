// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://ztu-schedule.github.io',
  vite: {
      plugins: [tailwindcss()],
	},

  integrations: [react()],
});
