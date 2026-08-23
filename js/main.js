// Live clock for top bar
function updateClock() {
  const el = document.getElementById('live-datetime');
  if (!el) return;
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const date = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  el.textContent = `${date} | ${time}`;
}

updateClock();
setInterval(updateClock, 1000);

// Font size controls
document.querySelectorAll('.font-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const size = btn.dataset.size;
    if (size === 'sm') document.documentElement.style.fontSize = '14px';
    else if (size === 'lg') document.documentElement.style.fontSize = '18px';
    else document.documentElement.style.fontSize = '16px';
  });
});

// Payment method selection
document.querySelectorAll('.payment-option').forEach((opt) => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.payment-option').forEach((o) => o.classList.remove('selected'));
    opt.classList.add('selected');
  });
});

// Booking date — no past dates
const dateInput = document.getElementById('date');
if (dateInput && dateInput.type === 'date') {
  const today = new Date();
  const min = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
  dateInput.min = min;
  if (!dateInput.value || dateInput.value < min) {
    dateInput.value = min;
  }
  dateInput.addEventListener('change', () => {
    if (dateInput.value < min) dateInput.value = min;
  });
  dateInput.addEventListener('input', () => {
    if (dateInput.value && dateInput.value < min) dateInput.value = min;
  });
}

// Live route rendering (train status page)
function renderLiveRoute() {
  const container = document.getElementById('live-route');
  if (!container) return;

  const stops = [
    { name: 'New Delhi', code: 'NDLS', time: '05:20', status: 'passed' },
    { name: 'Agra Cantt', code: 'AGC', time: '07:45', status: 'passed' },
    { name: 'Gwalior', code: 'GWL', time: '09:30', status: 'passed' },
    { name: 'Jhansi', code: 'JHS', time: '11:05', status: 'current' },
    { name: 'Bhopal', code: 'BPL', time: '14:20', status: 'upcoming' },
    { name: 'Nagpur', code: 'NGP', time: '19:40', status: 'upcoming' },
    { name: 'Balharshah', code: 'BPQ', time: '22:15', status: 'upcoming' },
    { name: 'Warangal', code: 'WL', time: '03:50', status: 'upcoming' },
    { name: 'Vijayawada', code: 'BZA', time: '07:10', status: 'upcoming' },
    { name: 'MGR Chennai', code: 'MAS', time: '16:35', status: 'upcoming' },
  ];

  container.innerHTML = stops
    .map(
      (s, i) => `
    <div class="route-stop ${s.status}" data-stop="${i}">
      <div class="route-marker">
        <span class="route-dot"></span>
        ${i < stops.length - 1 ? '<span class="route-line"></span>' : ''}
      </div>
      <div class="route-info">
        <div class="route-station">${s.name} <span class="route-code">${s.code}</span></div>
        <div class="route-time">${s.time}</div>
        ${
          s.status === 'current'
            ? '<span class="route-live-badge">Live · Train here</span>'
            : s.status === 'passed'
              ? '<span class="route-status-label">Departed</span>'
              : '<span class="route-status-label muted">Upcoming</span>'
        }
      </div>
    </div>`
    )
    .join('');

  const current = container.querySelector('.route-stop.current');
  if (current) {
    current.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }
}

renderLiveRoute();

// AI Help bot (dummy)
const helpForm = document.getElementById('help-form');
const helpMessages = document.getElementById('help-messages');

const botReplies = [
  'I can help with PNR status, refunds, and train delays. What do you need?',
  'For PNR checks, go to Home → Check PNR, or share your 10-digit PNR here.',
  'Refunds usually take 5–7 working days. You can track progress under Track a Refund.',
  'If your train is delayed, live status updates appear on the Train Status page.',
  'For cancellation rules, visit Refund Tracker → View Refund Rules.',
  'I\'m a demo assistant — full AI support is coming soon. Try asking about PNR, refund, or delay.',
];

let replyIndex = 0;

function appendMessage(text, role) {
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = role === 'bot'
    ? `<span class="chat-avatar">AI</span><div class="chat-bubble">${text}</div>`
    : `<div class="chat-bubble">${text}</div><span class="chat-avatar user">VM</span>`;
  helpMessages.appendChild(div);
  helpMessages.scrollTop = helpMessages.scrollHeight;
}

if (helpForm && helpMessages) {
  appendMessage('Hi! I\'m the IRCTC help assistant (demo). Ask me about bookings, PNR, refunds, or train status.', 'bot');

  helpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('help-input');
    const text = input.value.trim();
    if (!text) return;
    appendMessage(text, 'user');
    input.value = '';
    setTimeout(() => {
      appendMessage(botReplies[replyIndex % botReplies.length], 'bot');
      replyIndex += 1;
    }, 600);
  });
}
