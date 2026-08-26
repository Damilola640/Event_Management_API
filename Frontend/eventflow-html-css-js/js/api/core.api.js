/* ============================================================
   core.api.js - System/health requests for EventFlow
   ============================================================ */

(function (global) {
  const client = global.EventFlowApiClient;

  function ensureDependencies() {
    if (!client) {
      throw new Error('EventFlowApiClient is required before core.api.js.');
    }
  }

  async function getHealth() {
    ensureDependencies();
    return client.get('/api/core/health/');
  }

  global.EventFlowCoreApi = {
    getHealth,
  };
})(window);
