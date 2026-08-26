/* ============================================================
   my-events.js - Organizer's own events with manage/delete
   ============================================================ */

(function (global) {
  const shell = global.EventFlowDashboardShell;
  const eventService = global.EventFlowEventService;
  const eventCard = global.EventFlowEventCard;
  const toast = global.EventFlowToast;

  function setStatus(message) {
    const status = document.getElementById('my-events-status');
    if (status) status.textContent = message || '';
  }

  async function loadEvents(user) {
    const grid = document.getElementById('my-events-grid');
    if (!grid) return;

    setStatus('Loading your events…');

    try {
      const response = await eventService.listEvents({ organizer: user.username });
      // The organizer filter is a partial match server-side; keep only exact owner.
      const mine = response.results.filter(
        (event) => !event.organizer || event.organizer === user.username
      );

      if (!mine.length) {
        setStatus('');
        grid.innerHTML = `
          <div class="app-empty" style="grid-column:1/-1">
            <strong>No events yet</strong>
            Create your first event to start selling tickets and inviting guests.
            <div style="margin-top:1rem"><a class="btn-primary btn-sm" href="create-event.html">Create event</a></div>
          </div>`;
        return;
      }

      setStatus(`${mine.length} event${mine.length === 1 ? '' : 's'}.`);
      grid.innerHTML = mine.map((event) => eventCard.renderManageEventCard(event)).join('');
      wireDeletes(user);
    } catch (error) {
      setStatus('');
      grid.innerHTML = `<div class="app-empty" style="grid-column:1/-1"><strong>Could not load events</strong>${error.message}</div>`;
    }
  }

  function wireDeletes(user) {
    document.querySelectorAll('[data-delete-slug]').forEach((button) => {
      button.addEventListener('click', async () => {
        const slug = button.getAttribute('data-delete-slug');
        const name = button.getAttribute('data-delete-name') || 'this event';
        if (!global.confirm(`Delete "${name}"? This cannot be undone.`)) return;

        button.disabled = true;
        button.textContent = 'Deleting…';

        try {
          await eventService.deleteEvent(slug);
          toast?.success?.('Event deleted.');
          loadEvents(user);
        } catch (error) {
          button.disabled = false;
          button.textContent = 'Delete';
          toast?.error?.(error.message || 'Could not delete event.');
        }
      });
    });
  }

  async function boot() {
    const user = await shell.mount({
      require: 'organizer',
      deniedMessage: 'Only organizers can manage events.',
    });
    if (!user) return;

    loadEvents(user);
  }

  global.EventFlowMyEventsPage = { boot };
})(window);
