/* ============================================================
   pages/auth.js - Auth page controller
   ============================================================ */

(function (global) {
  const authApi = global.EventFlowAuthApi;

  function getNextUrl() {
    const params = new URLSearchParams(global.location.search);
    const next = params.get('next');

    if (!next) return '../index.html';

    if (next.startsWith('http://') || next.startsWith('https://') || next.startsWith('//')) {
      return '../index.html';
    }

    return next;
  }

  function getRequestedTab() {
    const params = new URLSearchParams(global.location.search);
    return params.get('tab');
  }

  function getResetParams() {
    const params = new URLSearchParams(global.location.search);

    return {
      reset: params.get('reset'),
      uid: params.get('uid'),
      token: params.get('token'),
    };
  }

  function getAuthSubviewElements() {
    return {
      login: document.getElementById('login-form'),
      resetRequest: document.getElementById('password-reset-request-form'),
      resetConfirm: document.getElementById('password-reset-confirm-form'),
    };
  }

  function showLoginSubview(view) {
    const elements = getAuthSubviewElements();
    const activeView = view || 'login';

    if (elements.login) {
      elements.login.hidden = activeView !== 'login';
    }

    if (elements.resetRequest) {
      elements.resetRequest.hidden = activeView !== 'reset-request';
    }

    if (elements.resetConfirm) {
      elements.resetConfirm.hidden = activeView !== 'reset-confirm';
    }
  }

  function activateTab(target) {
    const wrapper = document.getElementById('authWrapper');
    const tabs = document.querySelectorAll('.auth-tab');
    const panels = document.querySelectorAll('.auth-panel');
    const isRegister = target === 'register';

    if (wrapper) {
      wrapper.classList.toggle('panel-active', isRegister);
    }

    tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === target;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.panel === target);
    });

    showLoginSubview('login');
  }

  function initAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const mobileRegisterBtn = document.getElementById('mobileRegisterBtn');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const desktopRegisterBtn = document.getElementById('desktopRegisterBtn');
    if (!tabs.length) return;
    if (document.body.dataset.authTabsBound === 'true') return;
    document.body.dataset.authTabsBound = 'true';

    const requestedTab = getRequestedTab();
    const resetParams = getResetParams();

    if (resetParams.reset === 'confirm' && resetParams.uid && resetParams.token) {
      activateTab('login');
      showLoginSubview('reset-confirm');
    } else if (requestedTab === 'register' || requestedTab === 'login') {
      activateTab(requestedTab);
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        activateTab(tab.dataset.tab);
      });
    });

    mobileRegisterBtn?.addEventListener('click', () => activateTab('register'));
    mobileLoginBtn?.addEventListener('click', () => activateTab('login'));
    desktopRegisterBtn?.addEventListener('click', () => activateTab('register'));
  }

  function setMessage(element, message, color) {
    if (!element) return;
    element.textContent = message || '';
    if (color) {
      element.style.color = color;
    }
  }

  function redirectAfterAuth() {
    global.location.href = getNextUrl();
  }

  function redirectIfAuthenticated() {
    const resetParams = getResetParams();
    if (resetParams.reset === 'confirm') return;

    if (authApi?.getSession?.().isLoggedIn) {
      redirectAfterAuth();
    }
  }

  function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form || !authApi) return;
    if (form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = form.querySelector('[name="email"]').value.trim();
      const password = form.querySelector('[name="password"]').value;
      const button = form.querySelector('button[type="submit"]');
      const errorElement = document.getElementById('login-error');

      if (!email || !password) {
        setMessage(errorElement, 'Please fill in all fields.', '#c0392b');
        return;
      }

      button.disabled = true;
      button.textContent = 'Signing in...';
      setMessage(errorElement, '', '#c0392b');

      try {
        await authApi.login({ email, password });
        redirectAfterAuth();
      } catch (error) {
        setMessage(errorElement, error.message, '#c0392b');
      } finally {
        button.disabled = false;
        button.textContent = 'Sign in';
      }
    });
  }

  function initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form || !authApi) return;
    if (form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const username = form.querySelector('[name="username"]').value.trim();
      const fullName = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const password = form.querySelector('[name="password"]').value;
      const confirm = form.querySelector('[name="confirm"]').value;
      const button = form.querySelector('button[type="submit"]');
      const errorElement = document.getElementById('register-error');

      if (!username) {
        setMessage(errorElement, 'Please choose a username.', '#c0392b');
        return;
      }

      if (/\s/.test(username)) {
        setMessage(errorElement, 'Username cannot contain spaces.', '#c0392b');
        return;
      }

      if (!fullName) {
        setMessage(errorElement, 'Please enter your full name.', '#c0392b');
        return;
      }

      if (!email.includes('@')) {
        setMessage(errorElement, 'Please enter a valid email address.', '#c0392b');
        return;
      }

      if (password.length < 8) {
        setMessage(errorElement, 'Password must be at least 8 characters.', '#c0392b');
        return;
      }

      if (password !== confirm) {
        setMessage(errorElement, 'Passwords do not match.', '#c0392b');
        return;
      }

      button.disabled = true;
      button.textContent = 'Creating account...';
      setMessage(errorElement, '', '#c0392b');

      try {
        await authApi.register({
          username,
          name: fullName,
          email,
          password,
          confirmPassword: confirm,
        });

        redirectAfterAuth();
      } catch (error) {
        setMessage(errorElement, error.message, '#c0392b');
      } finally {
        button.disabled = false;
        button.textContent = 'Create account';
      }
    });
  }

  function initPasswordResetRequestForm() {
    const form = document.getElementById('password-reset-request-form');
    if (!form || !authApi) return;
    if (form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = form.querySelector('[name="email"]').value.trim();
      const button = form.querySelector('button[type="submit"]');
      const errorElement = document.getElementById('reset-request-error');
      const successElement = document.getElementById('reset-request-success');

      setMessage(errorElement, '', '#c0392b');
      setMessage(successElement, '', '#2e8b57');

      if (!email.includes('@')) {
        setMessage(errorElement, 'Please enter a valid email address.', '#c0392b');
        return;
      }

      button.disabled = true;
      button.textContent = 'Sending...';

      try {
        const response = await authApi.requestPasswordReset(email);
        setMessage(
          successElement,
          response?.detail || 'If an account exists for that email, a reset link has been sent.',
          '#2e8b57'
        );
      } catch (error) {
        setMessage(errorElement, error.message, '#c0392b');
      } finally {
        button.disabled = false;
        button.textContent = 'Send reset link';
      }
    });
  }

  function initPasswordResetConfirmForm() {
    const form = document.getElementById('password-reset-confirm-form');
    if (!form || !authApi) return;
    if (form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const resetParams = getResetParams();
      const password = form.querySelector('[name="password"]').value;
      const confirm = form.querySelector('[name="confirm"]').value;
      const button = form.querySelector('button[type="submit"]');
      const errorElement = document.getElementById('reset-confirm-error');
      const successElement = document.getElementById('reset-confirm-success');

      setMessage(errorElement, '', '#c0392b');
      setMessage(successElement, '', '#2e8b57');

      if (!resetParams.uid || !resetParams.token) {
        setMessage(errorElement, 'This password reset link is missing required details.', '#c0392b');
        return;
      }

      if (password.length < 8) {
        setMessage(errorElement, 'Password must be at least 8 characters.', '#c0392b');
        return;
      }

      if (password !== confirm) {
        setMessage(errorElement, 'Passwords do not match.', '#c0392b');
        return;
      }

      button.disabled = true;
      button.textContent = 'Resetting...';

      try {
        const response = await authApi.confirmPasswordReset({
          uid: resetParams.uid,
          token: resetParams.token,
          password,
          confirmPassword: confirm,
        });

        setMessage(
          successElement,
          response?.detail || 'Your password has been reset. You can now sign in.',
          '#2e8b57'
        );
        form.reset();

        setTimeout(() => {
          global.history.replaceState({}, '', global.location.pathname);
          activateTab('login');
        }, 1400);
      } catch (error) {
        setMessage(errorElement, error.message, '#c0392b');
      } finally {
        button.disabled = false;
        button.textContent = 'Reset password';
      }
    });
  }

  function initPasswordResetControls() {
    const forgotButton = document.getElementById('forgotPasswordBtn');
    const backToLoginFromResetBtn = document.getElementById('backToLoginFromResetBtn');
    const backToLoginFromConfirmBtn = document.getElementById('backToLoginFromConfirmBtn');
    const loginEmail = document.getElementById('login-email');
    const resetEmail = document.getElementById('reset-email');

    forgotButton?.addEventListener('click', () => {
      if (resetEmail && loginEmail?.value) {
        resetEmail.value = loginEmail.value.trim();
      }

      showLoginSubview('reset-request');
    });

    backToLoginFromResetBtn?.addEventListener('click', () => showLoginSubview('login'));
    backToLoginFromConfirmBtn?.addEventListener('click', () => {
      global.history.replaceState({}, '', global.location.pathname);
      showLoginSubview('login');
    });

    initPasswordResetRequestForm();
    initPasswordResetConfirmForm();
  }

  function boot() {
    initAuthTabs();
    redirectIfAuthenticated();
    initLoginForm();
    initRegisterForm();
    initPasswordResetControls();
  }

  global.initAuthTabs = initAuthTabs;
  global.initLoginForm = initLoginForm;
  global.initRegisterForm = initRegisterForm;
  global.initPasswordResetControls = initPasswordResetControls;
  global.EventFlowAuthPage = { boot };
})(window);
