/* ============================================================
   users.api.js - User profile requests for EventFlow
   ============================================================ */

(function (global) {
  const client = global.EventFlowApiClient;

  function ensureDependencies() {
    if (!client) {
      throw new Error('EventFlowApiClient is required before users.api.js.');
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

  function normalizeProfilePayload(payload = {}) {
    const normalized = {};

    if ('username' in payload) normalized.username = String(payload.username || '').trim();
    if ('email' in payload) normalized.email = String(payload.email || '').trim();
    if ('first_name' in payload || 'firstName' in payload) {
      normalized.first_name = String(
        payload.first_name ?? payload.firstName ?? ''
      ).trim();
    }
    if ('last_name' in payload || 'lastName' in payload) {
      normalized.last_name = String(
        payload.last_name ?? payload.lastName ?? ''
      ).trim();
    }

    return normalized;
  }

  async function getProfile() {
    ensureDependencies();
    return client.get('/api/users/profile/', { auth: true });
  }

  async function updateProfile(payload = {}) {
    ensureDependencies();
    return client.patch('/api/users/profile/', normalizeProfilePayload(payload), {
      auth: true,
    });
  }

  async function listUsers(params = {}) {
    ensureDependencies();
    return client.get(`/api/users/${toQueryString(params)}`, { auth: true });
  }

  async function getUserById(pk) {
    ensureDependencies();
    return client.get(`/api/users/${encodeURIComponent(pk)}/`, { auth: true });
  }

  global.EventFlowUsersApi = {
    getProfile,
    updateProfile,
    listUsers,
    getUserById,
  };
})(window);
