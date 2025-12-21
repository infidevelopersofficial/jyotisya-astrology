/**
 * Quick Test Script for Timezone Utility
 * Run: npx tsx apps/web/lib/utils/__test-timezone.ts
 */

import { formatBirthTime } from './timezone'

console.log('🧪 Testing Timezone Conversion Fix\n')
console.log('=' .repeat(50))

// Test Case 1: UTC timestamp without date (YOUR ISSUE)
console.log('\n📝 Test Case 1: UTC timestamp "19:40:00.000Z"')
console.log('Input: "19:40:00.000Z"')
console.log('Expected: "01:10 AM" (IST)')
const result1 = formatBirthTime('19:40:00.000Z', '2025-12-01')
console.log('Result:', result1)
console.log('Status:', result1 === '01:10 AM' ? '✅ PASS' : '❌ FAIL')

// Test Case 2: HH:MM format
console.log('\n📝 Test Case 2: HH:MM format "01:10"')
console.log('Input: "01:10"')
console.log('Expected: "01:10 AM"')
const result2 = formatBirthTime('01:10')
console.log('Result:', result2)
console.log('Status:', result2 === '01:10 AM' ? '✅ PASS' : '❌ FAIL')

// Test Case 3: Complete ISO string
console.log('\n📝 Test Case 3: Complete ISO "2025-12-01T19:40:00.000Z"')
console.log('Input: "2025-12-01T19:40:00.000Z"')
console.log('Expected: "01:10 AM" (IST)')
const result3 = formatBirthTime('2025-12-01T19:40:00.000Z')
console.log('Result:', result3)
console.log('Status:', result3 === '01:10 AM' ? '✅ PASS' : '❌ FAIL')

// Test Case 4: Null input
console.log('\n📝 Test Case 4: Null input')
console.log('Input: null')
console.log('Expected: null')
const result4 = formatBirthTime(null)
console.log('Result:', result4)
console.log('Status:', result4 === null ? '✅ PASS' : '❌ FAIL')

// Test Case 5: PM time
console.log('\n📝 Test Case 5: PM time "13:30"')
console.log('Input: "13:30"')
console.log('Expected: "01:30 PM"')
const result5 = formatBirthTime('13:30')
console.log('Result:', result5)
console.log('Status:', result5 === '01:30 PM' ? '✅ PASS' : '❌ FAIL')

// Test Case 6: UTC timestamp with milliseconds
console.log('\n📝 Test Case 6: UTC "19:40:00.123Z" with birthDate')
console.log('Input: "19:40:00.123Z" + birthDate: "2025-12-01"')
console.log('Expected: "01:10 AM" (IST)')
const result6 = formatBirthTime('19:40:00.123Z', '2025-12-01')
console.log('Result:', result6)
console.log('Status:', result6 === '01:10 AM' ? '✅ PASS' : '❌ FAIL')

console.log('\n' + '='.repeat(50))
console.log('🎯 All tests completed!\n')
