/**
 * atwood-machine 개념 선언.
 *
 * 균형 셋 가운데 유일하게 **움직이는** 쪽이다. `equilibrium-of-forces` 와
 * `balance-scale` 이 「어디서 멈추는가 · 언제 수평인가」를 묻는 자리에서, 이쪽은
 * **균형이 깨진 몫이 가속도를 얼마로 정하는가**를 묻는다. 그래서 definition 의 주어가
 * 자리가 아니라 가속도이고, 이쪽만 합·차·0.1초 자취 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const atwoodMachineConcept: Aperi21ConceptSource = {
  id: 'atwood-machine',
  label: 'Atwood Machine',
  canonicalSim: 'aperi21:atwood-machine',

  surface: {
    definition:
      'Two weights joined by a cord over a pulley, whose rate of speeding up is set not by how heavy they are but by the difference between them measured against their total.',
    exemplarKeywords: [
      'Atwood machine',
      'two masses over a pulley',
      'what decides the acceleration of a pulley system',
      'connected bodies that move together',
      'the difference of the masses divided by the total',
      'pulley with unequal weights',
      'why does it come down so slowly',
      'blocks joined by a string over a wheel',
      'measuring gravity with a pulley',
      'heavier side wins but how fast',
    ],
  },

  briefing: {
    observable: [
      'Two machines stand side by side, each a pulley with a cord and two blocks — the heavier drawn in blue with its mass written on it, the lighter in grey.',
      'Both machines carry the same five kilograms in total; the left keeps its two blocks half a kilogram apart, and a written line under each machine names its difference.',
      'Both are released from one starting height, marked by a dashed line, and on each side the heavier block comes down to the floor.',
      'Each falling block stamps a dot every tenth of a second, so the two rows of dots can be set against each other mark for mark.',
      'The machine with the larger difference spreads its dots further apart — at twice the difference, twice as far in the same tenth of a second.',
      'Spokes on each pulley turn while its cord runs.',
      'When one machine lands first the caption names which it was; once both have landed it gives the two times taken over the same 1.6 m drop.',
      'Arriving, both machines are already two tenths of a second into their fall.',
    ],

    screen: {
      affordances: [
        'A slider sets the right machine’s difference between 0 and 2 kg in tenths, starting at one kilogram; the total stays at five, so its two blocks are always half the sum plus and minus that difference.',
        'Changing it releases both machines again from the top, so the two are compared from one clock rather than at whatever point the old run had reached.',
        'Set to zero, the right machine holds still while still carrying its five kilograms, and the caption says so.',
        'The fall and a hold of nearly two seconds at the bottom repeat on their own, so both the motion and the finished rows of dots come round without being asked for.',
      ],
    },

    useWhen: [
      'The reader expects the heavier load, or the bigger total, to be what decides how fast the thing comes down. Two machines of the same five kilograms coming down at visibly different rates is what takes that expectation apart.',
      'The article is about bodies joined so that they must move together, and the point needed is that such a pair has one rate of speeding up which neither weight owns by itself.',
    ],

    avoidWhen: [
      'The subject is the pull in the cord, or how two joined bodies act on each other through it. No cord force is drawn and nothing is said about tension.',
      'The pulley is there to lessen the force a person must supply. Nothing is lifted by hand here; both machines are simply let go.',
      'The article is about one body falling with nothing attached to it, or about the value of gravity.',
      'Friction at the axle, the mass of the pulley, or a cord that stretches is part of the argument. The machines here are clean.',
      'A formula or a number for the acceleration is wanted. The only figures on screen are masses, differences and the two landing times.',
    ],

    contrastWith: [
      {
        concept: 'equilibrium-of-forces',
        note: 'One takes an arrangement whose forces do not cancel and asks how quickly it then moves; the other asks what arrangement makes them cancel so that nothing moves at all.',
      },
      {
        concept: 'balance-scale',
        note: 'One hangs its two weights at equal distances and asks what an unequal pair does once released; the other keeps the pair unequal and at rest and asks what distance would make them balance.',
      },
      {
        concept: 'free-fall',
        note: 'One says a body coming down with nothing attached goes the same way whatever it weighs; the other ties a body to a second one and finds the pair’s descent then turning on how unequal the two are.',
      },
      {
        concept: 'connected-bodies',
        note: 'One is driven by the inequality of its two masses, so how the mass is divided is the whole of the answer; the other is driven by a force from outside, whose effect turns on the total however that total is divided.',
      },
    ],
  },
};
