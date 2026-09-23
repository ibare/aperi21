/**
 * inverse-square-law 개념 선언.
 *
 * 밝기 넷 중 하나. 이쪽은 **별이 없다** — 빛도 중력도 소리도 아닌 퍼짐 자체를 주장한다.
 *   inverse-square-law   왜 하필 **제곱**인가 — 수는 그대로인데 구면의 **넓이**가 커진다
 *   apparent-brightness  한 별을 거리마다 본 **결과** — 칸에 나뉘어 옅어진다
 *   stellar-luminosity   받은 것에서 낸 것을 **되짚는다**
 *   magnitude-scale      밝기에 **수를 매기는** 방식
 * 이쪽만 구면 · 넓이 · 창 · 「수가 늘지도 줄지도 않는다」 어휘를 갖는다. 별 · 등급 ·
 * 광도라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const inverseSquareLawConcept: Aperi21ConceptSource = {
  id: 'inverse-square-law',
  label: 'Inverse-Square Law as Spreading over a Sphere',
  canonicalSim: 'aperi21:inverse-square-law',

  surface: {
    definition:
      'Why anything streaming evenly outward from a point weakens as the square of separation: the grains keep their number while the shell carrying them gains area.',
    exemplarKeywords: [
      'inverse square law',
      'why the square and not just the distance',
      'one over r squared',
      'the surface of a sphere grows as the radius squared',
      'light, gravity and sound all obey the same falling-off',
      'spreading out over a bigger and bigger shell',
      'intensity through a fixed opening',
      'nothing is lost, it just covers more ground',
      'flux through a fixed area',
      'why doubling the separation quarters it',
    ],
  },

  briefing: {
    observable: [
      'Grains burst from a single point in every direction at once and are seen head on, so they form a disc that grows while they keep flying.',
      'The grains crowd together toward the rim of the disc and thin out at its middle, which is what a ball seen from the front looks like rather than a flat plate.',
      'A square opening sits at the middle of the view and never changes size; it is the only thing on screen that is held fixed.',
      'When the growing shell is stopped at its first radius, the opening is packed with six rows of six grains, and those thirty-six are picked out in a second colour and followed from then on.',
      'At twice the radius the picked-out grains have spread across four openings worth of area, and the same opening now holds three rows of three.',
      'At three times the radius they cover nine openings worth, and the opening holds two rows of two.',
      'The number of grains in the whole disc never changes between these stops — none is added and none is lost, which the closing line states in words.',
      'Radii already passed stay behind as dashed rings tagged as one, two and three times the first, so how far the shell has come is read from ring size rather than from a scale.',
      'A small tag beside the opening reads one at the first stop and then a fraction with a squared denominator at the second and third.',
    ],

    screen: {
      affordances: [
        'The shell grows, stops to be counted, grows again and finally fades back to the point, all by itself and over and over.',
        'The growing runs at an even pace and the grains trail short tails while they fly, so the moments meant for counting look different from the moments meant for watching.',
        'Only the far half of the shell is drawn; the half behind would double every count and make the counting worthless.',
        'The second colour carries one meaning only — the share that filled the opening at the first radius — so following it is following evidence rather than decoration.',
        'The grains are laid out so that one grain covers the same amount of shell wherever it sits, and so that none of them ever lies on the edge of the opening.',
        'No totals are written anywhere; the counts are left to be taken off the screen.',
      ],
    },

    useWhen: [
      'The article has stated the law as a formula and the reader accepts it without seeing where the exponent comes from. Watching a fixed count cover four and then nine openings is what supplies the two.',
      'A reader is likely to guess that the falling-off is simply proportional to separation, and a picture is needed in which an area, not a length, is plainly what is growing.',
    ],

    avoidWhen: [
      'The subject is one particular thing that radiates — a star, a planet pulling on another, a loudspeaker. No source of any named kind is drawn, only a point and what leaves it.',
      'The article is about what an observer at one place receives from a body at several ranges, with the ranges named and compared. Nothing is placed at a range here; a single shell passes through all of them.',
      'Absorption, scattering or anything that takes grains out along the way is the point. The count is preserved here by construction, which is the whole argument.',
      'Formulas are wanted on screen — the area of a sphere, an intensity written out. Nothing is written but multiples and a fraction.',
      'A reader needs to set their own separation and watch the result. The stops come at one, two and three times only, and those are the ratios where the counting comes out whole.',
      'The article turns on a number given in a unit — a brightness, a field strength, a sound level. There are no units anywhere in the picture.',
    ],

    contrastWith: [
      {
        concept: 'apparent-brightness',
        note: 'One asks why the weakening carries an exponent of two and answers with geometry alone; the other takes that weakening as given and follows one star being viewed from several ranges.',
      },
      {
        concept: 'stellar-luminosity',
        note: 'One runs outward from a point and asks what survives in a fixed opening; the other runs inward from a fixed reading and asks what the source must have been putting out.',
      },
    ],
  },
};
