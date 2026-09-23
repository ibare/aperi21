/**
 * radiometric-dating 개념 선언.
 *
 * 붕괴 넷 가운데 **재는 도구** 쪽이다.
 *   radioactive-decay   곡선이 **그려지는** 것 — 원자가 줄어 계단이 생긴다
 *   radiometric-dating  곡선이 **이미 있고** 움직이는 것은 읽는 경로다 — 남은 비율 1/4 에서
 *                       가로로 가 곡선에 닿고, 내려와, 반감기 하나씩 과거로 되짚어 연대를 낸다
 *   decay-types         나온 방사선이 무엇을 뚫는가
 *   nuclear-fission     맞아서 갈라지는 한 번의 사건
 * 이쪽만 시료 막대 · 살아 있을 때의 몫 · 되짚는 화살표 · 연대(년) 어휘를 갖는다. 원자도 붕괴
 * 사건도 여기서는 그려지지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const radiometricDatingConcept: Aperi21ConceptSource = {
  id: 'radiometric-dating',
  label: 'Reading an Age off the Remaining Fraction',
  canonicalSim: 'aperi21:radiometric-dating',

  surface: {
    definition:
      'How a measured fraction turns into an age: a sample holding one quarter of the living level of carbon-14 is traced back along the decay curve to two half-lives, about eleven and a half thousand years.',
    exemplarKeywords: [
      'radiocarbon dating',
      'carbon-14 dating',
      'how old is this bone',
      'working an age out of what is left',
      'reading the decay curve backwards',
      'a quarter of the original amount',
      'counting back half-lives',
      'dating an archaeological find',
      'how do we know how long ago something died',
      'turning a measured ratio into years',
      'the living level as a reference',
    ],
  },

  briefing: {
    observable: [
      'At the left stands a single upright bar with a grey outline and an ink fill reaching a quarter of the way up. The outline is the level a living thing would hold; the fill is what the sample holds, and the fraction is written beside the top of the fill.',
      'At the right a curve panel is complete before anything moves: a falling curve, a vertical reference marked at the whole and at a half, and evenly spaced boundaries along the bottom, one for each half-life.',
      'The bar and the vertical share a scale, so the top of the fill is already at the height to be read.',
      'A highlighted horizontal line grows out from the top of the fill and travels across until it touches the curve. A point stands where it meets.',
      'From that point a highlighted vertical drops straight down to the bottom reference.',
      'Below the bottom reference, a highlighted arrow then grows leftward — toward the earlier side — by exactly one half-life boundary, with the half-life in years written above it. At the same time the point climbs back up along the curve from the quarter to the half.',
      'Where it reaches the half, faint dotted guides run out to the vertical and to the bottom, so that the doubling of the fraction at each step back can be seen.',
      'A second arrow of the same length follows, and the point climbs on to the whole — the level a living thing would hold.',
      'Under the place the vertical came down, an age in years appears in bold.',
      'The reading path then draws back and the bar and the curve are left as they were, ready to be read again.',
      'The bottom direction is marked in half-lives rather than in years, and the only figures anywhere are the fraction, the half-life, and the age.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The reading is made on its own from the fraction to the age and the round repeats.',
        'The curve is finished before anything begins, since here it is the thing already known; what moves is only the path taken through it.',
        'The sample is one bar with an outline and a fill rather than two bars side by side, so the fraction is how full a single thing is.',
        'The bottom direction is counted in half-lives, which is what makes each step back one arrow of the same length as the last.',
        'The stepping back runs from right to left, from the reading toward the past, because that is the direction the claim is made in.',
        'The highlight is kept for the reading path alone — the two lines, the point, the arrows and the age.',
        'The half-life in years is written on each arrow and the age is written once, both as given rather than as the result of any arithmetic on screen.',
        'The fraction is written beside the fill itself rather than on the vertical, where the horizontal reading line would cut across it.',
        'The guides at the half are drawn only once the point has climbed there, so the doubling appears as a step rather than as a marking laid out in advance.',
        'It opens with the horizontal reading line already partway across.',
      ],
    },

    useWhen: [
      'The article has given a half-life and a measured fraction and the reader needs the step from those two to a number of years made explicit rather than asserted.',
      'The point is that the method is a reading of a known curve in the opposite direction from the one it was built in.',
      'The reader should see why counting back doubles the fraction each time: the point climbs from a quarter to a half to the whole, one arrow at a time.',
      'The article rests on there being a known starting level, and the reader needs "the living level" to be a definite height that the sample is compared against.',
    ],

    avoidWhen: [
      'The subject is why decay follows that curve at all, or the halving happening in front of the reader. The curve here is given.',
      'The article is about what the decaying nucleus turns into, or about the radiation it gives off.',
      'The point is how carbon-14 gets into a living thing and why the intake stops. The living level is taken as known here.',
      'The subject is how accurate the method is, its calibration, or contamination of a sample.',
      'The article uses a fraction that is not a simple halving, or needs a reading part-way between two half-lives.',
      'The subject is dating with a different nucleus over far longer spans, or comparing methods.',
    ],

    contrastWith: [
      {
        concept: 'radioactive-decay',
        note: 'One watches a crowd halve and asks how much is left; the other takes how much is left as the only measurement and works back to how long it has been.',
      },
      {
        concept: 'decay-types',
        note: 'One uses how much of the parent survives; the other is entirely about what has left and what thickness of matter will stop it.',
      },
      {
        concept: 'nuclear-structure',
        note: 'One turns the amount of one isotope still present into elapsed time; the other is about what makes something that isotope at all.',
      },
      {
        concept: 'stellar-parallax',
        note: 'Both reach something nobody can go and check by putting one measured quantity through a known relation, but one turns an angle into a distance and the other a surviving fraction into a span of years.',
      },
    ],
  },
};
