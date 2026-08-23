(function () {
  const page = document.body.dataset.page || '';

  const primaryLinks = [
    { id: 'home', label: 'HOME', href: 'index.html' },
    { id: 'trains', label: 'TRAINS', href: 'trains.html' },
    { id: 'meals', label: 'MEALS', href: '#' },
    { id: 'services', label: 'OTHER SERVICES', href: 'services.html' },
    { id: 'contact', label: 'CONTACT US', href: '#' },
  ];

  const tickerLinks = [
    { label: 'LOYALTY', href: '#' },
    { label: 'ALERTS', href: '#' },
    { label: 'E-WALLET', href: '#' },
  ];

  const announcements = [
    'Travel safely • Check train status before departure',
    'Monsoon alert: Some trains may run delayed in coastal routes — plan extra time',
    'Tatkal booking opens daily at 10:00 AM for AC classes and 11:00 AM for non-AC',
    'New e-wallet cashback: 5% on your next 3 bookings this month',
    'Platform change possible at major junctions — verify live status before boarding',
  ];

  const header = document.getElementById('site-header');
  if (!header) return;

  const primaryHtml = primaryLinks
    .map(
      (l) =>
        `<a href="${l.href}" class="nav-link${page === l.id ? ' active' : ''}">${l.label}</a>`
    )
    .join('');

  const tickerHtml = tickerLinks
    .map(
      (l, i) =>
        `<a href="${l.href}" class="ticker-item${i === 0 ? ' active' : ''}" data-index="${i}">${l.label}</a>`
    )
    .join('');

  header.className = 'site-header';
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
      <nav class="nav-primary" aria-label="Main navigation">${primaryHtml}</nav>
      <div class="nav-ticker" aria-label="Quick services">
        <button type="button" class="ticker-btn ticker-prev" aria-label="Previous service">‹</button>
        <div class="ticker-viewport">
          <div class="ticker-track" id="ticker-track">${tickerHtml}</div>
        </div>
        <button type="button" class="ticker-btn ticker-next" aria-label="Next service">›</button>
      </div>
    </div>
  `;

  // Announcement rotation
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

  // Auth toggle (demo: login ↔ profile)
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

  // Ticker
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
})();
