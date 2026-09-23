/**
 * terminal-velocity 개념 선언.
 *
 * 연직 형제 중 이쪽만 **저항**을 갖는다. 주어는 균형이다 —
 *   terminal-velocity  두 힘이 맞서다 같아지고, 그 뒤로는 빨라지지 않는다
 *   vertical-throw     저항 없는 비행의 두 반쪽이 맞물린다
 *   free-fall          무게가 달라도 같이 떨어진다 (저항이 없으므로)
 * 저항·균형·낙하산·자국 간격이 평평해짐이 이쪽 어휘이고, 대칭·무게 견줌은 아니다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const terminalVelocityConcept: Aperi21ConceptSource = {
  id: 'terminal-velocity',
  label: 'Terminal Velocity',
  canonicalSim: 'aperi21:terminal-velocity',

  surface: {
    definition:
      'The speed a falling body stops rising above, reached when the resistance that grows with speed has grown until it matches gravity and there is nothing left over to speed it up.',
    exemplarKeywords: [
      'terminal velocity',
      'skydiver stops accelerating',
      'air resistance balances gravity',
      'drag grows with speed',
      'why does a falling object stop speeding up',
      'parachute and steady descent',
      'raindrop falling at a constant speed',
      'net force becomes zero while still falling',
      'balance of two forces during a fall',
      'falling with resistance rather than in a vacuum',
    ],
  },

  briefing: {
    observable: [
      'A body falls down the middle of the picture, with two arrows drawn from it on the same scale: one pointing down for gravity, which never changes length, and one pointing up for resistance, which starts at nothing.',
      'As the fall goes on the upward arrow lengthens, and it lengthens fastest while the body is gaining speed quickest.',
      'The two arrows end up the same length pointing opposite ways, and nothing is recoloured or announced when they do — the balance is read off the arrows themselves.',
      'The fall leaves a mark at a fixed interval of time, and the marks build a ladder down the picture.',
      'The rungs start close together and spread apart, and then stop spreading: below a certain point the ladder is evenly spaced the rest of the way down.',
      'A line beside the ladder names the interval at which the marks are laid, so the even spacing can be read as an unchanging speed rather than as a pattern.',
      'The caption changes as the fall proceeds — it has just begun and there is almost no resistance; the faster it goes the more resistance grows and the gaps are still widening; resistance has caught gravity and the gaps widen no further.',
      'The body is held briefly at the bottom and the fall starts over.',
    ],

    screen: {
      affordances: [
        'A slider on the lower left sets the strength of the resistance, in steps, and holding it restarts the fall from the top with the new strength.',
        'At every strength the resistance arrow catches the gravity arrow and the rungs flatten; what changes is how far down the picture that happens and how wide the flattened gaps are, so the claim can be tried rather than taken.',
        'Turning the resistance down to its weakest still ends in a flattening, only later and at a wider spacing.',
        'Left alone the fall runs, is caught at the bottom and repeats, so the whole argument is made without touching anything.',
      ],
    },

    useWhen: [
      'The reader has accepted that things fall faster and faster and has to be shown why a real fall does not. The moment the two arrows come level while the rungs stop spreading is the pair of facts to write against.',
      'The article claims that a steady speed can mean forces balanced rather than no force at all, and needs a case where both forces are visibly large while nothing accelerates.',
    ],

    avoidWhen: [
      'The point is that all bodies fall alike or that weight cancels. One body falls and nothing is compared with it.',
      'The subject is a body thrown upward, or the matching of a rise against a fall. The motion here only goes down.',
      'Values are wanted — the terminal speed, the mass, the drag coefficient, how long it takes. Only the setting of the resistance slider appears as a number, and it stands for nothing physical.',
      'The article is about how resistance depends on shape, area or the medium. Only its overall strength can be set here, in unnamed steps.',
      'The claim is that the acceleration is constant or that equal intervals bring equal gains of velocity. This fall is the case where that stops being true.',
    ],

    contrastWith: [
      {
        concept: 'free-fall',
        note: 'One is the fall with nothing in the way, where what a body weighs makes no difference; the other is the fall that meets resistance, where a speed is settled on and the body carries on at it.',
      },
      {
        concept: 'vertical-throw',
        note: 'One takes a resisted fall and asks what speed it ends at; the other takes an unresisted flight and asks whether the two halves repeat each other, an equality that resistance would destroy.',
      },
      {
        concept: 'uniformly-accelerated-motion',
        note: 'One is the motion whose successive stretches grow by the same fixed extra amount; the other is where that growth is eaten away until the stretches come out equal.',
      },
      {
        concept: 'direction-of-acceleration',
        note: 'One turns on which way the acceleration points relative to the velocity; the other on two opposing influences reaching the same size, so that there is no acceleration left to point anywhere.',
      },
    ],
  },
};
