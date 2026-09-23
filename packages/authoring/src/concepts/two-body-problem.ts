/**
 * two-body-problem 개념 선언.
 *
 * 위험한 짝은 `lagrange-points` — 둘 다 천체가 둘이다. **주어를 갈랐다.**
 *   two-body-problem  주어는 **두 천체 자신** — 둘 다 질량 중심 둘레를 돌고 반지름이 질량에 반비례한다
 *   lagrange-points   주어는 **셋째 물체** — 두 천체가 만든 지형의 다섯 자리에 놓이면 머무는가
 * 이쪽만 질량비 · 반지름의 반비례 · 흔들림 어휘를 갖고, 평형점 · 함께 도는 틀 · 안장은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const twoBodyProblemConcept: Aperi21ConceptSource = {
  id: 'two-body-problem',
  label: 'Two Bodies About Their Common Centre',
  canonicalSim: 'aperi21:two-body-problem',

  surface: {
    definition:
      'Neither of two bound bodies stays put: both circle one shared centre in the same time, on opposite sides, with circles whose sizes go inversely as their masses.',
    exemplarKeywords: [
      'two-body problem',
      'barycenter of two bodies',
      'does the Sun stay still while the planet orbits',
      'the Earth and Moon both move',
      'a star wobbles because of its planet',
      'm1 r1 equals m2 r2',
      'common centre of mass of a binary',
      'binary star pair going round each other',
      'the heavier body orbits too, just in a smaller circle',
      'centre of mass inside the larger body',
    ],
  },

  briefing: {
    observable: [
      'Two bodies sit on opposite sides of a marked point, and a dotted line drawn between them passes through that point at every moment of the motion.',
      'Each body travels its own circle around the marked point, and the two circles are drawn in full from the start so their sizes can be compared at a glance.',
      'The mass ratio is changed three times over the run — equal, then a few to one, then twelve to one — and the body that grows heavier also grows visibly larger.',
      'As one body takes on more mass its circle shrinks and the other’s circle widens by exactly as much, the two radii always adding to the same separation.',
      'Two lines of writing sit beside the picture, one giving the masses and one the radii, both listed heavier-side-first so that the numbers read in opposite orders — that reversal is the inverse proportion.',
      'At twelve to one the heavy body’s circle has become smaller than the body itself, and the marked point sits inside it while the body shuffles around that point.',
      'Neither body ever slows or speeds relative to the other as the ratio changes; the time for one lap stays the same throughout, because the total mass and the separation are held fixed.',
      'The cycle returns the masses to equal, and the two circles become the same size again.',
    ],

    screen: {
      affordances: [
        'The mass ratio moves through its three values on its own and then comes back; nothing has to be pressed and no value is chosen.',
        'The two bodies are drawn in the same colour and differ only in size, so mass is read from how large a body is rather than from a legend.',
        'The marked point is drawn on top of the bodies rather than behind them, which is what makes the twelve-to-one case readable as the centre having sunk inside the larger one.',
      ],
    },

    useWhen: [
      'The article has said that a planet orbits its star, or the Moon orbits the Earth, and the reader has taken the larger body to be fixed. Watching the heavy body’s circle shrink until the centre is inside it shows why that picture is an approximation rather than a fact.',
      'A binary pair or a star wobble is being described and the prose needs the geometric reason the two motions have the same period and opposite directions.',
    ],

    avoidWhen: [
      'The question is how a third, light object behaves in the field the pair makes, or where such an object could be parked. Nothing but the two bodies is present here.',
      'The article is about detecting a planet from the light or the spectrum of its star. No brightness curve, no spectrum and no line-of-sight motion is shown.',
      'The point is how the period depends on the separation or on the total mass. Both are deliberately held fixed here so that only the division of the circles changes.',
      'Forces are what the prose needs to name — that each body pulls the other equally and oppositely. No arrows are drawn on either body.',
      'Real distances or masses are wanted. Only bare ratios are written, and no unit appears.',
    ],

    contrastWith: [
      {
        concept: 'lagrange-points',
        note: 'One is about the two bound bodies themselves and how they divide the motion between them; the other takes that pair as given and asks where a third, negligible body could sit without drifting off.',
      },
      {
        concept: 'center-of-mass-motion',
        note: 'One shows the two bodies orbiting a centre that stays put; the other is the general statement that this centre keeps its own motion whatever the parts do among themselves.',
      },
      {
        concept: 'center-of-gravity',
        note: 'One locates a shared point two orbiting bodies turn about; the other locates the single point at which one extended object can be treated as hanging or balancing.',
      },
    ],
  },
};
