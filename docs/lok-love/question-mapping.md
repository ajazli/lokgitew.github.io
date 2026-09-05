# LOK & LOVE — Question → Field → Sheet Column Mapping

Required by PRD §11. This is the contract between the original Google Form,
the website form, the API payload and the Google Sheet. **No existing Google
Form question may be dropped**, so any question added to the Google Form must
be added here too.

Keep these four places in sync:

| Where | File |
|---|---|
| Website form questions | `lok-love/lok-love.js` → `LOK_LOVE_FORM_SCHEMA` |
| Sheet column order | `docs/lok-love/apps-script/Code.gs` → `COLUMNS` |
| Server validation | `docs/lok-love/apps-script/Code.gs` → `validate()` |
| This document | `docs/lok-love/question-mapping.md` |

A field's `id` in the schema is simultaneously its JSON payload key and its
lookup key in `COLUMNS`. Change an `id` and you must change all four.

---

## Status of this mapping

| | |
|---|---|
| **Step 1** | Transcribed **verbatim** from Google Form page 1 — 9 questions |
| **Steps 2–4** | **Designed for this form.** The Google Form had taken zero responses, so the organisers cleared us (5 September 2026) to write these from scratch rather than mirror the old pages |
| **Confirmation** | Consents derived from the Google Form's "Informasi Penting" notice |
| **Photo upload** | **Deliberately not carried over** — see [Photo upload](#photo-upload) |

Because there were no responses to preserve, Steps 2–4 were written against
the PRD's groupings (§10) and the selection criteria the event itself
publishes: *"usia, kepribadian, minat, preferensi pasangan, dan penampilan
secara keseluruhan."* Every question earns its place by feeding one of those.

Question wording is Indonesian — the applicants' language, as in the original
form — with a smaller English gloss shown underneath as a reading aid. The
gloss is presentational and is not stored.

Per PRD §12, controlled options are used wherever they beat free text. Only
three fields are free text, and two of those are optional.

## Step 1 — About You

All nine questions below are transcribed **verbatim** from Google Form page 1,
in their original order and original Indonesian wording. Meaning must not
change without organiser approval (PRD §11).

| # | Existing Google Form question | Website field | Type | Required | Google Sheet column |
|---|---|---|---|---|---|
| 1 | Nama lengkap | `name` | Text | Yes | `Name` |
| 2 | Usia | `age` | Number (min 21, max 99) | Yes | `Age` |
| 3 | Jenis kelamin | `gender` | Radio — Pria / Wanita | Yes | `Gender` |
| 4 | Siapa yang ingin kamu temui dalam acara ini? | `lookingToMeet` | Radio — Pria / Wanita | Yes | `Looking To Meet` |
| 5 | Kota atau daerah tempat tinggal saat ini | `city` | Text | Yes | `City` |
| 6 | Pekerjaan atau aktivitas saat ini | `occupation` | Text | Yes | `Occupation` |
| 7 | Nomor WhatsApp | `whatsapp` | Tel (normalised to `+62…`) | Yes | `WhatsApp` |
| 8 | Username Instagram/TikTok | `socialHandle` | Text | Yes | `Instagram/TikTok` |
| 9 | Alamat email | `email` | Email | Yes | `Email` |

### Notes on Step 1

- **Question order is unchanged** from the Google Form.
- **Wording is unchanged.** Each field also shows a smaller English gloss
  beneath the Indonesian label (e.g. *Nama lengkap* / "Full name") as a reading
  aid. The gloss is presentational only — it does not alter the question.
- **Q2 (Usia)** was free text in the Google Form. On the website it is
  constrained to 21–99, enforced both client- and server-side, because the
  event's own rules require participants to be 21+. This tightens data quality
  without changing what is asked (PRD §12, §13).
- **Q3 / Q4** keep exactly the two options the Google Form offers (Pria,
  Wanita). No option was added or removed.
- **Q7 (Nomor WhatsApp)** is stored normalised to international format
  (`0812…` → `+62812…`) so duplicate detection is reliable. The applicant may
  type it in any common format.
- **Q9 (Alamat email)** replaces the Google Form's automatic Google-account
  capture. The Google Form recorded the signed-in Google account; the website
  has no sign-in, so email is asked directly — it was already an explicit
  required question on page 1, so nothing is lost.

---

## Final step — Confirmation

These are **not** Google Form questions. They implement the consent
requirements the PRD specifies for the confirmation step (§10 Step 5) and turn
the Google Form's "Informasi Penting" notice — previously just text above the
form — into explicit, auditable tick-boxes.

| Consent | Website field | Type | Required | Google Sheet column |
|---|---|---|---|---|
| Information supplied is accurate | `consentAccurate` | Checkbox | Yes | `Consent — Accurate` |
| Applying does not guarantee selection | `consentSelection` | Checkbox | Yes | `Consent — Selection` |
| LOK GITEW may make contact about the event | `consentContact` | Checkbox | Yes | `Consent — Contact` |
| Privacy / data-use terms | `consentPrivacy` | Checkbox | Yes | `Consent — Privacy` |

Each is stored as `YES` / `NO`. All four must be ticked before the form will
submit.

---

## System-generated columns

Written by the server on every successful submission; never supplied by the
applicant (PRD §16, §17).

| Column | Source | Format |
|---|---|---|
| `Application ID` | `nextApplicationId()` | `LL-2026-00001` |
| `Submitted At` | `new Date().toISOString()` | ISO 8601 UTC |

---

## Internal / administrative columns

Created empty on every row and maintained by hand by the LOK GITEW team. The
website never reads or writes these, never returns them in any response, and
never exposes them to applicants (PRD §19–§21, §26).

| Column | Purpose | Allowed values |
|---|---|---|
| `Status` | Application status | `PENDING` (default), `APPROVED`, `REJECTED`, `WAITLIST`, `MATCHED`, `CONFIRMED`, `CANCELLED` |
| `Admin Notes` | Free-text internal notes | Any |
| `Match ID` | Internal match reference | e.g. `LL-2026-00021` |
| `Match Status` | Matching progress | Team's convention |
| `Contact Status` | Whether/when contacted | Team's convention |
| `Event Status` | Attendance on the night | Team's convention |

---

## Step 2 — Your Vibe

Feeds the *kepribadian* and *minat* selection criteria.

| # | Question | Website field | Type | Required | Google Sheet column |
|---|---|---|---|---|---|
| 10 | Kepribadian kamu | `personality` | Radio — 5-point introvert↔extrovert | Yes | `Personality` |
| 11 | Minat & hobi | `interests` | Multi-select, 16 options, max 6 | Yes | `Interests` |
| 12 | Akhir pekan idealmu | `weekendVibe` | Dropdown — 7 options | Yes | `Ideal Weekend` |
| 13 | Ceritakan sedikit tentang dirimu | `selfDescription` | Textarea, max 300 | Yes | `Self Description` |

The interests cap of 6 keeps the data useful for seating: an applicant who
ticks everything tells you nothing. The UI greys out the remaining options
once the cap is hit rather than rejecting the choice afterwards.

---

## Step 3 — What You're Looking For

Feeds the *preferensi pasangan* criterion.

| # | Question | Website field | Type | Required | Google Sheet column |
|---|---|---|---|---|---|
| 14 | Apa yang kamu cari di acara ini? | `intention` | Radio — 4 options | Yes | `Intention` |
| 15 | Rentang usia yang kamu harapkan | `preferredAgeRange` | Dropdown — 6 bands | Yes | `Preferred Age Range` |
| 16 | Kualitas yang paling kamu cari | `valuedQualities` | Multi-select, 11 options, max 3 | Yes | `Valued Qualities` |
| 17 | Hal yang kurang cocok buatmu | `dealBreakers` | Multi-select, 5 options | No | `Deal Breakers` |

The age bands deliberately overlap (21–25, 24–30, 28–35…) so nobody sits
awkwardly on a boundary. `dealBreakers` is optional and its options are kept
factual and behavioural — nothing that invites applicants to rule people out
on appearance or background.

---

## Step 4 — Event Details

Practical logistics for the night.

| # | Question | Website field | Type | Required | Google Sheet column |
|---|---|---|---|---|---|
| 18 | Bisa hadir pada *(event date and time)*? | `availability` | Radio — 3 options | Yes | `Availability` |
| 19 | Preferensi makanan atau alergi | `dietary` | Multi-select, 8 options | Yes | `Dietary Requirements` |
| 20 | Detail alergi atau catatan makanan | `dietaryNotes` | Text, max 200 | No | `Dietary Notes` |
| 21 | Dari mana kamu tahu acara ini? | `hearAboutUs` | Dropdown — 5 options | Yes | `Heard About Us Via` |
| 22 | Ada hal lain yang perlu kami tahu? | `additionalInfo` | Textarea, max 400 | No | `Additional Information` |

Q18's label is built from `LOK_LOVE_CONFIG` at runtime, so the date and time in
the question always match the event details shown on the page.

Q19 is required and includes an explicit **"Tidak ada"** option — an applicant
must actively say they have no requirements rather than skipping the question,
because a missed allergy is the one blank that matters on the night.

Q21 is not used for selection; it tells you which channel actually fills tables.

---

## Photo upload

The original Google Form collected photos. **The website form does not**, and
this was a deliberate decision (recommended 5 September 2026, not overturned).

Reasoning:

- The stated purpose is reviewing *"penampilan secara keseluruhan."* The
  Instagram/TikTok handle collected in Step 1 (Q8, required) already serves
  that purpose, from a profile the applicant curates and controls.
- Uploading forced applicants to sign in to a Google account — friction that
  moving off Google Forms was meant to remove.
- Storing personal photographs raises the stakes of the data considerably for
  a Phase 1 system whose entire security boundary is one spreadsheet's sharing
  settings.

If the organisers want uploads back, the two workable routes are a
Drive-backed upload via `DriveApp.createFile()` in `Code.gs` (needs a ~5 MB cap
and client-side downscaling to survive 4G), or simply requesting a photo over
WhatsApp after selection, when the team is already in contact. The second keeps
personal images out of the application store entirely.

---

## Adding a question later

1. Add a field object to the relevant step in `LOK_LOVE_FORM_SCHEMA`
   (`lok-love/lok-love.js`). Supported types: `text`, `tel`, `email`, `number`,
   `textarea`, `select`, `radio`, `checkbox` (multi-select), `consent`.
2. Append a row to `COLUMNS` in `Code.gs` — **at the end**, so existing rows
   stay aligned with their headers.
3. For a `select`/`radio`, add its allowed values to `CHOICE_FIELDS`; for a
   `checkbox`, add an entry to `MULTI_FIELDS`. Plain text needs neither — the
   catch-all loop in `validate()` carries unknown keys through.
4. Re-run `setupSheet`, redeploy the script, and update this document.
