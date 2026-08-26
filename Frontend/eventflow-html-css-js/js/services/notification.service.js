/* ============================================================
   notification.service.js - Notification helpers for EventFlow
   ============================================================ */

(function (global) {
  const notificationsApi = global.EventFlowNotificationsApi;

  function ensureDependencies() {
    if (!notificationsApi) {
      throw new Error('EventFlowNotificationsApi is required before notification.service.js.');
    }
  }

  function toNumber(value, fallback = 0) {
    const next = Number(value);
    return Number.isFinite(next) ? next : fallback;
  }

  function normalize(item = {}) {
    return {
      id: item.id ?? null,
      message: item.message || '',
      read: Boolean(item.read),
      createdAt: item.created_at || null,
      eventId: item.event ?? null,
      eventName: item.event_name || '',
      raw: item,
    };
  }

  async function listNotifications(params = {}) {
    ensureDependencies();
    const response = await notificationsApi.getNotifications(params);
    const rawItems = Array.isArray(response)
      ? response
      : Array.isArray(response?.results)
        ? response.results
        : [];

    const results = rawItems.map(normalize);

    return {
      count: toNumber(response?.count, results.length),
      next: response?.next || null,
      previous: response?.previous || null,
      unreadCount: results.filter((item) => !item.read).length,
      results,
      raw: response,
    };
  }

  async function markRead(id) {
    ensureDependencies();
    return notificationsApi.markRead(id);
  }

  global.EventFlowNotificationService = {
    listNotifications,
    markRead,
    normalize,
  };
})(window);
