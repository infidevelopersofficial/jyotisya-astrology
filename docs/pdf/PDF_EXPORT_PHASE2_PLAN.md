# Phase-2 PDF Export Implementation Plan

**Branch:** `feature/pdf-export-phase2`  
**Base:** Phase-1 (feature/pdf-export-phase1)  
**Goal:** Production safety and mobile optimization

---

## Phase-2 Scope

### ✅ Implemented (Starter)
- [x] Enforce `MAX_PDF_PAGES` (50) in `exportReportAsPdf`
- [x] Unit test for page limit

### 🔜 Planned
- [ ] Memory-aware quality scaling (deviceMemory API)
- [ ] Canvas size limit enforcement (MAX_CANVAS_SIZE_BYTES)
- [ ] Mobile-specific html2canvas options (Safari workarounds)
- [ ] Advanced options UI (page size, quality) - optional

### Deferred to Phase-3
- Server-side PDF generation
- Custom font embedding
- PDF/A compliance

---

## Branch Strategy

- **feature/pdf-export-phase1** → Merge to main first (Phase-1 + follow-ups)
- **feature/pdf-export-phase2** → Merge after Phase-1 is stable

Phase-2 changes are additive and do not modify Phase-1 behavior.
