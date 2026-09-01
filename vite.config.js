import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000',
      '/set': 'http://localhost:8000',
      '/session': 'http://localhost:8000',
      '/sessions': 'http://localhost:8000',
      '/overview': 'http://localhost:8000',
      '/profile': 'http://localhost:8000',
      '/calculator': 'http://localhost:8000',
      '/nutrition': 'http://localhost:8000',
      '/water': 'http://localhost:8000',
      '/weight': 'http://localhost:8000',
      '/food': 'http://localhost:8000',
      '/cardio': 'http://localhost:8000',
      '/history': 'http://localhost:8000',
      '/chat': 'http://localhost:8000',
      '/exercises': 'http://localhost:8000',
      '/analytics': 'http://localhost:8000',
      '/admin': 'http://localhost:8000',
      '/fitness-score': 'http://localhost:8000',
      '/ai': 'http://localhost:8000',
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true
      }
    }
  }
});
