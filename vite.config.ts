import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * A custom Vite plugin to remove Tailwind CSS CDN scripts during local development or build.
 * This allows the index.html to work for both CDN-based prototyping (e.g., in AI Studio)
 * and a standard Vite build process that compiles CSS with PostCSS, preventing conflicts.
 */
const removeTailwindCdnPlugin = (): Plugin => {
  return {
    name: 'vite-plugin-remove-tailwind-cdn',
    // This hook is invoked by Vite when transforming index.html.
    // It runs for both 'vite dev' and 'vite build'.
    transformIndexHtml(html) {
      // When Vite is running, we rely on the local PostCSS/Tailwind build,
      // so we strip out the CDN links to avoid conflicts and double-loading.
      return html
        // Remove the main Tailwind CDN script tag
        .replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/, '')
        // Remove the inline Tailwind config script block
        .replace(/<script>\s*tailwind\.config\s*=\s*{[\s\S]*?}\s*<\/script>/, '');
    }
  };
};


// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    removeTailwindCdnPlugin(), // Add the custom plugin
  ],
})
