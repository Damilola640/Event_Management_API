/* ============================================================
   notifications.api.js - Notification requests for EventFlow
   Endpoints live under /api/events/notifications/.
   ============================================================ */

(function (global) {
  const client = global.EventFlowApiClient;

  function ensureDependencies() {
    if (!client) {
      throw new Error('EventFlowApiClient is required before notifications.api.js.');
    }
  }

  function toQueryString(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      searchParams.append(key, value);
    });

    const query = searchParams.toString();
    return query ? `?${query}` : '';
  }

  async function getNotifications(params = {}) {
    ensureDependencies();
    return client.get(`/api/events/notifications/${toQueryString(params)}`, {
      auth: true,
    });
  }

  async function markRead(id) {
    ensureDependencies();
    return client.post(
      `/api/events/notifications/${encodeURIComponent(id)}/read/`,
      undefined,
      { auth: true }
    );
  }

  global.EventFlowNotificationsApi = {
    getNotifications,
    markRead,
  };
})(window);
