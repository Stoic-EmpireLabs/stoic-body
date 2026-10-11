export interface StoicQuote {
  id: string;
  text: string;
  author: string;
  source?: string;
  personality: 'marine' | 'stoic' | 'coach' | 'aurelia';
}

export const STOIC_QUOTES: StoicQuote[] = [
  // -------------------------------------------------------------
  // USMC / MARINE COMBAT CONDITIONING (Discipline, Grit, Mission)
  // -------------------------------------------------------------
  {
    id: 'marine-1',
    text: 'Pain is weakness leaving the body.',
    author: 'USMC Training Cadence',
    source: 'Marine Corps Tradition',
    personality: 'marine',
  },
  {
    id: 'marine-2',
    text: 'The more you sweat in peace, the less you bleed in war.',
    author: 'General George S. Patton',
    source: 'Combat Leadership',
    personality: 'marine',
  },
  {
    id: 'marine-3',
    text: 'Improvise, adapt, overcome. Excuses have never won a battle.',
    author: 'USMC Doctrine',
    source: 'Field Manual',
    personality: 'marine',
  },
  {
    id: 'marine-4',
    text: 'Discipline is doing what needs to be done, even when you don’t feel like doing it.',
    author: 'Marine Leadership Principles',
    source: 'USMC Core Values',
    personality: 'marine',
  },
  {
    id: 'marine-5',
    text: 'Some people spend an entire lifetime wondering if they made a difference. Marines don’t have that problem.',
    author: 'Ronald Reagan',
    source: '1985 Address to Marines',
    personality: 'marine',
  },
  {
    id: 'marine-6',
    text: 'Uncommon valor was a common virtue.',
    author: 'Admiral Chester Nimitz',
    source: 'Iwo Jima, 1945',
    personality: 'marine',
  },
  {
    id: 'marine-7',
    text: 'You don’t rise to the occasion, you sink to the level of your training.',
    author: 'Archilochus / Tactical Axiom',
    source: 'Combat Conditioning',
    personality: 'marine',
  },
  {
    id: 'marine-8',
    text: 'It is not enough to succeed. Others must see the standard and be pulled forward by your example.',
    author: 'USMC Staff NCO Creed',
    source: 'Leadership Standard',
    personality: 'marine',
  },
  {
    id: 'marine-9',
    text: 'When your mind tells you that you are done, that you’re exhausted, you’re really only at 40 percent.',
    author: 'Combat Conditioning Directive',
    source: 'Mindset Protocol',
    personality: 'marine',
  },
  {
    id: 'marine-10',
    text: 'Standards are not negotiable. Iron does not negotiate.',
    author: 'Marine Physical Readiness Creed',
    source: 'USMC PFT Standard',
    personality: 'marine',
  },

  // -------------------------------------------------------------
  // STOIC PHILOSOPHY (Marcus Aurelius, Epictetus, Seneca)
  // -------------------------------------------------------------
  {
    id: 'stoic-1',
    text: 'The impediment to action advances action. What stands in the way becomes the way.',
    author: 'Marcus Aurelius',
    source: 'Meditations, Book V',
    personality: 'stoic',
  },
  {
    id: 'stoic-2',
    text: 'No man is free who is not master of himself.',
    author: 'Epictetus',
    source: 'Discourses',
    personality: 'stoic',
  },
  {
    id: 'stoic-3',
    text: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
    author: 'Marcus Aurelius',
    source: 'Meditations',
    personality: 'stoic',
  },
  {
    id: 'stoic-4',
    text: 'We suffer more often in imagination than in reality.',
    author: 'Seneca',
    source: 'Letters from a Stoic',
    personality: 'stoic',
  },
  {
    id: 'stoic-5',
    text: 'Waste no more time arguing about what a good person should be. Be one.',
    author: 'Marcus Aurelius',
    source: 'Meditations, Book X',
    personality: 'stoic',
  },
  {
    id: 'stoic-6',
    text: 'If you want to improve, be content to be thought foolish and stupid.',
    author: 'Epictetus',
    source: 'Enchiridion',
    personality: 'stoic',
  },
  {
    id: 'stoic-7',
    text: 'He who fears death will never do anything worthy of a man who is alive.',
    author: 'Seneca',
    source: 'Moral Essays',
    personality: 'stoic',
  },
  {
    id: 'stoic-8',
    text: 'Dwell on the beauty of life. Watch the stars, and see yourself running with them.',
    author: 'Marcus Aurelius',
    source: 'Meditations',
    personality: 'stoic',
  },
  {
    id: 'stoic-9',
    text: 'First say to yourself what you would be; and then do what you have to do.',
    author: 'Epictetus',
    source: 'Discourses, Book III',
    personality: 'stoic',
  },
  {
    id: 'stoic-10',
    text: 'A gem cannot be polished without friction, nor a spirit perfected without trials.',
    author: 'Seneca',
    source: 'Moral Epistles',
    personality: 'stoic',
  },

  // -------------------------------------------------------------
  // AURELIA & EMPRESS (Female Leadership, Sovereignty & Discipline)
  // -------------------------------------------------------------
  {
    id: 'aurelia-1',
    text: 'Reserve your right to think, for even to think wrongly is better than not to think at all.',
    author: 'Hypatia of Alexandria',
    source: 'Hellenistic Philosophy',
    personality: 'aurelia',
  },
  {
    id: 'aurelia-2',
    text: 'I will not be triumphed over. Sovereignty is forged in iron discipline and calm resolve.',
    author: 'Cleopatra VII Philopator',
    source: 'Alexandrian Records',
    personality: 'aurelia',
  },
  {
    id: 'aurelia-3',
    text: 'Courage is not the absence of fear, but the mastery of it. Stand tall when others falter.',
    author: 'Artemisia of Caria',
    source: 'Naval Commander, 480 BC',
    personality: 'aurelia',
  },
  {
    id: 'aurelia-4',
    text: 'Let us strive for what is ours with unrelenting will. The body endures what the mind commands.',
    author: 'Boudicca',
    source: 'Warrior Queen of the Iceni',
    personality: 'aurelia',
  },
  {
    id: 'aurelia-5',
    text: 'The triumph can’t be had without the struggle. I run not just to finish, but to set the standard.',
    author: 'Wilma Rudolph',
    source: 'Olympic Gold Champion',
    personality: 'aurelia',
  },
  {
    id: 'aurelia-6',
    text: 'Only disciplined women rule their own destiny and refuse to ask permission for greatness.',
    author: 'Queen Gorgo of Sparta',
    source: 'Spartan Axioms',
    personality: 'aurelia',
  },
  {
    id: 'aurelia-7',
    text: 'You gain strength, courage, and confidence by every experience in which you really stop to look fear in the face.',
    author: 'Eleanor Roosevelt',
    source: 'Leadership Discourses',
    personality: 'aurelia',
  },
  {
    id: 'aurelia-8',
    text: 'Acknowledge the fear, but execute the maneuver anyway. Standards never bend.',
    author: 'Capt. Vernice Armour',
    source: 'USMC Combat Aviator',
    personality: 'aurelia',
  },
  {
    id: 'aurelia-9',
    text: 'I am not afraid of storms, for I am learning how to sail my ship.',
    author: 'Louisa May Alcott',
    source: 'Literary Works',
    personality: 'aurelia',
  },
  {
    id: 'aurelia-10',
    text: 'Champions aren’t made in gyms. Champions are made from something they have deep inside them: a desire, a dream, a vision.',
    author: 'Billie Jean King',
    source: 'Athletic Excellence',
    personality: 'aurelia',
  },

  // -------------------------------------------------------------
  // HIGH-PERFORMANCE COACH (Data, Progressive Overload, Recovery)
  // -------------------------------------------------------------
  {
    id: 'coach-1',
    text: 'Consistency beats intensity every single time. Show up, log the work, recover.',
    author: 'Coach Directive',
    source: 'Progressive Overload Blueprint',
    personality: 'coach',
  },
  {
    id: 'coach-2',
    text: 'The barbell doesn’t care about your mood. Focus on mechanics, bar path, and breathing.',
    author: 'Strength Protocol',
    source: 'Lifting Fundamentals',
    personality: 'coach',
  },
  {
    id: 'coach-3',
    text: 'Track every set. What gets measured gets managed, and what gets managed gets improved.',
    author: 'Performance Science',
    source: 'Volume Periodization',
    personality: 'coach',
  },
  {
    id: 'coach-4',
    text: 'Rest is not time off; it is the time your muscles rebuild stronger than the strain.',
    author: 'Hypertrophy Principle',
    source: 'Recovery Kinetics',
    personality: 'coach',
  },
  {
    id: 'coach-5',
    text: 'Control the eccentric phase. Gravity is not your training partner.',
    author: 'Biomechanical Standard',
    source: 'Tension & Form',
    personality: 'coach',
  },
];

export function getRandomQuote(personality?: 'marine' | 'stoic' | 'coach' | 'aurelia'): StoicQuote {
  const pool = personality
    ? STOIC_QUOTES.filter((q) => q.personality === personality)
    : STOIC_QUOTES;
  const list = pool.length > 0 ? pool : STOIC_QUOTES;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}
