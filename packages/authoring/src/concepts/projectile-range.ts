/**
 * projectile-range 개념 선언.
 *
 * 포물선 셋 중 **각도와 거리**가 이쪽 몫이다.
 *   projectile-range     쏘는 **각도**를 바꾸면 **닿는 거리**가 바뀐다. 격자로 재게 한다
 *   projectile-motion    앞으로의 빠르기는 **내려오는 일에 관여하지 않는다**
 *   trajectory-equation  시각을 지워도 **경로**는 남는다
 * 이쪽만 겨냥·발사·격자로 재기·중력이 다른 무대 어휘를 갖는다.
 *
 * `canonicalSim` 은 `aperi21:projectile` 이다 — topics.yaml 의 `sim` 값을 그대로
 * 쓴다. 개념 id 와 등록 키가 다른 자리다 (C4).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const projectileRangeConcept: Aperi21ConceptSource = {
  id: 'projectile-range',
  label: 'Range and Launch Angle',
  canonicalSim: 'aperi21:projectile',

  surface: {
    definition:
      'How far a launched body carries before coming back down, a distance set by the angle and speed it left with and by the gravity and air it flies through.',
    exemplarKeywords: [
      'range of a projectile',
      'launch angle and distance',
      'why forty five degrees goes furthest',
      'how far will it go if I throw it at this angle',
      'best angle to throw something',
      'complementary angles give the same range',
      'longer range on the Moon',
      'headwind and tailwind on a throw',
      'firing angle and distance to target',
      'range depends on launch speed',
    ],
  },

  briefing: {
    observable: [
      'A ball is launched from ground level and flies an arching path, its trail drawn behind it and fading at the tail, with a flash at the point where it comes down.',
      'A distance grid is laid over the picture, so where a launch lands is read off the ground rather than told.',
      'The launch angle is set on a dial that carries a single tick at forty five degrees.',
      'Fired steeply the ball goes high and comes down near; fired flat it stays low and also comes down near; fired at the tick it lands furthest out on the grid, so the comparison is made by firing one shot after another and reading each landing.',
      'On the Moon the same launch flies much further and stays up much longer; in free space with no gravity the ground line is not drawn at all and the ball simply leaves in a straight line and does not come back.',
      'With rain switched on the arch loses its symmetry — the descending half falls more steeply and lands shorter than the same launch in clear air.',
      'A headwind pulls the landing point back toward the launcher and a tailwind pushes it out, without changing how long the ball is in the air.',
      'A second view draws, from the flying ball, its forward and upward velocity arrows and the whole velocity they make up; the upward one shrinks to nothing at the peak and grows downward after it, while the forward one is unchanged in clear air.',
      'A third view puts three bars on one shared scale — kinetic, potential and lost — and they trade back and forth as the ball rises and falls, the lost bar growing only when the air is taking something.',
    ],

    screen: {
      affordances: [
        'An angle dial sets where the launcher points, from flat along the ground up to straight overhead, with a tick at forty five degrees.',
        'A pull-back launcher sets the launch speed and releases the ball, so each flight is a deliberate shot rather than a loop the reader watches.',
        'Three tabs move the whole scene between Earth, the Moon and free space, each naming the gravity it uses, and the same dial setting can be fired in all three.',
        'Three environment toggles, available on Earth, add rain, a headwind or a tailwind, and they can be switched on or off while the ball is in the air.',
        'Three further tabs swap between the bare flight, the flight with its velocity arrows split into forward and upward, and the flight with the energy bars.',
        'The grid gives the reader a ruler, so comparing two angles is done by firing each and reading where it landed.',
      ],
    },

    useWhen: [
      'The article asks which angle throws furthest and wants the answer found rather than quoted. Firing either side of the tick and reading the landings off the grid is that search.',
      'The claim is that range depends on the world flown through as much as on the launch — a throw on the Moon, a throw into wind, a throw through rain — and a case is wanted where the launch is held fixed and the world is switched under it.',
      'The reader needs to see a whole flight from launch to landing under their own control, with the launch speed and aim set by hand, rather than a single prepared launch replaying.',
    ],

    avoidWhen: [
      'The point is that the forward motion does not affect the descent, or that differently thrown bodies land at one moment. Only one ball flies here at a time and no two flights are on screen together.',
      'The subject is the path as a curve stripped of its timetable, or an equation relating across to up. The trail is drawn as a record of one flight and nothing is said about its form.',
      'The range, the maximum height or the time of flight are wanted as figures. They are deliberately left to be measured off the grid.',
      'The article is about free fall, about a body dropped from rest, or about a throw straight up. A launch here has a forward reach unless the dial is turned to the vertical.',
      'The reader is expected to take in the claim without acting. Nothing flies until the launcher is pulled.',
    ],

    contrastWith: [
      {
        concept: 'projectile-motion',
        note: 'One asks how far a launch carries and makes the aim the thing that decides it; the other asks whether the forward motion touches the descent at all and answers that it does not.',
      },
      {
        concept: 'trajectory-equation',
        note: 'One is about the endpoint of a flight and the launch conditions that place it; the other is about the whole curve between the ends, taken as something that survives when the clock is removed.',
      },
      {
        concept: 'gravitational-acceleration',
        note: 'One treats the strength of gravity as a setting of the world a flight happens in; the other treats it as the steady change of one velocity and never varies it.',
      },
      {
        concept: 'vector-decomposition',
        note: 'One is a flight whose reach is read off the ground; the other is the geometry by which a launch velocity becomes a forward part and an upward part in the first place.',
      },
    ],
  },
};
