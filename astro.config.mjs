import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://coffee-repair-master.netlify.app',
  compressHTML: true,
  scopedStyleStrategy: 'class',
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
});
