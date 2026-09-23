/**
 * torricellis-law 개념 선언.
 *
 * 관 셋(`continuity-equation` · `bernoullis-principle` · `venturi-effect`)과 나뉘는 자리는
 * **나가는 물**이다. 관 셋은 안에 머무는 흐름을 다루고 이쪽은 **구멍으로 떠나는 속력**만
 * 주장한다 — 그 값을 정하는 것은 굵기도 압력계도 아니고 **구멍 위 물의 깊이** 하나다.
 * 이쪽만 「구멍 · 깊이 h · 물줄기 · 같은 순간 떠난 물방울」 어휘를 갖는다.
 * 도달 거리는 화면에 두지 않았다(프레이밍이 주장의 일부) — avoidWhen 으로 되돌린다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const torricellisLawConcept: Aperi21ConceptSource = {
  id: 'torricellis-law',
  label: 'Jet Speed Set by Depth Alone',
  canonicalSim: 'aperi21:torricellis-law',

  surface: {
    definition:
      'The speed at which liquid leaves a hole in a vessel, fixed by nothing but the depth of liquid standing above that hole — the very speed a body would gain falling the same way.',
    exemplarKeywords: [
      'Torricelli’s law',
      'v = sqrt(2gh)',
      'water jet from a hole in a tank',
      'how fast does water come out of a hole',
      'the lower hole squirts harder',
      'efflux speed',
      'punching holes at different heights in a bottle',
      'speed of water leaving a dam outlet',
      'head of water above an opening',
      'draining a container through an opening',
    ],
  },

  briefing: {
    observable: [
      'A tank stands in the picture with three holes punched through its right-hand wall at different heights, and water leaving all three at once.',
      'The surface is held at one level throughout, so each hole keeps the same depth of water over it for the whole of the round.',
      'Beside each hole a depth is written as `h` in metres, and next to it the speed the jet leaves with in metres per second — the deepest hole carries the largest of the three.',
      'The three jets arch outward and downward, the one from the lowest hole leaving flattest and reaching farthest out of the picture.',
      'Every so often one droplet is released from each hole in the very same instant and marked out from the rest, and the three are watched together.',
      'That flight is played far slower than it happens, over several seconds, because at true speed it is over before anything can be seen.',
      'While the three marked droplets travel, a clock in the top right counts the seconds since they left, climbing slowly through the slow stretch.',
      'At the end of the flight the three hang where they got to, the lowest one plainly farthest ahead of the others, all three having had the same time.',
      'The tank hangs in empty space: no floor, no basin, no ground is drawn under it, and the jets leave the frame rather than landing anywhere.',
    ],

    screen: {
      affordances: [
        'One round runs on its own and repeats — the marked droplets fly, hold at the head of their jets, and then the tank goes back to plain streaming.',
        'Arriving readers land in a tank already jetting from all three holes.',
        'Nothing is offered to press or drag: the slow replay is built into the round rather than waiting behind a button.',
        'The framing is part of the argument — cutting the picture off before anything can be landed on keeps the reader on how fast the water leaves rather than how far it gets.',
        'For the same reason there is no grid and no camera: a reader given the frame would widen it and restore the very question the picture declines to answer.',
        'The three holes differ in one thing only, their depth, and everything else about them is drawn alike.',
      ],
    },

    useWhen: [
      'The article has given the square-root formula for the escaping speed and the reader cannot see what "the depth above the hole" buys. Three holes in one wall, each with its depth and its speed written beside it, makes the dependence something to read off rather than to derive.',
      'The reader believes the jets differ but suspects the picture of exaggerating it. The three droplets that left together, with a clock running on them, is the part that settles which is ahead after the same time.',
    ],

    avoidWhen: [
      'The point is how far the jet lands, or which hole throws farthest along the ground. The picture is deliberately cut off above any landing and will not support that argument.',
      'The article is about a tank emptying — how the level falls, how long draining takes. The surface here is held at one height for the whole round.',
      'The subject is pressure in still liquid and how it grows with depth. Depth does the work here, but nothing in the picture is read as a pressure.',
      'The flow in question is through a pipe or past a constriction, where the fluid stays inside and its speed and pressure are traded along the way.',
      'The article needs the size of the hole, or what the opening’s shape does to the stream. All three holes here are the same and only their heights differ.',
    ],

    contrastWith: [
      {
        concept: 'hydrostatic-pressure',
        note: 'Both turn on depth, and the second is why the first works: one says how hard the liquid is pressed at a depth, the other says how fast it leaves when a hole is opened there.',
      },
      {
        concept: 'bernoullis-principle',
        note: 'One is the special case where the fluid leaves altogether and every bit of the pressure it had turns into speed; the other is the general trade, kept inside the tube and only partly spent.',
      },
      {
        concept: 'conservation-of-mechanical-energy',
        note: 'One asserts that the escaping liquid arrives at exactly the speed a body dropped through the same depth would have; the other is the rule from which that equality follows.',
      },
      {
        concept: 'continuity-equation',
        note: 'One is about liquid leaving a vessel at whatever speed the depth grants; the other is about a stream that must keep going and quickens because the passage tightens.',
      },
    ],
  },
};
