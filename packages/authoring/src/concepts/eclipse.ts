/**
 * eclipse 개념 선언.
 *
 * 형제는 `moon-phases`. **무엇이 드문지로 갈랐다.**
 *   eclipse      그림자는 **늘 드리워져 있고**, 닿는 것이 드물다 — 기운 궤도가 대부분의 삭 · 보름을 비껴가게 한다
 *   moon-phases  달이 스스로 반쪽만 밝은 것 — 겹친 만큼이 보인다. 가려짐이 없다
 * 이쪽만 그림자 원뿔 · 한 줄 · 교점 · 식 계절 어휘를 갖는다. 초승달 · 차고 이지러짐은 쓰지 않는다 —
 * 삭 · 보름은 자리 이름으로만 나온다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const eclipseConcept: Aperi21ConceptSource = {
  id: 'eclipse',
  label: 'Why Most New and Full Moons Bring No Eclipse',
  canonicalSim: 'aperi21:eclipse',

  surface: {
    definition:
      'Why eclipses miss most months: Earth and the Moon always trail shadows away from the Sun, but the tilted lunar orbit lets one land only when all three line up.',
    exemplarKeywords: [
      'solar eclipse',
      'lunar eclipse',
      'why is there not an eclipse every month',
      'the Moon’s orbit is tilted about five degrees',
      'nodes of the lunar orbit',
      'eclipse season',
      'the Moon’s shadow falls on Earth',
      'the Moon passes into Earth’s shadow',
      'Sun, Earth and Moon in a straight line',
      'the shadow slips above or below',
    ],
  },

  briefing: {
    observable: [
      'The scene is a side-on section: the Sun at the left edge, Earth to the right of centre, and the Moon on an orbit round it, with the plane of Earth’s own orbit drawn as a line and sunlight dashes running along it.',
      'Earth and the Moon each trail a shadow cone away from the Sun at every moment, whether or not anything is standing in it.',
      'The Moon’s orbit is drawn with its near half solid and its far half dashed, and its shape in this view changes through the year, flattening into a narrow ellipse and opening out into a slanted line.',
      'At the new moon place with the orbit flat, the tip of the Moon’s cone reaches Earth, a small dark patch appears where it lands, a ring in the accent colour surrounds that patch, and it is named a solar eclipse.',
      'At the full moon that follows, the Moon travels into Earth’s cone, dims, and is ringed and named a lunar eclipse.',
      'Months later, with the orbit slanted, the new moon comes again but the Moon passes below the line and its cone slips past beneath Earth, with no ring and no name.',
      'At that month’s full moon the Moon rides above Earth’s cone and stays bright, again with nothing marked.',
      'Half a year on the orbit has flattened once more and both eclipses happen again.',
      'The labels for new moon and full moon stay at fixed places along the orbital plane, so a Moon standing above or below one of them is still read as being at that phase.',
      'A line in the corner states that sizes and distances are exaggerated, and gives the orbit’s real tilt together with the factor by which it is drawn larger.',
    ],

    screen: {
      affordances: [
        'The year runs by itself through the first pair of eclipses, the two months that miss and the pair half a year later, and then repeats; on arrival the Moon is approaching the first new moon.',
        'The cones are drawn at all times rather than only when something is in them, which is what makes the rarity a matter of landing rather than of casting.',
        'Only the full cones are drawn and not the fainter outer ones, so what is asked of the picture is whether a cone lands, not how deeply.',
        'The accent colour is used for one thing only — the place where one body’s shadow has reached another.',
      ],
    },

    useWhen: [
      'The article has said that the tilt of the lunar orbit is why eclipses are rare, and the reader cannot see how a few degrees could matter. Watching the same cone reach Earth in one month and slip under it two months later, with nothing else altered, is what makes the tilt the reason.',
      'The prose needs shadows to be permanent rather than occasional, and two cones drawn at every moment of a whole year is what says so before any eclipse happens.',
    ],

    avoidWhen: [
      'The article is about the Moon’s changing shape month by month. The Moon here is a body standing in or out of a shadow, and its own lit and dark sides are not what is being followed.',
      'Partial eclipses, the penumbra, or why the sky only half-darkens are the subject. Only the full cone is drawn.',
      'The point is the red colour of an eclipsed Moon, or the corona seen at totality. The eclipsed Moon here only dims.',
      'Dates of eclipses, how often they come, or the saros cycle are needed. What is drawn is two seasons in an idealised year with the nodes kept fixed in space.',
      'Sizes, distances, or how nearly the Moon covers the Sun’s disc are at issue. Everything here is drawn out of proportion, as the corner note says.',
      'The article is about why one half of a body is dark at all. The shaded halves are not drawn here; the cones stretching away from the bodies are.',
    ],

    contrastWith: [
      {
        concept: 'moon-phases',
        note: 'One is about a shadow reaching across from one body to another, which can happen at only two positions and even then seldom does; the other is about which part of a permanently half-lit Moon is turned our way.',
      },
      {
        concept: 'earth-rotation-day-night',
        note: 'Both are about shadow, but one is the shaded half a body carries with it and passes places through, and the other is the cone reaching out beyond it and landing somewhere else.',
      },
    ],
  },
};
