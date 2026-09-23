/**
 * earth-revolution-constellations 개념 선언.
 *
 * 공전 · 계절 넷 가운데 하나. **무엇을 주장하는지로 갈랐다.**
 *   earth-revolution-constellations  밤 쪽이 **어느 방향**을 향하나 — 한밤에 뜨는 별자리가 바뀐다
 *   axial-tilt-seasons               어느 반구가 **태양 쪽으로 기우나** — 햇빛의 몫, 기울기 0 이면 사라진다
 *   seasonal-sun-path                계절이 **태양의 하루 길**을 어디로 옮기나 — 남중 고도와 낮 길이가 함께
 *   solar-altitude-shadow            고도 하나가 **그림자와 땅 한 칸의 빛**을 어떻게 정하나
 * 이쪽만 황도 12 별자리 · 한밤 · 햇빛에 묻힘 어휘를 갖는다. 기울기 · 계절의 더위 · 낮 길이는 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const earthRevolutionConstellationsConcept: Aperi21ConceptSource = {
  id: 'earth-revolution-constellations',
  label: 'Why the Midnight Constellations Change Through the Year',
  canonicalSim: 'aperi21:earth-revolution-constellations',

  surface: {
    definition:
      'Why the constellations on view at midnight change through the year: Earth’s night side faces away from the Sun, and one orbit swings that direction right round the zodiac.',
    exemplarKeywords: [
      'seasonal constellations',
      'why can we not see Orion in summer',
      'the zodiac',
      'the constellations change with the season',
      'the Sun sits in front of a constellation',
      'stars lost in the daylight sky',
      'the summer and winter night skies hold different stars',
      'which constellations are up at midnight',
      'Earth takes a year to go round the Sun',
      'the same stars come back after a year',
    ],
  },

  briefing: {
    observable: [
      'On the left the Sun sits at the centre of a circular orbit with Earth on it, seen from above the North Pole, and the twelve zodiac names are set in a ring right round the whole thing in order.',
      'Earth is drawn with its Sunward half bright and its far half dark, and an arrow in the accent colour leaves the middle of the dark half and reaches outward past the orbit to the ring.',
      'The name nearest that arrow’s tip is written in the accent colour and in bold; as Earth moves, the arrow and that bold name travel round the ring together.',
      'A wedge with its point at the Sun covers thirty degrees to either side of the Sunward direction, and the names inside it are faded and labelled as lost in sunlight.',
      'A second window at the right is titled with the season and shows the southern sky at midnight, sixty degrees either side of a dashed line in the accent colour marked due south.',
      'As Earth goes on round, the constellations in that window drift steadily toward the west past the due-south line, and the one standing on that line is always the one written in the accent colour on the ring.',
      'Over a full circuit a name that stood at midnight in spring is inside the faded wedge by autumn, and by the end the spring sky has come back.',
      'The stars in the window are scattered points that are not joined into figures, so the names and their places carry the identification.',
    ],

    screen: {
      affordances: [
        'Earth goes round by itself through four seasons of equal length and then begins again; it is already moving on arrival, a little way into spring.',
        'The right-hand window is titled with the season in progress, so the sky being shown is always named.',
        'Faded names are kept rather than dropped, so the ring stays unbroken and being lost in sunlight reads as faint rather than as gone.',
        'The accent colour carries one meaning only — the midnight, due-south direction — which is what ties the arrow on the left to the line on the right.',
      ],
    },

    useWhen: [
      'The article has said that summer and winter nights hold different constellations and the reader has taken it as a fact to be memorised. An arrow leaving the night side and sweeping the ring gives the reason in one motion.',
      'The prose has to get from a diagram of the orbit to what someone standing outside would actually see, and a second window where the named constellation really does stand due south does that crossing.',
    ],

    avoidWhen: [
      'The article is about seasons as warmth, daylight or the tilt of the axis. No axis is drawn here and the orbit is a plain circle.',
      'The point is how the stars move during a single night. Earth’s own turning is never drawn; its night side serves only as a pointer.',
      'Real constellation shapes or named stars are needed. The stars in the sky window are scattered at random within each constellation’s span.',
      'The subject is the zodiac as astrology, or birth signs against dates.',
      'The article turns on the ecliptic as a coordinate, on right ascension, or on the difference between the sidereal and the tropical year.',
      'The reader is to be shown why a star shifts against others as Earth moves. Nothing here shifts against anything; whole constellations come into and out of view.',
    ],

    contrastWith: [
      {
        concept: 'diurnal-motion',
        note: 'One is the yearly change in which stars are up at midnight at all; the other is the nightly turn that brings the same stars back in a single day.',
      },
      {
        concept: 'axial-tilt-seasons',
        note: 'Both follow Earth once round its orbit, but one asks which way the night side is aimed and the other asks which hemisphere is leaning toward the light.',
      },
      {
        concept: 'stellar-parallax',
        note: 'One uses Earth’s place in its orbit to change which stars are on view; the other uses the same journey to shift one near star slightly against stars that hold still.',
      },
      {
        concept: 'seasonal-sun-path',
        note: 'Both are what one year does to the sky over a single place: one is the direction the night side is turned toward, which settles the stars on view, and the other is the Sun’s own daily track, which the same year raises and lowers.',
      },
    ],
  },
};
