# LOK & LOVE — Question → Field → Column Mapping

Required by PRD §11. This is the contract between the organisers' question
sheet, the website form, the API payload and the database. Keep it current:
a question that exists in one place and not the others fails silently.

Keep these five places in sync:

| Where | File |
|---|---|
| Website form questions | `lok-love/lok-love.js` → `LOK_LOVE_FORM_SCHEMA` |
| Request validation | POSGitew `packages/contracts/src/lok-love.schema.js` |
| Table columns | POSGitew `server/db/schema/49-…sql` + `50-lok-love-v2-questions.sql` |
| Row → JSON mapping | POSGitew `server/modules/lok-love/lok-love.mapper.ts` |
| This document | `docs/lok-love/question-mapping.md` |

A field's `id` in the schema is its JSON payload key. The request schema is
`.strict()`, so an unknown key is rejected rather than silently dropped —
change an `id` and you must change all of the above.

**Two questions carry two answers each** and use a composite field type.
Their sub-keys, not the field `id`, are what reach the payload:

| Field `id` | Type | Payload keys |
|---|---|---|
| `social` | `social` | `socialPlatform`, `socialHandle` |
| `preferredAge` | `agerange` | `preferredAgeMin`, `preferredAgeMax` |

---

## Section 1 — Tentang Kamu

| # | Question | Payload key | Column | Required |
|---|---|---|---|---|
| 1 | Nama lengkap | `name` | `name` | ✅ |
| 2 | Usia | `age` | `age` | ✅ min 18 |
| 3 | Jenis kelamin | `gender` | `gender` | ✅ Pria \| Wanita |
| 4 | Siapa yang ingin kamu temui | `lookingToMeet` | `looking_to_meet` | ✅ Pria \| Wanita |
| 5 | Kota atau daerah | `city` | `city` | ✅ |
| 6 | Pekerjaan atau aktivitas | `occupation` | `occupation` | ✅ |
| 7 | Nomor WhatsApp | `whatsapp` | `whatsapp` | ✅ normalised to `+62…` |
| 8 | Drop your social — platform | `socialPlatform` | `social_platform` | ✅ Instagram \| TikTok |
| 8 | Drop your social — username | `socialHandle` | `social_handle` | ✅ stored without `@` |

## Section 2 — Your Vibe

| # | Question | Payload key | Column | Required |
|---|---|---|---|---|
| 9 | Sedang lajang? | `relationshipStatus` | `relationship_status` | ✅ |
| 10 | Rentang usia — minimum | `preferredAgeMin` | `preferred_age_min` | ✅ |
| 10 | Rentang usia — maksimum | `preferredAgeMax` | `preferred_age_max` | ✅ must be ≥ min |
| 11 | Fleksibilitas rentang usia | `ageFlexibility` | `age_flexibility` | ✅ |
| 12 | Ceritakan tentang dirimu | `selfDescription` | `self_description` | ✅ ≤ 600 |
| 13 | Gaya bersosialisasi | `socialStyle` | `social_style` | ✅ |
| 14 | Yang dicari dari seseorang | `valuedQualities` | `valued_qualities` | ✅ max 3, comma-joined |

## Section 3 — The Night

| # | Question | Payload key | Column | Required |
|---|---|---|---|---|
| 15 | Bisa ikut 19.00 – selesai | `availability` | `availability` | ✅ |
| 16 | Alergi / pantangan | `dietary` | `dietary` | ✅ free text |
| 17 | Bersedia difoto / direkam | `photoConsent` | `photo_consent` | ✅ |
| 18 | Tahu 6×6 dari mana | `hearAboutUs` | `hear_about_us` | ✅ |

## Section 4 — Final Check

Every clause is stored individually. "Which terms did this applicant agree
to, and when" has to be answerable from the row alone, so these are not
collapsed into one boolean. All are `z.literal(true)`: a submission missing
any single clause is rejected.

| # | Clause | Payload key | Column |
|---|---|---|---|
| 19 | Pembayaran & pembatalan | `consentPayment` | `consent_payment` |
| 20 | Privasi | `consentPrivacy` | `consent_privacy_v2` |
| 21 | Perilaku — sopan & menghormati | `conductRespect` | `conduct_respect` |
| 21 | Perilaku — tanpa pelecehan | `conductHarassment` | `conduct_harassment` |
| 21 | Perilaku — hormati penolakan | `conductRejection` | `conduct_rejection` |
| 21 | Perilaku — tanpa foto peserta lain | `conductPhotos` | `conduct_photos` |
| 21 | Perilaku — penyelenggara boleh mengeluarkan | `conductRemoval` | `conduct_removal` |
| 22 | Konfirmasi akhir | `consentFinal` | `consent_final` |
| 23 | Persetujuan elektronik (nama) | `signature` | `signature` |
| — | Waktu persetujuan | *(server)* | `consented_at` |

> `consent_privacy_v2` carries a suffix because the previous sheet already
> had a `consent_privacy` column with different wording behind it. Reusing
> the name would have made two different agreements indistinguishable.

---

## Duplicate detection

Keyed on **`event_key` + `whatsapp`** only, enforced by the unique index
`idx_lok_love_event_whatsapp` and checked in the same transaction as the
insert. WhatsApp is the only contact identity the current sheet collects.

A second submission from the same number returns `{"status":"duplicate"}`
with a 200, not an error — the applicant is told they have already applied.

## The age discrepancy

The question sheet gives two different minimum ages, and both are
implemented as written:

- **Q2** says *minimal 18 tahun* → the age field and the request schema
  enforce 18 (`LOK_LOVE_MINIMUM_AGE`, `LOK_LOVE_CONFIG.formMinimumAge`).
- **Q22** says *berusia minimal 21 tahun* → reproduced verbatim in the
  confirmation checkbox, which is an attestation, not a validated value.
- The landing page still advertises 21 (`LOK_LOVE_CONFIG.minimumAge`).

So a 19-year-old can complete the form but cannot truthfully tick Q22.
**This needs an organiser decision**; align all three once it is made.

## Questions no longer asked

Dropped from the sheet, but their columns are **kept and made nullable** so
applications collected under the previous version stay readable. Nothing
writes them, and the admin dashboard shows them only for rows that have
them, under "Formulir versi sebelumnya".

`email` · `personality` · `interests` · `weekend_vibe` · `intention` ·
`preferred_age_range` · `deal_breakers` · `dietary_notes` ·
`additional_info`

`email` is the significant one: the form no longer collects an email
address at all, so it is no longer part of duplicate detection and
`NOT NULL` was dropped from the column.

## Photo upload

Still deliberately not carried over. Accepting applicant photographs
through a public endpoint means storing biometric-adjacent personal data
with no retention policy, no moderation path and no deletion flow. The
social handle in Q8 serves the same selection purpose.
