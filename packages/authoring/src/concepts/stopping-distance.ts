/**
 * stopping-distance 개념 선언.
 *
 * 이 묶음에서 유일하게 가속도가 주어가 아닌 응용 조각이다. 주어는 **도로 위의 거리**
 * 이고, 주장은 「두 몫이 속력을 서로 다르게 먹는다 — 앞은 비례, 뒤는 제곱」이다.
 *
 * 형제 넷과 어휘가 겹치지 않는다. 이쪽만 운전·반응 시간·제동·안전거리 어휘를 갖고,
 * 화살표·몫·중심·굽음 어휘를 쓰지 않는다. 등가속 운동 자체는
 * `uniformly-accelerated-motion` 의 몫이라 contrastWith 로 잇는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const stoppingDistanceConcept: Aperi21ConceptSource = {
  id: 'stopping-distance',
  label: 'Stopping Distance',
  canonicalSim: 'aperi21:stopping-distance',

  surface: {
    definition:
      'The road used up between spotting a hazard and standing still: a reaction stretch growing in step with the speed and a braking stretch growing with its square.',
    exemplarKeywords: [
      'stopping distance',
      'thinking distance and braking distance',
      'reaction time at the wheel',
      'why doubling the speed more than doubles the distance to stop',
      'braking distance goes as the square of the speed',
      'how far a car runs on before it stops',
      'following too close',
      'speed limits and road safety',
      'highway code stopping distances',
      'a moment of reaction before the brakes bite',
    ],
  },

  briefing: {
    observable: [
      'Three cars stand one above another in three lanes, each with its speed written over it — thirty, sixty and ninety kilometres an hour — and each with its own pale band of road running away to the right.',
      'A dashed upright line crosses all three lanes at the place where the hazard is spotted, and the three cars reach that line at the same instant.',
      'From the line each car lays down a grey stretch while it goes on at its speed, and the three grey stretches come out as one, two and three of the same length.',
      'A brake light then shows at the back of each car and what it lays down turns to the accent colour; those stretches come out far more unequal than the grey ones did.',
      'The cars come to a stand one after another, the slowest first and the fastest last, and the fastest halts exactly at the far end of its road band.',
      'As each car stops, the length of each of its two stretches is written inside the stretch; the top lane has the two named in words and the two lanes below carry the figures alone.',
      'Once all three have stopped, dividing marks appear across the stretches, cutting each into repeats of the slowest car’s own — one, two and three of them in the grey, and one, four and nine in the accent colour.',
      'The marks carry no numbers, so the multiples are there to be counted off the picture rather than read.',
      'The line under the road follows the run: the three meet the same hazard, the brakes are not on yet through the reaction second, the accent stretch opens up at the back, and at the end that three times the speed means three times the reaction distance and nine times the braking distance.',
      'The whole run starts over from the approach.',
    ],

    screen: {
      affordances: [
        'The three speeds run together off one clock and repeat by themselves, so all three results stand on screen at the same moment instead of arriving one after another to be held in memory.',
        'The three cars are alike in everything but speed and they meet the hazard line at the same instant, so the stretches behind them are all measured from one place.',
        'The dividing marks are laid in units of the slowest car’s own stretches, which turns the multiple into something counted rather than something read.',
        'The words naming the two stretches are put on the top lane only, which leaves the two lanes below to be read as bare lengths.',
        'The reaction second and the rate of braking are shared by all three and are not offered to be changed, so speed is left as the one thing that differs.',
      ],
    },

    useWhen: [
      'The reader has been handed the square law for braking distance and is carrying it as a formula; counting nine of the slowest car’s braking stretches inside the fastest car’s is what turns the exponent into a length of road.',
      'The writing is about following distance, a speed limit or how a road is used, and the stop has to be kept in two pieces — the piece that belongs to the driver’s reaction and the piece that belongs to the brakes.',
    ],

    avoidWhen: [
      'The subject is what the brakes do — friction, tyres, road surface, wet or dry, anti-lock. All three cars slow at one unchanging rate and nothing of the braking itself is drawn.',
      'The point is a particular driver, or how reaction time differs between people or with tiredness. One reaction second is shared by the three and its value is nowhere on screen.',
      'The article is about a collision, an impact, or what follows when a vehicle does not stop in time. Every car here comes to rest on its road band with nothing ahead of it.',
      'A single total figure for the stop is what the argument turns on. The two stretches carry their own figures and their sum is never written.',
    ],

    contrastWith: [
      {
        concept: 'uniformly-accelerated-motion',
        note: 'One is about how the ground a steady slowing eats up answers to the speed it started from; the other is about how that ground piles up from step to step within a single run.',
      },
      {
        concept: 'uniform-motion',
        note: 'One uses unchanging speed as the short first piece of a stop, the piece the brakes have no share in; the other takes unchanging speed as the whole of its subject.',
      },
      {
        concept: 'direction-of-acceleration',
        note: 'One asks what an acceleration pointing against the motion costs in road, and answers in metres; the other asks only whether it points with the motion or against it.',
      },
    ],
  },
};
