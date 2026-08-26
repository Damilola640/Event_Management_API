/* ============================================================
   speakers.js - Speaker directory CRUD (organizer)
   ============================================================ */

(function (global) {
  const shell = global.EventFlowDashboardShell;
  const catalog = global.EventFlowCatalogService;
  const manager = global.EventFlowResourceManager;

  async function boot() {
    const user = await shell.mount({
      require: 'organizer',
      deniedMessage: 'Only organizers can manage speakers.',
    });
    if (!user) return;

    const mount = document.getElementById('speakers-root');
    if (!mount) return;

    manager.create({
      mount,
      title: 'Speakers',
      subtitle: 'Your speaker directory. Attaching speakers to a specific event is handled in the Django admin.',
      note: 'Note: the public API manages the speaker directory only — the event ↔ speaker link is admin-only.',
      singular: 'speaker',
      service: catalog.speakers,
      primaryLabel: (item) => item.fullName || item.email,
      columns: [
        { key: 'fullName', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'organization', label: 'Organization' },
        { key: 'title', label: 'Title' },
      ],
      fields: [
        { name: 'first_name', label: 'First name', required: true },
        { name: 'last_name', label: 'Last name', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'title', label: 'Title', placeholder: 'Head of Product' },
        { name: 'organization', label: 'Organization' },
        { name: 'bio', label: 'Bio', type: 'textarea', rows: 3 },
        { name: 'photo_url', label: 'Photo URL', type: 'url' },
      ],
    });
  }

  global.EventFlowSpeakersPage = { boot };
})(window);
