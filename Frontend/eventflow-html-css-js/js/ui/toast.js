/* ============================================================
   toast.js - Lightweight toast + shared DOM helpers
   ============================================================ */

(function (global) {
  let container = null;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function ensureContainer() {
    if (container && document.body.contains(container)) {
      return container;
    }

    container = document.createElement('div');
    container.className = 'toast-stack';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
    return container;
  }

  function showToast(message, type = 'info', options = {}) {
    if (!message) return;

    const stack = ensureContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    stack.appendChild(toast);

    // Trigger the enter transition on the next frame.
    global.requestAnimationFrame(() => toast.classList.add('toast-visible'));

    const duration = options.duration ?? 3800;
    global.setTimeout(() => {
      toast.classList.remove('toast-visible');
      global.setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  global.EventFlowToast = {
    escapeHtml,
    showToast,
    success: (message, options) => showToast(message, 'success', options),
    error: (message, options) => showToast(message, 'error', options),
    info: (message, options) => showToast(message, 'info', options),
  };
})(window);
