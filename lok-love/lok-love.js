/* ════════════════════════════════════════════════════════════════════════
   LOK & LOVE — Application form
   ------------------------------------------------------------------------
   The form is SCHEMA-DRIVEN. Every question lives in LOK_LOVE_FORM_SCHEMA
   below; the step renderer, validation, review screen and the JSON payload
   are all generated from it.

   To add / change / remove a question, edit the schema only. Do not hand-
   edit the form markup — it does not exist as markup.

   Each field's `id` is also its key in the API payload. Keep those in
   sync with docs/lok-love/question-mapping.md and the column list in
   POSGitew's server/modules/lok-love/ — applications are stored there,
   and reviewed in the POS admin dashboard.
════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── Event configuration ───────────────────────────────────────────────
   Single source of truth for event details (PRD §35). The landing-page
   markup ships with these same values as static text so the page is
   correct for crawlers and without JS; on load we re-render every
   [data-ll] placeholder from this object, so THIS is authoritative. */
const LOK_LOVE_CONFIG = {
    eventName:            'LOK & LOVE',
    editionLabel:         '6×6 — Makan Malam Khusus Para Lajang',
    eventDate:            'Sabtu, 19 September 2026',
    eventDateISO:         '2026-09-19',
    eventTime:            '19.00 – 21.00 WIB',
    venue:                'LOK GITEW',
    address:              'Ruko Hampton Promenade Blok M No. 18, Medang, Kec. Pagedangan, Kab. Tangerang, Banten 15334',
    mapsUrl:              'https://www.google.com/maps/search/?api=1&query=LOK%20GITEW%20Hampton%20Promenade%20Serpong',
    ticketPrice:          'Rp199.000',
    ticketPriceNote:      'per orang',
    maxMaleParticipants:  6,
    maxFemaleParticipants: 6,
    totalParticipants:    12,
    minimumAge:           21,
    applicationDeadline:  'Jumat, 11 September 2026',
    announcementNote:     'Pendaftar terpilih dihubungi lewat WhatsApp.',
    paymentWindowHours:   24,
    whatsappNumber:       '6285122333769',
    // POSGitew intake endpoint, behind the shared GitewOS gateway.
    // Applications land in Postgres and are triaged in the POS admin
    // dashboard under the "Lok & Love" tab.
    apiEndpoint:          'https://lokgitew.gitew.com/pos/api/lok-love/apply',

    /* The gateway routes public requests to a specific outlet and rejects
       them with 400 "Outlet is required" without one. It reads ?outlet=
       (also an X-Outlet-Code header, or outletCode in the body), and the
       POS server strips the parameter again before the route sees it.
       The key must match an available outlet in the POS database — the
       outlet picker on the POS login screen lists the valid values. */
    outletKey:            'lg-ha-01'
};

/* ── Ticket inclusions (landing page) ─────────────────────────────────── */
const LOK_LOVE_INCLUDES = [
    { icon: '🍚', text: 'Satu rice bowl LokGitew' },
    { icon: '🥤', text: 'Satu welcome drink' },
    { icon: '💬', text: 'Sesi mini date' },
    { icon: '🎲', text: 'Permainan dan aktivitas kelompok' },
    { icon: '💌', text: 'Proses matching setelah acara' }
];

/* ── Form schema ───────────────────────────────────────────────────────
   STEP 1 is transcribed verbatim from the live Google Form (page 1).
   Do not reword those nine questions without organiser approval.

   Steps 2–4 were designed for this form. The Google Form had taken no
   responses, so the organisers cleared us to write them from scratch
   rather than mirror the old pages; they follow the PRD's groupings and
   the selection criteria the event itself publishes — usia, kepribadian,
   minat, preferensi pasangan.

   Question wording is Indonesian throughout, matching the rest of the
   site.                                                                  */
const LOK_LOVE_FORM_SCHEMA = [
    {
        id: 'about-you',
        title: 'Tentang Kamu',
        blurb: 'Dasar-dasarnya dulu — biar kami tahu kamu siapa.',
        fields: [
            {
                id: 'name',
                label: 'Nama lengkap',
                type: 'text',
                required: true,
                autocomplete: 'name',
                placeholder: 'mis. Putri Ananda',
                maxLength: 100
            },
            {
                id: 'age',
                label: 'Usia',
                type: 'number',
                required: true,
                min: LOK_LOVE_CONFIG.minimumAge,
                max: 99,
                inputmode: 'numeric',
                placeholder: '21',
                help: 'Usia minimal ' + LOK_LOVE_CONFIG.minimumAge + ' tahun untuk ikut.'
            },
            {
                id: 'gender',
                label: 'Jenis kelamin',
                type: 'radio',
                required: true,
                options: [
                    { value: 'Pria',   label: 'Pria' },
                    { value: 'Wanita', label: 'Wanita' }
                ]
            },
            {
                id: 'lookingToMeet',
                label: 'Siapa yang ingin kamu temui dalam acara ini?',
                type: 'radio',
                required: true,
                options: [
                    { value: 'Pria',   label: 'Pria' },
                    { value: 'Wanita', label: 'Wanita' }
                ]
            },
            {
                id: 'city',
                label: 'Kota atau daerah tempat tinggal saat ini',
                type: 'text',
                required: true,
                placeholder: 'mis. Serpong, Tangerang',
                maxLength: 120
            },
            {
                id: 'occupation',
                label: 'Pekerjaan atau aktivitas saat ini',
                type: 'text',
                required: true,
                placeholder: 'mis. Desainer grafis',
                maxLength: 120
            },
            {
                id: 'whatsapp',
                label: 'Nomor WhatsApp',
                type: 'tel',
                required: true,
                autocomplete: 'tel',
                inputmode: 'tel',
                placeholder: '08xx xxxx xxxx',
                help: 'Lewat nomor ini kami hubungi kamu kalau terpilih.'
            },
            {
                id: 'socialHandle',
                label: 'Username Instagram/TikTok',
                type: 'text',
                required: true,
                placeholder: '@usernamekamu',
                maxLength: 80
            },
            {
                id: 'email',
                label: 'Alamat email',
                type: 'email',
                required: true,
                autocomplete: 'email',
                placeholder: 'kamu@email.com',
                maxLength: 160
            }
        ]
    },

    {
        id: 'your-vibe',
        title: 'Vibe Kamu',
        blurb: 'Ini yang kami pakai buat nyusun meja yang nyambung.',
        fields: [
            {
                id: 'personality',
                label: 'Kepribadian kamu',
                type: 'radio',
                required: true,
                options: [
                    { value: 'Sangat introvert',    label: 'Sangat introvert' },
                    { value: 'Cenderung introvert', label: 'Cenderung introvert' },
                    { value: 'Di antara keduanya',  label: 'Di antara keduanya' },
                    { value: 'Cenderung ekstrovert',label: 'Cenderung ekstrovert' },
                    { value: 'Sangat ekstrovert',   label: 'Sangat ekstrovert' }
                ]
            },
            {
                id: 'interests',
                label: 'Minat & hobi',
                type: 'checkbox',
                required: true,
                maxSelections: 6,
                help: 'Pilih maksimal 6 — ini bantu kami mendudukkan kamu dekat orang yang nyambung.',
                options: [
                    { value: 'Kuliner & jajan',      label: 'Kuliner & jajan' },
                    { value: 'Musik',                label: 'Musik' },
                    { value: 'Film & series',        label: 'Film & series' },
                    { value: 'Olahraga & gym',       label: 'Olahraga & gym' },
                    { value: 'Traveling',            label: 'Traveling' },
                    { value: 'Gaming',               label: 'Gaming' },
                    { value: 'Seni & desain',        label: 'Seni & desain' },
                    { value: 'Membaca',              label: 'Membaca' },
                    { value: 'Fotografi',            label: 'Fotografi' },
                    { value: 'Fashion',              label: 'Fashion' },
                    { value: 'Nongkrong di kafe',    label: 'Nongkrong di kafe' },
                    { value: 'Alam & hiking',        label: 'Alam & hiking' },
                    { value: 'Konser & live music',  label: 'Konser & live music' },
                    { value: 'Otomotif',             label: 'Otomotif' },
                    { value: 'Bisnis & startup',     label: 'Bisnis & startup' },
                    { value: 'Hewan peliharaan',     label: 'Hewan peliharaan' }
                ]
            },
            {
                id: 'weekendVibe',
                label: 'Akhir pekan idealmu',
                type: 'select',
                required: true,
                options: [
                    { value: 'Nongkrong di kafe',            label: 'Nongkrong di kafe' },
                    { value: 'Petualangan di luar ruangan',  label: 'Petualangan di luar ruangan' },
                    { value: 'Santai di rumah',              label: 'Santai di rumah' },
                    { value: 'Keluar malam & live music',    label: 'Keluar malam & live music' },
                    { value: 'Coba tempat makan baru',       label: 'Coba tempat makan baru' },
                    { value: 'Olahraga atau gym',            label: 'Olahraga atau gym' },
                    { value: 'Ngerjain hobi atau proyek',    label: 'Ngerjain hobi atau proyek' }
                ]
            },
            {
                id: 'selfDescription',
                label: 'Ceritakan sedikit tentang dirimu',
                type: 'textarea',
                required: true,
                maxLength: 300,
                placeholder: 'Kerja di bidang apa, lagi suka apa, hal random yang bikin kamu semangat…',
                help: 'Beberapa kalimat aja cukup. Tulis santai kayak kamu ngomong.'
            }
        ]
    },

    {
        id: 'looking-for',
        title: 'Yang Kamu Cari',
        blurb: 'Nggak ada jawaban salah — ini cuma bantu kami masangin kamu dengan pas.',
        fields: [
            {
                id: 'intention',
                label: 'Apa yang kamu cari di acara ini?',
                type: 'radio',
                required: true,
                options: [
                    { value: 'Hubungan serius',                    label: 'Hubungan serius' },
                    { value: 'Kenalan dulu, lihat ke mana arahnya',label: 'Kenalan dulu, lihat ke mana arahnya' },
                    { value: 'Teman baru & memperluas relasi',     label: 'Teman baru & memperluas relasi' },
                    { value: 'Belum tahu, mau coba dulu',          label: 'Belum tahu, mau coba dulu' }
                ]
            },
            {
                id: 'preferredAgeRange',
                label: 'Rentang usia yang kamu harapkan',
                type: 'select',
                required: true,
                options: [
                    { value: '21–25',          label: '21–25' },
                    { value: '24–30',          label: '24–30' },
                    { value: '28–35',          label: '28–35' },
                    { value: '33–40',          label: '33–40' },
                    { value: '40+',            label: '40+' },
                    { value: 'Tidak masalah',  label: 'Tidak masalah' }
                ]
            },
            {
                id: 'valuedQualities',
                label: 'Kualitas yang paling kamu cari',
                type: 'checkbox',
                required: true,
                maxSelections: 3,
                help: 'Pilih 3 teratas kamu.',
                options: [
                    { value: 'Humoris',              label: 'Humoris' },
                    { value: 'Cerdas',               label: 'Cerdas' },
                    { value: 'Penyayang',            label: 'Penyayang' },
                    { value: 'Ambisius',             label: 'Ambisius' },
                    { value: 'Mandiri',              label: 'Mandiri' },
                    { value: 'Petualang',            label: 'Petualang' },
                    { value: 'Tenang & sabar',       label: 'Tenang & sabar' },
                    { value: 'Kreatif',              label: 'Kreatif' },
                    { value: 'Aktif & sporty',       label: 'Aktif & sporty' },
                    { value: 'Religius',             label: 'Religius' },
                    { value: 'Pendengar yang baik',  label: 'Pendengar yang baik' }
                ]
            },
            {
                id: 'dealBreakers',
                label: 'Hal yang kurang cocok buatmu',
                type: 'checkbox',
                required: false,
                help: 'Opsional — kosongin aja kalau nggak ada yang mengganggu buat kamu.',
                options: [
                    { value: 'Merokok',                    label: 'Merokok' },
                    { value: 'Sering minum alkohol',       label: 'Sering minum alkohol' },
                    { value: 'Tidak suka hewan peliharaan',label: 'Tidak suka hewan peliharaan' },
                    { value: 'Jarang komunikasi',          label: 'Jarang komunikasi' },
                    { value: 'Beda prinsip agama',         label: 'Beda prinsip agama' }
                ]
            }
        ]
    },

    {
        id: 'event-details',
        title: 'Detail Acara',
        blurb: 'Terakhir — hal teknis biar malamnya lancar.',
        fields: [
            {
                id: 'availability',
                label: 'Bisa hadir pada ' + LOK_LOVE_CONFIG.eventDate + ', ' + LOK_LOVE_CONFIG.eventTime + '?',
                type: 'radio',
                required: true,
                options: [
                    { value: 'Ya, saya bisa hadir',      label: 'Ya, saya bisa hadir' },
                    { value: 'Belum pasti',              label: 'Belum pasti' },
                    { value: 'Tidak bisa di tanggal ini',label: 'Tidak bisa di tanggal ini' }
                ]
            },
            {
                id: 'dietary',
                label: 'Preferensi makanan atau alergi',
                type: 'checkbox',
                required: true,
                help: 'Pilih "Tidak ada" kalau nggak ada — rice bowl kamu tergantung ini.',
                options: [
                    { value: 'Tidak ada',        label: 'Tidak ada' },
                    { value: 'Halal',            label: 'Halal' },
                    { value: 'Vegetarian',       label: 'Vegetarian' },
                    { value: 'Vegan',            label: 'Vegan' },
                    { value: 'Tidak makan pedas',label: 'Tidak makan pedas' },
                    { value: 'Alergi seafood',   label: 'Alergi seafood' },
                    { value: 'Alergi kacang',    label: 'Alergi kacang' },
                    { value: 'Lainnya',          label: 'Lainnya' }
                ]
            },
            {
                id: 'dietaryNotes',
                label: 'Detail alergi atau catatan makanan',
                type: 'text',
                required: false,
                maxLength: 200,
                placeholder: 'Alergi udang, nggak makan sapi, dll.'
            },
            {
                id: 'hearAboutUs',
                label: 'Dari mana kamu tahu acara ini?',
                type: 'select',
                required: true,
                options: [
                    { value: 'Instagram',                  label: 'Instagram' },
                    { value: 'TikTok',                     label: 'TikTok' },
                    { value: 'Teman',                      label: 'Teman' },
                    { value: 'Pernah datang ke LokGitew',  label: 'Pernah datang ke LokGitew' },
                    { value: 'Lainnya',                    label: 'Lainnya' }
                ]
            },
            {
                id: 'additionalInfo',
                label: 'Ada hal lain yang perlu kami tahu?',
                type: 'textarea',
                required: false,
                maxLength: 400,
                placeholder: 'Opsional — apa pun yang menurutmu penting.'
            }
        ]
    },

    {
        id: 'confirm',
        title: 'Cek & Kirim',
        blurb: 'Cek sekali lagi sebelum dikirim.',
        isReview: true,
        fields: [
            {
                id: 'consentAccurate',
                type: 'consent',
                required: true,
                label: 'Semua yang saya isi di sini benar dan akurat.'
            },
            {
                id: 'consentSelection',
                type: 'consent',
                required: true,
                label: 'Saya paham bahwa mendaftar tidak menjamin dapat tempat, dan peserta dipilih oleh tim LOK GITEW.'
            },
            {
                id: 'consentContact',
                type: 'consent',
                required: true,
                label: 'LOK GITEW boleh menghubungi saya lewat WhatsApp atau email terkait acara ini.'
            },
            {
                id: 'consentPrivacy',
                type: 'consent',
                required: true,
                label: 'Saya setuju data yang saya kirim dipakai untuk meninjau pendaftaran saya, dan kontak saya tidak dibagikan ke peserta lain tanpa persetujuan saya.'
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

/* Has the Apps Script endpoint actually been deployed and filled in?
   Until it has, the form can be walked but not submitted — see
   applySoftLaunchState(). This reverts to normal behaviour on its own the
   moment a real /exec URL is set in LOK_LOVE_CONFIG; there is nothing to
   undo at launch. */
function isEndpointConfigured() {
    const url = String(LOK_LOVE_CONFIG.apiEndpoint || '');
    return url.indexOf('REPLACE_WITH') === -1 && /^https:\/\/\S+$/.test(url);
}
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
        return value === true ? null : 'Centang kotak ini dulu untuk lanjut.';
    }
    if (field.required && isBlank) {
        return field.type === 'checkbox' ? 'Pilih minimal satu.' : 'Yang ini wajib diisi.';
    }
    if (isBlank) return null; // optional + empty is fine

    if (field.type === 'checkbox') {
        const picked = Array.isArray(value) ? value : [];
        if (field.maxSelections && picked.length > field.maxSelections) {
            return 'Maksimal ' + field.maxSelections + ' pilihan ya.';
        }
        const allowed = field.options.map(o => o.value);
        if (picked.some(v => allowed.indexOf(v) === -1)) {
            return 'Pilih dari opsi yang tersedia ya.';
        }
        return null;
    }

    switch (field.type) {
        case 'number': {
            const n = Number(value);
            if (!Number.isFinite(n)) return 'Masukkan angka ya.';
            if (field.min != null && n < field.min) {
                return field.id === 'age'
                    ? 'Usia minimal ' + field.min + ' tahun untuk ikut LOK & LOVE.'
                    : 'Minimal ' + field.min + '.';
            }
            if (field.max != null && n > field.max) return 'Maksimal ' + field.max + '.';
            break;
        }
        case 'tel':
            if (!normaliseWhatsapp(value)) {
                return 'Masukkan nomor Indonesia yang valid, mis. 0812 3456 7890.';
            }
            break;
        case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim())) {
                return 'Masukkan alamat email yang valid.';
            }
            break;
        case 'radio':
        case 'select':
            if (!field.options.some(o => o.value === value)) {
                return 'Pilih salah satu opsi ya.';
            }
            break;
    }
    if (field.maxLength && String(value).length > field.maxLength) {
        return 'Maksimal ' + field.maxLength + ' karakter ya.';
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
        ? ' <span class="ll-req" aria-hidden="true">*</span><span class="ll-sr-only"> (wajib diisi)</span>'
        : ' <span class="ll-optional">(opsional)</span>';
    return '<span class="ll-label-main">' + escapeHtml(field.label) + req + '</span>';
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
                return '<div class="ll-radio">' +
                    '<input type="radio" id="' + oid + '" name="' + field.id + '" value="' +
                        escapeHtml(o.value) + '"' + checked + '>' +
                    '<label for="' + oid + '">' + escapeHtml(o.label) + '</label>' +
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

        case 'checkbox': {
            // Multi-select. Value is an array of the chosen option values.
            const chosen = Array.isArray(val) ? val : [];
            const opts = field.options.map((o, i) => {
                const oid = field.id + '-' + i;
                const checked = chosen.indexOf(o.value) !== -1 ? ' checked' : '';
                return '<div class="ll-check">' +
                    '<input type="checkbox" id="' + oid + '" name="' + field.id + '" value="' +
                        escapeHtml(o.value) + '"' + checked + '>' +
                    '<label for="' + oid + '">' + escapeHtml(o.label) + '</label>' +
                '</div>';
            }).join('');
            const counter = field.maxSelections
                ? '<p class="ll-check-count" id="count-' + field.id + '" aria-live="polite">' +
                      chosen.length + ' dari ' + field.maxSelections + ' dipilih</p>'
                : '';
            return '<div class="ll-field" data-field="' + field.id + '">' +
                '<fieldset class="ll-fieldset">' +
                    '<legend class="ll-label">' + fieldLabelHtml(field) + '</legend>' +
                    help +
                    '<div class="ll-check-group" role="group" aria-describedby="' + describedBy + '">' +
                        opts +
                    '</div>' +
                    counter +
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
                        '<span class="ll-sr-only"> (wajib diisi)</span></label>' +
                '</div>' +
                errNode +
            '</div>';
        }

        case 'select': {
            const opts = ['<option value="" disabled' + (val ? '' : ' selected') + '>Pilih salah satu…</option>']
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
                '<dt>' + escapeHtml(field.label) + '</dt>' +
                '<dd>' + escapeHtml(v) + '</dd>' +
            '</div>';
        }).join('');
        rows.push(
            '<div class="ll-review-group">' +
                '<div class="ll-review-head">' +
                    '<h4>' + escapeHtml(step.title) + '</h4>' +
                    '<button type="button" class="ll-review-edit" data-goto="' + idx + '">Ubah</button>' +
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
                'Langkah ' + (formState.step + 1) + ' dari ' + total + ': ' + step.title);
        }
    }
    const counter = el('llStepCounter');
    if (counter) counter.textContent = 'Langkah ' + (formState.step + 1) + ' dari ' + total;

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
        nextBtn.textContent = isLast ? 'Kirim Pendaftaran' : 'Lanjut';
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
        } else if (field.type === 'checkbox') {
            const boxes = Array.from(wrap.querySelectorAll('input[type="checkbox"]'));
            const counter = wrap.querySelector('.ll-check-count');
            const sync = () => {
                const chosen = boxes.filter(b => b.checked).map(b => b.value);
                const atCap = field.maxSelections && chosen.length >= field.maxSelections;
                // Grey out the unpicked options once the cap is reached, rather
                // than letting the user pick a 4th and then scolding them.
                boxes.forEach(b => {
                    b.disabled = atCap && !b.checked;
                    b.closest('.ll-check').classList.toggle('ll-check-disabled', b.disabled);
                });
                if (counter) {
                    counter.textContent = chosen.length + ' dari ' + field.maxSelections + ' dipilih';
                }
                commit(chosen);
            };
            boxes.forEach(b => b.addEventListener('change', sync));
            // Apply the cap to a restored draft on first render too.
            if (field.maxSelections) sync();
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
        showFormError('Dikit lagi — cek bagian yang ditandai di atas ya.');
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

        // A field's payload type must not depend on whether the applicant
        // happened to touch it: an untouched multi-select is [], not ''.
        if (field.type === 'checkbox')     v = Array.isArray(v) ? v : [];
        else if (field.type === 'consent') v = v === true;
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
        nextBtn.textContent = isSubmitting ? 'Mengirim…' : 'Kirim Pendaftaran';
        nextBtn.setAttribute('aria-busy', isSubmitting ? 'true' : 'false');
    }
    if (backBtn) backBtn.disabled = isSubmitting;
}

async function submitApplication() {
    // Guard against double submits from fast double-taps (PRD §24).
    if (formState.submitting || formState.submitted) return;

    // Soft launch: the page is live but the intake endpoint is not deployed
    // yet. Say so plainly instead of firing a request that can only fail and
    // showing the applicant a generic "something went wrong".
    if (!isEndpointConfigured()) {
        showNotOpenYet();
        return;
    }

    setSubmitting(true);
    clearFormError();

    const payload = buildPayload();

    try {
        /* The POS gateway parses application/json and answers the CORS
           preflight, the same path the reservation form already uses. */
        const endpoint = LOK_LOVE_CONFIG.apiEndpoint +
            (LOK_LOVE_CONFIG.apiEndpoint.indexOf('?') === -1 ? '?' : '&') +
            'outlet=' + encodeURIComponent(LOK_LOVE_CONFIG.outletKey);

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
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
                'Halo LOK GITEW! Saya coba daftar LOK & LOVE tapi formulirnya nggak bisa terkirim.');
        showFormError(null,
            '<strong>Ada yang error 😭</strong>' +
            '<span>Pendaftaran kamu belum terkirim, tapi semua yang kamu isi masih aman. ' +
            'Coba lagi ya.</span>' +
            '<span class="ll-error-alt">Masih gagal? ' +
                '<a href="' + wa + '" target="_blank" rel="noopener">Langsung WhatsApp kami →</a>' +
            '</span>');
        const nextBtn = el('llNextBtn');
        if (nextBtn) nextBtn.textContent = 'Coba Lagi';
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

/* Shown instead of the success/error screens while the endpoint is unset.
   The applicant's answers stay in the draft, so when applications do open
   they can come back and submit without retyping. */
function showNotOpenYet() {
    const form = el('llFormCard');
    const panel = el('llNotOpen');
    if (form) form.hidden = true;
    if (!panel) return;

    saveDraft();
    panel.hidden = false;
    panel.setAttribute('tabindex', '-1');
    panel.focus({ preventScroll: true });
    panel.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
}

/* Banner above the form during soft launch, so nobody spends three minutes
   filling it in before discovering it cannot be sent. */
function applySoftLaunchState() {
    if (isEndpointConfigured()) return;
    const banner = el('llSoftLaunch');
    if (banner) banner.hidden = false;
    const nextBtn = el('llNextBtn');
    if (nextBtn) nextBtn.dataset.softLaunch = 'true';
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
    applySoftLaunchState();

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
