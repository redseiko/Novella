
# AI Studio Build Environment & Pathing Instructions

**Audience:** AI Assistant
**Purpose:** This document provides critical system instructions for generating code compatible with the Google AI Studio prototyping environment. Adherence to these rules is mandatory to ensure applications function correctly within the platform's unique sandboxed context.

---

## 1. The AI Studio Bundler & `importmap`

The Google AI Studio environment does not use a standard local bundler like Vite during the prototyping phase. Instead, it performs a server-side transformation of all project assets.

- **File Transformation:** Every file in the project (e.g., `App.tsx`, `tailwind.theme.js`, `index.css`) is bundled into a single `index.html` file.
- **`importmap`:** This bundling process generates a large `<script type="importmap">` block. Inside this map, each project file is assigned a unique alias (e.g., `@/App`, `@/tailwind.theme`) which points to a `data:application/javascript;base64,...` URL containing the file's transpiled content.

## 2. Module Importing Convention: The `@/` Alias

Due to the `importmap` system, all internal module imports within the application's TypeScript/JavaScript files **must** use the `@/` alias.

### Correct Usage:
```javascript
// Correct: Importing a component
import App from '@/App';

// Correct: Importing a configuration file
import { UI } from '@/config';

// Correct: Importing a custom hook
import { useStoryManager } from '@/hooks/useStoryManager';
```

### Incorrect Usage:
```javascript
// Incorrect: Using relative paths
import App from './App';
import { UI } from '../config';
```

## 3. Critical Rule: `index.html` Script Modules

This is the most common point of failure and requires strict adherence.

When writing a `<script type="module">` directly within `index.html` (for tasks like configuring a CDN library), you **must** use the `@/` alias to import any local project files.

### The Problem (CORS Errors)

Using a relative path like `./tailwind.theme.js` in `index.html` will fail. The browser, whose base URL is `https://ai.studio/`, attempts to fetch this file from the sandboxed app origin (e.g., `https://*.usercontent.goog`). This cross-origin request is blocked by browser security policies (CORS), resulting in a fatal error.

### The Solution (`@/` Alias)

By using the `@/` alias, the browser is instructed to use the `data:` URL from the `importmap` for that module. This involves no network request and completely bypasses the CORS issue.

#### **Correct Example for `index.html`:**
```html
<script type="module">
  // Correct: This resolves to the inlined data: URL
  import { tailwindThemeExtend } from '@/tailwind.theme';
  
  tailwind.config = {
    theme: {
      extend: tailwindThemeExtend
    }
  }
</script>
```

#### **Incorrect Example for `index.html`:**
```html
<script type="module">
  // Incorrect: This will cause a CORS error in AI Studio
  import { tailwindThemeExtend } from './tailwind.theme.js';
  
  tailwind.config = { /* ... */ }
</script>
```

## 4. Dual Deployment & Local Builds

The project is designed for "dual deployment":
1.  **Prototyping in AI Studio:** Uses CDN scripts and the `importmap` system.
2.  **Local Development/Build:** Uses a standard Vite + PostCSS build process.

A custom Vite plugin (e.g., `removeTailwindCdnPlugin` in `vite.config.ts`) is configured to **strip out** any AI Studio-specific script blocks (like the Tailwind CDN and its configuration script) from `index.html` during a local `vite dev` or `vite build`.

This means it is safe and correct to have these CDN-related scripts in the source `index.html`, as they will be automatically removed for local builds where they would otherwise conflict with the compiled CSS.
