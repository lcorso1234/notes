export type ItemType = 'note' | 'thought' | 'client_insight' | 'password';

export type PillarCategory = 
  | 'competence'     // Skills, tools, practical mastery
  | 'confidence'     // Self-efficacy, overcoming fear, inner strength
  | 'self_awareness' // Values, triggers, clarity, introspection
  | 'client'         // Specific client files & tracking
  | 'credentials'    // Passwords, logins, secure keys
  | 'personal';      // Deep memory, reflections, philosophies

export interface CredentialData {
  username: string;
  password: string;
  website?: string;
  notes?: string;
}

export interface VaultItem {
  id: string;
  type: ItemType;
  title: string;
  content: string; // Markdown / prose
  pillar: PillarCategory;
  clientName?: string;
  tags: string[];
  pinned: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  credential?: CredentialData;
}

export interface VaultSettings {
  autoLockMinutes: number; // 0 for never, default 15
  blurOnInactivity: boolean;
  theme: 'light' | 'dark';
}

export interface StoredVaultState {
  hasInitialized: boolean;
  verifier?: {
    salt: string;
    hash: string;
  };
  encryptedData?: {
    salt: string;
    iv: string;
    ciphertext: string;
    version: number;
  };
}
