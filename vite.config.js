import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const copyrightBanner =
  '/*! LinguaKids | Copyright © 2026 ThS.BS CK2. Lê Trọng Thiên Long | All rights reserved. Unauthorized copying, redistribution, or UI/UX cloning is prohibited without written permission. */'

function copyrightBannerPlugin() {
  return {
    name: 'linguakids-copyright-banner',
    generateBundle(_, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type === 'chunk' && typeof asset.code === 'string' && !asset.code.startsWith(copyrightBanner)) {
          asset.code = `${copyrightBanner}\n${asset.code}`
        }

        if (asset.type === 'asset' && typeof asset.source === 'string' && asset.fileName.endsWith('.css') && !asset.source.startsWith(copyrightBanner)) {
          asset.source = `${copyrightBanner}\n${asset.source}`
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyrightBannerPlugin()],
  base: '/linguakids/', // GitHub Pages base path
  server: {
    host: true, // Allow LAN access from iPad on same network
  },
})
