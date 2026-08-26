/* ============================================================
   notifications.js - List notifications and mark them read
   ============================================================ */

(function (global) {
  const shell = global.EventFlowDashboardShell;
  const notificationService = global.EventFlowNotificationService;
  const formatters = global.EventFlowFormatters;
  const toast = global.EventFlowToast;
  const escapeHtml = toast?.escapeHtml || ((v) => String(v ?? ''));

  function render(notifications) {
    const body = document.getElementById('notifications-body');
    if (!body) return;

    if (!notifications.length) {
      body.innerHTML = `
        <div class="app-empty">
          <strong>You're all caught up</strong>
          Event reminders and invitation updates will appear here.
        </div>`;
      return;
    }

    body.innerHTML = `
      <div class="notif-list">
        ${notifications.map((item) => `
          <div class="notif-item ${item.read ? 'read' : ''}" data-id="${escapeHtml(item.id)}">
            <div class="notif-body">
              <div class="notif-message">${escapeHtml(item.message)}</div>
              <div class="notif-meta">
                ${escapeHtml(formatters.formatDate(item.createdAt))}
                ${item.eventName ? ` · ${escapeHtml(item.eventName)}` : ''}
              </div>
            </div>
            ${item.read
              ? '<span class="badge badge-status">Read</span>'
              : `<button type="button" class="btn-ghost btn-sm" data-mark-read="${escapeHtml(item.id)}">Mark read</button>`}
          </div>`).join('')}
      </div>`;

    wireMarkRead();
  }

  let items = [];

  function wireMarkRead() {
    document.querySelectorAll('[data-mark-read]').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.getAttribute('data-mark-read');
        button.disabled = true;
        button.textContent = 'Marking…';

        try {
          await notificationService.markRead(id);
          items = items.map((item) => (String(item.id) === String(id) ? { ...item, read: true } : item));
          render(items);
          shell.refreshNotificationBadge?.();
          toast?.success?.('Marked as read.');
        } catch (error) {
          button.disabled = false;
          button.textContent = 'Mark read';
          toast?.error?.(error.message || 'Could not update notification.');
        }
      });
    });
  }

  async function boot() {
    const user = await shell.mount({ require: 'auth' });
    if (!user) return;

    const body = document.getElementById('notifications-body');

    try {
      const response = await notificationService.listNotifications();
      items = response.results;
      render(items);
    } catch (error) {
      if (body) {
        body.innerHTML = `<div class="app-empty"><strong>Could not load notifications</strong>${escapeHtml(error.message || '')}</div>`;
      }
    }
  }

  global.EventFlowNotificationsPage = { boot };
})(window);
