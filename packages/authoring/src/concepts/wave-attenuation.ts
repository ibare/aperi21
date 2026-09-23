/**
 * wave-attenuation 개념 선언.
 *
 * 「세기가 줄거나 전달되는」 넷 가운데 하나. 이쪽의 주어는 **거리**다.
 *   wave-energy              진폭이 정한다 — 같은 시간에 나른 양
 *   wave-attenuation         거리가 정한다 — 같은 거리마다 같은 **비율**로 낮아진다
 *   impedance-mismatch       경계가 정한다 — 한 자리에서 되돌아오는 몫
 *   sound-through-materials  매질 종류가 정한다 — 빠르기와 건너감 여부
 * 이쪽만 「같은 몫 · 절반 · 흡수 · 퍼지지 않는데도」 어휘를 갖는다. 퍼짐(거리 제곱)은 화면이
 * 원천에서 뺀 것이라 avoidWhen 으로 되돌린다.
 *
 * 주제 설명은 「매질이 흡수하는 에너지」인데 화면이 재는 것은 높이 하나다 — 장부에 올렸다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const waveAttenuationConcept: Aperi21ConceptSource = {
  id: 'wave-attenuation',
  label: 'A Fixed Fraction Lost per Equal Stretch',
  canonicalSim: 'aperi21:wave-attenuation',

  surface: {
    definition:
      'The fall in a travelling wave’s height caused by the medium absorbing it, each equal stretch leaving the same fraction of the height before it rather than the same amount.',
    exemplarKeywords: [
      'attenuation of a wave',
      'the wave dies away as it travels',
      'absorbed by the medium',
      'amplitude halves every so many metres',
      'why does sound fade along a long pipe',
      'ultrasound absorbed by tissue',
      'signal loss along a cable',
      'exponential fall with distance',
      'it loses the same fraction each time, not the same amount',
      'half-value distance',
      'the further it goes the weaker it gets',
    ],
  },

  briefing: {
    observable: [
      'A single rope runs across the screen with a wave travelling rightward along it, and a pair of dashed curves above and below traces the falling height, closing in on the rope as it goes.',
      'One crest is picked out with a dot and a vertical line down to the rope’s resting level, and that one crest is followed the whole way across.',
      'Four marks sit along the rope, and the dimension lines between them all read 2.5 m, so that the stretches being compared are stated as equal rather than assumed.',
      'Each time the followed crest passes a mark, a bar of exactly that height is left standing in the panel below.',
      'From the second bar onward, the height of the bar before it is drawn behind as a dashed outline, and the new bar fills that outline to precisely the halfway line every time; ×0.5 is written above each.',
      'The four bars end up at full, half, a quarter and an eighth, and the empty part of each outline shrinks — first a large gap, then half that, then half again — while the written fraction stays the same.',
      'A line of text says that the rope does not spread the wave out and the crest still gets lower, because the rope absorbs it, and then that each equal stretch leaves the same fraction of the height before it.',
      'The rope is one strand from end to end; there is nowhere for the wave to fan out to and nothing is drawn arriving from a second direction.',
      'No amplitude is ever written as a number, and no exponent or formula appears.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; one round runs about eleven seconds and repeats.',
        'The screen opens with the crest already past the first mark, so the first bar is standing when the reader arrives.',
        'The bars appear at the moment the crest passes a mark rather than on a schedule, which is what ties each height to a place on the rope.',
        'The fraction above each bar is the declared figure for the material, not a value computed and rounded on the spot.',
        'What is measured is only the equal spacing between marks and how far each new bar fills the outline of the one before it.',
      ],
    },

    useWhen: [
      'The article has said a wave loses a fixed proportion over each equal distance and the reader hears that as merely getting weaker. Seeing three outlines filled to the same halfway line, while the amount lost each time visibly shrinks, is what separates a constant fraction from a constant amount.',
      'The point is that weakening happens even where nothing spreads out — that absorption is a separate cause from geometry — and a single strand of rope is the case that makes spreading impossible.',
    ],

    avoidWhen: [
      'The article is about a wave weakening because it is spreading over a larger and larger area from a source. A rope cannot spread, and that is exactly why it was chosen.',
      'The subject is an oscillator at one place dying away over time. Everything here is laid out along distance, and what falls is the height at successive places at one instant.',
      'The point is where the absorbed energy has gone, or that the medium warms up. Nothing accumulates anywhere on this screen; only the heights are recorded.',
      'The article needs the decay constant, a formula, or amplitudes as numbers. The only figures written are the equal spacing and the fraction left at each mark.',
      'The point turns on what happens when the wave reaches a boundary or an end. The rope simply runs out well after the last mark, and nothing comes back.',
    ],

    contrastWith: [
      {
        concept: 'damped-oscillation',
        note: 'The same constant-fraction law read along two different axes: one has each successive peak in time a fixed share of the last, the other has each successive equal stretch of distance leave a fixed share of the height.',
      },
      {
        concept: 'inverse-square-law',
        note: 'Both end with a wave that is weaker further out, but one is the medium taking energy away and the other is the same energy spread over a growing surface — which is why this one still happens where nothing can spread.',
      },
      {
        concept: 'wave-energy',
        note: 'One says what a given amplitude is worth; the other says what becomes of the amplitude along the way, so the two stack rather than compete.',
      },
      {
        concept: 'impedance-mismatch',
        note: 'Both are ways a wave arrives with less than it set out with — one gradually all along the path, the other all at once at a single place where the medium changes.',
      },
    ],
  },
};
