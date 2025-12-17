/**
 * Image Asset Map
 * Central registry for all static image assets used in the Jyotishya platform.
 * 
 * Usage:
 * import { IMAGES } from '@/lib/images/IMAGE_MAP'
 * <Image src={IMAGES.BACKGROUNDS.COSMIC_TEXTURE} alt="..." />
 */

export const IMAGES = {
  BACKGROUNDS: {
    /** Fixed cosmic texture overlay for main layout */
    COSMIC_TEXTURE: '/static/backgrounds/cosmic-texture.webp',
    /** Hero section astrology background */
    ASTROLOGY_HERO: '/static/backgrounds/astrology-hero.webp',
    /** Consultation CTA section background */
    CONSULTATION_CTA: '/static/backgrounds/consultation-cta.webp',
    /** Mobile app showcase section background */
    MOBILE_APP_SHOWCASE: '/static/backgrounds/mobile-app-showcase.webp',
    /** Panchang highlights section background */
    PANCHANG_HIGHLIGHTS: '/static/backgrounds/panchang-highlights.webp',
  },

  GEMSTONES: {
    /** Emerald gemstone product image */
    EMERALD: '/static/gemstones/emerald.webp',
    /** Ruby gemstone product image */
    RUBY: '/static/gemstones/ruby.webp',
    /** Blue sapphire gemstone product image */
    BLUE_SAPPHIRE: '/static/gemstones/blue-sapphire.webp',
    /** Yellow sapphire gemstone product image */
    YELLOW_SAPPHIRE: '/static/gemstones/yellow-sapphire.webp',
  },

  RUDRAKSHA: {
    /** 5 Mukhi rudraksha product image */
    FIVE_MUKHI: '/static/rudraksha/rudraksha-5-mukhi.webp',
    /** 7 Mukhi rudraksha product image */
    SEVEN_MUKHI: '/static/rudraksha/rudraksha-7-mukhi.webp',
    /** 9 Mukhi rudraksha product image */
    NINE_MUKHI: '/static/rudraksha/rudraksha-9-mukhi.webp',
    /** 11 Mukhi rudraksha product image */
    ELEVEN_MUKHI: '/static/rudraksha/rudraksha-11-mukhi.webp',
  },

  YANTRAS: {
    /** Shree Yantra in brass finish */
    SHREE_YANTRA_BRASS: '/static/yantras/shree-yantra-brass.webp',
    /** Shree Yantra in copper finish */
    SHREE_YANTRA_COPPER: '/static/yantras/shree-yantra-copper.webp',
    /** Ganesha Yantra for prosperity */
    GANESHA_YANTRA: '/static/yantras/ganesha-yantra.webp',
  },

  PUJA: {
    /** Ganesh puja kit complete set */
    GANESH_PUJA_KIT: '/static/puja/ganesh-puja-kit.webp',
    /** Lakshmi puja kit for prosperity rituals */
    LAKSHMI_PUJA_KIT: '/static/puja/lakshmi-puja-kit.webp',
    /** Diwali puja essentials kit */
    DIWALI_PUJA_KIT: '/static/puja/diwali-puja-kit.webp',
  },

  BOOKS: {
    /** Vedic Astrology beginner's guide */
    VEDIC_ASTROLOGY_GUIDE: '/static/books/vedic-astrology-guide.webp',
    /** Kundli interpretation and analysis handbook */
    KUNDLI_INTERPRETATION: '/static/books/kundli-interpretation.webp',
  },

  /** Fallback/placeholder image for missing assets */
  PLACEHOLDER: '/static/placeholder.svg',
} as const;

/**
 * Image optimization defaults
 */
export const IMAGE_CONFIG = {
  quality: 80, // Next.js Image default is 75
  formats: ['image/webp', 'image/avif'],
  sizes: {
    thumbnail: '(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw',
    card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    full: '100vw',
    hero: '(max-width: 768px) 90vw, (max-width: 1200px) 70vw, 1000px',
  },
  placeholderBlur:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1ZjVmNSIvPjwvc3ZnPg==',
} as const;

/**
 * Get image URL with optional fallback
 * @param imagePath - Path from IMAGES map
 * @param fallback - Fallback URL if primary fails
 * @returns Image URL string
 */
export function getImageUrl(
  imagePath: string,
  fallback: string = IMAGES.PLACEHOLDER
): string {
  return imagePath || fallback;
}
