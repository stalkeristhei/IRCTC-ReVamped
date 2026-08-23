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

const botReplies = [
  'I can help with PNR status, refunds, and train delays. What do you need?',
  'For PNR checks, use Home → Check PNR, or share your 10-digit PNR here.',
  'Refunds usually take 5–7 working days. Track them under Track a Refund.',
  'If your train is delayed, live status updates appear on the Train Status page.',
  'For cancellation rules, visit Refund Tracker → View Refund Rules.',
  'I\'m a demo assistant — full AI support is coming soon. Try PNR, refund, or delay.',
];
let replyIndex = 0;

function appendMessage(text, role) {
  const helpMessages = document.getElementById('help-messages');
  if (!helpMessages) return;
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = role === 'bot'
    ? `<span class="chat-avatar">AI</span><div class="chat-bubble">${text}</div>`
    : `<div class="chat-bubble">${text}</div><span class="chat-avatar user">VM</span>`;
  helpMessages.appendChild(div);
  helpMessages.scrollTop = helpMessages.scrollHeight;
}

function initHelpBot() {
  const helpForm = document.getElementById('help-form');
  const helpMessages = document.getElementById('help-messages');
  if (!helpForm || !helpMessages) return;
  if (helpMessages.childElementCount) return;
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
    navHome: 'HOME', navTrains: 'TRAINS', navMeals: 'MEALS', navServices: 'OTHER SERVICES', navContact: 'CONTACT US', tickerLOYALTY: 'LOYALTY', tickerALERTS: 'ALERTS', tickerEWALLET: 'E-WALLET', from: 'FROM', to: 'TO', quota: 'QUOTA', concession: 'CONCESSION', searchTrains: 'SEARCH TRAINS', checkPnr: 'CHECK PNR', checkPnrCopy: 'Enter your PNR to see booking status', trainStatus: 'TRAIN STATUS', trainStatusCopy: 'See live running status & platform', trackRefund: 'TRACK A REFUND', refundCopy: 'Follow your refund from start to finish', chartVacancy: 'CHART / VACANCY LIST', vacancyCopy: 'See dummy berth vacancy by class',
    pnrTitle: 'Check PNR status', pnrSubtitle: 'Enter your 10-digit PNR to view your booking and berth status.', pnrLabel: 'PNR number', pnrPlaceholder: 'Enter 10-digit PNR', checkStatus: 'Check status',
    vacancyTitle: 'Chart / vacancy list', vacancySubtitle: 'View a sample vacancy chart by train and travel class.', train: 'Train', journeyDate: 'Journey date', travelClass: 'Class', viewVacancy: 'View vacancy', sampleChart: 'Sample chart', chartNote: 'This is a demonstration chart. Final berth allocation is confirmed only after chart preparation.',
    mealsTitle: 'Meals on your journey', mealsSubtitle: 'Food services for every part of your rail journey.', epantry: 'E-Pantry', epantryCopy: 'Order pantry food while travelling. A valid PNR is required to start an order.', orderFood: 'Order food', ecatering: 'E-Catering', ecateringCopy: 'Explore food delivery options from approved restaurants at your station.', cookedMenu: 'Cooked food menu', menuCopy: 'Menu information is managed by the catering provider and will open externally.', openExternal: 'Open external service', pantrySubtitle: 'Enter the PNR for your current journey to see available food.', viewMenu: 'View menu',
    alertsTitle: 'Alerts & information', alertsSubtitle: 'The latest travel notices and useful railway resources.', alerts: 'Alerts', updates: 'Updates', generalInfo: 'General info', quickLinks: 'Quick links', railwayUpdates: 'Railway updates', contactTitle: 'Contact us', contactSubtitle: 'Choose the contact method that best fits the help you need.', supportCopy: 'Ticket booking, cancellation, refund, account, and payment questions.', loyaltyTitle: 'IRCTC Loyalty', loyaltySubtitle: 'Explore co-brand card benefits and manage your loyalty account.'
  },
  hi: {
    navHome: 'होम', navTrains: 'ट्रेनें', navMeals: 'भोजन', navServices: 'अन्य सेवाएँ', navContact: 'संपर्क करें', tickerLOYALTY: 'लॉयल्टी', tickerALERTS: 'अलर्ट', tickerEWALLET: 'ई-वॉलेट', from: 'प्रस्थान', to: 'गंतव्य', quota: 'कोटा', concession: 'रियायत', searchTrains: 'ट्रेन खोजें', checkPnr: 'पीएनआर जाँचें', checkPnrCopy: 'बुकिंग स्थिति देखने के लिए पीएनआर दर्ज करें', trainStatus: 'ट्रेन स्थिति', trainStatusCopy: 'लाइव चलने की स्थिति और प्लेटफ़ॉर्म देखें', trackRefund: 'रिफंड ट्रैक करें', refundCopy: 'अपने रिफंड को शुरू से अंत तक ट्रैक करें', chartVacancy: 'चार्ट / रिक्ति सूची', vacancyCopy: 'श्रेणी के अनुसार नमूना बर्थ रिक्ति देखें',
    pnrTitle: 'पीएनआर स्थिति देखें', pnrSubtitle: 'अपनी बुकिंग और बर्थ स्थिति देखने के लिए 10 अंकों का पीएनआर दर्ज करें।', pnrLabel: 'पीएनआर नंबर', pnrPlaceholder: '10 अंकों का पीएनआर दर्ज करें', checkStatus: 'स्थिति देखें',
    vacancyTitle: 'चार्ट / रिक्ति सूची', vacancySubtitle: 'ट्रेन और यात्रा श्रेणी के अनुसार नमूना रिक्ति चार्ट देखें।', train: 'ट्रेन', journeyDate: 'यात्रा तिथि', travelClass: 'श्रेणी', viewVacancy: 'रिक्ति देखें', sampleChart: 'नमूना चार्ट', chartNote: 'यह एक प्रदर्शन चार्ट है। अंतिम बर्थ आवंटन चार्ट तैयार होने के बाद ही तय होता है।',
    mealsTitle: 'आपकी यात्रा का भोजन', mealsSubtitle: 'आपकी रेल यात्रा के हर भाग के लिए भोजन सेवाएँ।', epantry: 'ई-पैंट्री', epantryCopy: 'यात्रा के दौरान पैंट्री भोजन ऑर्डर करें। ऑर्डर शुरू करने के लिए वैध पीएनआर आवश्यक है।', orderFood: 'भोजन ऑर्डर करें', ecatering: 'ई-कैटरिंग', ecateringCopy: 'अपने स्टेशन पर स्वीकृत रेस्तराँ से भोजन वितरण विकल्प देखें।', cookedMenu: 'पका हुआ भोजन मेनू', menuCopy: 'मेनू जानकारी कैटरिंग प्रदाता द्वारा नियंत्रित है और बाहरी सेवा में खुलेगी।', openExternal: 'बाहरी सेवा खोलें', pantrySubtitle: 'उपलब्ध भोजन देखने के लिए अपनी मौजूदा यात्रा का पीएनआर दर्ज करें।', viewMenu: 'मेनू देखें',
    alertsTitle: 'अलर्ट और जानकारी', alertsSubtitle: 'नवीनतम यात्रा सूचनाएँ और उपयोगी रेल संसाधन।', alerts: 'अलर्ट', updates: 'अपडेट', generalInfo: 'सामान्य जानकारी', quickLinks: 'त्वरित लिंक', railwayUpdates: 'रेलवे अपडेट', contactTitle: 'संपर्क करें', contactSubtitle: 'अपनी मदद के अनुरूप संपर्क माध्यम चुनें।', supportCopy: 'टिकट बुकिंग, रद्दीकरण, रिफंड, खाता और भुगतान संबंधी प्रश्न।', loyaltyTitle: 'आईआरसीटीसी लॉयल्टी', loyaltySubtitle: 'को-ब्रांड कार्ड लाभों को जानें और अपना लॉयल्टी खाता प्रबंधित करें।'
  },
  kok: {
    navHome: 'मुखेल पान', navTrains: 'गाडयो', navMeals: 'जेवण', navServices: 'हेर सेवा', navContact: 'संपर्क करात', tickerLOYALTY: 'निष्ठा', tickerALERTS: 'सावधान्यो', tickerEWALLET: 'ई-वॉलेट', from: 'सावन', to: 'थळ', quota: 'कोटा', concession: 'सवलत', searchTrains: 'गाडयो सोदात', checkPnr: 'पीएनआर तपासात', checkPnrCopy: 'बुकिंग स्थिती पळोवपाक पीएनआर घालात', trainStatus: 'गाडी स्थिती', trainStatusCopy: 'लायव्ह धांवप स्थिती आनी प्लॅटफॉर्म पळयात', trackRefund: 'रिफंड मागोवा घ्यांत', refundCopy: 'तुमच्या रिफंडाचो सुरवात ते शेवट मागोवा घ्यांत', chartVacancy: 'चार्ट / रितेपण वळेरी', vacancyCopy: 'वर्ग प्रमाणें नमुनो बर्थ रितेपण पळयात',
    pnrTitle: 'पीएनआर स्थिती तपासात', pnrSubtitle: 'तुमची बुकिंग आनी बर्थ स्थिती पळोवपाक 10 अंकी पीएनआर घालात.', pnrLabel: 'पीएनआर क्रमांक', pnrPlaceholder: '10 अंकी पीएनआर घालात', checkStatus: 'स्थिती तपासात',
    vacancyTitle: 'चार्ट / रितेपणाची वळेरी', vacancySubtitle: 'गाडी आनी वर्ग प्रमाणें नमुनो रितेपणाचो चार्ट पळयात.', train: 'गाडी', journeyDate: 'प्रवास तारीख', travelClass: 'वर्ग', viewVacancy: 'रितेपण पळयात', sampleChart: 'नमुनो चार्ट', chartNote: 'हो प्रदर्शना खातीर चार्ट आसा. निमाणें बर्थ वाटप चार्ट तयार जाल्यारच थारतले.',
    mealsTitle: 'तुमच्या प्रवासांतलें जेवण', mealsSubtitle: 'तुमच्या रेल प्रवासाच्या दर भागाखातीर जेवण सेवा.', epantry: 'ई-पँट्री', epantryCopy: 'प्रवास वेळार पँट्रीचे जेवण मागात. मागणी सुरू करपाक वैध पीएनआर जाय.', orderFood: 'जेवण मागात', ecatering: 'ई-कॅटरिंग', ecateringCopy: 'तुमच्या स्टेशनावेल्या मान्यताप्राप्त उपहारगृहांची जेवण सेवा पळयात.', cookedMenu: 'शिजोवपाचो मेन्यू', menuCopy: 'मेन्यू म्हायती बाहेरच्या कॅटरिंग प्रदात्याकडेन आसा.', openExternal: 'बाहेरची सेवा उगडात', pantrySubtitle: 'उपलब्ध जेवण पळोवपाक चालू प्रवासाचो पीएनआर घालात.', viewMenu: 'मेन्यू पळयात',
    alertsTitle: 'सावधान्यो आनी म्हायती', alertsSubtitle: 'नवीन प्रवास सूचना आनी उपेगी रेल संसाधनां.', alerts: 'सावधान्यो', updates: 'अद्ययावत', generalInfo: 'सामान्य म्हायती', quickLinks: 'झडपे जोड', railwayUpdates: 'रेलवे अद्ययावत', contactTitle: 'संपर्क करात', contactSubtitle: 'तुमच्या मदतीक बरोबर संपर्क माध्यम वेंचात.', supportCopy: 'तिकीट बुकिंग, रद्द करप, रिफंड, खातें आनी पेमेंट प्रश्न.', loyaltyTitle: 'आईआरसीटीसी निष्ठा', loyaltySubtitle: 'को-ब्रँड कार्ड फायदे पळयात आनी निष्ठा खातें सांबाळात.'
  },
  ur: {
    navHome: 'ہوم', navTrains: 'ٹرینیں', navMeals: 'کھانا', navServices: 'دیگر خدمات', navContact: 'رابطہ', tickerLOYALTY: 'لائلٹی', tickerALERTS: 'الرٹس', tickerEWALLET: 'ای والیٹ', from: 'روانگی', to: 'منزل', quota: 'کوٹہ', concession: 'رعایت', searchTrains: 'ٹرین تلاش کریں', checkPnr: 'پی این آر چیک کریں', checkPnrCopy: 'بکنگ اسٹیٹس دیکھنے کے لیے پی این آر درج کریں', trainStatus: 'ٹرین اسٹیٹس', trainStatusCopy: 'لائیو چلنے کی کیفیت اور پلیٹ فارم دیکھیں', trackRefund: 'ریفنڈ ٹریک کریں', refundCopy: 'اپنے ریفنڈ کو شروع سے آخر تک ٹریک کریں', chartVacancy: 'چارٹ / خالی جگہوں کی فہرست', vacancyCopy: 'کلاس کے لحاظ سے نمونہ برتھ کی خالی جگہ دیکھیں',
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
