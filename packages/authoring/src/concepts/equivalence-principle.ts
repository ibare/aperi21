/**
 * equivalence-principle 개념 선언.
 *
 * 중력 넷 중 하나. **무엇을 주장하는가**로 갈랐다.
 *   equivalence-principle      상자 안에서 가속인지 중력인지 **가릴 수 없다** — 아무 차이도 없다
 *   gravitational-time-dilation 높이가 다른 두 **시계**의 빠르기가 다르다 — 차이가 있다
 *   gravitational-redshift     우물을 올라온 **빛의 파장**이 늘어난다
 *   light-bending-by-gravity   질량 곁을 지나는 빛의 **경로**가 휘어 별이 비껴 보인다
 * 이쪽만 「창 없는 상자 · 안에서 · 가릴 수 없다 · 같은 낙하 · 엘리베이터」 어휘를 갖는다.
 * 시계 · 파장 · 각 · 별빛은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const equivalencePrincipleConcept: Aperi21ConceptSource = {
  id: 'equivalence-principle',
  label: 'Acceleration Indistinguishable from Gravity Inside a Sealed Box',
  canonicalSim: 'aperi21:equivalence-principle',

  surface: {
    definition:
      'That nothing done inside a windowless box can tell standing still in gravity from accelerating steadily through empty space, because a ball let go behaves in exactly the same way in both.',
    exemplarKeywords: [
      'equivalence principle',
      'accelerating elevator compared with standing on Earth',
      'can you tell gravity from acceleration in a sealed room',
      'Einstein elevator thought experiment',
      'a rocket accelerating at nine point eight metres per second squared',
      'no experiment inside the box can tell which',
      'the floor comes up to meet the ball',
      'gravity and acceleration feel identical locally',
      'being pressed into the seat feels like weight',
      'the starting point of general relativity',
    ],
  },

  briefing: {
    observable: [
      'Two boxes stand side by side, drawn identically, each with a ball resting on a shelf inside; the left one floats among stars with an engine and a plume beneath it, the right one sits on a strip of ground.',
      'An upward arrow on the left and a downward arrow on the right are drawn to the same length and carry the same figure, nine point eight metres per second squared, so that the one number is visibly shared.',
      'Seen from outside, the two events are plainly different things: on the left the ball stays put among the stars and the box rises until its floor arrives at the ball, while on the right the box stands still and the ball falls.',
      'A ring is dropped inside each box at every equal interval, marking the height of the ball above its own floor, so the left-hand rings ride upward with the box.',
      'When the two boxes have come level, seven rings stand in each of them and the two sets are indistinguishable, opening out downward in the way a steady gain of speed does.',
      'The windows are then covered: stars, plume, ground, arrows and the names of the boxes all go away, a question mark appears over each box, and the balls return to their shelves.',
      'With the outside hidden the two boxes are drawn alike and both balls fall, staying level with one another to within nothing at all, and the rings they leave are the same in both.',
      'The windows open again, the left box settles back to where it started and fires its plume, the right one is on the ground, and the whole thing starts over.',
      'No height, no time and no speed is written anywhere; the two boxes are told apart only by what is outside them, never by their own colour or size.',
    ],

    screen: {
      affordances: [
        'The outside view, the covering of the windows, the inside view and the reopening run through in order and repeat; nothing has to be pressed.',
        'The two boxes are set side by side rather than shown one after the other, so the sameness is something the eye checks instead of something the memory is asked to hold.',
        'While the windows are covered the left box is not moved at all, because the picture then belongs to somebody inside it, for whom the box is always where it was.',
        'One figure feeds both arrows, so the two cannot be given different strengths — that they are equal is the condition the claim is made under.',
        'The fall is drawn far slower than a real one, since at real speed there would be no time to see the spacing between the rings.',
        'The balls and the rings are the same colour and the same shape in both boxes, because they are meant to be the same thing; the sides are separated by stars against ground and plume against nothing.',
      ],
    },

    useWhen: [
      'The article needs the step from which the rest of the argument is taken — a reader who accepts that the sealed box cannot tell the two apart will go on to accept what is derived from it. The covered windows and the two identical falls are what that acceptance rests on.',
      'The reader objects that surely something inside would give it away. The point to write against is that the outside view shows two visibly different events, and the inside view shows one, so the difference lives entirely outside the box.',
    ],

    avoidWhen: [
      'The subject is clocks, light, wavelength or any measured difference produced by gravity. Nothing here is measured; the whole finding is that two pictures are the same.',
      'The article is about weightlessness, free fall in orbit, or a scale reading zero. In both of these boxes the floor pushes and a released ball reaches it.',
      'The point is that the equality only holds over a small region, or that tides and converging directions would eventually give it away. The boxes are drawn small and no such effect appears.',
      'The article turns on two ways of measuring mass agreeing with each other. No mass is written on anything and no weighing takes place.',
      'The subject is a force that has to be brought in to make an accelerating frame add up. No such force is drawn; the left box is described from outside, where nothing extra is needed.',
    ],

    contrastWith: [
      {
        concept: 'inertial-vs-gravitational-mass',
        note: 'One is the measured coincidence that two quite separate ways of weighing matter always agree; the other takes that coincidence as its premise and draws the stronger conclusion that the two situations cannot be told apart at all from inside.',
      },
      {
        concept: 'fictitious-force',
        note: 'One introduces a force so that an accelerating observer can balance the books; the other says the books balance so exactly on both sides that no experiment in the room can say which set of books is being kept.',
      },
      {
        concept: 'gravitational-time-dilation',
        note: 'One says the two situations are the same in every respect available inside the box; the other follows that sameness outward until it yields a real difference between two clocks held at different heights.',
      },
      {
        concept: 'light-bending-by-gravity',
        note: 'One is the premise, argued with a dropped ball; the other is a thing that premise obliges — that a ray, which has no weight to be pulled by, is nevertheless turned near a mass.',
      },
    ],
  },
};
