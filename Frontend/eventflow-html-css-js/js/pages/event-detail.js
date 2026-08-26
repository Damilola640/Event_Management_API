/* ============================================================
   event-detail.js - Public rich event detail + registration
   ============================================================ */

(function (global) {
  const eventService = global.EventFlowEventService;
  const authService = global.EventFlowAuthService;
  const guards = global.EventFlowGuards;
  const formatters = global.EventFlowFormatters;
  const toast = global.EventFlowToast;
  const siteUi = global.EventFlowSiteUi;
  const escapeHtml = toast?.escapeHtml || ((v) => String(v ?? ''));

  function getSlug() {
    return new URLSearchParams(global.location.search).get('slug');
  }

  function fact(label, value) {
    return `
      <div>
        <div class="detail-fact-label">${escapeHtml(label)}</div>
        <div class="detail-fact-value">${escapeHtml(value)}</div>
      </div>`;
  }

  function chipList(items) {
    return items
      .map((item) => `<span class="detail-chip">${escapeHtml(item.name || item)}</span>`)
      .join('');
  }

  function speakersSection(event) {
    if (!event.speakers?.length) return '';
    const people = event.speakers
      .map((speaker) => `
        <div class="detail-person">
          <div class="detail-person-name">${escapeHtml(speaker.name)}</div>
          ${speaker.topic ? `<div class="detail-person-meta">${escapeHtml(speaker.topic)}</div>` : ''}
        </div>`)
      .join('');
    return `<section class="detail-section"><h2>Speakers</h2><div class="detail-people">${people}</div></section>`;
  }

  function sponsorsSection(event) {
    if (!event.sponsors?.length) return '';
    const people = event.sponsors
      .map((sponsor) => {
        const level = sponsor.level ? formatters.titleCase(sponsor.level) : '';
        return `
          <div class="detail-person">
            <div class="detail-person-name">${escapeHtml(sponsor.name)}</div>
            ${level ? `<div class="detail-person-meta">${escapeHtml(level)} sponsor</div>` : ''}
          </div>`;
      })
      .join('');
    return `<section class="detail-section"><h2>Sponsors</h2><div class="detail-people">${people}</div></section>`;
  }

  function registerArea(event, currentUser) {
    if (event.status === 'cancelled') {
      return '<p class="app-message">This event has been cancelled.</p>';
    }
    if (event.status === 'completed') {
      return '<p class="app-message">This event has already taken place.</p>';
    }

    const loggedIn = Boolean(currentUser);
    const label = loggedIn ? 'Register for this event' : 'Sign in to register';

    return `
      <button id="detail-register-btn" class="btn-primary btn-block">${label}</button>
      <p id="detail-register-msg" class="form-success" role="status"></p>
      <p id="detail-register-err" class="form-error" role="alert"></p>`;
  }

  function organizerActions(event) {
    return `
      <div class="detail-organizer-actions">
        <div class="detail-fact-label">Organizer tools</div>
        <a class="btn-ghost btn-block" href="edit-event.html?slug=${encodeURIComponent(event.slug)}">Edit &amp; manage</a>
        <button id="detail-delete-btn" class="btn-danger btn-block">Delete event</button>
      </div>`;
  }

  function render(event, currentUser) {
    const root = document.getElementById('detail-root');
    if (!root) return;

    const isOrganizer = Boolean(
      currentUser && event.organizer && currentUser.username === event.organizer
    );
    const status = escapeHtml(event.status || 'upcoming');
    const category = formatters.formatCategoryName(event);
    const dateRange = formatters.formatDateRange(event.startDate, event.endDate);
    const timeRange = event.startTime
      ? `${formatters.formatClock(event.startTime)}${event.endTime ? ` – ${formatters.formatClock(event.endTime)}` : ''}`
      : 'Time TBC';
    const attendance = formatters.formatAttendanceSummary(event.registeredCount, event.capacity);

    root.innerHTML = `
      <div class="detail-head">
        <div class="detail-badges">
          <span class="badge badge-status badge-${status}">${status}</span>
          ${event.isPrivate ? '<span class="badge badge-private">Private</span>' : ''}
          <span class="detail-chip">${escapeHtml(category)}</span>
        </div>
        <h1 class="detail-title">${escapeHtml(event.title)}</h1>
      </div>

      <div class="detail-layout">
        <div class="detail-content">
          <section class="detail-section">
            <h2>About this event</h2>
            <p class="detail-description">${escapeHtml(event.description) || 'No description provided.'}</p>
          </section>

          ${event.categories?.length ? `<section class="detail-section"><h2>Categories</h2><div class="detail-chips">${chipList(event.categories)}</div></section>` : ''}
          ${event.tags?.length ? `<section class="detail-section"><h2>Tags</h2><div class="detail-chips">${chipList(event.tags)}</div></section>` : ''}
          ${speakersSection(event)}
          ${sponsorsSection(event)}
        </div>

        <aside class="detail-aside">
          <div class="detail-price">${escapeHtml(formatters.formatCurrency(event.ticketPrice))}</div>
          <div class="detail-facts">
            ${fact('Date', dateRange)}
            ${fact('Time', timeRange)}
            ${fact('Venue', event.venueName)}
            ${event.locationDetails ? fact('Location', event.locationDetails) : ''}
            ${fact('Availability', attendance)}
            ${fact('Organizer', event.organizer || 'EventFlow')}
          </div>
          ${registerArea(event, currentUser)}
          ${isOrganizer ? organizerActions(event) : ''}
        </aside>
      </div>`;

    wireRegister(event, currentUser);
    if (isOrganizer) wireDelete(event);
  }

  function wireRegister(event, currentUser) {
    const button = document.getElementById('detail-register-btn');
    if (!button) return;

    button.addEventListener('click', async () => {
      if (!currentUser) {
        guards.requireAuth(`event-detail.html?slug=${encodeURIComponent(event.slug)}`);
        return;
      }

      const msg = document.getElementById('detail-register-msg');
      const err = document.getElementById('detail-register-err');
      if (msg) msg.textContent = '';
      if (err) err.textContent = '';

      button.disabled = true;
      button.textContent = 'Registering…';

      try {
        await eventService.registerForEvent(event.slug);
        button.textContent = "You're registered ✓";
        if (msg) msg.textContent = 'See it under My bookings in your dashboard.';
        toast?.success?.('Registered for this event.');
      } catch (error) {
        button.disabled = false;
        button.textContent = 'Register for this event';
        if (err) err.textContent = error.message || 'Could not register.';
      }
    });
  }

  function wireDelete(event) {
    const button = document.getElementById('detail-delete-btn');
    if (!button) return;

    button.addEventListener('click', async () => {
      if (!global.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;

      button.disabled = true;
      button.textContent = 'Deleting…';

      try {
        await eventService.deleteEvent(event.slug);
        toast?.success?.('Event deleted.');
        global.location.href = 'my-events.html';
      } catch (error) {
        button.disabled = false;
        button.textContent = 'Delete event';
        toast?.error?.(error.message || 'Could not delete event.');
      }
    });
  }

  function showAuthLinkIfLoggedIn() {
    const link = document.querySelector('[data-auth-link]');
    if (link && authService?.isLoggedIn?.()) {
      link.hidden = false;
    }
  }

  async function boot() {
    siteUi?.initCursor?.();
    showAuthLinkIfLoggedIn();

    const root = document.getElementById('detail-root');
    const slug = getSlug();

    if (!slug) {
      if (root) root.innerHTML = '<p class="app-message">No event selected.</p>';
      return;
    }

    let currentUser = null;
    if (authService?.isLoggedIn?.()) {
      currentUser = await authService.getCurrentUser().catch(() => null);
    }

    try {
      const event = await eventService.getEventBySlug(slug);
      render(event, currentUser);
    } catch (error) {
      if (root) {
        root.innerHTML = `<div class="app-empty"><strong>Cannot show this event</strong>${escapeHtml(error.message || 'It may be private or no longer available.')}</div>`;
      }
    }
  }

  global.EventFlowEventDetailPage = { boot };
})(window);
