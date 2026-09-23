/**
 * slit-width-and-diffraction 개념 선언.
 *
 * `diffraction` 과 둘 다 틈과 퍼짐이라 definition 이 붙기 쉽다. **존재 ↔ 정도**로 갈랐다.
 *   diffraction                 주어 = 그늘 자리. 주장 = 거기에도 물결이 **있다**
 *   slit-width-and-diffraction  주어 = 퍼짐의 **정도**. 주장 = 틈 폭을 **파장으로 재어** 정해진다
 * 이쪽만 「비 · 견줌 · 넓은 쪽과 좁은 쪽 · 파장으로 잰다」 어휘를 갖는다. 「돌아 들어간다 ·
 * 날카로운 그림자」 는 저쪽에 남기고 여기서는 쓰지 않는다.
 *
 * 폭을 끌어 볼 수 없다(두 값이 나란히 고정) — 그 사실은 화면에 있는 것으로만 쓴다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const slitWidthAndDiffractionConcept: Aperi21ConceptSource = {
  id: 'slit-width-and-diffraction',
  label: 'Gap Width Measured in Wavelengths',
  canonicalSim: 'aperi21:slit-width-and-diffraction',

  surface: {
    definition:
      'How far a wave spreads past an opening, decided by the opening’s size measured in wavelengths: several wavelengths across leaves a shadow, about one wavelength across spreads everywhere.',
    exemplarKeywords: [
      'slit width and diffraction',
      'gap to wavelength ratio',
      'when is diffraction noticeable',
      'a narrow slit spreads the wave more',
      'why do low notes get round corners better than high ones',
      'the opening has to be about a wavelength wide',
      'wide opening gives a beam, narrow one gives arcs',
      'comparing two gaps of different width',
      'does the size of the gap matter',
      'aperture compared with wavelength',
    ],
  },

  briefing: {
    observable: [
      'Two ripple tanks are stacked one above the other, separated by a solid divider, and the very same straight waves enter both from the left.',
      'Each tank has a wall with one gap, and the gaps are the only thing that differs: the upper one is labelled gap = wavelength × 5 and the lower one gap = wavelength × 1.',
      'The same pair of dashed lines is drawn behind both gaps, carrying the edges of each gap straight onward.',
      'In the upper tank the waves stay inside the dashed band as a straight-running beam, and the corners behind the wall stay almost still — only a faint curved ripple creeps in from the gap edges.',
      'In the lower tank the dashed lines are almost touching, and yet the waves come out as half-circles that cross them at once and fill the tank right up to the back of the wall.',
      'The comparison holds at every moment of the round, because both fronts leave their gaps together and both are worked out as the sum of sources sitting in the gap rather than drawn as shapes.',
      'A line under the tanks says in turn that the same straight waves are heading for two gaps of different width, that one goes almost straight while the other spreads in arcs, and that a shadow stays behind the wide gap while waves fill right up to the wall behind the narrow one.',
      'The two tanks are drawn in the same colours throughout; what tells them apart is the pair of labels and the shape of what comes out.',
      'Nothing carries a spreading angle or any other measurement — the only numbers on the screen are the two multiples of the wavelength.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; one round runs about sixteen seconds and repeats.',
        'Both cases are on the screen at the same instant, so the comparison never depends on remembering a previous picture.',
        'The screen opens partway through, at the moment the two fronts have just parted company, so the difference is visible immediately.',
        'The two ratios are fixed at five and one; there is no way to sweep the width between them.',
      ],
    },

    useWhen: [
      'The article has given a rule like the gap must be about a wavelength across, and the reader has no sense of what changes on either side of that. Two tanks fed by the same wave, with only the ratio different, make the rule a difference that is looked at rather than accepted.',
      'The point is that the wavelength is the ruler — that a gap is not wide or narrow in itself but only compared with the wave passing through it — and the labels say the width in wavelengths rather than in any other unit.',
    ],

    avoidWhen: [
      'The question is whether a wave gets into the shadow at all. That is settled here before the comparison starts, and the reader would be asked to look at two cases when one would do.',
      'The article needs a spreading angle, a formula relating it to the gap, or the position of a dark band. Nothing is measured and no angle is drawn.',
      'The subject is two gaps and the fringes their waves make together. Each tank has one gap, and the two tanks never mix.',
      'The article compares different wavelengths through one fixed gap. The wave is identical in both tanks and only the gap changes.',
      'The point turns on the wall reflecting waves back. In front of the wall both tanks keep clean straight bands.',
    ],

    contrastWith: [
      {
        concept: 'diffraction',
        note: 'One establishes that a wave reaches where it should not; the other assumes that and asks how far, answering with a ratio rather than with a yes.',
      },
      {
        concept: 'refraction-of-waves',
        note: 'Both change where a wave ends up going, but one is governed by the size of an opening set against the wavelength and the other by a difference of speed across a boundary.',
      },
    ],
  },
};
