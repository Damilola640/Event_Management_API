/* ============================================================
   guards.js - Route and permission guards for EventFlow
   ============================================================ */

(function (global) {
  function getAuthService() {
    return global.EventFlowAuthService;
  }

  function ensureDependencies() {
    if (!getAuthService()) {
      throw new Error('EventFlowAuthService is required before guards.js.');
    }
  }

  function normalizeRedirectPath(redirectTo) {
    if (!redirectTo) {
      const path = `${global.location.pathname || ''}${global.location.search || ''}`;
      return path.replace(/^\/+/, '') || 'index.html';
    }

    return String(redirectTo).replace(/^\/+/, '') || 'index.html';
  }

  function buildAuthUrl(redirectTo, tab) {
    const params = new URLSearchParams();
    const next = normalizeRedirectPath(redirectTo);

    if (next) {
      params.set('next', next);
    }

    if (tab) {
      params.set('tab', tab);
    }

    const query = params.toString();
    return `auth.html${query ? `?${query}` : ''}`;
  }

  function redirectToAuth(redirectTo, tab = 'login') {
    global.location.href = buildAuthUrl(redirectTo, tab);
    return false;
  }

  function redirectToPage(path) {
    global.location.href = path;
    return false;
  }

  function requireAuth(redirectTo) {
    ensureDependencies();
    const authService = getAuthService();

    if (authService.isLoggedIn()) {
      return true;
    }

    return redirectToAuth(redirectTo, 'login');
  }

  async function requireOrganizer(options = {}) {
    ensureDependencies();
    const authService = getAuthService();

    const redirectTo = options.redirectTo;
    const deniedPath = options.deniedRedirect || 'auth.html';
    const deniedMessage = options.deniedMessage || 'Organizer access is required.';

    if (!authService.isLoggedIn()) {
      return redirectToAuth(redirectTo, 'login');
    }

    const isOrganizer = await authService.isOrganizer();

    if (isOrganizer) {
      return true;
    }

    if (options.alert !== false) {
      global.alert(deniedMessage);
    }

    return redirectToPage(deniedPath);
  }

  async function requireCurrentUser(redirectTo) {
    ensureDependencies();
    const authService = getAuthService();

    if (!authService.isLoggedIn()) {
      redirectToAuth(redirectTo, 'login');
      return null;
    }

    return authService.getCurrentUser();
  }

  global.EventFlowGuards = {
    buildAuthUrl,
    normalizeRedirectPath,
    redirectToAuth,
    requireAuth,
    requireCurrentUser,
    requireOrganizer,
  };
})(window);
