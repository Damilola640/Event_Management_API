/* ============================================================
   taxonomy.js - Category & tag management (list + create)
   The backend exposes no update/delete routes for these, so
   the managers run in create-only mode.
   ============================================================ */

(function (global) {
  const shell = global.EventFlowDashboardShell;
  const catalog = global.EventFlowCatalogService;
  const manager = global.EventFlowResourceManager;

  async function boot() {
    const user = await shell.mount({
      require: 'organizer',
      deniedMessage: 'Only organizers can manage categories and tags.',
    });
    if (!user) return;

    const categoriesMount = document.getElementById('categories-root');
    const tagsMount = document.getElementById('tags-root');

    if (categoriesMount) {
      manager.create({
        mount: categoriesMount,
        title: 'Categories',
        subtitle: 'Broad groupings attendees can filter events by.',
        note: 'Categories can be created here. Editing and deleting are handled in the Django admin.',
        singular: 'category',
        service: catalog.categories,
        canEdit: false,
        canDelete: false,
        primaryLabel: (item) => item.name,
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'slug', label: 'Slug' },
        ],
        fields: [{ name: 'name', label: 'Category name', required: true, placeholder: 'Conference' }],
      });
    }

    if (tagsMount) {
      manager.create({
        mount: tagsMount,
        title: 'Tags',
        subtitle: 'Fine-grained labels that help attendees discover events.',
        note: 'Tags can be created here. Editing and deleting are handled in the Django admin.',
        singular: 'tag',
        service: catalog.tags,
        canEdit: false,
        canDelete: false,
        primaryLabel: (item) => item.name,
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'slug', label: 'Slug' },
        ],
        fields: [{ name: 'name', label: 'Tag name', required: true, placeholder: 'networking' }],
      });
    }
  }

  global.EventFlowTaxonomyPage = { boot };
})(window);
