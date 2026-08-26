/* ============================================================
   dashboard.js - Authenticated dashboard overview
   ============================================================ */

(function (global) {
  const shell = global.EventFlowDashboardShell;
  const eventService = global.EventFlowEventService;
  const notificationService = global.EventFlowNotificationService;
  const formatters = global.EventFlowFormatters;
  const escapeHtml = global.EventFlowToast?.escapeHtml || ((v) => String(v ?? ''));

  function statTile(label, value, sub) {
    return `
      <div class="stat-tile">
        <div class="stat-tile-label">${escapeHtml(label)}</div>
        <div class="stat-tile-value">${escapeHtml(value)}</div>
        ${sub ? `<div class="stat-tile-sub">${escapeHtml(sub)}</div>` : ''}
      </div>`;
  }

  function actionLink(href, label, primary) {
    return `<a class="${primary ? 'btn-primary' : 'btn-ghost'} btn-sm" href="${href}">${escapeHtml(label)}</a>`;
  }

  function renderGreeting(user) {
    const box = document.getElementById('dashboard-greeting');
    if (!box) return;
    box.innerHTML = `
      <h2 style="font-family:var(--font-display);font-size:1.6rem;font-weight:700;color:var(--ink);margin-bottom:0.35rem">
        Welcome back, ${escapeHtml(user.firstName || user.username || 'there')} 👋
      </h2>
      <p style="color:var(--ink-muted)">
        You're signed in as <span class="badge badge-role">${escapeHtml(user.role)}</span>
        ${user.raw?.is_staff ? '<span class="badge badge-role" style="margin-left:0.35rem">admin</span>' : ''}
      </p>`;
  }

  function renderActions(user) {
    const box = document.getElementById('dashboard-actions');
    if (!box) return;

    const actions = [actionLink('../index.html#events', 'Browse events', true)];
    if (user.isOrganizer) {
      actions.push(actionLink('create-event.html', 'Create event'));
      actions.push(actionLink('my-events.html', 'My events'));
      actions.push(actionLink('venues.html', 'Manage venues'));
    }
    actions.push(actionLink('my-bookings.html', 'My bookings'));
    actions.push(actionLink('profile.html', 'Edit profile'));

    box.innerHTML = actions.join('');
  }

  async function renderStats(user) {
    const box = document.getElementById('dashboard-stats');
    if (!box) return;

    const [bookings, notifications, organized] = await Promise.allSettled([
      eventService.getMyRegistrations(),
      notificationService.listNotifications(),
      user.isOrganizer
        ? eventService.listEvents({ organizer: user.username })
        : Promise.resolve(null),
    ]);

    const tiles = [];

    const bookingCount = bookings.status === 'fulfilled' ? bookings.value.count : '—';
    tiles.push(statTile('My bookings', bookingCount, 'Events you registered for'));

    if (user.isOrganizer) {
      const organizedCount = organized.status === 'fulfilled' && organized.value ? organized.value.count : '—';
      tiles.push(statTile('Events organized', organizedCount, 'Live on your account'));
    }

    const unread = notifications.status === 'fulfilled' ? notifications.value.unreadCount : '—';
    tiles.push(statTile('Unread notifications', unread, 'Reminders & invites'));

    box.innerHTML = tiles.join('');
  }

  async function renderRecentNotifications() {
    const box = document.getElementById('dashboard-notifications');
    if (!box) return;

    try {
      const { results } = await notificationService.listNotifications();
      if (!results.length) {
        box.innerHTML = '<p class="app-message" style="padding:0.5rem 0">No notifications yet.</p>';
        return;
      }

      box.innerHTML = `
        <div class="notif-list">
          ${results.slice(0, 5).map((item) => `
            <div class="notif-item ${item.read ? 'read' : ''}">
              <div class="notif-body">
                <div class="notif-message">${escapeHtml(item.message)}</div>
                <div class="notif-meta">${escapeHtml(formatters.formatDate(item.createdAt))}</div>
              </div>
            </div>`).join('')}
        </div>
        <a class="btn-ghost btn-sm" style="margin-top:1rem" href="notifications.html">View all</a>`;
    } catch (error) {
      box.innerHTML = `<p class="rm-error">${escapeHtml(error.message || 'Could not load notifications.')}</p>`;
    }
  }

  async function boot() {
    const user = await shell.mount({ require: 'auth' });
    if (!user) return;

    renderGreeting(user);
    renderActions(user);
    renderStats(user);
    renderRecentNotifications();
  }

  global.EventFlowDashboardPage = { boot };
})(window);
