/* ============================================================
   my-bookings.js - The current user's event registrations
   ============================================================ */

(function (global) {
  const shell = global.EventFlowDashboardShell;
  const eventService = global.EventFlowEventService;
  const formatters = global.EventFlowFormatters;
  const escapeHtml = global.EventFlowToast?.escapeHtml || ((v) => String(v ?? ''));

  function renderBookings(registrations) {
    const body = document.getElementById('my-bookings-body');
    if (!body) return;

    if (!registrations.length) {
      body.innerHTML = `
        <div class="app-empty">
          <strong>No bookings yet</strong>
          When you register for an event it will show up here.
          <div style="margin-top:1rem"><a class="btn-primary btn-sm" href="../index.html#events">Browse events</a></div>
        </div>`;
      return;
    }

    const rows = registrations.map((reg) => {
      const status = escapeHtml(reg.status || 'going');
      const nameCell = reg.detailUrl
        ? `<a href="${escapeHtml(reg.detailUrl)}">${escapeHtml(reg.eventName)}</a>`
        : escapeHtml(reg.eventName);
      return `
        <tr>
          <td>${nameCell}</td>
          <td><span class="badge badge-${status}">${status.replace('_', ' ')}</span></td>
          <td>${escapeHtml(formatters.formatDate(reg.registeredAt))}</td>
        </tr>`;
    }).join('');

    body.innerHTML = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Event</th><th>Status</th><th>Registered</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  async function boot() {
    const user = await shell.mount({ require: 'auth' });
    if (!user) return;

    const body = document.getElementById('my-bookings-body');

    try {
      const response = await eventService.getMyRegistrations();
      renderBookings(response.results);
    } catch (error) {
      if (body) {
        body.innerHTML = `<div class="app-empty"><strong>Could not load bookings</strong>${escapeHtml(error.message || '')}</div>`;
      }
    }
  }

  global.EventFlowMyBookingsPage = { boot };
})(window);
