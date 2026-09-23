/**
 * equilibrium-of-forces 개념 선언.
 *
 * 균형 셋(`equilibrium-of-forces` · `balance-scale` · `atwood-machine`)이 이 묶음의
 * 두 번째 위험한 짝이다. **무엇이 균형을 판정하는가**로 갈랐다.
 *   equilibrium-of-forces  **한 점**에 걸린 화살표가 끝과 끝으로 이어 닫히는가
 *   balance-scale          **받침점에서의 거리 × 무게**가 양쪽에서 맞는가
 *   atwood-machine         균형이 아니라 **깨진 몫이 정하는 가속도**가 얼마인가
 * 이쪽만 벡터 다각형 · 매듭 · 틈 어휘를 갖는다. 돌림 · 팔 길이 어휘는 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const equilibriumOfForcesConcept: Aperi21ConceptSource = {
  id: 'equilibrium-of-forces',
  label: 'Equilibrium of Forces',
  canonicalSim: 'aperi21:equilibrium-of-forces',

  surface: {
    definition:
      'The condition of a point held still by several pulls at once, standing exactly where the arrows for those pulls, laid end to end, close into a shape with no gap left over.',
    exemplarKeywords: [
      'equilibrium of forces',
      'balanced forces at a point',
      'zero net force',
      'why does the knot stay exactly there',
      'three ropes pulling on one knot',
      'the force triangle closes',
      'vector sum of the forces is zero',
      'adding forces head to tail',
      'forces that cancel each other out',
      'resultant of three pulls on a point',
    ],
  },

  briefing: {
    observable: [
      'A knot is held by three ropes: two run up over pulleys at the ceiling to hanging stacks of identical blocks, and one hangs straight down from the knot to a third stack.',
      'The three pulls are drawn as arrows leaving the knot, and the same three are laid end to end beside them into a shape.',
      'Whenever that shape closes, the knot stands still, and the caption says the arrows have closed.',
      'Every six seconds a block is added to or taken off the left stack; the shape springs open at a gap and the knot is drawn across until it closes again.',
      'While the shape is open, one arrow in the accent colour marks the gap and another marks the pull the knot is left with.',
      'Tick marks count blocks along each arrow, so an arrow is measured in the same units as the stacks it comes from.',
      'With three, four and five blocks the shape closes as a three-four-five triangle; with four, four and five it closes as a different triangle, and the knot has come to rest in a different place.',
      'Arriving, the gap is already open and the knot on its way across.',
    ],

    screen: {
      affordances: [
        'The knot can be taken by a ring handle and dragged anywhere within its range; while it is held, the arrows stand open and the caption says how far it has been pulled out of place.',
        'Let go, the knot is drawn back to the place where the shape closes and settles there without swinging past it.',
        'The number of blocks on the left changes of its own accord, so two different closing places come round without anything being asked for.',
        'The gap arrow and the net-pull arrow appear on exactly the same test the caption uses, so what is drawn and what is said are one judgement.',
      ],
    },

    useWhen: [
      'The reader has been given "the forces add to zero" and is holding it as arithmetic. A shape that visibly closes, and a knot that stops moving at the same instant, is what makes the sum into a picture.',
      'The claim is that equilibrium fixes a place rather than merely describing one, and the moment wanted is the one where a block is added and the knot has to go somewhere else to close again.',
    ],

    avoidWhen: [
      'The tensions themselves are the subject — how large each rope pull is, how a rope carries a pull along its length. Here the pulls are counted in blocks and no number is written.',
      'The article is about turning, tipping or balancing on a pivot. Everything here happens at a single point and nothing rotates.',
      'The body in question is moving steadily rather than sitting still. The knot either holds its place or is on its way to a place where it will.',
      'Friction, a surface pushing back, or a body on a slope is what the forces are about. The only pulls here come along three ropes.',
    ],

    contrastWith: [
      {
        concept: 'balance-scale',
        note: 'One asks where a point must sit for the pulls on it to cancel; the other asks how far out along a beam a weight must sit for the turning effects to cancel — the same word, balance, asked of a point and of a beam.',
      },
      {
        concept: 'atwood-machine',
        note: 'One shows the arrangement that holds still and what it takes to close; the other lets an arrangement stay unclosed on purpose and asks what the leftover then sets — not a resting place but a rate of speeding up.',
      },
      {
        concept: 'uniform-motion',
        note: 'One says forces adding to nothing leaves a body exactly where it is; the other says the same nothing equally permits a body to keep going as it was.',
      },
      {
        concept: 'net-force',
        note: 'One asks what arrangement leaves no remainder at all, so that the closing is itself the claim; the other takes a remainder as given and says the body follows it rather than the strongest pull among them.',
      },
    ],
  },
};
