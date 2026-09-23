/**
 * stellar-parallax 개념 선언.
 *
 * 공전을 쓰는 형제가 `earth-revolution-constellations` 다. **공전으로 무엇을 얻는지로 갈랐다.**
 *   stellar-parallax                 공전이 **자리를 옮겨** 가까운 별 하나가 배경 사이에서 어긋나 보인다 — 두 배 멀면 절반
 *   earth-revolution-constellations  공전이 **밤 쪽의 방향을 돌려** 한밤에 뜨는 별자리 무리가 통째로 바뀐다
 * 이쪽만 배경 · 어긋남 · 각 p · 거리 재기 어휘를 갖는다. 계절 · 별자리 이름은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const stellarParallaxConcept: Aperi21ConceptSource = {
  id: 'stellar-parallax',
  label: 'Stellar Parallax and the Distance of a Star',
  canonicalSim: 'aperi21:stellar-parallax',

  surface: {
    definition:
      'The angular shift of a nearby star against far ones as Earth moves round its orbit, halved when the star is twice as far, which gives its distance.',
    exemplarKeywords: [
      'stellar parallax',
      'how do we measure the distance to a star',
      'parsec',
      'parallax of one arcsecond',
      'a nearby star shifts against the background stars',
      'distance is one over the parallax',
      'the baseline is the width of Earth’s orbit',
      'holding up a thumb and blinking one eye then the other',
      'trigonometric parallax',
      'the nearest stars shift the most',
    ],
  },

  briefing: {
    observable: [
      'On the left the Sun, Earth’s orbit and Earth are drawn as seen from above the plane of the orbit, and Earth goes round steadily.',
      'Two stars stand further to the right, one labelled as being at one parsec and the other at two, set a little above and below one another so that neither hides the other.',
      'Behind each star is an arc of the same radius centred on that star, scattered with faint stars and named as the distant background.',
      'A sight line in the accent colour runs from Earth past each star to its arc, and where it meets the arc a dot marks where that star appears to stand among the background.',
      'Through the first year both dots travel back and forth along their arcs while the background stars never move at all, and the range each dot has covered is left behind as a thick faint arc.',
      'By the end of that year the nearer star’s swept arc is twice as long as the farther star’s.',
      'In the second year a wedge is laid at each arc spanning the whole swing, and beside each star a smaller wedge is raised between a dotted line drawn to the Sun and a line drawn to the place in the orbit where the Sun-Earth distance is seen edge on.',
      'Each star is then labelled with its distance and its parallax together — one parsec with one arcsecond, two parsecs with half of one.',
      'A line in the corner states that the angles are drawn tens of thousands of times larger than they really are.',
    ],

    screen: {
      affordances: [
        'Earth goes round twice on its own — once for the swing, once for the angle — and then the run repeats; it is already moving on arrival.',
        'The angle is only raised in the second year, so that the first shows nothing but the back and forth.',
        'Two stars are drawn rather than one, because the claim is a ratio and a single star would leave nothing to set it against.',
        'Each background arc is centred on its own star instead of the two sharing a straight backdrop, which is what keeps the swing exactly proportional to the angle.',
      ],
    },

    useWhen: [
      'The article has given the rule that distance is one over the parallax and the reader has a formula with nothing behind it. Two dots swinging along their arcs, one range exactly twice the other, puts the inverse relation on the screen before the angle is even named.',
      'The prose needs the background to be the thing a shift is measured against rather than part of what shifts, and a field of faint stars that stays perfectly still for a whole year will say that.',
    ],

    avoidWhen: [
      'The article is about which constellations are on view when, or about the night sky changing through the year. The background here is a fixed field one star is measured against.',
      'The subject is parallax in ordinary sight — two eyes, depth perception, a near object against a far wall.',
      'A real star’s measured distance, the instrument that measured it, or the limits of the method are the point. Only one and two parsecs are drawn, at angles vastly exaggerated.',
      'Other rungs of the distance ladder — standard candles, Cepheid variables, redshift — are the subject.',
      'The angles are to be shown at their true size, or the reader is to feel how small an arcsecond is. Everything angular here is drawn far larger than life, as the corner line says.',
      'The article turns on the proper motion of stars, on stars actually moving through space rather than appearing to shift.',
    ],

    contrastWith: [
      {
        concept: 'earth-revolution-constellations',
        note: 'One uses Earth’s journey round the Sun to shift a single near star against stars that hold still; the other uses the same journey to change which stars are on view at all.',
      },
      {
        concept: 'relative-velocity',
        note: 'One changes how fast the watcher is going and the recorded path tilts; the other changes where the watcher stands and the direction to a near body swings while the far ones hold.',
      },
    ],
  },
};
