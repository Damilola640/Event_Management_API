/* ============================================================
   home.js - Homepage controller for EventFlow
   ============================================================ */

(function (global) {
  const eventService = global.EventFlowEventService;
  const eventCard = global.EventFlowEventCard;
  const siteUi = global.EventFlowSiteUi;

  const FILTER_FIELDS = [
    "search",
    "category",
    "tag",
    "city",
    "state",
    "start_date",
    "end_date",
  ];

  function setContainerMessage(container, message) {
    if (!container) return;

    container.innerHTML = "";

    const messageElement = document.createElement("p");
    messageElement.className = "event-list-message";
    messageElement.textContent = message;
    container.appendChild(messageElement);
  }

  function setFilterStatus(message) {
    const status = document.getElementById("event-filter-status");

    if (status) {
      status.textContent = message || "";
    }
  }

  function getFilterForm() {
    return document.getElementById("event-filter-form");
  }

  function cleanFilterValue(value) {
    return String(value || "").trim();
  }

  function collectFilterValues(form = getFilterForm()) {
    if (!form) return {};

    const formData = new FormData(form);

    return FILTER_FIELDS.reduce((filters, field) => {
      const value = cleanFilterValue(formData.get(field));

      if (value) {
        filters[field] = value;
      }

      return filters;
    }, {});
  }

  function getFiltersFromUrl() {
    const params = new URLSearchParams(global.location.search);

    return FILTER_FIELDS.reduce((filters, field) => {
      const value = cleanFilterValue(params.get(field));

      if (value) {
        filters[field] = value;
      }

      return filters;
    }, {});
  }

  function hydrateFilterForm(filters = {}, form = getFilterForm()) {
    if (!form) return;

    FILTER_FIELDS.forEach((field) => {
      const element = form.elements[field];

      if (element) {
        element.value = filters[field] || "";
      }
    });
  }

  function syncFiltersToUrl(filters = {}) {
    const params = new URLSearchParams(global.location.search);

    FILTER_FIELDS.forEach((field) => {
      if (filters[field]) {
        params.set(field, filters[field]);
      } else {
        params.delete(field);
      }
    });

    const nextQuery = params.toString();
    const nextUrl = nextQuery
      ? `${global.location.pathname}?${nextQuery}${global.location.hash}`
      : `${global.location.pathname}${global.location.hash}`;

    global.history.replaceState({}, "", nextUrl);
  }

  function hasActiveFilters(filters = {}) {
    return FILTER_FIELDS.some((field) => Boolean(filters[field]));
  }

  function formatResultsStatus(response, filters) {
    const count = Number(response?.count ?? 0);
    const visibleCount = Array.isArray(response?.results)
      ? response.results.length
      : 0;
    const prefix = hasActiveFilters(filters) ? "matching " : "";

    if (!visibleCount) {
      return hasActiveFilters(filters)
        ? "No matching events found."
        : "No events yet.";
    }

    if (count > visibleCount) {
      return `Showing ${visibleCount} of ${count} ${prefix}events.`;
    }

    return `Showing ${visibleCount} ${prefix}${visibleCount === 1 ? "event" : "events"}.`;
  }

  function getOptionValue(item) {
    return item?.slug || item?.name || "";
  }

  function setSelectOptions(select, items, placeholder, selectedValue) {
    if (!select) return;

    select.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    select.appendChild(placeholderOption);

    items.forEach((item) => {
      const value = getOptionValue(item);
      const label = item?.name || value;

      if (!value || !label) return;

      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });

    select.value = selectedValue || "";
  }

  function setDatalistOptions(datalist, values) {
    if (!datalist) return;

    datalist.innerHTML = "";
    [...new Set(values.filter(Boolean))].sort().forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      datalist.appendChild(option);
    });
  }

  async function loadFilterOptions() {
    if (!eventService) return;

    const form = getFilterForm();
    if (!form) return;

    const currentFilters = collectFilterValues(form);

    const [categoriesResult, tagsResult, venuesResult] =
      await Promise.allSettled([
        eventService.getCategories(),
        eventService.getTags(),
        eventService.getVenues(),
      ]);

    if (categoriesResult.status === "fulfilled") {
      setSelectOptions(
        form.elements.category,
        categoriesResult.value,
        "All categories",
        currentFilters.category,
      );
    }

    if (tagsResult.status === "fulfilled") {
      setSelectOptions(
        form.elements.tag,
        tagsResult.value,
        "All tags",
        currentFilters.tag,
      );
    }

    if (venuesResult.status === "fulfilled") {
      setDatalistOptions(
        document.getElementById("event-city-options"),
        venuesResult.value.map((venue) => venue.city),
      );
      setDatalistOptions(
        document.getElementById("event-state-options"),
        venuesResult.value.map((venue) => venue.state),
      );
    }
  }

  function renderEvents(container, events) {
    container.innerHTML = events
      .map((event) => eventCard.renderEventCard(event))
      .join("");

    siteUi?.initReveal?.(container);
  }

  async function loadEvents(filters = {}) {
    const container = document.getElementById("events-container");
    if (!container) return;

    setContainerMessage(container, "Loading events...");
    setFilterStatus("Loading events...");

    try {
      const response = eventService?.listEvents
        ? await eventService.listEvents(filters)
        : { results: [] };
      const events = Array.isArray(response?.results) ? response.results : [];

      if (!events.length) {
        const emptyMessage = hasActiveFilters(filters)
          ? "No events match those filters yet."
          : "No events yet - check back soon!";

        setContainerMessage(container, emptyMessage);
        setFilterStatus(formatResultsStatus(response, filters));
        return;
      }

      renderEvents(container, events);
      setFilterStatus(formatResultsStatus(response, filters));
    } catch (error) {
      console.error("Could not load events:", error.message);
      setContainerMessage(
        container,
        "Could not load events. Make sure Django is running and the API is reachable.",
      );
      setFilterStatus("Event loading failed.");
    }
  }

  function bindFilters() {
    const form = getFilterForm();
    if (!form || form.dataset.bound === "true") return;

    form.dataset.bound = "true";

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const filters = collectFilterValues(form);
      syncFiltersToUrl(filters);
      loadEvents(filters);
    });

    form.addEventListener("reset", () => {
      setTimeout(() => {
        syncFiltersToUrl({});
        loadEvents({});
      }, 0);
    });
  }

  function boot() {
    siteUi?.boot?.();

    const filters = getFiltersFromUrl();
    hydrateFilterForm(filters);
    bindFilters();
    loadFilterOptions().catch((error) => {
      console.warn("Could not load event filter options:", error.message);
    });
    loadEvents(filters);
  }

  global.EventFlowHomePage = {
    bindFilters,
    boot,
    collectFilterValues,
    getFiltersFromUrl,
    hydrateFilterForm,
    loadFilterOptions,
    loadEvents,
  };
})(window);
