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
  const stored = localStorage.getItem('irctc-logged-in') === 'true';

  function renderAuth(loggedIn) {
    if (loggedIn) {
      authEl.innerHTML = `
        <button type="button" class="profile-btn" id="auth-toggle" aria-label="Account menu">
          <span class="profile-avatar">VM</span>
          <span class="profile-name">Vansh Mayekar</span>
        </button>
      `;
      document.querySelector('.welcome-text').textContent = 'Welcome, Vansh';
    } else {
      authEl.innerHTML = `
        <button type="button" class="login-btn" id="auth-toggle">LOGIN / REGISTER</button>
      `;
      document.querySelector('.welcome-text').textContent = 'Welcome, Passenger';
    }
    document.getElementById('auth-toggle').addEventListener('click', toggleAuth);
  }

  function toggleAuth() {
    const now = localStorage.getItem('irctc-logged-in') !== 'true';
    localStorage.setItem('irctc-logged-in', now);
    renderAuth(now);
  }

  renderAuth(stored);

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
