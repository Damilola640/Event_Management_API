/* ============================================================
   main.js - Shared application bootstrap for EventFlow
   ============================================================ */

(function (global) {
  function detectPage() {
    if (document.getElementById('events-container')) return 'home';
    if (document.getElementById('login-form') || document.getElementById('register-form')) {
      return 'auth';
    }
    if (document.getElementById('booking-form')) return 'booking';
    if (document.getElementById('profile-form')) return 'profile';
    return 'unknown';
  }

  function bootPage(page) {
    const bootMap = {
      home: global.EventFlowHomePage?.boot,
      auth: global.EventFlowAuthPage?.boot,
      booking: global.EventFlowBookingPage?.boot,
      profile: global.EventFlowProfilePage?.boot,
    };

    const boot = bootMap[page];
    if (typeof boot === 'function') {
      return boot();
    }

    return undefined;
  }

  function boot() {
    const page = detectPage();
    bootPage(page);
  }

  global.EventFlowApp = {
    boot,
    bootPage,
    detectPage,
  };

  document.addEventListener('DOMContentLoaded', boot);
})(window);
