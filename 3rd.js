const form = document.getElementById('regForm');
const byId = (id) => document.getElementById(id);

function showError(input, message) {
  const field = input.closest('.field');
  field.classList.toggle('invalid', Boolean(message));
  const box = field.querySelector('.error');
  if (box) box.textContent = message || '';
  return !message;
}

function isProvince() {
  return byId('province').checked;
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function userIdChecks(value) {
  return {
    length: value.length >= 8 && value.length <= 20,
    start: /^[A-Za-z]/.test(value),
    chars: /^[A-Za-z0-9_]+$/.test(value)
  };
}

function needed(message) {
  return (el) => (el.value.trim() ? '' : message);
}

function neededInProvince(message) {
  return (el) => (isProvince() && !el.value.trim() ? message : '');
}

const rules = {
  crn(el) {
    const digits = el.value.replace(/[\s-]/g, '');
    if (!digits) return 'Enter your CRN or SS number.';
    if (digits.length !== 10 && digits.length !== 12) return 'Must be 10 digits (SS number) or 12 digits (CRN).';
    return '';
  },
  email(el) {
    if (!el.value.trim()) return 'Enter your email address.';
    if (!isEmail(el.value.trim())) return 'Enter a valid email address.';
    return '';
  },
  email2(el) {
    if (!el.value.trim()) return 'Confirm your email address.';
    if (el.value.trim().toLowerCase() !== byId('email').value.trim().toLowerCase()) return 'Email addresses do not match.';
    return '';
  },
  uid(el) {
    if (!el.value) return 'Enter a user ID.';
    const c = userIdChecks(el.value);
    if (!c.length || !c.start || !c.chars) return 'User ID does not follow the rules below.';
    return '';
  },
  uid2(el) {
    if (!el.value) return 'Confirm your user ID.';
    if (el.value !== byId('uid').value) return 'User IDs do not match.';
    return '';
  },
  last: needed('Enter your last name.'),
  first: needed('Enter your given name.'),
  dob(el) {
    if (!el.value) return 'Enter your date of birth.';
    if (new Date(el.value) > new Date()) return 'Date of birth cannot be in the future.';
    return '';
  },
  provName: neededInProvince('Enter your province.'),
  city: neededInProvince('Enter your city or municipality.')
};

function check(el) {
  return showError(el, rules[el.id](el));
}

Object.keys(rules).forEach((id) => {
  const el = byId(id);
  el.addEventListener('blur', () => check(el));
  el.addEventListener('input', () => {
    if (el.closest('.field').classList.contains('invalid')) check(el);
  });
});

byId('uid').addEventListener('input', (e) => {
  const value = e.target.value;
  const result = userIdChecks(value);
  document.querySelectorAll('#uidRules li').forEach((li) => {
    li.classList.toggle('pass', value !== '' && result[li.dataset.rule]);
    li.classList.toggle('fail', value !== '' && !result[li.dataset.rule]);
  });
});

byId('crn').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^\d-]/g, '');
});

document.querySelectorAll('input[name="area"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    byId('provinceFields').hidden = !isProvince();
    if (!isProvince()) {
      ['provName', 'city'].forEach((id) => {
        byId(id).value = '';
        showError(byId(id), '');
      });
    }
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  byId('success').hidden = true;
  const inputs = Object.keys(rules).map(byId);
  const results = inputs.map(check);
  if (results.every(Boolean)) {
    byId('success').hidden = false;
  } else {
    inputs[results.indexOf(false)].focus();
  }
});
