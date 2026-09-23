/**
 * seasonal-sun-path 개념 선언.
 *
 * 공전 · 계절 넷 가운데 하나. **무엇을 주장하는지로 갈랐다.**
 *   seasonal-sun-path                계절이 태양의 하루 길을 **나란히 위아래로** 옮긴다 — 남중 고도와 낮 길이가 **함께** 정해진다
 *   axial-tilt-seasons               축이 같은 방향을 가리킨 채 도는 것이 계절을 만든다 — 계절의 원인
 *   earth-revolution-constellations  밤 쪽이 어느 방향을 향하나 — 한밤의 별자리
 *   solar-altitude-shadow            고도 하나가 그림자와 땅 한 칸의 빛을 어떻게 정하나 — 고도의 결과
 * 이쪽만 하늘 돔 · 남중 고도 · 낮 길이 · 뜨고 지는 방위 어휘를 갖는다. 기울기 · 그림자 · 별은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const seasonalSunPathConcept: Aperi21ConceptSource = {
  id: 'seasonal-sun-path',
  label: 'The Sun’s Daily Path Through the Seasons',
  canonicalSim: 'aperi21:seasonal-sun-path',

  surface: {
    definition:
      'The Sun’s daily track is a circle across the sky, and the season slides that one circle up or down, setting its noon height and the length of daylight together.',
    exemplarKeywords: [
      'the path of the Sun across the sky',
      'why are summer days longer',
      'noon altitude of the Sun',
      'in summer the Sun rises in the northeast',
      'the sky at the summer solstice and at the winter solstice',
      'at the equinox day and night are equal',
      'the Sun stands higher in summer',
      'how the hours of daylight change through the year',
      'the sunrise point moves along the horizon',
      'the Sun arcs low across the winter sky',
    ],
  },

  briefing: {
    observable: [
      'The sky is drawn as a dome over an observer, with the latitude written into its title, looked down on from above and from one side so that the horizon is an open ellipse.',
      'The Sun travels along a path in the accent colour that is an arc of a circle, and where that arc meets the horizon is where it comes up and goes down.',
      'When one season’s day is finished its path is left behind in faint ink with a name attached — winter solstice, equinox, summer solstice — and the accent path slides north and upward to the next, staying parallel to the ones already there.',
      'A wedge in the accent colour standing in the plane through north and south opens wider as the path rises, and it is named the noon altitude.',
      'A bar at the right runs from midnight through noon to midnight, with the present season’s daylight drawn on it in the accent colour, centred on the noon mark, and a marker crossing it as the day runs.',
      'Seasons already finished leave their daylight as shorter rows stacked below, so the three can be set against one another without the eye leaving the bar.',
      'At the equinox the daylight is exactly half the bar and symmetric about noon, and the path crosses the horizon due east and due west.',
      'On the summer path the Sun comes up between north and east, stands near the top of the dome at noon and goes down between north and west, and its daylight row is the longest of the three.',
      'Each of the three seasons takes the same number of seconds, so the time the Sun spends above the horizon is itself the length of the day.',
      'Below the horizon the path is not drawn and neither is the Sun; the dark half of the bar carries the night instead.',
    ],

    screen: {
      affordances: [
        'The three seasons come in order and the run resets; nothing has to be pressed, and on arrival the shortest day’s Sun is already up in the morning sky.',
        'A season’s name is attached only while that season is being held, not while the path is sliding between two of them.',
        'No hours or degrees are written; the bar is marked with the words midnight, noon and midnight, and the wedge carries no figure.',
        'The accent colour means the season in progress and nothing else, so the present path, Sun, wedge and daylight row are read as one thing.',
      ],
    },

    useWhen: [
      'The article has stated that a higher Sun and a longer day arrive together and the reader treats them as two separate seasonal facts. One circle sliding up while the wedge widens and the daylight row lengthens makes them one fact with one cause.',
      'The prose needs the sunrise point to be something that moves rather than a fixed east, and three paths stacked on one horizon with their crossings spread from southeast to northeast will carry it.',
    ],

    avoidWhen: [
      'The article explains why the season changes at all — the tilt, the orbit, which hemisphere leans where. Nothing outside the local sky is drawn here.',
      'The point is a shadow’s length, or how much light falls on a patch of ground. The Sun’s height appears here as an angle and never as what it does on the ground.',
      'The stars, the celestial pole or the turning of the night sky are the subject. The Sun is the only body on the dome.',
      'Day lengths in hours and minutes are needed, or a noon altitude in degrees, or a rule for working either out.',
      'The setting is the tropics, the poles or the southern hemisphere. One mid-northern latitude is fixed throughout.',
      'The article is about why the Sun crosses the sky at all rather than about how that crossing differs between seasons.',
    ],

    contrastWith: [
      {
        concept: 'axial-tilt-seasons',
        note: 'One shows what the season has done to the Sun’s track over one place; the other shows the season from outside, as an axis that keeps its direction while the orbit carries it round.',
      },
      {
        concept: 'solar-altitude-shadow',
        note: 'One asks what the season does to the Sun’s height in the first place; the other takes a height as given and works out what it does to a shadow and to a patch of ground.',
      },
      {
        concept: 'diurnal-motion',
        note: 'Both watch one day’s worth of turning from the ground, but one follows the Sun and asks what the season changes about its track, and the other follows the stars, whose track the season leaves alone.',
      },
    ],
  },
};
