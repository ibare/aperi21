/**
 * axial-tilt-seasons 개념 선언.
 *
 * 공전 · 계절 넷 가운데 하나. **무엇을 주장하는지로 갈랐다.**
 *   axial-tilt-seasons               축이 **같은 방향을 그대로 가리킨 채** 도는 것이 계절을 만든다 — 기울기 0 이면 사라진다
 *   earth-revolution-constellations  밤 쪽이 어느 방향을 향하나 — 한밤의 별자리
 *   seasonal-sun-path                계절이 태양의 하루 길을 어디로 옮기나 — 남중 고도와 낮 길이
 *   solar-altitude-shadow            고도 하나가 그림자와 땅 한 칸의 빛을 어떻게 정하나
 * 이쪽만 자전축 · 평행 · 반구 · 햇빛의 몫 · 기울기 0 반사실 어휘를 갖는다. 하늘에서 본 태양은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const axialTiltSeasonsConcept: Aperi21ConceptSource = {
  id: 'axial-tilt-seasons',
  label: 'Axial Tilt as the Cause of the Seasons',
  canonicalSim: 'aperi21:axial-tilt-seasons',

  surface: {
    definition:
      'Seasons from an axis that keeps its direction all year, leaning a hemisphere toward the Sun on one side of the orbit and away from it on the other.',
    exemplarKeywords: [
      'why do we have seasons',
      'the axis is tilted twenty-three and a half degrees',
      'seasons are not caused by distance from the Sun',
      'the axis always points the same way in space',
      'northern summer is southern winter',
      'solstice and equinox as positions in the orbit',
      'Earth leans toward the Sun',
      'what would happen if Earth had no tilt',
      'tilt rather than distance',
      'which hemisphere receives more sunlight',
    ],
  },

  briefing: {
    observable: [
      'The orbit is seen from a little above its plane — the Sun at the centre, a circle round it, and four faint Earths standing at four places with their axes drawn.',
      'Those four axes are parallel to one another, and the moving Earth’s axis, drawn in the accent colour with an N at its north end, stays parallel to all of them the whole way round.',
      'Earth’s lit and shaded sides are painted by brightness with the boundary curving as a sphere’s would, and a dotted line square to the orbit travels with Earth as the thing the lean is measured from.',
      'On one side of the Sun the N end leans toward it; half an orbit later, with the axis unchanged in direction, the same end leans away.',
      'A curve at the right grows as Earth moves, tracing the share of sunlight the northern hemisphere catches, with a dot in the accent colour at the present moment.',
      'That curve rises above a half line where the N end leans sunward and falls below it half an orbit later, and the peak and trough are named summer and winter once it has reached them.',
      'Its upright axis carries only the words more, half and less; no figures are written on it.',
      'The axis is then stood upright — the written tilt changes from 23.5° to 0° — while Earth waits at one place in the orbit.',
      'Earth goes round again at the same rate with the axis upright, and the new curve lies flat along the half line while the tilted year’s curve is left faintly behind it.',
      'At the near side of the orbit the face of Earth turned toward the viewer is its night side, so Earth is almost entirely dark there.',
    ],

    screen: {
      affordances: [
        'The tilted year, the straightening, the untilted year and the re-tilting run in order and then repeat; nothing has to be pressed, and Earth is already moving on arrival.',
        'The tilt in degrees is written out while one of the two values is being held and left off while the axis is being turned between them.',
        'The four faint Earths and their parallel axes are there so that the same direction can be checked against something rather than taken on trust.',
        'Lit and shaded are drawn with brightness rather than colour, so the sunlit side is the bright one in any surroundings.',
      ],
    },

    useWhen: [
      'The article has denied that summer comes from being nearer the Sun, and the reader is left with a tilt that seems to do nothing. Running the same orbit with the tilt taken out, and watching the curve collapse flat onto the half line, is what makes the tilt the cause rather than a stated fact.',
      'The prose needs the axis to be unmoving while everything else changes, and four parallel axes standing round the orbit with a fifth travelling parallel to them is what makes that hold still on the page.',
    ],

    avoidWhen: [
      'The subject is what a season looks like from the ground — where the Sun comes up, how high it gets at noon, how long the day lasts.',
      'The point is shadows, or how much light lands on a patch of ground. The sunlight here is one share for a whole hemisphere and nothing is drawn on any surface.',
      'The article is about the shape of the orbit, perihelion, or how the Sun-Earth distance varies. The orbit drawn here is a circle.',
      'Which constellations are on view, or anything about the night sky. No stars are drawn.',
      'Percentages, dates or the names of the solstices as days are needed. The curve reads only more, half and less, and no months are marked on the orbit.',
      'The southern hemisphere is the one being followed. Everything on the curve and in the labels is told from the north.',
    ],

    contrastWith: [
      {
        concept: 'seasonal-sun-path',
        note: 'One gives the season from outside, as an axis that keeps its direction while the orbit carries it round; the other gives what that leaning has already done to the Sun’s track over one place.',
      },
      {
        concept: 'solar-altitude-shadow',
        note: 'One is the whole orbit’s account of why a hemisphere gets more than its half; the other is local and momentary — this Sun, this stick, this patch of ground.',
      },
      {
        concept: 'earth-revolution-constellations',
        note: 'Both follow Earth once round its orbit, but one asks which hemisphere is leaning toward the light and the other asks which way the night side is aimed.',
      },
    ],
  },
};
