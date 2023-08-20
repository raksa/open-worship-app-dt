import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rootBootstrapIcons = 'node_modules/bootstrap-icons/font/fonts/';
const bootstrapIcons = {
  '/fonts/bootstrap-icons.woff': `${rootBootstrapIcons}bootstrap-icons.woff`,
  '/fonts/bootstrap-icons.woff2:': `${rootBootstrapIcons}bootstrap-icons.woff2`,
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      ...bootstrapIcons,
    },
  },
});
