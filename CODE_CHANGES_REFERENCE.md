# Code Changes Reference

Quick copy-paste guide for all required code updates.

---

## 1. Create IMAGE_MAP.ts

**File**: `apps/web/lib/images/IMAGE_MAP.ts` (already created)

[Reference the file created earlier]

---

## 2. Update Layout Background

### Before & After: `apps/web/app/layout.tsx`

```diff
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-cosmic-blue text-slate-100`}>
        <div className="relative min-h-screen overflow-x-hidden">
          <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(244,200,93,0.12),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(255,99,132,0.1),_transparent_60%)]" />
-         <div className="pointer-events-none fixed inset-0 -z-10 opacity-40 mix-blend-screen" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=60')", backgroundSize: "cover", backgroundPosition: "center" }} />
+         <div className="pointer-events-none fixed inset-0 -z-10 bg-cosmic-texture opacity-40 mix-blend-screen" />
          {/* ... rest of layout ... */}
        </div>
      </body>
    </html>
  );
}
```

---

## 3. Update Globals CSS

### File: `apps/web/app/globals.css` (add at bottom)

```css
/* ========================================
   Static Image Backgrounds
   ======================================== */

@layer components {
  /* Layout backgrounds */
  .bg-cosmic-texture {
    background-image: url('/static/backgrounds/cosmic-texture.webp');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
  }

  .bg-astrology-hero {
    background-image: url('/static/backgrounds/astrology-hero.webp');
    background-size: cover;
    background-position: center;
  }

  .bg-consultation-cta {
    background-image: url('/static/backgrounds/consultation-cta.webp');
    background-size: cover;
    background-position: center;
  }

  .bg-mobile-app-showcase {
    background-image: url('/static/backgrounds/mobile-app-showcase.webp');
    background-size: cover;
    background-position: center;
  }

  .bg-panchang-highlights {
    background-image: url('/static/backgrounds/panchang-highlights.webp');
    background-size: cover;
    background-position: center;
  }

  /* Image fallback utility */
  .image-loading {
    @apply bg-slate-200 animate-pulse;
  }
}
```

---

## 4. Update Hero Component

### File: `apps/web/components/sections/hero.tsx`

```diff
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@digital-astrology/ui";
import { useLocaleContext } from "@components/providers/intl-provider";
+ import { IMAGES } from "@/lib/images/IMAGE_MAP";

export default function Hero() {
  const { copy } = useLocaleContext();
  const { hero } = copy;

  return (
    <section className="relative overflow-hidden px-6 pt-24 lg:px-16">
      <Image
        className="pointer-events-none absolute right-[-12rem] top-[-6rem] hidden opacity-30 blur-0 lg:block"
-       src="https://images.unsplash.com/photo-1604014230599-4b3d5d2d9a7d?auto=format&fit=crop&w=1200&q=80"
+       src={IMAGES.BACKGROUNDS.ASTROLOGY_HERO}
        alt="Indian astrologer reading a birth chart"
        width={720}
        height={720}
        priority
+       quality={85}
      />
      {/* ... rest of component ... */}
    </section>
  );
}
```

---

## 5. Update Consultation CTA

### File: `apps/web/components/consultation/cta.tsx`

```diff
"use client";

import Image from "next/image";
import { Button } from "@digital-astrology/ui";
import Link from "next/link";
import { useLocaleContext } from "@components/providers/intl-provider";
+ import { IMAGES } from "@/lib/images/IMAGE_MAP";

export default function ConsultationCTA() {
  const { copy } = useLocaleContext();
  const { consultation } = copy;

  return (
    <section className="px-6 lg:px-16">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-900/60 via-purple-800/50 to-rose-900/60 p-10 shadow-astro backdrop-blur">
        <Image
-         src="https://images.unsplash.com/photo-1574068468668-a05a11f871da?auto=format&fit=crop&w=1200&q=80"
+         src={IMAGES.BACKGROUNDS.CONSULTATION_CTA}
          alt="Astrologer consultation"
          fill
          className="pointer-events-none -z-10 object-cover opacity-30"
+         quality={85}
        />
        {/* ... rest of component ... */}
      </div>
    </section>
  );
}
```

---

## 6. Update Mobile App Section

### File: `apps/web/components/sections/mobile-app.tsx`

```diff
"use client";

import Image from "next/image";
import { Button } from "@digital-astrology/ui";
+ import { IMAGES } from "@/lib/images/IMAGE_MAP";

export default function MobileAppSection() {
  return (
    <section className="px-6 lg:px-16">
      <div className="grid items-center gap-12 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#1a1036] via-[#25174c] to-[#301d5e] px-8 py-12 shadow-astro lg:grid-cols-2">
        {/* ... text content ... */}
        <div>
          <Image
-           src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80"
+           src={IMAGES.BACKGROUNDS.MOBILE_APP_SHOWCASE}
            alt="Jyotishya app on mobile phone"
            width={400}
            height={500}
+           quality={85}
          />
        </div>
      </div>
    </section>
  );
}
```

---

## 7. Update Panchang Highlights

### File: `apps/web/components/sections/panchang-highlights.tsx`

```diff
"use client";

import Image from "next/image";
import { Card } from "@digital-astrology/ui";
import { usePanchang } from "@/hooks/usePanchang";
+ import { IMAGES } from "@/lib/images/IMAGE_MAP";

export default function PanchangHighlights() {
  const { data, isLoading } = usePanchang();

  return (
    <section className="px-6 lg:px-16">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-transparent p-8 shadow-astro lg:p-12">
        <Image
-         src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
+         src={IMAGES.BACKGROUNDS.PANCHANG_HIGHLIGHTS}
          alt="Panchang calendar visualization"
          fill
          className="pointer-events-none -z-10 object-cover opacity-20"
+         quality={85}
        />
        {/* ... rest of component ... */}
      </div>
    </section>
  );
}
```

---

## 8. Update Seed Data

### File: `packages/schemas/prisma/seed.ts`

```diff
+ import { IMAGES } from "@digital-astrology/lib"; // Or hard-code paths

async function main() {
  // ... existing code ...

  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: "emerald-gemstone" },
      update: {},
      create: {
        name: "Emerald Gemstone",
        slug: "emerald-gemstone",
        description: "Natural certified emerald with excellent clarity. Enhances communication and intellect.",
        price: 3999,
        category: "Gemstone",
-       imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
+       imageUrl: "/static/gemstones/emerald.webp",
        images: [],
        inStock: true,
        stockCount: 50,
        featured: true
      }
    }),
    prisma.product.upsert({
      where: { slug: "ruby-gemstone" },
      update: {},
      create: {
        name: "Ruby Gemstone",
        slug: "ruby-gemstone",
        description: "Premium natural ruby for strength and courage.",
        price: 4999,
        category: "Gemstone",
-       imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400",
+       imageUrl: "/static/gemstones/ruby.webp",
        images: [],
        inStock: true,
        stockCount: 30,
        featured: true
      }
    }),
    prisma.product.upsert({
      where: { slug: "blue-sapphire" },
      update: {},
      create: {
        name: "Blue Sapphire (Neelam)",
        slug: "blue-sapphire",
        description: "Authentic blue sapphire for prosperity and success in career.",
        price: 5999,
        category: "Gemstone",
-       imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
+       imageUrl: "/static/gemstones/blue-sapphire.webp",
        images: [],
        inStock: true,
        stockCount: 25,
        featured: true
      }
    }),
    // ... continue for all products ...
    prisma.product.upsert({
      where: { slug: "rudraksha-5-mukhi" },
      update: {},
      create: {
        name: "5 Mukhi Rudraksha Mala",
        slug: "rudraksha-5-mukhi",
        description: "Authentic 5 Mukhi Rudraksha mala with 108 beads. Blessed by Pandit Rajesh Sharma.",
        price: 2499,
        category: "Rudraksha",
-       imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343f?w=800",
+       imageUrl: "/static/rudraksha/rudraksha-5-mukhi.webp",
        images: [],
        inStock: true,
        stockCount: 25,
        featured: true
      }
    }),
    prisma.product.upsert({
      where: { slug: "yantra-shree" },
      update: {},
      create: {
        name: "Shree Yantra (Brass)",
        slug: "yantra-shree",
        description: "Premium quality brass Shree Yantra for prosperity and abundance.",
        price: 899,
        category: "Yantra",
-       imageUrl: "https://images.unsplash.com/photo-1611228422550-f4289d546238?w=800",
+       imageUrl: "/static/yantras/shree-yantra-brass.webp",
        images: [],
        inStock: true,
        stockCount: 50,
        featured: false
      }
    }),
    prisma.product.upsert({
      where: { slug: "puja-kit-ganesh" },
      update: {},
      create: {
        name: "Ganesh Puja Kit",
        slug: "puja-kit-ganesh",
        description: "Complete puja kit for Ganesh worship.",
        price: 599,
        category: "Puja Items",
-       imageUrl: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800",
+       imageUrl: "/static/puja/ganesh-puja-kit.webp",
        images: [],
        inStock: true,
        stockCount: 100,
        featured: false
      }
    })
  ]);
}
```

---

## 9. Update Commerce Products API

### File: `apps/web/pages/api/commerce/products.ts`

```diff
+ import { IMAGES } from "@/lib/images/IMAGE_MAP";

const mockGemstones = [
  {
    category: "Gemstone",
-   imageUrl: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=400&q=80",
+   imageUrl: IMAGES.GEMSTONES.EMERALD,
    name: "Emerald Stone",
    // ...
  },
  {
    category: "Gemstone",
-   imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80",
+   imageUrl: IMAGES.GEMSTONES.RUBY,
    name: "Ruby Stone",
    // ...
  }
];

const mockRudraksha = [
  {
    category: "Rudraksha",
-   imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343f?w=800",
+   imageUrl: IMAGES.RUDRAKSHA.FIVE_MUKHI,
    name: "5 Mukhi Rudraksha",
    // ...
  }
];

const mockYantras = [
  {
    category: "Yantra",
-   imageUrl: "https://images.unsplash.com/photo-1611228422550-f4289d546238?w=800",
+   imageUrl: IMAGES.YANTRAS.SHREE_YANTRA_BRASS,
    name: "Shree Yantra",
    // ...
  }
];
```

---

## 10. Create Placeholder SVG

### File: `public/static/placeholder.svg`

```xml
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#f5f5f5"/>
  <g>
    <circle cx="200" cy="150" r="40" fill="#d1d5db"/>
    <path d="M 160 220 L 240 220 L 220 280 L 180 280 Z" fill="#d1d5db"/>
  </g>
  <text 
    x="50%" 
    y="85%" 
    font-size="16" 
    fill="#999" 
    text-anchor="middle"
  >
    Image not available
  </text>
</svg>
```

---

## Summary of Changes

| Component | Old URL Type | New Approach | Lines Changed |
|-----------|--------------|--------------|---------------|
| Layout | Inline Unsplash | CSS utility class | 2 |
| Hero | Unsplash URL | IMAGE_MAP | 3 |
| CTA | Unsplash URL | IMAGE_MAP | 3 |
| Mobile App | Unsplash URL | IMAGE_MAP | 3 |
| Panchang | Unsplash URL | IMAGE_MAP | 3 |
| Seed Data | Unsplash URLs | Local paths | 10+ |
| Commerce API | Unsplash URLs | IMAGE_MAP | 6+ |
| **TOTAL** | **17+ URLs** | **Centralized** | **30+ lines** |

---

## Testing Commands

```bash
# Build and check for errors
yarn build

# Run linter
yarn lint

# Type check
yarn tsc --noEmit

# Start dev server
yarn dev

# Run Lighthouse (if available)
yarn lighthouse
```

---

**Total Implementation Time**: 2-3 hours  
**Files Modified**: 9 core files + 3 documentation files
