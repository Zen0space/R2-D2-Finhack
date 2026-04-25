export type UserRole = "member" | "nadi_staff";

export type Kampung = {
  id: string;
  name: string;
  district: string;
  state: string;
};

export type MemberProfile = {
  id: string;
  name: string;
  email: string;
  kampung: Kampung;
  role: UserRole;
  individualPayLaterAllowanceCents: number;
};

export type Session = {
  mode: "demo-local";
  user: MemberProfile;
  issuedAt: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = SignInInput & {
  name: string;
  kampungName: string;
};

export type AuthResult = {
  isNewUser: boolean;
  session: Session;
};
