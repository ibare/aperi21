/**
 * energy-in-collision 개념 선언.
 *
 * 충돌 다섯 중 유일하게 **견주는** 조각이다. 나머지 넷은 각자 한 경우 안에 머문다.
 *   energy-in-collision            세 반발 계수를 **나란히** — 길이는 언제나 눈금에
 *                                  닿고 넓이는 탄성에서만 다시 찬다
 *   elastic-collision              한 경우 안 — 속도가 통째로 옮겨 감
 *   inelastic-collision            한 경우 안 — 매번 같은 비율로 사라짐
 *   perfectly-inelastic-collision  한 경우 안 — 함께 가는 속력이 정해지는 방식
 *   two-dimensional-collision      한 경우 안 — 성분마다 따로 보존
 * 이쪽만 「무엇이 보존되는가」 라는 물음 · 길이 ↔ 넓이 · 세 줄 견줌 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const energyInCollisionConcept: Aperi21ConceptSource = {
  id: 'energy-in-collision',
  label: 'What a Collision Keeps and What It Does Not',
  canonicalSim: 'aperi21:energy-in-collision',

  surface: {
    definition:
      'Which quantity a collision leaves intact and which it does not: momentum arrives at the same mark whatever the bodies do, while kinetic energy comes back whole only for a perfect bounce.',
    exemplarKeywords: [
      'is kinetic energy conserved in a collision',
      'momentum is always conserved but energy is not',
      'elastic versus inelastic',
      'what is conserved in a collision',
      'comparing collision types side by side',
      'kinetic energy lost in a crash',
      'why momentum is the special one',
      'energy before and after the impact',
      'how much energy a collision costs you',
      'conserved quantities compared',
    ],
  },

  briefing: {
    observable: [
      'Three lanes run one above the other, and in each of them the same cart strikes the same standing cart at the same speed; the only thing that differs between the lanes is how bouncy the meeting is — fully bouncy, half, and not at all.',
      'Each lane carries a ledger on the right. The kinetic energy is a square whose side is that cart’s speed, so its area is the energy; the momentum is drawn as arrows laid along the square’s base, so a length is the momentum.',
      'The two arrows in a lane are laid so that one begins where the other ends, which makes their far end the total, and an accent mark stands where that total began.',
      'While the carts are squeezing together, the three lanes do exactly the same thing: both squares shrink to the same size, the area that has gone is filled in with hatching named as the share put into the squashing, and the joined arrow ends stay on the accent mark.',
      'While the carts push back apart, the lanes part company — the fully bouncy lane takes back all the hatching and one square fills its outline again, the middle lane takes back some, and the bottom lane takes back none.',
      'Afterwards the hatching clears and whatever was not given back stands as a dashed empty area named the lost share: none in the top lane, a band in the middle, half in the bottom.',
      'At every moment of all of this, the arrow ends of all three lanes stand on the same upright line.',
      'In the top lane the striking cart ends at a standstill and the struck one goes on alone; in the bottom lane the two travel on together.',
      'The names of the two readings are written once, on the top lane only — energy as the area, momentum as the length — and nothing on the screen carries a number.',
    ],

    screen: {
      affordances: [
        'The approach, the squeeze, the pushing back apart, the clearing of the hatching and the coasting run in order and then begin again; nothing has to be pressed.',
        'The three lanes run at the same time rather than one after another, so the sameness of the arrow ends is something looked at rather than remembered.',
        'The squeeze is slowed heavily, which lets the part where the three lanes agree and the moment they separate both be watched.',
        'The two quantities are drawn into one figure — a length along the base and an area above it — so that two arrangements with the same base can be seen to hold quite different areas.',
        'The accent colour is kept for the momentum mark alone, and the lanes are told apart by their names rather than by colour.',
        'The struck cart starts at rest and the masses are equal, so no arrow ever turns backward and the joined length never has to be read as a difference.',
      ],
    },

    useWhen: [
      'The reader has been told that momentum is always conserved and energy is not, and is carrying it as two unrelated rules. Three lanes in one figure let both be read off the same picture at the same instant.',
      'The article needs a reason why two quantities built from the same speeds behave so differently, and a case is wanted where the same base length is shown holding quite different areas.',
      'The reader believes an inelastic collision must lose momentum as well, and a case is wanted where the loss of area and the constancy of length happen in the same lane at the same moment.',
    ],

    avoidWhen: [
      'The article follows one ball bouncing on a floor over and over and is about how much each impact takes.',
      'The point is the speed that bodies which stick together go on at, and how it is fixed.',
      'The collision in the article is off-centre and the point is that the components hold separately. Everything here runs along straight lanes.',
      'The subject is an outside push, a wall, or where the boundary of the system lies. Nothing outside ever acts in these lanes.',
      'The bodies in the article begin at rest and fly apart.',
      'Values or percentages are wanted — how many joules went, what fraction was kept. Nothing is numbered.',
      'The question is what becomes of the lost energy physically — heat, sound, a bent panel. The empty area says how much, never where it went.',
    ],

    contrastWith: [
      {
        concept: 'elastic-collision',
        note: 'One sets three kinds of collision against each other to say which quantity survives each; the other stays inside one kind and follows what the speeds do there.',
      },
      {
        concept: 'inelastic-collision',
        note: 'One compares three degrees of bounciness at a single impact; the other follows one degree through many impacts and measures what each of them takes.',
      },
      {
        concept: 'perfectly-inelastic-collision',
        note: 'One asks what a collision keeps and what it costs; the other asks only what speed it leaves the joined bodies with, and says nothing about a cost.',
      },
      {
        concept: 'conservation-of-momentum',
        note: 'One holds the system closed throughout and asks which of two quantities survives; the other keeps to momentum alone and asks what would have to happen for even that to fail.',
      },
      {
        concept: 'ballistic-pendulum',
        note: 'Both separate momentum from energy, but along different cuts — one cuts by the kind of collision, the other by the stage of a single event.',
      },
    ],
  },
};
