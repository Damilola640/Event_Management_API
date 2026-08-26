/* ============================================================
   edit-event.js - Organizer event editing, deletion & invites
   ============================================================ */

(function (global) {
  const shell = global.EventFlowDashboardShell;
  const eventService = global.EventFlowEventService;
  const toast = global.EventFlowToast;

  function getSlug() {
    return new URLSearchParams(global.location.search).get('slug');
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '';
  }

  function setValue(name, value) {
    const el = document.querySelector(`#edit-event-form [name="${name}"]`);
    if (el) el.value = value ?? '';
  }

  function optionValue(item) {
    return item?.name || item?.slug || '';
  }

  function fillSelect(select, items, placeholder) {
    if (!select) return;
    select.innerHTML = '';
    if (!select.multiple && placeholder != null) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = placeholder;
      select.appendChild(opt);
    }
    items.forEach((item) => {
      const value = optionValue(item);
      if (!value) return;
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = item.name || value;
      select.appendChild(opt);
    });
  }

  function selectValues(select, values) {
    if (!select) return;
    const wanted = new Set(values.map((v) => String(v)));
    Array.from(select.options).forEach((opt) => {
      opt.selected = wanted.has(opt.value);
    });
  }

  function getSelectedValues(select) {
    if (!select) return [];
    return Array.from(select.selectedOptions || []).map((o) => o.value).filter(Boolean);
  }

  async function loadTaxonomy(form) {
    const [venues, categories, tags] = await Promise.allSettled([
      eventService.getVenues(),
      eventService.getCategories(),
      eventService.getTags(),
    ]);

    if (venues.status === 'fulfilled') fillSelect(form.elements.venue, venues.value, 'No venue');
    if (categories.status === 'fulfilled') fillSelect(form.elements.categories, categories.value);
    if (tags.status === 'fulfilled') fillSelect(form.elements.tags, tags.value);
  }

  function prefill(form, event) {
    setValue('name', event.name);
    setValue('description', event.description);
    setValue('start_date', event.startDate);
    setValue('end_date', event.endDate);
    setValue('start_time', String(event.startTime || '').slice(0, 5));
    setValue('end_time', String(event.endTime || '').slice(0, 5));
    setValue('location_details', event.locationDetails);
    setValue('max_attendees', event.capacity || '');
    setValue('ticket_price', event.ticketPrice || '');

    if (form.elements.venue && event.venueName && event.venueName !== 'Venue TBC') {
      form.elements.venue.value = event.venueName;
    }
    selectValues(form.elements.categories, event.categoryNames || []);
    selectValues(form.elements.tags, event.tagNames || []);

    const privateToggle = form.querySelector('[name="is_private"]');
    if (privateToggle) privateToggle.checked = Boolean(event.isPrivate);
  }

  function collectPayload(form) {
    const data = new FormData(form);
    return {
      name: String(data.get('name') || '').trim(),
      description: String(data.get('description') || '').trim(),
      start_date: String(data.get('start_date') || '').trim(),
      end_date: String(data.get('end_date') || '').trim(),
      start_time: String(data.get('start_time') || '').trim(),
      end_time: String(data.get('end_time') || '').trim(),
      venue: String(data.get('venue') || '').trim(),
      location_details: String(data.get('location_details') || '').trim(),
      max_attendees: String(data.get('max_attendees') || '').trim(),
      ticket_price: String(data.get('ticket_price') || '').trim(),
      is_private: data.get('is_private') === 'on',
      categories: getSelectedValues(form.elements.categories),
      tags: getSelectedValues(form.elements.tags),
    };
  }

  function validate(payload) {
    if (!payload.name) return 'Please enter an event name.';
    if (!payload.description) return 'Please add a description.';
    if (!payload.start_date || !payload.end_date) return 'Please choose start and end dates.';
    if (!payload.start_time || !payload.end_time) return 'Please choose start and end times.';
    if (!payload.categories.length) return 'Please select at least one category.';
    if (!payload.tags.length) return 'Please select at least one tag.';
    return '';
  }

  function bindForm(form, slug) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      const payload = collectPayload(form);
      const error = validate(payload);

      setText('edit-event-error', '');
      setText('edit-event-success', '');

      if (error) {
        setText('edit-event-error', error);
        return;
      }

      button.disabled = true;
      button.textContent = 'Saving…';

      try {
        const updated = await eventService.updateEvent(slug, payload);
        setText('edit-event-success', 'Changes saved.');
        toast?.success?.('Event updated.');
        toggleInvitations(updated.isPrivate);
        // Slug can change when the name changes — keep the URL in sync.
        if (updated.slug && updated.slug !== slug) {
          global.history.replaceState({}, '', `edit-event.html?slug=${encodeURIComponent(updated.slug)}`);
          rebind(updated.slug);
        }
      } catch (err) {
        setText('edit-event-error', err.message || 'Could not save changes.');
      } finally {
        button.disabled = false;
        button.textContent = 'Save changes';
      }
    });
  }

  let currentSlug = null;

  function rebind(slug) {
    currentSlug = slug;
  }

  function toggleInvitations(isPrivate) {
    const card = document.getElementById('invitations-card');
    if (card) card.hidden = !isPrivate;
  }

  function bindInvite() {
    const form = document.getElementById('invite-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = form.querySelector('[name="email"]');
      const button = form.querySelector('button[type="submit"]');
      const email = String(input?.value || '').trim();

      setText('invite-error', '');
      setText('invite-success', '');

      if (!email.includes('@')) {
        setText('invite-error', 'Please enter a valid email address.');
        return;
      }

      button.disabled = true;
      button.textContent = 'Sending…';

      try {
        await eventService.sendInvitation(currentSlug, email);
        setText('invite-success', `Invitation sent to ${email}.`);
        toast?.success?.('Invitation sent.');
        form.reset();
      } catch (err) {
        setText('invite-error', err.message || 'Could not send invitation.');
      } finally {
        button.disabled = false;
        button.textContent = 'Send invitation';
      }
    });
  }

  function bindDelete(slug, name) {
    const button = document.getElementById('edit-event-delete');
    if (!button) return;

    button.addEventListener('click', async () => {
      if (!global.confirm(`Delete "${name}"? This cannot be undone.`)) return;
      button.disabled = true;
      button.textContent = 'Deleting…';

      try {
        await eventService.deleteEvent(currentSlug);
        toast?.success?.('Event deleted.');
        global.location.href = 'my-events.html';
      } catch (error) {
        button.disabled = false;
        button.textContent = 'Delete this event';
        toast?.error?.(error.message || 'Could not delete event.');
      }
    });
  }

  async function boot() {
    const user = await shell.mount({
      require: 'organizer',
      deniedMessage: 'Only organizers can edit events.',
    });
    if (!user) return;

    const slug = getSlug();
    currentSlug = slug;

    if (!slug) {
      setText('edit-event-status', 'No event selected.');
      return;
    }

    let event;
    try {
      event = await eventService.getEventBySlug(slug);
    } catch (error) {
      setText('edit-event-status', error.message || 'Could not load this event.');
      return;
    }

    // Ownership check — the API also enforces this on write.
    if (event.organizer && user.username && event.organizer !== user.username) {
      setText('edit-event-status', 'You can only edit events you organize.');
      return;
    }

    const form = document.getElementById('edit-event-form');
    await loadTaxonomy(form).catch(() => {});
    prefill(form, event);

    document.getElementById('edit-event-status').hidden = true;
    document.getElementById('edit-event-body').hidden = false;

    toggleInvitations(event.isPrivate);
    bindForm(form, slug);
    bindInvite();
    bindDelete(slug, event.title);
  }

  global.EventFlowEditEventPage = { boot };
})(window);
