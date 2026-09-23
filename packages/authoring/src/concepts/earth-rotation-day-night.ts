/**
 * earth-rotation-day-night 개념 선언.
 *
 * 같은 자전을 다루는 형제가 `diurnal-motion` 이다. **시점과 주장을 갈랐다.**
 *   earth-rotation-day-night  밖에서 본 **지구** — 밝은 반쪽은 제자리, 한 자리가 실려 지나간다. 한 바퀴 = 하루
 *   diurnal-motion            땅에서 올려다본 **하늘** — 한 점을 가운데 두고 별들이 같은 각만큼 돈다
 * 이쪽만 낮 · 밤 · 해 뜸 · 해 짐 · 밝은 반쪽 어휘를 갖는다. 궤적 · 별 · 별자리는 쓰지 않는다.
 * 하루의 길이(24 시간)는 화면에 없다 — 주장은 한 바퀴와 하루의 대응이지 그 길이가 아니다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const earthRotationDayNightConcept: Aperi21ConceptSource = {
  id: 'earth-rotation-day-night',
  label: 'Day and Night on a Turning Earth',
  canonicalSim: 'aperi21:earth-rotation-day-night',

  surface: {
    definition:
      'Why day and night alternate: the sunlit half of Earth stays facing the Sun while rotation carries each place through it and out into shade, one turn making one day.',
    exemplarKeywords: [
      'day and night',
      'why does the Sun rise and set',
      'Earth turns once a day',
      'the line between the day side and the night side',
      'sunrise and sunset',
      'half of Earth is always in sunlight',
      'it is night on the other side of the world',
      'it is Earth that moves, not the Sun',
      'rotation of Earth on its axis',
      'why does it get dark at night',
    ],
  },

  briefing: {
    observable: [
      'Earth is drawn as a disc seen from above the North Pole, with the half on the side the sunlight comes from bright and the other half shaded, divided by a sharp straight edge.',
      'Those two halves never move. Six lines through the centre turn counterclockwise across them, and that turning is the only change in the disc.',
      'A small figure stands on the rim at the end of one of those lines and is carried round with them: it crosses the upper edge into the bright half, and later crosses the lower edge back into the shade.',
      'Dashes of sunlight flow in from one side and stop where they meet the globe, so the light plainly comes from one direction.',
      'A strip beside the globe records what the figure has been through, filling from its left end as the figure goes round, with a mark on it in the same colour as the figure standing for the present moment.',
      'By the end of one turn the strip stands half bright and half dark, and a dimension line under it reads that one turn of Earth is one day.',
      'The strip is marked only at sunrise, sunset and sunrise again; no hour is written on it.',
      'The strip empties and fills again with every turn, always starting from the moment the figure crosses into the light.',
      'A curved arrow outside the globe names the rotation and points the way the lines are going.',
    ],

    screen: {
      affordances: [
        'The globe turns by itself and the run repeats; the arrival point is just after the figure has crossed into the light, so it is already inside the bright half.',
        'Lit and shaded are drawn with brightness rather than colour, so the bright half reads as the bright one whether the surroundings are light or dark.',
        'The figure and its mark on the strip are the only things in the accent colour, which is what ties the two panels to one body.',
        'The edge between the halves is drawn sharp, with no band of half-light, so the reading asked for is which half a place is in.',
      ],
    },

    useWhen: [
      'The reader has been told that the Sun does not go round Earth, yet still narrates the day as the Sun crossing the sky. Watching the lit half sit perfectly still while a figure is carried through it puts the motion back where it belongs.',
      'The article needs a day to be one turn rather than a length of time, and a strip that fills to exactly half bright and half dark under a line reading one turn is one day will carry that.',
    ],

    avoidWhen: [
      'The article is about the sky as seen from the ground — where the Sun stands, how high it gets, what the stars do overhead. The view here is from outside, and nothing above anyone’s head is drawn.',
      'The point is that days differ in length, or that there are seasons. The two halves are exactly equal here and no tilt is drawn at all.',
      'Time zones, the date line or clock hours are the subject. The only marks are sunrise, sunset and sunrise.',
      'A day in hours is needed, or the difference between the sidereal and the solar day. No duration is written anywhere.',
      'The subject is the Moon, its phases or an eclipse. Only Earth is drawn, and nothing casts a shadow onto anything else.',
      'Continents, cities or a particular place on Earth are wanted. The globe carries nothing but the lines that show it turning.',
    ],

    contrastWith: [
      {
        concept: 'diurnal-motion',
        note: 'One tells the turn from outside, where the lit side is fixed and the ground moves; the other tells the same turn from the ground, where the sky appears to carry everything round instead.',
      },
      {
        concept: 'moon-phases',
        note: 'Both turn a body under a half of sunlight that never moves — one carries a place through that half in a day, the other turns which part of it is aimed at us over a month.',
      },
      {
        concept: 'seasonal-sun-path',
        note: 'One says that turning is why night follows day at all; the other takes that for granted and asks why one day’s worth of light lasts longer than another’s.',
      },
    ],
  },
};
