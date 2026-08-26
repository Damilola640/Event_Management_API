/* ============================================================
   dashboard-shell.js - Authenticated app shell (sidebar + topbar)
   Renders into #app-sidebar and #app-topbar on dashboard pages.
   Role-aware: attendee / organizer / admin sections.
   ============================================================ */

(function (global) {
  const authService = global.EventFlowAuthService;
  const guards = global.EventFlowGuards;
  const coreApi = global.EventFlowCoreApi;
  const notificationService = global.EventFlowNotificationService;
  const escapeHtml = global.EventFlowToast?.escapeHtml || ((v) => String(v ?? ''));

  const ICONS = {
    dashboard: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
    browse: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    bookings: '<path d="M4 5h16v14H4z"/><path d="M4 10h16"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    events: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    venue: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 19v3"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M8.2 13.5 7 22l5-3 5 3-1.2-8.5"/>',
    tag: '<path d="M20 12l-8 8-8-8V4h8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
  };

  function icon(name) {
    const path = ICONS[name] || '';
    return `<svg class="app-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  }

  function initials(user) {
    const source = user?.fullName || user?.username || user?.email || 'U';
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'U';
  }

  function navLink(item, active) {
    const isActive = item.nav === active;
    const badge = item.badge
      ? `<span class="app-nav-badge" data-notif-badge hidden></span>`
      : '';
    return `
      <a class="app-nav-link${isActive ? ' active' : ''}" data-nav="${item.nav}" href="${item.href}">
        ${icon(item.icon)}<span>${escapeHtml(item.label)}</span>${badge}
      </a>`;
  }

  function navGroup(label, items, active) {
    if (!items.length) return '';
    return `
      <div class="app-nav-group">
        <p class="app-nav-label">${escapeHtml(label)}</p>
        ${items.map((item) => navLink(item, active)).join('')}
      </div>`;
  }

  function buildSidebar(user, active) {
    const isOrganizer = Boolean(user?.isOrganizer);
    const isAdmin = Boolean(user?.raw?.is_staff || user?.raw?.is_superuser);

    const main = [
      { nav: 'dashboard', href: 'dashboard.html', label: 'Dashboard', icon: 'dashboard' },
      { nav: 'browse', href: '../index.html#events', label: 'Browse events', icon: 'browse' },
      { nav: 'my-bookings', href: 'my-bookings.html', label: 'My bookings', icon: 'bookings' },
      { nav: 'notifications', href: 'notifications.html', label: 'Notifications', icon: 'bell', badge: true },
    ];

    const organizer = isOrganizer
      ? [
          { nav: 'my-events', href: 'my-events.html', label: 'My events', icon: 'events' },
          { nav: 'create-event', href: 'create-event.html', label: 'Create event', icon: 'plus' },
          { nav: 'venues', href: 'venues.html', label: 'Venues', icon: 'venue' },
          { nav: 'speakers', href: 'speakers.html', label: 'Speakers', icon: 'mic' },
          { nav: 'sponsors', href: 'sponsors.html', label: 'Sponsors', icon: 'award' },
          { nav: 'taxonomy', href: 'taxonomy.html', label: 'Categories & tags', icon: 'tag' },
        ]
      : [];

    const admin = isAdmin
      ? [{ nav: 'admin-users', href: 'admin-users.html', label: 'Users', icon: 'users' }]
      : [];

    const account = [
      { nav: 'profile', href: 'profile.html', label: 'Profile', icon: 'user' },
    ];

    return `
      <div class="app-sidebar-inner">
        <a class="app-logo" href="../index.html">event<span>flow</span></a>
        <nav class="app-nav" aria-label="Dashboard">
          ${navGroup('Main', main, active)}
          ${navGroup('Organizer', organizer, active)}
          ${navGroup('Administration', admin, active)}
          ${navGroup('Account', account, active)}
          <div class="app-nav-group">
            <button type="button" class="app-nav-link app-logout" data-logout>
              ${icon('logout')}<span>Log out</span>
            </button>
          </div>
        </nav>
      </div>`;
  }

  function buildTopbar(user, title) {
    return `
      <button type="button" class="app-menu-toggle" data-sidebar-toggle aria-label="Toggle navigation">
        <span></span><span></span><span></span>
      </button>
      <div class="app-topbar-title">
        <h1>${escapeHtml(title || 'Dashboard')}</h1>
      </div>
      <div class="app-topbar-right">
        <span class="app-health" data-health title="Live API status">
          <span class="app-health-dot"></span>
          <span data-health-text>Checking…</span>
        </span>
        <div class="app-user-chip">
          <span class="app-user-avatar">${escapeHtml(initials(user))}</span>
          <span class="app-user-meta">
            <span class="app-user-name">${escapeHtml(user?.fullName || user?.username || 'User')}</span>
            <span class="app-user-role">${escapeHtml(user?.role || 'attendee')}</span>
          </span>
        </div>
      </div>`;
  }

  function wireEvents() {
    const layout = document.querySelector('.app-layout');

    document.querySelectorAll('[data-logout]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        authService?.logout?.();
        global.location.href = '../index.html';
      });
    });

    const toggle = document.querySelector('[data-sidebar-toggle]');
    if (toggle && layout) {
      toggle.addEventListener('click', () => layout.classList.toggle('sidebar-open'));
    }

    // Close the mobile sidebar after tapping a link.
    document.querySelectorAll('.app-nav-link[href]').forEach((link) => {
      link.addEventListener('click', () => layout?.classList.remove('sidebar-open'));
    });
  }

  async function runHealthCheck() {
    const wrap = document.querySelector('[data-health]');
    const text = document.querySelector('[data-health-text]');
    if (!wrap || !coreApi?.getHealth) return;

    try {
      const health = await coreApi.getHealth();
      wrap.classList.add('healthy');
      if (text) text.textContent = health?.status === 'ok' ? 'Operational' : 'Reachable';
    } catch (error) {
      wrap.classList.add('unhealthy');
      if (text) text.textContent = 'API offline';
    }
  }

  async function refreshNotificationBadge() {
    const badge = document.querySelector('[data-notif-badge]');
    if (!badge || !notificationService?.listNotifications) return;

    try {
      const { unreadCount } = await notificationService.listNotifications();
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    } catch (error) {
      badge.hidden = true;
    }
  }

  function renderShell(user, options) {
    const active = options.active || document.body.dataset.page || '';
    const title = options.title || document.body.dataset.title || 'Dashboard';

    const sidebar = document.getElementById('app-sidebar');
    const topbar = document.getElementById('app-topbar');

    if (sidebar) sidebar.innerHTML = buildSidebar(user, active);
    if (topbar) topbar.innerHTML = buildTopbar(user, title);

    wireEvents();
    runHealthCheck();
    refreshNotificationBadge();
  }

  /**
   * Guards the page, renders the shell, and returns the current user.
   * options.require: 'auth' (default) | 'organizer' | 'admin'
   */
  async function mount(options = {}) {
    if (!authService || !guards) {
      throw new Error('Auth service and guards are required before dashboard-shell.js.');
    }

    const need = options.require || 'auth';

    if (need === 'organizer') {
      const ok = await guards.requireOrganizer({
        deniedRedirect: 'dashboard.html',
        deniedMessage: options.deniedMessage || 'Organizer access is required.',
      });
      if (ok !== true) return null;
    } else if (need === 'admin') {
      const adminUser = await guards.requireAdmin({ deniedRedirect: 'dashboard.html' });
      if (!adminUser) return null;
    } else if (!authService.isLoggedIn()) {
      guards.redirectToAuth();
      return null;
    }

    const user = await authService.getCurrentUser();
    if (!user) {
      guards.redirectToAuth();
      return null;
    }

    renderShell(user, options);
    return user;
  }

  global.EventFlowDashboardShell = {
    mount,
    refreshNotificationBadge,
  };
})(window);
