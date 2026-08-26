/* ============================================================
   catalog.api.js - Venue, speaker, sponsor, category & tag
   requests for EventFlow. All live under /api/events/.
   ============================================================ */

(function (global) {
  const client = global.EventFlowApiClient;

  function ensureDependencies() {
    if (!client) {
      throw new Error('EventFlowApiClient is required before catalog.api.js.');
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

  /**
   * Builds a standard REST resource client for a collection endpoint.
   * detailPath supports non-slug primary keys (UUIDs here).
   */
  function makeResource(collectionPath) {
    return {
      list(params = {}) {
        ensureDependencies();
        return client.get(`${collectionPath}${toQueryString(params)}`);
      },
      getOne(id) {
        ensureDependencies();
        return client.get(`${collectionPath}${encodeURIComponent(id)}/`);
      },
      create(payload = {}) {
        ensureDependencies();
        return client.post(collectionPath, payload, { auth: true });
      },
      update(id, payload = {}) {
        ensureDependencies();
        return client.patch(`${collectionPath}${encodeURIComponent(id)}/`, payload, {
          auth: true,
        });
      },
      remove(id) {
        ensureDependencies();
        return client.del(`${collectionPath}${encodeURIComponent(id)}/`, { auth: true });
      },
    };
  }

  const venues = makeResource('/api/events/venues/');
  const speakers = makeResource('/api/events/speakers/');
  const sponsors = makeResource('/api/events/sponsors/');

  // Categories & tags only expose list + create in the backend.
  const categories = {
    list(params = {}) {
      ensureDependencies();
      return client.get(`/api/events/categories/${toQueryString(params)}`);
    },
    create(payload = {}) {
      ensureDependencies();
      return client.post('/api/events/categories/', payload, { auth: true });
    },
  };

  const tags = {
    list(params = {}) {
      ensureDependencies();
      return client.get(`/api/events/tags/${toQueryString(params)}`);
    },
    create(payload = {}) {
      ensureDependencies();
      return client.post('/api/events/tags/', payload, { auth: true });
    },
  };

  global.EventFlowCatalogApi = {
    venues,
    speakers,
    sponsors,
    categories,
    tags,
  };
})(window);
