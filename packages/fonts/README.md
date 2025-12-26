# @jyotisya/fonts

Shared font package for the Jyotishya monorepo.

- Provides Roboto 300 via `@fontsource/roboto`.
- Exported `style` is `index.css`. Import the package from your app's root layout:

```ts
import "@jyotisya/fonts";
import "./globals.css";
```

Notes:

- This package depends on `@fontsource/roboto`. Run your workspace package manager to install.
- Fonts imported through `@fontsource` will be bundled by Next.js and served from your app's origin, so CSP `font-src 'self'` remains valid.
