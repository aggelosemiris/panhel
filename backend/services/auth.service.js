const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID, randomInt } = require('crypto');

const DATA_DIRECTORY = path.join(__dirname, '..', 'data');
const AUTH_STORE_FILE = path.join(DATA_DIRECTORY, 'auth-store.json');
const DEFAULT_STORE = {
  users: [],
  pendingRegistrations: [],
  passwordResets: [],
};

let pendingWrite = Promise.resolve();

function isVerificationBypassed() {
  return process.env.ALLOW_DEV_VERIFICATION_BYPASS === 'true';
}

function normalizeContact(contact) {
  return String(contact ?? '').trim().toLowerCase();
}

function normalizeUsername(username) {
  return String(username ?? '').trim().toLowerCase();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    contact: user.contact,
    fullName: user.fullName,
    username: user.username,
    createdAt: user.createdAt,
    verifiedAt: user.verifiedAt,
  };
}

async function ensureStore() {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await fs.access(AUTH_STORE_FILE);
  } catch {
    await fs.writeFile(AUTH_STORE_FILE, JSON.stringify(DEFAULT_STORE, null, 2), 'utf8');
  }
}

async function readStore() {
  await ensureStore();

  try {
    const raw = await fs.readFile(AUTH_STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      pendingRegistrations: Array.isArray(parsed.pendingRegistrations) ? parsed.pendingRegistrations : [],
      passwordResets: Array.isArray(parsed.passwordResets) ? parsed.passwordResets : [],
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

async function writeStore(store) {
  await ensureStore();

  pendingWrite = pendingWrite.then(async () => {
    const tempFile = `${AUTH_STORE_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(store, null, 2), 'utf8');
    await fs.rename(tempFile, AUTH_STORE_FILE);
  });

  return pendingWrite;
}

function generateCode() {
  return String(randomInt(100000, 999999));
}

function codeExpiresAt() {
  return new Date(Date.now() + 10 * 60 * 1000).toISOString();
}

function isExpired(isoDate) {
  return new Date(isoDate).getTime() < Date.now();
}

function buildDeliveryPayload(code) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[AUTH CODE] ${code}`);
  }

  return process.env.NODE_ENV === 'production'
    ? { deliveryMethod: 'email' }
    : {
        deliveryMethod: 'preview',
        previewCode: code,
        previewMessage: 'Σε local/dev mode ο κωδικός εμφανίζεται προσωρινά μέσα στην εφαρμογή.',
      };
}

async function startRegistration(contact) {
  const normalizedContact = normalizeContact(contact);
  if (!normalizedContact) {
    throw new Error('Χρειάζεται email ή κινητό.');
  }

  const store = await readStore();
  const existingUser = store.users.find((user) => normalizeContact(user.contact) === normalizedContact);
  if (existingUser) {
    throw new Error('Υπάρχει ήδη λογαριασμός με αυτό το email ή κινητό.');
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 8);
  const requestedAt = new Date().toISOString();

  store.pendingRegistrations = store.pendingRegistrations.filter(
    (item) => normalizeContact(item.contact) !== normalizedContact,
  );

  store.pendingRegistrations.push({
    id: randomUUID(),
    contact: normalizedContact,
    codeHash,
    requestedAt,
    expiresAt: codeExpiresAt(),
  });

  await writeStore(store);
  return buildDeliveryPayload(code);
}

async function completeRegistration({ contact, code, password, fullName, username }) {
  const normalizedContact = normalizeContact(contact);
  const normalizedUsername = normalizeUsername(username);
  const store = await readStore();
  const allowVerificationBypass = isVerificationBypassed();

  if (password.length < 12) {
    throw new Error('Ο κωδικός πρέπει να έχει τουλάχιστον 12 χαρακτήρες.');
  }

  const pendingRegistration = store.pendingRegistrations.find(
    (item) => normalizeContact(item.contact) === normalizedContact,
  );

  if ((!pendingRegistration || isExpired(pendingRegistration.expiresAt)) && !allowVerificationBypass) {
    throw new Error('Ο κωδικός επιβεβαίωσης έληξε. Ζήτησε νέο κωδικό.');
  }

  const isCodeValid = pendingRegistration
    ? await bcrypt.compare(String(code ?? '').trim(), pendingRegistration.codeHash)
    : false;
  if (!isCodeValid && !allowVerificationBypass) {
    throw new Error('Ο κωδικός επιβεβαίωσης δεν είναι σωστός.');
  }

  const contactExists = store.users.some((user) => normalizeContact(user.contact) === normalizedContact);
  if (contactExists) {
    throw new Error('Υπάρχει ήδη λογαριασμός με αυτό το email ή κινητό.');
  }

  const usernameExists = store.users.some((user) => normalizeUsername(user.username) === normalizedUsername);
  if (usernameExists) {
    throw new Error('Αυτό το username χρησιμοποιείται ήδη.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const user = {
    id: `user-${randomUUID()}`,
    contact: normalizedContact,
    passwordHash,
    fullName: String(fullName ?? '').trim(),
    username: String(username ?? '').trim(),
    createdAt: now,
    verifiedAt: now,
  };

  store.users.push(user);
  if (pendingRegistration) {
    store.pendingRegistrations = store.pendingRegistrations.filter((item) => item.id !== pendingRegistration.id);
  }
  await writeStore(store);

  return sanitizeUser(user);
}

async function login({ contact, password }) {
  const normalizedContact = normalizeContact(contact);
  const store = await readStore();
  const user = store.users.find((entry) => normalizeContact(entry.contact) === normalizedContact);

  if (!user) {
    throw new Error('Λάθος email/κινητό ή κωδικός.');
  }

  const isPasswordValid = await bcrypt.compare(String(password ?? ''), user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Λάθος email/κινητό ή κωδικός.');
  }

  return sanitizeUser(user);
}

async function requestPasswordReset(contact) {
  const normalizedContact = normalizeContact(contact);
  const store = await readStore();
  const user = store.users.find((entry) => normalizeContact(entry.contact) === normalizedContact);

  if (!user) {
    return {
      deliveryMethod: 'email',
      successMessage: 'Αν υπάρχει λογαριασμός με αυτό το email ή κινητό, στάλθηκε κωδικός ανάκτησης.',
    };
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 8);

  store.passwordResets = store.passwordResets.filter((item) => normalizeContact(item.contact) !== normalizedContact);
  store.passwordResets.push({
    id: randomUUID(),
    contact: normalizedContact,
    codeHash,
    requestedAt: new Date().toISOString(),
    expiresAt: codeExpiresAt(),
  });

  await writeStore(store);
  return {
    ...buildDeliveryPayload(code),
    successMessage: 'Στάλθηκε κωδικός ανάκτησης.',
  };
}

async function resetPassword({ contact, code, newPassword }) {
  const normalizedContact = normalizeContact(contact);
  const store = await readStore();

  if (String(newPassword ?? '').length < 12) {
    throw new Error('Ο νέος κωδικός πρέπει να έχει τουλάχιστον 12 χαρακτήρες.');
  }

  const resetEntry = store.passwordResets.find((item) => normalizeContact(item.contact) === normalizedContact);
  if (!resetEntry || isExpired(resetEntry.expiresAt)) {
    throw new Error('Ο κωδικός ανάκτησης έληξε. Ζήτησε νέο.');
  }

  const isCodeValid = await bcrypt.compare(String(code ?? '').trim(), resetEntry.codeHash);
  if (!isCodeValid) {
    throw new Error('Ο κωδικός ανάκτησης δεν είναι σωστός.');
  }

  const user = store.users.find((entry) => normalizeContact(entry.contact) === normalizedContact);
  if (!user) {
    throw new Error('Δεν βρέθηκε λογαριασμός για αυτή την ανάκτηση.');
  }

  user.passwordHash = await bcrypt.hash(String(newPassword), 10);
  store.passwordResets = store.passwordResets.filter((item) => item.id !== resetEntry.id);
  await writeStore(store);

  return sanitizeUser(user);
}

module.exports = {
  startRegistration,
  completeRegistration,
  login,
  requestPasswordReset,
  resetPassword,
};
