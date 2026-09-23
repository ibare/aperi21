/**
 * ballistic-pendulum 개념 선언.
 *
 * 형제는 `perfectly-inelastic-collision` · `energy-in-collision` ·
 * `impulse-momentum-theorem`. **무엇을 묻는가**로 갈랐다.
 *   ballistic-pendulum             **단계마다 이어지는 양이 다르다** — 박힐 때는 운동량,
 *                                  오를 때는 에너지. 한 법칙으로 끝까지 가면 틀린다
 *   perfectly-inelastic-collision  붙어 함께 가는 **속력이 정해지는 방식** (첫 단계까지)
 *   energy-in-collision            **충돌 종류마다** 무엇이 남는가의 견줌 (한 단계 안)
 *   impulse-momentum-theorem       한 번의 밀기가 운동량을 얼마나 옮기는가
 * 이쪽만 탄알과 나무토막 · 두 단계 · 「왜 에너지 보존으로 처음부터 풀면 안 되는가」
 * 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const ballisticPendulumConcept: Aperi21ConceptSource = {
  id: 'ballistic-pendulum',
  label: 'Ballistic Pendulum — Two Stages, Two Rules',
  canonicalSim: 'aperi21:ballistic-pendulum',

  surface: {
    definition:
      'A measurement made in two stages that carry different quantities across — momentum through the embedding, energy through the swing — which is why one rule used throughout gives a wrong answer.',
    exemplarKeywords: [
      'ballistic pendulum',
      'a bullet embedded in a hanging block',
      'measuring the speed of a bullet',
      'why can’t I use energy conservation for the whole problem',
      'collision then swing',
      'the block swings up to a height',
      'momentum for the collision and energy for the rise',
      'the classic bullet and block problem',
      'working backwards from the height reached',
      'mixing up the two conservation laws',
    ],
  },

  briefing: {
    observable: [
      'A block hangs on two parallel cords so that it rises without tilting, and a bullet arrives from the left.',
      'Beside the pendulum two bars stand on one common base, one for momentum and one for energy, named beneath rather than coloured apart.',
      'While the bullet is burying itself in the block, the momentum bar’s top does not move at all, and the energy bar drops away to a small fraction of its height, leaving a dashed empty cell above it named as the share that went.',
      'While the block swings up, the energy bar keeps its height and the filling inside it turns over from solid to hatched as the block rises, and it is now the momentum bar that shrinks.',
      'An accent dashed mark rides on whichever bar is holding its height, and it moves from the momentum bar to the energy bar as the second stage begins — so the mark changing bars is the claim itself.',
      'At the top of the swing the block stops and the height it reached is measured once, as a single named length.',
      'By the end the energy bar is all hatching and the momentum bar is empty.',
      'Nothing on the screen carries a number.',
    ],

    screen: {
      affordances: [
        'One row of chips picks the block’s mass — under a kilogram, a little more, or heavier still — and picking one sends the bullet in again from the start.',
        'A heavier block makes the energy bar fall further and the block rise less, while the momentum bar reaches the same height at every choice, which is how the reader settles that the holding is not particular to one setting.',
        'The two bars share one colour because they are the same kind of thing — two quantities being tallied — and the accent colour is kept for whichever is holding its height right now.',
        'Within the energy bar the two parts are told apart by hatching rather than by colour, so they read as shares of one quantity rather than as two quantities.',
        'The height is measured only at the top and not throughout, so the rise is not read as a second story about growing numbers.',
        'The embedding is stretched over about two seconds while the block stays put, so the collapse of one bar and the steadiness of the other can be watched together.',
      ],
    },

    useWhen: [
      'The reader has been handed the two-stage recipe and is following it without seeing why it has to be two. The accent mark moving from one bar to the other is the reason, in the place where the switch happens.',
      'The article warns against carrying energy conservation through the collision, and a case is wanted where the reader can see how much of the energy would have to be smuggled in for that to work.',
      'The article needs the block’s mass to be varied so that the quantity which holds can be shown to hold every time.',
    ],

    avoidWhen: [
      'The article only needs bodies that stick and the speed they go on at. That happens here but is only the first of two stages, and the picture is built around the second.',
      'The article compares several degrees of bounciness to establish which quantity survives which kind of collision. There is one collision here, and it is always the same kind.',
      'The subject is the swing itself — how long it takes, its period, or simple harmonic motion.',
      'The subject is the force or the impulse during the embedding, or how long the bullet takes to stop.',
      'The numbers of the experiment are wanted — a bullet speed, a height in centimetres, masses to substitute. Nothing is numbered but the chips.',
      'The point is where the lost energy went, as heat or as a splintered block. Nothing is drawn leaving.',
    ],

    contrastWith: [
      {
        concept: 'perfectly-inelastic-collision',
        note: 'One ends once the two are travelling as one; the other takes that as its first stage and is about the second, where a different quantity is the one that carries.',
      },
      {
        concept: 'energy-in-collision',
        note: 'Both separate momentum from energy, but along different cuts — one asks which quantity survives which kind of collision, the other asks which quantity may be carried across which stage of one event.',
      },
      {
        concept: 'impulse-momentum-theorem',
        note: 'One is about a quantity that does not change while a push happens; the other is about exactly how much a push changes it.',
      },
      {
        concept: 'inelastic-collision',
        note: 'One uses the lost share only to explain why a rule must be swapped between stages; the other measures that share itself, and how the same fraction goes at every impact.',
      },
    ],
  },
};
