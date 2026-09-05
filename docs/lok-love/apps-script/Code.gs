/**
 * ════════════════════════════════════════════════════════════════════════
 * LOK & LOVE — Application intake backend (Google Apps Script)
 * ------------------------------------------------------------------------
 * Receives applications from https://lokgitew.com/lok-love/ and appends
 * them to the "Applications" sheet.
 *
 * Responsibilities (PRD §14-§19, §37):
 *   • Server-side validation — the browser's copy is never the authority
 *   • Duplicate detection on WhatsApp number and email
 *   • Server-side application ID generation (LL-2026-00001)
 *   • Server-side ISO 8601 timestamp
 *   • Only reports success once the row is actually committed
 *
 * Deployment and Sheet setup: see docs/lok-love/README.md
 * ════════════════════════════════════════════════════════════════════════
 */

/* ── Configuration ───────────────────────────────────────────────────── */

var CONFIG = {
  SHEET_NAME:  'Applications',
  ID_PREFIX:   'LL',
  ID_YEAR:     '2026',
  ID_PAD:      5,           // LL-2026-00001
  MIN_AGE:     21,
  LOCK_WAIT_MS: 20000       // wait up to 20s for the ID/append lock
};

/**
 * Sheet column order.
 *
 * `key` is the field id in the JSON payload (and in
 * LOK_LOVE_FORM_SCHEMA in lok-love.js). A null key means the column is
 * internal/administrative — this script never writes to it, and the team
 * fills it in by hand.
 *
 * To add a question: add it to the form schema, then add a row here with
 * the matching key. Append new columns at the END so existing rows stay
 * aligned.
 */
var COLUMNS = [
  { header: 'Application ID',       key: '_applicationId' },
  { header: 'Submitted At',         key: '_submittedAt'   },

  { header: 'Name',                 key: 'name'           },
  { header: 'Age',                  key: 'age'            },
  { header: 'Gender',               key: 'gender'         },
  { header: 'Looking To Meet',      key: 'lookingToMeet'  },
  { header: 'City',                 key: 'city'           },
  { header: 'Occupation',           key: 'occupation'     },
  { header: 'WhatsApp',             key: 'whatsapp'       },
  { header: 'Instagram/TikTok',     key: 'socialHandle'   },
  { header: 'Email',                key: 'email'          },

  { header: 'Consent — Accurate',   key: 'consentAccurate'  },
  { header: 'Consent — Selection',  key: 'consentSelection' },
  { header: 'Consent — Contact',    key: 'consentContact'   },
  { header: 'Consent — Privacy',    key: 'consentPrivacy'   },

  /* ── Internal / administrative (PRD §19-§21). Never returned to the
     applicant, never exposed by any endpoint. ── */
  { header: 'Status',               key: null, default: 'PENDING' },
  { header: 'Admin Notes',          key: null },
  { header: 'Match ID',             key: null },
  { header: 'Match Status',         key: null },
  { header: 'Contact Status',       key: null },
  { header: 'Event Status',         key: null }
];

/** Field-level validation rules, mirroring the client. */
var REQUIRED_TEXT_FIELDS = [
  { key: 'name',         label: 'Nama lengkap',        max: 100 },
  { key: 'city',         label: 'Kota atau daerah',    max: 120 },
  { key: 'occupation',   label: 'Pekerjaan',           max: 120 },
  { key: 'socialHandle', label: 'Username Instagram/TikTok', max: 80 }
];

var REQUIRED_CONSENTS = [
  'consentAccurate', 'consentSelection', 'consentContact', 'consentPrivacy'
];

var CHOICE_FIELDS = [
  { key: 'gender',        allowed: ['Pria', 'Wanita'] },
  { key: 'lookingToMeet', allowed: ['Pria', 'Wanita'] }
];

/* ── HTTP entry points ───────────────────────────────────────────────── */

/**
 * The site POSTs with Content-Type: text/plain so the request stays a CORS
 * "simple request" — Apps Script web apps cannot answer the preflight
 * OPTIONS that application/json would trigger. The body is still JSON.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: 'error', message: 'Empty request.' });
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ status: 'error', message: 'Malformed request.' });
    }

    return handleApplication(payload);

  } catch (err) {
    // Log the real error for the team; never leak it to the applicant (PRD §23).
    console.error('doPost failed: ' + (err && err.stack ? err.stack : err));
    return jsonResponse({
      status: 'error',
      message: 'We could not save your application. Please try again.'
    });
  }
}

/**
 * Applicant data must never be readable over HTTP (PRD §26), so GET
 * intentionally exposes nothing but a health check.
 */
function doGet() {
  return jsonResponse({ status: 'ok', service: 'lok-love-intake' });
}

/* ── Core handler ────────────────────────────────────────────────────── */

function handleApplication(payload) {
  var clean = validate(payload);
  if (clean.errors.length) {
    return jsonResponse({
      status: 'invalid',
      message: 'Some answers need another look.',
      errors: clean.errors
    });
  }

  var sheet = getSheet();
  var lock  = LockService.getScriptLock();

  // Serialise the duplicate check, ID generation and append together.
  // Without this, two simultaneous submissions can read the same last row
  // and be handed the same application ID.
  try {
    lock.waitLock(CONFIG.LOCK_WAIT_MS);
  } catch (lockErr) {
    console.error('Could not acquire lock: ' + lockErr);
    return jsonResponse({
      status: 'error',
      message: 'We are a bit busy right now. Please try again in a moment.'
    });
  }

  try {
    if (isDuplicate(sheet, clean.values)) {
      // Deliberately says nothing about the existing record (PRD §18).
      return jsonResponse({ status: 'duplicate' });
    }

    var applicationId = nextApplicationId(sheet);
    var submittedAt   = new Date().toISOString();

    var row = buildRow(clean.values, applicationId, submittedAt);
    sheet.appendRow(row);

    // appendRow queues the write; flush forces it to commit before we
    // report success, so we never tell an applicant "submitted" for a row
    // that did not land (PRD §37).
    SpreadsheetApp.flush();

    return jsonResponse({
      status: 'ok',
      applicationId: applicationId,
      submittedAt: submittedAt
    });

  } finally {
    lock.releaseLock();
  }
}

/* ── Validation ──────────────────────────────────────────────────────── */

function validate(payload) {
  var errors = [];
  var v = {};

  if (!payload || typeof payload !== 'object') {
    return { values: v, errors: [{ field: '_', message: 'Malformed request.' }] };
  }

  REQUIRED_TEXT_FIELDS.forEach(function (f) {
    var value = trimStr(payload[f.key]);
    if (!value) {
      errors.push({ field: f.key, message: f.label + ' is required.' });
    } else if (value.length > f.max) {
      errors.push({ field: f.key, message: f.label + ' is too long.' });
    }
    v[f.key] = value;
  });

  // Age
  var age = parseInt(payload.age, 10);
  if (!isFinite(age)) {
    errors.push({ field: 'age', message: 'Usia is required.' });
  } else if (age < CONFIG.MIN_AGE) {
    errors.push({
      field: 'age',
      message: 'Participants must be at least ' + CONFIG.MIN_AGE + '.'
    });
  } else if (age > 99) {
    errors.push({ field: 'age', message: 'Please enter a valid age.' });
  }
  v.age = isFinite(age) ? age : '';

  // Single-choice fields
  CHOICE_FIELDS.forEach(function (f) {
    var value = trimStr(payload[f.key]);
    if (f.allowed.indexOf(value) === -1) {
      errors.push({ field: f.key, message: 'Please choose a valid option.' });
      value = '';
    }
    v[f.key] = value;
  });

  // WhatsApp
  var wa = normaliseWhatsapp(payload.whatsapp);
  if (!wa) {
    errors.push({ field: 'whatsapp', message: 'A valid WhatsApp number is required.' });
  }
  v.whatsapp = wa || '';

  // Email
  var email = trimStr(payload.email).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.push({ field: 'email', message: 'A valid email address is required.' });
    email = '';
  }
  v.email = email;

  // Consents
  REQUIRED_CONSENTS.forEach(function (key) {
    var accepted = payload[key] === true || payload[key] === 'true';
    if (!accepted) {
      errors.push({ field: key, message: 'This consent is required.' });
    }
    v[key] = accepted ? 'YES' : 'NO';
  });

  // Carry through any additional schema fields not explicitly handled
  // above, so newly added questions are stored without editing validate().
  COLUMNS.forEach(function (col) {
    if (!col.key || col.key.charAt(0) === '_') return;
    if (Object.prototype.hasOwnProperty.call(v, col.key)) return;
    var raw = payload[col.key];
    v[col.key] = Array.isArray(raw) ? raw.join(', ') : trimStr(raw);
  });

  return { values: v, errors: errors };
}

function trimStr(value) {
  if (value == null) return '';
  return String(value).trim();
}

/**
 * Accepts 08xx, 8xx, +628xx and 628xx with any spacing/punctuation, and
 * returns a canonical +62… string. Returns null when implausible.
 */
function normaliseWhatsapp(raw) {
  var v = trimStr(raw).replace(/[\s\-().]/g, '');
  if (!v) return null;
  if (v.charAt(0) === '+') v = v.substring(1);
  if (!/^\d+$/.test(v)) return null;

  if (v.charAt(0) === '0')      v = '62' + v.substring(1);
  else if (v.charAt(0) === '8') v = '62' + v;

  if (v.indexOf('62') !== 0) return null;
  var national = v.substring(2);
  if (national.length < 9 || national.length > 13) return null;
  return '+' + v;
}

/* ── Sheet helpers ───────────────────────────────────────────────────── */

function getSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    writeHeaderRow(sheet);
  }
  return sheet;
}

function writeHeaderRow(sheet) {
  var headers = COLUMNS.map(function (c) { return c.header; });
  sheet.getRange(1, 1, 1, headers.length)
       .setValues([headers])
       .setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function columnIndex(key) {
  for (var i = 0; i < COLUMNS.length; i++) {
    if (COLUMNS[i].key === key) return i;
  }
  return -1;
}

/**
 * Duplicate on WhatsApp number OR email (PRD §18). Both are normalised
 * before comparison so "0812 3456 7890" and "+62 812-3456-7890" match.
 */
function isDuplicate(sheet, values) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  var waCol    = columnIndex('whatsapp');
  var emailCol = columnIndex('email');
  if (waCol === -1 && emailCol === -1) return false;

  var data = sheet.getRange(2, 1, lastRow - 1, COLUMNS.length).getValues();

  for (var i = 0; i < data.length; i++) {
    if (waCol !== -1) {
      var existingWa = normaliseWhatsapp(data[i][waCol]);
      if (existingWa && existingWa === values.whatsapp) return true;
    }
    if (emailCol !== -1 && values.email) {
      var existingEmail = trimStr(data[i][emailCol]).toLowerCase();
      if (existingEmail && existingEmail === values.email) return true;
    }
  }
  return false;
}

/**
 * Sequential ID derived from the highest existing ID rather than the row
 * count, so deleting a row never causes a collision.
 * Must be called while holding the script lock.
 */
function nextApplicationId(sheet) {
  var lastRow = sheet.getLastRow();
  var highest = 0;

  if (lastRow >= 2) {
    var idCol  = columnIndex('_applicationId') + 1;
    var ids    = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
    var prefix = CONFIG.ID_PREFIX + '-' + CONFIG.ID_YEAR + '-';

    for (var i = 0; i < ids.length; i++) {
      var id = trimStr(ids[i][0]);
      if (id.indexOf(prefix) !== 0) continue;
      var n = parseInt(id.substring(prefix.length), 10);
      if (isFinite(n) && n > highest) highest = n;
    }
  }

  var next = String(highest + 1);
  while (next.length < CONFIG.ID_PAD) next = '0' + next;
  return CONFIG.ID_PREFIX + '-' + CONFIG.ID_YEAR + '-' + next;
}

function buildRow(values, applicationId, submittedAt) {
  return COLUMNS.map(function (col) {
    if (col.key === '_applicationId') return applicationId;
    if (col.key === '_submittedAt')   return submittedAt;
    if (col.key === null)             return col.default || '';
    var v = values[col.key];
    return v == null ? '' : v;
  });
}

/* ── Response helper ─────────────────────────────────────────────────── */

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ── Maintenance utilities (run manually from the editor) ────────────── */

/**
 * Creates the Applications sheet with its header row. Safe to re-run.
 */
function setupSheet() {
  var sheet = getSheet();
  writeHeaderRow(sheet);
  sheet.autoResizeColumns(1, COLUMNS.length);
  SpreadsheetApp.getUi().alert(
    'LOK & LOVE: "' + CONFIG.SHEET_NAME + '" is ready with ' +
    COLUMNS.length + ' columns.'
  );
}

/**
 * Appends a throwaway application so you can confirm the pipeline end to
 * end. Delete the row afterwards.
 */
function testSubmission() {
  var res = handleApplication({
    name: 'Test Applicant',
    age: 27,
    gender: 'Wanita',
    lookingToMeet: 'Pria',
    city: 'Serpong, Tangerang',
    occupation: 'Designer',
    whatsapp: '0812 3456 7890',
    socialHandle: '@testapplicant',
    email: 'test.applicant@example.com',
    consentAccurate: true,
    consentSelection: true,
    consentContact: true,
    consentPrivacy: true
  });
  console.log(res.getContent());
}
