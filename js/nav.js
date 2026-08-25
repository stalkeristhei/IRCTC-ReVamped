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

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem('irctc-auth-session'));
    } catch (error) {
      return null;
    }
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
      authEl.innerHTML = `
        <button type="button" class="profile-btn" id="auth-toggle" aria-label="Account menu">
          <span class="profile-avatar">${initials(session.name)}</span>
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
      else openAuthModal();
    });
  }

  function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.remove();
    document.body.classList.remove('auth-modal-open');
  }

  function openAccountMenu() {
    const session = getSession();
    if (!session) return openAuthModal();
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
        <p class="auth-note">Your live session, permissions and account status are checked by the authentication service.</p>
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
      }, 500);
    });
    identity.focus();
  }

  renderAuth();

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
        <span class="rail-pet-label">AI</span>
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
