/**
 * work-energy-theorem 개념 선언.
 *
 * 위험한 형제가 둘이다. **비와 주어를 함께 갈랐다.**
 *   work-energy-theorem  주어는 **해 준 일** — 곱이 같으면 붙는 속력이 같다 (1:1)
 *   kinetic-energy       주어는 **이미 가진 속력** — 두 배면 네 배 (제곱)
 *   conservation-of-mechanical-energy  주어는 **낙차** — 밖에서 해 준 일이 없다
 * 이쪽만 「힘과 거리를 어떻게 나누든」 · 「같은 일 → 같은 끝 속력」 어휘를 갖는다.
 * 제곱 · 네 배는 말하지 않고, 높이 · 퍼텐셜도 말하지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const workEnergyTheoremConcept: Aperi21ConceptSource = {
  id: 'work-energy-theorem',
  label: 'Work-Energy Theorem',
  canonicalSim: 'aperi21:work-energy-theorem',

  surface: {
    definition:
      'The rule that the net work done on a body fixes the speed it ends up with, so that a large force over a short distance and a small force over a long one leave it moving alike.',
    exemplarKeywords: [
      'work-energy theorem',
      'net work equals the change in kinetic energy',
      'work done on an object gives it speed',
      'a big force over a short distance versus a small force over a long one',
      'does a stronger push always mean a faster object',
      'W equals delta KE',
      'same work same final speed',
      'how fast will the push leave it going',
      'force times distance and the speed it buys',
      'work put into a cart from rest',
    ],
  },

  briefing: {
    observable: [
      'Two identical carts start from rest on a frictionless floor, one on each of two lanes stacked one above the other, and are pushed from behind.',
      'The pushing arrow on the upper cart is twice the length of the one on the lower, marked 2F against F, and each arrow is drawn only while its cart is being pushed.',
      'Below the floor line of each lane a rectangle is outlined in advance: its height is the force and its length is the distance to be covered, so the upper one is tall and short and the lower one is low and long, labelled 2F × d and F × 2d.',
      'The rectangle fills in with colour exactly as far as its cart has been pushed, the filled edge staying directly below the cart.',
      'The velocity arrow on each cart lengthens while it is pushed, and at first the upper one grows faster, so an expectation that the stronger push wins appears to be confirmed.',
      'At the moment the upper cart has covered its distance, its pushing arrow disappears while the lower cart is still being pushed with a half-filled rectangle and a shorter velocity arrow.',
      'When the lower rectangle finishes filling, the two velocity arrows are the same length and the same symbol v is attached to both.',
      'Both carts then keep travelling with the gap between them unchanged, which shows the equality of speed a second time.',
      'Tick lines at the start, at d and at 2d run through both lanes so the two rectangles can be measured against one another, and only symbols are written — no forces, distances, speeds or energies as numbers.',
    ],

    screen: {
      affordances: [
        'The rest, the two pushes, the moment the speeds match and the travelling afterwards happen in order and then begin again.',
        'The outlined rectangle is drawn before the filling starts, so how far each cart will be pushed is known from the first moment and only the filling is in progress.',
        'The two rectangles share the horizontal axis of their carts, so how far a cart has been pushed and how much of its rectangle is filled read off one vertical line.',
        'The travelling after the pushes is played slowly so the unchanging gap stays on screen to the end of a run.',
        'The accent colour is kept for the filled work alone; the velocity arrows, the pushing arrows and the outlines each have their own.',
      ],
    },

    useWhen: [
      'The reader has been given the theorem as an equation and is quietly expecting the harder push to win. Watching the shorter, taller rectangle and the longer, lower one both finish and both leave the same speed behind settles the trade.',
      'A passage needs a case where the same outcome is reached by two different routes of force and distance, and where the equality is visible twice — once in the arrow lengths, once in the gap that stops changing.',
    ],

    avoidWhen: [
      'The point is how much energy a body already moving carries, or that doubling a speed does more than double it. Both carts here begin at rest and the comparison between them is one to one.',
      'The force in question changes as the body moves and the work has to be built up bit by bit. The two forces here are constant, and the rectangles are complete shapes known in advance.',
      'The subject is acceleration, or how much motion a given force produces per second. Nothing here is said about the rate at which speed is gained, only about the speed at the end.',
      'The energy involved is stored and later released — a height, a spring, a fall. There is no store here; the floor is level and the work comes from an outside push.',
      'Friction, heat or energy going missing is the theme. This floor is frictionless and nothing is lost.',
      'Values in joules are wanted, or the two works have to be computed and compared numerically. Only the symbols 2F × d and F × 2d are written.',
    ],

    contrastWith: [
      {
        concept: 'kinetic-energy',
        note: 'One says what the work put in buys, with force and distance freely traded; the other says how much a body already moving holds, and finds that quantity rising with the square of the speed.',
      },
      {
        concept: 'work-by-variable-force',
        note: 'One takes the work as a finished product and asks what it does; the other asks how the work is arrived at when the force refuses to stay the same.',
      },
      {
        concept: 'conservation-of-mechanical-energy',
        note: 'One is about work delivered from outside deciding the final speed; the other is about no outside work at all, where a drop already possessed is what turns into speed.',
      },
      {
        concept: 'newtons-second-law',
        note: 'One connects a force to the speed reached after a stated distance; the other connects the same force to how quickly the speed is changing at each moment.',
      },
      {
        concept: 'net-force',
        note: 'One assumes a single settled force and asks what its work amounts to; the other is about arriving at that single force from several at once.',
      },
    ],
  },
};
