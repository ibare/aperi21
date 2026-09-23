/**
 * antenna-radiation 개념 선언.
 *
 * 전자기파 다섯 가운데 이쪽은 **방향마다 다르다**이다 — 옆으로 가장 세고 축으로는 0.
 *   antenna-radiation     **방향** — 같은 거리에서 옆과 축을 견준다(거리에 따른 옅어짐 없음)
 *   electromagnetic-wave  **떨어져 나감** — 한쪽만 보이고 멈춤을 묻는다
 *   maxwells-equations    **사슬** · poynting-vector  **길** · radiation-pressure  **밀기**
 * 이쪽만 「두 잎 · 축 방향이 비어 있다 · 어느 쪽이 센가」 어휘를 갖는다. 멀수록 약해지는
 * 것은 `inverse-square-law` 의 몫이라 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const antennaRadiationConcept: Aperi21ConceptSource = {
  id: 'antenna-radiation',
  label: 'Which Way an Antenna Sends',
  canonicalSim: 'aperi21:antenna-radiation',

  surface: {
    definition:
      'That an upright antenna sends most strongly out to its sides and sends nothing at all along its own axis, the ripples thinning to emptiness as the direction swings toward its ends.',
    exemplarKeywords: [
      'radiation pattern of an antenna',
      'a dipole sends nothing along its axis',
      'why an aerial has to be held the right way up',
      'radiation from an accelerating charge',
      'doughnut shaped radiation pattern',
      'sin squared theta',
      'where is a transmitter’s signal strongest',
      'the two lobes of a dipole',
      'an oscillating charge radiating',
      'no signal directly above the mast',
    ],
  },

  briefing: {
    observable: [
      'An upright antenna carries two charges that run up and down it in opposite senses.',
      'Each shake throws off a crest ring that widens outward from the antenna.',
      'A ring stays a circle, but its darkness varies round it — darkest out to left and right, paling toward the top and the bottom.',
      'Within a narrow wedge about the antenna’s axis, marked by a dotted line, the rings are broken and quite empty.',
      'A two-lobed outline then grows from the centre, reaching farthest toward the dark parts of the rings and pinching to nothing on the axis.',
      'The lobes and the rings are worked out from one and the same strength, so the outline cannot disagree with what the rings already showed.',
      'A newly made ring darkens over the width of one crest spacing instead of switching on beside the antenna.',
      'The rings do not pale as they widen; only direction changes how dark they are.',
      'The two charges are the only things picked out in colour, the rings are in one ink and the lobes in another.',
      'No angle, no scale and no number appears.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the ripples go on throughout while the lobes grow, hold, and begin again.',
        'Direction alone sets how dark a ring is, so a near ring and a far ring may be compared without allowing for how far each has gone.',
        'The dotted axis line is what makes the empty wedge read as a direction rather than as blank paper.',
        'Only crests are drawn, so the spacing between rings is the whole of what says how the wave advances.',
        'The antenna’s own line stays fixed, so the pattern is never seen turning and the empty wedge keeps one place on the screen.',
        'How strong a direction is shows as darkness and as the reach of a lobe, and never as a figure.',
      ],
    },

    useWhen: [
      'The article says that radiation from an oscillating charge is not the same in all directions, while the reader pictures it spreading evenly like light from a lamp. Rings that are genuinely broken along one line make the exception visible.',
      'The prose needs the doughnut-shaped pattern of a dipole understood before any formula for it: the outline grows out of the very ripples that were just watched, so the two cannot come apart.',
    ],

    avoidWhen: [
      'The article is about a signal weakening with distance, or an inverse square law. The rings here are shaded by direction alone and do not fade as they widen.',
      'The subject is whether a field survives its source being switched off, or a field parting from what made it. The charges here never stop shaking.',
      'The article needs the antenna turned, or a transmitter’s orientation set against a receiver’s.',
      'The strength in a given direction is wanted as a fraction or a value, or the pattern is to be measured off.',
      'The article is about how the two fields of a wave stand to each other, or about the fields at all. Only crests and their strength are drawn.',
      'What the radiation does on arrival is the point — being received, warming something, pushing something.',
    ],

    contrastWith: [
      {
        concept: 'electromagnetic-wave',
        note: 'One asks how much goes each way, with the charge shaking throughout; the other asks whether what has already gone is still there once the shaking stops.',
      },
      {
        concept: 'radiation-pressure',
        note: 'One follows radiation outward from what made it; the other waits at a surface and counts what the arriving light hands over.',
      },
      {
        concept: 'inverse-square-law',
        note: 'One holds distance aside so that directions may be compared; the other holds direction aside and asks what distance by itself does.',
      },
      {
        concept: 'magnetic-dipole',
        note: 'One is about where a shaken pair sends its radiation; the other is about the shape of the steady field a loop and a magnet share once seen from far enough away.',
      },
    ],
  },
};
