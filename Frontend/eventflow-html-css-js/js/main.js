/* ============================================================
   main.js - Shared application bootstrap for EventFlow
   Loads all modules and boots the current page
   ============================================================ */

(function (global) {
  const scripts = [
    'config.js',
    'utils/storage.js',
    'utils/formatters.js',
    'utils/guards.js',
    'api/client.js',
    'api/auth.api.js',
    'api/users.api.js',
    'api/events.api.js',
    'api/catalog.api.js',
    'api/core.api.js',
    'api/notifications.api.js',
    'services/auth.service.js',
    'services/event.service.js',
    'services/catalog.service.js',
    'services/admin.service.js',
    'services/notification.service.js',
    'ui/toast.js',
    'ui/navbar.js',
    'ui/site-ui.js',
    'ui/event-card.js',
    'ui/dashboard-shell.js',
    'ui/resource-manager.js',
    'pages/home.js',
    'pages/auth.js',
    'pages/booking.js',
    'pages/create-event.js',
    'pages/profile.js',
    'pages/event-detail.js',
    'pages/invitation.js',
    'pages/dashboard.js',
    'pages/my-events.js',
    'pages/my-bookings.js',
    'pages/edit-event.js',
    'pages/notifications.js',
    'pages/venues.js',
    'pages/speakers.js',
    'pages/sponsors.js',
    'pages/taxonomy.js',
    'pages/admin-users.js',
  ];

  let loadedCount = 0;

  function getJsBase() {
    return window.location.pathname.includes('/pages/') ? '../js/' : 'js/';
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = getJsBase() + src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  function detectPage() {
    // New pages declare themselves via <body data-page="…">.
    if (document.body.dataset.page) {
      return document.body.dataset.page;
    }

    // Legacy element-based detection for the original pages.
    if (document.getElementById('events-container')) return 'home';
    if (document.getElementById('login-form') || document.getElementById('register-form')) {
      return 'auth';
    }
    if (document.getElementById('booking-form')) return 'booking';
    if (document.getElementById('create-event-form')) return 'create-event';
    if (document.getElementById('profile-form')) return 'profile';
    return 'unknown';
  }

  function bootPage(page) {
    const bootMap = {
      home: global.EventFlowHomePage?.boot,
      auth: global.EventFlowAuthPage?.boot,
      booking: global.EventFlowBookingPage?.boot,
      'create-event': global.EventFlowCreateEventPage?.boot,
      profile: global.EventFlowProfilePage?.boot,
      'event-detail': global.EventFlowEventDetailPage?.boot,
      invitation: global.EventFlowInvitationPage?.boot,
      dashboard: global.EventFlowDashboardPage?.boot,
      'my-events': global.EventFlowMyEventsPage?.boot,
      'my-bookings': global.EventFlowMyBookingsPage?.boot,
      'edit-event': global.EventFlowEditEventPage?.boot,
      notifications: global.EventFlowNotificationsPage?.boot,
      venues: global.EventFlowVenuesPage?.boot,
      speakers: global.EventFlowSpeakersPage?.boot,
      sponsors: global.EventFlowSponsorsPage?.boot,
      taxonomy: global.EventFlowTaxonomyPage?.boot,
      'admin-users': global.EventFlowAdminUsersPage?.boot,
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

  async function loadAllScripts() {
    for (const src of scripts) {
      await loadScript(src);
    }
    boot();
  }

  // Start loading all scripts and boot when done
  loadAllScripts().catch(error => {
    console.error('Failed to load scripts:', error);
  });

  global.EventFlowApp = {
    boot,
    bootPage,
    detectPage,
  };
})(window);
