/**
 * diurnal-motion 개념 선언.
 *
 * 같은 자전을 다루는 형제가 `earth-rotation-day-night` 다. **시점과 주장을 갈랐다.**
 *   diurnal-motion            땅에서 올려다본 **하늘** — 한 점을 가운데 두고 한 덩어리로, 같은 각만큼 돈다
 *   earth-rotation-day-night  밖에서 내려다본 **지구** — 밝은 반쪽은 제자리, 관측자가 실려 지나간다
 * 이쪽만 별 · 궤적 · 별자리 모양 · 천구의 북극 어휘를 갖는다. 낮 · 밤 · 해 뜸 · 해 짐은 쓰지 않는다.
 * 태양의 길은 화면에 없어 `seasonal-sun-path` 에 넘기고 avoidWhen 으로 되돌린다(간극 장부 참조).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const diurnalMotionConcept: Aperi21ConceptSource = {
  id: 'diurnal-motion',
  label: 'Diurnal Motion of the Stars',
  canonicalSim: 'aperi21:diurnal-motion',

  surface: {
    definition:
      'The apparent turning of the whole night sky as one piece about a single fixed point once a day, every star sweeping the same angle along its own circle.',
    exemplarKeywords: [
      'diurnal motion',
      'star trails',
      'why do the stars move across the sky at night',
      'circumpolar stars',
      'the stars circle around Polaris',
      'long exposure photograph of the night sky',
      'the celestial pole',
      'the Big Dipper swings round through the night',
      'the sky turns once a day',
      'apparent motion of the stars',
    ],
  },

  briefing: {
    observable: [
      'The northern sky is drawn as it stands over one latitude, which is written into the title of the window, with the horizon running across the bottom and marks for north, east and west along it.',
      'Every star drags a trail behind it from where it began to where it now is, and each trail is an arc of a circle centred on the same star, which is drawn in the accent colour and named Polaris.',
      'The Big Dipper and Cassiopeia keep their shapes exactly while they turn counterclockwise, each leaving a faint copy of itself at its starting place.',
      'The trails belonging to those two groups are drawn thicker than the rest, and all of them break off at the same angle however large or small the circle each star rides.',
      'Stars far from the pole, such as the one at the end of the Dipper’s handle, sink below the horizon and come up again.',
      'A dial at the right has a hand that leaves dusk and turns the same way as the sky and through the same angle, so the fan it has swept is the angle every star has turned.',
      'Its marks are the words dusk, midnight, dawn and noon, with no reading of the hour anywhere.',
      'Through the stretch that stands for daytime the stars are still drawn and still turning at the same rate, and the caption says that sunlight merely hides them.',
      'After a full day every trail has closed into a complete circle, the two constellations stand where they started, and the dial’s fan is full.',
      'Polaris is itself drawn tracing a tiny ring, a little short of the exact point all the other circles are centred on.',
    ],

    screen: {
      affordances: [
        'The day fast-forwards by itself and starts over; nothing has to be pressed, and about an hour and a half has already run on arrival, so trails are already drawn.',
        'The sky is projected with the celestial pole at the centre, which keeps every trail an exact circle and every constellation’s shape unchanged, at the cost of a horizon that curves slightly upward at the sides.',
        'The accent colour is kept for the pole star alone, so which point every circle is centred on needs no legend.',
        'The two constellations are drawn from real positions, so that a shape held through a turn is a shape one can recognise rather than one to take on trust.',
      ],
    },

    useWhen: [
      'The article has said that the stars wheel about the pole, and the reader pictures them drifting each on its own errand. Trails of every size breaking off at one shared angle is what turns a whole sky turning as one piece into something looked at.',
      'The prose needs the night and the day to be one motion rather than two, and a stretch where the stars keep turning at the same rate while the caption says only that sunlight hides them will carry it.',
    ],

    avoidWhen: [
      'The subject is the Sun — where it comes up, how high it climbs, how long it stays. No Sun is drawn at any point, and the daytime stretch keeps showing stars.',
      'The article is about seasons, or about which constellations belong to which month. The same stars return to the same places after a single day here.',
      'The point is the difference between a sidereal day and a solar day. A day is exactly one turn here and the two are never separated.',
      'Earth itself has to be drawn turning, or an observer has to be carried out of darkness into daylight. Everything here is the view upward from one spot on the ground.',
      'The setting is the tropics, the equator or the southern hemisphere. One northern latitude is fixed, and only the northern sky is in view.',
      'Star names, magnitudes or the appearance of a real sky are wanted. Apart from two constellations and the pole star, the stars are scattered.',
    ],

    contrastWith: [
      {
        concept: 'earth-rotation-day-night',
        note: 'One tells the turn from the ground, where the sky is what appears to carry everything round; the other tells the same turn from outside, where the lit side is fixed and the ground is what moves.',
      },
      {
        concept: 'seasonal-sun-path',
        note: 'One follows the stars through a whole day with the season held still; the other follows the Sun through a day and asks what changing the season does to that one track.',
      },
      {
        concept: 'earth-revolution-constellations',
        note: 'One is the nightly turn that brings the same stars back within a day; the other is the yearly change in which stars are up at midnight at all.',
      },
      {
        concept: 'coriolis-effect',
        note: 'Both are what a turning vantage does to what is seen from it — one bends the path of a body actually thrown, the other swings a whole sky that is not moving.',
      },
    ],
  },
};
