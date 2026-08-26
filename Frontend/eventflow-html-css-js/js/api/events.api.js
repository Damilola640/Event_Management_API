/* ============================================================
   events.api.js - Event and taxonomy requests for EventFlow
   ============================================================ */

(function (global) {
  const client = global.EventFlowApiClient;

  function ensureDependencies() {
    if (!client) {
      throw new Error('EventFlowApiClient is required before events.api.js.');
    }
  }

  function toQueryString(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null && item !== '') {
            searchParams.append(key, item);
          }
        });
        return;
      }

      searchParams.append(key, value);
    });

    const query = searchParams.toString();
    return query ? `?${query}` : '';
  }

  async function getEvents(params = {}) {
    ensureDependencies();
    return client.get(`/api/events/${toQueryString(params)}`);
  }

  async function getEventBySlug(slug) {
    ensureDependencies();
    return client.get(`/api/events/${encodeURIComponent(slug)}/`);
  }

  async function createEvent(payload = {}) {
    ensureDependencies();
    return client.post('/api/events/', payload, { auth: true });
  }

  async function updateEvent(slug, payload = {}) {
    ensureDependencies();
    return client.patch(`/api/events/${encodeURIComponent(slug)}/`, payload, {
      auth: true,
    });
  }

  async function deleteEvent(slug) {
    ensureDependencies();
    return client.del(`/api/events/${encodeURIComponent(slug)}/`, { auth: true });
  }

  async function registerForEvent(slug) {
    ensureDependencies();
    return client.post(`/api/events/${encodeURIComponent(slug)}/register/`, undefined, {
      auth: true,
    });
  }

  async function sendInvitation(slug, email) {
    ensureDependencies();
    return client.post(
      `/api/events/${encodeURIComponent(slug)}/invitations/`,
      { email: String(email || '').trim() },
      { auth: true }
    );
  }

  async function acceptInvitation(token) {
    ensureDependencies();
    return client.get(`/api/events/invitations/accept/${encodeURIComponent(token)}/`);
  }

  async function getMyRegistrations(params = {}) {
    ensureDependencies();
    return client.get(`/api/events/registrations/${toQueryString(params)}`, {
      auth: true,
    });
  }

  async function getCategories(params = {}) {
    ensureDependencies();
    return client.get(`/api/events/categories/${toQueryString(params)}`);
  }

  async function getTags(params = {}) {
    ensureDependencies();
    return client.get(`/api/events/tags/${toQueryString(params)}`);
  }

  async function getVenues(params = {}) {
    ensureDependencies();
    return client.get(`/api/events/venues/${toQueryString(params)}`);
  }

  global.EventFlowEventsApi = {
    createEvent,
    updateEvent,
    deleteEvent,
    getEvents,
    getEventBySlug,
    registerForEvent,
    sendInvitation,
    acceptInvitation,
    getMyRegistrations,
    getCategories,
    getTags,
    getVenues,
  };
})(window);
