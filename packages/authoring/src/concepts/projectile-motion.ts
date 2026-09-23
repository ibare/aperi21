/**
 * projectile-motion 개념 선언.
 *
 * 포물선 셋 중 **주어**로 갈랐다.
 *   projectile-motion    **두 성분의 독립** — 앞으로 얼마나 빨랐든 셋이 나란히 내려와 한꺼번에 닿는다
 *   projectile-range     **각도와 사거리** — 얼마나 멀리 가느냐가 각도에 달렸다
 *   trajectory-equation  **경로 자체** — 시각 딱지를 지워도 곡선은 남는다
 * 이쪽만 동시 착지·수평선·「빠를수록 오래 떠 있다」 반론 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const projectileMotionConcept: Aperi21ConceptSource = {
  id: 'projectile-motion',
  label: 'Independence of Projectile Components',
  canonicalSim: 'aperi21:projectile-motion',

  surface: {
    definition:
      'The fact that how fast a body is sent forward makes no difference to how it descends, so that bodies launched forward at different speeds stay level with one another and land at one moment.',
    exemplarKeywords: [
      'independence of horizontal and vertical motion',
      'a bullet fired and a bullet dropped land together',
      'does throwing it harder keep it in the air longer',
      'horizontal motion does not affect the fall',
      'projectile components are independent',
      'two balls launched at different speeds land at the same time',
      'falling while moving forward',
      'why the fall time does not depend on the throw',
      'gravity acts only downward',
      'thrown horizontally off a table',
    ],
  },

  briefing: {
    observable: [
      'Three balls leave the same point at the same instant along a level ground line, one simply dropped and the others sent forward at different speeds.',
      'A line in the accent colour is drawn through all three at every moment, and it comes down the picture staying horizontal — the three are always at the same height.',
      'Each ball leaves a trail of dots behind it, so the three curves are visible at once: one straight down and two increasingly stretched forward.',
      'Every time the fall passes a marked instant, a faint horizontal rung is left across the picture at the height the three shared then, and the rungs build a ladder.',
      'The rungs are close together near the top and further apart lower down — the three fall faster and faster, and they do it together.',
      'All three reach the ground in the same instant and a ripple spreads from each landing point at once.',
      'While the balls are in the air the caption says that the line through the three stays level as they fall; on landing it says that all three landed together and the only difference is the distance forward.',
      'The whole launch replays with whatever forward speed was last chosen.',
    ],

    screen: {
      affordances: [
        'A slider on the lower right sets the forward throwing speed, and the two thrown balls respond to it at once while the dropped one is unaffected.',
        'The slider reaches down to zero, where all three balls fall along one line on top of each other, and up to a speed that stretches the far ball right across the picture; the landing is simultaneous at every setting.',
        'The control touches only the forward motion, so what the reader can change is exactly what the claim says makes no difference.',
        'While the slider is held the ladder of past rungs is cleared, so no rung is left standing that belongs to a speed no longer in use.',
        'Left alone the launch, the fall and the landing run and repeat, so the argument finishes without the slider being touched.',
      ],
    },

    useWhen: [
      'The reader is carrying the intuition that a harder throw stays up longer. Turning the speed to the top and watching all three still touch down at once is what removes it.',
      'The article treats a projectile by working the two directions separately and needs the licence for that split shown rather than asserted — the level line through the three balls is that licence.',
      'The claim is that gravity acts only downward and therefore cannot be slowed by forward motion, and a case is wanted where forward motion is varied over its whole range while the descent is watched.',
    ],

    avoidWhen: [
      'The subject is launch angle or how far a throw carries. Everything here is launched horizontally and the forward distance is the incidental difference, not what is being argued.',
      'The point is the shape of the path, its equation, or the path as something separate from the timetable. Curves are drawn here only as the trails the three balls leave.',
      'The article is about air resistance or about a real thrown object slowing down. Nothing resists, which is why the three keep level exactly.',
      'Values are wanted — the fall time, the speeds, the distances. The only number on screen is the slider’s own setting.',
      'The argument turns on how the weight of a body affects its fall. The three balls differ in nothing but how fast they were sent forward.',
    ],

    contrastWith: [
      {
        concept: 'projectile-range',
        note: 'One says the forward motion makes no difference to the descent; the other says how the launch is aimed makes all the difference to how far the body carries.',
      },
      {
        concept: 'trajectory-equation',
        note: 'One is about the two directions going on untouched during a flight; the other is about what is left of that flight when the clock is taken away and only the curve remains.',
      },
      {
        concept: 'free-fall',
        note: 'One compares bodies differing in forward speed and finds the descent unchanged; the other compares bodies differing in weight and finds the same.',
      },
      {
        concept: 'vector-decomposition',
        note: 'One is the physical claim that what happens along each of two directions proceeds without regard to the other; the other is the geometry of splitting an arrow along two directions in the first place.',
      },
    ],
  },
};
