(function () {
  const page = document.body.dataset.page || document.body.dataset.page || '';

  const primaryLinks = [
    { id: 'home', label: 'HOME', href: 'index.html' },
    { id: 'trains', label: 'TRAINS', href: 'trains.html' },
    { id: 'meals', label: 'MEALS', href: 'meals.html' },
    { id: 'services', label: 'OTHER SERVICES', href: 'services.html' },
    { id: 'contact', label: 'CONTACT US', href: 'contact.html' },
    { id: 'loyalty', label: 'LOYALTY', href: 'loyalty.html' },
    { id: 'alerts', label: 'ALERTS', href: 'alerts.html' },
    { id: 'ewallet', label: 'E-WALLET', href: '#' },
  ];

  const tickerLinks = [
    { label: 'LOYALTY', href: 'loyalty.html' },
    { label: 'ALERTS', href: 'alerts.html' },
    { label: 'E-WALLET', href: '#' },
  ];

  const announcements = [
    'Travel safely • Check train status before departure',
    'Monsoon alert: Some trains may run delayed in coastal routes — plan extra time',
    'Tatkal booking opens daily at 10:00 AM for AC classes and 11:00 AM for non-AC',
    'New e-wallet cashback: 5% on your next 3 bookings this month',
    'Platform change possible at major junctions — verify live status before boarding',
  ];

  const header =
    document.getElementById('site-header') ||
    document.getElementById('site-header');
  if (!header) return;

  const primaryHtml = primaryLinks
    .map(
      (l) =>
        `<a href="${l.href}" class="nav-link${page === l.id ? ' active' : ''}" data-i18n="nav${l.id[0].toUpperCase()}${l.id.slice(1)}">${l.label}</a>`
    )
    .join('');

  const tickerHtml = tickerLinks
    .map(
      (l, i) =>
        `<a href="${l.href}" class="ticker-item${i === 0 ? ' active' : ''}" data-index="${i}" data-i18n="ticker${l.label.replace(/[^a-z]/gi, '')}">${l.label}</a>`
    )
    .join('');

  header.className = 'site-header site-header';
  header.innerHTML = `
    <div class="top-bar">
      <div class="top-bar-left">
        <span class="status-dot"></span>
        <span class="welcome-text">Welcome, Passenger</span>
        <span class="announcement-text" id="announcement-text">${announcements[0]}</span>
      </div>
      <div class="top-bar-right">
        <span id="live-datetime"></span>
        <div class="font-controls">
          <button class="font-btn" data-size="sm" aria-label="Decrease font size">A−</button>
          <button class="font-btn" data-size="md" aria-label="Reset font size">A</button>
          <button class="font-btn" data-size="lg" aria-label="Increase font size">A+</button>
        </div>
      </div>
    </div>
    <div class="nav-bottom glass-panel">
      <a href="index.html" class="logo-mark" aria-label="IRCTC Home">IR</a>
      <div class="nav-auth" id="nav-auth">
        <button type="button" class="login-btn" id="auth-toggle">LOGIN / REGISTER</button>
      </div>
      <label class="language-control" for="language-select"><span class="sr-only">Language</span><select id="language-select" aria-label="Choose language"><option value="en">English</option><option value="hi">हिन्दी</option><option value="kok">कोंकणी</option><option value="ur">اردو</option></select></label>
      <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false">☰</button>
      <nav class="nav-primary" id="nav-primary" aria-label="Main navigation">${primaryHtml}</nav>
      <div class="nav-ticker" aria-label="Quick services">
        <button type="button" class="ticker-btn ticker-prev" aria-label="Previous service">‹</button>
        <div class="ticker-viewport">
          <div class="ticker-track" id="ticker-track">${tickerHtml}</div>
        </div>
        <button type="button" class="ticker-btn ticker-next" aria-label="Next service">›</button>
      </div>
    </div>
  `;

  let annIndex = 0;
  const annEl = document.getElementById('announcement-text');
  setInterval(() => {
    annIndex = (annIndex + 1) % announcements.length;
    annEl.classList.add('fade-out');
    setTimeout(() => {
      annEl.textContent = announcements[annIndex];
      annEl.classList.remove('fade-out');
    }, 300);
  }, 6000);

  const authEl = document.getElementById('nav-auth');
  const accountsKey = 'irctc-demo-accounts-v1';
  const sessionResetKey = 'irctc-session-reset-v2';

  // Start a newly deployed demo in a signed-out state, while preserving later sign-ins.
  if (localStorage.getItem(sessionResetKey) !== 'done') {
    localStorage.removeItem('irctc-auth-session');
    localStorage.removeItem('irctc-logged-in');
    localStorage.setItem(sessionResetKey, 'done');
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem('irctc-auth-session'));
    } catch (error) {
      return null;
    }
  }

  function getAccounts() {
    let accounts;
    try { accounts = JSON.parse(localStorage.getItem(accountsKey)) || []; } catch (error) { accounts = []; }
    const demoAccounts = [
      {
        email: 'demo@irctc.test',
        salt: 'irctc-demo-seed-2026',
        passwordHash: 'abc9bddf31fe24eddecbb6f34cc021bb6d27dcdab5ddde91c512d48db483923f',
        emailVerified: true,
        memberSince: new Date().toISOString(),
      },
      {
        email: 'public@irctc.test',
        salt: 'irctc-public-seed-2026',
        passwordHash: 'a80a8fd87d9cc4a387690bf5ff07d3fe0f78f66d2cffe25e276723f3ff8c2bd7',
        emailVerified: true,
        memberSince: new Date().toISOString(),
        accountLabel: 'Public demo',
      },
      {
        email: 'judges@irctc.test',
        salt: 'irctc-judges-seed-2026',
        passwordHash: 'da8a48f73232b2ca382f54da6452388497a4fd299d7f8db990597e3823383892',
        emailVerified: true,
        memberSince: new Date().toISOString(),
        accountLabel: 'Judges demo',
      },
    ];
    let changed = false;
    demoAccounts.forEach((demo) => {
      const existing = accounts.find((account) => account.email === demo.email);
      if (!existing) {
        accounts.push(demo);
        changed = true;
      } else if (existing.memberSince === '2026-01-01T00:00:00.000Z') {
        existing.memberSince = new Date().toISOString();
        changed = true;
      }
    });
    if (changed) {
      saveAccounts(accounts);
    }
    return accounts;
  }

  function saveAccounts(accounts) {
    localStorage.setItem(accountsKey, JSON.stringify(accounts));
  }

  function getProfile() {
    const session = getSession();
    const accountEmail = session?.email || session?.name;
    if (!accountEmail) return {};
    try { return JSON.parse(localStorage.getItem(`irctc-user-profile:${accountEmail.toLowerCase()}`)) || {}; } catch (error) { return {}; }
  }

  function normalizeEmail(value) {
    return value.trim().toLowerCase();
  }

  function resetShowcaseProfile(email) {
    if (!['public@irctc.test', 'judges@irctc.test'].includes(email)) return;
    localStorage.removeItem(`irctc-user-profile:${email}`);
  }

  async function passwordHash(value, salt) {
    const bytes = new TextEncoder().encode(`${salt || 'irctc-demo-v1'}:${value}`);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function createSalt() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function safeAvatar(value) {
    return typeof value === 'string' && value.startsWith('data:image/') ? value : '';
  }

  function hasBookableProfile() {
    const session = getSession();
    const profile = getProfile();
    return Boolean(session && session.role === 'user' && session.emailVerified && profile.completed && profile.documentVerified);
  }

  function initials(value) {
    return value
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'IR';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
    }[character]));
  }

  function renderAuth() {
    const session = getSession();
    if (session) {
      const avatar = session.role === 'user' ? safeAvatar(getProfile().avatar) : '';
      authEl.innerHTML = `
        <button type="button" class="profile-btn" id="auth-toggle" aria-label="Account menu">
          <span class="profile-avatar${avatar ? ' has-photo' : ''}"${avatar ? ` style="background-image:url('${avatar}')"` : ''}>${avatar ? '' : initials(session.name)}</span>
          <span class="profile-name">${session.role === 'agent' ? 'AGENT · ' : ''}${escapeHtml(session.name)}</span>
        </button>
      `;
      document.querySelector('.welcome-text').textContent = `Welcome, ${session.name}`;
    } else {
      authEl.innerHTML = `
        <button type="button" class="login-btn" id="auth-toggle">LOGIN / REGISTER</button>
      `;
      document.querySelector('.welcome-text').textContent = 'Welcome, Passenger';
    }
    document.getElementById('auth-toggle').addEventListener('click', () => {
      if (getSession()) openAccountMenu();
      else openUserAuthModal();
    });
  }

  function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.remove();
    document.body.classList.remove('auth-modal-open');
  }

  function openAccountMenu() {
    const session = getSession();
    if (!session) return openUserAuthModal();
    closeAuthModal();
    const modal = document.createElement('div');
    modal.className = 'auth-modal-backdrop';
    modal.id = 'auth-modal';
    modal.innerHTML = `
      <section class="auth-modal glass-panel account-menu" role="dialog" aria-modal="true" aria-labelledby="account-title">
        <button class="auth-close" type="button" aria-label="Close account menu">×</button>
        <span class="auth-kicker">SIGNED IN</span>
        <h2 id="account-title">${escapeHtml(session.name)}</h2>
        <p class="account-role">${session.role === 'agent' ? 'Authorized Agent account' : 'Passenger account'}</p>
        <p class="auth-note">${session.role === 'user' && !hasBookableProfile() ? 'Complete your verified profile before making a booking.' : 'Your account is ready for booking.'}</p>
        ${session.role === 'user' ? '<a class="btn-primary account-profile-link" href="profile.html">VIEW PROFILE</a>' : ''}
        <button class="btn-secondary account-signout" type="button">SIGN OUT</button>
      </section>`;
    document.body.appendChild(modal);
    document.body.classList.add('auth-modal-open');
    modal.querySelector('.auth-close').addEventListener('click', closeAuthModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeAuthModal();
    });
    modal.querySelector('.account-signout').addEventListener('click', () => {
      localStorage.removeItem('irctc-auth-session');
      localStorage.removeItem('irctc-logged-in');
      closeAuthModal();
      renderAuth();
    });
  }

  function openAuthModal() {
    closeAuthModal();
    const modal = document.createElement('div');
    modal.className = 'auth-modal-backdrop';
    modal.id = 'auth-modal';
    modal.innerHTML = `
      <section class="auth-modal glass-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button class="auth-close" type="button" aria-label="Close login">×</button>
        <span class="auth-kicker">SECURE ACCESS</span>
        <h2 id="auth-title">Sign in to IRCTC</h2>
        <p class="auth-subtitle">Choose the account that matches your booking access.</p>
        <div class="auth-role-switch" role="tablist" aria-label="Account type">
          <button type="button" role="tab" aria-selected="true" class="auth-role active" data-role="user">User login</button>
          <button type="button" role="tab" aria-selected="false" class="auth-role" data-role="agent">Agent login</button>
        </div>
        <form id="auth-form" novalidate>
          <div class="field-group">
            <label id="identity-label" for="auth-identity">User ID or email</label>
            <input class="field-input" id="auth-identity" name="identity" autocomplete="username" required maxlength="80" placeholder="Enter your User ID or email">
          </div>
          <div class="field-group auth-password-group">
            <label for="auth-password">Password</label>
            <div class="password-control">
              <input class="field-input" id="auth-password" name="password" type="password" autocomplete="current-password" required minlength="8" placeholder="Enter your password">
              <button type="button" class="password-toggle" aria-label="Show password" aria-pressed="false">Show</button>
            </div>
          </div>
          <div class="agent-terms" id="agent-terms" hidden>
            <p><strong>Authorized agent declaration</strong></p>
            <ul>
              <li>I will not use a personal IRCTC User ID to book tickets for customers.</li>
              <li>I will not charge above the prescribed IRCTC ticket fare.</li>
              <li>I will not alter the contents of the ERS.</li>
              <li>I will follow all applicable IRCTC and Ministry of Railways rules for bookings, cancellations and refunds.</li>
            </ul>
            <label class="agreement-check"><input id="agent-agreement" type="checkbox"> I confirm this declaration.</label>
          </div>
          <p class="auth-risk-note">A CAPTCHA or additional verification is requested only when the risk check requires it.</p>
          <p class="auth-error" id="auth-error" role="alert" hidden></p>
          <button type="submit" class="btn-primary auth-submit">SIGN IN SECURELY</button>
          <div class="auth-links"><button type="button" data-auth-info="recovery">Forgot account details?</button><button type="button" data-auth-info="signup">New user? Register</button></div>
        </form>
        <p class="auth-prototype-note">Demo interface — real credentials are verified server-side and are never stored in this browser.</p>
      </section>`;
    document.body.appendChild(modal);
    document.body.classList.add('auth-modal-open');

    let role = 'user';
    const form = modal.querySelector('#auth-form');
    const identity = modal.querySelector('#auth-identity');
    const password = modal.querySelector('#auth-password');
    const agreement = modal.querySelector('#agent-agreement');
    const terms = modal.querySelector('#agent-terms');
    const error = modal.querySelector('#auth-error');
    const submit = modal.querySelector('.auth-submit');

    function setRole(nextRole) {
      role = nextRole;
      const agent = role === 'agent';
      modal.querySelectorAll('.auth-role').forEach((button) => {
        const selected = button.dataset.role === role;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-selected', selected);
      });
      terms.hidden = !agent;
      agreement.required = agent;
      identity.value = '';
      identity.placeholder = agent ? 'Enter your registered Agent User ID' : 'Enter your User ID or email';
      modal.querySelector('#identity-label').textContent = agent ? 'Agent User ID' : 'User ID or email';
      error.hidden = true;
      identity.focus();
    }

    modal.querySelectorAll('.auth-role').forEach((button) => button.addEventListener('click', () => setRole(button.dataset.role)));
    modal.querySelector('.auth-close').addEventListener('click', closeAuthModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeAuthModal();
    });
    document.addEventListener('keydown', function onEscape(event) {
      if (event.key !== 'Escape') return;
      closeAuthModal();
      document.removeEventListener('keydown', onEscape);
    });
    modal.querySelector('.password-toggle').addEventListener('click', (event) => {
      const revealed = password.type === 'text';
      password.type = revealed ? 'password' : 'text';
      event.currentTarget.textContent = revealed ? 'Show' : 'Hide';
      event.currentTarget.setAttribute('aria-pressed', String(!revealed));
      event.currentTarget.setAttribute('aria-label', revealed ? 'Show password' : 'Hide password');
    });
    modal.querySelectorAll('[data-auth-info]').forEach((button) => button.addEventListener('click', () => {
      error.textContent = button.dataset.authInfo === 'recovery'
        ? 'Account recovery uses a verified mobile number or email and a one-time password.'
        : 'Registration continues through a verified contact and progressive account validation flow.';
      error.hidden = false;
      error.classList.add('is-info');
    }));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      error.classList.remove('is-info');
      if (!form.checkValidity()) {
        error.textContent = role === 'agent' && !agreement.checked
          ? 'Confirm the authorized agent declaration before continuing.'
          : 'Enter a valid account ID and password to continue.';
        error.hidden = false;
        form.reportValidity();
        return;
      }
      submit.disabled = true;
      submit.textContent = 'VERIFYING…';
      window.setTimeout(() => {
        const name = identity.value.trim();
        localStorage.setItem('irctc-auth-session', JSON.stringify({ name, role }));
        localStorage.setItem('irctc-logged-in', 'true');
        closeAuthModal();
        renderAuth();
        if (role === 'user') window.location.href = 'profile.html';
      }, 500);
    });
    identity.focus();
  }

  function openUserAuthModal() {
    closeAuthModal();
    const modal = document.createElement('div');
    modal.className = 'auth-modal-backdrop';
    modal.id = 'auth-modal';
    modal.innerHTML = `
      <section class="auth-modal glass-panel" role="dialog" aria-modal="true" aria-labelledby="user-auth-title">
        <button class="auth-close" type="button" aria-label="Close login">×</button>
        <span class="auth-kicker">SECURE ACCESS</span>
        <h2 id="user-auth-title">Sign in to IRCTC</h2>
        <p class="auth-subtitle">Create and verify a passenger account before booking.</p>
        <div class="auth-role-switch" role="tablist" aria-label="Account action">
          <button type="button" role="tab" aria-selected="true" class="auth-role active" data-user-mode="signin">Sign in</button>
          <button type="button" role="tab" aria-selected="false" class="auth-role" data-user-mode="register">Create account</button>
        </div>
        <form id="user-auth-form" novalidate>
          <div class="field-group"><label for="user-auth-email">Email address</label><input class="field-input" id="user-auth-email" type="email" autocomplete="username" required maxlength="80" placeholder="name@example.com"></div>
          <div class="field-group auth-password-group"><label for="user-auth-password">Password</label><div class="password-control"><input class="field-input" id="user-auth-password" type="password" autocomplete="current-password" required minlength="8" placeholder="Minimum 8 characters"><button type="button" class="password-toggle" aria-label="Show password" aria-pressed="false">Show</button></div></div>
          <div class="field-group auth-password-group" id="user-confirm-group" hidden><label for="user-auth-confirm">Confirm password</label><div class="password-control"><input class="field-input" id="user-auth-confirm" type="password" autocomplete="new-password" minlength="8" placeholder="Re-enter your password"></div></div>
          <div class="field-group" id="user-code-group" hidden><label for="user-auth-code">Email verification code</label><input class="field-input" id="user-auth-code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" placeholder="Enter the 6-digit code"><p class="auth-risk-note">Demo email code: <strong>123456</strong>. A live site would email this code to you.</p></div>
          <p class="auth-risk-note" id="user-auth-note">Your password is stored only as a non-reversible hash in this browser demo.</p>
          <p class="auth-error" id="user-auth-error" role="alert" hidden></p>
          <button type="submit" class="btn-primary auth-submit" id="user-auth-submit">SIGN IN SECURELY</button>
          <div class="auth-links"><button type="button" id="user-auth-recovery">Forgot account details?</button></div>
        </form>
        <p class="auth-prototype-note">Demo interface only — real accounts require a server, secure sessions, and an email delivery service.</p>
      </section>`;
    document.body.appendChild(modal);
    document.body.classList.add('auth-modal-open');

    let mode = 'signin';
    let pendingAccount;
    const form = modal.querySelector('#user-auth-form');
    const email = modal.querySelector('#user-auth-email');
    const password = modal.querySelector('#user-auth-password');
    const confirm = modal.querySelector('#user-auth-confirm');
    const confirmGroup = modal.querySelector('#user-confirm-group');
    const code = modal.querySelector('#user-auth-code');
    const codeGroup = modal.querySelector('#user-code-group');
    const error = modal.querySelector('#user-auth-error');
    const note = modal.querySelector('#user-auth-note');
    const submit = modal.querySelector('#user-auth-submit');

    function setMode(nextMode) {
      mode = nextMode;
      pendingAccount = undefined;
      const registering = mode === 'register';
      modal.querySelectorAll('[data-user-mode]').forEach((button) => {
        const selected = button.dataset.userMode === mode;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-selected', selected);
      });
      confirmGroup.hidden = !registering;
      confirm.required = registering;
      codeGroup.hidden = true;
      code.required = false;
      password.autocomplete = registering ? 'new-password' : 'current-password';
      submit.textContent = registering ? 'CREATE ACCOUNT' : 'SIGN IN SECURELY';
      note.textContent = registering
        ? 'Your password is stored only as a non-reversible hash in this browser demo.'
        : 'Use the email address and password from your verified account.';
      error.hidden = true;
    }

    modal.querySelectorAll('[data-user-mode]').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.userMode)));
    modal.querySelector('.auth-close').addEventListener('click', closeAuthModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeAuthModal(); });
    modal.querySelector('.password-toggle').addEventListener('click', (event) => {
      const revealed = password.type === 'text';
      password.type = revealed ? 'password' : 'text';
      event.currentTarget.textContent = revealed ? 'Show' : 'Hide';
      event.currentTarget.setAttribute('aria-pressed', String(!revealed));
    });
    modal.querySelector('#user-auth-recovery').addEventListener('click', () => {
      error.textContent = 'Account recovery needs a verified email service, which is not available in this local demo.';
      error.hidden = false;
      error.classList.add('is-info');
    });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      error.hidden = true;
      error.classList.remove('is-info');
      if (!form.checkValidity()) {
        error.textContent = 'Enter a valid email address and password to continue.';
        error.hidden = false;
        form.reportValidity();
        return;
      }
      submit.disabled = true;
      try {
        const accountEmail = normalizeEmail(email.value);
        const accounts = getAccounts();
        if (mode === 'register' && !pendingAccount) {
          if (password.value !== confirm.value) throw new Error('Passwords do not match.');
          const existingAccount = accounts.find((account) => account.email === accountEmail);
          if (existingAccount) {
            if (existingAccount.emailVerified) throw new Error('An account already exists for this email. Sign in instead.');
            if (existingAccount.passwordHash !== await passwordHash(password.value, existingAccount.salt)) throw new Error('The password does not match this pending account.');
            pendingAccount = existingAccount;
            codeGroup.hidden = false;
            code.required = true;
            submit.textContent = 'VERIFY EMAIL';
            note.textContent = 'Enter the demo code above to verify your email and continue to your profile.';
            code.focus();
            return;
          }
          const salt = createSalt();
          const account = { email: accountEmail, salt, passwordHash: await passwordHash(password.value, salt), emailVerified: false, memberSince: new Date().toISOString() };
          accounts.push(account);
          saveAccounts(accounts);
          pendingAccount = account;
          codeGroup.hidden = false;
          code.required = true;
          submit.textContent = 'VERIFY EMAIL';
          note.textContent = 'Enter the demo code above to verify your email and continue to your profile.';
          code.focus();
          return;
        }
        if (mode === 'register' && pendingAccount) {
          if (code.value !== '123456') throw new Error('Enter the six-digit demo code to verify this email.');
          const account = accounts.find((item) => item.email === pendingAccount.email);
          account.emailVerified = true;
          saveAccounts(accounts);
          localStorage.setItem('irctc-auth-session', JSON.stringify({ name: account.email, email: account.email, role: 'user', emailVerified: true, memberSince: account.memberSince }));
          localStorage.setItem('irctc-logged-in', 'true');
          window.location.href = 'profile.html';
          return;
        }
        const account = accounts.find((item) => item.email === accountEmail);
        if (!account || account.passwordHash !== await passwordHash(password.value, account.salt)) throw new Error('Email or password is incorrect.');
        if (!account.emailVerified) throw new Error('This email has not been verified. Create the account again to complete demo verification.');
        resetShowcaseProfile(account.email);
        localStorage.setItem('irctc-auth-session', JSON.stringify({ name: account.email, email: account.email, role: 'user', emailVerified: true, memberSince: account.memberSince }));
        localStorage.setItem('irctc-logged-in', 'true');
        window.location.href = 'profile.html';
      } catch (authError) {
        error.textContent = authError.message || 'We could not complete the request. Please try again.';
        error.hidden = false;
      } finally {
        submit.disabled = false;
        if (mode === 'signin') submit.textContent = 'SIGN IN SECURELY';
      }
    });
    email.focus();
  }

  renderAuth();

  const bookingPages = new Set(['passenger-details.html', 'review-pay.html', 'my-journey.html']);
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  function sendToProfileForBooking(destination) {
    localStorage.setItem('irctc-booking-intent', destination || 'passenger-details.html');
    const session = getSession();
    if (session && session.role === 'user') window.location.href = 'profile.html';
    else openUserAuthModal();
  }

  if (bookingPages.has(currentPage) && !hasBookableProfile()) {
    localStorage.setItem('irctc-booking-intent', currentPage);
    const session = getSession();
    if (session && session.role === 'user') window.location.replace('profile.html');
    else window.location.replace('index.html');
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || !bookingPages.has(link.getAttribute('href')) || hasBookableProfile()) return;
    event.preventDefault();
    sendToProfileForBooking(link.getAttribute('href'));
  });

  const languageSelect = document.getElementById('language-select');
  const savedLanguage = localStorage.getItem('irctc-language') || 'en';
  languageSelect.value = savedLanguage;
  languageSelect.addEventListener('change', () => {
    localStorage.setItem('irctc-language', languageSelect.value);
    window.dispatchEvent(new CustomEvent('irctc-language-change', { detail: languageSelect.value }));
  });

  const toggle = document.getElementById('nav-toggle');
  const primary = document.getElementById('nav-primary');
  toggle.addEventListener('click', () => {
    const open = primary.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.textContent = open ? '✕' : '☰';
  });

  let tickerIndex = 0;
  const track = document.getElementById('ticker-track');
  const items = track.querySelectorAll('.ticker-item');
  let tickerTimer;

  function showTicker(i) {
    tickerIndex = ((i % items.length) + items.length) % items.length;
    items.forEach((el, idx) => el.classList.toggle('active', idx === tickerIndex));
    track.style.transform = `translateX(-${tickerIndex * 100}%)`;
  }

  function startTickerAuto() {
    clearInterval(tickerTimer);
    tickerTimer = setInterval(() => showTicker(tickerIndex + 1), 3500);
  }

  document.querySelector('.ticker-prev').addEventListener('click', () => {
    showTicker(tickerIndex - 1);
    startTickerAuto();
  });
  document.querySelector('.ticker-next').addEventListener('click', () => {
    showTicker(tickerIndex + 1);
    startTickerAuto();
  });

  showTicker(0);
  startTickerAuto();

  if (!document.getElementById('rail-pet')) {
    const pet = document.createElement('div');
    pet.id = 'rail-pet';
    pet.className = 'rail-pet';
    pet.innerHTML = `
      <button type="button" class="rail-pet-face" id="rail-pet-toggle" aria-label="Open help assistant">
        <span class="rail-pet-dot"></span>
        <span class="rail-pet-label">RailGuide</span>
      </button>
      <div class="rail-pet-panel glass-panel" id="rail-pet-panel" hidden>
        <div class="rail-pet-head">
          <strong id="help-title">IRCTC Assistant</strong>
          <span class="demo-badge" id="help-demo">Demo</span>
          <button type="button" class="help-icon-btn" id="help-speaker" aria-label="Turn voice replies on" aria-pressed="false">&#128266;</button>
          <button type="button" class="help-icon-btn help-call-btn" id="help-call" aria-label="Start voice chat" aria-pressed="false">&#128222;</button>
          <button type="button" class="rail-pet-close" id="rail-pet-close" aria-label="Close">✕</button>
        </div>
        <div class="voice-chat-status" id="voice-chat-status" hidden><span class="voice-chat-dot"></span><span id="voice-chat-label"></span></div>
        <div class="help-messages" id="help-messages"></div>
        <div class="help-quick-replies" id="help-quick-replies" aria-label="Quick replies"></div>
        <form class="help-form" id="help-form">
          <input class="field-input" type="text" id="help-input" placeholder="Ask about PNR, refunds…" autocomplete="off" required>
          <button type="submit" class="btn-primary" id="help-send">SEND</button>
        </form>
      </div>
    `;
    document.body.appendChild(pet);

    const saved = localStorage.getItem('irctc-pet-pos');
    if (saved) {
      try {
        const pos = JSON.parse(saved);
        const left = Number.parseFloat(pos.left);
        const top = Number.parseFloat(pos.top);
        const visible = Number.isFinite(left) && Number.isFinite(top)
          && left >= 8 && top >= 8
          && left <= window.innerWidth - 64 && top <= window.innerHeight - 64;
        if (visible) {
          pet.style.left = `${left}px`;
          pet.style.top = `${top}px`;
          pet.style.right = 'auto';
          pet.style.bottom = 'auto';
        } else {
          localStorage.removeItem('irctc-pet-pos');
        }
      } catch (e) {
        localStorage.removeItem('irctc-pet-pos');
      }
    }

    const face = document.getElementById('rail-pet-toggle');
    const panel = document.getElementById('rail-pet-panel');
    document.getElementById('rail-pet-close').addEventListener('click', () => {
      panel.hidden = true;
      pet.classList.remove('is-open');
      window.dispatchEvent(new CustomEvent('irctc-assistant-close'));
    });
    face.addEventListener('click', () => {
      if (face.dataset.dragged === '1') {
        face.dataset.dragged = '0';
        return;
      }
      panel.hidden = !panel.hidden;
      pet.classList.toggle('is-open', !panel.hidden);
      window.dispatchEvent(new CustomEvent(panel.hidden ? 'irctc-assistant-close' : 'irctc-assistant-open'));
    });

    let dragging = false;
    let longPressTimer = null;
    let startX = 0;
    let startY = 0;
    let origX = 0;
    let origY = 0;

    function startDragging(fromLongPress = false) {
      dragging = true;
      if (fromLongPress) face.dataset.dragged = '1';
      face.classList.remove('pet-pressing');
      if (navigator.vibrate) navigator.vibrate(20);
    }

    function clearLongPress() {
      if (longPressTimer) window.clearTimeout(longPressTimer);
      longPressTimer = null;
      face.classList.remove('pet-pressing');
    }

    face.addEventListener('pointerdown', (e) => {
      face.setPointerCapture(e.pointerId);
      const rect = pet.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      origX = rect.left;
      origY = rect.top;
      face.dataset.dragged = '0';
      if (e.pointerType === 'touch') {
        face.classList.add('pet-pressing');
        longPressTimer = window.setTimeout(() => startDragging(true), 450);
      } else {
        startDragging();
      }
    });

    face.addEventListener('pointermove', (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!dragging) {
        if (Math.abs(dx) + Math.abs(dy) > 8) {
          face.dataset.dragged = '1';
          clearLongPress();
        }
        return;
      }
      if (Math.abs(dx) + Math.abs(dy) > 4) face.dataset.dragged = '1';
      const left = Math.min(window.innerWidth - 64, Math.max(8, origX + dx));
      const top = Math.min(window.innerHeight - 64, Math.max(8, origY + dy));
      pet.style.left = `${left}px`;
      pet.style.top = `${top}px`;
      pet.style.right = 'auto';
      pet.style.bottom = 'auto';
    });

    face.addEventListener('pointerup', () => {
      clearLongPress();
      if (!dragging) return;
      dragging = false;
      const rect = pet.getBoundingClientRect();
      localStorage.setItem('irctc-pet-pos', JSON.stringify({
        left: `${rect.left}px`,
        top: `${rect.top}px`,
      }));
    });
    face.addEventListener('pointercancel', () => {
      clearLongPress();
      dragging = false;
    });
  }
})();
