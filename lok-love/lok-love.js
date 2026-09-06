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
    /* One age, everywhere: the landing page copy, the age field's floor
       and the final confirmation clause all read from this. The question
       sheet originally gave 18 in the age question and 21 in the
       confirmation; the organisers settled it at 19 (6 September 2026).
       Keep POSGitew's LOK_LOVE_MINIMUM_AGE in step — it is the authority,
       this copy is only for fast feedback. */
    minimumAge:           19,
    applicationDeadline:  'Jumat, 11 September 2026',
    announcementNote:     'Pendaftar terpilih dihubungi lewat WhatsApp.',
    paymentWindowHours:   24,
    whatsappNumber:       '6285122333769',
    // POSGitew intake endpoint, behind the shared GitewOS gateway.
    // Applications land in Postgres and are triaged in the POS admin
    // dashboard under the "Lok & Love" tab.
    apiEndpoint:          'https://lokgitew.gitew.com/pos/api/lok-love/apply',

    /* The gateway routes public requests to a specific outlet and rejects
       them without one — 400 "Outlet is required", or 403 "Outlet
       unavailable" if the key is not an active outlet. It reads ?outlet=,
       and the POS server strips the parameter again before the route sees
       it.

       Left blank on purpose: the key is looked up at submit time from the
       gateway's own public outlet list, so it cannot drift out of sync
       with the POS. Set it to pin a specific outlet instead. */
    outletKey:            'LG-HA-01',
    outletsEndpoint:      'https://lokgitew.gitew.com/pos/api/v1/auth/outlets'
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
   Transcribed from the organisers' question sheet: 23 questions across
   four sections. Wording is theirs — do not reword a question, an option
   or a consent clause without their approval. The consent text in the
   final section is what applicants are held to, so it is reproduced
   exactly.

   Two questions capture two answers each and carry a composite type:
   `social` (socialPlatform + socialHandle) and `agerange`
   (preferredAgeMin + preferredAgeMax). Those sub-keys, not the field id,
   are what reach the payload.                                            */
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
                help: 'Minimal ' + LOK_LOVE_CONFIG.minimumAge + ' tahun.'
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
                /* One question, two answers: the platform and the handle
                   travel together as socialPlatform + socialHandle. */
                id: 'social',
                label: 'Drop your social 👀',
                type: 'social',
                required: true,
                help: 'Username Instagram atau TikTok yang paling sering kamu pakai.',
                platformField: 'socialPlatform',
                handleField: 'socialHandle',
                handleMaxLength: 80,
                platformOptions: [
                    { value: 'Instagram', label: 'Instagram' },
                    { value: 'TikTok',    label: 'TikTok' }
                ],
                note: 'Wajib menggunakan akun yang bersifat publik (tidak di-private).',
                body: [
                    'Akun ini digunakan oleh tim LokGitew sebagai salah satu referensi dalam proses seleksi dan matching. Kami tidak akan mempublikasikan atau membagikan akunmu kepada peserta lain tanpa persetujuan.'
                ]
            },
            {
                /* Not on the organisers' sheet; added back at their request
                   (6 September 2026) as a second contact channel. It is also
                   the second key duplicate detection matches on, alongside
                   the WhatsApp number. */
                id: 'email',
                label: 'Alamat email',
                type: 'email',
                required: true,
                autocomplete: 'email',
                inputmode: 'email',
                placeholder: 'kamu@email.com',
                maxLength: 160,
                help: 'Kami pakai ini sebagai cadangan kalau WhatsApp kamu nggak bisa dihubungi.'
            }
        ]
    },

    {
        id: 'your-vibe',
        title: 'Your Vibe',
        blurb: 'Ini yang kami pakai buat nyusun meja yang nyambung.',
        fields: [
            {
                id: 'relationshipStatus',
                label: 'Apakah kamu saat ini sedang lajang?',
                type: 'radio',
                required: true,
                options: [
                    { value: 'Ya',                  label: 'Ya' },
                    { value: 'Tidak',               label: 'Tidak' },
                    { value: 'Status saya rumit',   label: 'Status saya rumit' }
                ]
            },
            {
                /* One question, two answers: preferredAgeMin + preferredAgeMax. */
                id: 'preferredAge',
                label: 'Rentang usia berapa yang ingin kamu temui?',
                type: 'agerange',
                required: true,
                minField: 'preferredAgeMin',
                maxField: 'preferredAgeMax',
                minLabel: 'Usia minimum',
                maxLabel: 'Usia maksimum',
                floor: LOK_LOVE_CONFIG.minimumAge,
                ceiling: 99
            },
            {
                id: 'ageFlexibility',
                label: 'Seberapa fleksibel dengan rentang usia pilihanmu?',
                type: 'radio',
                required: true,
                options: [
                    { value: 'Saya ingin tetap di dalam rentang usia pilihan saya',
                      label: 'Saya ingin tetap di dalam rentang usia pilihan saya' },
                    { value: 'Saya masih terbuka sedikit di luar rentang tersebut',
                      label: 'Saya masih terbuka sedikit di luar rentang tersebut' },
                    { value: 'Tergantung orangnya 👀',
                      label: 'Tergantung orangnya 👀' }
                ]
            },
            {
                id: 'selfDescription',
                label: 'Ceritakan sedikit tentang dirimu.',
                type: 'textarea',
                required: true,
                maxLength: 600,
                placeholder: 'Kepribadian, lifestyle, hobi, pekerjaan, hal yang kamu suka…',
                help: 'Kepribadian, lifestyle, hobi, pekerjaan, hal yang kamu suka, atau apa pun yang menurutmu menarik.'
            },
            {
                id: 'socialStyle',
                label: 'Kalau soal bersosialisasi, kamu lebih seperti…',
                type: 'radio',
                required: true,
                options: [
                    { value: 'Gampang ngobrol sama siapa aja',
                      label: '🗣️ Gampang ngobrol sama siapa aja' },
                    { value: 'Awalnya agak malu, tapi cepat cair',
                      label: '🙂 Awalnya agak malu, tapi cepat cair' },
                    { value: 'Tergantung situasi',
                      label: '⚖️ Tergantung situasi' },
                    { value: 'Lebih nyaman ngobrol one-on-one',
                      label: '🌱 Lebih nyaman ngobrol one-on-one' },
                    { value: 'Cenderung pendiam dan butuh waktu untuk nyaman',
                      label: '🙈 Cenderung pendiam dan butuh waktu untuk nyaman' }
                ]
            },
            {
                id: 'valuedQualities',
                label: 'Apa yang paling kamu cari dari seseorang?',
                type: 'checkbox',
                required: true,
                maxSelections: 3,
                help: 'Pilih maksimal 3.',
                options: [
                    { value: 'Sense of humor',       label: 'Sense of humor' },
                    { value: 'Nyambung diajak ngobrol', label: 'Nyambung diajak ngobrol' },
                    { value: 'Kind / penyayang',     label: 'Kind / penyayang' },
                    { value: 'Ambisius',             label: 'Ambisius' },
                    { value: 'Family-oriented',      label: 'Family-oriented' },
                    { value: 'Easy-going',           label: 'Easy-going' },
                    { value: 'Adventurous',          label: 'Adventurous' },
                    { value: 'Intelligent',          label: 'Intelligent' },
                    { value: 'Confident',            label: 'Confident' },
                    { value: 'Good communication',   label: 'Good communication' },
                    { value: 'Religious / spiritual',label: 'Religious / spiritual' },
                    { value: 'Lainnya',              label: 'Lainnya' }
                ]
            }
        ]
    },

    {
        id: 'the-night',
        title: 'The Night',
        blurb: 'Hal teknis biar malamnya lancar.',
        fields: [
            {
                id: 'availability',
                label: 'Bisa mengikuti acara dari jam 19.00 sampai selesai?',
                type: 'radio',
                required: true,
                help: 'Karena setiap peserta akan mengikuti seluruh rangkaian mini date dan aktivitas, kehadiran penuh sangat penting.',
                options: [
                    { value: 'Ya, pasti',                  label: 'Ya, pasti' },
                    { value: 'Kemungkinan terlambat',      label: 'Kemungkinan terlambat' },
                    { value: 'Kemungkinan pulang lebih awal', label: 'Kemungkinan pulang lebih awal' },
                    { value: 'Belum yakin',                label: 'Belum yakin' }
                ]
            },
            {
                id: 'dietary',
                label: 'Ada alergi makanan atau pantangan tertentu?',
                type: 'text',
                required: true,
                maxLength: 200,
                placeholder: 'mis. Alergi seafood',
                help: 'Jika tidak ada, tulis "Tidak ada".'
            },
            {
                id: 'photoConsent',
                label: 'Bersedia difoto atau direkam selama acara?',
                type: 'radio',
                required: true,
                help: 'Dokumentasi dapat digunakan untuk kebutuhan dokumentasi dan promosi LokGitew. Jawaban ini tidak akan memengaruhi proses seleksi.',
                options: [
                    { value: 'Ya, saya bersedia difoto dan direkam',
                      label: 'Ya, saya bersedia difoto dan direkam' },
                    { value: 'Saya hanya bersedia difoto',
                      label: 'Saya hanya bersedia difoto' },
                    { value: 'Saya hanya bersedia berada dalam foto kelompok',
                      label: 'Saya hanya bersedia berada dalam foto kelompok' },
                    { value: 'Tidak, mohon jangan mengambil foto atau video saya',
                      label: 'Tidak, mohon jangan mengambil foto atau video saya' }
                ]
            },
            {
                id: 'hearAboutUs',
                label: 'Kamu tahu 6×6 dari mana?',
                type: 'radio',
                required: true,
                options: [
                    { value: 'Instagram', label: 'Instagram' },
                    { value: 'TikTok',    label: 'TikTok' },
                    { value: 'WhatsApp',  label: 'WhatsApp' },
                    { value: 'Teman',     label: 'Teman' },
                    { value: 'Lok Gitew', label: 'Lok Gitew' },
                    { value: 'Lainnya',   label: 'Lainnya' }
                ]
            }
        ]
    },

    {
        id: 'final-check',
        title: 'Final Check',
        blurb: 'Cek sekali lagi sebelum dikirim.',
        isReview: true,
        fields: [
            {
                id: 'consentPayment',
                type: 'consent',
                required: true,
                heading: 'Persetujuan Pembayaran & Pembatalan',
                body: [
                    'Saya memahami bahwa mengisi formulir ini tidak menjamin saya akan terpilih sebagai peserta.',
                    'Jika terpilih, saya bersedia melakukan pembayaran penuh sebesar ' +
                        LOK_LOVE_CONFIG.ticketPrice + ' dalam waktu ' +
                        LOK_LOVE_CONFIG.paymentWindowHours +
                        ' jam setelah menerima undangan untuk mengamankan tempat.',
                    'Saya memahami bahwa pembayaran tidak dapat dikembalikan apabila saya membatalkan kehadiran dalam waktu 48 jam sebelum acara.',
                    'Saya memahami bahwa pembayaran akan dikembalikan sepenuhnya apabila acara dibatalkan oleh LokGitew.',
                    'Saya bersedia segera memberi tahu penyelenggara apabila saya tidak dapat menghadiri acara.'
                ],
                label: 'Saya telah membaca, memahami, dan menyetujui ketentuan pembayaran dan pembatalan di atas.'
            },
            {
                id: 'consentPrivacy',
                type: 'consent',
                required: true,
                heading: 'Persetujuan Privasi',
                body: [
                    'Data yang saya berikan melalui formulir ini dapat digunakan oleh LokGitew untuk proses seleksi, matching, komunikasi, dan kebutuhan operasional terkait acara 6×6.',
                    'Saya memahami bahwa data pribadi saya tidak akan dipublikasikan atau diberikan kepada peserta lain tanpa persetujuan saya.'
                ],
                label: 'Saya menyetujui penggunaan data saya untuk keperluan 6×6.'
            },
            {
                id: 'conductRespect',
                type: 'consent',
                required: true,
                heading: 'Persetujuan Perilaku Peserta',
                label: 'Saya bersedia berkomunikasi dengan sopan dan menghormati seluruh peserta serta staf.'
            },
            {
                id: 'conductHarassment',
                type: 'consent',
                required: true,
                label: 'Saya memahami bahwa pelecehan, kontak fisik tanpa persetujuan, perilaku agresif, dan ucapan diskriminatif tidak diperbolehkan.'
            },
            {
                id: 'conductRejection',
                type: 'consent',
                required: true,
                label: 'Saya akan menghormati keputusan peserta lain apabila mereka tidak tertarik kepada saya.'
            },
            {
                id: 'conductPhotos',
                type: 'consent',
                required: true,
                label: 'Saya tidak akan memotret, merekam, atau mempublikasikan identitas peserta lain tanpa izin mereka.'
            },
            {
                id: 'conductRemoval',
                type: 'consent',
                required: true,
                label: 'Saya memahami bahwa penyelenggara berhak meminta saya meninggalkan acara apabila perilaku saya membuat peserta lain merasa tidak aman atau tidak nyaman.'
            },
            {
                id: 'consentFinal',
                type: 'consent',
                required: true,
                heading: 'Konfirmasi Akhir',
                label: 'Saya mengonfirmasi bahwa saya berusia minimal ' +
                    LOK_LOVE_CONFIG.minimumAge +
                    ' tahun, sedang berstatus lajang, dan benar-benar tertarik untuk mengenal peserta lajang lainnya.'
            },
            {
                id: 'signature',
                label: 'Persetujuan Elektronik',
                type: 'text',
                required: true,
                maxLength: 100,
                autocomplete: 'name',
                placeholder: 'Nama lengkapmu',
                help: 'Ketik nama lengkapmu sebagai bentuk persetujuan elektronik.'
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

/* A composite field's answer lives under its sub-keys, not its own id, so
   these read straight from formState rather than taking a `value`. */
function validateComposite(field) {
    const answers = formState.answers;

    if (field.type === 'social') {
        if (!answers[field.platformField]) return 'Pilih Instagram atau TikTok dulu ya.';
        const handle = String(answers[field.handleField] || '').trim();
        if (!handle) return 'Isi username kamu ya.';
        if (handle.replace(/^@/, '').length < 2) return 'Username-nya kependekan.';
        if (handle.length > field.handleMaxLength) {
            return 'Maksimal ' + field.handleMaxLength + ' karakter ya.';
        }
        return null;
    }

    if (field.type === 'agerange') {
        const rawMin = answers[field.minField];
        const rawMax = answers[field.maxField];
        if (rawMin == null || rawMin === '' || rawMax == null || rawMax === '') {
            return 'Isi usia minimum dan maksimum ya.';
        }
        const min = Number(rawMin);
        const max = Number(rawMax);
        if (!Number.isFinite(min) || !Number.isFinite(max)) return 'Masukkan angka ya.';
        if (min < field.floor || max < field.floor) {
            return 'Minimal ' + field.floor + ' tahun.';
        }
        if (min > field.ceiling || max > field.ceiling) {
            return 'Maksimal ' + field.ceiling + ' tahun.';
        }
        if (min > max) return 'Usia minimum tidak boleh lebih besar dari maksimum.';
        return null;
    }

    return null;
}

function validateField(field, value) {
    const isBlank = value == null || value === '' ||
                    (Array.isArray(value) && value.length === 0);

    if (field.type === 'social' || field.type === 'agerange') {
        return validateComposite(field);
    }
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
            const heading = field.heading
                ? '<h4 class="ll-consent-heading">' + escapeHtml(field.heading) + '</h4>'
                : '';
            const body = (field.body || []).map(
                p => '<p class="ll-consent-body">' + escapeHtml(p) + '</p>'
            ).join('');
            return '<div class="ll-field ll-field-consent' +
                    (field.heading ? ' ll-field-consent-lead' : '') +
                    '" data-field="' + field.id + '">' +
                heading + body +
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

        case 'social': {
            const platform = formState.answers[field.platformField] || '';
            const handle   = formState.answers[field.handleField] || '';
            const opts = field.platformOptions.map((o, i) => {
                const oid = field.platformField + '-' + i;
                return '<div class="ll-radio">' +
                    '<input type="radio" id="' + oid + '" name="' + field.platformField +
                        '" value="' + escapeHtml(o.value) + '"' +
                        (platform === o.value ? ' checked' : '') + '>' +
                    '<label for="' + oid + '">' + escapeHtml(o.label) + '</label>' +
                '</div>';
            }).join('');
            const note = field.note
                ? '<p class="ll-field-note">' + escapeHtml(field.note) + '</p>'
                : '';
            const body = (field.body || []).map(
                p => '<p class="ll-field-body">' + escapeHtml(p) + '</p>'
            ).join('');
            return '<div class="ll-field" data-field="' + field.id + '">' +
                '<fieldset class="ll-fieldset">' +
                    '<legend class="ll-label">' + fieldLabelHtml(field) + '</legend>' +
                    help +
                    '<div class="ll-radio-group ll-radio-inline" role="radiogroup">' + opts + '</div>' +
                    '<div class="ll-social-handle">' +
                        '<label class="ll-sr-only" for="' + field.handleField + '">Username</label>' +
                        '<span class="ll-social-at" aria-hidden="true">@</span>' +
                        '<input type="text" id="' + field.handleField + '" name="' + field.handleField +
                            '" value="' + escapeHtml(handle) + '" placeholder="username" ' +
                            'autocapitalize="none" autocorrect="off" spellcheck="false" ' +
                            'maxlength="' + field.handleMaxLength + '" ' +
                            'aria-describedby="' + describedBy + '">' +
                    '</div>' +
                    note + body + errNode +
                '</fieldset>' +
            '</div>';
        }

        case 'agerange': {
            const lo = formState.answers[field.minField];
            const hi = formState.answers[field.maxField];
            const box = (key, labelText, v) =>
                '<div class="ll-range-box">' +
                    '<label for="' + key + '">' + escapeHtml(labelText) + '</label>' +
                    '<input type="text" inputmode="numeric" id="' + key + '" name="' + key +
                        '" value="' + escapeHtml(v == null ? '' : v) + '" maxlength="2" ' +
                        'aria-describedby="' + describedBy + '">' +
                '</div>';
            return '<div class="ll-field" data-field="' + field.id + '">' +
                '<fieldset class="ll-fieldset">' +
                    '<legend class="ll-label">' + fieldLabelHtml(field) + '</legend>' +
                    help +
                    '<div class="ll-range">' +
                        box(field.minField, field.minLabel, lo) +
                        '<span class="ll-range-dash" aria-hidden="true">–</span>' +
                        box(field.maxField, field.maxLabel, hi) +
                    '</div>' +
                    errNode +
                '</fieldset>' +
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
            let v;
            if (field.type === 'social') {
                const handle = formState.answers[field.handleField];
                v = handle
                    ? (formState.answers[field.platformField] || '') + ' @' + String(handle).replace(/^@+/, '')
                    : '';
            } else if (field.type === 'agerange') {
                const lo = formState.answers[field.minField];
                const hi = formState.answers[field.maxField];
                v = (lo && hi) ? lo + '–' + hi + ' tahun' : '';
            } else {
                v = formState.answers[field.id];
            }
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

        /* Composites write their own sub-keys, so they bypass commit(),
           which is keyed on field.id. */
        const commitPart = (key, value) => {
            formState.answers[key] = value;
            saveDraft();
            if (wrap.classList.contains('ll-invalid') && !validateField(field, null)) {
                setFieldError(field.id, null);
            }
            if (!formState.startedTracked) {
                formState.startedTracked = true;
                trackEvent('lok_love_form_started');
            }
        };

        if (field.type === 'social') {
            wrap.querySelectorAll('input[type="radio"]').forEach(input => {
                input.addEventListener('change', () => commitPart(field.platformField, input.value));
            });
            const handle = wrap.querySelector('#' + field.handleField);
            if (handle) {
                const write = () => commitPart(field.handleField, handle.value.trim());
                handle.addEventListener('input', write);
                handle.addEventListener('change', write);
                handle.addEventListener('blur', () => {
                    // Applicants type the @ about half the time; accept both.
                    handle.value = handle.value.trim().replace(/^@+/, '');
                    write();
                    if (handle.value) setFieldError(field.id, validateField(field, null));
                });
            }
        } else if (field.type === 'agerange') {
            [field.minField, field.maxField].forEach(key => {
                const input = wrap.querySelector('#' + key);
                if (!input) return;
                const write = () => commitPart(key, input.value.replace(/[^0-9]/g, ''));
                input.addEventListener('input', () => { input.value = input.value.replace(/[^0-9]/g, ''); write(); });
                input.addEventListener('change', write);
                input.addEventListener('blur', () => {
                    if (formState.answers[field.minField] && formState.answers[field.maxField]) {
                        setFieldError(field.id, validateField(field, null));
                    }
                });
            });
        } else if (field.type === 'radio') {
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
        // Composites contribute their sub-keys and no key of their own.
        if (field.type === 'social') {
            payload[field.platformField] = String(formState.answers[field.platformField] || '');
            payload[field.handleField] =
                String(formState.answers[field.handleField] || '').trim().replace(/^@+/, '');
            return;
        }
        if (field.type === 'agerange') {
            const lo = formState.answers[field.minField];
            const hi = formState.answers[field.maxField];
            payload[field.minField] = lo === '' || lo == null ? null : Number(lo);
            payload[field.maxField] = hi === '' || hi == null ? null : Number(hi);
            return;
        }

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

/**
 * Which outlet the gateway should route this submission to.
 *
 * Hardcoding the key means a rename or a re-provision silently breaks the
 * form, and the failure surfaces to an applicant as a generic error. The
 * gateway publishes its own active outlets on an unauthenticated endpoint
 * it serves directly (no outlet needed to ask), so ask it.
 *
 * Cached for the page's lifetime. A pinned LOK_LOVE_CONFIG.outletKey wins,
 * for the case where several outlets exist and the event belongs to one.
 */
let _outletKeyPromise = null;
function resolveOutletKey(forceLookup) {
    if (!forceLookup && LOK_LOVE_CONFIG.outletKey) {
        return Promise.resolve(LOK_LOVE_CONFIG.outletKey);
    }
    if (_outletKeyPromise) return _outletKeyPromise;

    _outletKeyPromise = fetch(LOK_LOVE_CONFIG.outletsEndpoint)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
            const first = data && Array.isArray(data.outlets) ? data.outlets[0] : null;
            if (!first || !first.outletKey) throw new Error('no active outlet');
            return first.outletKey;
        })
        .catch((err) => {
            // Let the caller fail through the normal error path, and allow a
            // retry to look it up again rather than caching the failure.
            _outletKeyPromise = null;
            throw err;
        });

    return _outletKeyPromise;
}

function postApplication(payload, outletKey) {
    const endpoint = LOK_LOVE_CONFIG.apiEndpoint +
        (LOK_LOVE_CONFIG.apiEndpoint.indexOf('?') === -1 ? '?' : '&') +
        'outlet=' + encodeURIComponent(outletKey);

    /* The POS gateway parses application/json and answers the CORS
       preflight, the same path the reservation form already uses. */
    return fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
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
        let res = await postApplication(payload, await resolveOutletKey(false));

        /* 403 is the gateway saying it does not recognise the outlet key we
           sent, which is what a rename or a re-provision looks like from
           here. Ask it which outlets it actually serves and try that once,
           rather than turning a fixable config drift into a dead form. */
        if (res.status === 403) {
            const looked = await resolveOutletKey(true).catch(() => null);
            if (looked && looked !== LOK_LOVE_CONFIG.outletKey) {
                LOK_LOVE_CONFIG.outletKey = looked;
                res = await postApplication(payload, looked);
            }
        }

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
