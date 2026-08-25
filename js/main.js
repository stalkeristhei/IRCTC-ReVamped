const STATIONS = [
  'New Delhi (NDLS)',
  'Hazrat Nizamuddin (NZM)',
  'Anand Vihar Terminal (ANVT)',
  'MGR Chennai Central (MAS)',
  'Chennai Egmore (MS)',
  'Mumbai Central (MMCT)',
  'CSTM Mumbai (CSMT)',
  'Howrah (HWH)',
  'Sealdah (SDAH)',
  'Kolkata (KOAA)',
  'Bengaluru City (SBC)',
  'Yesvantpur (YPR)',
  'Hyderabad Deccan (HYB)',
  'Secunderabad (SC)',
  'Pune (PUNE)',
  'Ahmedabad (ADI)',
  'Jaipur (JP)',
  'Lucknow NR (LKO)',
  'Patna (PNBE)',
  'Bhopal (BPL)',
  'Nagpur (NGP)',
  'Vijayawada (BZA)',
  'Bhubaneswar (BBS)',
  'Guwahati (GHY)',
  'Thiruvananthapuram Central (TVC)',
  'Ernakulam (ERS)',
  'Coimbatore (CBE)',
  'Madurai (MDU)',
  'Visakhapatnam (VSKP)',
  'Varanasi (BSB)',
  'Kanpur Central (CNB)',
  'Allahabad / Prayagraj (PRYJ)',
  'Amritsar (ASR)',
  'Chandigarh (CDG)',
  'Jammu Tawi (JAT)',
  'Udaipur City (UDZ)',
  'Surat (ST)',
  'Vadodara (BRC)',
  'Indore (INDB)',
  'Raipur (R)',
  'Ranchi (RNC)',
  'Gwalior (GWL)',
  'Jhansi (JHS)',
  'Agra Cantt (AGC)',
  'Ajmer Junction (AII)',
  'Aligarh Junction (ALJN)',
  'Bandra Terminus (BDTS)',
  'Bareilly (BE)',
  'Bikaner Junction (BKN)',
  'Bilaspur Junction (BSP)',
  'Dadar Central (DR)',
  'Dehradun (DDN)',
  'Gandhinagar Capital (GNC)',
  'Gaya Junction (GAYA)',
  'Jabalpur Junction (JBP)',
  'Jodhpur Junction (JU)',
  'Kacheguda (KCG)',
  'Kozhikode (CLT)',
  'Ludhiana Junction (LDH)',
  'Mangaluru Central (MAQ)',
  'Mysuru Junction (MYS)',
  'Nashik Road (NK)',
  'Rajendra Nagar Terminal (RJPB)',
  'Rajkot Junction (RJT)',
  'Siliguri Junction (SGUJ)',
  'Tiruchchirappalli Junction (TPJ)',
  'Vadodara Junction (BRC)',
];

function updateClock() {
  const el = document.getElementById('live-datetime') || document.getElementById('live-datetime');
  if (!el) return;
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  el.textContent = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} | ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

updateClock();
setInterval(updateClock, 1000);

document.querySelectorAll('.font-btn, .font-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const size = btn.dataset.size;
    if (size === 'sm') document.documentElement.style.fontSize = '14px';
    else if (size === 'lg') document.documentElement.style.fontSize = '18px';
    else document.documentElement.style.fontSize = '16px';
  });
});

document.querySelectorAll('.payment-option').forEach((opt) => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.payment-option').forEach((o) => o.classList.remove('selected'));
    opt.classList.add('selected');
  });
});

function fillStationLists() {
  document.querySelectorAll('datalist[data-stations]').forEach((list) => {
    list.innerHTML = STATIONS.map((s) => `<option value="${s}"></option>`).join('');
  });
}
fillStationLists();

function initStationPickers() {
  const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

  document.querySelectorAll('input[list="station-list"]').forEach((input) => {
    if (input.closest('.station-picker')) return;

    const picker = document.createElement('div');
    picker.className = 'station-picker';
    input.parentNode.insertBefore(picker, input);
    picker.appendChild(input);
    input.removeAttribute('list');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'station-picker-toggle';
    toggle.setAttribute('aria-label', 'Show station list');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '&#8964;';

    const options = document.createElement('div');
    options.className = 'station-options';
    options.setAttribute('role', 'listbox');
    options.hidden = true;
    picker.append(toggle, options);

    let matches = STATIONS;
    let activeIndex = -1;

    const close = () => {
      options.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-expanded', 'false');
      activeIndex = -1;
    };

    const choose = (station) => {
      input.value = station;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      close();
      input.focus();
    };

    const render = (query = '') => {
      const term = normalize(query);
      matches = term
        ? STATIONS.filter((station) => normalize(station).includes(term))
        : STATIONS;
      activeIndex = -1;
      options.replaceChildren();
      matches.slice(0, 8).forEach((station) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'station-option';
        option.setAttribute('role', 'option');
        option.textContent = station;
        option.addEventListener('mousedown', (event) => event.preventDefault());
        option.addEventListener('click', () => choose(station));
        options.appendChild(option);
      });
      if (!matches.length) {
        const empty = document.createElement('p');
        empty.className = 'station-empty';
        empty.textContent = 'No matching station';
        options.appendChild(empty);
      }
      options.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-expanded', 'true');
    };

    input.addEventListener('focus', () => render());
    input.addEventListener('input', () => render(input.value));
    toggle.addEventListener('click', () => (options.hidden ? render() : close()));
    input.addEventListener('keydown', (event) => {
      const visibleMatches = matches.slice(0, 8);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (options.hidden) render(input.value);
        activeIndex = event.key === 'ArrowDown'
          ? Math.min(activeIndex + 1, visibleMatches.length - 1)
          : Math.max(activeIndex - 1, 0);
        options.querySelectorAll('.station-option').forEach((option, index) => {
          option.classList.toggle('is-active', index === activeIndex);
        });
      } else if (event.key === 'Enter' && activeIndex >= 0) {
        event.preventDefault();
        choose(visibleMatches[activeIndex]);
      } else if (event.key === 'Escape') {
        close();
      }
    });
    document.addEventListener('click', (event) => {
      if (!picker.contains(event.target)) close();
    });
  });
}
initStationPickers();

const dateInput = document.getElementById('date') || document.getElementById('vacancy-date');
if (dateInput && dateInput.type === 'date') {
  const today = new Date();
  const min = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
  dateInput.min = min;
  if (!dateInput.value || dateInput.value < min) dateInput.value = min;
  const clamp = () => {
    if (dateInput.value && dateInput.value < min) dateInput.value = min;
  };
  dateInput.addEventListener('change', clamp);
  dateInput.addEventListener('input', clamp);
}

function renderLiveRoute() {
  const container = document.getElementById('live-route') || document.getElementById('live-route');
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
  if (current) current.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
}
renderLiveRoute();

function initTrainFilters() {
  const cards = document.querySelectorAll('.train-card[data-dep], .train-card[data-dep]');
  if (!cards.length) return;

  const state = { dep: new Set(), duration: new Set(), avail: new Set(), cls: new Set() };

  document.querySelectorAll('.filter-chip, .filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const group = chip.dataset.group;
      const value = chip.dataset.value;
      if (chip.classList.contains('active')) {
        chip.classList.remove('active');
        state[group].delete(value);
      } else {
        chip.classList.add('active');
        state[group].add(value);
      }
      apply();
    });
  });

  const clearBtn = document.getElementById('clear-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      Object.values(state).forEach((set) => set.clear());
      document.querySelectorAll('.filter-chip, .filter-chip').forEach((c) => c.classList.remove('active'));
      apply();
    });
  }

  function apply() {
    let visible = 0;
    cards.forEach((card) => {
      const depOk = !state.dep.size || state.dep.has(card.dataset.dep);
      const durOk = !state.duration.size || state.duration.has(card.dataset.duration);
      const avOk = !state.avail.size || state.avail.has(card.dataset.avail);
      const classes = (card.dataset.class || '').split(',');
      const clOk = !state.cls.size || classes.some((c) => state.cls.has(c));
      const show = depOk && durOk && avOk && clOk;
      card.hidden = !show;
      if (show) visible += 1;
    });
    const count = document.getElementById('train-count');
    if (count) count.textContent = `${visible} train${visible === 1 ? '' : 's'} found`;
  }
}
initTrainFilters();

const BOT_LOCALES = {
  en: {
    voice: 'en-IN', title: 'IRCTC Assistant', demo: 'Demo', placeholder: 'Ask about PNR, refunds...', send: 'Send',
    intro: 'Hi! I can help with bookings, PNR, refunds, and train status.', changed: 'I will now reply in English.',
    mic: 'Use voice input', speakerOn: 'Turn voice replies on', speakerOff: 'Turn voice replies off', listening: 'Listening...', unsupported: 'Voice input is not available in this browser.', voiceOn: 'Voice replies are on.',
    quick: [['Check PNR', 'pnr'], ['Track refund', 'refund'], ['Train status', 'status']],
    replies: { pnr: 'Share your 10-digit PNR, or open Check PNR from the home page to view your booking status.', refund: 'Refunds usually take 5 to 7 working days. You can follow the progress under Track a Refund.', status: 'Open Train Status to see the latest running status, delay, and platform information.', booking: 'Choose your From and To stations, travel date, class, and quota, then select Search Trains.', generic: 'I can help with bookings, PNR, refunds, and train status. Which one would you like to check?' }
  },
  hi: {
    voice: 'hi-IN', title: '\u0906\u0908\u0906\u0930\u0938\u0940\u091f\u0940\u0938\u0940 \u0938\u0939\u093e\u092f\u0915', demo: '\u0921\u0947\u092e\u094b', placeholder: '\u092a\u0940\u090f\u0928\u0906\u0930, \u0930\u093f\u092b\u0902\u0921 \u092f\u093e \u091f\u094d\u0930\u0947\u0928 \u0915\u0947 \u092c\u093e\u0930\u0947 \u092e\u0947\u0902 \u092a\u0942\u091b\u0947\u0902...', send: '\u092d\u0947\u091c\u0947\u0902',
    intro: '\u0928\u092e\u0938\u094d\u0924\u0947! \u092e\u0948\u0902 \u092c\u0941\u0915\u093f\u0902\u0917, \u092a\u0940\u090f\u0928\u0906\u0930, \u0930\u093f\u092b\u0902\u0921 \u0914\u0930 \u091f\u094d\u0930\u0947\u0928 \u0938\u094d\u0925\u093f\u0924\u093f \u092e\u0947\u0902 \u092e\u0926\u0926 \u0915\u0930 \u0938\u0915\u0924\u093e \u0939\u0942\u0901\u0964', changed: '\u0905\u092c \u092e\u0948\u0902 \u0939\u093f\u0928\u094d\u0926\u0940 \u092e\u0947\u0902 \u091c\u0935\u093e\u092c \u0926\u0942\u0901\u0917\u093e\u0964',
    mic: '\u0935\u0949\u0907\u0938 \u0907\u0928\u092a\u0941\u091f \u0915\u0930\u0947\u0902', speakerOn: '\u0935\u0949\u0907\u0938 \u0930\u093f\u092a\u094d\u0932\u093e\u0908 \u091a\u093e\u0932\u0942 \u0915\u0930\u0947\u0902', speakerOff: '\u0935\u0949\u0907\u0938 \u0930\u093f\u092a\u094d\u0932\u093e\u0908 \u092c\u0902\u0926 \u0915\u0930\u0947\u0902', listening: '\u0938\u0941\u0928 \u0930\u0939\u093e \u0939\u0942\u0901...', unsupported: '\u0907\u0938 \u092c\u094d\u0930\u093e\u0909\u091c\u093c\u0930 \u092e\u0947\u0902 \u0935\u0949\u0907\u0938 \u0907\u0928\u092a\u0941\u091f \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964', voiceOn: '\u0935\u0949\u0907\u0938 \u0930\u093f\u092a\u094d\u0932\u093e\u0908 \u091a\u093e\u0932\u0942 \u0939\u0948\u0902\u0964',
    quick: [['\u092a\u0940\u090f\u0928\u0906\u0930 \u091c\u093e\u0902\u091a\u0947\u0902', 'pnr'], ['\u0930\u093f\u092b\u0902\u0921 \u091f\u094d\u0930\u0948\u0915 \u0915\u0930\u0947\u0902', 'refund'], ['\u091f\u094d\u0930\u0947\u0928 \u0938\u094d\u0925\u093f\u0924\u093f', 'status']],
    replies: { pnr: '\u0905\u092a\u0928\u093e 10 \u0905\u0902\u0915\u094b\u0902 \u0915\u093e \u092a\u0940\u090f\u0928\u0906\u0930 \u0938\u093e\u091d\u093e \u0915\u0930\u0947\u0902, \u092f\u093e \u0939\u094b\u092e \u092a\u0947\u091c \u092a\u0930 \u092a\u0940\u090f\u0928\u0906\u0930 \u091c\u093e\u0902\u091a\u0947\u0902\u0964', refund: '\u0930\u093f\u092b\u0902\u0921 \u092e\u0947\u0902 \u0906\u092e\u0924\u094c\u0930 \u092a\u0930 5 \u0938\u0947 7 \u0915\u093e\u0930\u094d\u092f \u0926\u093f\u0935\u0938 \u0932\u0917\u0924\u0947 \u0939\u0948\u0902\u0964 \u091f\u094d\u0930\u0948\u0915 \u0905 \u0930\u093f\u092b\u0902\u0921 \u092e\u0947\u0902 \u092a\u094d\u0930\u0917\u0924\u093f \u0926\u0947\u0916\u0947\u0902\u0964', status: '\u091f\u094d\u0930\u0947\u0928 \u0938\u094d\u0925\u093f\u0924\u093f \u092a\u0947\u091c \u092a\u0930 \u0932\u0947\u091f\u0947\u0938\u094d\u091f \u0930\u0928\u093f\u0902\u0917 \u0938\u094d\u091f\u0947\u091f\u0938, \u0926\u0947\u0930\u0940 \u0914\u0930 \u092a\u094d\u0932\u0947\u091f\u092b\u093c\u0949\u0930\u094d\u092e \u0915\u0940 \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0926\u0947\u0916\u0947\u0902\u0964', booking: '\u092a\u094d\u0930\u0938\u094d\u0925\u093e\u0928 \u0914\u0930 \u0917\u0902\u0924\u0935\u094d\u092f \u0938\u094d\u091f\u0947\u0936\u0928, \u092f\u093e\u0924\u094d\u0930\u093e \u0924\u093f\u0925\u093f, \u0936\u094d\u0930\u0947\u0923\u0940 \u0914\u0930 \u0915\u094b\u091f\u093e \u091a\u0941\u0928\u0915\u0930 \u091f\u094d\u0930\u0947\u0928 \u0916\u094b\u091c\u0947\u0902\u0964', generic: '\u092e\u0948\u0902 \u092c\u0941\u0915\u093f\u0902\u0917, \u092a\u0940\u090f\u0928\u0906\u0930, \u0930\u093f\u092b\u0902\u0921 \u0914\u0930 \u091f\u094d\u0930\u0947\u0928 \u0938\u094d\u0925\u093f\u0924\u093f \u092e\u0947\u0902 \u092e\u0926\u0926 \u0915\u0930 \u0938\u0915\u0924\u093e \u0939\u0942\u0901\u0964 \u0906\u092a \u0915\u094d\u092f\u093e \u091c\u093e\u0928\u0928\u093e \u091a\u093e\u0939\u0947\u0902\u0917\u0947?'}
  },
  kok: {
    voice: 'kok-IN', title: 'IRCTC Sahayak', demo: 'Demo', placeholder: 'PNR, refund va train vixim vicharat...', send: 'Dhadd', intro: 'Namaskar! Hanv booking, PNR, refund ani train vixim mhaka madat karunk zata.', changed: 'Ata hanv Konknint zap ditlam.', mic: 'Voice input vaprat', speakerOn: 'Voice reply suru karat', speakerOff: 'Voice reply band karat', listening: 'Aikta...', unsupported: 'Hya browserant voice input upolobdh na.', voiceOn: 'Voice reply suru zalo.', quick: [['PNR tapasat', 'pnr'], ['Refund magovat', 'refund'], ['Train vixim', 'status']], replies: { pnr: 'Tumcho 10 ankacho PNR diat, va Home pageacher Check PNR vaprat.', refund: 'Refundak sadharan 5 te 7 kamache dis lagtat. Track a Refund mhaka pragati disat.', status: 'Train Status pageacher latest running status, ushir ani platformachem mhaiti dixtolem.', booking: 'From ani To station, tarikh, class ani quota vhechun Search Trains vaprat.', generic: 'Hanv booking, PNR, refund ani train vixim mhaka madat karunk zata. Tumkam kiteak zai?' }
  },
  ur: {
    voice: 'ur-IN', title: '\u0622\u0626\u06cc \u0622\u0631 \u0633\u06cc \u0679\u06cc \u0633\u06cc \u0645\u0639\u0627\u0648\u0646', demo: '\u0688\u06cc\u0645\u0648', placeholder: '\u067e\u06cc \u0627\u06cc\u0646 \u0622\u0631\u060c \u0631\u0641\u0646\u0688 \u06cc\u0627 \u0679\u0631\u06cc\u0646 \u06a9\u06d2 \u0628\u0627\u0631\u06d2 \u0645\u06cc\u06ba \u067e\u0648\u0686\u06be\u06cc\u06ba...', send: '\u0628\u06be\u06cc\u062c\u06cc\u06ba', intro: '\u0622\u062f\u0627\u0628! \u0645\u06cc\u06ba \u0628\u06a9\u0646\u06af\u060c \u067e\u06cc \u0627\u06cc\u0646 \u0622\u0631\u060c \u0631\u0641\u0646\u0688 \u0627\u0648\u0631 \u0679\u0631\u06cc\u0646 \u06a9\u06cc \u062d\u0627\u0644\u062a \u0645\u06cc\u06ba \u0645\u062f\u062f \u06a9\u0631 \u0633\u06a9\u062a\u0627 \u06c1\u0648\u06ba\u06d4', changed: '\u0627\u0628 \u0645\u06cc\u06ba \u0627\u0631\u062f\u0648 \u0645\u06cc\u06ba \u062c\u0648\u0627\u0628 \u062f\u0648\u06ba \u06af\u0627\u06d4', mic: '\u0648\u0627\u0626\u0633 \u0627\u0646 \u067e\u0679 \u0627\u0633\u062a\u0639\u0645\u0627\u0644 \u06a9\u0631\u06cc\u06ba', speakerOn: '\u0648\u0627\u0626\u0633 \u062c\u0648\u0627\u0628 \u0686\u0627\u0644\u0648 \u06a9\u0631\u06cc\u06ba', speakerOff: '\u0648\u0627\u0626\u0633 \u062c\u0648\u0627\u0628 \u0628\u0646\u062f \u06a9\u0631\u06cc\u06ba', listening: '\u0633\u0646 \u0631\u06c1\u0627 \u06c1\u0648\u06ba...', unsupported: '\u0627\u0633 \u0628\u0631\u0627\u0624\u0632\u0631 \u0645\u06cc\u06ba \u0648\u0627\u0626\u0633 \u0627\u0646 \u067e\u0679 \u062f\u0633\u062a\u06cc\u0627\u0628 \u0646\u06c1\u06cc\u06ba \u06c1\u06d2\u06d4', voiceOn: '\u0648\u0627\u0626\u0633 \u062c\u0648\u0627\u0628 \u0686\u0627\u0644\u0648 \u06c1\u06cc\u06ba\u06d4', quick: [['\u067e\u06cc \u0627\u06cc\u0646 \u0622\u0631 \u0686\u06cc\u06a9 \u06a9\u0631\u06cc\u06ba', 'pnr'], ['\u0631\u0641\u0646\u0688 \u0679\u0631\u06cc\u06a9 \u06a9\u0631\u06cc\u06ba', 'refund'], ['\u0679\u0631\u06cc\u0646 \u06a9\u06cc \u062d\u0627\u0644\u062a', 'status']], replies: { pnr: '\u0627\u067e\u0646\u0627 10 \u06c1\u0646\u062f\u0633\u0648\u06ba \u06a9\u0627 \u067e\u06cc \u0627\u06cc\u0646 \u0622\u0631 \u0628\u062a\u0627\u0626\u06cc\u06ba\u060c \u06cc\u0627 \u06c1\u0648\u0645 \u067e\u06cc\u062c \u067e\u0631 Check PNR \u0627\u0633\u062a\u0639\u0645\u0627\u0644 \u06a9\u0631\u06cc\u06ba\u06d4', refund: '\u0631\u0641\u0646\u0688 \u0645\u06cc\u06ba \u0639\u0627\u0645 \u0637\u0648\u0631 \u067e\u0631 5 \u0633\u06d2 7 \u06a9\u0627\u0631\u0648\u0628\u0627\u0631\u06cc \u062f\u0646 \u0644\u06af\u062a\u06d2 \u06c1\u06cc\u06ba\u06d4 Track a Refund \u0645\u06cc\u06ba \u067e\u06cc\u0634 \u0631\u0641\u062a \u062f\u06cc\u06a9\u06be\u06cc\u06ba\u06d4', status: 'Train Status \u067e\u06cc\u062c \u067e\u0631 \u062a\u0627\u0632\u06c1 \u0631\u0646\u0646\u06af \u0627\u0633\u0679\u06cc\u0679\u0633\u060c \u062a\u0627\u062e\u06cc\u0631 \u0627\u0648\u0631 \u067e\u0644\u06cc\u0679 \u0641\u0627\u0631\u0645 \u06a9\u06cc \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u062f\u06cc\u06a9\u06be\u06cc\u06ba\u06d4', booking: '\u0631\u0648\u0627\u0646\u06af\u06cc \u0627\u0648\u0631 \u0645\u0646\u0632\u0644 \u0627\u0633\u0679\u06cc\u0634\u0646\u060c \u0633\u0641\u0631 \u06a9\u06cc \u062a\u0627\u0631\u06cc\u062e\u060c \u06a9\u0644\u0627\u0633 \u0627\u0648\u0631 \u06a9\u0648\u0679\u06c1 \u0686\u0646\u06c1 \u067e\u06be\u0631 Search Trains \u06a9\u0631\u06cc\u06ba\u06d4', generic: '\u0645\u06cc\u06ba \u0628\u06a9\u0646\u06af\u060c \u067e\u06cc \u0627\u06cc\u0646 \u0622\u0631\u060c \u0631\u0641\u0646\u0688 \u0627\u0648\u0631 \u0679\u0631\u06cc\u0646 \u06a9\u06cc \u062d\u0627\u0644\u062a \u0645\u06cc\u06ba \u0645\u062f\u062f \u06a9\u0631 \u0633\u06a9\u062a\u0627 \u06c1\u0648\u06ba\u06d4 \u0622\u067e \u06a9\u06cc\u0627 \u0686\u06cc\u06a9 \u06a9\u0631\u0646\u0627 \u0686\u0627\u06c1\u06cc\u06ba \u06af\u06d2\u061f' }
  }
};

const VOICE_CHAT_COPY = {
  en: { start: 'Start voice chat', end: 'End voice chat', active: 'Voice chat active — listening' },
  hi: { start: '\u0935\u0949\u0907\u0938 \u091a\u0948\u091f \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902', end: '\u0935\u0949\u0907\u0938 \u091a\u0948\u091f \u092c\u0902\u0926 \u0915\u0930\u0947\u0902', active: '\u0935\u0949\u0907\u0938 \u091a\u0948\u091f \u091a\u093e\u0932\u0942 \u0939\u0948 — \u0938\u0941\u0928 \u0930\u0939\u093e \u0939\u0942\u0901' },
  kok: { start: 'Voice chat suru karat', end: 'Voice chat band karat', active: 'Voice chat suru asa — aikta' },
  ur: { start: '\u0648\u0627\u0626\u0633 \u0686\u06cc\u0679 \u0634\u0631\u0648\u0639 \u06a9\u0631\u06cc\u06ba', end: '\u0648\u0627\u0626\u0633 \u0686\u06cc\u0679 \u0628\u0646\u062f \u06a9\u0631\u06cc\u06ba', active: '\u0648\u0627\u0626\u0633 \u0686\u06cc\u0679 \u0686\u0627\u0644\u0648 \u06c1\u06d2 — \u0633\u0646 \u0631\u06c1\u0627 \u06c1\u0648\u06ba' }
};

let voiceRepliesEnabled = true;
let botLanguage = localStorage.getItem('irctc-language') || 'en';
function getBotLocale() { return BOT_LOCALES[localStorage.getItem('irctc-language') || botLanguage] || BOT_LOCALES.en; }
function getVoiceChatCopy() { return VOICE_CHAT_COPY[localStorage.getItem('irctc-language') || botLanguage] || VOICE_CHAT_COPY.en; }

function speakBotReply(text, onEnd, force = false) {
  if ((!voiceRepliesEnabled && !force) || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getBotLocale().voice;
  const voice = speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith(utterance.lang.slice(0, 2).toLowerCase()));
  if (voice) utterance.voice = voice;
  if (onEnd) {
    utterance.addEventListener('end', onEnd, { once: true });
    utterance.addEventListener('error', onEnd, { once: true });
  }
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function appendMessage(text, role, speak = false) {
  const helpMessages = document.getElementById('help-messages');
  if (!helpMessages) return;
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = text;
  const avatar = document.createElement('span');
  avatar.className = role === 'bot' ? 'chat-avatar' : 'chat-avatar user';
  avatar.textContent = role === 'bot' ? 'AI' : 'VM';
  div.append(role === 'bot' ? avatar : bubble, role === 'bot' ? bubble : avatar);
  helpMessages.appendChild(div);
  helpMessages.scrollTop = helpMessages.scrollHeight;
  if (role === 'bot' && speak) speakBotReply(text);
}

function initHelpBot() {
  const helpForm = document.getElementById('help-form');
  const helpMessages = document.getElementById('help-messages');
  if (!helpForm || !helpMessages) return;
  const input = document.getElementById('help-input');
  const title = document.getElementById('help-title');
  const demo = document.getElementById('help-demo');
  const sendButton = document.getElementById('help-send');
  const micButton = document.getElementById('help-mic');
  const speakerButton = document.getElementById('help-speaker');
  const callButton = document.getElementById('help-call');
  const voiceChatStatus = document.getElementById('voice-chat-status');
  const voiceChatLabel = document.getElementById('voice-chat-label');
  const quickReplies = document.getElementById('help-quick-replies');
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let voiceChatActive = false;
  let callRecognition = null;
  let callRestartTimer = null;
  let callAwaitingReply = false;
  const voiceError = (reason) => {
    const language = localStorage.getItem('irctc-language') || botLanguage;
    const messages = {
      en: {
        permission: 'Allow microphone access in your browser, then start the voice chat again.',
        microphone: 'No microphone was detected. Connect one and try again.',
        network: 'Voice recognition needs an internet connection. Check your connection and try again.',
        unavailable: 'Voice recognition is unavailable here. Use the latest Chrome or Edge with microphone permission enabled.',
        noSpeech: 'I did not hear anything — still listening.'
      },
      hi: {
        permission: '\u092c\u094d\u0930\u093e\u0909\u091c\u093c\u0930 \u092e\u0947\u0902 \u092e\u093e\u0908\u0915\u094d\u0930\u094b\u092b\u094b\u0928 \u0915\u0940 \u0905\u0928\u0941\u092e\u0924\u093f \u0926\u0947\u0902, \u092b\u093f\u0930 \u0935\u0949\u0907\u0938 \u091a\u0948\u091f \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902\u0964',
        microphone: '\u092e\u093e\u0908\u0915\u094d\u0930\u094b\u092b\u094b\u0928 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964 \u0915\u0943\u092a\u092f\u093e \u0909\u0938\u0947 \u0915\u0928\u0947\u0915\u094d\u091f \u0915\u0930\u0947\u0902\u0964',
        network: '\u0935\u0949\u0907\u0938 \u0930\u093f\u0915\u0917\u0928\u093f\u0936\u0928 \u0915\u0947 \u0932\u093f\u090f \u0907\u0902\u091f\u0930\u0928\u0947\u091f \u0915\u0928\u0947\u0915\u094d\u0936\u0928 \u091a\u093e\u0939\u093f\u090f\u0964',
        unavailable: '\u0935\u0949\u0907\u0938 \u0930\u093f\u0915\u0917\u0928\u093f\u0936\u0928 \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u092e\u093e\u0908\u0915\u094d\u0930\u094b\u092b\u094b\u0928 \u0905\u0928\u0941\u092e\u0924\u093f \u0915\u0947 \u0938\u093e\u0925 \u0928\u092f\u093e Chrome \u092f\u093e Edge \u0907\u0938\u094d\u0924\u0947\u092e\u093e\u0932 \u0915\u0930\u0947\u0902\u0964',
        noSpeech: '\u0906\u0935\u093e\u091c\u093c \u0938\u0941\u0928\u093e\u0908 \u0928\u0939\u0940\u0902 \u0926\u0940 — \u092e\u0948\u0902 \u0938\u0941\u0928 \u0930\u0939\u093e \u0939\u0942\u0901\u0964'
      }
    };
    return (messages[language] || messages.en)[reason] || (messages[language] || messages.en).unavailable;
  };

  const setVoiceChatStatus = (text) => {
    voiceChatStatus.hidden = false;
    voiceChatLabel.textContent = text;
  };

  const requestMicrophoneAccess = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      return false;
    }
  };

  const replyFor = (text, topic) => {
    if (topic) return getBotLocale().replies[topic];
    const query = text.toLowerCase();
    if (/pnr|\u092a\u0940\u090f\u0928\u0906\u0930|\u067e\u06cc \u0627\u06cc\u0646 \u0622\u0631/.test(query)) return getBotLocale().replies.pnr;
    if (/refund|\u0930\u093f\u092b\u0902\u0921|\u0631\u0641\u0646\u0688/.test(query)) return getBotLocale().replies.refund;
    if (/status|delay|train|\u0938\u094d\u0925\u093f\u0924\u093f|\u091f\u094d\u0930\u0947\u0928|\u062d\u0627\u0644\u062a|\u0679\u0631\u06cc\u0646/.test(query)) return getBotLocale().replies.status;
    if (/book|ticket|station|\u092c\u0941\u0915|\u091f\u093f\u0915\u091f|\u0628\u06a9\u0646\u06af|\u0679\u06a9\u0679/.test(query)) return getBotLocale().replies.booking;
    return getBotLocale().replies.generic;
  };

  const sendMessage = (text, topic, fromVoiceChat = false) => {
    if (!text) return;
    appendMessage(text, 'user');
    input.value = '';
    window.setTimeout(() => {
      const reply = replyFor(text, topic);
      appendMessage(reply, 'bot');
      if (fromVoiceChat) {
        callAwaitingReply = false;
        speakBotReply(reply, () => scheduleVoiceChatListening(), true);
      } else {
        speakBotReply(reply);
      }
    }, 350);
  };

  const scheduleVoiceChatListening = () => {
    window.clearTimeout(callRestartTimer);
    if (!voiceChatActive || callRecognition) return;
    callRestartTimer = window.setTimeout(() => startVoiceChatListening(), 250);
  };

  const stopVoiceChat = () => {
    voiceChatActive = false;
    callAwaitingReply = false;
    window.clearTimeout(callRestartTimer);
    if (callRecognition) {
      callRecognition.stop();
      callRecognition = null;
    }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    voiceChatStatus.hidden = true;
    callButton.classList.remove('is-in-call');
    callButton.setAttribute('aria-pressed', 'false');
    callButton.setAttribute('aria-label', getVoiceChatCopy().start);
  };

  const startVoiceChatListening = () => {
    if (!voiceChatActive || !Recognition || callRecognition) return;
    const recognition = new Recognition();
    callRecognition = recognition;
    recognition.lang = getBotLocale().voice;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.addEventListener('start', () => {
      setVoiceChatStatus(getVoiceChatCopy().active);
      callButton.classList.add('is-listening');
    });
    recognition.addEventListener('result', (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (!transcript) return;
      callAwaitingReply = true;
      sendMessage(transcript, undefined, true);
    });
    recognition.addEventListener('end', () => {
      if (callRecognition === recognition) callRecognition = null;
      callButton.classList.remove('is-listening');
      if (voiceChatActive && !callAwaitingReply) scheduleVoiceChatListening();
    });
    recognition.addEventListener('error', (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        stopVoiceChat();
        appendMessage(voiceError('permission'), 'bot');
      } else if (event.error === 'audio-capture') {
        stopVoiceChat();
        appendMessage(voiceError('microphone'), 'bot');
      } else if (event.error === 'network') {
        stopVoiceChat();
        appendMessage(voiceError('network'), 'bot');
      } else if (event.error === 'no-speech') {
        setVoiceChatStatus(voiceError('noSpeech'));
      }
    });
    try {
      recognition.start();
    } catch (error) {
      callRecognition = null;
      stopVoiceChat();
      appendMessage(voiceError('unavailable'), 'bot');
    }
  };

  const startVoiceChat = async () => {
    if (!Recognition) return appendMessage(voiceError('unavailable'), 'bot');
    setVoiceChatStatus(getVoiceChatCopy().active);
    if (!(await requestMicrophoneAccess())) {
      voiceChatStatus.hidden = true;
      appendMessage(voiceError('permission'), 'bot');
      return;
    }
    voiceRepliesEnabled = true;
    voiceChatActive = true;
    setVoiceChatStatus(getVoiceChatCopy().active);
    callButton.classList.add('is-in-call');
    callButton.setAttribute('aria-pressed', 'true');
    callButton.setAttribute('aria-label', getVoiceChatCopy().end);
    renderLocale();
    startVoiceChatListening();
  };

  const renderLocale = () => {
    const locale = getBotLocale();
    title.textContent = locale.title;
    demo.textContent = locale.demo;
    input.placeholder = locale.placeholder;
    sendButton.textContent = locale.send;
    micButton.setAttribute('aria-label', locale.mic);
    speakerButton.setAttribute('aria-label', voiceRepliesEnabled ? locale.speakerOff : locale.speakerOn);
    speakerButton.setAttribute('aria-pressed', String(voiceRepliesEnabled));
    callButton.setAttribute('aria-label', voiceChatActive ? getVoiceChatCopy().end : getVoiceChatCopy().start);
    if (voiceChatActive) voiceChatLabel.textContent = getVoiceChatCopy().active;
    quickReplies.replaceChildren();
    locale.quick.forEach(([label, topic]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quick-reply';
      button.textContent = label;
      button.addEventListener('click', () => sendMessage(label, topic));
      quickReplies.appendChild(button);
    });
  };

  helpForm.addEventListener('submit', (event) => { event.preventDefault(); sendMessage(input.value.trim()); });
  micButton.addEventListener('click', async () => {
    if (!Recognition) return appendMessage(voiceError('unavailable'), 'bot');
    if (!(await requestMicrophoneAccess())) return appendMessage(voiceError('permission'), 'bot');
    const recognition = new Recognition();
    recognition.lang = getBotLocale().voice;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    micButton.classList.add('is-listening');
    recognition.addEventListener('result', (event) => sendMessage(event.results[0][0].transcript.trim()));
    recognition.addEventListener('end', () => { micButton.classList.remove('is-listening'); renderLocale(); });
    recognition.addEventListener('error', (event) => {
      micButton.classList.remove('is-listening');
      renderLocale();
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') appendMessage(voiceError('permission'), 'bot');
      else if (event.error === 'audio-capture') appendMessage(voiceError('microphone'), 'bot');
      else if (event.error === 'network') appendMessage(voiceError('network'), 'bot');
    });
    try {
      recognition.start();
    } catch (error) {
      micButton.classList.remove('is-listening');
      renderLocale();
      appendMessage(voiceError('unavailable'), 'bot');
    }
  });
  speakerButton.addEventListener('click', () => {
    voiceRepliesEnabled = !voiceRepliesEnabled;
    if (!voiceRepliesEnabled && 'speechSynthesis' in window) speechSynthesis.cancel();
    renderLocale();
    if (voiceRepliesEnabled) appendMessage(getBotLocale().voiceOn, 'bot', true);
  });
  callButton.addEventListener('click', () => {
    if (voiceChatActive) stopVoiceChat();
    else startVoiceChat();
  });
  renderLocale();
  if (!helpMessages.childElementCount) appendMessage(getBotLocale().intro, 'bot');
  window.addEventListener('irctc-language-change', (event) => {
    const changed = event.detail !== botLanguage;
    botLanguage = event.detail;
    renderLocale();
    if (changed) appendMessage(getBotLocale().changed, 'bot', voiceRepliesEnabled);
  });
}
initHelpBot();

function initPnrCheck() {
  const form = document.getElementById('pnr-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pnr = document.getElementById('pnr-input').value.trim();
    const result = document.getElementById('pnr-result');
    if (!/^\d{10}$/.test(pnr)) {
      result.hidden = false;
      result.innerHTML = '<p class="tip-box">Enter a valid 10-digit PNR number.</p>';
      return;
    }
    result.hidden = false;
    result.innerHTML = `
      <div class="glass-panel pnr-card">
        <span class="status-badge on-time">CONFIRMED</span>
        <h2>PNR ${pnr}</h2>
        <p class="route">MDU S KRANTI EXP • 12652 · New Delhi → MGR Chennai</p>
        <div class="info-grid">
          <div><h3>Date</h3><p>25 Aug 2026</p></div>
          <div><h3>Coach / Berth</h3><p>B3 / 42 (Lower)</p></div>
          <div><h3>Class</h3><p>3A</p></div>
          <div><h3>Chart</h3><p>Not prepared</p></div>
        </div>
        <p class="pnr-passenger">Passenger: Vansh Mayekar, 21, Male — CNF</p>
      </div>
    `;
  });
}
initPnrCheck();

function initPantry() {
  const form = document.getElementById('pantry-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pnr = document.getElementById('pantry-pnr').value.trim();
    const menu = document.getElementById('pantry-menu');
    if (!/^\d{10}$/.test(pnr)) {
      menu.hidden = false;
      menu.innerHTML = '<p class="tip-box">Enter the 10-digit PNR of your current journey to order pantry food.</p>';
      return;
    }
    menu.hidden = false;
    menu.innerHTML = `
      <p class="section-label">Ordering to PNR ${pnr} · Coach B3</p>
      <div class="menu-grid">
        <article class="glass-panel menu-item"><h3>Veg Thali</h3><p>Rice, dal, sabzi, roti</p><strong>₹120</strong><button type="button" class="btn-secondary">ADD</button></article>
        <article class="glass-panel menu-item"><h3>Veg Biryani</h3><p>With raita</p><strong>₹150</strong><button type="button" class="btn-secondary">ADD</button></article>
        <article class="glass-panel menu-item"><h3>Samosa (2 pc)</h3><p>With chutney</p><strong>₹40</strong><button type="button" class="btn-secondary">ADD</button></article>
        <article class="glass-panel menu-item"><h3>Tea / Coffee</h3><p>Hot beverage</p><strong>₹20</strong><button type="button" class="btn-secondary">ADD</button></article>
        <article class="glass-panel menu-item"><h3>Packaged water</h3><p>1 litre</p><strong>₹20</strong><button type="button" class="btn-secondary">ADD</button></article>
        <article class="glass-panel menu-item"><h3>Masala Maggi</h3><p>Hot snack</p><strong>₹50</strong><button type="button" class="btn-secondary">ADD</button></article>
      </div>
    `;
    menu.querySelectorAll('.menu-item button').forEach((button) => {
      button.addEventListener('click', () => {
        button.textContent = 'ADDED';
        button.disabled = true;
      });
    });
  });
}
initPantry();

function initTabs() {
  const tabs = document.querySelectorAll('[data-tab]');
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const name = tab.dataset.tab;
      document.querySelectorAll('[data-tab]').forEach((t) => t.classList.toggle('active', t === tab));
      document.querySelectorAll('[data-tab-panel]').forEach((p) => {
        p.hidden = p.dataset.tabPanel !== name;
      });
    });
  });
}
initTabs();

function initVacancy() {
  const form = document.getElementById('vacancy-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const chart = document.getElementById('vacancy-chart');
    chart.hidden = false;
  });
}
initVacancy();

function initLoyalty() {
  const button = document.getElementById('add-loyalty');
  const message = document.getElementById('loyalty-message');
  if (!button || !message) return;
  button.addEventListener('click', () => {
    message.textContent = 'Demo: your loyalty account would be linked after secure verification.';
  });
}
initLoyalty();

const translations = {
  en: {
    navHome: 'HOME', navTrains: 'TRAINS', navMeals: 'MEALS', navServices: 'OTHER SERVICES', navContact: 'CONTACT US', navLoyalty: 'LOYALTY', navAlerts: 'ALERTS', navEwallet: 'E-WALLET', tickerLOYALTY: 'LOYALTY', tickerALERTS: 'ALERTS', tickerEWALLET: 'E-WALLET', from: 'FROM', to: 'TO', quota: 'QUOTA', concession: 'CONCESSION', searchTrains: 'SEARCH TRAINS', checkPnr: 'CHECK PNR', checkPnrCopy: 'Enter your PNR to see booking status', trainStatus: 'TRAIN STATUS', trainStatusCopy: 'See live running status & platform', trackRefund: 'TRACK A REFUND', refundCopy: 'Follow your refund from start to finish', chartVacancy: 'CHART / VACANCY LIST', vacancyCopy: 'See dummy berth vacancy by class',
    pnrTitle: 'Check PNR status', pnrSubtitle: 'Enter your 10-digit PNR to view your booking and berth status.', pnrLabel: 'PNR number', pnrPlaceholder: 'Enter 10-digit PNR', checkStatus: 'Check status',
    vacancyTitle: 'Chart / vacancy list', vacancySubtitle: 'View a sample vacancy chart by train and travel class.', train: 'Train', journeyDate: 'Journey date', travelClass: 'Class', viewVacancy: 'View vacancy', sampleChart: 'Sample chart', chartNote: 'This is a demonstration chart. Final berth allocation is confirmed only after chart preparation.',
    mealsTitle: 'Meals on your journey', mealsSubtitle: 'Food services for every part of your rail journey.', epantry: 'E-Pantry', epantryCopy: 'Order pantry food while travelling. A valid PNR is required to start an order.', orderFood: 'Order food', ecatering: 'E-Catering', ecateringCopy: 'Explore food delivery options from approved restaurants at your station.', cookedMenu: 'Cooked food menu', menuCopy: 'Menu information is managed by the catering provider and will open externally.', openExternal: 'Open external service', pantrySubtitle: 'Enter the PNR for your current journey to see available food.', viewMenu: 'View menu',
    alertsTitle: 'Alerts & information', alertsSubtitle: 'The latest travel notices and useful railway resources.', alerts: 'Alerts', updates: 'Updates', generalInfo: 'General info', quickLinks: 'Quick links', railwayUpdates: 'Railway updates', contactTitle: 'Contact us', contactSubtitle: 'Choose the contact method that best fits the help you need.', supportCopy: 'Ticket booking, cancellation, refund, account, and payment questions.', loyaltyTitle: 'IRCTC Loyalty', loyaltySubtitle: 'Explore co-brand card benefits and manage your loyalty account.'
  },
  hi: {
    navHome: 'होम', navTrains: 'ट्रेनें', navMeals: 'भोजन', navServices: 'अन्य सेवाएँ', navContact: 'संपर्क करें', navLoyalty: 'लॉयल्टी', navAlerts: 'अलर्ट', navEwallet: 'ई-वॉलेट', tickerLOYALTY: 'लॉयल्टी', tickerALERTS: 'अलर्ट', tickerEWALLET: 'ई-वॉलेट', from: 'प्रस्थान', to: 'गंतव्य', quota: 'कोटा', concession: 'रियायत', searchTrains: 'ट्रेन खोजें', checkPnr: 'पीएनआर जाँचें', checkPnrCopy: 'बुकिंग स्थिति देखने के लिए पीएनआर दर्ज करें', trainStatus: 'ट्रेन स्थिति', trainStatusCopy: 'लाइव चलने की स्थिति और प्लेटफ़ॉर्म देखें', trackRefund: 'रिफंड ट्रैक करें', refundCopy: 'अपने रिफंड को शुरू से अंत तक ट्रैक करें', chartVacancy: 'चार्ट / रिक्ति सूची', vacancyCopy: 'श्रेणी के अनुसार नमूना बर्थ रिक्ति देखें',
    pnrTitle: 'पीएनआर स्थिति देखें', pnrSubtitle: 'अपनी बुकिंग और बर्थ स्थिति देखने के लिए 10 अंकों का पीएनआर दर्ज करें।', pnrLabel: 'पीएनआर नंबर', pnrPlaceholder: '10 अंकों का पीएनआर दर्ज करें', checkStatus: 'स्थिति देखें',
    vacancyTitle: 'चार्ट / रिक्ति सूची', vacancySubtitle: 'ट्रेन और यात्रा श्रेणी के अनुसार नमूना रिक्ति चार्ट देखें।', train: 'ट्रेन', journeyDate: 'यात्रा तिथि', travelClass: 'श्रेणी', viewVacancy: 'रिक्ति देखें', sampleChart: 'नमूना चार्ट', chartNote: 'यह एक प्रदर्शन चार्ट है। अंतिम बर्थ आवंटन चार्ट तैयार होने के बाद ही तय होता है।',
    mealsTitle: 'आपकी यात्रा का भोजन', mealsSubtitle: 'आपकी रेल यात्रा के हर भाग के लिए भोजन सेवाएँ।', epantry: 'ई-पैंट्री', epantryCopy: 'यात्रा के दौरान पैंट्री भोजन ऑर्डर करें। ऑर्डर शुरू करने के लिए वैध पीएनआर आवश्यक है।', orderFood: 'भोजन ऑर्डर करें', ecatering: 'ई-कैटरिंग', ecateringCopy: 'अपने स्टेशन पर स्वीकृत रेस्तराँ से भोजन वितरण विकल्प देखें।', cookedMenu: 'पका हुआ भोजन मेनू', menuCopy: 'मेनू जानकारी कैटरिंग प्रदाता द्वारा नियंत्रित है और बाहरी सेवा में खुलेगी।', openExternal: 'बाहरी सेवा खोलें', pantrySubtitle: 'उपलब्ध भोजन देखने के लिए अपनी मौजूदा यात्रा का पीएनआर दर्ज करें।', viewMenu: 'मेनू देखें',
    alertsTitle: 'अलर्ट और जानकारी', alertsSubtitle: 'नवीनतम यात्रा सूचनाएँ और उपयोगी रेल संसाधन।', alerts: 'अलर्ट', updates: 'अपडेट', generalInfo: 'सामान्य जानकारी', quickLinks: 'त्वरित लिंक', railwayUpdates: 'रेलवे अपडेट', contactTitle: 'संपर्क करें', contactSubtitle: 'अपनी मदद के अनुरूप संपर्क माध्यम चुनें।', supportCopy: 'टिकट बुकिंग, रद्दीकरण, रिफंड, खाता और भुगतान संबंधी प्रश्न।', loyaltyTitle: 'आईआरसीटीसी लॉयल्टी', loyaltySubtitle: 'को-ब्रांड कार्ड लाभों को जानें और अपना लॉयल्टी खाता प्रबंधित करें।'
  },
  kok: {
    navHome: 'मुखेल पान', navTrains: 'गाडयो', navMeals: 'जेवण', navServices: 'हेर सेवा', navContact: 'संपर्क करात', navLoyalty: 'निष्ठा', navAlerts: 'सावधान्यो', navEwallet: 'ई-वॉलेट', tickerLOYALTY: 'निष्ठा', tickerALERTS: 'सावधान्यो', tickerEWALLET: 'ई-वॉलेट', from: 'सावन', to: 'थळ', quota: 'कोटा', concession: 'सवलत', searchTrains: 'गाडयो सोदात', checkPnr: 'पीएनआर तपासात', checkPnrCopy: 'बुकिंग स्थिती पळोवपाक पीएनआर घालात', trainStatus: 'गाडी स्थिती', trainStatusCopy: 'लायव्ह धांवप स्थिती आनी प्लॅटफॉर्म पळयात', trackRefund: 'रिफंड मागोवा घ्यांत', refundCopy: 'तुमच्या रिफंडाचो सुरवात ते शेवट मागोवा घ्यांत', chartVacancy: 'चार्ट / रितेपण वळेरी', vacancyCopy: 'वर्ग प्रमाणें नमुनो बर्थ रितेपण पळयात',
    pnrTitle: 'पीएनआर स्थिती तपासात', pnrSubtitle: 'तुमची बुकिंग आनी बर्थ स्थिती पळोवपाक 10 अंकी पीएनआर घालात.', pnrLabel: 'पीएनआर क्रमांक', pnrPlaceholder: '10 अंकी पीएनआर घालात', checkStatus: 'स्थिती तपासात',
    vacancyTitle: 'चार्ट / रितेपणाची वळेरी', vacancySubtitle: 'गाडी आनी वर्ग प्रमाणें नमुनो रितेपणाचो चार्ट पळयात.', train: 'गाडी', journeyDate: 'प्रवास तारीख', travelClass: 'वर्ग', viewVacancy: 'रितेपण पळयात', sampleChart: 'नमुनो चार्ट', chartNote: 'हो प्रदर्शना खातीर चार्ट आसा. निमाणें बर्थ वाटप चार्ट तयार जाल्यारच थारतले.',
    mealsTitle: 'तुमच्या प्रवासांतलें जेवण', mealsSubtitle: 'तुमच्या रेल प्रवासाच्या दर भागाखातीर जेवण सेवा.', epantry: 'ई-पँट्री', epantryCopy: 'प्रवास वेळार पँट्रीचे जेवण मागात. मागणी सुरू करपाक वैध पीएनआर जाय.', orderFood: 'जेवण मागात', ecatering: 'ई-कॅटरिंग', ecateringCopy: 'तुमच्या स्टेशनावेल्या मान्यताप्राप्त उपहारगृहांची जेवण सेवा पळयात.', cookedMenu: 'शिजोवपाचो मेन्यू', menuCopy: 'मेन्यू म्हायती बाहेरच्या कॅटरिंग प्रदात्याकडेन आसा.', openExternal: 'बाहेरची सेवा उगडात', pantrySubtitle: 'उपलब्ध जेवण पळोवपाक चालू प्रवासाचो पीएनआर घालात.', viewMenu: 'मेन्यू पळयात',
    alertsTitle: 'सावधान्यो आनी म्हायती', alertsSubtitle: 'नवीन प्रवास सूचना आनी उपेगी रेल संसाधनां.', alerts: 'सावधान्यो', updates: 'अद्ययावत', generalInfo: 'सामान्य म्हायती', quickLinks: 'झडपे जोड', railwayUpdates: 'रेलवे अद्ययावत', contactTitle: 'संपर्क करात', contactSubtitle: 'तुमच्या मदतीक बरोबर संपर्क माध्यम वेंचात.', supportCopy: 'तिकीट बुकिंग, रद्द करप, रिफंड, खातें आनी पेमेंट प्रश्न.', loyaltyTitle: 'आईआरसीटीसी निष्ठा', loyaltySubtitle: 'को-ब्रँड कार्ड फायदे पळयात आनी निष्ठा खातें सांबाळात.'
  },
  ur: {
    navHome: 'ہوم', navTrains: 'ٹرینیں', navMeals: 'کھانا', navServices: 'دیگر خدمات', navContact: 'رابطہ', navLoyalty: 'لائلٹی', navAlerts: 'الرٹس', navEwallet: 'ای والیٹ', tickerLOYALTY: 'لائلٹی', tickerALERTS: 'الرٹس', tickerEWALLET: 'ای والیٹ', from: 'روانگی', to: 'منزل', quota: 'کوٹہ', concession: 'رعایت', searchTrains: 'ٹرین تلاش کریں', checkPnr: 'پی این آر چیک کریں', checkPnrCopy: 'بکنگ اسٹیٹس دیکھنے کے لیے پی این آر درج کریں', trainStatus: 'ٹرین اسٹیٹس', trainStatusCopy: 'لائیو چلنے کی کیفیت اور پلیٹ فارم دیکھیں', trackRefund: 'ریفنڈ ٹریک کریں', refundCopy: 'اپنے ریفنڈ کو شروع سے آخر تک ٹریک کریں', chartVacancy: 'چارٹ / خالی جگہوں کی فہرست', vacancyCopy: 'کلاس کے لحاظ سے نمونہ برتھ کی خالی جگہ دیکھیں',
    pnrTitle: 'پی این آر اسٹیٹس چیک کریں', pnrSubtitle: 'اپنی بکنگ اور برتھ کی کیفیت دیکھنے کے لیے 10 ہندسوں کا پی این آر درج کریں۔', pnrLabel: 'پی این آر نمبر', pnrPlaceholder: '10 ہندسوں کا پی این آر درج کریں', checkStatus: 'اسٹیٹس چیک کریں',
    vacancyTitle: 'چارٹ / خالی جگہوں کی فہرست', vacancySubtitle: 'ٹرین اور کلاس کے لحاظ سے نمونہ خالی جگہوں کا چارٹ دیکھیں۔', train: 'ٹرین', journeyDate: 'سفر کی تاریخ', travelClass: 'کلاس', viewVacancy: 'خالی جگہ دیکھیں', sampleChart: 'نمونہ چارٹ', chartNote: 'یہ نمائشی چارٹ ہے۔ آخری برتھ مختص ہونا چارٹ تیار ہونے کے بعد ہی طے ہوتا ہے۔',
    mealsTitle: 'آپ کے سفر کا کھانا', mealsSubtitle: 'آپ کے ریل سفر کے ہر حصے کے لیے کھانے کی خدمات۔', epantry: 'ای پینٹری', epantryCopy: 'سفر کے دوران پینٹری کا کھانا آرڈر کریں۔ آرڈر کے لیے درست پی این آر ضروری ہے۔', orderFood: 'کھانا آرڈر کریں', ecatering: 'ای کیٹرنگ', ecateringCopy: 'اپنے اسٹیشن پر منظور شدہ ریستورانوں سے کھانے کے آپشن دیکھیں۔', cookedMenu: 'پکا ہوا کھانا مینو', menuCopy: 'مینو کی معلومات کیٹرنگ فراہم کنندہ کے زیر انتظام ہے اور بیرونی سروس میں کھلے گی۔', openExternal: 'بیرونی سروس کھولیں', pantrySubtitle: 'دستیاب کھانا دیکھنے کے لیے موجودہ سفر کا پی این آر درج کریں۔', viewMenu: 'مینو دیکھیں',
    alertsTitle: 'الرٹس اور معلومات', alertsSubtitle: 'تازہ سفری نوٹس اور مفید ریلوے وسائل۔', alerts: 'الرٹس', updates: 'اپ ڈیٹس', generalInfo: 'عام معلومات', quickLinks: 'فوری لنکس', railwayUpdates: 'ریلوے اپ ڈیٹس', contactTitle: 'رابطہ کریں', contactSubtitle: 'اپنی ضرورت کے مطابق رابطے کا طریقہ منتخب کریں۔', supportCopy: 'ٹکٹ بکنگ، منسوخی، ریفنڈ، اکاؤنٹ اور ادائیگی کے سوالات۔', loyaltyTitle: 'آئی آر سی ٹی سی لائلٹی', loyaltySubtitle: 'کو-برانڈ کارڈ کے فائدے دیکھیں اور اپنا لائلٹی اکاؤنٹ سنبھالیں۔'
  }
};

function applyLanguage(language = localStorage.getItem('irctc-language') || 'en') {
  const dictionary = translations[language] || translations.en;
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const text = dictionary[node.dataset.i18n];
    if (text) node.textContent = text;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    const text = dictionary[node.dataset.i18nPlaceholder];
    if (text) node.placeholder = text;
  });
}
applyLanguage();
window.addEventListener('irctc-language-change', (event) => applyLanguage(event.detail));
