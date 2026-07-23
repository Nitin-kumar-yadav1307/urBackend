# urBackend Landing Page (Astro)

This is the static, SEO-optimized landing page for **urBackend** built using **Astro**, **React**, and **framer-motion**.

## 🚀 Getting Started

To run the development server locally:

```bash
npm run dev
```

The server will start at `http://localhost:4321/`.

## 📦 Project Structure

- `src/layouts/Base.astro`: Base layout file containing universal SEO settings, Meta tags, JSON-LD structured schemas, and Google Fonts.
- `src/pages/index.astro`: Main landing page built using mixed static markup and hydrated React islands.
- `src/pages/pricing.astro`: Pricing tier page.
- `src/components/`: Layout components (Navbar, Footer, StudioReplay, OrbitSection) and external graphic libraries like MagicBento and Hyperspeed.
- `src/styles/landing.css`: Bundled stylesheet representing the landing page design.
- `public/`: Public domain verification files, logos, and favicons.

## 🛠️ Build and Deploy

To test compiling the landing page locally:

```bash
npm run build
```

This compiles static production files directly to `./dist/`. 
For deployment, refer to the project's root deployment plan mapping to Vercel subdomains.
