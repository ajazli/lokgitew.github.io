/* ════════════════════════════════════════════════════════════════════════
   LOK & LOVE — Application form
   ------------------------------------------------------------------------
   The form is SCHEMA-DRIVEN. Every question lives in LOK_LOVE_FORM_SCHEMA
   below; the step renderer, validation, review screen and the JSON payload
   are all generated from it.

   To add / change / remove a question, edit the schema only. Do not hand-
   edit the form markup — it does not exist as markup.

   Each field's `id` is also its key in the API payload, and its
   `sheetColumn` is the human-readable Google Sheet header it lands under.
   Keep those in sync with docs/lok-love/question-mapping.md and the
   COLUMNS array in docs/lok-love/apps-script/Code.gs.
════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── Event configuration ───────────────────────────────────────────────
   Single source of truth for event details (PRD §35). The landing-page
   markup ships with these same values as static text so the page is
   correct for crawlers and without JS; on load we re-render every
   [data-ll] placeholder from this object, so THIS is authoritative. */
const LOK_LOVE_CONFIG = {
    eventName:            'LOK & LOVE',
    editionLabel:         '6×6 — Curated Singles Dinner',
    eventDate:            'Saturday, 19 September 2026',
    eventDateISO:         '2026-09-19',
    eventTime:            '19.00 – 21.00 WIB',
    venue:                'LOK GITEW',
    address:              'Ruko Hampton Promenade Blok M No. 18, Medang, Kec. Pagedangan, Kab. Tangerang, Banten 15334',
    mapsUrl:              'https://www.google.com/maps/search/?api=1&query=LOK%20GITEW%20Hampton%20Promenade%20Serpong',
    ticketPrice:          'Rp199.000',
    ticketPriceNote:      'per person',
    maxMaleParticipants:  6,
    maxFemaleParticipants: 6,
    totalParticipants:    12,
    minimumAge:           21,
    applicationDeadline:  'Friday, 11 September 2026',
    announcementNote:     'Selected applicants are contacted on WhatsApp.',
    paymentWindowHours:   24,
    whatsappNumber:       '6285122333769',
    // Google Apps Script Web App URL. Set after deploying Code.gs.
    // See docs/lok-love/README.md for the deployment steps.
    apiEndpoint:          'https://script.google.com/macros/s/REPLACE_WITH_DEPLOYMENT_ID/exec'
};

/* ── Ticket inclusions (landing page) ─────────────────────────────────── */
const LOK_LOVE_INCLUDES = [
    { icon: '🍚', text: 'One LokGitew rice bowl' },
    { icon: '🥤', text: 'One welcome drink' },
    { icon: '💬', text: 'Mini date sessions' },
    { icon: '🎲', text: 'Group games & activities' },
    { icon: '💌', text: 'Matching process after the event' }
];

/* ── Form schema ───────────────────────────────────────────────────────
   STEP 1 questions are transcribed verbatim from the live Google Form
   (page 1). Do not reword them without organiser approval — see PRD §11.

   Later steps are appended here as the organisers confirm the remaining
   Google Form pages.                                                     */
const LOK_LOVE_FORM_SCHEMA = [
    {
        id: 'about-you',
        title: 'About You',
        blurb: 'The basics — so we know who we are talking to.',
        fields: [
            {
                id: 'name',
                label: 'Nama lengkap',
                labelEn: 'Full name',
                type: 'text',
                required: true,
                autocomplete: 'name',
                placeholder: 'e.g. Putri Ananda',
                sheetColumn: 'Name',
                maxLength: 100
            },
            {
                id: 'age',
                label: 'Usia',
                labelEn: 'Age',
                type: 'number',
                required: true,
                min: LOK_LOVE_CONFIG.minimumAge,
                max: 99,
                inputmode: 'numeric',
                placeholder: '21',
                sheetColumn: 'Age',
                help: 'You must be at least ' + LOK_LOVE_CONFIG.minimumAge + ' to join.'
            },
            {
                id: 'gender',
                label: 'Jenis kelamin',
                labelEn: 'Gender',
                type: 'radio',
                required: true,
                options: [
                    { value: 'Pria',   label: 'Pria',   labelEn: 'Male' },
                    { value: 'Wanita', label: 'Wanita', labelEn: 'Female' }
                ],
                sheetColumn: 'Gender'
            },
            {
                id: 'lookingToMeet',
                label: 'Siapa yang ingin kamu temui dalam acara ini?',
                labelEn: 'Who would you like to meet at this event?',
                type: 'radio',
                required: true,
                options: [
                    { value: 'Pria',   label: 'Pria',   labelEn: 'Male' },
                    { value: 'Wanita', label: 'Wanita', labelEn: 'Female' }
                ],
                sheetColumn: 'Looking To Meet'
            },
            {
                id: 'city',
                label: 'Kota atau daerah tempat tinggal saat ini',
                labelEn: 'Current city or area of residence',
                type: 'text',
                required: true,
                placeholder: 'e.g. Serpong, Tangerang',
                sheetColumn: 'City',
                maxLength: 120
            },
            {
                id: 'occupation',
                label: 'Pekerjaan atau aktivitas saat ini',
                labelEn: 'Current occupation or activity',
                type: 'text',
                required: true,
                placeholder: 'e.g. Graphic designer',
                sheetColumn: 'Occupation',
                maxLength: 120
            },
            {
                id: 'whatsapp',
                label: 'Nomor WhatsApp',
                labelEn: 'WhatsApp number',
                type: 'tel',
                required: true,
                autocomplete: 'tel',
                inputmode: 'tel',
                placeholder: '08xx xxxx xxxx',
                sheetColumn: 'WhatsApp',
                help: 'This is how we contact you if you are selected.'
            },
            {
                id: 'socialHandle',
                label: 'Username Instagram/TikTok',
                labelEn: 'Instagram / TikTok username',
                type: 'text',
                required: true,
                placeholder: '@yourhandle',
                sheetColumn: 'Instagram/TikTok',
                maxLength: 80
            },
            {
                id: 'email',
                label: 'Alamat email',
                labelEn: 'Email address',
                type: 'email',
                required: true,
                autocomplete: 'email',
                placeholder: 'you@email.com',
                sheetColumn: 'Email',
                maxLength: 160
            }
        ]
    },

    /* ── PENDING ORGANISER INPUT ────────────────────────────────────────
       Google Form pages 2+ (vibe / what you are looking for / event
       details / photo upload) are not yet transcribed. Append them here
       as additional step objects using the same shape as above; the
       renderer, validation, review screen, payload and Sheet columns all
       pick them up automatically. See docs/lok-love/question-mapping.md.
    ──────────────────────────────────────────────────────────────────── */

    {
        id: 'confirm',
        title: 'Confirm & Submit',
        blurb: 'Give it one last look before you send it over.',
        isReview: true,
        fields: [
            {
                id: 'consentAccurate',
                type: 'consent',
                required: true,
                label: 'Everything I have entered here is true and accurate.',
                sheetColumn: 'Consent — Accurate'
            },
            {
                id: 'consentSelection',
                type: 'consent',
                required: true,
                label: 'I understand that applying does not guarantee a spot, and that participants are selected by the LOK GITEW team.',
                sheetColumn: 'Consent — Selection'
            },
            {
                id: 'consentContact',
                type: 'consent',
                required: true,
                label: 'LOK GITEW may contact me on WhatsApp or email about this event.',
                sheetColumn: 'Consent — Contact'
            },
            {
                id: 'consentPrivacy',
                type: 'consent',
                required: true,
                label: 'I agree that the information I submit is used to review my application, and that my contact details are never shared with other participants without my consent.',
                sheetColumn: 'Consent — Privacy'
            }
        ]
    }
];

/* ══════════════════════════════════════════════════════════════════════
   ANALYTICS
   Fires the PRD §28 conversion events. Deliberately provider-agnostic:
   pushes to window.dataLayer and calls gtag() if either exists, and is a
   silent no-op otherwise, so wiring up GA4/GTM later needs no changes here.

   NEVER pass applicant answers into this — names, WhatsApp numbers and
   free-text responses must not reach an analytics platform (PRD §28).
═══════════════════════════════════════════════════════════════════════ */
function trackEvent(name, params) {
    const payload = params || {};
    try {
        if (Array.isArray(window.dataLayer)) {
            window.dataLayer.push(Object.assign({ event: name }, payload));
        }
        if (typeof window.gtag === 'function') {
            window.gtag('event', name, payload);
        }
    } catch (e) { /* analytics must never break the form */ }
}

/* ══════════════════════════════════════════════════════════════════════
   SMALL HELPERS
═══════════════════════════════════════════════════════════════════════ */
function el(id)      { return document.getElementById(id); }
function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str == null ? '' : String(str);
    return d.innerHTML;
}
function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function scrollBehavior() { return prefersReducedMotion() ? 'auto' : 'smooth'; }

/* Flatten every field in the schema, in order. */
function allFields() {
    return LOK_LOVE_FORM_SCHEMA.reduce((acc, s) => acc.concat(s.fields), []);
}

/* ══════════════════════════════════════════════════════════════════════
   FORM STATE
   Answers live here, never only in the DOM, so nothing is lost when a
   step re-renders or a submission fails (PRD §13, §23, §37).
═══════════════════════════════════════════════════════════════════════ */
const formState = {
    step: 0,
    answers: {},
    submitting: false,
    submitted: false,
    startedTracked: false
};

const DRAFT_KEY = 'lokLoveDraft.v1';

/* Persist the in-progress answers so a refresh or an accidental
   back-navigation does not wipe a half-finished application. */
function saveDraft() {
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
            step: formState.step,
            answers: formState.answers,
            savedAt: Date.now()
        }));
    } catch (e) { /* private mode / storage disabled — not fatal */ }
}
function loadDraft() {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        const draft = JSON.parse(raw);
        // Drop drafts older than 14 days.
        if (!draft || (Date.now() - (draft.savedAt || 0)) > 14 * 864e5) {
            localStorage.removeItem(DRAFT_KEY);
            return;
        }
        if (draft.answers && typeof draft.answers === 'object') {
            formState.answers = draft.answers;
        }
    } catch (e) { /* ignore malformed drafts */ }
}
function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
}

/* ══════════════════════════════════════════════════════════════════════
   VALIDATION
   Mirrored server-side in Code.gs — the client copy is for fast, friendly
   feedback only and is never the authority.
═══════════════════════════════════════════════════════════════════════ */

/* Indonesian mobile numbers: accept 08xx, 8xx, +628xx and 628xx, with
   spaces, dashes or dots anywhere. Digits (excluding the country code)
   must land in a plausible 9–13 range. */
function normaliseWhatsapp(raw) {
    let v = String(raw || '').replace(/[\s\-().]/g, '');
    if (!v) return null;
    if (v.startsWith('+')) v = v.slice(1);
    if (!/^\d+$/.test(v)) return null;
    if (v.startsWith('0'))       v = '62' + v.slice(1);
    else if (v.startsWith('8'))  v = '62' + v;
    if (!v.startsWith('62')) return null;
    const national = v.slice(2);
    if (national.length < 9 || national.length > 13) return null;
    return '+' + v;
}

function validateField(field, value) {
    const isBlank = value == null || value === '' ||
                    (Array.isArray(value) && value.length === 0);

    if (field.type === 'consent') {
        return value === true ? null : 'Please tick this box to continue.';
    }
    if (field.required && isBlank) {
        return 'This one is required.';
    }
    if (isBlank) return null; // optional + empty is fine

    switch (field.type) {
        case 'number': {
            const n = Number(value);
            if (!Number.isFinite(n)) return 'Please enter a number.';
            if (field.min != null && n < field.min) {
                return field.id === 'age'
                    ? 'You need to be at least ' + field.min + ' to join LOK & LOVE.'
                    : 'Must be at least ' + field.min + '.';
            }
            if (field.max != null && n > field.max) return 'Must be ' + field.max + ' or less.';
            break;
        }
        case 'tel':
            if (!normaliseWhatsapp(value)) {
                return 'Please enter a valid Indonesian number, e.g. 0812 3456 7890.';
            }
            break;
        case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim())) {
                return 'Please enter a valid email address.';
            }
            break;
        case 'radio':
        case 'select':
            if (!field.options.some(o => o.value === value)) {
                return 'Please pick one of the options.';
            }
            break;
    }
    if (field.maxLength && String(value).length > field.maxLength) {
        return 'Please keep this under ' + field.maxLength + ' characters.';
    }
    return null;
}

/* Validate one step; returns { ok, firstInvalidId }. */
function validateStep(stepIndex) {
    const step = LOK_LOVE_FORM_SCHEMA[stepIndex];
    let firstInvalidId = null;

    step.fields.forEach(field => {
        const error = validateField(field, formState.answers[field.id]);
        setFieldError(field.id, error);
        if (error && !firstInvalidId) firstInvalidId = field.id;
    });

    return { ok: !firstInvalidId, firstInvalidId };
}

function setFieldError(fieldId, message) {
    const wrap = document.querySelector('[data-field="' + fieldId + '"]');
    if (!wrap) return;
    const errEl = wrap.querySelector('.ll-field-error');
    const input = wrap.querySelector('input, select, textarea');

    wrap.classList.toggle('ll-invalid', !!message);
    if (errEl) {
        errEl.textContent = message || '';
        // Keep the node in the a11y tree but out of the visual flow when clean.
        errEl.hidden = !message;
    }
    if (input) {
        // Radio groups carry aria-invalid on their fieldset instead.
        input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
    const group = wrap.querySelector('[role="radiogroup"]');
    if (group) group.setAttribute('aria-invalid', message ? 'true' : 'false');
}

/* ══════════════════════════════════════════════════════════════════════
   RENDERING
═══════════════════════════════════════════════════════════════════════ */

function fieldLabelHtml(field) {
    const req = field.required
        ? ' <span class="ll-req" aria-hidden="true">*</span><span class="ll-sr-only"> (required)</span>'
        : ' <span class="ll-optional">(optional)</span>';
    const sub = field.labelEn && field.labelEn !== field.label
        ? '<span class="ll-label-en">' + escapeHtml(field.labelEn) + '</span>'
        : '';
    return '<span class="ll-label-main">' + escapeHtml(field.label) + req + '</span>' + sub;
}

function renderField(field) {
    const val     = formState.answers[field.id];
    const errId   = 'err-' + field.id;
    const helpId  = 'help-' + field.id;
    const describedBy = (field.help ? helpId + ' ' : '') + errId;
    const help    = field.help
        ? '<p class="ll-field-help" id="' + helpId + '">' + escapeHtml(field.help) + '</p>'
        : '';
    const errNode = '<p class="ll-field-error" id="' + errId + '" role="alert" hidden></p>';

    let control = '';

    switch (field.type) {
        case 'radio': {
            const opts = field.options.map((o, i) => {
                const oid = field.id + '-' + i;
                const checked = val === o.value ? ' checked' : '';
                const sub = o.labelEn && o.labelEn !== o.label
                    ? ' <span class="ll-opt-en">' + escapeHtml(o.labelEn) + '</span>' : '';
                return '<div class="ll-radio">' +
                    '<input type="radio" id="' + oid + '" name="' + field.id + '" value="' +
                        escapeHtml(o.value) + '"' + checked + '>' +
                    '<label for="' + oid + '">' + escapeHtml(o.label) + sub + '</label>' +
                '</div>';
            }).join('');
            // A radio group needs a fieldset/legend, not a <label for>.
            return '<div class="ll-field" data-field="' + field.id + '">' +
                '<fieldset class="ll-fieldset">' +
                    '<legend class="ll-label">' + fieldLabelHtml(field) + '</legend>' +
                    help +
                    '<div class="ll-radio-group" role="radiogroup" aria-describedby="' + describedBy + '">' +
                        opts +
                    '</div>' +
                    errNode +
                '</fieldset>' +
            '</div>';
        }

        case 'consent': {
            const checked = val === true ? ' checked' : '';
            return '<div class="ll-field ll-field-consent" data-field="' + field.id + '">' +
                '<div class="ll-consent">' +
                    '<input type="checkbox" id="' + field.id + '" name="' + field.id + '"' +
                        checked + ' aria-describedby="' + errId + '">' +
                    '<label for="' + field.id + '">' + escapeHtml(field.label) +
                        ' <span class="ll-req" aria-hidden="true">*</span>' +
                        '<span class="ll-sr-only"> (required)</span></label>' +
                '</div>' +
                errNode +
            '</div>';
        }

        case 'select': {
            const opts = ['<option value="" disabled' + (val ? '' : ' selected') + '>Select one…</option>']
                .concat(field.options.map(o =>
                    '<option value="' + escapeHtml(o.value) + '"' +
                    (val === o.value ? ' selected' : '') + '>' + escapeHtml(o.label) + '</option>'
                )).join('');
            control = '<select id="' + field.id + '" name="' + field.id +
                '" aria-describedby="' + describedBy + '">' + opts + '</select>';
            break;
        }

        case 'textarea':
            control = '<textarea id="' + field.id + '" name="' + field.id + '" rows="4"' +
                (field.placeholder ? ' placeholder="' + escapeHtml(field.placeholder) + '"' : '') +
                (field.maxLength ? ' maxlength="' + field.maxLength + '"' : '') +
                ' aria-describedby="' + describedBy + '">' + escapeHtml(val || '') + '</textarea>';
            break;

        default: {
            const attrs = [
                'type="' + (field.type === 'number' ? 'text' : field.type) + '"',
                'id="' + field.id + '"',
                'name="' + field.id + '"',
                'value="' + escapeHtml(val == null ? '' : val) + '"',
                'aria-describedby="' + describedBy + '"'
            ];
            // type=number is deliberately avoided: it brings scroll-wheel
            // mutation and inconsistent mobile keypads. inputmode gets the
            // right keyboard without the drawbacks.
            if (field.inputmode)    attrs.push('inputmode="' + field.inputmode + '"');
            if (field.autocomplete) attrs.push('autocomplete="' + field.autocomplete + '"');
            if (field.placeholder)  attrs.push('placeholder="' + escapeHtml(field.placeholder) + '"');
            if (field.maxLength)    attrs.push('maxlength="' + field.maxLength + '"');
            control = '<input ' + attrs.join(' ') + '>';
        }
    }

    return '<div class="ll-field" data-field="' + field.id + '">' +
        '<label class="ll-label" for="' + field.id + '">' + fieldLabelHtml(field) + '</label>' +
        help + control + errNode +
    '</div>';
}

/* The review step lists every answer captured so far. */
function renderReview() {
    const rows = [];
    LOK_LOVE_FORM_SCHEMA.forEach((step, idx) => {
        if (step.isReview) return;
        const items = step.fields.map(field => {
            let v = formState.answers[field.id];
            if (Array.isArray(v)) v = v.join(', ');
            if (v == null || v === '') v = '—';
            return '<div class="ll-review-row">' +
                '<dt>' + escapeHtml(field.labelEn || field.label) + '</dt>' +
                '<dd>' + escapeHtml(v) + '</dd>' +
            '</div>';
        }).join('');
        rows.push(
            '<div class="ll-review-group">' +
                '<div class="ll-review-head">' +
                    '<h4>' + escapeHtml(step.title) + '</h4>' +
                    '<button type="button" class="ll-review-edit" data-goto="' + idx + '">Edit</button>' +
                '</div>' +
                '<dl class="ll-review-list">' + items + '</dl>' +
            '</div>'
        );
    });
    return '<div class="ll-review">' + rows.join('') + '</div>';
}

function renderStep() {
    const step  = LOK_LOVE_FORM_SCHEMA[formState.step];
    const total = LOK_LOVE_FORM_SCHEMA.length;
    const isLast  = formState.step === total - 1;
    const isFirst = formState.step === 0;

    // Progress bar + step counter
    const pct = Math.round(((formState.step + 1) / total) * 100);
    const bar = el('llProgressBar');
    if (bar) {
        bar.style.width = pct + '%';
        const track = el('llProgressTrack');
        if (track) {
            track.setAttribute('aria-valuenow', String(formState.step + 1));
            track.setAttribute('aria-valuemax', String(total));
            track.setAttribute('aria-valuetext',
                'Step ' + (formState.step + 1) + ' of ' + total + ': ' + step.title);
        }
    }
    const counter = el('llStepCounter');
    if (counter) counter.textContent = 'Step ' + (formState.step + 1) + ' of ' + total;

    const body = el('llStepBody');
    if (!body) return;

    body.innerHTML =
        '<h3 class="ll-step-title">' + escapeHtml(step.title) + '</h3>' +
        (step.blurb ? '<p class="ll-step-blurb">' + escapeHtml(step.blurb) + '</p>' : '') +
        (step.isReview ? renderReview() : '') +
        step.fields.map(renderField).join('');

    // Nav buttons
    const backBtn = el('llBackBtn');
    const nextBtn = el('llNextBtn');
    if (backBtn) backBtn.hidden = isFirst;
    if (nextBtn) {
        nextBtn.textContent = isLast ? 'Submit Application' : 'Continue';
        nextBtn.classList.toggle('ll-btn-submit', isLast);
    }

    bindStepInputs();

    // Move focus to the step heading so screen-reader and keyboard users
    // land in the new content rather than back at the top of the page.
    const heading = body.querySelector('.ll-step-title');
    if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
    }
}

/* Wire inputs of the current step back into formState on every change. */
function bindStepInputs() {
    const step = LOK_LOVE_FORM_SCHEMA[formState.step];

    step.fields.forEach(field => {
        const wrap = document.querySelector('[data-field="' + field.id + '"]');
        if (!wrap) return;

        const commit = (value) => {
            formState.answers[field.id] = value;
            saveDraft();
            // Clear a visible error as soon as the field becomes valid,
            // but never introduce a new error while the user is typing.
            if (wrap.classList.contains('ll-invalid')) {
                const err = validateField(field, value);
                if (!err) setFieldError(field.id, null);
            }
            if (!formState.startedTracked) {
                formState.startedTracked = true;
                trackEvent('lok_love_form_started');
            }
        };

        if (field.type === 'radio') {
            wrap.querySelectorAll('input[type="radio"]').forEach(input => {
                input.addEventListener('change', () => commit(input.value));
            });
        } else if (field.type === 'consent') {
            const box = wrap.querySelector('input[type="checkbox"]');
            if (box) box.addEventListener('change', () => commit(box.checked));
        } else {
            const input = wrap.querySelector('input, select, textarea');
            if (!input) return;
            input.addEventListener('input',  () => commit(input.value));
            input.addEventListener('change', () => commit(input.value));
            // Validate on blur so mistakes surface before the user hits Continue.
            input.addEventListener('blur', () => {
                const v = formState.answers[field.id];
                if (v !== undefined && v !== '') {
                    setFieldError(field.id, validateField(field, v));
                }
            });
        }
    });

    // "Edit" buttons on the review step
    document.querySelectorAll('.ll-review-edit').forEach(btn => {
        btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.goto, 10)));
    });
}

/* ══════════════════════════════════════════════════════════════════════
   STEP NAVIGATION
═══════════════════════════════════════════════════════════════════════ */
function goToStep(index) {
    formState.step = Math.max(0, Math.min(index, LOK_LOVE_FORM_SCHEMA.length - 1));
    saveDraft();
    renderStep();
    const card = el('llFormCard');
    if (card) card.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
}

function nextStep() {
    const { ok, firstInvalidId } = validateStep(formState.step);
    if (!ok) {
        showFormError('Almost there — check the highlighted fields above.');
        const wrap = document.querySelector('[data-field="' + firstInvalidId + '"]');
        if (wrap) {
            wrap.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
            const focusable = wrap.querySelector('input, select, textarea');
            if (focusable) focusable.focus({ preventScroll: true });
        }
        return;
    }
    clearFormError();

    if (formState.step === LOK_LOVE_FORM_SCHEMA.length - 1) {
        submitApplication();
    } else {
        const next = formState.step + 1;
        // Reaching the review step means every question has been answered.
        if (LOK_LOVE_FORM_SCHEMA[next].isReview) {
            trackEvent('lok_love_form_completed');
        }
        goToStep(next);
    }
}

function prevStep() {
    clearFormError();
    goToStep(formState.step - 1);
}

function showFormError(message, html) {
    const box = el('llFormError');
    if (!box) return;
    if (html) box.innerHTML = html;
    else box.textContent = message;
    box.hidden = false;
}
function clearFormError() {
    const box = el('llFormError');
    if (box) { box.hidden = true; box.textContent = ''; }
}

/* ══════════════════════════════════════════════════════════════════════
   SUBMISSION
═══════════════════════════════════════════════════════════════════════ */

function buildPayload() {
    const payload = {};
    allFields().forEach(field => {
        let v = formState.answers[field.id];
        if (typeof v === 'string') v = v.trim();
        if (field.type === 'consent')      v = v === true;
        else if (field.type === 'number')  v = v === '' || v == null ? null : Number(v);
        else if (field.type === 'tel')     v = normaliseWhatsapp(v) || v;
        payload[field.id] = v === undefined ? '' : v;
    });
    return payload;
}

function setSubmitting(isSubmitting) {
    formState.submitting = isSubmitting;
    const nextBtn = el('llNextBtn');
    const backBtn = el('llBackBtn');
    if (nextBtn) {
        nextBtn.disabled  = isSubmitting;
        nextBtn.textContent = isSubmitting ? 'Submitting…' : 'Submit Application';
        nextBtn.setAttribute('aria-busy', isSubmitting ? 'true' : 'false');
    }
    if (backBtn) backBtn.disabled = isSubmitting;
}

async function submitApplication() {
    // Guard against double submits from fast double-taps (PRD §24).
    if (formState.submitting || formState.submitted) return;

    setSubmitting(true);
    clearFormError();

    const payload = buildPayload();

    try {
        /* NOTE ON CONTENT TYPE — do not "fix" this to application/json.
           Apps Script web apps do not answer CORS preflight (OPTIONS)
           requests. Sending text/plain keeps this a CORS "simple request"
           so no preflight is issued; Code.gs JSON.parse()s the raw body. */
        const res = await fetch(LOK_LOVE_CONFIG.apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });

        let data = null;
        try { data = await res.json(); } catch (e) { /* handled below */ }

        if (!res.ok || !data) {
            throw new Error('bad_response');
        }

        if (data.status === 'duplicate') {
            setSubmitting(false);
            showDuplicate();
            return;
        }

        if (data.status !== 'ok' || !data.applicationId) {
            throw new Error(data.message || 'submit_failed');
        }

        formState.submitted = true;
        clearDraft();
        trackEvent('lok_love_application_submitted');
        showSuccess(data.applicationId);

    } catch (err) {
        // The user's answers stay in formState and localStorage, so the
        // form is still fully populated behind this error (PRD §23, §37).
        setSubmitting(false);
        // Technical detail is logged, never shown (PRD §23).
        console.error('[lok-love] submission failed:', err);
        trackEvent('lok_love_application_error');

        const wa = 'https://wa.me/' + LOK_LOVE_CONFIG.whatsappNumber +
            '?text=' + encodeURIComponent(
                "Hi LOK GITEW! I tried to apply for LOK & LOVE but the form wouldn't submit.");
        showFormError(null,
            '<strong>Something went wrong 😭</strong>' +
            '<span>Your application wasn\'t submitted, but nothing you typed is lost. ' +
            'Please try again.</span>' +
            '<span class="ll-error-alt">Still stuck? ' +
                '<a href="' + wa + '" target="_blank" rel="noopener">WhatsApp us instead →</a>' +
            '</span>');
        const nextBtn = el('llNextBtn');
        if (nextBtn) nextBtn.textContent = 'Try Again';
        const box = el('llFormError');
        if (box) box.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
    }
}

function showSuccess(applicationId) {
    const form    = el('llFormCard');
    const success = el('llSuccess');
    if (form)    form.hidden = true;
    if (!success) return;

    const idEl = el('llApplicationId');
    if (idEl) idEl.textContent = applicationId;

    success.hidden = false;
    success.setAttribute('tabindex', '-1');
    success.focus({ preventScroll: true });
    success.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
}

function showDuplicate() {
    const form    = el('llFormCard');
    const dupe    = el('llDuplicate');
    if (form) form.hidden = true;
    if (!dupe) return;

    // Deliberately reveals nothing about the existing application (PRD §18).
    dupe.hidden = false;
    dupe.setAttribute('tabindex', '-1');
    dupe.focus({ preventScroll: true });
    dupe.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
}

/* ══════════════════════════════════════════════════════════════════════
   LANDING PAGE WIRING
═══════════════════════════════════════════════════════════════════════ */

/* Re-render every [data-ll="key"] placeholder from LOK_LOVE_CONFIG so the
   config object stays the single source of truth for event details. */
function applyConfigToPage() {
    document.querySelectorAll('[data-ll]').forEach(node => {
        const key = node.getAttribute('data-ll');
        if (Object.prototype.hasOwnProperty.call(LOK_LOVE_CONFIG, key)) {
            node.textContent = LOK_LOVE_CONFIG[key];
        }
    });
    document.querySelectorAll('[data-ll-href]').forEach(node => {
        const key = node.getAttribute('data-ll-href');
        if (Object.prototype.hasOwnProperty.call(LOK_LOVE_CONFIG, key)) {
            node.setAttribute('href', LOK_LOVE_CONFIG[key]);
        }
    });

    const list = el('llIncludes');
    if (list) {
        list.innerHTML = LOK_LOVE_INCLUDES.map(item =>
            '<li><span class="ll-include-icon" aria-hidden="true">' + item.icon + '</span>' +
            escapeHtml(item.text) + '</li>'
        ).join('');
    }
}

function toggleMenu() {
    const navLinks = el('navLinks');
    if (navLinks) navLinks.classList.toggle('active');
}
window.toggleMenu = toggleMenu;

/* Same lightweight reveal-on-scroll used on the main site. */
function initScrollReveal() {
    const els = Array.from(document.querySelectorAll('.reveal, .title-reveal'));
    if (!els.length) return;
    function check() {
        els.forEach(node => {
            if (node.classList.contains('revealed')) return;
            if (node.getBoundingClientRect().top < window.innerHeight * 0.88) {
                node.classList.add('revealed');
            }
        });
    }
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check, { passive: true });
    setTimeout(check, 150);
}

function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
            const navLinks = el('navLinks');
            if (navLinks) navLinks.classList.remove('active');
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    applyConfigToPage();
    initScrollReveal();
    initSmoothAnchors();

    trackEvent('lok_love_page_view');

    loadDraft();
    renderStep();

    const nextBtn = el('llNextBtn');
    const backBtn = el('llBackBtn');
    if (nextBtn) nextBtn.addEventListener('click', nextStep);
    if (backBtn) backBtn.addEventListener('click', prevStep);

    // Enter inside a single-line input advances the step rather than
    // doing nothing (the form has no native submit button).
    const card = el('llFormCard');
    if (card) {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.matches('input:not([type="checkbox"])')) {
                e.preventDefault();
                nextStep();
            }
        });
    }

    document.querySelectorAll('[data-ll-apply]').forEach(btn => {
        btn.addEventListener('click', () => trackEvent('lok_love_apply_click'));
    });

    // Warn before leaving with a half-finished application.
    window.addEventListener('beforeunload', (e) => {
        const hasAnswers = Object.keys(formState.answers).length > 0;
        if (hasAnswers && !formState.submitted) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
});
