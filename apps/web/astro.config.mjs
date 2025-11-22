import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    react(),
    svelte(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  output: 'server',
});
