/* ============================================================
   formatters.js - Shared presentation helpers for EventFlow
   ============================================================ */

(function (global) {
  function toNumber(value, fallback = 0) {
    const nextValue = Number(value);
    return Number.isFinite(nextValue) ? nextValue : fallback;
  }

  function formatDate(value, locale = 'en-GB', options = {}) {
    if (!value) return 'Date TBC';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Date TBC';
    }

    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...options,
    });
  }

  function formatTime(value, locale = 'en-NG', options = {}) {
    if (!value) return 'Time TBC';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      ...options,
    });
  }

  // Formats a bare "HH:MM:SS" / "HH:MM" clock string (as returned by the API)
  // into a readable 12-hour time, e.g. "14:30:00" -> "2:30 PM".
  function formatClock(value) {
    if (!value) return '';
    const match = String(value).match(/^(\d{1,2}):(\d{2})/);
    if (!match) return String(value);

    let hours = Number(match[1]);
    const minutes = match[2];
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
  }

  // Formats a start/end date pair, collapsing single-day ranges.
  function formatDateRange(start, end) {
    if (!start) return 'Date TBC';
    if (!end || start === end) return formatDate(start);
    return `${formatDate(start)} – ${formatDate(end)}`;
  }

  function titleCase(value) {
    return String(value ?? '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  }

  function formatCurrency(value, currency = 'NGN', locale = 'en-NG') {
    const amount = toNumber(value, 0);

    if (amount <= 0) {
      return 'Free';
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatVenueName(eventOrVenue) {
    if (!eventOrVenue) return 'Venue TBC';

    if (typeof eventOrVenue === 'string') {
      return eventOrVenue || 'Venue TBC';
    }

    return (
      eventOrVenue.venueName ||
      eventOrVenue.venue?.name ||
      eventOrVenue.location ||
      eventOrVenue.name ||
      'Venue TBC'
    );
  }

  function formatCategoryName(event) {
    if (!event) return 'Event';

    return (
      event.category?.name ||
      event.categories?.[0]?.name ||
      event.categoryName ||
      'Event'
    );
  }

  function formatAttendanceSummary(registeredCount, capacity) {
    const registered = toNumber(registeredCount, 0);
    const total = toNumber(capacity, 0);

    if (total <= 0) {
      return `${registered} registered`;
    }

    return `${registered} / ${total} registered`;
  }

  function formatProgressLabel(registeredCount, capacity) {
    const registered = toNumber(registeredCount, 0);
    const total = toNumber(capacity, 0);

    if (total <= 0) {
      return 'Open';
    }

    const percentage = Math.min(Math.round((registered / total) * 100), 100);
    return `${percentage}% full`;
  }

  global.EventFlowFormatters = {
    formatAttendanceSummary,
    formatCategoryName,
    formatCurrency,
    formatDate,
    formatProgressLabel,
    formatTime,
    formatVenueName,
  };
})(window);
