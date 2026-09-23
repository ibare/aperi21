/**
 * relativistic-momentum 개념 선언.
 *
 * 이 묶음의 다른 상대론 조각은 `relativistic-doppler` 다. **누구에게 무슨 일이 나는가**로 갈랐다.
 *   relativistic-momentum  밀리는 **물체 자신**의 운동량과 속도 — c 앞에서 속도가 덜 는다
 *   relativistic-doppler   이미 달리는 광원이 **낸 빛** — 방향마다 색이 밀린다
 * 이쪽만 「한결같은 힘 · 계속 밀기 · 곡선이 치솟는다 · 고전 직선 · c 를 못 넘는다」 어휘를 갖는다.
 * 색 · 파장 · 시계 · 바늘은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const relativisticMomentumConcept: Aperi21ConceptSource = {
  id: 'relativistic-momentum',
  label: 'Momentum Diverging Near the Speed of Light',
  canonicalSim: 'aperi21:relativistic-momentum',

  surface: {
    definition:
      'Why an unending steady push never carries a body past the speed of light: momentum keeps piling up at the same even rate, while the speed each push buys shrinks toward nothing.',
    exemplarKeywords: [
      'relativistic momentum',
      'p equals gamma m v',
      'why can nothing be pushed past the speed of light',
      'momentum grows without limit while speed does not',
      'classical momentum mv breaks down at high speed',
      'an accelerator keeps pushing and the speed barely changes',
      'each equal push buys less and less speed',
      'the momentum curve rears up before the light limit',
      'speed approaches the limit and never arrives',
      'a steady force applied for a very long time',
    ],
  },

  briefing: {
    observable: [
      'One plate is drawn with speed running left to right and momentum running upward, and a dark dashed upright stands on it at the speed of light.',
      'A dark curve is the real relation between the two and a grey dashed straight line beside it is what the old rule would have given; a filled dot climbs the curve while a hollow grey dot sits on the straight line at exactly the same height.',
      'At first the two dots are on top of each other and the curve and the straight line lie together, and the caption says so.',
      'The two dots then part and a grey dashed segment joins them across the plate; the hollow one crosses the upright and keeps going until it leaves the plate altogether, after which the joining segment becomes an arrow pointing off the right-hand edge.',
      'A mark is left on the curve at every equal interval of time, with a short tick dropped onto each of the two edges of the plate at the place that mark stands over.',
      'Those ticks are the whole argument: the ones on the upward edge stay evenly spaced from first to last, while the ones along the speed edge bunch tighter and tighter as the upright is neared.',
      'The pushing stops and the picture is held: twelve marks stand in a nearly vertical file just short of the upright, and the filled dot has not reached it.',
      'No number is written for the current speed or the current momentum, and the upward edge carries no scale at all; the only figures on the plate are three speeds named as fractions of the light speed.',
    ],

    screen: {
      affordances: [
        'The push runs from start to finish and the whole thing begins again, with nothing to press; the three captions mark where the same unbroken push is being described differently, not where the force changes.',
        'The picture opens with the dot already climbing, so the reader arrives in the middle of the push rather than at rest.',
        'A single colour is reserved for one meaning only — the marks laid down at equal intervals and their ticks on the two edges — so that evenly spaced against bunched is the one comparison being offered.',
        'Real and classical are told apart by the drawing rather than by colour: solid against dashed, filled against hollow, and a name written beside each.',
        'The plate cuts the curve off at its upper edge, and the hollow dot is not parked at the right-hand edge once it has gone past — an arrow is drawn instead, because a position out there would be a made-up reading.',
      ],
    },

    useWhen: [
      'The article has asserted that the speed of light is a limit, and the reader wants to know what stops a long enough push from getting past it. The two files of ticks — even going up, crowding sideways — are the answer to write against.',
      'The reader needs to see that the old expression for momentum is not simply wrong but is the low-speed end of the right one, and that the two only part company when the speed gets large.',
    ],

    avoidWhen: [
      'The subject is a moving clock, a shortened length, or how a duration compares between two observers. There are no clocks, no rulers and no second observer here — only one plate relating momentum to speed.',
      'The article is about adding one speed to another and finding the total still short of the light speed. Nothing here is added to anything; a single body is pushed by a single force.',
      'The point is the energy of a fast body, or mass and energy being the same thing. No energy is drawn or named anywhere on the plate.',
      'The article needs an actual figure — a speed, a momentum, or the factor by which they differ from the old values. The only figures shown are three marked speeds; everything else is left to be read as a position.',
      'The subject is momentum being shared between bodies in a collision or a recoil. There is only one body here and nothing for it to meet.',
    ],

    contrastWith: [
      {
        concept: 'relativistic-doppler',
        note: 'One follows what a long push does to the body being pushed; the other leaves the body alone at a fixed speed and follows what its motion does to the light it sends out.',
      },
      {
        concept: 'impulse-momentum-theorem',
        note: 'One says a steady force piles momentum up at a constant rate, which stays true at any speed whatever; the other asks what that steadily piling momentum is worth in speed once the speed has grown large.',
      },
      {
        concept: 'kinetic-energy',
        note: 'One is a quantity that rises with the square of a speed and is spent in stopping; the other is a quantity that rises without bound while the speed it belongs to stalls at a ceiling.',
      },
    ],
  },
};
