import { VaultItem } from '@/types';

export const STARTER_ITEMS: VaultItem[] = [
  {
    id: 'seed-framework-1',
    type: 'note',
    title: 'The Practitioner Triad: Competence, Confidence & Self-Awareness',
    pillar: 'competence',
    tags: ['Foundations', 'Framework', 'Mastery'],
    pinned: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    content: `## Guiding Transformation

True transformation occurs at the intersection of three vital pillars:

### 1. Competence (The Foundation of Skill & Capability)
- Helps clients move from unconscious incompetence to fluent capability.
- Break down daunting disciplines into repeatable micro-practices.
- Cultivate realistic feedback loops rather than wishful thinking.

### 2. Confidence (The Emotional & Psychological Engine)
- Confidence is not bravado; it is the quiet expectation of self-trust earned through evidence.
- Track client small wins obsessively—they compound into permanent resilience.
- When imposter feelings arise, anchor back to factual accomplishments.

### 3. Self-Awareness (The Compass & Mirror)
- Identifying internal narratives, somatic stress triggers, and recurring blind spots.
- Shifting from reactive emotional patterns into conscious choice.
- Cultivating radical honesty with oneself without harsh self-condemnation.`,
  },
  {
    id: 'seed-client-1',
    type: 'client_insight',
    title: 'Client Intake & Breakthrough Protocol',
    pillar: 'client',
    clientName: 'Framework',
    tags: ['Session Guide', 'Intake', 'Protocols'],
    pinned: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    content: `### Pre-Session Inquiry
- What decision or boundary are they hesitating to enact right now?
- Where is their energy leaking into circumstances outside their direct control?

### Breakthrough Questions to Ask
1. *"If you already felt totally capable in this domain, what would your next 24 hours look like?"*
2. *"What does your body feel when this stress pattern surfaces?"*
3. *"What is the hidden upside you get by staying uncertain?"*

### Session Close Checklist
- [ ] Explicit commitment written down by the client in their words.
- [ ] Specific date/time for verification.
- [ ] Confidential note archived here with emotional tone and key breakthrough.`,
  },
  {
    id: 'seed-thought-1',
    type: 'thought',
    title: 'On Holding Space Without Absording Emotional Gravity',
    pillar: 'self_awareness',
    tags: ['Reflection', 'Inner Sanctuary', 'Boundaries'],
    pinned: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    content: `As a practitioner, my value is not in carrying my clients' emotional burdens, but in being an unwavering, grounded mirror through which they discover their own strength.

When a session is intense:
- Pause and take three conscious breaths before writing summary notes.
- Remember: their growth requires discomfort; do not rob them of their struggle by rushing to solve it.
- Ground into the quiet presence of this room.`,
  },
  {
    id: 'seed-cred-1',
    type: 'password',
    title: 'Practitioner Client Portal & Case Records',
    pillar: 'credentials',
    tags: ['Confidential', 'Portal', 'Vault'],
    pinned: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    content: 'Master login for the confidential client telehealth and records platform. Rotate passphrase every 90 days.',
    credential: {
      username: 'practitioner@sovereign-vault.internal',
      password: 'Sample-Pass-PRACTITIONER#2026',
      website: 'https://telehealth.practitioner.vault',
      notes: 'Contains biometric 2FA recovery backup codes in physical safe.',
    },
  },
];
