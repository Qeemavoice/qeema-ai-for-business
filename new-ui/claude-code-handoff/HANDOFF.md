# HANDOFF — Admin dashboard overhaul (continue in Claude Code)

Project: Qeema AI for Business / قيمة فويس. User (Nour) writes Arabic; UI must be Arabic RTL.
The WIP source files are in `claude-code-handoff/wip/` (same relative paths as the repo). NOT yet applied to live source, NOT type-checked. Copy them over, run `npm run lint` (tsc), fix errors.

## User request (15:23, Tue 2026-10-27) — "افحص الداش"
1. Delete "طلبات إلغاء الحجوزات" page.
2. Customers ("العملاء") + narrators ("المعلقين") pages: everything needed to follow accounts, incl. previewing narrator samples; build the best possible customers page.
3. Remove text "سجل تدقيق ملزم: تحديد الأسعار أو تغييرها محصور بفريق إدارة قيمة فويس فقط…" (was in old AdminNarratorsSubView).
4. Pricing: each narrator has own price; price shown next to a clip in the human voice library = FINAL platform price (narrator price + 30% platform commission). Assumption: final = narrator × 1.30.
5. Narrators page: remove "مراجعة العينات الصوتية" (lives in Samples page).
6. Samples page: samples > 40s or non-MP3 are auto-rejected + notification to narrator account with reason; admin reject picks reasons from a list (blog https://qeemavoice.com/ar/blogs/details/7 is robots-disallowed, reasons built from known rules).
7. All dates/numbers in dashboard English digits + Gregorian (no Hijri / Arabic-Indic).
8. Excel export on all data pages: customers, narrators, samples, bookings, newsletter, messages, articles, guides, voices.
9. Articles: Add/Edit opens a FULL page editor (sections: عام [عنوان، وصف قصير], المحتوى (rich editor), الصورة الخارجية/الداخلية upload, الحالة, رابط الفيديو, الوسم الوصفي [الكلمات الدلالية، الوصف], حفظ/إلغاء, breadcrumb "المقالات › اضافة مقال"). Table gets columns المجال (dropdown, many options) and الجمهور (معلق/عميل).

## Done (in live repo already)
AIVoicesSection / VoiceLibraryView changes (earlier tasks).

## Done in WIP folder (not yet in repo)
- shared/pricing.ts, shared/sampleRules.ts, shared/articleOptions.ts
- src/lib/format.ts, src/lib/exportExcel.ts (dependency-free xlsx; tested)
- src/types.ts, src/services/narratorService.ts (auto-review, notifications, rejection codes, pricing setters; storage key qeema_voice_samples_v4)
- src/components/admin/adminUi.tsx, AdminNarratorsView.tsx, AdminSamplesView.tsx, AdminNarratorsSubView.tsx (thin wrapper)
- adminNav.ts (cancellations removed), collectionsConfig.ts (cancellations removed; articles got category/audience columns with `options`, `editor:'article'`, canExport), server/db/collections.ts (cancellations removed; article seeds have category/audience/etc.)

## TODO
- AdminCollectionView: use `exportToExcel` for all collections (canExport on all), inline <select> for columns with `options`, full-page `AdminArticleEditor.tsx` when `cfg.editor==='article'` (contentEditable rich text toolbar, image upload previews).
- Customers: server routes (`GET /customers`, `/customers/:id`, `POST status`, `POST notes`) + store meta + seed extra companies; `AdminCustomersView.tsx` (KPIs, filters, table, drawer: overview/bookings/credits/members/notes, grant credits, change plan, suspend, Excel); wire into AdminView `companies` tab.
- Commission 30%: server/db/store.ts (`platformCommissionPercent: 30`, booking seeds), server/types.ts, AdminView.tsx texts (75%/25% → new wording), default settings line ~139.
- VoiceLibraryView: add narratorPriceUsd per HUMAN_VOICE_SAMPLES, `pricing = $final / دقيقة` (keep BookHumanVoiceModal regex `$(\d+(\.\d+)?)` working).
- Dates/numbers: replace toLocaleString()/'ar-SA' in AdminView.tsx & admin components with fmtNum/fmtDate/fmtDateTime/fmtTime.
- Excel buttons in AdminView bookings + voices tabs.
- Wire AdminView.tsx: remove cancellations refs; `AdminNarratorsSubView` already takes view prop.
- Talent dashboard (VoiceTalentDashboardView.tsx): pass real format/duration/size to addVoiceSample, real notifications bell (narratorService.getNotifications/markNotificationsRead), narrator's own price instead of "$80 / دقيقة".
- Finish: `npm run lint`, restart `npm run dev`, final Arabic report to user.
