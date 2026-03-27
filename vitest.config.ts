/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'node',
        include: ['src/__tests__/**/*.test.{ts,tsx,js,jsx}'],
        coverage: {
            reporter: ['text', 'text-summary'],
            include: ['src/utils/**', 'src/store/**'],
        },
    },
})
