/* ============================================================
   event.service.js - Event mappers and frontend-friendly helpers
   ============================================================ */

(function (global) {
  const eventsApi = global.EventFlowEventsApi;

  function ensureDependencies() {
    if (!eventsApi) {
      throw new Error('EventFlowEventsApi is required before event.service.js.');
    }
  }

  function toArray(value) {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null) return [];
    return [value];
  }

  function toNumber(value, fallback = 0) {
    const nextValue = Number(value);
    return Number.isFinite(nextValue) ? nextValue : fallback;
  }

  function toTrimmedString(value) {
    return String(value ?? '').trim();
  }

  function normalizeVenue(venue, locationDetails) {
    if (venue && typeof venue === 'object') {
      return {
        id: venue.id ?? null,
        slug: venue.slug || null,
        name: venue.name || venue.title || 'Venue TBC',
        city: venue.city || '',
        state: venue.state || '',
        address: venue.address || locationDetails || '',
        raw: venue,
      };
    }

    return {
      id: null,
      slug: null,
      name: venue || 'Venue TBC',
      city: '',
      state: '',
      address: locationDetails || '',
      raw: venue,
    };
  }

  function normalizeTaxonomyItem(item, fallbackType) {
    if (item && typeof item === 'object') {
      return {
        id: item.id ?? null,
        name: item.name || item.title || item.slug || '',
        slug: item.slug || null,
        type: item.type || fallbackType,
        raw: item,
      };
    }

    return {
      id: null,
      name: String(item || ''),
      slug: null,
      type: fallbackType,
      raw: item,
    };
  }

  function normalizeEventSpeaker(item = {}) {
    // EventSpeakerSerializer renders `speaker` as a display string.
    return {
      name: toTrimmedString(item.speaker) || 'Speaker',
      topic: toTrimmedString(item.presentation_topic),
      startTime: item.presentation_start_time || null,
      endTime: item.presentation_end_time || null,
      raw: item,
    };
  }

  function normalizeEventSponsor(item = {}) {
    // EventSponsorSerializer renders `sponsor` as a display string.
    return {
      name: toTrimmedString(item.sponsor) || 'Sponsor',
      level: toTrimmedString(item.sponsorship_level),
      amount: item.sponsorship_amount != null ? toNumber(item.sponsorship_amount, 0) : null,
      raw: item,
    };
  }

  function mapEventFromApi(event = {}) {
    const categories = toArray(event.categories).map((item) =>
      normalizeTaxonomyItem(item, 'category')
    );
    const tags = toArray(event.tags).map((item) => normalizeTaxonomyItem(item, 'tag'));
    const venue = normalizeVenue(event.venue, event.location_details);
    const speakers = toArray(event.speakers).map(normalizeEventSpeaker);
    const sponsors = toArray(event.sponsors).map(normalizeEventSponsor);
    const capacity = toNumber(event.max_attendees ?? event.capacity, 0);
    const registeredCount = toNumber(
      event.registered_count ?? event.attendees_count ?? event.registrations_count,
      0
    );
    const price = toNumber(event.ticket_price, 0);
    const primaryCategory = categories[0] || { id: null, name: 'Event', slug: null };
    const progress = capacity > 0
      ? Math.min(Math.round((registeredCount / capacity) * 100), 100)
      : 0;

    return {
      id: event.id ?? null,
      slug: event.slug || '',
      name: event.name || event.title || '',
      title: event.name || event.title || 'Untitled event',
      description: event.description || '',
      shortDescription: event.short_description || event.description || '',
      startDate: event.start_date || null,
      endDate: event.end_date || null,
      startTime: event.start_time || null,
      endTime: event.end_time || null,
      status: event.status || 'draft',
      venue,
      venueName: venue.name,
      location: event.location || venue.name || 'Venue TBC',
      locationDetails: event.location_details || venue.address || '',
      categories,
      category: primaryCategory,
      categoryNames: categories.map((item) => item.name).filter(Boolean),
      tags,
      tagNames: tags.map((item) => item.name).filter(Boolean),
      speakers,
      sponsors,
      capacity,
      maxAttendees: capacity,
      registeredCount,
      registered_count: registeredCount,
      spotsLeft: Math.max(capacity - registeredCount, 0),
      progress,
      ticketPrice: price,
      ticket_price: price,
      isFree: price <= 0,
      isPrivate: Boolean(event.is_private),
      detailUrl: event.slug ? `event-detail.html?slug=${event.slug}` : null,
      bookingUrl: event.slug ? `event-detail.html?slug=${event.slug}` : null,
      editUrl: event.slug ? `edit-event.html?slug=${event.slug}` : null,
      image: event.image || event.banner || null,
      organizer: event.organizer || null,
      raw: event,
    };
  }

  function mapPaginatedEventsResponse(payload) {
    if (Array.isArray(payload)) {
      const results = payload.map(mapEventFromApi);

      return {
        count: results.length,
        next: null,
        previous: null,
        results,
        raw: payload,
      };
    }

    const rawResults = Array.isArray(payload?.results) ? payload.results : [];

    return {
      count: toNumber(payload?.count, rawResults.length),
      next: payload?.next || null,
      previous: payload?.previous || null,
      results: rawResults.map(mapEventFromApi),
      raw: payload,
    };
  }

  function mapCollection(payload, fallbackType) {
    const rawItems = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.results)
        ? payload.results
        : [];

    return rawItems.map((item) => normalizeTaxonomyItem(item, fallbackType));
  }

  function normalizeCreateEventPayload(payload = {}) {
    return {
      name: toTrimmedString(payload.name),
      description: toTrimmedString(payload.description),
      start_date: toTrimmedString(payload.start_date ?? payload.startDate),
      end_date: toTrimmedString(payload.end_date ?? payload.endDate),
      start_time: toTrimmedString(payload.start_time ?? payload.startTime),
      end_time: toTrimmedString(payload.end_time ?? payload.endTime),
      venue: payload.venue ? toTrimmedString(payload.venue) : null,
      location_details: toTrimmedString(
        payload.location_details ?? payload.locationDetails
      ),
      max_attendees: toNumber(payload.max_attendees ?? payload.maxAttendees, 0),
      ticket_price: toNumber(payload.ticket_price ?? payload.ticketPrice, 0),
      is_private: Boolean(payload.is_private ?? payload.isPrivate),
      categories: toArray(payload.categories).map((item) => toTrimmedString(item)).filter(Boolean),
      tags: toArray(payload.tags).map((item) => toTrimmedString(item)).filter(Boolean),
    };
  }

  async function listEvents(params = {}) {
    ensureDependencies();
    const response = await eventsApi.getEvents(params);
    return mapPaginatedEventsResponse(response);
  }

  async function getEventBySlug(slug) {
    ensureDependencies();
    const response = await eventsApi.getEventBySlug(slug);
    return mapEventFromApi(response);
  }

  async function createEvent(payload = {}) {
    ensureDependencies();
    const response = await eventsApi.createEvent(normalizeCreateEventPayload(payload));
    return mapEventFromApi(response);
  }

  async function updateEvent(slug, payload = {}) {
    ensureDependencies();
    const response = await eventsApi.updateEvent(slug, normalizeCreateEventPayload(payload));
    return mapEventFromApi(response);
  }

  async function deleteEvent(slug) {
    ensureDependencies();
    return eventsApi.deleteEvent(slug);
  }

  async function sendInvitation(slug, email) {
    ensureDependencies();
    return eventsApi.sendInvitation(slug, email);
  }

  async function acceptInvitation(token) {
    ensureDependencies();
    return eventsApi.acceptInvitation(token);
  }

  function normalizeRegistration(item = {}) {
    return {
      id: item.id ?? null,
      status: item.status || 'going',
      registeredAt: item.registration_date || null,
      eventId: item.event ?? null,
      eventName: item.event_name || 'Event',
      eventSlug: item.event_slug || null,
      detailUrl: item.event_slug
        ? `event-detail.html?slug=${item.event_slug}`
        : null,
      raw: item,
    };
  }

  async function getMyRegistrations(params = {}) {
    ensureDependencies();
    const response = await eventsApi.getMyRegistrations(params);
    const rawItems = Array.isArray(response)
      ? response
      : Array.isArray(response?.results)
        ? response.results
        : [];

    return {
      count: toNumber(response?.count, rawItems.length),
      next: response?.next || null,
      previous: response?.previous || null,
      results: rawItems.map(normalizeRegistration),
      raw: response,
    };
  }

  async function registerForEvent(slug) {
    ensureDependencies();
    return eventsApi.registerForEvent(slug);
  }

  async function getCategories(params = {}) {
    ensureDependencies();
    return mapCollection(await eventsApi.getCategories(params), 'category');
  }

  async function getTags(params = {}) {
    ensureDependencies();
    return mapCollection(await eventsApi.getTags(params), 'tag');
  }

  async function getVenues(params = {}) {
    ensureDependencies();
    const response = await eventsApi.getVenues(params);
    const rawItems = Array.isArray(response)
      ? response
      : Array.isArray(response?.results)
        ? response.results
        : [];

    return rawItems.map((venue) => normalizeVenue(venue, venue?.address));
  }

  global.EventFlowEventService = {
    createEvent,
    updateEvent,
    deleteEvent,
    sendInvitation,
    acceptInvitation,
    getMyRegistrations,
    getCategories,
    getEventBySlug,
    getTags,
    getVenues,
    listEvents,
    mapCollection,
    normalizeCreateEventPayload,
    mapEventFromApi,
    mapPaginatedEventsResponse,
    normalizeRegistration,
    normalizeTaxonomyItem,
    normalizeVenue,
    registerForEvent,
  };
})(window);
