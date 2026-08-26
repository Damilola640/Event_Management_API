/* ============================================================
   venues.js - Venue directory CRUD (organizer)
   ============================================================ */

(function (global) {
  const shell = global.EventFlowDashboardShell;
  const catalog = global.EventFlowCatalogService;
  const manager = global.EventFlowResourceManager;

  async function boot() {
    const user = await shell.mount({
      require: 'organizer',
      deniedMessage: 'Only organizers can manage venues.',
    });
    if (!user) return;

    const mount = document.getElementById('venues-root');
    if (!mount) return;

    manager.create({
      mount,
      title: 'Venues',
      subtitle: 'Physical locations you can attach to events when creating them.',
      singular: 'venue',
      service: catalog.venues,
      primaryLabel: (item) => item.name,
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'capacity', label: 'Capacity' },
        { key: 'contact_email', label: 'Contact' },
      ],
      fields: [
        { name: 'name', label: 'Venue name', required: true, placeholder: 'Landmark Centre' },
        { name: 'address', label: 'Address', type: 'textarea', rows: 2 },
        { name: 'city', label: 'City', placeholder: 'Lagos' },
        { name: 'state', label: 'State', placeholder: 'Lagos' },
        { name: 'zip_code', label: 'ZIP / postal code' },
        { name: 'capacity', label: 'Capacity', type: 'number', min: 0, step: 1, placeholder: '500' },
        { name: 'contact_person', label: 'Contact person' },
        { name: 'contact_email', label: 'Contact email', type: 'email' },
        { name: 'phone_number', label: 'Phone number', type: 'tel' },
      ],
    });
  }

  global.EventFlowVenuesPage = { boot };
})(window);
