# LOK & LOVE — Setup & Operations

Everything needed to get `https://lokgitew.com/lok-love/` accepting real
applications, and to run it day to day.

- [Architecture](#architecture)
- [One-time setup](#one-time-setup)
- [Running the event](#running-the-event)
- [Changing the form](#changing-the-form)
- [Local development](#local-development)
- [Security & privacy](#security--privacy)
- [Migrating off Google Sheets](#migrating-off-google-sheets)

---

## Architecture

```
Browser  ──POST(JSON as text/plain)──▶  Apps Script Web App  ──▶  Google Sheet
lokgitew.com/lok-love/                  doPost() in Code.gs        "Applications"
                                        · validate
                                        · duplicate check
                                        · generate LL-2026-00001
                                        · append + flush
                                  ◀── { status, applicationId } ──
```

`lokgitew.com` is a **static GitHub Pages site** — it has no server runtime, so
it cannot host an API route of its own. The Apps Script Web App is the server
tier. The applicant's browser only ever talks to that one endpoint, and it
holds no credentials: the script runs as the sheet's owner, so the Sheet itself
stays private.

### Files

| File | Role |
|---|---|
| `lok-love/index.html` | Landing page + form shell |
| `lok-love/lok-love.css` | Page styles (layered on the shared `/style.css`) |
| `lok-love/lok-love.js` | Config, form schema, renderer, validation, submission |
| `docs/lok-love/apps-script/Code.gs` | Server: validation, dedupe, ID, Sheet write |
| `docs/lok-love/question-mapping.md` | Question → field → column contract |

---

## One-time setup

### 1. Create the spreadsheet

Create a Google Spreadsheet named **`LOK & LOVE — Applications`**.

Keep it private. Share it only with the team members who review applications —
it holds applicants' personal data.

### 2. Add the script

Two routes. Both need a **desktop browser** — the Apps Script editor has no
mobile app and does not work properly on a phone.

**Bound (from inside the sheet)** — the usual way:

1. In the spreadsheet: **Extensions → Apps Script**.
2. Delete the placeholder contents, paste all of
   `docs/lok-love/apps-script/Code.gs`, save.
3. Set `CONFIG.SPREADSHEET_ID` to `''` — a bound script finds its own sheet.

**Standalone (from script.google.com)** — no Sheets UI needed, which helps if
you only have a phone in desktop-site mode:

1. Go to **script.google.com** → **New project**.
2. Paste the same file.
3. Leave `CONFIG.SPREADSHEET_ID` set to the spreadsheet's ID (the long string
   between `/d/` and `/edit` in its URL). It is pre-filled.

Everything after this is identical for both.

### 3. Create the sheet tab

Run the `setupSheet` function once from the Apps Script editor (select
`setupSheet` in the function dropdown, press **Run**). Grant the permissions it
asks for on first run.

This creates the `Applications` tab with its bold, frozen header row. It is
safe to re-run.

### 4. Deploy as a Web App

**Deploy → New deployment → Web app**, with:

| Setting | Value |
|---|---|
| Description | `LOK & LOVE intake` |
| Execute as | **Me** (the sheet owner) |
| Who has access | **Anyone** |

"Anyone" is required — applicants are not signed in to Google. It does **not**
make the spreadsheet public: it exposes only `doPost`/`doGet`, and `doGet`
returns nothing but a health check.

Copy the deployment's **Web app URL**. It looks like:

```
https://script.google.com/macros/s/AKfycb…/exec
```

### 5. Point the site at it

In `lok-love/lok-love.js`, set `apiEndpoint` in `LOK_LOVE_CONFIG`:

```js
apiEndpoint: 'https://script.google.com/macros/s/AKfycb…/exec'
```

Commit and push. GitHub Pages redeploys automatically.

> This URL is public by design — it is a write-only intake endpoint, and it is
> visible in the page source. That is expected and safe. What must never be
> public is the **spreadsheet**.

### 6. Verify end to end

1. Open `https://lokgitew.com/lok-love/` and submit a real application
   (five steps — the last is review and consent).
2. Confirm you get an application ID (`LL-2026-00001`).
3. Confirm the row appears in the sheet.
4. Submit again with the same WhatsApp number — you should get the
   "already applied" screen and **no** second row.
5. Delete your test rows.

### Redeploying after a script change

Apps Script keeps serving the deployed version, not the saved one. After
editing `Code.gs`: **Deploy → Manage deployments → ✏️ Edit → Version: New
version → Deploy**. The URL stays the same.

---

## Running the event

The spreadsheet is the admin interface for Phase 1 (PRD §32). Every row starts
at `Status = PENDING`.

```
NEW APPLICATION → PENDING → review → APPROVED / REJECTED / WAITLIST
                                        ↓
                              contacted on WhatsApp
                                        ↓
                     paid within 24h → CONFIRMED → MATCHED → EVENT
```

Edit `Status`, `Admin Notes`, `Match ID`, `Match Status`, `Contact Status` and
`Event Status` freely — the website never reads them, so changing them cannot
affect the public page.

**Do not** reorder, rename or delete columns, and do not sort the sheet in a
way that leaves a partly-filled row: the script matches columns by position.
Adding new columns at the far right is safe.

### Capacity

The form deliberately stays open after 6+6 is reached (PRD §36); the landing
page tells applicants they may be waitlisted. Use `WAITLIST` as the status.
Nothing in the code caps submissions.

---

## Changing the form

All questions live in one place: `LOK_LOVE_FORM_SCHEMA` in
`lok-love/lok-love.js`. The step renderer, progress bar, validation, review
screen and JSON payload are all generated from it — there is no per-question
markup to edit.

To add a question:

1. Add a field object to the relevant step in `LOK_LOVE_FORM_SCHEMA`.
2. Add a matching row to `COLUMNS` in `Code.gs` — **append at the end**, so
   existing rows stay aligned with their headers.
3. Re-run `setupSheet` (or add the header by hand) and redeploy the script.
4. Update `docs/lok-love/question-mapping.md`.

Field `id` = payload key = `COLUMNS` key. Supported `type` values: `text`,
`tel`, `email`, `number`, `textarea`, `select`, `radio`, `checkbox`
(multi-select) and `consent`.

For a `select` or `radio`, add its allowed values to `CHOICE_FIELDS` in
`Code.gs`; for a `checkbox`, add an entry to `MULTI_FIELDS` (with `required`
and an optional `max` matching the form's cap). Plain text questions need
neither — the final loop in `validate()` carries unknown keys through, so they
are stored with no server change beyond the `COLUMNS` row.

Multi-selects travel as a JSON array and are stored as a comma-separated
string in one cell.

To add a whole step, push another object onto `LOK_LOVE_FORM_SCHEMA` **before**
the `isReview: true` step. The progress bar re-counts itself.

### Event details

Dates, times, venue, price, deadline and capacity live in `LOK_LOVE_CONFIG` at
the top of `lok-love.js`. The landing-page markup carries the same values as
static text (so the page is right for crawlers and without JS), and every
`[data-ll="key"]` placeholder is re-rendered from the config on load — the
config wins. Change values there, and update the static fallbacks to match.

---

## Local development

The page is static, so any file server works:

```bash
cd /path/to/lokgitew.github.io
python3 -m http.server 8000
# → http://localhost:8000/lok-love/
```

Submissions will fail against the real endpoint from `localhost` unless you
deploy your own test copy of the script. The failure path is worth seeing
anyway: the error state keeps every answer intact.

To exercise the success path without a server, stub the endpoint in the
browser console before submitting:

```js
window.fetch = async () => new Response(
  JSON.stringify({ status: 'ok', applicationId: 'LL-2026-00099' }),
  { status: 200, headers: { 'Content-Type': 'application/json' } }
);
```

Use `{ status: 'duplicate' }` to see the duplicate screen.

---

## Security & privacy

What the PRD requires (§25, §26) and how it is met:

| Requirement | How |
|---|---|
| No credentials in the browser | The endpoint is unauthenticated and write-only; the script runs as the sheet owner. There is no API key or service account in the frontend. |
| Applicant data not publicly readable | `doGet` returns only a health check. There is no read endpoint of any kind. |
| Not indexable | No applicant data is ever rendered into a page. Only the landing page is public, and it contains no applicant records. |
| Not exposed to other applicants | Nothing in the UI reads back submitted data. |
| Sensitive data out of analytics | `trackEvent()` is only ever called with event names and never with answers. Do not add form values to it. |
| Errors not leaked | Server errors are logged to the Apps Script console; the browser shows a generic message. |

Two things to be careful about:

- **The duplicate response says only `{ status: 'duplicate' }`.** Do not extend
  it to return the existing application's ID or details — that would let anyone
  probe whether a given phone number has applied.
- **The spreadsheet is the whole security boundary.** Anyone you share it with
  can see every applicant's contact details. Do not set it to "anyone with the
  link".

### Why `Content-Type: text/plain`

The browser posts JSON with a `text/plain` content type. This is deliberate and
must not be "fixed":

Apps Script Web Apps do not respond to CORS preflight `OPTIONS` requests. An
`application/json` POST is not a CORS *simple request*, so the browser would
send a preflight first, get no valid answer, and block the request. `text/plain`
keeps it a simple request — no preflight — and `doPost` parses the body with
`JSON.parse()` regardless. Both sides carry a comment saying so.

---

## Migrating off Google Sheets

The frontend never talks to Google Sheets. It knows one URL and one JSON
contract:

```
POST  <apiEndpoint>
      { name, age, gender, lookingToMeet, city, occupation, whatsapp,
        socialHandle, email,                          // step 1
        personality, interests[], weekendVibe, selfDescription,
        intention, preferredAgeRange, valuedQualities[], dealBreakers[],
        availability, dietary[], dietaryNotes, hearAboutUs, additionalInfo,
        consentAccurate, consentSelection, consentContact, consentPrivacy }

200   { status: "ok",        applicationId: "LL-2026-00037", submittedAt: "…" }
200   { status: "duplicate" }
200   { status: "invalid",   errors: [ { field, message } ] }
200   { status: "error",     message: "…" }
```

To move to PostgreSQL (or the existing POS server at
`lokgitew.gitew.com/pos`, which already serves `/api/reservations`), stand up
an endpoint that honours that contract and change `apiEndpoint` in
`LOK_LOVE_CONFIG`. No other frontend change is required.

Preserve on migration: the `LL-YYYY-NNNNN` ID format, the ISO 8601 timestamp,
duplicate checks on WhatsApp **and** email, and the internal status columns.
