/**
 * wien-displacement-law 개념 선언.
 *
 * 복사 넷(둘은 이미 선언)의 갈림 — **무엇을 주장하는가**.
 *   blackbody-radiation     두 곡선이 어긋난다 — 고전 이론의 파탄
 *   wien-displacement-law   봉우리가 **얼마나** 옮겨 가는가 — 두 배면 정확히 절반, 막대 둘이 하나
 *   star-color-temperature  봉우리 자리가 만드는 **색**
 *   stefan-boltzmann-law    내보내는 **총량**이 온도의 네제곱
 * 이쪽만 「반비례 · 두 배면 절반 · 막대 길이 · 이어 붙임 · 봉우리 파장」 어휘를 갖는다.
 * 고전 이론 · 파탄 · 색 · 총량은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const wienDisplacementLawConcept: Aperi21ConceptSource = {
  id: 'wien-displacement-law',
  label: 'Peak Wavelength Halving When Temperature Doubles',
  canonicalSim: 'aperi21:wien-displacement-law',

  surface: {
    definition:
      'The wavelength at which a hot body radiates most standing in inverse proportion to its absolute temperature, so that doubling the temperature moves the peak to exactly half the wavelength.',
    exemplarKeywords: [
      'Wien displacement law',
      'peak wavelength times temperature is a constant',
      'lambda max equals b over T',
      'doubling the temperature halves the peak wavelength',
      'how far does the peak move when something is heated',
      'working out a temperature from where the spectrum peaks',
      'the peak slides toward shorter wavelengths on heating',
      'two point nine times ten to the minus three metre kelvin',
      'an infrared peak moving into the visible range',
      'inverse proportion between peak and temperature',
    ],
  },

  briefing: {
    observable: [
      'A single curve is drawn against wavelength for the lowest of three temperatures, and a bar runs along the topmost of three rows above the plate, reaching from the origin out to the wavelength of that curve’s peak, with a dotted upright joining the peak to the end of the bar.',
      'The temperature then doubles and the whole curve shrinks bodily toward the origin while its peak slides leftward; a second bar appears in the second row and shortens along with it, and the first curve stays behind as a pale ghost.',
      'When the rise is finished, a dotted copy of the new shorter bar slides out by its own length and joins onto the end of it, and the end of that copy lands exactly on the upright dropped from the first peak and on the end of the first row’s bar — two short bars come to precisely one long one.',
      'The temperature doubles once more and the same thing happens again in the third row, this time landing on the end of the second row’s bar.',
      'The finished picture is three bars in the ratio of one, a half and a quarter, and three curves of identical shape each squeezed to half the width of the one before.',
      'A small disc at the head of each row is painted the colour of the light that temperature actually gives out, with the temperature written beside it; the writing appears only once the rise to that temperature is complete.',
      'Wavelength marks in nanometres run along the bottom so the rough position of each peak can be located, but no figure is written for any peak wavelength.',
      'A line beside the plate states that the curves have been drawn to a common peak height, and no scale is put on the strength axis.',
    ],

    screen: {
      affordances: [
        'The three temperatures, the two risings and the two joinings run through in order, the finished picture is held, it fades and begins again; nothing has to be pressed.',
        'The halving is put to the eye as a length rather than to the reader as a division: two short bars laid end to end either reach the long one or they do not.',
        'Three temperatures are used rather than two, because one doubling could be taken for a coincidence and a second one cannot.',
        'The curves are drawn to a common peak height, since the true heights differ by a factor of a thousand across this range and the lowest would sit flat on the floor; the picture says on its face that this has been done.',
        'The rows are ordered with the longest bar at the top, so that each joined copy ends on the row immediately above it and no dropped upright has to cross a bar on its way.',
        'One colour is kept for peak wavelength alone — the bars, the copies, their end marks and the peak point itself — and the rows are told apart by position rather than by colour.',
        'The curves themselves are left unpainted, and the only colour taken from the light is the small disc at each row head.',
        'The picture opens on the lowest temperature, holding still for a moment before the first rise begins.',
      ],
    },

    useWhen: [
      'The article has said that the peak moves toward shorter wavelengths as something gets hotter, and the reader now needs the amount rather than the direction. The joined bars settle exactly two, and settle them without arithmetic.',
      'The reader is to take away a proportionality that can be used the other way round — a peak observed, a temperature inferred — and needs to see the relation hold twice in a row before trusting it.',
    ],

    avoidWhen: [
      'The subject is what colour a hot body looks, or reading a temperature off the colour of a star. The curves are not painted here; colour appears only on a small disc at each row head.',
      'The article is about classical theory failing at short wavelengths, about the runaway curve or about why quantum theory was needed. Only measured curves are drawn and nothing disagrees with anything.',
      'The point is the total output, or how steeply it rises with temperature. The curves are deliberately drawn to a common height, which puts total output out of reach of this picture.',
      'The reader needs the peak wavelengths themselves, or the value of the constant. No peak figure is written anywhere; only the three temperatures are.',
      'The subject is the visible range, where it begins and ends, or what part of the output falls inside it. No band is marked and the regions are not named.',
      'The article is about absorption lines, spectral classes or anything read off features in a spectrum. All three curves are smooth from end to end.',
    ],

    contrastWith: [
      {
        concept: 'blackbody-radiation',
        note: 'One takes the measured curve as settled and asks how far its peak travels when the temperature is changed; the other holds the temperature still and asks where the older theory went wrong about the shape.',
      },
      {
        concept: 'star-color-temperature',
        note: 'One answers how far the peak moves, as a wavelength and as a ratio; the other answers what the mixture then looks like, which is a question about colour and not about distance.',
      },
      {
        concept: 'stefan-boltzmann-law',
        note: 'One is about where along the wavelength axis the output is concentrated; the other is about how much output there is in total, a quantity this picture sets aside on purpose by levelling the peaks.',
      },
      {
        concept: 'thermal-radiation',
        note: 'One asks how a body’s emission is distributed and how that distribution shifts with temperature; the other asks only whether radiation gets across a gap with nothing in it and what stops it.',
      },
    ],
  },
};
