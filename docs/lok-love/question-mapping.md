# LOK & LOVE — Question → Field → Column Mapping

Required by PRD §11. This is the contract between the organisers' question
sheet, the website form, the API payload and the database. Keep it current:
a question that exists in one place and not the others fails silently.

Keep these five places in sync:

| Where | File |
|---|---|
| Website form questions | `lok-love/lok-love.js` → `LOK_LOVE_FORM_SCHEMA` |
| Request validation | POSGitew `packages/contracts/src/lok-love.schema.js` |
| Table columns | POSGitew `server/db/schema/49-…sql` through `52-lok-love-referred-by-staff.sql` |
| Row → JSON mapping | POSGitew `server/modules/lok-love/lok-love.mapper.ts` |
| This document | `docs/lok-love/question-mapping.md` |

A field's `id` in the schema is its JSON payload key. The request schema is
`.strict()`, so an unknown key is rejected rather than silently dropped —
change an `id` and you must change all of the above.

**One question is conditional.** `referredByStaff` (Q18b) carries
`showWhen: { field: 'hearAboutUs', equals: 'Lok Gitew' }`. A field whose
condition is unmet is not rendered, not validated, not shown on the review
screen and sends an empty answer — so a hidden follow-up can never block a
step it is not visible on.

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
| 2 | Usia | `age` | `age` | ✅ min 19 |
| 3 | Jenis kelamin | `gender` | `gender` | ✅ Pria \| Wanita |
| 4 | Siapa yang ingin kamu temui | `lookingToMeet` | `looking_to_meet` | ✅ Pria \| Wanita |
| 5 | Kota atau daerah | `city` | `city` | ✅ |
| 6 | Pekerjaan atau aktivitas | `occupation` | `occupation` | ✅ |
| 7 | Nomor WhatsApp | `whatsapp` | `whatsapp` | ✅ normalised to `+62…` |
| 8 | Drop your social — platform | `socialPlatform` | `social_platform` | ✅ Instagram \| TikTok |
| 8 | Drop your social — username | `socialHandle` | `social_handle` | ✅ stored without `@` |
| 8b | Alamat email | `email` | `email` | ✅ stored lower-cased |

> Q8b is not on the organisers' sheet. It was added back at their request
> (6 September 2026) as a second contact channel and a second duplicate key.

## Section 2 — Your Vibe

| # | Question | Payload key | Column | Required |
|---|---|---|---|---|
| 9 | Sedang lajang? | `relationshipStatus` | `relationship_status` | ✅ |
| 10 | Rentang usia — minimum | `preferredAgeMin` | `preferred_age_min` | ✅ min 19 |
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
| 18b | Siapa yang memberitahu kamu | `referredByStaff` | `referred_by_staff` | ⚠️ conditional |

> **Q18b only appears when Q18 is answered `Lok Gitew`**, so the team can
> tell which server brought a walk-in applicant in. It is required once
> shown and empty otherwise.
>
> The pairing is enforced in both places: the form hides the field and
> skips its validation (`showWhen` — see `isFieldVisible`), and the request
> schema carries a matching refinement, so the rule does not live only in
> the browser. Switching Q18 away from `Lok Gitew` clears any answer
> already typed, including from a saved draft.

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

Either contact detail identifies a repeat applicant: **`event_key` +
`whatsapp`**, or **`event_key` + `lower(email)`**. Both are enforced by
unique indexes and checked in the same transaction as the insert.

The email index is **partial** — `WHERE email IS NOT NULL AND email <> ''`.
Applications written while the form had no email question carry none, and
must not all read as duplicates of each other. The runtime check applies
the same condition.

A second submission from either matching detail returns
`{"status":"duplicate"}` with a 200, not an error — the applicant is told
they have already applied.

The `email` column is deliberately **nullable** even though the form now
requires an address. Requiring it is the request schema's job and applies
to submissions from here on; the column has to keep accommodating rows
written while there was no question to answer.

## Minimum age

**19**, everywhere. The sheet as first written gave 18 in the age question
and 21 in the final confirmation; the organisers settled it at 19
(6 September 2026).

One value drives all three places it appears — the age field's floor, the
Q22 confirmation text and the landing-page copy:

| Where | Constant |
|---|---|
| Request validation (**authority**) | `LOK_LOVE_MINIMUM_AGE` in `lok-love.schema.js` |
| Form field, Q22 text, landing copy | `LOK_LOVE_CONFIG.minimumAge` in `lok-love.js` |

The landing page's static `21` fallbacks were updated too, not just the
`data-ll` placeholders, so the page is correct before JS runs.

## Questions no longer asked

Dropped from the sheet, but their columns are **kept and made nullable** so
applications collected under the previous version stay readable. Nothing
writes them, and the admin dashboard shows them only for rows that have
them, under "Formulir versi sebelumnya".

`personality` · `interests` · `weekend_vibe` · `intention` ·
`preferred_age_range` · `deal_breakers` · `dietary_notes` ·
`additional_info`

`email` was briefly in this list — migration 50 dropped the question, and
migration 51 brought it back as Q8b. It is a current answer again.

## Photo upload

Still deliberately not carried over. Accepting applicant photographs
through a public endpoint means storing biometric-adjacent personal data
with no retention policy, no moderation path and no deletion flow. The
social handle in Q8 serves the same selection purpose.
