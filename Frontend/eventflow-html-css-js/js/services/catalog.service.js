/* ============================================================
   catalog.service.js - Venue, speaker, sponsor, category & tag
   helpers. Shapes backend data into frontend-friendly models
   and normalizes create/update payloads.
   ============================================================ */

(function (global) {
  const catalogApi = global.EventFlowCatalogApi;

  function ensureDependencies() {
    if (!catalogApi) {
      throw new Error('EventFlowCatalogApi is required before catalog.service.js.');
    }
  }

  function toItems(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
  }

  function trim(value) {
    return String(value ?? '').trim();
  }

  function nullableNumber(value) {
    if (trim(value) === '') return null;
    const next = Number(value);
    return Number.isFinite(next) ? next : null;
  }

  function nullableString(value) {
    const trimmed = trim(value);
    return trimmed === '' ? null : trimmed;
  }

  // --- Normalizers -----------------------------------------------------------
  function normalizeVenue(item = {}) {
    return {
      id: item.id ?? null,
      name: item.name || '',
      address: item.address || '',
      city: item.city || '',
      state: item.state || '',
      zip_code: item.zip_code || '',
      capacity: item.capacity ?? '',
      contact_person: item.contact_person || '',
      contact_email: item.contact_email || '',
      phone_number: item.phone_number || '',
      raw: item,
    };
  }

  function normalizeSpeaker(item = {}) {
    return {
      id: item.id ?? null,
      first_name: item.first_name || '',
      last_name: item.last_name || '',
      fullName: [item.first_name, item.last_name].filter(Boolean).join(' ').trim(),
      email: item.email || '',
      bio: item.bio || '',
      organization: item.organization || '',
      title: item.title || '',
      photo_url: item.photo_url || '',
      raw: item,
    };
  }

  function normalizeSponsor(item = {}) {
    return {
      id: item.id ?? null,
      name: item.name || '',
      contact_person: item.contact_person || '',
      contact_email: item.contact_email || '',
      phone_number: item.phone_number || '',
      logo_url: item.logo_url || '',
      website_url: item.website_url || '',
      raw: item,
    };
  }

  function normalizeTaxonomy(item = {}) {
    return {
      id: item.id ?? null,
      name: item.name || '',
      slug: item.slug || '',
      raw: item,
    };
  }

  // --- Payload builders ------------------------------------------------------
  function buildVenuePayload(values = {}) {
    return {
      name: trim(values.name),
      address: trim(values.address),
      city: trim(values.city),
      state: trim(values.state),
      zip_code: trim(values.zip_code),
      capacity: nullableNumber(values.capacity) ?? 0,
      contact_person: nullableString(values.contact_person),
      contact_email: nullableString(values.contact_email),
      phone_number: nullableString(values.phone_number),
    };
  }

  function buildSpeakerPayload(values = {}) {
    return {
      first_name: trim(values.first_name),
      last_name: trim(values.last_name),
      email: trim(values.email),
      bio: nullableString(values.bio),
      organization: nullableString(values.organization),
      title: nullableString(values.title),
      photo_url: nullableString(values.photo_url),
    };
  }

  function buildSponsorPayload(values = {}) {
    return {
      name: trim(values.name),
      contact_person: nullableString(values.contact_person),
      contact_email: nullableString(values.contact_email),
      phone_number: nullableString(values.phone_number),
      logo_url: nullableString(values.logo_url),
      website_url: nullableString(values.website_url),
    };
  }

  /**
   * Wraps a raw resource client + normalizer/payload builder into a service
   * with the shape resource-manager.js expects: list/create/update/remove.
   */
  function makeResourceService(resource, normalize, buildPayload) {
    return {
      async list(params = {}) {
        ensureDependencies();
        return toItems(await resource.list(params)).map(normalize);
      },
      async getOne(id) {
        ensureDependencies();
        return normalize(await resource.getOne(id));
      },
      async create(values = {}) {
        ensureDependencies();
        return normalize(await resource.create(buildPayload(values)));
      },
      async update(id, values = {}) {
        ensureDependencies();
        return normalize(await resource.update(id, buildPayload(values)));
      },
      async remove(id) {
        ensureDependencies();
        return resource.remove(id);
      },
    };
  }

  const venues = makeResourceService(catalogApi?.venues || {}, normalizeVenue, buildVenuePayload);
  const speakers = makeResourceService(catalogApi?.speakers || {}, normalizeSpeaker, buildSpeakerPayload);
  const sponsors = makeResourceService(catalogApi?.sponsors || {}, normalizeSponsor, buildSponsorPayload);

  // Categories & tags: list + create only (backend has no detail routes).
  const categories = {
    async list(params = {}) {
      ensureDependencies();
      return toItems(await catalogApi.categories.list(params)).map(normalizeTaxonomy);
    },
    async create(values = {}) {
      ensureDependencies();
      return normalizeTaxonomy(await catalogApi.categories.create({ name: trim(values.name) }));
    },
  };

  const tags = {
    async list(params = {}) {
      ensureDependencies();
      return toItems(await catalogApi.tags.list(params)).map(normalizeTaxonomy);
    },
    async create(values = {}) {
      ensureDependencies();
      return normalizeTaxonomy(await catalogApi.tags.create({ name: trim(values.name) }));
    },
  };

  global.EventFlowCatalogService = {
    venues,
    speakers,
    sponsors,
    categories,
    tags,
    normalizeVenue,
    normalizeSpeaker,
    normalizeSponsor,
    normalizeTaxonomy,
  };
})(window);
