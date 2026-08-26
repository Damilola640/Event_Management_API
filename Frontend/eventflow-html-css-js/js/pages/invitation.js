/* ============================================================
   invitation.js - Accept a private-event invitation by token
   ============================================================ */

(function (global) {
  const eventService = global.EventFlowEventService;
  const siteUi = global.EventFlowSiteUi;

  function getToken() {
    return new URLSearchParams(global.location.search).get('token');
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value || '';
  }

  function boot() {
    siteUi?.initCursor?.();

    const token = getToken();
    const button = document.getElementById('invitation-accept-btn');

    if (!token) {
      setText('invitation-error', 'This invitation link is missing its token.');
      if (button) button.disabled = true;
      return;
    }

    if (!button) return;

    button.addEventListener('click', async () => {
      setText('invitation-error', '');
      setText('invitation-success', '');
      button.disabled = true;
      button.textContent = 'Accepting…';

      try {
        const response = await eventService.acceptInvitation(token);
        setText(
          'invitation-success',
          response?.detail || 'Invitation accepted! Sign in or register to continue.'
        );
        button.textContent = 'Invitation accepted ✓';

        // Offer a clear next step toward the app.
        const root = document.getElementById('invitation-root');
        if (root && !document.getElementById('invitation-next')) {
          const link = document.createElement('a');
          link.id = 'invitation-next';
          link.className = 'btn-ghost btn-block';
          link.style.marginTop = '1rem';
          link.href = 'auth.html';
          link.textContent = 'Continue to sign in';
          root.appendChild(link);
        }
      } catch (error) {
        button.disabled = false;
        button.textContent = 'Accept invitation';
        setText(
          'invitation-error',
          error.message || 'This invitation is invalid, expired, or already accepted.'
        );
      }
    });
  }

  global.EventFlowInvitationPage = { boot };
})(window);
