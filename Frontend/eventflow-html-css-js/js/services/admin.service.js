/* ============================================================
   admin.service.js - Admin-only user directory helpers
   ============================================================ */

(function (global) {
  const usersApi = global.EventFlowUsersApi;
  const authService = global.EventFlowAuthService;

  function ensureDependencies() {
    if (!usersApi) {
      throw new Error('EventFlowUsersApi is required before admin.service.js.');
    }
  }

  function normalize(user) {
    if (authService?.normalizeUserProfile) {
      return authService.normalizeUserProfile(user);
    }

    return {
      id: user?.id ?? null,
      username: user?.username || '',
      email: user?.email || '',
      role: user?.role || 'attendee',
      raw: user,
    };
  }

  function toNumber(value, fallback = 0) {
    const next = Number(value);
    return Number.isFinite(next) ? next : fallback;
  }

  async function listUsers(params = {}) {
    ensureDependencies();
    const response = await usersApi.listUsers(params);
    const rawItems = Array.isArray(response)
      ? response
      : Array.isArray(response?.results)
        ? response.results
        : [];

    return {
      count: toNumber(response?.count, rawItems.length),
      next: response?.next || null,
      previous: response?.previous || null,
      results: rawItems.map(normalize),
      raw: response,
    };
  }

  async function getUser(pk) {
    ensureDependencies();
    return normalize(await usersApi.getUserById(pk));
  }

  global.EventFlowAdminService = {
    listUsers,
    getUser,
  };
})(window);
