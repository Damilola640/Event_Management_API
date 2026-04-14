/* ============================================================
   site-ui.js - Shared landing-page UI behaviors
   ============================================================ */

(function (global) {
  function initCursor() {
    const cursor = document.getElementById('cursor');
    if (!cursor || global.matchMedia('(pointer: coarse)').matches) return;

    document.body.style.cursor = 'none';

    document.addEventListener('mousemove', (event) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });

    document
      .querySelectorAll('a, button, .ev-card, .feat, .testi-card, .price-card')
      .forEach((element) => {
        element.addEventListener('mouseenter', () => cursor.classList.add('expand'));
        element.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
      });
  }

  function updateNavbarAuthState() {
    const signinLink = document.querySelector('[data-auth-link]');
    const ctaLink = document.querySelector('[data-auth-cta]');
    const mobileAuthLink = document.querySelector('[data-mobile-auth-link]');
    const authService = global.EventFlowAuthService;

    if (!signinLink || !authService?.isLoggedIn) return;

    if (authService.isLoggedIn()) {
      signinLink.textContent = 'My profile';
      signinLink.href = 'pages/profile.html';

      if (mobileAuthLink) {
        mobileAuthLink.textContent = 'My profile';
        mobileAuthLink.href = 'pages/profile.html';
      }

      if (ctaLink) {
        ctaLink.textContent = 'Log out';
        ctaLink.href = '#';
        ctaLink.addEventListener('click', (event) => {
          event.preventDefault();
          authService.logout();
          global.location.reload();
        });
      }
    }
  }

  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    global.addEventListener(
      'scroll',
      () => navbar.classList.toggle('scrolled', global.scrollY > 40),
      { passive: true }
    );

    updateNavbarAuthState();
  }

  function initMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  function initReveal(root = document) {
    const elements = root.querySelectorAll('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));
  }

  function animateCounter(element, target, suffix, decimals = 0) {
    if (!element) return;

    let startTime = null;
    const duration = 1800;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * target;

      element.textContent = `${decimals ? value.toFixed(decimals) : Math.round(value)}${suffix}`;

      if (progress < 1) {
        global.requestAnimationFrame(step);
      }
    };

    global.requestAnimationFrame(step);
  }

  function initCounters() {
    const statsBar = document.querySelector('.stats-bar');
    if (!statsBar) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        animateCounter(document.getElementById('stat-events'), 48, 'K+');
        animateCounter(document.getElementById('stat-tickets'), 3.2, 'M', 1);
        animateCounter(document.getElementById('stat-uptime'), 99, '%');
        animateCounter(document.getElementById('stat-cities'), 120, '+');

        observer.disconnect();
      },
      { threshold: 0.3 }
    );

    observer.observe(statsBar);
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function boot() {
    initCursor();
    initNavbar();
    initMobileNav();
    initReveal();
    initCounters();
    initSmoothScroll();
  }

  global.EventFlowSiteUi = {
    animateCounter,
    boot,
    initCounters,
    initCursor,
    initMobileNav,
    initNavbar,
    initReveal,
    initSmoothScroll,
    updateNavbarAuthState,
  };
})(window);
