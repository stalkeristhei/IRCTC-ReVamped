(function () {
  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (error) { return null; }
  }

  const session = read('irctc-auth-session');
  const profile = session ? read(`irctc-user-profile:${(session.email || session.name).toLowerCase()}`) : null;
  if (!session || !session.emailVerified || !profile || !profile.completed || !profile.documentVerified) return;

  function ageFrom(dateOfBirth) {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
    return age;
  }

  const name = document.getElementById('name');
  const age = document.getElementById('age');
  const gender = document.getElementById('gender');
  if (name) name.value = profile.fullName;
  if (age) age.value = String(ageFrom(profile.dateOfBirth));
  if (gender) gender.value = profile.gender;
}());
