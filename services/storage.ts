import { User, UserRole, CardStatus, LogEntry, DigitalCard, Contact, ContactSegment, MessageTemplate } from '../types';

const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Sarah Connor',
    email: 'admin@hawkforce.ai',
    role: UserRole.ADMIN,
    position: 'Chief Security Officer',
    department: 'Security',
    phone: '+1 (555) 010-9988',
    cardStatus: CardStatus.ACTIVE,
    avatarUrl: 'https://picsum.photos/200/200?random=1',
    issuedAt: new Date().toISOString()
  },
  {
    id: 'user-1',
    name: 'John Anderson',
    email: 'john.anderson@hawkforce.ai',
    role: UserRole.USER,
    position: 'Software Engineer',
    department: 'Engineering',
    phone: '+1 (555) 019-2233',
    cardStatus: CardStatus.ACTIVE,
    avatarUrl: 'https://picsum.photos/200/200?random=2',
    issuedAt: new Date().toISOString()
  }
];

const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c-1',
    ownerId: 'user-1',
    name: 'Thomas Mueller',
    email: 'thomas.m@example.com',
    phone: '491522334455',
    addedAt: new Date(Date.now() - 604800000).toISOString(),
    lastMeeting: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Interested in enterprise security stack. Follow up next Tuesday.',
    avatarUrl: 'https://picsum.photos/200/200?random=10',
    linkedin: 'https://linkedin.com/in/thomasmueller',
    tag: 'Work'
  },
  {
    id: 'c-2',
    ownerId: 'user-1',
    name: 'Emily Watson',
    email: 'emily.w@techcorp.com',
    phone: '15550123456',
    addedAt: new Date(Date.now() - 1209600000).toISOString(),
    lastMeeting: new Date(Date.now() - 432000000).toISOString(),
    notes: 'Discussed potential partnership for Q3. Needs demo.',
    avatarUrl: 'https://picsum.photos/200/200?random=11',
    linkedin: 'https://linkedin.com/in/emilywatson',
    tag: 'VIP'
  }
];

const INITIAL_SEGMENTS: ContactSegment[] = [
  { id: 'seg-1', ownerId: 'user-1', name: 'Work', color: '#3b82f6', description: 'Business contacts and clients' },
  { id: 'seg-2', ownerId: 'user-1', name: 'VIP', color: '#8b5cf6', description: 'Key decision makers' }
];

const INITIAL_TEMPLATES: MessageTemplate[] = [
  { id: 'tm-1', ownerId: 'user-1', title: 'New Year Greeting', category: 'holiday', content: 'Happy New Year! Wishing you a prosperous year ahead filled with success and joy.' },
  { id: 'tm-2', ownerId: 'user-1', title: 'Follow-up', category: 'follow-up', content: 'Hi! It was great connecting with you recently. Would love to catch up and discuss our potential collaboration further.' }
];

const INITIAL_LOGS: LogEntry[] = [
  { id: 'log-1', action: 'SYSTEM_INIT', details: 'System initialized', timestamp: new Date(Date.now() - 10000000).toISOString() }
];

const INITIAL_CARDS: DigitalCard[] = [
  {
    id: 'card-1',
    userId: 'user-1',
    title: 'Work',
    theme: 'modern',
    color: '#3b82f6',
    firstName: 'John',
    lastName: 'Anderson',
    jobTitle: 'Software Engineer',
    company: 'Hawkforce AI',
    department: 'Engineering',
    fields: [
      { id: 'f1', type: 'email', value: 'john.anderson@hawkforce.ai', label: 'Work Email' },
      { id: 'f2', type: 'phone', value: '+1 (555) 019-2233', label: 'Work Phone' }
    ],
    avatarUrl: 'https://picsum.photos/200/200?random=2',
    views: 120,
    uniqueViews: 85,
    saves: 12
  }
];

export const StorageService = {
  getUsers: (): User[] => {
    const stored = localStorage.getItem('hawk_users');
    if (!stored) {
      localStorage.setItem('hawk_users', JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(stored);
  },

  saveUsers: (users: User[]) => {
    localStorage.setItem('hawk_users', JSON.stringify(users));
  },

  addUser: (user: Omit<User, 'id' | 'cardStatus' | 'avatarUrl' | 'issuedAt'>) => {
    const users = StorageService.getUsers();
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      cardStatus: CardStatus.NOT_ISSUED,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`,
    };
    const updatedUsers = [newUser, ...users];
    StorageService.saveUsers(updatedUsers);
    StorageService.addLog('USER_CREATE', `Admin created user profile for ${user.name}`);
    return newUser;
  },

  getLogs: (): LogEntry[] => {
    const stored = localStorage.getItem('hawk_logs');
    if (!stored) {
      localStorage.setItem('hawk_logs', JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    return JSON.parse(stored);
  },

  addLog: (action: string, details: string) => {
    const logs = StorageService.getLogs();
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('hawk_logs', JSON.stringify([newLog, ...logs]));
  },

  updateUserStatus: (userId: string, status: CardStatus) => {
    const users = StorageService.getUsers();
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { 
          ...u, 
          cardStatus: status,
          issuedAt: status === CardStatus.ACTIVE ? new Date().toISOString() : u.issuedAt 
        };
      }
      return u;
    });
    StorageService.saveUsers(updatedUsers);
    return updatedUsers;
  },

  getCards: (userId: string): DigitalCard[] => {
    const stored = localStorage.getItem('hawk_cards');
    let cards: DigitalCard[] = stored ? JSON.parse(stored) : INITIAL_CARDS;
    return cards.filter(c => c.userId === userId);
  },

  saveCard: (card: DigitalCard) => {
    const stored = localStorage.getItem('hawk_cards');
    let cards: DigitalCard[] = stored ? JSON.parse(stored) : INITIAL_CARDS;
    const index = cards.findIndex(c => c.id === card.id);
    if (index >= 0) cards[index] = card;
    else cards.push(card);
    localStorage.setItem('hawk_cards', JSON.stringify(cards));
  },

  createCard: (cardData: Omit<DigitalCard, 'id' | 'views' | 'uniqueViews' | 'saves'>): DigitalCard => {
     const newCard: DigitalCard = { ...cardData, id: `card-${Date.now()}`, views: 0, uniqueViews: 0, saves: 0 };
     StorageService.saveCard(newCard);
     return newCard;
  },

  getContacts: (userId: string): Contact[] => {
    const stored = localStorage.getItem('hawk_contacts');
    const contacts: Contact[] = stored ? JSON.parse(stored) : INITIAL_CONTACTS;
    return contacts.filter(c => c.ownerId === userId);
  },

  saveContacts: (contacts: Contact[]) => {
    localStorage.setItem('hawk_contacts', JSON.stringify(contacts));
  },

  addContact: (contact: Omit<Contact, 'id' | 'addedAt'>) => {
    const stored = localStorage.getItem('hawk_contacts');
    const contacts: Contact[] = stored ? JSON.parse(stored) : INITIAL_CONTACTS;
    const newContact: Contact = {
      ...contact,
      id: `c-${Date.now()}`,
      addedAt: new Date().toISOString()
    };
    const updated = [newContact, ...contacts];
    StorageService.saveContacts(updated);
    return newContact;
  },

  updateContact: (updatedContact: Contact) => {
    const stored = localStorage.getItem('hawk_contacts');
    const contacts: Contact[] = stored ? JSON.parse(stored) : INITIAL_CONTACTS;
    const updated = contacts.map(c => c.id === updatedContact.id ? updatedContact : c);
    StorageService.saveContacts(updated);
  },

  deleteContact: (contactId: string) => {
    const stored = localStorage.getItem('hawk_contacts');
    const contacts: Contact[] = stored ? JSON.parse(stored) : INITIAL_CONTACTS;
    const updated = contacts.filter(c => c.id !== contactId);
    StorageService.saveContacts(updated);
  },

  getSegments: (userId: string): ContactSegment[] => {
    const stored = localStorage.getItem('hawk_segments');
    const segments: ContactSegment[] = stored ? JSON.parse(stored) : INITIAL_SEGMENTS;
    return segments.filter(s => s.ownerId === userId);
  },

  saveSegment: (segment: Omit<ContactSegment, 'id'>) => {
    const stored = localStorage.getItem('hawk_segments');
    const segments: ContactSegment[] = stored ? JSON.parse(stored) : INITIAL_SEGMENTS;
    const newSeg: ContactSegment = { ...segment, id: `seg-${Date.now()}` };
    localStorage.setItem('hawk_segments', JSON.stringify([...segments, newSeg]));
    return newSeg;
  },

  deleteSegment: (segId: string) => {
    const stored = localStorage.getItem('hawk_segments');
    const segments: ContactSegment[] = stored ? JSON.parse(stored) : INITIAL_SEGMENTS;
    localStorage.setItem('hawk_segments', JSON.stringify(segments.filter(s => s.id !== segId)));
  },

  getTemplates: (userId: string): MessageTemplate[] => {
    const stored = localStorage.getItem('hawk_templates');
    const templates: MessageTemplate[] = stored ? JSON.parse(stored) : INITIAL_TEMPLATES;
    return templates.filter(t => t.ownerId === userId);
  },

  saveTemplate: (template: Omit<MessageTemplate, 'id'>) => {
    const stored = localStorage.getItem('hawk_templates');
    const templates: MessageTemplate[] = stored ? JSON.parse(stored) : INITIAL_TEMPLATES;
    const newTemplate: MessageTemplate = { ...template, id: `tm-${Date.now()}` };
    localStorage.setItem('hawk_templates', JSON.stringify([...templates, newTemplate]));
    return newTemplate;
  },

  deleteTemplate: (tmId: string) => {
    const stored = localStorage.getItem('hawk_templates');
    const templates: MessageTemplate[] = stored ? JSON.parse(stored) : INITIAL_TEMPLATES;
    localStorage.setItem('hawk_templates', JSON.stringify(templates.filter(t => t.id !== tmId)));
  },

  getAllCards: (): DigitalCard[] => {
    const stored = localStorage.getItem('hawk_cards');
    return stored ? JSON.parse(stored) : INITIAL_CARDS;
  },

  incrementCardViews: (cardId: string) => {
    const cards = StorageService.getAllCards();
    const updated = cards.map(c => c.id === cardId ? { ...c, views: c.views + 1, uniqueViews: c.uniqueViews + 1 } : c);
    localStorage.setItem('hawk_cards', JSON.stringify(updated));
  },

  incrementCardSaves: (cardId: string) => {
    const cards = StorageService.getAllCards();
    const updated = cards.map(c => c.id === cardId ? { ...c, saves: c.saves + 1 } : c);
    localStorage.setItem('hawk_cards', JSON.stringify(updated));
  }
};