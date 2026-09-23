/**
 * atmospheric-pressure 개념 선언.
 *
 * 압력 여섯 중 하나. 이쪽의 주장은 **머리 위 공기 기둥의 무게가 압력이다** — 올라가면
 * 위에 남은 공기가 줄어 압력이 준다. 액체가 아니라 기체이고, 깊이가 아니라 높이이며,
 * 재는 장치가 아니라 현상이다. 이쪽만 공기 · 하늘 · 산 · 머리 위 · 절반 어휘를 갖는다.
 *
 * 화면은 **곡선을 긋지 않는다** — 지수 감소는 주장이 아니라 avoidWhen 으로 되돌린다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const atmosphericPressureConcept: Aperi21ConceptSource = {
  id: 'atmospheric-pressure',
  label: 'Atmospheric Pressure as the Weight of the Air Overhead',
  canonicalSim: 'aperi21:atmospheric-pressure',

  surface: {
    definition:
      'The push the air makes by its own weight — the whole column of atmosphere standing overhead — which grows smaller as one climbs because less of that column is left above.',
    exemplarKeywords: [
      'atmospheric pressure',
      'the weight of the air above us',
      'why is the pressure lower on a mountain',
      'air pressure at altitude',
      'ears popping on the way up',
      'one atmosphere',
      'the air gets thinner higher up',
      'the atmosphere presses on everything',
      'half the air lies below six kilometres',
      'why water boils cooler high up',
    ],
  },

  briefing: {
    observable: [
      'Dots stand for air across the whole sky, each dot the same quantity of it, so they crowd close to the ground and thin out with height.',
      'A sensor climbs a mountain along its ridge, and the column of sky directly above it is lit: the dots inside that column glow while the rest stay grey.',
      'An arrow points downward onto the sensor’s upper face, and its length is the weight of the lit column.',
      'At the foot the column runs from just above the ground to the top of the sky and takes in the whole crowded lower layer, and the arrow is at its longest, marked p₀.',
      'As the climb goes on the foot of the column rises with the sensor, the crowded lower layer drops out from under it and loses its glow, and the arrow shortens.',
      'The arrow the sensor had at the foot stays behind as a faint copy on the lower slope, set apart sideways because the path goes up a ridge rather than straight up.',
      'At the summit the arrow is exactly half the faint copy and takes the name ½ p₀, and the dots left in the column are plainly fewer than at the start.',
      'The dots shift slightly all the while, so the air is never a still lattice.',
    ],

    screen: {
      affordances: [
        'The climb and the halt at the summit run by themselves in one round, so the reader arrives at the halving without doing anything.',
        'The lit column is the only thing in the accent colour, which turns "the air that is pressing on me" from a phrase into a single visible object.',
        'Every dot carries the same amount of air, so counting what is left inside the column is the same operation as reading the pressure.',
        'Nothing is numbered: the halving is carried by the live arrow against the faint one, and the dots carry the crowded layer emptying out from underfoot.',
      ],
    },

    useWhen: [
      'The article says the atmosphere presses because it has weight, and the reader has no picture of which column is meant. Lighting the sky directly overhead and shortening the arrow as its foot rises gives the phrase an object.',
      'The reader takes "the air is thinner up here" to be about what surrounds them rather than what is above them, and the moment wanted is the crowded lower layer dropping out from under the column.',
    ],

    avoidWhen: [
      'The precise way the pressure falls with height is at stake — the exponential, the scale height, the fact that the fall is not a straight line. No curve is drawn and only a single ratio, a half, is ever shown.',
      'The subject is measuring the atmospheric pressure, or a reading that changes with the weather. Nothing here measures anything; the height is what changes.',
      'The article is about a liquid rather than a gas, or about pressure growing with depth in one.',
      'The point is the density of air, the gas law, or temperature. The dots stand for amounts of air and nothing says why they are spaced as they are.',
      'Figures are wanted — hectopascals, kilometres, the height of the summit. Only p₀ and ½ p₀ are written.',
      'The subject is wind, weather systems or moving air. The dots shift in place and the air goes nowhere.',
    ],

    contrastWith: [
      {
        concept: 'hydrostatic-pressure',
        note: 'Both count what stands above, but one counts a liquid whose density never changes, giving exact proportion to depth, and the other a gas that thins as it goes up.',
      },
      {
        concept: 'barometer',
        note: 'One moves the observer and watches the pressure fall; the other keeps the observer put, lets the pressure change, and reads it off the height of a column of mercury.',
      },
      {
        concept: 'manometer',
        note: 'One asks what the air’s own pressure is and where it comes from; the other treats that air as the settled zero it measures a gas against.',
      },
    ],
  },
};
