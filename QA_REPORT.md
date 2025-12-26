COMPREHENSIVE QA REPORT - Profile Page Data Persistence Testing
✅ FORM SUBMISSION - SUCCESS
The form submitted successfully and redirected to the Dashboard page, confirming the backend received and processed the data.
📊 DATA PERSISTENCE ANALYSIS
WHAT WAS ENTERED IN THE FORM:

text

✓ Full Name: "QA Test" ✓ Date of Birth: "01/12/2025" (01 December 2025) ✓ Time of Birth: "02:02 AM" ✓ Birth Place: "Mumbai, India" (Coordinates: 19.8768°, 72.8777°) ✓ Astrology System: "Western" (Selected with orange border)
🔍 VERIFIED DATA ON PROFILE PAGE:
FieldInput ValueProfile ShowsStatusFull NameQA TestQA Test✅ SAVEDDate of Birth01/12/2025December 1, 2025✅ SAVEDBirth Time02:02 AMNot set❌ NOT SAVEDBirth PlaceMumbai, IndiaMumbai, India✅ SAVEDAstrology SystemWestern⭐ Western✅ SAVED
🚨 CRITICAL ISSUES FOUND:
ISSUE #1: BIRTH TIME NOT PERSISTING ❌

- Severity: HIGH

- Problem: Birth Time field shows "Not set" on the profile view despite entering "02:02 AM" during profile creation

- Impact: Astrological calculations may be incomplete since accurate birth time is crucial for chart calculations

- Evidence:
  - Entered: "02:02 AM" ✓ (confirmed on form)

  - Saved Display: "Not set" ✗

  - Edit Form: "--:-- --" (empty on reload)

ISSUE #2: DATA NOT REPOPULATING IN EDIT FORM ❌

- Severity: HIGH

- Problem: When clicking "Edit Profile", the form fields show empty/default values instead of pre-filled saved data

- What we see on Edit form:
  - Full Name: Empty (placeholder "Enter your full name")

  - Date of Birth: Empty (placeholder "dd/mm/yyyy")

  - Time of Birth: Empty (placeholder "--:-- --")

  - Birth Place: Shows "Delhi, India" instead of saved "Mumbai, India"

  - Astrology System: Shows "Vedic Selected" instead of saved "Western"

- Impact: Users cannot easily verify or modify their profile information without manually re-entering everything

- UX Impact: Confusing user experience - data appears different on view vs. edit screens

ISSUE #3: BIRTH PLACE MISMATCH IN EDIT FORM ❌

- Severity: MEDIUM

- Problem: Edit form shows "Delhi, India" (28.6139°, 77.2090°) but profile view shows "Mumbai, India" (correct)

- Root Cause: Edit form is not properly loading the saved birth place data

- Coordinates mismatch:
  - What we saved: Mumbai (19.8768°, 72.8777°)

  - Edit form shows: Delhi (28.6139°, 77.2090°)

ISSUE #4: ASTROLOGY SYSTEM SELECTION REVERSED IN EDIT FORM ❌

- Severity: MEDIUM

- Problem: When editing, the opposite astrology system appears selected
  - Profile view correctly shows: "⭐ Western"

  - Edit form shows: "Vedic ✓ Selected" (wrong!)

- Impact: If user saves from edit form, the selection might toggle to the wrong value

📝 COMPARISON TABLE - Expected vs Actual:
Profile View (Display) - MOSTLY CORRECT ✅

text

✅ Full Name: QA Test ✅ Email: roopeshsingh993@gmail.com ✅ Date of Birth: December 1, 2025 ❌ Birth Time: "Not set" (should be "02:02 AM") ✅ Birth Place: Mumbai, India ✅ Astrology System: Western
Edit Form (Pre-fill) - SIGNIFICANTLY BROKEN ❌

text

❌ Full Name: Empty (should be "QA Test") ❌ Date of Birth: Empty (should be "01/12/2025") ❌ Time of Birth: Empty (should be "02:02 AM") ❌ Birth Place: "Delhi, India" (should be "Mumbai, India") ❌ Astrology System: "Vedic Selected" (should be "Western")
🔧 ROOT CAUSE ANALYSIS:
Likely Causes:

1. Birth Time Storage Issue:
   - Time value may not be persisting to the database

   - OR Backend is processing it but frontend display logic has condition to show "Not set"

   - Check database schema - time field might be nullable and not receiving the value

2. Edit Form Data Binding Issue:
   - Edit form is not properly fetching/hydrating with user's saved profile data

   - Form is showing either:
     - Fresh/reset form state with defaults

     - OR User's very first profile creation data (Delhi was probably the onboarding default)

3. Astrology System Reversal:
   - Boolean/enum value might be flipped (0/1, true/false) on read vs write

   - OR form is reading from wrong field/variable

4. Inconsistent State Management:
   - Profile view and Edit form might be loading from different data sources

   - Profile view may be showing calculated/formatted data

   - Edit form may be showing raw database values (and failing to load them correctly)

⚠️ USER-FACING PROBLEMS:

1. Cannot verify saved data - Users can't check what was saved without checking the public profile view

2. Cannot easily update profile - Need to re-enter all data from scratch as form doesn't pre-fill

3. Birth time calculations may fail - Horoscope features requiring birth time might not work properly

4. Astrological calculations may use wrong location - If edit form's Delhi location is ever saved, it will override the correct Mumbai location

5. Potential data loss - If users click "Complete Setup" again from the edit form with wrong data, it could overwrite correct data with defaults

🎯 RECOMMENDATIONS:
PRIORITY 1 - CRITICAL (Do First):

1. Fix Birth Time persistence - Debug why time value isn't saving to database or displaying on profile view

2. Fix Edit Form data hydration - Ensure form properly fetches and displays current saved user profile data on page load

PRIORITY 2 - HIGH:

3. Fix data consistency - Ensure profile view and edit form always show the same source data

4. Verify Astrology System storage - Check if boolean/enum is being flipped on read

PRIORITY 3 - MEDIUM:

5. Add data validation feedback - Show loading states and error messages if data fetch fails on edit form

6. Add confirmation before discarding changes - If user navigates away from edit form without saving

📌 SUMMARY FOR USER:
The good news: Your profile data mostly saves to the database. The name, date, location, and astrology system preference are stored.
The bad news:

- Your birth time (02:02 AM) didn't save - it shows "Not set"

- When you go to edit your profile, the form shows empty fields instead of your saved data

- There seem to be some data sync issues between what's saved and what's displayed in the edit form

The urgent issue: Birth time is critical for astrology calculations, so this needs to be fixed before features relying on it will work correctly.
Recommendation: Inform your development team about these data persistence issues - they likely need to debug the backend API responses and frontend form data binding logic.
Jyotishya | Your Cosmic Companion
