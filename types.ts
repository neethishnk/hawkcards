export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum CardStatus {
  NOT_ISSUED = 'NOT_ISSUED',
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  position: string;
  department: string;
  phone: string;
  cardStatus: CardStatus;
  avatarUrl?: string;
  issuedAt?: string;
}

export interface Contact {
  id: string;
  ownerId: string;
  name: string;
  email: string;
  phone: string;
  addedAt: string;
  lastMeeting?: string;
  notes?: string;
  avatarUrl?: string;
  linkedin?: string;
  twitter?: string;
  tag?: string; // Standard tag or custom segment name
}

export interface ContactSegment {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  color: string;
}

export interface MessageTemplate {
  id: string;
  ownerId: string;
  title: string;
  content: string; // The message body
  category: 'greeting' | 'follow-up' | 'holiday' | 'custom';
}

export interface LogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  adminId?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
}

export enum ViewState {
  LOGIN = 'LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  USER_PORTAL = 'USER_PORTAL'
}

export type CardTheme = 'classic' | 'modern' | 'sleek' | 'flat';

export interface SocialField {
  id: string;
  type: 'email' | 'phone' | 'website' | 'linkedin' | 'twitter' | 'instagram' | 'github' | 'youtube' | 'custom';
  label?: string;
  value: string;
}

export interface DigitalCard {
  id: string;
  userId: string;
  title: string;
  theme: CardTheme;
  color: string;
  prefix?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  preferredName?: string;
  maidenName?: string;
  pronouns?: string;
  jobTitle: string;
  department?: string;
  company: string;
  headline?: string;
  fields: SocialField[];
  avatarUrl?: string;
  coverImageUrl?: string;
  views: number;
  uniqueViews: number;
  saves: number;
}