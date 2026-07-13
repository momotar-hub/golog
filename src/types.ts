export type PartOfSpeech = 'Noun' | 'Verb' | 'Adjective' | 'Adverb' | 'Pronoun' | 'Preposition' | 'Conjunction' | 'Interjection';

export interface Word {
  id: string;
  spelling: string;
  meaning: string;
  partsOfSpeech: PartOfSpeech[];
  sizeTier: number; // 0 = Tiny, 1 = Small, 2 = Medium, 3 = Large, 4 = Huge
  lockedUntil: number; // timestamp in milliseconds (0 if not locked)
  lockedAtCount: number; // the totalMemorizedCount when this word was locked (0 if not locked)
  createdAt: number;
  incorrectCount?: number; // tracks number of incorrect attempts
  memorizedCount?: number; // tracks number of times marked as memorized
  initialSizeTier?: number; // tracks initial size tier for mastery calculation
}

export interface PhysicsBubble {
  id: string;
  word: Word;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  textColor: string;
  pulseScale: number; // for tap or spawn animation
  isTapped: boolean;
  textWidth?: number;
  textHeight?: number;
}

export interface TouchTrailNode {
  x: number;
  y: number;
  age: number; // 0 to 1
}
