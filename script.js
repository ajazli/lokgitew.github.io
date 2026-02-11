// Carousel functionality
let currentSlide = 0;
const totalSlides = 6;

function initCarousel() {
    // Create dots
    const dotsContainer = document.querySelector('.carousel-dots');
    if (dotsContainer) {
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = 'carousel-dot';
            if (i === 0) dot.classList.add('active');
            dot.onclick = () => goToSlide(i);
            dotsContainer.appendChild(dot);
        }
    }
}

function updateCarousel() {
    const track = document.querySelector('.carousel-track');
    if (track) {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    // Update dots
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function moveCarousel(direction) {
    currentSlide += direction;
    
    // Loop around
    if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    } else if (currentSlide >= totalSlides) {
        currentSlide = 0;
    }
    
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

// Auto-advance carousel every 5 seconds on mobile
let carouselInterval;
function startAutoCarousel() {
    if (window.innerWidth <= 968) {
        carouselInterval = setInterval(() => {
            moveCarousel(1);
        }, 5000);
    }
}

function stopAutoCarousel() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }
}

// Initialize carousel when page loads
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    if (window.innerWidth <= 968) {
        startAutoCarousel();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth <= 968) {
        startAutoCarousel();
    } else {
        stopAutoCarousel();
    }
});

// Pause auto-advance when user interacts
document.querySelectorAll('.carousel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        stopAutoCarousel();
        setTimeout(startAutoCarousel, 10000); // Resume after 10 seconds
    });
});

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
