# Astro Framework

description: Astro web framework — static site generation, islands architecture, and performance

## When to use
- Building content-focused websites
- Need excellent performance
- Static site generation

## Key Concepts
- Islands Architecture: Partial hydration
- Components: .astro files
- Integrations: React, Vue, Svelte
- Middleware: Request handling

## Common Patterns
\`\`\`astro
---
const title = "Hello";
---
<h1>{title}</h1>
<script>Astro.response.headers.set("Cache-Control", "public, max-age=3600");</script>
\`\`\`
