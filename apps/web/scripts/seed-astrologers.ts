/**
 * Seed Astrologers Script
 *
 * Populates the database with sample astrologers for testing
 * the consultation booking and payment flow.
 *
 * Usage:
 *   npx tsx scripts/seed-astrologers.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SAMPLE_ASTROLOGERS = [
  {
    name: 'Dr. Rajesh Sharma',
    specialization: ['Vedic Astrology', 'Kundli Reading', 'Marriage Compatibility'],
    languages: ['Hindi', 'English'],
    experience: 15,
    rating: 4.8,
    totalReviews: 234,
    hourlyRate: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Expert in Vedic astrology with 15+ years of experience. Specialized in career guidance, marriage compatibility, and remedial measures.',
    verified: true,
    available: true,
  },
  {
    name: 'Pandit Arun Kumar',
    specialization: ['KP Astrology', 'Prashna', 'Business Astrology'],
    languages: ['Hindi', 'Tamil', 'English'],
    experience: 22,
    rating: 4.9,
    totalReviews: 456,
    hourlyRate: 1800,
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    bio: 'Senior KP astrologer specializing in business decisions, career planning, and timing of events. Known for accurate predictions.',
    verified: true,
    available: true,
  },
  {
    name: 'Dr. Meera Iyer',
    specialization: ['Vedic Astrology', 'Numerology', 'Gemstones'],
    languages: ['English', 'Tamil', 'Telugu'],
    experience: 18,
    rating: 4.7,
    totalReviews: 189,
    hourlyRate: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'Doctorate in Vedic astrology. Expertise in numerology, gemstone consultation, and women-specific astrological guidance.',
    verified: true,
    available: true,
  },
  {
    name: 'Guru Anand Mishra',
    specialization: ['Nadi Astrology', 'Prashna', 'Spiritual Guidance'],
    languages: ['Hindi', 'Sanskrit', 'English'],
    experience: 25,
    rating: 4.9,
    totalReviews: 567,
    hourlyRate: 2400,
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Traditional Nadi astrologer from Varanasi. Offers deep spiritual insights and guidance for life decisions.',
    verified: true,
    available: false, // Not available for testing filters
  },
  {
    name: 'Aacharya Priya Singh',
    specialization: ['Vastu Shastra', 'Vedic Astrology', 'Feng Shui'],
    languages: ['Hindi', 'English', 'Gujarati'],
    experience: 12,
    rating: 4.6,
    totalReviews: 145,
    hourlyRate: 900,
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    bio: 'Vastu and astrology expert helping clients harmonize their living spaces with cosmic energies.',
    verified: true,
    available: true,
  },
  {
    name: 'Tarot Master Kavita',
    specialization: ['Tarot Reading', 'Angel Cards', 'Love & Relationships'],
    languages: ['English', 'Hindi'],
    experience: 8,
    rating: 4.8,
    totalReviews: 298,
    hourlyRate: 600,
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'Intuitive tarot reader specializing in relationship guidance, career clarity, and spiritual growth.',
    verified: true,
    available: true,
  },
]

async function seedAstrologers() {
  console.log('🌟 Starting astrologer seeding...\n')

  try {
    // Clear existing astrologers (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing astrologers...')
    await prisma.astrologer.deleteMany()

    // Create astrologers
    console.log('📝 Creating sample astrologers...\n')

    for (const astrologerData of SAMPLE_ASTROLOGERS) {
      const astrologer = await prisma.astrologer.create({
        data: astrologerData,
      })

      console.log(`✅ Created: ${astrologer.name}`)
      console.log(`   - Rate: ₹${astrologer.hourlyRate}/hour`)
      console.log(`   - Available: ${astrologer.available ? 'Yes' : 'No'}`)
      console.log(`   - Specialties: ${astrologer.specialization.join(', ')}`)
      console.log('')
    }

    console.log(`\n✨ Successfully seeded ${SAMPLE_ASTROLOGERS.length} astrologers!`)
    console.log('\n📊 Summary:')
    console.log(`   - Available: ${SAMPLE_ASTROLOGERS.filter(a => a.available).length}`)
    console.log(`   - Busy: ${SAMPLE_ASTROLOGERS.filter(a => !a.available).length}`)
    console.log(`   - Verified: ${SAMPLE_ASTROLOGERS.filter(a => a.verified).length}`)

    console.log('\n🚀 You can now test the consultation booking flow!')
    console.log('   Visit: http://localhost:3000/consultations')

  } catch (error) {
    console.error('❌ Error seeding astrologers:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedAstrologers()
  .then(() => {
    console.log('\n✅ Seeding completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  })
