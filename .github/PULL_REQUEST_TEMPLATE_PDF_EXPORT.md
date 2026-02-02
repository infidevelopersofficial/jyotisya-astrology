# Phase-1 + Phase-2 PDF Export

## Summary

Client-side PDF export for birth charts using html2canvas + jsPDF. Adds Chart-only (quick) and Full Report export options with feature flag, error handling, and mobile-safe quality scaling.

## Changes

### Phase-1 (Approved)
- **lib/pdf** – `exportChartAsPdf`, `exportReportAsPdf`, types, feature flag
- **PDFExportButton** – Dropdown: Chart only | Full report
- **BirthChartGeneratorV2** – Integration with chart + report handlers
- **Backward compat** – `lib/reports/generatePdf` delegates to new service (TransitView, MatchingPanel unchanged)
- **Tests** – Error paths for element not found, no pages, page limit

### Phase-2 (Non-breaking)
- **MAX_PDF_PAGES** – Reject reports > 50 pages (memory safety)
- **Memory-aware scaling** – Desktop scale 2; iOS scale 1; other mobile scale 2 if deviceMemory ≥ 4GB
- **Follow-ups** – try/catch + toast for chart PDF; landscape header centering; `isPdfExportEnabled()` in UI

## Non-Breaking Verification

| Area | Status |
|------|--------|
| TransitView PDF | ✅ Uses `generatePdf` (unchanged API) |
| MatchingPanel PDF | ✅ Uses `generatePdf` (unchanged API) |
| BirthChartDisplay fallback | ✅ Single PDF button when `onDownloadChartPDF` not provided |
| Desktop behavior | ✅ Scale 2, same as before |
| Feature flag | ✅ `NEXT_PUBLIC_PDF_EXPORT_ENABLED=false` to disable |

## Testing

- `npm run test -- __tests__/lib/pdf.test.ts __tests__/api/` – ✅ 33 passed
- `npm run type-check` – ✅
- `npm run build` – ✅

## Deployment

- Feature enabled by default
- Kill switch: set `NEXT_PUBLIC_PDF_EXPORT_ENABLED=false` to disable
- Monitor error rates post-deploy

## Commits

1. `feat(pdf): Phase-1 client-side PDF export (html2canvas + jsPDF)`
2. `fix(pdf): Non-blocking follow-ups from Phase-1 review`
3. `feat(pdf): Phase-2 - enforce MAX_PDF_PAGES limit`
4. `feat(pdf): Phase-2 - memory-aware quality scaling for mobile`
