/* ==========================================================
   evently.js — All interactions, animations & API helpers
   ========================================================== */

// ── Custom Cursor ─────────────────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

  document.body.style.cursor = 'none';
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  const hoverEls = document.querySelectorAll('a, button, .ev-card, .feat, .testi-card, .price-card');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
  });
}

// ── Navbar Scroll Effect ──────────────────────────────────
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── Mobile Nav Toggle ─────────────────────────────────────
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

// ── Scroll Reveal ─────────────────────────────────────────
function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(el => observer.observe(el));
}

// ── Animated Counters ─────────────────────────────────────
function animateCounter(el, target, suffix, decimals = 0) {
  let startTime = null;
  const duration = 1800;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const value    = eased * target;
    el.textContent = (decimals ? value.toFixed(decimals) : Math.round(value)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const statsBar = document.querySelector('.stats-bar');
  if (!statsBar) return;

  const counters = [
    { selector: '#stat-events',   target: 48,  suffix: 'K+',  decimals: 0 },
    { selector: '#stat-tickets',  target: 3.2, suffix: 'M',   decimals: 1 },
    { selector: '#stat-uptime',   target: 99,  suffix: '%',   decimals: 0 },
    { selector: '#stat-cities',   target: 120, suffix: '+',   decimals: 0 },
  ];

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      counters.forEach(({ selector, target, suffix, decimals }) => {
        const el = document.querySelector(selector);
        if (el) animateCounter(el, target, suffix, decimals);
      });
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  observer.observe(statsBar);
}

// ── Events Data & Rendering ───────────────────────────────
const MOCK_EVENTS = [
  {
    id: 1,
    tag: 'Conference', tagClass: 'orange',
    title: 'Lagos Tech Summit 2026',
    meta: 'Mar 20 · Landmark Centre, Lagos',
    progress: 72, sold: 360, capacity: 500,
    price: '₦15,000', btnClass: 'orange',
  },
  {
    id: 2,
    tag: 'Concert', tagClass: 'gold',
    title: 'Afrobeat Night Out — Season 3',
    meta: 'Apr 19 · Eko Hotel & Suites, Lagos',
    progress: 95, sold: 950, capacity: 1000,
    price: '₦25,000', btnClass: 'gold',
  },
  {
    id: 3,
    tag: 'Workshop', tagClass: 'green',
    title: 'Product Design Bootcamp',
    meta: 'Apr 5 · Victoria Island, Lagos',
    progress: 40, sold: 80, capacity: 200,
    price: '₦10,000', btnClass: 'green',
  },
];

function renderEventCard(event) {
  return `
    <div class="ev-card reveal" data-event-id="${event.id}" role="article" tabindex="0">
      <div class="ev-card-top">
        <span class="ev-tag ev-tag-${event.tagClass}">${event.tag}</span>
        <div class="ev-live-dot" aria-label="Live event"></div>
      </div>
      <div class="ev-title">${event.title}</div>
      <div class="ev-meta">${event.meta}</div>
      <div class="ev-progress-bg" role="progressbar" aria-valuenow="${event.progress}" aria-valuemin="0" aria-valuemax="100">
        <div class="ev-progress-fill fill-${event.tagClass}" style="width:${event.progress}%"></div>
      </div>
      <div class="ev-stats">
        <span>${event.sold} sold</span>
        <span>${event.progress}% full</span>
      </div>
      <div class="ev-footer">
        <div class="ev-price">${event.price}</div>
        <button class="ev-btn ev-btn-${event.btnClass}" data-event-id="${event.id}">Book now</button>
      </div>
    </div>
  `;
}

async function loadEvents() {
  const container = document.getElementById('events-container');
  if (!container) return;

  // ── Swap this block with your real API call ───────────
  // Example:
  // const res   = await fetch('https://eventflow-b919.onrender.com/api/events?limit=3&status=published');
  // const data  = await res.json();
  // const events = data.events;
  //
  // For now we use mock data:
  const events = MOCK_EVENTS;
  // ─────────────────────────────────────────────────────

  container.innerHTML = events.map(renderEventCard).join('');

  // Attach Book Now handlers
  container.querySelectorAll('[data-event-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.eventId;
      window.location.href = `pages/booking.html?event=${id}`;
    });
  });

  // Re-run reveal on dynamically injected cards
  initReveal();
}

// ── Auth Form Tabs (auth.html) ────────────────────────────
function initAuthTabs() {
  const tabs    = document.querySelectorAll('.auth-tab');
  const panels  = document.querySelectorAll('.auth-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === target));
      panels.forEach(p => p.classList.toggle('active', p.dataset.panel === target));
    });
  });
}

// ── Login Form Submit ─────────────────────────────────────
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = form.querySelector('[name="email"]').value.trim();
    const password = form.querySelector('[name="password"]').value;
    const btn      = form.querySelector('button[type="submit"]');
    const errEl    = document.getElementById('login-error');

    btn.textContent = 'Signing in…';
    btn.disabled    = true;
    if (errEl) errEl.textContent = '';

    try {
      // ── Replace with your API ──
      // const res  = await fetch('https://eventflow-b919.onrender.com/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await res.json();
      // if (!res.ok) throw new Error(data.message || 'Login failed');
      // localStorage.setItem('token', data.token);
      // window.location.href = '/dashboard.html';

      // Mock success:
      await new Promise(r => setTimeout(r, 900));
      alert('Login successful! (Connect your API to proceed.)');
    } catch (err) {
      if (errEl) errEl.textContent = err.message;
    } finally {
      btn.textContent = 'Sign in';
      btn.disabled    = false;
    }
  });
}

// ── Register Form Submit ──────────────────────────────────
function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = form.querySelector('[name="name"]').value.trim();
    const email    = form.querySelector('[name="email"]').value.trim();
    const password = form.querySelector('[name="password"]').value;
    const confirm  = form.querySelector('[name="confirm"]').value;
    const btn      = form.querySelector('button[type="submit"]');
    const errEl    = document.getElementById('register-error');

    if (password !== confirm) {
      if (errEl) errEl.textContent = 'Passwords do not match.';
      return;
    }

    btn.textContent = 'Creating account…';
    btn.disabled    = true;
    if (errEl) errEl.textContent = '';

    try {
      // ── Replace with your API ──
      // const res  = await fetch('https://eventflow-b919.onrender.com/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password }),
      // });
      // const data = await res.json();
      // if (!res.ok) throw new Error(data.message || 'Registration failed');
      // window.location.href = 'auth.html'; // redirect to login

      await new Promise(r => setTimeout(r, 900));
      alert('Account created! (Connect your API to proceed.)');
    } catch (err) {
      if (errEl) errEl.textContent = err.message;
    } finally {
      btn.textContent = 'Create account';
      btn.disabled    = false;
    }
  });
}

// ── RSVP / Booking Form ───────────────────────────────────
function initBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  // Pre-fill event from URL params
  const params  = new URLSearchParams(window.location.search);
  const eventId = params.get('event');
  const event   = MOCK_EVENTS.find(e => String(e.id) === eventId);
  const titleEl = document.getElementById('booking-event-title');
  if (event && titleEl) titleEl.textContent = event.title;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name    = form.querySelector('[name="name"]').value.trim();
    const email   = form.querySelector('[name="email"]').value.trim();
    const tickets = form.querySelector('[name="tickets"]').value;
    const btn     = form.querySelector('button[type="submit"]');
    const errEl   = document.getElementById('booking-error');
    const succEl  = document.getElementById('booking-success');

    btn.textContent = 'Booking…';
    btn.disabled    = true;
    if (errEl)  errEl.textContent  = '';
    if (succEl) succEl.textContent = '';

    try {
      // ── Replace with your API ──
      // const token = localStorage.getItem('token');
      // const res   = await fetch('https://eventflow-b919.onrender.com/api/rsvp', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({ eventId, name, email, tickets: Number(tickets) }),
      // });
      // const data = await res.json();
      // if (!res.ok) throw new Error(data.message || 'Booking failed');

      await new Promise(r => setTimeout(r, 900));
      if (succEl) succEl.textContent = `🎉 You're booked! A confirmation has been sent to ${email}.`;
      form.reset();
    } catch (err) {
      if (errEl) errEl.textContent = err.message;
    } finally {
      btn.textContent = 'Confirm booking';
      btn.disabled    = false;
    }
  });
}

// ── Smooth scroll for anchor links ────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ── Boot ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNavbar();
  initMobileNav();
  initReveal();
  initCounters();
  initSmoothScroll();

  // Page-specific
  loadEvents();       // landing page events section
  initAuthTabs();     // auth.html
  initLoginForm();    // auth.html login
  initRegisterForm(); // auth.html register
  initBookingForm();  // booking.html
});
