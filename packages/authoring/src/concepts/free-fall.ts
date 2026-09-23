/**
 * free-fall 개념 선언.
 *
 * 이 묶음의 형제는 `gravitational-acceleration` 이다. 둘 다 "중력만 받는 연직 운동"
 * 을 보이므로 definition 이 겹칠 위험이 크다. **주어를 갈랐다.**
 *   free-fall                   무게가 다른 두 물체의 **견줌** — 같이 떨어진다
 *   gravitational-acceleration  한 물체의 **속도 변화** — 0 인 순간에도 멈추지 않는다
 * 이쪽만 질량·무게 어휘를 갖고, 저쪽만 순간 속도·변화량 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const freeFallConcept: Aperi21ConceptSource = {
  id: 'free-fall',
  label: 'Free Fall',
  canonicalSim: 'aperi21:free-fall',

  surface: {
    definition:
      'Falling under gravity alone, where bodies released together from the same height reach the ground at the same moment however much their weights differ.',
    exemplarKeywords: [
      'free fall',
      'do heavier things fall faster',
      'dropping two objects of different weight',
      'hammer and feather on the Moon',
      'mass cancels out of the acceleration',
      'Galileo leaning tower',
      'falling at the same rate',
      'weight does not change the fall',
      'dropped from the same height',
      'gravity pulls everything the same way',
    ],
  },

  briefing: {
    observable: [
      'Two balls hang at the same height, one drawn solid and one drawn as an outline, with a weight written beside each — the outlined one is always 1 kg and the solid one carries the weight that was chosen.',
      'They are released together and stay level with each other the whole way down; a horizontal bar drawn across the pair makes the levelness something to look at rather than to trust.',
      'Rungs mark the ladder they fall through, and a ring is left behind on each column as the balls pass, so the two trails of rings stay side by side rung for rung.',
      'Both land in the same instant and the ground rings out under each of them at once.',
      'The closing line names the ratio that was chosen — at fifty kilograms it reads that the ball fifty times heavier reached the ground at the same moment.',
      'The rings space out as the fall goes on: the two fall together, and they also fall faster and faster.',
      'The whole drop replays on its own, and the weight chosen for the heavy ball carries into the next drop.',
    ],

    screen: {
      affordances: [
        'One row of chips picks the weight of the heavy ball — 2 kg, 10 kg, 50 kg, or a setting that cycles through the three on its own. The light ball stays at 1 kg.',
        'A weight picked while the balls are still being held takes effect at once; picked after they are released it waits for the next drop, so a drop is never rewritten halfway through.',
        'Nothing else is offered — there is no play, pause or step. The drop runs and repeats by itself.',
      ],
    },

    useWhen: [
      'The article has said that weight does not change how fast something falls, and the reader is likely to keep a doubt about heavy things. Turning the chip up to fifty kilograms and seeing the two land together is what settles it, and the closing line names the ratio so the prose can quote it.',
    ],

    avoidWhen: [
      'The article is about air resistance, about a feather against a stone, or about why a real falling object stops speeding up. Nothing here resists — the two balls fall in the same clean way at every weight.',
      'The subject is how the speed itself grows, or what the number nine point eight means. The fall here is watched as a pair; a single body and its changing velocity is a different screen.',
      'The article turns on the difference between mass and weight, or on gravity as a force that varies from place to place. The chips are labelled in kilograms and the strength of gravity never changes.',
      'The point is a body thrown upward, or one that leaves at an angle. Both balls are let go from rest and go straight down.',
    ],

    contrastWith: [
      {
        concept: 'gravitational-acceleration',
        note: 'One says the same fall happens whatever the body weighs; the other says what that fall does to the velocity — a change of the same size in every equal interval, which is why the two of them can be identical.',
      },
    ],
  },
};
