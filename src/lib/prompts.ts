/**
 * Curated practitioner inquiry prompts to stimulate deep reflections across
 * Self-Awareness, Competence, Confidence, and Practitioner Boundaries.
 */

export interface PractitionerPrompt {
  id: string;
  pillar: 'self_awareness' | 'competence' | 'confidence' | 'personal';
  title: string;
  inquiry: string;
}

export const PRACTITIONER_PROMPTS: PractitionerPrompt[] = [
  // Self-Awareness Prompts
  {
    id: 'p-sa-1',
    pillar: 'self_awareness',
    title: 'Unconscious Defenses',
    inquiry: 'What unspoken story or defense mechanism was running beneath the client’s words today? What emotional trigger caused them to hesitate or deflect?',
  },
  {
    id: 'p-sa-2',
    pillar: 'self_awareness',
    title: 'The Mirror Within',
    inquiry: 'What did this interaction bring up within my own emotional landscape? Did I feel an impulse to rescue, fix, or hold tension that belongs to them?',
  },
  {
    id: 'p-sa-3',
    pillar: 'self_awareness',
    title: 'Blindspot Reflection',
    inquiry: 'Where is the gap between how they perceive themselves and how they actually show up in high-stakes relationships or decisions?',
  },

  // Competence Prompts
  {
    id: 'p-comp-1',
    pillar: 'competence',
    title: 'Micro-Habit Translation',
    inquiry: 'How do we break this theoretical insight down into a concrete, measurable behavioral practice they can execute daily in under 10 minutes?',
  },
  {
    id: 'p-comp-2',
    pillar: 'competence',
    title: 'Friction Point Audit',
    inquiry: 'Where did execution break down this week? Was it lack of skill, ambiguity in the next step, or an unaddressed environmental cue?',
  },
  {
    id: 'p-comp-3',
    pillar: 'competence',
    title: 'Feedback Loop Design',
    inquiry: 'What objective evidence or external feedback will tell them they have achieved fluency, rather than relying on subjective anxiety or mood?',
  },

  // Confidence Prompts
  {
    id: 'p-conf-1',
    pillar: 'confidence',
    title: 'Evidence Log Anchor',
    inquiry: 'What undeniable factual accomplishment or courageous step did they take this week that contradicts their inner critic’s imposter narrative?',
  },
  {
    id: 'p-conf-2',
    pillar: 'confidence',
    title: 'Threshold of Discomfort',
    inquiry: 'What discomfort did they endure without retreating? How can we anchor their pride in having held their ground?',
  },
  {
    id: 'p-conf-3',
    pillar: 'confidence',
    title: 'Self-Trust Reinforcement',
    inquiry: 'In what moment did they honor their own judgment over seeking external validation or approval?',
  },

  // Personal Practitioner Sanctuary Prompts
  {
    id: 'p-per-1',
    pillar: 'personal',
    title: 'Decompression & Clean Release',
    inquiry: 'Take a long exhale. Release the energy of this session back to the room. What do I need right now to return to center and replenish my energy?',
  },
  {
    id: 'p-per-2',
    pillar: 'personal',
    title: 'Practitioner Humility & Space',
    inquiry: 'Remember: I do not produce their transformation; they do. Where can I step back and give them more room to struggle productively?',
  },
];
