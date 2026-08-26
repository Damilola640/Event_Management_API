/* ============================================================
   create-event.js - Organizer event creation page controller
   ============================================================ */

(function (global) {
  const eventService = global.EventFlowEventService;
  const guards = global.EventFlowGuards;
  const siteUi = global.EventFlowSiteUi;

  function setText(selectorOrElement, value) {
    const element = typeof selectorOrElement === 'string'
      ? document.querySelector(selectorOrElement)
      : selectorOrElement;

    if (element) {
      element.textContent = value || '';
    }
  }

  function setMessage(type, message) {
    setText('#create-event-success', type === 'success' ? message : '');
    setText('#create-event-error', type === 'error' ? message : '');
  }

  function getForm() {
    return document.getElementById('create-event-form');
  }

  function getSelectedValues(select) {
    if (!select) return [];

    return Array.from(select.selectedOptions || [])
      .map((option) => option.value)
      .filter(Boolean);
  }

  function setSelectOptions(select, items, placeholder) {
    if (!select) return;

    select.innerHTML = '';

    if (!select.multiple) {
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = placeholder;
      select.appendChild(placeholderOption);
    }

    items.forEach((item) => {
      const value = item?.name || item?.slug || '';

      if (!value) return;

      const option = document.createElement('option');
      option.value = value;
      option.textContent = item?.name || value;
      select.appendChild(option);
    });
  }

  async function loadTaxonomyOptions() {
    const form = getForm();
    if (!form || !eventService) return;

    const [venuesResult, categoriesResult, tagsResult] = await Promise.allSettled([
      eventService.getVenues(),
      eventService.getCategories(),
      eventService.getTags(),
    ]);

    if (venuesResult.status === 'fulfilled') {
      setSelectOptions(form.elements.venue, venuesResult.value, 'Choose a venue');
    }

    if (categoriesResult.status === 'fulfilled') {
      setSelectOptions(form.elements.categories, categoriesResult.value, 'Select categories');
    }

    if (tagsResult.status === 'fulfilled') {
      setSelectOptions(form.elements.tags, tagsResult.value, 'Select tags');
    }
  }

  function collectPayload(form) {
    const formData = new FormData(form);

    return {
      name: String(formData.get('name') || '').trim(),
      description: String(formData.get('description') || '').trim(),
      start_date: String(formData.get('start_date') || '').trim(),
      end_date: String(formData.get('end_date') || '').trim(),
      start_time: String(formData.get('start_time') || '').trim(),
      end_time: String(formData.get('end_time') || '').trim(),
      venue: String(formData.get('venue') || '').trim(),
      location_details: String(formData.get('location_details') || '').trim(),
      max_attendees: String(formData.get('max_attendees') || '').trim(),
      ticket_price: String(formData.get('ticket_price') || '').trim(),
      is_private: formData.get('is_private') === 'on',
      categories: getSelectedValues(form.elements.categories),
      tags: getSelectedValues(form.elements.tags),
    };
  }

  function validatePayload(payload) {
    if (!payload.name) {
      return 'Please enter an event name.';
    }

    if (!payload.description) {
      return 'Please add a short event description.';
    }

    if (!payload.start_date || !payload.end_date) {
      return 'Please choose both a start and end date.';
    }

    if (!payload.start_time || !payload.end_time) {
      return 'Please choose both a start and end time.';
    }

    if (!payload.categories.length) {
      return 'Please select at least one category.';
    }

    if (!payload.tags.length) {
      return 'Please select at least one tag.';
    }

    return '';
  }

  function showCreatedEvent(createdEvent) {
    const link = document.getElementById('created-event-link');
    const href = createdEvent?.slug
      ? `event-detail.html?slug=${encodeURIComponent(createdEvent.slug)}`
      : 'my-events.html';

    if (link) {
      link.href = href;
      link.textContent = 'View the created event';
      link.hidden = false;
    }
  }

  function bindCreateEventForm() {
    const form = getForm();
    if (!form || form.dataset.bound === 'true') return;

    form.dataset.bound = 'true';
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const button = form.querySelector('button[type="submit"]');
      const payload = collectPayload(form);
      const validationError = validatePayload(payload);
      const createdEventLink = document.getElementById('created-event-link');

      setMessage('error', '');
      setMessage('success', '');
      if (createdEventLink) {
        createdEventLink.hidden = true;
      }

      if (validationError) {
        setMessage('error', validationError);
        return;
      }

      if (button) {
        button.disabled = true;
        button.textContent = 'Publishing event...';
      }

      try {
        const createdEvent = await eventService.createEvent(payload);
        form.reset();
        setMessage('success', `Event created successfully: ${createdEvent.title}`);
        showCreatedEvent(createdEvent);
      } catch (error) {
        setMessage('error', error.message || 'Could not create event.');
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = 'Create event';
        }
      }
    });
  }

  async function boot() {
    const shell = global.EventFlowDashboardShell;

    let hasAccess = false;
    if (shell?.mount && document.getElementById('app-sidebar')) {
      const user = await shell.mount({
        require: 'organizer',
        deniedMessage: 'Only organizers can create events.',
      });
      hasAccess = Boolean(user);
    } else {
      siteUi?.initCursor?.();
      global.EventFlowNavbar?.initNavbar?.();
      hasAccess = await guards?.requireOrganizer?.({
        redirectTo: 'create-event.html',
        deniedRedirect: 'profile.html',
        deniedMessage: 'Only organizers can create events.',
      });
    }

    if (!hasAccess) {
      return;
    }

    await loadTaxonomyOptions().catch((error) => {
      console.warn('Could not load event creation options:', error.message);
    });

    bindCreateEventForm();
  }

  global.EventFlowCreateEventPage = {
    bindCreateEventForm,
    boot,
    collectPayload,
    loadTaxonomyOptions,
    validatePayload,
  };
})(window);
