/**
 * gravitational-potential-energy 개념 선언.
 *
 * 퍼텐셜 셋이 붙기 쉽다. **저장되는 양이 무엇에 비례하는가**로 갈랐다.
 *   gravitational-potential-energy  **높이에 곧바로 비례** — 두 배 높이 → 두 배 깊이
 *   elastic-potential-energy        **누른 깊이의 제곱** — 두 배 눌림 → 네 배 높이
 *   potential-energy-curve          저장이 아니라 **곡선을 읽는 법** — 어디서 되돌아오나
 * 이쪽만 「들어 올린 만큼 담긴다 · 그만큼 일로 돌려준다」 어휘를 갖는다. 속력 비(√2)는
 * 말하지 않는다 — 에너지를 속력으로 읽게 하면 `kinetic-energy` 의 주장이 끼어든다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const gravitationalPotentialEnergyConcept: Aperi21ConceptSource = {
  id: 'gravitational-potential-energy',
  label: 'Gravitational Potential Energy',
  canonicalSim: 'aperi21:gravitational-potential-energy',

  surface: {
    definition:
      'Energy a body holds by being raised, stored in direct proportion to the height it was lifted through and handed back as that much work when it comes down.',
    exemplarKeywords: [
      'gravitational potential energy',
      'energy stored in height',
      'mgh',
      'potential energy of a raised object',
      'lifting something stores energy',
      'why does a heavier drop drive a pile deeper',
      'energy an object has because of its position',
      'twice the height stores twice as much',
      'a pile driver and the weight dropped on it',
      'giving back the energy put in by lifting',
    ],
  },

  briefing: {
    observable: [
      'Two identical weights hang from one beam above two identical stakes set in the same ground, drawn as a single cross-section.',
      'A coloured bar runs from the head of each stake up to the underside of its weight and lengthens as the weight is raised — both to a first height together, then only the right one on to twice that height.',
      'Both weights then hang still on their strings with the bars standing beside them: nothing on screen is moving and the bars are still there, which is what being stored in height looks like.',
      'They are released at the same instant; as each falls the bar shortens with it and a downward velocity arrow lengthens by the same amount.',
      'When a weight strikes its stake the same bar begins growing again, now downward past the head line, so a single unbroken bar crosses from what was put in to what is being given back.',
      'The stakes come to rest driven to two different depths in the same ground, and the right one is twice as deep as the left.',
      'The strings stay hanging to the point each weight was released from, and the height marks remain, so the ratio of heights above can be set against the ratio of depths below in one picture.',
      'Height symbols appear only once a weight has reached its height, and the depth symbols only once a stake has stopped, so nothing is labelled before it is true.',
      'Only symbols are written — h, 2h, d, 2d. No heights, depths or energies appear as numbers, and no grid is drawn.',
    ],

    screen: {
      affordances: [
        'The lifting, the hanging still, the release and the driving happen in order and then begin again, so the whole trade comes round without being asked for.',
        'The run opens midway through the lift, with both weights already rising.',
        'The falling stretch is played at a quarter speed so the shortening bar and the lengthening velocity arrow can be followed; the lifting and the driving run at ordinary pace.',
        'The two stakes stand side by side in the same ground so the resistance the earth offers is visibly the same for both.',
        'The accent colour is kept for the stored share alone — the bar above the line and the bar below it, because they are the same quantity.',
      ],
    },

    useWhen: [
      'The article has stated that lifting stores energy and the reader has no way to check the claim, because a raised object simply sits there. The bar standing beside a motionless weight, and then the same bar reappearing as driven depth, gives the store something to be seen as.',
      'A passage needs the proportion to height stated in a form the eye can measure, without the reader having to reason through a square root on the way.',
    ],

    avoidWhen: [
      'The subject is how fast something is going after falling, or how speed relates to drop. Speed is deliberately never compared between the two weights here; the comparison is made in driven depth.',
      'The store in question is a spring, a stretch or a squeeze. This one is made purely by raising a body, and nothing on screen is deformed.',
      'The point is that a drop can be traded back and forth between height and speed along a route, or that the route does not matter. Each weight here falls straight down once and stops.',
      'Friction, heat or energy going missing is the theme. The strike here is taken as handing everything over.',
      'The article distinguishes mass from weight, or discusses gravity varying from place to place. The two weights are identical and gravity never changes.',
      'Values are wanted — a height in metres, an energy in joules. Only ratios are written.',
    ],

    contrastWith: [
      {
        concept: 'elastic-potential-energy',
        note: 'Both are stores that can be handed back, but they fill at different rates — one rises in step with the height lifted, the other with the square of how far the spring was pushed in.',
      },
      {
        concept: 'conservation-of-mechanical-energy',
        note: 'One shows that the store is proportional to height and can be collected back as work; the other takes the store for granted and shows the total staying fixed while it turns into motion along a route.',
      },
      {
        concept: 'potential-energy-curve',
        note: 'One is a single store being filled and emptied; the other reads a whole landscape of stored energy at once to say where a body may go and where it must turn back.',
      },
      {
        concept: 'kinetic-energy',
        note: 'One is energy held because of where a body is, rising in proportion to height; the other is energy held because it is moving, rising with the square of the speed.',
      },
      {
        concept: 'conservative-force',
        note: 'One is the store gravity fills as a body is raised; the other is the reason such a store can exist at all — gravity’s work depending on the endpoints and not on the route between them.',
      },
    ],
  },
};
