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
| **Mapped so far** | Google Form **page 1** — 9 questions, transcribed verbatim |
| **Outstanding** | Google Form **pages 2+** — not yet supplied |
| **Source** | Organiser screenshots of the live form, 5 September 2026 |

The live Google Form's first page ends in a `Next` button, and its preamble
mentions submitted photos, so at least one further page exists containing (at
minimum) a photo upload. Those questions are **not** represented on the website
form yet. See [Outstanding questions](#outstanding-questions).

---

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

## Outstanding questions

**Google Form pages 2+ are not yet mapped.** Page 1 ends in `Next`, and the
form's preamble refers to submitted photos, so further questions exist.

To add them:

1. Add a step object to `LOK_LOVE_FORM_SCHEMA` in `lok-love/lok-love.js`,
   using the same shape as the existing steps. The step renderer, validation,
   review screen and JSON payload all pick it up with no other changes.
2. Append matching rows to `COLUMNS` in `Code.gs` — **append at the end** so
   existing rows stay aligned with their headers.
3. Add the questions to the Step tables above.

The PRD's suggested groupings (§10) are a reasonable home for them:

| PRD step | Likely content | Status |
|---|---|---|
| Step 2 — Your Vibe | Hobbies, interests, personality, self-description | Awaiting organiser |
| Step 3 — What You're Looking For | Relationship intention, preferred age range, deal breakers | Awaiting organiser |
| Step 4 — Event Details | Availability, dietary requirements, anything else to know | Awaiting organiser |

### Photo upload — needs a decision

The Google Form collects photos (it warns that uploading requires a Google
sign-in). The website form has no equivalent yet, and it is the one question
that cannot simply be added to the schema: Apps Script's `doPost` accepts
roughly 50 MB of payload, but base64 image uploads through a text/plain POST
are slow on mobile data and awkward to make reliable.

Options, in the order they are worth considering:

1. **Ask for an Instagram/TikTok handle only** (already collected as `socialHandle`)
   and review appearance from the public profile. No upload, no storage, no
   extra consent burden. Simplest, and covers the stated purpose.
2. **Upload to Google Drive via Apps Script** — the applicant picks a file, the
   browser base64-encodes it, `doPost` writes it to a Drive folder with
   `DriveApp.createFile()` and stores the file URL in a `Photo` column. Works
   with the current architecture; needs a size cap (~5 MB) and client-side
   downscaling to stay reliable on 4G.
3. **Ask for the photo over WhatsApp** after selection, when the team is
   already in contact. Keeps personal images out of the application store
   entirely — the lightest option for data privacy.

This needs an organiser decision before it can be built.
