/**
 * electromagnetic-wave 개념 선언.
 *
 * 전자기파 다섯 가운데 이쪽은 **원천에서 떨어져 나감**이다 — 전하가 멈춰도 이미 끊겨 나간
 * 고리 묶음은 전하 없이 계속 간다.
 *   electromagnetic-wave  **떨어져 나감** — 원천이 화면에 있고, 멈추면 둘레가 빈다
 *   maxwells-equations    **사슬** — 원천이 아예 없고 고리가 고리를 낳는다
 *   antenna-radiation     **방향** — 같은 거리에서 옆과 축을 견준다
 *   poynting-vector       **길** · radiation-pressure  **밀기**
 * 이쪽만 「멈췄는데도 · 빈 영역이 넓어진다 · 선이 끊겨 나간다」 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const electromagneticWaveConcept: Aperi21ConceptSource = {
  id: 'electromagnetic-wave',
  label: 'Field That Leaves Its Charge Behind',
  canonicalSim: 'aperi21:electromagnetic-wave',

  surface: {
    definition:
      'That the lines hung on a shaken charge bulge, pinch off into closed rings and travel away, so that when the shaking stops an emptiness spreads while the rings already loose keep going.',
    exemplarKeywords: [
      'electromagnetic wave',
      'what becomes of the field when the charge stops shaking',
      'the wave carries on without its source',
      'field lines detaching from an antenna',
      'radiation leaving a shaken charge',
      'electric and magnetic fields travelling together',
      'does the field vanish when the source is switched off',
      'closed loops of field breaking away',
      'light keeps travelling after the lamp has gone out',
      'the near field and the part that gets away',
    ],
  },

  briefing: {
    observable: [
      'An antenna stands at the left edge with two marked charges running up and down on it.',
      'While they shake, the lines hanging from the charge swell outward, neck in at the middle, and break off into closed rings that travel to the right.',
      'The magnetic field is shown at the same places by ringed-dot and crossed marks whose size rises and falls together with the crowding of the lines, so the two are strong in the same places.',
      'When the shaking stops, the region around the charge empties out, and the empty region goes on widening.',
      'Beyond it the rings that had already broken free travel on to the right with not a single line joining them to the antenna.',
      'The shaking starts again and small rings form round the charge while the rings sent out earlier are far away at the right.',
      'The two charges are the only things picked out in colour; the lines are in plain ink and the magnetic marks in a lighter grey.',
      'There is no grid, no axis, no number, and no arrowhead anywhere on the lines.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; a few shakes and a rest come round every several seconds, and the line of text beneath changes exactly when the shaking does.',
        'The lines are worked out from the field of the shaking charge rather than drawn as decoration, so the necking and pinching off is a result and not an illustration.',
        'The emptiness that follows the stop widens at the same speed the rings travel, so “the source stopped” and “the rings ran on” are seen in one image.',
        'How crowded the lines are is what says where the field is strong; nothing is numbered and no scale is offered.',
        'Only one side of the antenna’s pattern is shown, the pattern being symmetrical about its axis, which leaves the width of the screen for the travelling.',
        'Where the two kinds of field sit is the same place, which is what lets them be seen rising and falling together rather than one after the other.',
      ],
    },

    useWhen: [
      'The article has said that an electromagnetic wave needs no medium and keeps going by itself, and the reader quietly doubts that anything survives the source being switched off. Watching the region round the charge go empty while the rings ahead travel on is what settles that doubt.',
      'The prose is introducing radiation from an antenna and wants the reader to see the moment at which a field stops belonging to the charge that made it.',
    ],

    avoidWhen: [
      'The article is about which way an antenna sends most strongly, or about a pattern with lobes. Only one side is drawn here and no two directions are compared.',
      'The picture wanted is two curves at right angles, or wavelength, frequency, amplitude or a speed are to be read off. Nothing here is a curve and nothing carries a number.',
      'The subject is the energy the wave delivers, what it pushes, or what happens where it lands. Nothing stands in its path.',
      'The article is about polarization, or about the plane in which the field lies.',
      'The coupling itself is at issue — one field making the other, law by law. Here the two are seen swelling in the same places, and neither is shown making the other.',
      'The reader is meant to start and stop the shaking themselves. The shakes and the rests go by on their own.',
    ],

    contrastWith: [
      {
        concept: 'maxwells-equations',
        note: 'One keeps the source in the picture so that the field can be seen parting from it; the other clears every source away and asks what keeps the field going afterwards.',
      },
      {
        concept: 'antenna-radiation',
        note: 'One shows a single side and asks only whether the field survives its source; the other compares direction against direction and finds two of them empty.',
      },
      {
        concept: 'transverse-wave',
        note: 'One is a field coming loose from what made it, with no medium anywhere; the other is about the right angle between the shaking and the travelling within a medium.',
      },
      {
        concept: 'poynting-vector',
        note: 'One follows the field itself as it leaves; the other draws no wave at all and follows where the energy of a steady circuit passes.',
      },
    ],
  },
};
