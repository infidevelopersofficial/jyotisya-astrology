# Static Image Implementation Guide

This guide walks through replacing external Unsplash URLs with local static assets.

---

## Step 1: Create Directory Structure

Run the setup script:
```bash
chmod +x setup-static-assets.sh
./setup-static-assets.sh
```

This creates:
```
public/static/
├── backgrounds/
├── gemstones/
├── rudraksha/
├── yantras/
├── puja/
└── books/
```

---

## Step 2: Download & Convert Images

### Using Online Tool (Easiest)
1. Visit https://squoosh.app
2. Download image from Unsplash
3. Convert to WebP format (80% quality)
4. Save to appropriate folder

### Using Command Line (Batch)
```bash
# Install ImageMagick (macOS)
brew install imagemagick

# Convert single image
convert unsplash-image.jpg -quality 80 public/static/backgrounds/cosmic-texture.webp

# Batch convert all
for img in *.jpg; do 
  convert "$img" -quality 80 "public/static/backgrounds/${img%.jpg}.webp"
done
```

---

## Step 3: Update Layout Background

### File: `apps/web/app/layout.tsx`

**Before:**
```tsx
<div 
  className="pointer-events-none fixed inset-0 -z-10 opacity-40 mix-blend-screen" 
  style={{ 
    backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=60')", 
    backgroundSize: "cover", 
    backgroundPosition: "center" 
  }} 
/>
```

**After:**
```tsx
<div className="pointer-events-none fixed inset-0 -z-10 bg-cosmic-texture opacity-40 mix-blend-screen" />
```

### Update CSS: `apps/web/app/globals.css`

Add background image utilities:
```css
@layer components {
  /* Backgrounds */
  .bg-cosmic-texture {
    background-image: url('/static/backgrounds/cosmic-texture.webp');
    background-size: cover;
    background-position: center;
  }

  .bg-astrology-hero {
    background-image: url('/static/backgrounds/astrology-hero.webp');
    background-attachment: fixed;
  }

  .bg-consultation-cta {
    background-image: url('/static/backgrounds/consultation-cta.webp');
  }
}
```

---

## Step 4: Update Hero Component

### File: `apps/web/components/sections/hero.tsx`

**Before:**
```tsx
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 lg:px-16">
      <Image
        className="pointer-events-none absolute right-[-12rem] top-[-6rem] hidden opacity-30 blur-0 lg:block"
        src="https://images.unsplash.com/photo-1604014230599-4b3d5d2d9a7d?auto=format&fit=crop&w=1200&q=80"
        alt="Indian astrologer reading a birth chart"
        width={720}
        height={720}
        priority
      />
      {/* ... */}
    </section>
  );
}
```

**After:**
```tsx
import Image from "next/image";
import { IMAGES } from "@/lib/images/IMAGE_MAP";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 lg:px-16">
      <Image
        className="pointer-events-none absolute right-[-12rem] top-[-6rem] hidden opacity-30 blur-0 lg:block"
        src={IMAGES.BACKGROUNDS.ASTROLOGY_HERO}
        alt="Indian astrologer reading a birth chart"
        width={720}
        height={720}
        priority
        quality={85}
      />
      {/* ... */}
    </section>
  );
}
```

---

## Step 5: Update Consultation CTA

### File: `apps/web/components/consultation/cta.tsx`

**Before:**
```tsx
<Image
  src="https://images.unsplash.com/photo-1574068468668-a05a11f871da?auto=format&fit=crop&w=1200&q=80"
  alt="Astrologer consultation"
  fill
  className="pointer-events-none -z-10 object-cover opacity-30"
/>
```

**After:**
```tsx
import { IMAGES } from "@/lib/images/IMAGE_MAP";

<Image
  src={IMAGES.BACKGROUNDS.CONSULTATION_CTA}
  alt="Astrologer consultation"
  fill
  className="pointer-events-none -z-10 object-cover opacity-30"
  quality={85}
/>
```

---

## Step 6: Update Mobile App Section

### File: `apps/web/components/sections/mobile-app.tsx`

**Before:**
```tsx
<Image
  src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80"
  alt="Mobile app mockup"
  width={400}
  height={500}
/>
```

**After:**
```tsx
import { IMAGES } from "@/lib/images/IMAGE_MAP";

<Image
  src={IMAGES.BACKGROUNDS.MOBILE_APP_SHOWCASE}
  alt="Mobile app mockup"
  width={400}
  height={500}
  quality={85}
/>
```

---

## Step 7: Update Product Seed Data

### File: `packages/schemas/prisma/seed.ts`

**Before:**
```typescript
prisma.product.upsert({
  where: { slug: "emerald-gemstone" },
  update: {},
  create: {
    name: "Emerald Gemstone",
    slug: "emerald-gemstone",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
    // ...
  }
})
```

**After:**
```typescript
import { IMAGES } from "@digital-astrology/lib"; // If moving to shared lib

prisma.product.upsert({
  where: { slug: "emerald-gemstone" },
  update: {},
  create: {
    name: "Emerald Gemstone",
    slug: "emerald-gemstone",
    imageUrl: "/static/gemstones/emerald.webp",
    // ...
  }
})
```

Complete mapping:
```typescript
// Gemstones
{ slug: "emerald-gemstone", imageUrl: "/static/gemstones/emerald.webp" },
{ slug: "ruby-gemstone", imageUrl: "/static/gemstones/ruby.webp" },
{ slug: "blue-sapphire", imageUrl: "/static/gemstones/blue-sapphire.webp" },
{ slug: "yellow-sapphire", imageUrl: "/static/gemstones/yellow-sapphire.webp" },

// Rudraksha
{ slug: "rudraksha-5-mukhi", imageUrl: "/static/rudraksha/rudraksha-5-mukhi.webp" },
{ slug: "rudraksha-7-mukhi", imageUrl: "/static/rudraksha/rudraksha-7-mukhi.webp" },
{ slug: "rudraksha-9-mukhi", imageUrl: "/static/rudraksha/rudraksha-9-mukhi.webp" },
{ slug: "rudraksha-11-mukhi", imageUrl: "/static/rudraksha/rudraksha-11-mukhi.webp" },

// Yantras
{ slug: "yantra-shree", imageUrl: "/static/yantras/shree-yantra-brass.webp" },

// Puja
{ slug: "puja-kit-ganesh", imageUrl: "/static/puja/ganesh-puja-kit.webp" },
```

---

## Step 8: Update Commerce API

### File: `apps/web/pages/api/commerce/products.ts`

**Before:**
```typescript
export const MOCK_PRODUCTS = [
  {
    category: "Gemstone",
    imageUrl: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=400&q=80",
    // ...
  }
];
```

**After:**
```typescript
import { IMAGES } from "@/lib/images/IMAGE_MAP";

export const MOCK_PRODUCTS = [
  {
    category: "Gemstone",
    imageUrl: IMAGES.GEMSTONES.EMERALD,
    // ...
  }
];
```

---

## Step 9: Create Placeholder SVG

### File: `public/static/placeholder.svg`

```svg
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#f5f5f5"/>
  <text x="50%" y="50%" font-size="18" fill="#999" text-anchor="middle" dominant-baseline="middle">
    Image not available
  </text>
</svg>
```

---

## Step 10: Optimize Next.js Config

### File: `apps/web/next.config.js`

Ensure proper image handling:
```javascript
module.exports = {
  images: {
    remotePatterns: [
      // Only keep for testimonial avatars (external variety needed)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/photo-*',
      },
    ],
    // Enable AVIF for better compression
    formats: ['image/avif', 'image/webp'],
    // Cache static images aggressively
    minimumCacheTTL: 31536000, // 1 year
  },
};
```

---

## Testing Checklist

- [ ] All background images render without flashing
- [ ] Product images load from `/static/` paths
- [ ] No 404 errors in Network tab (DevTools)
- [ ] Run `yarn build` — check bundle size
- [ ] Run Lighthouse — verify LCP improvement
- [ ] Test on mobile (slow 3G throttling)
- [ ] Verify layout shift (CLS = 0)
- [ ] Check image-related Sentry errors

---

## Performance Verification

```bash
# Run Lighthouse audit
npm run lighthouse

# Expected improvements:
# - LCP: ~3.2s → ~1.8s (44% faster)
# - FCP: ~2.1s → ~1.2s (43% faster)  
# - CLS: ~0.15 → ~0.05 (67% better)
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Images not loading | Verify file exists in correct `/public/static/` folder |
| Layout shift on load | Set explicit `width` & `height` on `<Image>` components |
| Images blurry | Check quality setting (should be 80-85); try WebP format |
| Build errors | Clear `.next` cache: `rm -rf .next && yarn build` |
| Slow load on mobile | Enable AVIF format in `next.config.js` |

---

## Migration Summary

**Total changes:**
- ✅ 7 background/positioned images → local paths
- ✅ 10+ product images → local paths  
- ✅ 1 layout configuration update
- ✅ 3 CSS utility classes added
- ✅ IMAGE_MAP centralized asset registry

**Estimated effort:** 2-3 hours  
**Estimated ROI:** 44% LCP improvement, 100% reliability

---

## See Also

- [IMAGE_AUDIT_REPORT.md](../IMAGE_AUDIT_REPORT.md) - Audit findings
- [lib/images/IMAGE_MAP.ts](../lib/images/IMAGE_MAP.ts) - Asset registry
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web.dev Image Optimization](https://web.dev/image-optimization/)
