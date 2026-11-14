import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
plugins: [tailwindcss(), netlify(), tanstackStart(), viteReact()],

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), netlify(), tanstackStart(), viteReact()],
})

export default config
