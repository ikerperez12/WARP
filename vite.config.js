import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        experience: 'experience.html',
        admin: 'admin.html',
        gaming: 'gaming.html',
        animeLanding: 'anime-landing.html',
        animeGaming: 'anime-gaming.html',
      },
    },
  },
});
