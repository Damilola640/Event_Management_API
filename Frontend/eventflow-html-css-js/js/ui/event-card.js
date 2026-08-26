/* ============================================================
   event-card.js - Reusable event card renderer
   ============================================================ */

(function (global) {
  const formatters = global.EventFlowFormatters;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Cards render from the root (index.html) and from within /pages/.
  // Compute the correct relative prefix so links resolve in both contexts.
  function pagePrefix() {
    return global.location.pathname.includes('/pages/') ? '' : 'pages/';
  }

  function detailHref(event) {
    return `${pagePrefix()}event-detail.html?slug=${encodeURIComponent(event.slug || '')}`;
  }

  function editHref(event) {
    return `${pagePrefix()}edit-event.html?slug=${encodeURIComponent(event.slug || '')}`;
  }

  function getCategoryColor(categoryName) {
    const colorMap = {
      Conference: 'orange',
      Concert: 'gold',
      Workshop: 'green',
      Networking: 'orange',
      Webinar: 'green',
      Seminar: 'gold',
    };

    return colorMap[categoryName] || 'orange';
  }

  function renderEventCard(event) {
    const categoryName = formatters?.formatCategoryName
      ? formatters.formatCategoryName(event)
      : event.category?.name || 'Event';
    const venueName = formatters?.formatVenueName
      ? formatters.formatVenueName(event)
      : event.venueName || event.venue?.name || event.location || 'Venue TBC';
    const dateText = formatters?.formatDate
      ? formatters.formatDate(event.startDate || event.start_date)
      : 'Date TBC';
    const priceText = formatters?.formatCurrency
      ? formatters.formatCurrency(event.ticketPrice ?? event.ticket_price)
      : 'Free';
    const attendanceText = formatters?.formatAttendanceSummary
      ? formatters.formatAttendanceSummary(
          event.registeredCount ?? event.registered_count,
          event.capacity
        )
      : `${event.registeredCount ?? event.registered_count ?? 0} registered`;
    const progressText = formatters?.formatProgressLabel
      ? formatters.formatProgressLabel(
          event.registeredCount ?? event.registered_count,
          event.capacity
        )
      : 'Open';
    const progressValue = Number.isFinite(Number(event.progress))
      ? Math.max(0, Math.min(100, Number(event.progress)))
      : 0;
    const color = getCategoryColor(categoryName);
    const bookingUrl = detailHref(event);

    return `
      <div class="ev-card reveal" role="article" tabindex="0">
        <div class="ev-card-top">
          <span class="ev-tag ev-tag-${escapeHtml(color)}">${escapeHtml(categoryName)}</span>
          <div class="ev-live-dot" aria-label="Live event"></div>
        </div>

        <div class="ev-title">${escapeHtml(event.title || event.name || 'Untitled event')}</div>
        <div class="ev-meta">${escapeHtml(dateText)} · ${escapeHtml(venueName)}</div>

        <div class="ev-progress-bg"
             role="progressbar"
             aria-valuenow="${progressValue}"
             aria-valuemin="0"
             aria-valuemax="100">
          <div class="ev-progress-fill fill-${escapeHtml(color)}" style="width:${progressValue}%"></div>
        </div>

        <div class="ev-stats">
          <span>${escapeHtml(attendanceText)}</span>
          <span>${escapeHtml(progressText)}</span>
        </div>

        <div class="ev-footer">
          <div class="ev-price">${escapeHtml(priceText)}</div>
          <button
            class="ev-btn ev-btn-${escapeHtml(color)}"
            onclick="window.location.href='${escapeHtml(bookingUrl)}'">
            View event
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Management variant used on the organizer's My Events grid.
   * Renders View / Edit actions and a status badge. Delete is wired by the
   * page controller via the data-delete-slug hook.
   */
  function renderManageEventCard(event) {
    const categoryName = formatters?.formatCategoryName
      ? formatters.formatCategoryName(event)
      : event.category?.name || 'Event';
    const venueName = formatters?.formatVenueName
      ? formatters.formatVenueName(event)
      : event.venueName || 'Venue TBC';
    const dateText = formatters?.formatDate
      ? formatters.formatDate(event.startDate || event.start_date)
      : 'Date TBC';
    const priceText = formatters?.formatCurrency
      ? formatters.formatCurrency(event.ticketPrice ?? event.ticket_price)
      : 'Free';
    const attendanceText = formatters?.formatAttendanceSummary
      ? formatters.formatAttendanceSummary(event.registeredCount, event.capacity)
      : `${event.registeredCount ?? 0} registered`;
    const status = escapeHtml(event.status || 'upcoming');
    const slug = escapeHtml(event.slug || '');

    return `
      <article class="manage-card" data-event-slug="${slug}">
        <div class="manage-card-head">
          <span class="badge badge-status badge-${status}">${status}</span>
          ${event.isPrivate ? '<span class="badge badge-private">Private</span>' : ''}
        </div>
        <h3 class="manage-card-title">${escapeHtml(event.title || event.name || 'Untitled event')}</h3>
        <p class="manage-card-meta">${escapeHtml(dateText)} · ${escapeHtml(venueName)}</p>
        <p class="manage-card-meta">${escapeHtml(attendanceText)} · ${escapeHtml(priceText)}</p>
        <div class="manage-card-actions">
          <a class="btn-ghost btn-sm" href="${escapeHtml(detailHref(event))}">View</a>
          <a class="btn-ghost btn-sm" href="${escapeHtml(editHref(event))}">Edit &amp; manage</a>
          <button type="button" class="btn-danger btn-sm" data-delete-slug="${slug}"
                  data-delete-name="${escapeHtml(event.title || event.name || '')}">
            Delete
          </button>
        </div>
      </article>
    `;
  }

  global.EventFlowEventCard = {
    getCategoryColor,
    renderEventCard,
    renderManageEventCard,
    detailHref,
    editHref,
  };
})(window);
