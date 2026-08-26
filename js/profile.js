(function () {
  const sessionKey = 'irctc-auth-session';

  function getSession() {
    try { return JSON.parse(localStorage.getItem(sessionKey)); } catch (error) { return null; }
  }

  const session = getSession();
  if (!session || session.role !== 'user') {
    window.location.replace('index.html');
    return;
  }
  const profileKey = `irctc-user-profile:${(session.email || session.name).toLowerCase()}`;

  const form = document.getElementById('profile-form');
  const message = document.getElementById('profile-form-message');
  const nationality = document.getElementById('nationality');
  const documentType = document.getElementById('identity-document');
  const documentNumber = document.getElementById('identity-number');
  const documentLabel = document.getElementById('document-label');
  const numberLabel = document.getElementById('identity-number-label');
  const identityFields = document.getElementById('identity-fields');
  const verificationControls = document.getElementById('verification-controls');
  const verificationButton = document.getElementById('verify-document');
  const verificationHelp = document.getElementById('verification-help');
  const verificationBadge = document.getElementById('verification-badge');
  const verificationCopy = document.getElementById('verification-copy');
  const avatar = document.getElementById('profile-avatar');
  const photoInput = document.getElementById('profile-photo');
  const removePhoto = document.getElementById('remove-profile-photo');
  let documentVerified = false;
  let verificationStep = 'start';

  const documents = {
    india: [
      { value: 'aadhaar', label: 'Aadhaar card', placeholder: '12-digit Aadhaar number', pattern: '[0-9]{12}', title: 'Enter a 12-digit Aadhaar number.' },
      { value: 'pan', label: 'PAN card', placeholder: 'ABCDE1234F', pattern: '[A-Za-z]{5}[0-9]{4}[A-Za-z]', title: 'Enter a valid PAN format, for example ABCDE1234F.' },
    ],
    foreign: [
      { value: 'passport', label: 'Passport', placeholder: 'Passport number', pattern: '[A-Za-z0-9]{6,12}', title: 'Enter a valid passport number.' },
    ],
  };

  const demoDocuments = {
    aadhaar: {
      nationality: 'india', documentType: 'aadhaar', documentNumber: '999900001234',
      fullName: 'Aarav Sharma', dateOfBirth: '1998-04-18', gender: 'Male', mobile: '9876543210',
      address: '42 Railway Colony, Shivaji Nagar, Pune, Maharashtra 411005',
    },
    pan: {
      nationality: 'india', documentType: 'pan', documentNumber: 'DEMOX1234P',
      fullName: 'Meera Iyer', dateOfBirth: '1995-11-09', gender: 'Female', mobile: '9822012345',
      address: '18 Lake View Road, Indiranagar, Bengaluru, Karnataka 560038',
    },
    passport: {
      nationality: 'foreign', documentType: 'passport', documentNumber: 'PDEMO7821',
      fullName: 'Sofia Martin', dateOfBirth: '1993-06-22', gender: 'Female', mobile: '+33 6 12 34 56 78',
      address: '12 Rue des Fleurs, 75008 Paris, France',
    },
  };

  const resettableDemoProfiles = {
    'public@irctc.test': {
      fullName: 'Aarav Sharma', dateOfBirth: '1998-04-18', gender: 'Male', email: 'public@irctc.test', mobile: '9876543210',
      address: '42 Railway Colony, Shivaji Nagar, Pune, Maharashtra 411005', nationality: 'india', documentType: 'aadhaar',
      documentLabel: 'Aadhaar card', documentMasked: '••••••••1234', documentVerified: true, completed: true, avatar: '',
    },
    'judges@irctc.test': {
      fullName: 'Meera Iyer', dateOfBirth: '1995-11-09', gender: 'Female', email: 'judges@irctc.test', mobile: '9822012345',
      address: '18 Lake View Road, Indiranagar, Bengaluru, Karnataka 560038', nationality: 'india', documentType: 'pan',
      documentLabel: 'PAN card', documentMasked: '••••••1234P', documentVerified: true, completed: true, avatar: '',
    },
  };

  const profileTranslations = {
    en: {
      profile: 'PROFILE', memberSince: 'Member since', addPhoto: 'ADD PROFILE PHOTO', removePhoto: 'REMOVE PHOTO', editProfile: 'EDIT PROFILE', security: 'SECURITY', requiredToBook: 'REQUIRED TO BOOK', personalInformation: 'Personal information', requiredFields: 'Required fields', profileIntro: 'Start with an identity option below to prefill your details, then review and edit anything you need.', fullName: 'Full name', dateOfBirth: 'Date of birth', gender: 'Gender', selectGender: 'Select gender', female: 'Female', male: 'Male', nonBinary: 'Non-binary', preferNot: 'Prefer not to say', verifiedEmail: 'Verified email', mobileNumber: 'Mobile number', nationality: 'Nationality / residence', selectOption: 'Select an option', indianCitizen: 'Indian citizen', foreignNational: 'Foreign national', address: 'Address', firstStep: 'FIRST STEP', identityVerification: 'Identity verification', tryDemoDocument: 'Try a demo identity document', demoAadhaar: 'Demo Aadhaar card', demoPan: 'Demo PAN card', demoPassport: 'Demo passport', demoDocumentNote: 'Training samples only — these are fictional records and not valid identity documents.', verifyDocument: 'VERIFY DOCUMENT', verificationDisclaimer: 'Demo verification only: a production service must verify documents securely with the appropriate issuing authority. Do not use this prototype to submit real identity information.', saveDetails: 'SAVE REQUIRED DETAILS', travelInformation: 'Travel information', savedPassengers: 'Saved passengers', preferences: 'Preferred class and berth', favourites: 'Favourite routes and stations', myJourneys: 'My journeys', upcomingTrips: 'Upcoming trips', previousTrips: 'Previous trips', cancelledTrips: 'Cancelled and saved trips', loyalty: 'Loyalty', pointsTier: 'Points and current tier', rewards: 'Rewards', pointsHistory: 'Points history', paymentsRefunds: 'Payments & refunds', savedPayments: 'Saved payment methods', transactions: 'Transaction history', refundStatus: 'Refund status', changePassword: 'Change password', twoFactor: 'Two-factor authentication / OTP', sessions: 'Active sessions and login history', devices: 'Trusted devices', notifications: 'Notifications', push: 'Push notifications', travelAlerts: 'Travel alerts', prefilled: 'Demo document details loaded. You can edit any personal field before saving.', notVerified: 'NOT VERIFIED', verified: 'VERIFIED ✓', verify: 'VERIFY DOCUMENT', confirmOtp: 'CONFIRM OTP', verifiedDocument: 'DOCUMENT VERIFIED', verificationStart: 'A one-time passcode confirmation is required to finish verification.', verificationOtp: 'Demo OTP sent. Select CONFIRM OTP to complete document verification.', verificationDone: 'verified for this demo session.', indiaCopy: 'Indian citizens must verify with either an Aadhaar card or PAN card.', foreignCopy: 'Foreign nationals must verify with a passport.', chooseCopy: 'Choose a verification option first. It can prefill your personal details, which remain editable.', document: 'Identity document', documentNumber: 'Document number', selectDocument: 'Select document', selectDocumentFirst: 'Select a document first',
    },
    hi: {
      profile: 'प्रोफ़ाइल', memberSince: 'सदस्यता की तारीख', addPhoto: 'प्रोफ़ाइल फ़ोटो जोड़ें', removePhoto: 'फ़ोटो हटाएँ', editProfile: 'प्रोफ़ाइल संपादित करें', security: 'सुरक्षा', requiredToBook: 'बुकिंग के लिए आवश्यक', personalInformation: 'व्यक्तिगत जानकारी', requiredFields: 'आवश्यक फ़ील्ड', profileIntro: 'पहले पहचान विकल्प चुनें। विवरण भरने के बाद आप किसी भी जानकारी को संपादित कर सकते हैं।', fullName: 'पूरा नाम', dateOfBirth: 'जन्म तिथि', gender: 'लिंग', selectGender: 'लिंग चुनें', female: 'महिला', male: 'पुरुष', nonBinary: 'नॉन-बाइनरी', preferNot: 'बताना नहीं चाहते', verifiedEmail: 'सत्यापित ईमेल', mobileNumber: 'मोबाइल नंबर', nationality: 'राष्ट्रीयता / निवास', selectOption: 'एक विकल्प चुनें', indianCitizen: 'भारतीय नागरिक', foreignNational: 'विदेशी नागरिक', address: 'पता', firstStep: 'पहला चरण', identityVerification: 'पहचान सत्यापन', tryDemoDocument: 'डेमो पहचान दस्तावेज़ आज़माएँ', demoAadhaar: 'डेमो आधार कार्ड', demoPan: 'डेमो पैन कार्ड', demoPassport: 'डेमो पासपोर्ट', demoDocumentNote: 'केवल प्रशिक्षण नमूने — ये काल्पनिक रिकॉर्ड हैं और मान्य पहचान दस्तावेज़ नहीं हैं।', verifyDocument: 'दस्तावेज़ सत्यापित करें', saveDetails: 'आवश्यक विवरण सहेजें', travelInformation: 'यात्रा जानकारी', savedPassengers: 'सहेजे गए यात्री', preferences: 'पसंदीदा क्लास और बर्थ', favourites: 'पसंदीदा मार्ग और स्टेशन', myJourneys: 'मेरी यात्राएँ', upcomingTrips: 'आगामी यात्राएँ', previousTrips: 'पिछली यात्राएँ', cancelledTrips: 'रद्द और सहेजी गई यात्राएँ', loyalty: 'लॉयल्टी', rewards: 'पुरस्कार', paymentsRefunds: 'भुगतान और रिफंड', security: 'सुरक्षा', notifications: 'सूचनाएँ', push: 'पुश सूचनाएँ', travelAlerts: 'यात्रा अलर्ट', prefilled: 'डेमो दस्तावेज़ का विवरण भर दिया गया है। सहेजने से पहले आप इसे संपादित कर सकते हैं。', notVerified: 'सत्यापित नहीं', verified: 'सत्यापित ✓', verify: 'दस्तावेज़ सत्यापित करें', confirmOtp: 'ओटीपी की पुष्टि करें', verifiedDocument: 'दस्तावेज़ सत्यापित', verificationStart: 'सत्यापन पूरा करने के लिए एक बार का पासकोड आवश्यक है।', verificationOtp: 'डेमो ओटीपी भेजा गया। सत्यापन पूरा करने के लिए ओटीपी की पुष्टि करें।', verificationDone: 'इस डेमो सत्र के लिए सत्यापित है।', indiaCopy: 'भारतीय नागरिकों को आधार कार्ड या पैन कार्ड से सत्यापित करना होगा।', foreignCopy: 'विदेशी नागरिकों को पासपोर्ट से सत्यापित करना होगा।', chooseCopy: 'पहले एक सत्यापन विकल्प चुनें। यह आपके विवरण भर सकता है, जिन्हें आप संपादित कर सकते हैं।', document: 'पहचान दस्तावेज़', documentNumber: 'दस्तावेज़ नंबर', selectDocument: 'दस्तावेज़ चुनें', selectDocumentFirst: 'पहले दस्तावेज़ चुनें',
    },
    kok: { profile: 'प्रोफायल', memberSince: 'सदस्य जाल्याची तारीख', addPhoto: 'प्रोफायल फोटो जोडात', removePhoto: 'फोटो काडात', editProfile: 'प्रोफायल बदलात', security: 'सुरक्षा', requiredToBook: 'बुकिंग खातीर गरजेचें', personalInformation: 'वैयक्तिक म्हायती', requiredFields: 'गरजेचीं फील्डां', profileIntro: 'पयलीं ओळख पर्याय वेंचात. तपशील भरल्या उपरांत तुमी ती बदलूंक शकतात.', fullName: 'पुराय नांव', dateOfBirth: 'जल्म तारीख', gender: 'लिंग', mobileNumber: 'मोबायल क्रमांक', nationality: 'राष्ट्रीयताय / रावप', indianCitizen: 'भारतीय नागरीक', foreignNational: 'परदेशी नागरीक', address: 'पत्तो', firstStep: 'पयलें पावल', identityVerification: 'ओळख पडताळणी', tryDemoDocument: 'डेमो ओळख दस्तावेज वापरात', demoAadhaar: 'डेमो आधार कार्ड', demoPan: 'डेमो पॅन कार्ड', demoPassport: 'डेमो पासपोर्ट', demoDocumentNote: 'फकत प्रशिक्षण नमुने — ह्यो काल्पनीक नोंद्यो आसात.', verifyDocument: 'दस्तावेज पडताळात', saveDetails: 'गरजेचे तपशील जतन करात', travelInformation: 'प्रवास म्हायती', myJourneys: 'म्हजे प्रवास', loyalty: 'लॉयल्टी', paymentsRefunds: 'पेमेंट आनी रिफंड', notifications: 'सुचोवण्यो' },
    ur: { profile: 'پروفائل', memberSince: 'رکنیت کی تاریخ', addPhoto: 'پروفائل تصویر شامل کریں', removePhoto: 'تصویر ہٹائیں', editProfile: 'پروفائل میں ترمیم', security: 'سیکیورٹی', requiredToBook: 'بکنگ کے لیے ضروری', personalInformation: 'ذاتی معلومات', requiredFields: 'ضروری خانے', profileIntro: 'پہلے شناخت کا انتخاب کریں۔ تفصیلات بھرنے کے بعد آپ انہیں تبدیل کر سکتے ہیں۔', fullName: 'پورا نام', dateOfBirth: 'تاریخ پیدائش', gender: 'جنس', mobileNumber: 'موبائل نمبر', nationality: 'قومیت / رہائش', indianCitizen: 'بھارتی شہری', foreignNational: 'غیر ملکی شہری', address: 'پتہ', firstStep: 'پہلا مرحلہ', identityVerification: 'شناخت کی تصدیق', tryDemoDocument: 'ڈیمو شناختی دستاویز آزمائیں', demoAadhaar: 'ڈیمو آدھار کارڈ', demoPan: 'ڈیمو پین کارڈ', demoPassport: 'ڈیمو پاسپورٹ', demoDocumentNote: 'صرف تربیتی نمونے — یہ فرضی ریکارڈ ہیں۔', verifyDocument: 'دستاویز کی تصدیق', saveDetails: 'ضروری تفصیلات محفوظ کریں', travelInformation: 'سفر کی معلومات', myJourneys: 'میرے سفر', loyalty: 'لائلٹی', paymentsRefunds: 'ادائیگیاں اور واپسی', notifications: 'اطلاعات' },
  };

  function readProfile() {
    try { return JSON.parse(localStorage.getItem(profileKey)) || {}; } catch (error) { return {}; }
  }

  function restoreResettableDemoProfile() {
    const accountEmail = (session.email || '').toLowerCase();
    const defaultProfile = resettableDemoProfiles[accountEmail];
    if (!defaultProfile) return;
    localStorage.setItem(profileKey, JSON.stringify({ ...defaultProfile, memberSince: session.memberSince || new Date().toISOString() }));
  }

  function initials(value) {
    return (value || 'IR').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  function safeAvatar(value) {
    return typeof value === 'string' && value.startsWith('data:image/') ? value : '';
  }

  function updateAvatar(value, name) {
    const photo = safeAvatar(value);
    avatar.textContent = photo ? '' : initials(name);
    avatar.classList.toggle('has-photo', Boolean(photo));
    avatar.style.backgroundImage = photo ? `url('${photo}')` : '';
    removePhoto.hidden = !photo;
  }

  function formatMemberSince(value) {
    const date = value ? new Date(value) : new Date();
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }

  function memberSinceValue(profile) {
    return session.email === 'demo@irctc.test' ? new Date().toISOString() : (session.memberSince || profile?.memberSince || new Date().toISOString());
  }

  function t(key) {
    const language = localStorage.getItem('irctc-language') || 'en';
    return profileTranslations[language]?.[key] || profileTranslations.en[key] || key;
  }

  function applyProfileLanguage() {
    document.documentElement.lang = localStorage.getItem('irctc-language') || 'en';
    document.querySelectorAll('[data-profile-i18n]').forEach((node) => {
      const translated = t(node.dataset.profileI18n);
      if (translated) node.textContent = translated;
    });
    document.getElementById('member-since').textContent = formatMemberSince(memberSinceValue(readProfile()));
    setVerificationState(documentVerified);
    if (!documentType.value) {
      verificationCopy.textContent = t('chooseCopy');
      verificationButton.textContent = t('verify');
      verificationHelp.textContent = t('verificationStart');
    }
  }

  function applyDemoDocument(key) {
    const demo = demoDocuments[key];
    if (!demo) return;
    nationality.value = demo.nationality;
    configureDocumentOptions();
    documentType.value = demo.documentType;
    configureDocumentNumber();
    documentNumber.value = demo.documentNumber;
    form.elements.fullName.value = demo.fullName;
    form.elements.dateOfBirth.value = demo.dateOfBirth;
    form.elements.gender.value = demo.gender;
    form.elements.mobile.value = demo.mobile;
    form.elements.address.value = demo.address;
    documentVerified = false;
    verificationStep = 'start';
    setVerificationState(false);
    setMessage(t('prefilled'), 'success');
    document.getElementById('full-name').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function shrinkPhoto(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('The selected image could not be read.'));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('The selected file is not a valid image.'));
        image.onload = () => {
          const largestSide = 320;
          const scale = Math.min(1, largestSide / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function setMessage(text, kind) {
    message.textContent = text;
    message.className = `profile-form-message ${kind || ''}`;
    message.hidden = false;
  }

  function setVerificationState(verified) {
    documentVerified = verified;
    verificationBadge.textContent = verified ? t('verified') : t('notVerified');
    verificationBadge.classList.toggle('verified', verified);
    verificationBadge.classList.toggle('pending', !verified);
  }

  function chosenDocument() {
    return documents[nationality.value]?.find((item) => item.value === documentType.value);
  }

  function configureDocumentOptions() {
    const options = documents[nationality.value];
    documentVerified = false;
    verificationStep = 'start';
    setVerificationState(false);
    documentType.innerHTML = `<option value="" selected disabled>${t('selectDocument')}</option>` + (options || []).map((item) => `<option value="${item.value}">${item.label}</option>`).join('');
    documentNumber.value = '';
    documentNumber.removeAttribute('pattern');
    documentNumber.disabled = !options;
    documentType.disabled = !options;
    documentNumber.placeholder = options ? t('selectDocumentFirst') : '';
    identityFields.hidden = !options;
    verificationControls.hidden = !options;
    verificationCopy.textContent = nationality.value === 'india'
      ? t('indiaCopy')
      : nationality.value === 'foreign'
        ? t('foreignCopy')
        : t('chooseCopy');
    verificationButton.textContent = t('verify');
    verificationButton.disabled = false;
    verificationHelp.textContent = t('verificationStart');
  }

  function configureDocumentNumber() {
    const selected = chosenDocument();
    documentVerified = false;
    verificationStep = 'start';
    setVerificationState(false);
    documentNumber.value = '';
    documentNumber.disabled = !selected;
    documentNumber.placeholder = selected ? selected.placeholder : t('selectDocumentFirst');
    documentNumber.title = selected ? selected.title : '';
    if (selected) documentNumber.pattern = selected.pattern;
    else documentNumber.removeAttribute('pattern');
    documentLabel.innerHTML = `${selected ? selected.label : t('document')} <span aria-hidden="true">*</span>`;
    numberLabel.innerHTML = `${selected ? selected.label + ' ' + t('documentNumber') : t('documentNumber')} <span aria-hidden="true">*</span>`;
    verificationButton.textContent = t('verify');
    verificationButton.disabled = false;
    verificationHelp.textContent = t('verificationStart');
  }

  function focusFirstInvalid() {
    const fields = [...form.querySelectorAll('input:not([disabled]), select:not([disabled]), textarea:not([disabled])')];
    const invalid = fields.find((field) => !field.checkValidity());
    if (invalid) {
      invalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => invalid.focus({ preventScroll: true }), 350);
      invalid.reportValidity();
    }
    return invalid;
  }

  function maskDocument(value) {
    const lastFour = value.slice(-4);
    return `${'•'.repeat(Math.max(0, value.length - 4))}${lastFour}`;
  }

  function populateProfile() {
    const profile = readProfile();
    const accountEmail = session.email || session.name;
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountEmail) ? accountEmail : '';
    form.elements.email.readOnly = Boolean(session.email);
    ['fullName', 'dateOfBirth', 'gender', 'email', 'mobile', 'address'].forEach((key) => {
      if (profile[key]) form.elements[key].value = profile[key];
    });
    if (!form.elements.email.value) form.elements.email.value = email;
    if (profile.nationality) {
      nationality.value = profile.nationality;
      configureDocumentOptions();
      if (profile.documentType) {
        documentType.value = profile.documentType;
        configureDocumentNumber();
      }
      if (profile.documentVerified) {
        setVerificationState(true);
        verificationStep = 'verified';
        documentNumber.disabled = true;
        documentNumber.placeholder = `Verified document ending ${profile.documentMasked?.slice(-4) || ''}`;
        verificationButton.textContent = 'DOCUMENT VERIFIED';
        verificationButton.disabled = true;
        verificationHelp.textContent = `Verified ${profile.documentLabel || 'identity document'} ending ${profile.documentMasked?.slice(-4) || ''}.`;
      }
    }
    updateAvatar(profile.avatar, profile.fullName || session.name);
    document.getElementById('profile-title').textContent = profile.fullName || 'Your IRCTC profile';
    const memberSince = memberSinceValue(profile);
    document.getElementById('member-since').textContent = formatMemberSince(memberSince);
    if (profile.completed && session.emailVerified) document.getElementById('profile-status').textContent = 'Verified User ✓';
    else if (profile.completed) document.getElementById('profile-status').textContent = 'Verify your email to enable bookings.';
  }

  nationality.addEventListener('change', configureDocumentOptions);
  documentType.addEventListener('change', configureDocumentNumber);
  document.querySelectorAll('[data-demo-document]').forEach((button) => button.addEventListener('click', () => applyDemoDocument(button.dataset.demoDocument)));
  documentNumber.addEventListener('input', () => {
    if (documentVerified || !documentNumber.value) return;
    verificationStep = 'start';
    verificationButton.textContent = t('verify');
  });

  photoInput.addEventListener('change', async () => {
    const file = photoInput.files && photoInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setMessage('Choose a PNG, JPEG, or WebP image smaller than 5 MB.', 'error');
      photoInput.value = '';
      return;
    }
    try {
      const photo = await shrinkPhoto(file);
      const profile = { ...readProfile(), avatar: photo };
      localStorage.setItem(profileKey, JSON.stringify(profile));
      updateAvatar(photo, form.elements.fullName.value || session.name);
      const headerAvatar = document.querySelector('.profile-avatar');
      if (headerAvatar) {
        headerAvatar.textContent = '';
        headerAvatar.classList.add('has-photo');
        headerAvatar.style.backgroundImage = `url('${photo}')`;
      }
      setMessage('Profile photo updated.', 'success');
    } catch (error) {
      setMessage(error.message || 'The profile photo could not be saved.', 'error');
    } finally {
      photoInput.value = '';
    }
  });

  removePhoto.addEventListener('click', () => {
    const profile = readProfile();
    delete profile.avatar;
    localStorage.setItem(profileKey, JSON.stringify(profile));
    updateAvatar('', form.elements.fullName.value || session.name);
    const headerAvatar = document.querySelector('.profile-avatar');
    if (headerAvatar) {
      headerAvatar.textContent = initials(form.elements.fullName.value || session.name);
      headerAvatar.classList.remove('has-photo');
      headerAvatar.style.backgroundImage = '';
    }
    setMessage('Profile photo removed.', 'success');
  });

  verificationButton.addEventListener('click', () => {
    const selected = chosenDocument();
    if (!selected || !documentNumber.checkValidity()) {
      setMessage('Enter a valid identity document number before verification.', 'error');
      documentNumber.scrollIntoView({ behavior: 'smooth', block: 'center' });
      documentNumber.focus();
      documentNumber.reportValidity();
      return;
    }
    if (verificationStep === 'start') {
      verificationStep = 'otp';
      verificationButton.textContent = t('confirmOtp');
      verificationHelp.textContent = t('verificationOtp');
      return;
    }
    documentVerified = true;
    verificationStep = 'verified';
    setVerificationState(true);
    verificationButton.textContent = t('verifiedDocument');
    verificationHelp.textContent = `${selected.label} ${t('verificationDone')}`;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    message.hidden = true;
    const invalid = focusFirstInvalid();
    if (invalid) {
      setMessage('Complete the highlighted required field to continue.', 'error');
      return;
    }
    if (!documentVerified) {
      setMessage('Identity verification is required. Verify your document before saving.', 'error');
      document.getElementById('verification-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
      verificationButton.focus({ preventScroll: true });
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    const selected = chosenDocument();
    const previousProfile = readProfile();
    const profile = {
      fullName: data.fullName.trim(), dateOfBirth: data.dateOfBirth, gender: data.gender,
      email: data.email.trim(), mobile: data.mobile.trim(), address: data.address.trim(),
      nationality: data.nationality, documentType: data.documentType, documentLabel: selected.label,
      documentMasked: data.documentNumber ? maskDocument(data.documentNumber.trim()) : previousProfile.documentMasked,
      documentVerified: true, completed: true, avatar: previousProfile.avatar || '', memberSince: memberSinceValue(previousProfile),
    };
    localStorage.setItem(profileKey, JSON.stringify(profile));
    const updatedSession = { ...session, name: profile.fullName, memberSince: profile.memberSince };
    localStorage.setItem(sessionKey, JSON.stringify(updatedSession));
    updateAvatar(profile.avatar, profile.fullName);
    document.getElementById('profile-title').textContent = profile.fullName;
    document.getElementById('profile-status').textContent = updatedSession.emailVerified ? 'Verified User ✓' : 'Verify your email to enable bookings.';
    const headerName = document.querySelector('.profile-name');
    const headerAvatar = document.querySelector('.profile-avatar');
    const welcome = document.querySelector('.welcome-text');
    if (headerName) headerName.textContent = profile.fullName;
    if (headerAvatar) {
      headerAvatar.textContent = profile.avatar ? '' : initials(profile.fullName);
      headerAvatar.classList.toggle('has-photo', Boolean(profile.avatar));
      headerAvatar.style.backgroundImage = profile.avatar ? `url('${profile.avatar}')` : '';
    }
    if (welcome) welcome.textContent = `Welcome, ${profile.fullName}`;
    setMessage('Your personal details and identity verification have been saved.', 'success');
    const bookingIntent = localStorage.getItem('irctc-booking-intent');
    if (updatedSession.emailVerified && bookingIntent) {
      localStorage.removeItem('irctc-booking-intent');
      window.setTimeout(() => { window.location.href = bookingIntent; }, 650);
    }
  });

  document.querySelectorAll('[data-scroll-target]').forEach((button) => button.addEventListener('click', () => {
    document.getElementById(button.dataset.scrollTarget).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  document.getElementById('date-of-birth').max = new Date().toISOString().slice(0, 10);
  window.addEventListener('irctc-language-change', applyProfileLanguage);
  restoreResettableDemoProfile();
  populateProfile();
  applyProfileLanguage();
}());
