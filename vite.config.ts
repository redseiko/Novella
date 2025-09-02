import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * A custom Vite plugin to remove Tailwind CSS CDN scripts during local development or build.
 * This allows the index.html to work for both CDN-based prototyping (e.g., in AI Studio)
 * and a standard Vite build process that compiles CSS with PostCSS, preventing conflicts.
 */
const removeTailwindCdnPlugin = () => {
  return {
    name: 'vite-plugin-remove-tailwind-cdn',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        // When Vite is running, we rely on the local PostCSS/Tailwind build,
        // so we strip out the CDN links to avoid conflicts and double-loading.
        return html
          // Remove the main Tailwind CDN script tag, allowing for other attributes
          .replace(/<script[^>]*src="https:\/\/cdn\.tailwindcss\.com"[^>]*><\/script>/, '')
          // Remove the inline Tailwind config script block that imports from '@/'
          .replace(/<script type="module">[\s\S]*?from '@\/tailwind\.theme'[\s\S]*?<\/script>/, '');
      },
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