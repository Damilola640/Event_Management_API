/* ============================================================
   resource-manager.js - Generic list + create/edit/delete UI
   Driven by a config object. Powers the venue, speaker, sponsor
   (full CRUD) and category/tag (list + create) pages.
   ============================================================ */

(function (global) {
  const escapeHtml = global.EventFlowToast?.escapeHtml || ((v) => String(v ?? ''));
  const toast = global.EventFlowToast;

  function fieldControl(field, value = '') {
    const common = `id="rm-field-${escapeHtml(field.name)}" name="${escapeHtml(field.name)}"` +
      `${field.required ? ' required' : ''}` +
      `${field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : ''}`;

    if (field.type === 'textarea') {
      return `<textarea ${common} rows="${field.rows || 4}">${escapeHtml(value)}</textarea>`;
    }

    const type = field.type || 'text';
    const extra = type === 'number'
      ? `${field.min != null ? ` min="${field.min}"` : ''}${field.step != null ? ` step="${field.step}"` : ''}`
      : '';
    return `<input type="${escapeHtml(type)}" ${common}${extra} value="${escapeHtml(value)}" />`;
  }

  function renderField(field, value) {
    return `
      <div class="form-group">
        <label for="rm-field-${escapeHtml(field.name)}">${escapeHtml(field.label)}${field.required ? ' *' : ''}</label>
        ${fieldControl(field, value)}
        ${field.help ? `<span class="form-hint">${escapeHtml(field.help)}</span>` : ''}
      </div>`;
  }

  function create(config) {
    const {
      mount,
      title,
      subtitle = '',
      singular = 'item',
      note = '',
      service,
      idKey = 'id',
      columns = [],
      fields = [],
      canCreate = true,
      canEdit = true,
      canDelete = true,
      primaryLabel = (item) => item.name || item[idKey],
    } = config;

    if (!mount || !service) return null;

    let items = [];
    let editingId = null;

    function setBody(html) {
      const body = mount.querySelector('[data-rm-body]');
      if (body) body.innerHTML = html;
    }

    function renderTable() {
      if (!items.length) {
        setBody('<p class="rm-empty">Nothing here yet. Use the button above to add the first one.</p>');
        return;
      }

      const head = columns.map((col) => `<th>${escapeHtml(col.label)}</th>`).join('');
      const actionsHead = (canEdit || canDelete) ? '<th class="rm-col-actions">Actions</th>' : '';

      const rows = items.map((item) => {
        const cells = columns
          .map((col) => {
            const raw = item[col.key];
            const value = col.format ? col.format(raw, item) : raw;
            return `<td>${escapeHtml(value ?? '—') || '—'}</td>`;
          })
          .join('');

        let actions = '';
        if (canEdit || canDelete) {
          const id = escapeHtml(item[idKey]);
          const edit = canEdit
            ? `<button type="button" class="btn-ghost btn-sm" data-rm-edit="${id}">Edit</button>`
            : '';
          const del = canDelete
            ? `<button type="button" class="btn-danger btn-sm" data-rm-delete="${id}">Delete</button>`
            : '';
          actions = `<td class="rm-col-actions">${edit}${del}</td>`;
        }

        return `<tr>${cells}${actions}</tr>`;
      }).join('');

      setBody(`
        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr>${head}${actionsHead}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`);
    }

    async function load() {
      setBody('<p class="rm-loading">Loading…</p>');
      try {
        items = await service.list();
        renderTable();
      } catch (error) {
        setBody(`<p class="rm-error">Could not load ${escapeHtml(singular)}s: ${escapeHtml(error.message)}</p>`);
      }
    }

    function findItem(id) {
      return items.find((item) => String(item[idKey]) === String(id));
    }

    function setPanelOpen(open) {
      const panel = mount.querySelector('[data-rm-panel]');
      const overlay = mount.querySelector('[data-rm-overlay]');
      if (panel) panel.hidden = !open;
      if (overlay) overlay.hidden = !open;
    }

    function openForm(item) {
      editingId = item ? item[idKey] : null;
      const form = mount.querySelector('[data-rm-form]');
      const panelTitle = mount.querySelector('[data-rm-panel-title]');
      const error = mount.querySelector('[data-rm-error]');

      if (panelTitle) {
        panelTitle.textContent = item ? `Edit ${singular}` : `Add ${singular}`;
      }
      if (error) error.textContent = '';

      if (form) {
        form.innerHTML =
          fields.map((field) => renderField(field, item ? (item[field.name] ?? '') : '')).join('') +
          `<p class="form-error" data-rm-error role="alert"></p>
           <div class="rm-panel-actions">
             <button type="button" class="btn-ghost" data-rm-close>Cancel</button>
             <button type="submit" class="btn-primary">${item ? 'Save changes' : `Add ${escapeHtml(singular)}`}</button>
           </div>`;
      }

      setPanelOpen(true);
      const firstInput = form?.querySelector('input, textarea, select');
      firstInput?.focus();
    }

    function closeForm() {
      editingId = null;
      setPanelOpen(false);
    }

    function collectValues(form) {
      const data = new FormData(form);
      const values = {};
      fields.forEach((field) => {
        values[field.name] = String(data.get(field.name) ?? '').trim();
      });
      return values;
    }

    async function submitForm(form) {
      const error = form.querySelector('[data-rm-error]');
      const submitBtn = form.querySelector('button[type="submit"]');
      const values = collectValues(form);

      const missing = fields.find((field) => field.required && !values[field.name]);
      if (missing) {
        if (error) error.textContent = `${missing.label} is required.`;
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving…';
      }

      try {
        if (editingId && service.update) {
          await service.update(editingId, values);
          toast?.success?.(`${singular} updated.`);
        } else {
          await service.create(values);
          toast?.success?.(`${singular} added.`);
        }
        closeForm();
        await load();
      } catch (err) {
        if (error) error.textContent = err.message || 'Could not save.';
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = editingId ? 'Save changes' : `Add ${singular}`;
        }
      }
    }

    async function handleDelete(id) {
      const item = findItem(id);
      const label = item ? primaryLabel(item) : 'this item';
      if (!global.confirm(`Delete ${label}? This cannot be undone.`)) return;

      try {
        await service.remove(id);
        toast?.success?.(`${singular} deleted.`);
        await load();
      } catch (error) {
        toast?.error?.(error.message || `Could not delete ${singular}.`);
      }
    }

    function render() {
      mount.innerHTML = `
        <section class="rm">
          <div class="rm-header">
            <div>
              <h2 class="rm-title">${escapeHtml(title)}</h2>
              ${subtitle ? `<p class="rm-sub">${escapeHtml(subtitle)}</p>` : ''}
            </div>
            ${canCreate ? `<button type="button" class="btn-primary btn-sm" data-rm-add>Add ${escapeHtml(singular)}</button>` : ''}
          </div>
          ${note ? `<p class="rm-note">${escapeHtml(note)}</p>` : ''}
          <div class="rm-body" data-rm-body></div>
        </section>
        <div class="rm-panel-overlay" data-rm-overlay hidden></div>
        <aside class="rm-panel" data-rm-panel hidden aria-label="${escapeHtml(singular)} form">
          <div class="rm-panel-head">
            <h3 data-rm-panel-title>Add ${escapeHtml(singular)}</h3>
            <button type="button" class="rm-panel-x" data-rm-close aria-label="Close">×</button>
          </div>
          <form data-rm-form novalidate></form>
        </aside>`;

      // Toolbar + panel wiring (delegated for dynamic content).
      mount.querySelector('[data-rm-add]')?.addEventListener('click', () => openForm(null));

      mount.addEventListener('click', (event) => {
        if (event.target.closest('[data-rm-close]')) {
          closeForm();
          return;
        }
        const editBtn = event.target.closest('[data-rm-edit]');
        if (editBtn) {
          openForm(findItem(editBtn.getAttribute('data-rm-edit')));
          return;
        }
        const delBtn = event.target.closest('[data-rm-delete]');
        if (delBtn) {
          handleDelete(delBtn.getAttribute('data-rm-delete'));
        }
      });

      mount.querySelector('[data-rm-form]')?.addEventListener('submit', (event) => {
        event.preventDefault();
        submitForm(event.currentTarget);
      });
    }

    render();
    load();

    return { reload: load, openForm, closeForm };
  }

  global.EventFlowResourceManager = { create };
})(window);
