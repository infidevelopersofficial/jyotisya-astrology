#!/bin/bash
# setup-static-assets.sh
# Creates the static asset directory structure for the Jyotishya platform

set -e

echo "🎨 Setting up static asset directories..."

# Create directory structure
mkdir -p public/static/{backgrounds,gemstones,rudraksha,yantras,puja,books}

echo "✅ Created directory structure:"
echo "   public/static/"
echo "   ├── backgrounds/      (5 background images)"
echo "   ├── gemstones/        (4 gemstone product images)"
echo "   ├── rudraksha/        (4 rudraksha product images)"
echo "   ├── yantras/          (3 yantra product images)"
echo "   ├── puja/             (3 puja kit product images)"
echo "   └── books/            (2 book product images)"

echo ""
echo "📝 Next steps:"
echo "1. Download images from Unsplash and convert to WebP:"
echo "   - Use online converter: https://cloudconvert.com or squoosh.app"
echo "   - Or use ImageMagick: convert image.jpg -quality 80 image.webp"
echo ""
echo "2. Place images in appropriate directories:"
echo "   - Backgrounds → public/static/backgrounds/"
echo "   - Products → public/static/{gemstones,rudraksha,yantras,puja,books}/"
echo ""
echo "3. Update image references in code:"
echo "   - app/layout.tsx - CSS background"
echo "   - components/sections/*.tsx - Image component src"
echo "   - packages/schemas/prisma/seed.ts - Product imageUrls"
echo ""
echo "4. Create placeholder.svg in public/static/"
echo ""
echo "✅ Setup complete!"
