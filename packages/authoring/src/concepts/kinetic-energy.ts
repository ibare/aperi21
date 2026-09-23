/**
 * kinetic-energy 개념 선언.
 *
 * 형제는 `work-energy-theorem` 이다. 둘 다 일과 속력을 말하므로 **비를 갈랐다.**
 *   kinetic-energy       속력이 두 배면 **네 배** — 같은 마찰에 네 칸 미끄러진다 (제곱)
 *   work-energy-theorem  일이 같으면 **같은** 속력 — 힘과 거리를 어떻게 나누든 (1:1)
 * 이쪽만 제곱 · 네 배 · 멈추기까지의 거리 어휘를 갖고, 「한 일 = 속력 변화」 라는 등식
 * 자체는 말하지 않는다. `stopping-distance` 와는 주장이 다르다 — 그쪽은 멈추는 거리가
 * 주인공이고 여기서는 그 거리가 에너지를 재는 자일 뿐이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const kineticEnergyConcept: Aperi21ConceptSource = {
  id: 'kinetic-energy',
  label: 'Kinetic Energy',
  canonicalSim: 'aperi21:kinetic-energy',

  surface: {
    definition:
      'The energy a body carries by virtue of its speed, growing with the square of that speed, so that going twice as fast means holding four times as much.',
    exemplarKeywords: [
      'kinetic energy',
      'why is it a half m v squared',
      'twice the speed means four times the energy',
      'energy of a moving object',
      'speed squared in the energy',
      'why double speed is not double energy',
      'energy carried by motion',
      'sliding four times as far at twice the speed',
      'how much energy does a moving body hold',
      'the square in the kinetic energy formula',
    ],
  },

  briefing: {
    observable: [
      'Two identical blocks, the same size and the same colour, run into a rough floor at the same instant on two lanes stacked one above the other.',
      'The only difference between them is the speed on entry, carried by the length of the velocity arrow — the lower arrow is twice the upper, and they are marked v and 2v.',
      'While sliding, each block is held back by a friction arrow, and the two friction arrows are drawn the same length in both lanes, so the retarding force is visibly one and the same.',
      'A coloured trail grows behind each block as it slides; the trail is the distance friction has worked over, and the lower one lengthens strikingly faster.',
      'At the instant the upper block comes to rest, the lower one has passed the third tick and is still sliding — the moment at which an expectation of twice as far collapses.',
      'The trails settle at one cell and four cells, and a measuring line is drawn over each once its block has stopped.',
      'Tick lines run up through both lanes so the cells can be counted across from one lane to the other, one cell being the distance the slower block covered.',
      'Only symbols are written — v, 2v, d, 2d, 3d, 4d. No speeds, no distances and no energies appear as numbers.',
      'Friction arrows are removed once a block has halted, and the speed symbols are attached only while the speed is not yet changing.',
    ],

    screen: {
      affordances: [
        'The entry, the sliding and the settling of the two trails happen in order and then begin again, so the four-to-one comparison comes round on its own.',
        'The two lanes are stacked vertically and the blocks enter together, which makes where each one has got to at the same moment a matter of looking down a line.',
        'The run opens with both blocks already moving on screen rather than with an empty floor.',
        'The sliding stretch is played at half speed, because counting four cells in real time would be too quick to follow.',
      ],
    },

    useWhen: [
      'The article has written the square into the energy of a moving body and the reader is carrying it as an unexplained exponent. The two trails coming to rest at one cell and four is what makes the square a thing that happened.',
      'A passage argues that a small rise in speed costs disproportionately more, and a case is wanted where the same retarding force is visibly applied to both.',
    ],

    avoidWhen: [
      'The subject is how work is supplied to a body to get it moving, or how the same work can be divided between force and distance. Both blocks here arrive already moving and nothing pushes them.',
      'The article is about stopping safely, reaction time, braking distance on the road, or how far a vehicle needs to halt. The two trails here are a ruler for energy, not a study of stopping.',
      'The point is that friction does not depend on speed, or how a friction force is produced at all. The two friction arrows are given as equal from the start and nothing is argued about them.',
      'Energy stored in height or in a spring is what has to be shown, or a trade between two forms of energy. Nothing is stored here and nothing comes back.',
      'Numbers are wanted — a speed in metres per second, a distance, an energy in joules. Only ratios are written.',
      'The bodies compared differ in mass. The two blocks are drawn identical on purpose, so that only the entry speed differs.',
    ],

    contrastWith: [
      {
        concept: 'work-energy-theorem',
        note: 'One says how much a body carries at a given speed and finds a square; the other says equal work always buys equal speed however the force and the distance are divided, with no square in sight.',
      },
      {
        concept: 'stopping-distance',
        note: 'One uses the sliding distance as a measuring stick for the energy held; the other treats that distance as the answer being sought, together with what happens before the braking starts.',
      },
      {
        concept: 'gravitational-potential-energy',
        note: 'One is the energy a body has because it is moving, which rises with the square of speed; the other is the energy it has because of where it is, which rises in simple proportion to height.',
      },
      {
        concept: 'energy-dissipation',
        note: 'Both put friction to work, but one measures the mechanical energy that was there beforehand, while the other follows the energy after friction takes it and says where it ends up.',
      },
      {
        concept: 'kinetic-friction',
        note: 'One takes a fixed friction force as its measuring instrument; the other asks what that force itself depends on.',
      },
    ],
  },
};
