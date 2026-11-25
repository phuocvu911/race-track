import { resolve } from 'node:path'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        raceControl: resolve(import.meta.dirname, 'race-control/index.html'),
        frontDesk: resolve(import.meta.dirname, 'front-desk/index.html'),
        lapLineTracker: resolve(
          import.meta.dirname,
          'lap-line-tracker/index.html',
        ),
      },
    },
  },
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
})
