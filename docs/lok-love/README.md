# LOK & LOVE — Setup & Operations

Everything needed to get `https://lokgitew.com/lok-love/` accepting real
applications, and to run it day to day.

- [Architecture](#architecture)
- [Changing the form](#changing-the-form)
- [Local development](#local-development)
- [Security & privacy](#security--privacy)
- [Running the event](#running-the-event)

---

## Architecture

```
Browser  ──POST application/json──▶  RouterGitew  ──▶  POSGitew  ──▶  Postgres
lokgitew.com/lok-love/               lokgitew.gitew.com/pos       lok_love_applications
                                     · gateway allowlist
                                     · zod validation
                                     · duplicate check
                                     · generate LL-2026-00001
                              ◀── { status, applicationId } ──
                                                             │
                                          POS admin dashboard ┘
                                          "Lok & Love" tab
```

`lokgitew.com` is a **static GitHub Pages site** with no server runtime, so the
API lives in POSGitew — the same backend that already serves the reservation
form on the main page, reached through the same gateway.

Applications are reviewed in the POS admin dashboard, not a spreadsheet:
open **Admin → Lok & Love**. The tab shows roster counts against the 6 + 6 the
event needs, status filters, search, one-tap status changes, internal notes,
and WhatsApp/Instagram/email shortcuts.

### Endpoints

| Route | Access |
|---|---|
| `POST /pos/api/lok-love/apply` | Public — the website form |
| `GET /pos/api/lok-love` | Staff auth |
| `PATCH /pos/api/lok-love/:id` | Staff auth |

Two boundaries enforce that split: the gateway's public-route allowlist in
`outlet-proxy-access.policy.ts`, and `requireAuth` on the routes themselves.
Adding a read route to the allowlist would expose applicant contact details —
don't.

### Files

| File | Role |
|---|---|
| `lok-love/index.html` | Landing page + form shell |
| `lok-love/lok-love.css` | Page styles |
| `lok-love/lok-love.js` | Config, form schema, renderer, validation, submission |
| `docs/lok-love/question-mapping.md` | Question → field → column contract |

Server side, in the **POSGitew** repo:

| File | Role |
|---|---|
| `server/db/schema/49-lok-love-applications.sql` | Table |
| `server/modules/lok-love/` | Repo, service, routes, types, mapper, presenter |
| `client/src/admin/LokLoveTab.jsx` | Admin tab |

---

## Changing the form

All questions live in `LOK_LOVE_FORM_SCHEMA` in `lok-love/lok-love.js`. The
step renderer, progress bar, validation, review screen and JSON payload are
generated from it — there is no per-question markup.

To add a question:

1. Add a field object to the relevant step in `LOK_LOVE_FORM_SCHEMA`.
   Supported types: `text`, `tel`, `email`, `number`, `textarea`, `select`,
   `radio`, `checkbox` (multi-select), `consent`.
2. In POSGitew: add the column to migration 49 (or a new numbered migration),
   the `LokLoveRow` type, `applicationSelect`, the insert, and the mapper.
3. Add it to `LokLoveApplyRequestSchema` in
   `packages/contracts/src/lok-love.schema.js` — the request is `.strict()`,
   so an unknown key is rejected rather than ignored.
4. Update `docs/lok-love/question-mapping.md`.

Multi-selects travel as a JSON array and are stored comma-separated.

### Event details

Dates, times, venue, price, deadline and capacity live in `LOK_LOVE_CONFIG` at
the top of `lok-love.js`. The landing-page markup carries the same values as
static text for crawlers and no-JS, and every `[data-ll="key"]` placeholder is
re-rendered from the config on load — the config wins.

### Before the endpoint is live

If `apiEndpoint` is unset or still a placeholder, the form goes into a
soft-launch state: a banner says applications open shortly, submitting shows an
honest "belum dibuka" panel, and no request is fired. It clears itself once a
real URL is set.

---

## Local development

```bash
python3 -m http.server 8000   # → http://localhost:8000/lok-love/
```

Submissions from `localhost` will fail CORS against production. To exercise the
success path, stub it in the console before submitting:

```js
window.fetch = async () => new Response(
  JSON.stringify({ success: true, status: 'ok', applicationId: 'LL-2026-00099' }),
  { status: 201, headers: { 'Content-Type': 'application/json' } }
);
```

Use `{ success: true, status: 'duplicate' }` for the duplicate screen.

---

## Security & privacy

| Requirement | How |
|---|---|
| No credentials in the browser | The apply endpoint is unauthenticated and write-only |
| Applicant data not publicly readable | Reads require staff auth at the gateway *and* the route |
| Not indexable | No applicant data is rendered into any page |
| Not exposed to other applicants | Nothing in the UI reads back submitted data |
| Sensitive data out of analytics | `trackEvent()` takes event names only — never answers |
| Errors not leaked | Server errors are logged; the browser gets a generic message |

The duplicate response is deliberately `{ status: 'duplicate' }` and nothing
more. Returning the existing application's ID or details would let anyone probe
whether a given phone number has applied.

---

## Running the event

Applications are triaged in the POS admin dashboard under **Admin → Lok &
Love**. Every application starts at `PENDING`.

```
NEW APPLICATION → PENDING → review → APPROVED / REJECTED / WAITLIST
                                        ↓
                              contacted on WhatsApp
                                        ↓
                     paid within 24h → CONFIRMED → MATCHED → EVENT
```

Status, admin notes and the match/contact/event fields are internal — the
website never reads them, so changing them cannot affect the public page.

The tab counts approved applicants by gender against the 6 + 6 the event
needs, so you can see the roster filling without counting by hand.

Restricted admins only see this tab if `lok-love` is in their permissions
(Admin → Users). Superusers see it by default. Applicant contact details are
personal data — grant it deliberately.

### Capacity

The form deliberately stays open after 6+6 is reached (PRD §36); the landing
page tells applicants they may be waitlisted. Use `WAITLIST` as the status.
Nothing in the code caps submissions.

---
