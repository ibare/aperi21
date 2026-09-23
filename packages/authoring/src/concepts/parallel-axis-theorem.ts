/**
 * parallel-axis-theorem 개념 선언.
 *
 * 질량 분포 형제 셋 가운데 **축을 옮기는 쪽**이다 (`moment-of-inertia` 는 질량을,
 * `rolling-race` 는 모양을). 주어는 **축**이고, 주장은 **얹히는 조각 Md² 와 그것이
 * d 의 제곱으로 자란다**는 것 하나다. 뒤처짐은 그 조각의 결과일 뿐 주장이 아니라서
 * 「뒤처진다」 를 definition 에 두지 않았다 — 그 동사는 `moment-of-inertia` 것이다.
 * 이쪽만 I_cm + Md² · 질량 중심에서 벗어난 축 · 축이 도는 질량 중심 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const parallelAxisTheoremConcept: Aperi21ConceptSource = {
  id: 'parallel-axis-theorem',
  label: 'Parallel Axis Theorem',
  canonicalSim: 'aperi21:parallel-axis-theorem',

  surface: {
    definition:
      'What a body’s resistance to turning gains when the axis is moved off its centre of mass — an added piece growing as the square of the shift.',
    exemplarKeywords: [
      'parallel axis theorem',
      'I equals I of the centre of mass plus M d squared',
      'moving the pivot away from the centre of mass',
      'off-centre axis',
      'rotational inertia about a shifted axis',
      'why turning it about the end is harder than about the middle',
      'finding I about any parallel axis',
      'shifting the axis by a distance d',
      'the added M d squared term',
      'the centre of mass goes round the new axis',
    ],
  },

  briefing: {
    observable: [
      'Two identical discs of the same size and the same mass lie flat as if on a table, seen from above, and the same curved torque arrow is hung on each.',
      'The left disc turns about an axis through its own centre of mass; the right one turns about an axis set a distance d away from its centre of mass, with everything else about the two the same.',
      'Each disc carries a marker line and a sector of the same radius pinned to its own centre of mass, so the two swept angles stand side by side from the same starting direction: the left opens to nearly a full turn while the right reaches about a third of that.',
      'The right disc’s centre of mass travels round the shifted axis on a dotted circle of radius d, leaving an accent-coloured trail behind it as it goes.',
      'Two stacked bars stand at the right of the screen. Their lower blocks are the same height and are joined across by a dotted line; the right bar carries a hatched accent-coloured piece on top of that block, marked Md².',
      'The travelling centre of mass and the piece added to the bar are drawn in the same colour, so where the extra came from is said by the colour.',
      'When the turning stops, both discs are held at the angle they reached and the caption moves from the discs over to the bars.',
      'The discs are drawn hollow, in the same ink and with the same outline, so the sector beneath and the travelling centre of mass show through them.',
    ],

    screen: {
      affordances: [
        'One row of chips sets how far the right disc’s axis sits from its centre of mass: none at all, half the disc radius, or the full radius.',
        'Choosing one puts both discs back to rest and starts the turning again, so each choice is watched from the same beginning.',
        'Halving the shift leaves a quarter of the added piece rather than half of it, and with no shift at all the piece is gone and the two discs turn together — which is what makes the chips worth pressing rather than only watching.',
        'Left to itself the piece runs at the full shift, where the two swept angles stand at three to one.',
        'The bars carry no scale, so what they offer is a comparison of one stack with another rather than a reading.',
      ],
    },

    useWhen: [
      'The article has stated I = I_cm + Md² and the reader can use it but cannot see what the second term is. A bar that is plainly the first bar with a piece laid on top gives the sum a shape.',
      'The point being made is that the added term goes as the square of the shift, and the reader should be able to try a smaller shift and find the piece has fallen by more than expected.',
    ],

    avoidWhen: [
      'The body is hung from the shifted point and allowed to swing, and the period that follows is the subject. Both discs here are driven by a torque on a flat table, with no gravity in the picture at all.',
      'The mass within the body is being redistributed. Nothing about these two discs differs except where the axis is put.',
      'A number for I, or the arithmetic of adding the two terms, is what is wanted. Nothing is written but the mark on the added piece.',
      'The article needs a body whose centre of mass genuinely stays still while it spins. The whole point of the right disc is that its centre of mass is carried round a circle.',
      'Which of several bodies reaches the bottom of a slope first is the question. These two never leave the table.',
    ],

    contrastWith: [
      {
        concept: 'moment-of-inertia',
        note: 'One keeps the mass exactly where it is and moves the axis; the other keeps the axis where it is and moves the mass.',
      },
      {
        concept: 'torque',
        note: 'One holds the force the same and moves the axis; the other holds the axis the same and moves the force.',
      },
      {
        concept: 'rolling-race',
        note: 'One says how much resistance is added when the axis leaves the centre of mass; the other says nothing about the axis at all and compares shapes each turning about its own centre.',
      },
    ],
  },
};
