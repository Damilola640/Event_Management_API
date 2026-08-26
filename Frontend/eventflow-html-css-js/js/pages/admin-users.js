/* ============================================================
   admin-users.js - Read-only user directory (admin / is_staff)
   ============================================================ */

(function (global) {
  const shell = global.EventFlowDashboardShell;
  const adminService = global.EventFlowAdminService;
  const formatters = global.EventFlowFormatters;
  const escapeHtml = global.EventFlowToast?.escapeHtml || ((v) => String(v ?? ''));

  let users = [];

  function renderTable() {
    const body = document.getElementById('admin-users-body');
    if (!body) return;

    if (!users.length) {
      body.innerHTML = '<div class="app-empty"><strong>No users found</strong></div>';
      return;
    }

    const rows = users.map((user) => {
      const role = escapeHtml(user.role || 'attendee');
      const staff = user.raw?.is_staff ? '<span class="badge badge-role">admin</span>' : '';
      return `
        <tr>
          <td>${escapeHtml(user.username)}</td>
          <td>${escapeHtml(user.email)}</td>
          <td>${escapeHtml(user.fullName || '—')}</td>
          <td><span class="badge badge-role">${role}</span> ${staff}</td>
          <td class="rm-col-actions">
            <button type="button" class="btn-ghost btn-sm" data-view="${escapeHtml(user.id)}">View</button>
          </td>
        </tr>`;
    }).join('');

    body.innerHTML = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Username</th><th>Email</th><th>Name</th><th>Role</th><th class="rm-col-actions">Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

    wireView();
  }

  function openDetail(user) {
    const panel = document.getElementById('admin-user-panel');
    const overlay = document.getElementById('admin-user-overlay');
    const detail = document.getElementById('admin-user-detail');
    if (!panel || !detail) return;

    const raw = user.raw || {};
    const rows = [
      ['Username', user.username],
      ['Email', user.email],
      ['First name', raw.first_name || '—'],
      ['Last name', raw.last_name || '—'],
      ['Role', user.role],
      ['Staff / admin', raw.is_staff ? 'Yes' : 'No'],
      ['Joined', formatters.formatDate(raw.date_joined)],
      ['User ID', user.id],
    ];

    detail.innerHTML = `
      <div class="detail-facts">
        ${rows.map(([label, value]) => `
          <div>
            <div class="detail-fact-label">${escapeHtml(label)}</div>
            <div class="detail-fact-value">${escapeHtml(value)}</div>
          </div>`).join('')}
      </div>`;

    panel.hidden = false;
    if (overlay) overlay.hidden = false;
  }

  function closeDetail() {
    const panel = document.getElementById('admin-user-panel');
    const overlay = document.getElementById('admin-user-overlay');
    if (panel) panel.hidden = true;
    if (overlay) overlay.hidden = true;
  }

  function wireView() {
    document.querySelectorAll('[data-view]').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.getAttribute('data-view');
        const cached = users.find((u) => String(u.id) === String(id));
        // Fetch the single-user endpoint too, to exercise it and get fresh data.
        try {
          const detailed = await adminService.getUser(id);
          openDetail(detailed || cached);
        } catch (error) {
          openDetail(cached);
        }
      });
    });
  }

  async function boot() {
    const user = await shell.mount({ require: 'admin' });
    if (!user) return;

    document.getElementById('admin-user-close')?.addEventListener('click', closeDetail);
    document.getElementById('admin-user-overlay')?.addEventListener('click', closeDetail);

    const body = document.getElementById('admin-users-body');

    try {
      const response = await adminService.listUsers();
      users = response.results;
      renderTable();
    } catch (error) {
      if (body) {
        body.innerHTML = `<div class="app-empty"><strong>Could not load users</strong>${escapeHtml(error.message || '')}</div>`;
      }
    }
  }

  global.EventFlowAdminUsersPage = { boot };
})(window);
