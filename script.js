/* ── Reduced motion helper ───────────────────────────── */
// Visitors who've asked the OS/browser to minimize motion get static
// content instead of scroll-scrubbed canvas animation and smooth-scrolling.
function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function scrollBehavior() {
    return prefersReducedMotion() ? 'auto' : 'smooth';
}

// Initialize when DOM is ready
function initAll() {
    initMenuBook();
    initHeroOpenStatus();
    initSplash();
    initScrollProgress();
    initActiveNav();
    initScrollReveal();
    initBackToTop();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

/* ── Splash Screen ───────────────────────────────────── */
function initSplash() {
    const splash = document.getElementById('splash');
    if (!splash) return;
    document.body.style.overflow = 'hidden';
    const hideSplash = () => {
        splash.classList.add('hidden');
        document.body.style.overflow = '';
    };
    if (document.readyState === 'complete') {
        setTimeout(hideSplash, 700);
    } else {
        window.addEventListener('load', () => setTimeout(hideSplash, 700), { once: true });
    }
    setTimeout(hideSplash, 4000); // safety fallback
}

/* ── Scroll Progress Bar ─────────────────────────────── */
function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (scrolled / total * 100) + '%';
    }, { passive: true });
}

/* ── Active Nav Highlighting ─────────────────────────── */
function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(a => a.classList.remove('nav-active'));
                const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                if (active) active.classList.add('nav-active');
            }
        });
    }, { threshold: 0.4 });
    sections.forEach(s => observer.observe(s));
}

/* ── Scroll Reveal (all sections) ───────────────────── */
function initScrollReveal() {
    const els = Array.from(document.querySelectorAll('.reveal, .title-reveal'));
    function check() {
        els.forEach(el => {
            if (el.classList.contains('revealed')) return;
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.88) {
                el.classList.add('revealed');
            }
        });
    }
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check, { passive: true });
    setTimeout(check, 150);
}

/* ── Back to Top ─────────────────────────────────────── */
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: scrollBehavior() });
    });
}

/* ── Gallery Lightbox ────────────────────────────────── */
/* Lightbox and gallery carousel removed — replaced by scroll-driven product showcase */

/* ── Hero open status ────────────────────────────────── */
// Get the current day-of-week (0=Sun…6=Sat) and hour-of-day in WIB
// (Asia/Jakarta), regardless of the visitor's own device timezone/clock.
function getJakartaNow() {
    const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Jakarta',
            weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
        }).formatToParts(new Date());
        const map = {};
        parts.forEach(p => { map[p.type] = p.value; });
        let hour = parseInt(map.hour, 10) % 24; // some locales report midnight as "24"
        return { day: dayMap[map.weekday], hour: hour + parseInt(map.minute, 10) / 60 };
    } catch (e) {
        // Intl/timeZone unsupported — fall back to the visitor's local clock
        const now = new Date();
        return { day: now.getDay(), hour: now.getHours() + now.getMinutes() / 60 };
    }
}

function initHeroOpenStatus() {
    const statusText = document.getElementById('heroStatusText');
    const statusDot = document.getElementById('heroStatusDot');
    if (!statusText || !statusDot) return;

    const { day, hour } = getJakartaNow();
    const isMonday = day === 1;
    const isOpen = !isMonday && (hour < 3 || hour >= 15);

    statusDot.classList.toggle('is-open', isOpen);
    statusDot.classList.toggle('is-closed', !isOpen);
    statusText.textContent = isOpen
        ? 'Open now until 3AM WIB'
        : (isMonday ? 'Closed today' : 'Opens today at 3PM WIB');
}

// Menu Book / Page Viewer
let currentMenuPage = 0;
const totalMenuPages = 10;

function initMenuBook() {
    const dotsContainer = document.getElementById('menuBookDots');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalMenuPages; i++) {
        const dot = document.createElement('button');
        dot.className = 'menu-book-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to menu page ' + (i + 1));
        dot.onclick = () => goToMenuPage(i);
        dotsContainer.appendChild(dot);
    }

    // Swipe support for mobile
    const viewport = document.querySelector('.menu-book-viewport');
    if (!viewport) return;
    let touchStartX = 0;
    let touchStartY = 0;
    viewport.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
            moveMenuPage(dx < 0 ? 1 : -1);
        }
    }, { passive: true });
}

function updateMenuBook() {
    const track = document.getElementById('menuBookTrack');
    if (track) track.style.transform = `translateX(-${currentMenuPage * 100}%)`;
    const counter = document.getElementById('menuCurrentPage');
    if (counter) counter.textContent = currentMenuPage + 1;
    document.querySelectorAll('.menu-book-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentMenuPage);
    });
}

function moveMenuPage(dir) {
    currentMenuPage = Math.max(0, Math.min(totalMenuPages - 1, currentMenuPage + dir));
    updateMenuBook();
}

function goToMenuPage(index) {
    currentMenuPage = index;
    updateMenuBook();
}

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: scrollBehavior(),
                block: 'start'
            });
            // Close mobile menu if open
            document.getElementById('navLinks').classList.remove('active');
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.boxShadow = '0 4px 30px rgba(255, 107, 53, 0.4)';
    } else {
        nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    }
});

// Scroll reveal is now handled by initScrollReveal() above


/* ════════════════════════════════════════════════════════
   RESERVATION SYSTEM — Customer form logic
   • Custom calendar picker: past dates + Mondays disabled
   • Time slots fetched from POS server with live pax counts
   • Each slot capped at PAX_CAP (10) across pending+confirmed
   Update POS_SERVER_URL to your POS server address.
════════════════════════════════════════════════════════ */

const POS_SERVER_URL = 'https://pos.lokgitew.com';
const PAX_CAP        = 10;   // max pax per hourly slot

// Opening hours by JS day-of-week (0=Sun … 6=Sat), times in WIB
// Monday (1) is CLOSED — handled via disabling
const RES_HOURS = {
  0: { open: 15, close: 27 },  // Sunday    3PM – 3AM
  1: null,                      // Monday   – CLOSED
  2: { open: 15, close: 27 },  // Tuesday   3PM – 3AM
  3: { open: 15, close: 27 },  // Wednesday 3PM – 3AM
  4: { open: 15, close: 27 },  // Thursday  3PM – 3AM
  5: { open: 15, close: 27 },  // Friday    3PM – 3AM
  6: { open: 15, close: 27 },  // Saturday  3PM – 3AM
};

// ── Calendar state ────────────────────────────────────────────────────────────
let _calYear  = null;
let _calMonth = null;   // 0-based
let _calSelectedDate = '';  // "YYYY-MM-DD"

function _today() {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
}

function _pad(n) { return String(n).padStart(2, '0'); }

function _dateStr(y, m, d) {
    return `${y}-${_pad(m + 1)}-${_pad(d)}`;
}

function _isMonday(y, m, d) {
    return new Date(y, m, d).getDay() === 1;
}

// ── Init calendar after DOM ready ─────────────────────────────────────────────
function initCalendar() {
    const today = _today();
    _calYear  = today.y;
    _calMonth = today.m;
    renderCalendarGrid();

    // Close calendar on outside click
    document.addEventListener('click', function(e) {
        const cal = document.getElementById('resCalendar');
        const btn = document.getElementById('resDateBtn');
        if (cal && !cal.contains(e.target) && btn && !btn.contains(e.target)) {
            cal.style.display = 'none';
            if (btn) btn.removeAttribute('aria-expanded');
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalendar);
} else {
    initCalendar();
}

function toggleCalendar(e) {
    if (e) e.stopPropagation();
    const cal = document.getElementById('resCalendar');
    const btn = document.getElementById('resDateBtn');
    if (!cal) return;
    const isOpen = cal.style.display !== 'none';
    cal.style.display = isOpen ? 'none' : 'block';
    if (btn) btn.setAttribute('aria-expanded', String(!isOpen));
}

function shiftCalMonth(dir) {
    _calMonth += dir;
    if (_calMonth < 0)  { _calMonth = 11; _calYear--; }
    if (_calMonth > 11) { _calMonth = 0;  _calYear++; }
    renderCalendarGrid();
}

function renderCalendarGrid() {
    const label = document.getElementById('resCalMonthLabel');
    const grid  = document.getElementById('resCalGrid');
    if (!label || !grid) return;

    const monthName = new Date(_calYear, _calMonth, 1)
        .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    label.textContent = monthName.toUpperCase();

    const today    = _today();
    const maxDate  = new Date();
    maxDate.setDate(maxDate.getDate() + 60);

    // First weekday of month (0=Sun)
    const firstDow = new Date(_calYear, _calMonth, 1).getDay();
    const daysInMonth = new Date(_calYear, _calMonth + 1, 0).getDate();

    grid.innerHTML = '';

    // Empty cells before first day
    for (let i = 0; i < firstDow; i++) {
        const empty = document.createElement('button');
        empty.className = 'res-cal-day cal-empty';
        empty.disabled  = true;
        empty.type      = 'button';
        grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const btn    = document.createElement('button');
        btn.type     = 'button';
        btn.textContent = d;

        const isPast = new Date(_calYear, _calMonth, d) < new Date(today.y, today.m, today.d);
        const isMon  = _isMonday(_calYear, _calMonth, d);
        const isFutureCap = new Date(_calYear, _calMonth, d) > maxDate;
        const dateStr = _dateStr(_calYear, _calMonth, d);
        const isToday = (_calYear === today.y && _calMonth === today.m && d === today.d);

        if (isPast || isMon || isFutureCap) {
            btn.disabled  = true;
            btn.className = 'res-cal-day' + (isMon ? ' cal-closed' : '');
        } else {
            btn.className = 'res-cal-day';
            if (isToday) btn.classList.add('cal-today');
            if (dateStr === _calSelectedDate) btn.classList.add('cal-selected');
            btn.onclick = () => selectCalDate(dateStr, d);
        }

        grid.appendChild(btn);
    }
}

function selectCalDate(dateStr, dayNum) {
    _calSelectedDate = dateStr;

    // Update hidden input
    const hiddenInput = document.getElementById('resDate');
    if (hiddenInput) { hiddenInput.value = dateStr; hiddenInput.classList.remove('res-invalid'); }

    // Update button text
    const btn = document.getElementById('resDateBtn');
    const [y, m, d] = dateStr.split('-').map(Number);
    const readable = new Date(y, m - 1, d).toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    if (btn) {
        document.getElementById('resDateBtnText').textContent = readable;
        btn.classList.add('has-value');
        btn.classList.remove('res-invalid');
    }

    // Re-render to show selection highlight
    renderCalendarGrid();

    // Close calendar
    document.getElementById('resCalendar').style.display = 'none';
    btn.removeAttribute('aria-expanded');

    // Load time slots
    loadTimeSlots(dateStr);
}

// ── Time slot logic ───────────────────────────────────────────────────────────
let _selectedSlot = '';

async function loadTimeSlots(dateStr) {
    const timeGroup = document.getElementById('resTimeGroup');
    const slotsDiv  = document.getElementById('resTimeSlots');
    const hiddenTime = document.getElementById('resTime');

    if (!timeGroup || !slotsDiv) return;

    // Reset any previous selection
    _selectedSlot = '';
    if (hiddenTime) hiddenTime.value = '';

    timeGroup.style.display = 'block';
    slotsDiv.innerHTML = '<div class="res-slots-loading">⏳ Checking availability…</div>';

    // Determine hours for this day
    const [y, m, d] = dateStr.split('-').map(Number);
    const dow   = new Date(y, m - 1, d).getDay();
    const hours = RES_HOURS[dow];

    if (!hours) {
        slotsDiv.innerHTML = '<div class="res-slots-loading" style="color:#e53e3e;">We are closed on Mondays. Please pick another day.</div>';
        return;
    }

    // Fetch booked pax counts from POS server
    let booked = {};
    try {
        const res  = await fetch(`${POS_SERVER_URL}/api/reservations/slots?date=${dateStr}`);
        const data = await res.json();
        if (data.success) booked = data.slots; // { "14:00": 7, "15:00": 10, ... }
    } catch (e) {
        // Server unreachable — show slots without cap info
        console.warn('Could not fetch slot availability:', e.message);
    }

    const now      = new Date();
    const isToday  = (dateStr === _dateStr(now.getFullYear(), now.getMonth(), now.getDate()));
    const lastSlot = hours.close - 1;

    slotsDiv.innerHTML = '';
    let anyAvailable = false;

    for (let h = hours.open; h <= lastSlot; h++) {
        if (isToday && h <= now.getHours()) continue; // skip past slots

        const slotKey  = _pad(h % 24) + ':00';
        const paxTaken = booked[slotKey] || 0;
        const paxLeft  = PAX_CAP - paxTaken;
        const isFull   = paxLeft <= 0;
        const fillPct  = Math.min(100, Math.round((paxTaken / PAX_CAP) * 100));

        // Colour of capacity bar: green → amber → red
        const barColor = fillPct < 50 ? '#48bb78' : fillPct < 80 ? '#ed8936' : '#e53e3e';

        const btn = document.createElement('button');
        btn.type      = 'button';
        btn.disabled  = isFull;
        btn.className = 'res-slot' + (isFull ? ' slot-full' : '');
        btn.dataset.slot = slotKey;
        btn.innerHTML = `
            <span class="slot-time">${fmtHour(h)}</span>
            <div class="slot-bar-wrap">
                <div class="slot-bar" style="width:${fillPct}%;background:${barColor}"></div>
            </div>
            <span class="slot-avail" style="color:${isFull ? '#e53e3e' : barColor}">
                ${isFull ? 'Full' : paxLeft + ' pax left'}
            </span>`;

        btn.onclick = () => selectSlot(slotKey, btn);
        slotsDiv.appendChild(btn);
        if (!isFull) anyAvailable = true;
    }

    if (slotsDiv.children.length === 0) {
        slotsDiv.innerHTML = '<div class="res-slots-loading">No available time slots for today. Please choose another date.</div>';
    } else if (!anyAvailable) {
        slotsDiv.innerHTML += '<div class="res-slots-loading" style="color:#e53e3e;margin-top:.5rem;">All slots are fully booked for this day. Please choose another date.</div>';
    }
}

function selectSlot(slotKey, btnEl) {
    _selectedSlot = slotKey;
    const hiddenTime = document.getElementById('resTime');
    if (hiddenTime) { hiddenTime.value = slotKey; hiddenTime.classList.remove('res-invalid'); }
    document.getElementById('resTimeSlots')?.classList.remove('res-invalid');

    // Update visual selection
    document.querySelectorAll('.res-slot').forEach(b => b.classList.remove('slot-selected'));
    btnEl.classList.add('slot-selected');
}

// ── Format 24h int → "12:00 PM" ───────────────────────────────────────────────
function fmtHour(h) {
    h = h % 24;
    if (h === 0)  return '12:00 AM';
    if (h === 12) return '12:00 PM';
    return h < 12 ? h + ':00 AM' : (h - 12) + ':00 PM';
}

// kept for backwards-compat (called by old onchange, now unused but harmless)
function updateTimeSlots() {}

// ── Form validation ────────────────────────────────────────────────────────────
function validateResForm() {
    const fields = [
        { id: 'resName',  label: 'your name'            },
        { id: 'resPhone', label: 'your phone number'    },
        { id: 'resDate',  label: 'a date'               },
        { id: 'resTime',  label: 'a time slot'          },
        { id: 'resPax',   label: 'the number of guests' },
    ];
    let first = null;
    fields.forEach(({ id, label }) => {
        const el = document.getElementById(id);
        if (!el) return;
        const empty = !el.value || el.value === '';
        // For hidden inputs, highlight the visible control instead
        if (id === 'resDate') {
            document.getElementById('resDateBtn')?.classList.toggle('res-invalid', empty);
        } else if (id === 'resTime') {
            document.getElementById('resTimeSlots')?.classList.toggle('res-invalid', empty);
        } else {
            el.classList.toggle('res-invalid', empty);
        }
        if (empty && !first) first = `Please select ${label}.`;
    });
    return first;
}

// ── POST to POS server ─────────────────────────────────────────────────────────
async function saveReservation(data) {
    const res = await fetch(POS_SERVER_URL + '/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server error');
    }
    return await res.json();
}

// ── Submit ─────────────────────────────────────────────────────────────────────
function submitReservation() {
    const errBox    = document.getElementById('resErrorBox');
    const submitBtn = document.getElementById('resSubmitBtn');
    const btnText   = document.getElementById('resBtnText');
    const loader    = document.getElementById('resBtnLoader');

    errBox.style.display = 'none';
    document.querySelectorAll('.res-invalid').forEach(el => el.classList.remove('res-invalid'));

    const err = validateResForm();
    if (err) {
        errBox.textContent   = '⚠  ' + err;
        errBox.style.display = 'flex';
        errBox.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
        return;
    }

    submitBtn.disabled    = true;
    btnText.style.display = 'none';
    loader.style.display  = 'inline';

    const data = {
        name:     document.getElementById('resName').value.trim(),
        phone:    document.getElementById('resPhone').value.trim(),
        date:     document.getElementById('resDate').value,
        time:     document.getElementById('resTime').value,
        pax:      document.getElementById('resPax').value,
        occasion: document.getElementById('resOccasion').value,
        requests: document.getElementById('resRequests').value.trim(),
    };

    // Check that the selected slot still has enough capacity for the requested pax
    const paxNum = data.pax === '10+' ? 10 : parseInt(data.pax) || 1;
    const selectedSlotBtn = document.querySelector(`.res-slot[data-slot="${data.time}"]`);
    if (selectedSlotBtn) {
        const availText = selectedSlotBtn.querySelector('.slot-avail')?.textContent || '';
        const match     = availText.match(/(\d+)\s*pax left/);
        if (match) {
            const paxLeft = parseInt(match[1]);
            if (paxNum > paxLeft) {
                errBox.textContent   = `⚠  Only ${paxLeft} pax left for that slot. Please choose a different time or reduce your group size.`;
                errBox.style.display = 'flex';
                errBox.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
                submitBtn.disabled    = false;
                btnText.style.display = 'inline';
                loader.style.display  = 'none';
                return;
            }
        }
    }

    saveReservation(data).then(() => {
        showReservationSuccess(data);
    }).catch(() => {
        const timeStr = fmtHour(parseInt(data.time, 10));
        const waText = `Hi! I'd like to book a table.\nName: ${data.name}\nDate: ${data.date}\nTime: ${timeStr}\nGuests: ${data.pax}`;
        const waLink = `https://wa.me/6285122333769?text=${encodeURIComponent(waText)}`;
        errBox.innerHTML = `⚠&nbsp; Could not reach our booking system. <a href="${waLink}" target="_blank" rel="noopener" class="res-error-wa-link">WhatsApp us directly &rarr;</a>`;
        errBox.style.display = 'flex';
        submitBtn.disabled    = false;
        btnText.style.display = 'inline';
        loader.style.display  = 'none';
    });
}

// ── Success screen ─────────────────────────────────────────────────────────────
// Escape user-supplied text before inserting into innerHTML
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
}

function showReservationSuccess(data) {
    document.getElementById('reservationFormWrap').style.display = 'none';
    document.getElementById('reservationSuccess').style.display  = 'block';

    const [y, m, d] = data.date.split('-').map(Number);
    const [hh]      = data.time.split(':').map(Number);
    const dateStr   = new Date(y, m - 1, d).toLocaleDateString('en-GB',
        { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr   = fmtHour(hh);
    const name      = escapeHtml(data.name);
    const phone     = escapeHtml(data.phone);
    const pax       = escapeHtml(data.pax);
    const occasion  = data.occasion ? `<div class="sc-row"><span class="sc-label">Occasion</span><span class="sc-val">${escapeHtml(data.occasion)}</span></div>` : '';
    const requests  = data.requests ? `<div class="sc-row"><span class="sc-label">Requests</span><span class="sc-val">${escapeHtml(data.requests)}</span></div>` : '';

    document.getElementById('resSuccessCard').innerHTML = `
        <div class="sc-row"><span class="sc-label">Name</span><span class="sc-val">${name}</span></div>
        <div class="sc-row"><span class="sc-label">Phone</span><span class="sc-val">${phone}</span></div>
        <div class="sc-row"><span class="sc-label">Date</span><span class="sc-val">${dateStr}</span></div>
        <div class="sc-row"><span class="sc-label">Time</span><span class="sc-val">${timeStr}</span></div>
        <div class="sc-row"><span class="sc-label">Guests</span><span class="sc-val">${pax} ${data.pax == 1 ? 'person' : 'people'}</span></div>
        ${occasion}${requests}`;
}

// Reset and show form again
function resetReservationForm() {
    document.getElementById('reservationFormWrap').style.display = 'block';
    document.getElementById('reservationSuccess').style.display  = 'none';
    document.getElementById('reservationForm').reset();
    document.getElementById('resErrorBox').style.display = 'none';
    document.querySelectorAll('.res-invalid').forEach(el => el.classList.remove('res-invalid'));

    // Reset calendar
    _calSelectedDate = '';
    _selectedSlot    = '';
    const today = _today();
    _calYear  = today.y;
    _calMonth = today.m;
    renderCalendarGrid();
    const btn = document.getElementById('resDateBtn');
    if (btn) {
        document.getElementById('resDateBtnText').textContent = 'Select a date';
        btn.classList.remove('has-value', 'res-invalid');
    }
    document.getElementById('resDate').value = '';
    document.getElementById('resTime').value = '';

    // Hide slot grid
    const tg = document.getElementById('resTimeGroup');
    if (tg) tg.style.display = 'none';

    const submitBtn = document.getElementById('resSubmitBtn');
    submitBtn.disabled = false;
    document.getElementById('resBtnText').style.display = 'inline';
    document.getElementById('resBtnLoader').style.display = 'none';
}
