import type { Kampung, MemberProfile, Session, SignUpInput } from "@/types/auth";

type StoredUser = MemberProfile & {
  createdAt: string;
  password: string;
};

const USERS_KEY = "duitlater.phase1.users";
const SESSION_KEY = "duitlater.phase1.session";
const ALLOWANCE_ROTATION = [30_000, 45_000, 60_000, 90_000] as const;

const defaultKampung: Kampung = {
  id: "felda-gedangsa",
  name: "Felda Gedangsa",
  district: "Hulu Selangor",
  state: "Selangor",
};

const demoUsers: StoredUser[] = [
  {
    id: "member-nurul",
    name: "Nurul Aisyah",
    email: "nurul@duitlater.my",
    password: "duitlater123",
    kampung: defaultKampung,
    role: "member",
    individualPayLaterAllowanceCents: 30_000,
    createdAt: "2026-04-25T08:00:00.000Z",
  },
  {
    id: "member-razali",
    name: "Razali Ismail",
    email: "razali@duitlater.my",
    password: "duitlater123",
    kampung: defaultKampung,
    role: "member",
    individualPayLaterAllowanceCents: 45_000,
    createdAt: "2026-04-25T08:05:00.000Z",
  },
  {
    id: "member-faiz",
    name: "Faiz Haziq",
    email: "faiz@duitlater.my",
    password: "duitlater123",
    kampung: defaultKampung,
    role: "member",
    individualPayLaterAllowanceCents: 60_000,
    createdAt: "2026-04-25T08:10:00.000Z",
  },
  {
    id: "nadi-hidayah",
    name: "Cik Hidayah",
    email: "hidayah.nadi@duitlater.my",
    password: "duitlater123",
    kampung: defaultKampung,
    role: "nadi_staff",
    individualPayLaterAllowanceCents: 30_000,
    createdAt: "2026-04-25T08:15:00.000Z",
  },
];

const seededUsers: StoredUser[] = demoUsers;
const primaryDemoUser = demoUsers.at(0);

if (!primaryDemoUser) {
  throw new Error("At least one demo user is required");
}

export const DEMO_CREDENTIALS = {
  email: primaryDemoUser.email,
  password: primaryDemoUser.password,
} as const;

export const DEMO_ACCOUNTS = demoUsers.map((user) => ({
  email: user.email,
  name: user.name,
  password: user.password,
  role: user.role,
}));

function isBrowser() {
  return typeof window !== "undefined";
}

function parseJson<T>(value: string | null, fallback: T) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function storage() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
}

function sanitizeUser(user: StoredUser): MemberProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    kampung: user.kampung,
    role: user.role,
    individualPayLaterAllowanceCents: user.individualPayLaterAllowanceCents,
  };
}

function buildKampung(name: string): Kampung {
  const normalizedName = name.trim();

  if (normalizedName.toLowerCase() === defaultKampung.name.toLowerCase()) {
    return defaultKampung;
  }

  return {
    id: slugify(normalizedName) || createId("kampung"),
    name: normalizedName,
    district: "Daerah setempat",
    state: "Malaysia",
  };
}

function writeUsers(users: StoredUser[]) {
  storage()?.setItem(USERS_KEY, JSON.stringify(users));
}

function ensureUsers() {
  const localStorage = storage();

  if (!localStorage) {
    return seededUsers;
  }

  const existingUsers = parseJson<StoredUser[]>(localStorage.getItem(USERS_KEY), []);

  if (existingUsers.length > 0) {
    return existingUsers;
  }

  writeUsers(seededUsers);
  return seededUsers;
}

export function findUserByEmail(email: string) {
  return ensureUsers().find((user) => user.email.toLowerCase() === email.trim().toLowerCase());
}

function buildSession(user: StoredUser): Session {
  return {
    mode: "demo-local",
    issuedAt: new Date().toISOString(),
    user: sanitizeUser(user),
  };
}

export function readSession() {
  const localStorage = storage();

  if (!localStorage) {
    return null;
  }

  return parseJson<Session | null>(localStorage.getItem(SESSION_KEY), null);
}

export function writeSession(session: Session | null) {
  const localStorage = storage();

  if (!localStorage) {
    return;
  }

  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return;
  }

  localStorage.removeItem(SESSION_KEY);
}

export function createUser(input: SignUpInput) {
  const users = ensureUsers();
  const allowance = ALLOWANCE_ROTATION[users.length % ALLOWANCE_ROTATION.length] ?? 30_000;

  const user: StoredUser = {
    id: createId("member"),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    kampung: buildKampung(input.kampungName),
    role: "member",
    individualPayLaterAllowanceCents: allowance,
    createdAt: new Date().toISOString(),
  };

  writeUsers([...users, user]);

  return user;
}

export function createSessionForUser(user: StoredUser) {
  const session = buildSession(user);
  writeSession(session);
  return session;
}
