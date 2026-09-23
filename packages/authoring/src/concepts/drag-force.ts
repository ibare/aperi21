/**
 * drag-force 개념 선언.
 *
 * 형제는 `buoyant-force-as-force`. 둘 다 「유체가 물체에 주는 힘」이라 definition 이
 * 붙기 쉽다. **무엇이 그 힘을 정하는가**로 갈랐다.
 *   drag-force               유체 속을 **지나가는 빠르기** — 빨라질수록 가파르게 는다
 *   buoyant-force-as-force   유체에 **잠긴 부피** — 다 잠기면 더 깊이 가도 그대로다
 * 이쪽만 속도 · 1차/2차 몫 어휘를 갖고, 저쪽만 잠김 · 떠받침 어휘를 갖는다.
 *
 * 조작기가 없다. affordances 에 「조작이 없다」 가 아니라 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const dragForceConcept: Aperi21ConceptSource = {
  id: 'drag-force',
  label: 'Drag Force',
  canonicalSim: 'aperi21:drag-force',

  surface: {
    definition:
      'The resistance a fluid puts on a body travelling through it, made of one part that grows with speed and another that grows with speed squared, the second steepening as the body goes faster.',
    exemplarKeywords: [
      'drag force',
      'air resistance',
      'why does drag grow so fast when you speed up',
      'linear and quadratic drag',
      'resistance proportional to v and to v squared',
      'a cyclist fighting the air',
      'resistance of water on a swimmer',
      'two parts of the drag on a moving body',
      'harder and harder to go faster',
      'drag coefficient of speed squared',
    ],
  },

  briefing: {
    observable: [
      'A ball is pushed along a level line by a force that never changes, and it leaves a ring behind it every quarter second — the rings spread further apart as it picks up speed.',
      'A dashed line is drawn across at the height that stands for the push, so every later bar can be read against it.',
      'At each ring stands a bar for the drag at that moment, cut into two blocks: a solid lower block and a hatched upper block, each named once beside the most recent bar.',
      'The solid block is the part that grows with speed, the hatched block the part that grows with speed squared.',
      'Early on the solid block is the taller of the two; the hatched block catches it, passes it, and then runs away from it.',
      'The run stops once the hatched block is one and three quarter times the solid one, holds that picture for about a second, and starts over.',
      'At that stopping moment the whole bar is still well short of the dashed line that stands for the push.',
      'The caption changes at the speed where the two blocks are the same height — before it, that most of the drag goes with speed; after it, that the speed-squared part is swelling steeply.',
    ],

    screen: {
      affordances: [
        'The run is already under way when the screen arrives — half a second of it is played out before the first frame — and it repeats without being asked.',
        'Both parts of the drag share one bar and one scale with the push arrow, so a block can be read against the other block and against the push in the same look.',
        'Speed is carried by the spacing of the rings and force by the height of the bars, which is what stands in for axes here.',
      ],
    },

    useWhen: [
      'The article has said that drag has a term in the speed and a term in the speed squared, and the reader is holding that as two symbols in one formula. A bar that splits into two blocks, with the second climbing past the first, turns the two terms into two things happening.',
      'The claim is that going twice as fast costs far more than twice the resistance, and a case is wanted where the steepening can be watched rather than computed.',
    ],

    avoidWhen: [
      'The point is that a falling body stops speeding up once the resistance matches what pulls it. The run here is cut off long before the bar reaches the dashed push line, and nothing here falls.',
      'The subject is a body held up or made lighter by a fluid it sits in. Nothing is submerged and the weight of the ball plays no part.',
      'The article turns on the shape of a path through the air — a thrown ball falling short, a curving trajectory. The ball travels along one level line.',
      'Values are wanted: a coefficient, a speed, a force in newtons. Not one number is written.',
    ],

    contrastWith: [
      {
        concept: 'buoyant-force-as-force',
        note: 'One is a force that exists only because the body is moving and is set by how fast; the other is a force set by how much of the body the fluid has closed around, and it is there whether the body moves or not.',
      },
      {
        concept: 'free-fall',
        note: 'One says a fall with nothing opposing it comes out the same for every weight; the other is about the thing that opposes, and about how sharply it grows once a body is quick.',
      },
      {
        concept: 'kinetic-friction',
        note: 'Both oppose a body that is already moving, but one grows with the speed and grows the faster the quicker the body goes, while the other comes out the same size at any speed.',
      },
    ],
  },
};
