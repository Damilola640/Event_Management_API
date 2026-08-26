/* ============================================================
   sponsors.js - Sponsor directory CRUD (organizer)
   ============================================================ */

(function (global) {
  const shell = global.EventFlowDashboardShell;
  const catalog = global.EventFlowCatalogService;
  const manager = global.EventFlowResourceManager;

  async function boot() {
    const user = await shell.mount({
      require: 'organizer',
      deniedMessage: 'Only organizers can manage sponsors.',
    });
    if (!user) return;

    const mount = document.getElementById('sponsors-root');
    if (!mount) return;

    manager.create({
      mount,
      title: 'Sponsors',
      subtitle: 'Your sponsor directory. Attaching sponsors to a specific event is handled in the Django admin.',
      note: 'Note: the public API manages the sponsor directory only — the event ↔ sponsor link is admin-only.',
      singular: 'sponsor',
      service: catalog.sponsors,
      primaryLabel: (item) => item.name,
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'contact_person', label: 'Contact' },
        { key: 'contact_email', label: 'Email' },
        { key: 'website_url', label: 'Website' },
      ],
      fields: [
        { name: 'name', label: 'Sponsor name', required: true },
        { name: 'contact_person', label: 'Contact person' },
        { name: 'contact_email', label: 'Contact email', type: 'email' },
        { name: 'phone_number', label: 'Phone number', type: 'tel' },
        { name: 'website_url', label: 'Website URL', type: 'url' },
        { name: 'logo_url', label: 'Logo URL', type: 'url' },
      ],
    });
  }

  global.EventFlowSponsorsPage = { boot };
})(window);
