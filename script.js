// Gallery Carousel functionality
let currentGallerySlide = 0;
const totalGallerySlides = 5;

function initGalleryCarousel() {
    // Create dots
    const dotsContainer = document.getElementById('galleryDots');
    if (dotsContainer) {
        dotsContainer.innerHTML = ''; // Clear any existing dots
        for (let i = 0; i < totalGallerySlides; i++) {
            const dot = document.createElement('div');
            dot.className = 'gallery-dot';
            if (i === 0) dot.classList.add('active');
            dot.onclick = () => goToGallerySlide(i);
            dotsContainer.appendChild(dot);
        }
    }
}

function updateGalleryCarousel() {
    const track = document.getElementById('galleryTrack');
    if (track) {
        track.style.transform = `translateX(-${currentGallerySlide * 100}%)`;
    }
    
    // Update dots
    const dots = document.querySelectorAll('.gallery-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentGallerySlide);
    });
}

function moveGallery(direction) {
    currentGallerySlide += direction;
    
    // Loop around
    if (currentGallerySlide < 0) {
        currentGallerySlide = totalGallerySlides - 1;
    } else if (currentGallerySlide >= totalGallerySlides) {
        currentGallerySlide = 0;
    }
    
    updateGalleryCarousel();
}

function goToGallerySlide(index) {
    currentGallerySlide = index;
    updateGalleryCarousel();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryCarousel);
} else {
    initGalleryCarousel();
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
                behavior: 'smooth',
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

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.feature-card, .gallery-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});


/* ════════════════════════════════════════════════════════
   RESERVATION SYSTEM — Customer form logic
   Reservations are POSTed directly to the POS server at POS_SERVER_URL.
   The cashier sees them in the Reservations tab of cashier.html.
   Update POS_SERVER_URL in this file to match your POS server address.
════════════════════════════════════════════════════════ */

// Opening hours: key = JS day-of-week (0=Sun, 1=Mon … 6=Sat)
// Values: first bookable hour (open) and last bookable hour (lastSlot)
// Last slot = closing hour − 1 (kitchen closes 1 hour before we do)
const RES_HOURS = {
  0: { label: 'Sunday',    open: 12, close: 22 },
  1: { label: 'Monday',    open: 12, close: 22 },
  2: { label: 'Tuesday',   open: 12, close: 22 },
  3: { label: 'Wednesday', open: 12, close: 22 },
  4: { label: 'Thursday',  open: 12, close: 22 },
  5: { label: 'Friday',    open: 14, close: 23 },
  6: { label: 'Saturday',  open: 14, close: 23 },
};

// Format 24h integer → "12:00 PM" / "2:00 PM"
function fmtHour(h) {
    if (h === 0)  return '12:00 AM';
    if (h === 12) return '12:00 PM';
    return h < 12 ? h + ':00 AM' : (h - 12) + ':00 PM';
}

// Populate time slots whenever the date input changes
function updateTimeSlots() {
    const dateEl = document.getElementById('resDate');
    const timeEl = document.getElementById('resTime');
    if (!dateEl || !timeEl || !dateEl.value) return;

    // Parse without timezone shift
    const [yr, mo, dy] = dateEl.value.split('-').map(Number);
    const picked = new Date(yr, mo - 1, dy);
    const dow    = picked.getDay();
    const h      = RES_HOURS[dow];

    const now       = new Date();
    const isToday   = picked.toDateString() === now.toDateString();
    const lastSlot  = h.close - 1; // last bookable slot

    timeEl.innerHTML = '';

    let added = 0;
    for (let slot = h.open; slot <= lastSlot; slot++) {
        // Skip past slots when booking for today
        if (isToday && slot <= now.getHours()) continue;
        const opt       = document.createElement('option');
        opt.value       = String(slot).padStart(2, '0') + ':00';
        opt.textContent = fmtHour(slot);
        timeEl.appendChild(opt);
        added++;
    }

    if (added === 0) {
        const opt       = document.createElement('option');
        opt.value       = '';
        opt.disabled    = true;
        opt.selected    = true;
        opt.textContent = 'No available slots for today';
        timeEl.appendChild(opt);
    }

    timeEl.classList.remove('res-invalid');
}

// Set date input min/max on page load
(function initDateBounds() {
    const el = document.getElementById('resDate');
    if (!el) return;
    const today = new Date();
    const pad   = n => String(n).padStart(2, '0');
    el.min = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
    const max = new Date(); max.setDate(max.getDate() + 60);
    el.max = `${max.getFullYear()}-${pad(max.getMonth()+1)}-${pad(max.getDate())}`;
})();

// Validate required fields, highlight errors, return first error message
function validateResForm() {
    const required = [
        { id: 'resName',  label: 'your name'            },
        { id: 'resPhone', label: 'your phone number'    },
        { id: 'resDate',  label: 'a date'               },
        { id: 'resTime',  label: 'a time slot'          },
        { id: 'resPax',   label: 'the number of guests' },
    ];
    let first = null;
    required.forEach(({ id, label }) => {
        const el = document.getElementById(id);
        if (!el) return;
        const empty = !el.value || el.value === '';
        el.classList.toggle('res-invalid', empty);
        if (empty && !first) first = `Please enter ${label}.`;
    });
    return first;
}

// POST reservation to POS server
// Update POS_SERVER_URL to your actual POS domain/IP, e.g. https://pos.lokgitew.com
const POS_SERVER_URL = 'https://pos.lokgitew.com';

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

// Main submit handler
function submitReservation() {
    const errBox    = document.getElementById('resErrorBox');
    const submitBtn = document.getElementById('resSubmitBtn');
    const btnText   = document.getElementById('resBtnText');
    const loader    = document.getElementById('resBtnLoader');

    // Clear previous
    errBox.style.display = 'none';
    document.querySelectorAll('.res-invalid').forEach(el => el.classList.remove('res-invalid'));

    const err = validateResForm();
    if (err) {
        errBox.textContent  = '⚠  ' + err;
        errBox.style.display = 'flex';
        // Scroll error into view
        errBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
    }

    // Loading state
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

    // POST to POS server
    saveReservation(data).then(() => {
        showReservationSuccess(data);
    }).catch(err => {
        errBox.textContent  = '⚠  Could not reach our booking system. Please WhatsApp us directly.';
        errBox.style.display = 'flex';
        submitBtn.disabled    = false;
        btnText.style.display = 'inline';
        loader.style.display  = 'none';
    });
}

// Render success screen
function showReservationSuccess(data) {
    document.getElementById('reservationFormWrap').style.display = 'none';
    const wrap = document.getElementById('reservationSuccess');
    wrap.style.display = 'block';

    // Build summary card
    const [yr, mo, dy] = data.date.split('-').map(Number);
    const [hh]         = data.time.split(':').map(Number);
    const dateObj      = new Date(yr, mo - 1, dy);
    const dateStr      = dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr      = fmtHour(hh);
    const occasion     = data.occasion ? `<div class="sc-row"><span class="sc-label">Occasion</span><span class="sc-val">${data.occasion}</span></div>` : '';
    const requests     = data.requests ? `<div class="sc-row"><span class="sc-label">Requests</span><span class="sc-val">${data.requests}</span></div>` : '';

    document.getElementById('resSuccessCard').innerHTML = `
        <div class="sc-row"><span class="sc-label">Name</span><span class="sc-val">${data.name}</span></div>
        <div class="sc-row"><span class="sc-label">Phone</span><span class="sc-val">${data.phone}</span></div>
        <div class="sc-row"><span class="sc-label">Date</span><span class="sc-val">${dateStr}</span></div>
        <div class="sc-row"><span class="sc-label">Time</span><span class="sc-val">${timeStr}</span></div>
        <div class="sc-row"><span class="sc-label">Guests</span><span class="sc-val">${data.pax} ${data.pax == 1 ? 'person' : 'people'}</span></div>
        ${occasion}${requests}`;
}

// Reset and show form again
function resetReservationForm() {
    document.getElementById('reservationFormWrap').style.display = 'block';
    document.getElementById('reservationSuccess').style.display  = 'none';
    document.getElementById('reservationForm').reset();
    document.getElementById('resErrorBox').style.display = 'none';
    document.querySelectorAll('.res-invalid').forEach(el => el.classList.remove('res-invalid'));
    document.getElementById('resTime').innerHTML = '<option value="" disabled selected>Pick a date first</option>';

    const submitBtn = document.getElementById('resSubmitBtn');
    submitBtn.disabled = false;
    document.getElementById('resBtnText').style.display = 'inline';
    document.getElementById('resBtnLoader').style.display = 'none';

    // Re-apply date bounds
    const dateEl = document.getElementById('resDate');
    if (dateEl) {
        const today = new Date();
        const pad   = n => String(n).padStart(2, '0');
        dateEl.min  = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
    }
}
