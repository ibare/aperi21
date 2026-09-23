/**
 * rc-circuit 개념 선언.
 *
 * 이 묶음에서 홀로 자기 쪽이 아니라 **회로**다. 형제는 오히려 이미 선언된 지수 이완들이라
 * 그쪽과 갈랐다.
 *   rc-circuit          **τ 마다 같은 비율**로 남은 차이가 줄어든다 (막대 계단으로 세어 보인다)
 *   damped-oscillation  같은 비가 **오가는 것의 봉우리 사이**에서 재어진다
 *   terminal-velocity   한계에 닿는 이유가 **속도를 따라 커지는 맞섬**이다
 *   charging-methods    전하를 **띠게 되는 방법** — 어느 쪽으로 전자가 갔는가
 * 이쪽만 「τ · 남은 차이 · ×0.368 · 저항을 키우면 τ 초만 바뀐다」 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const rcCircuitConcept: Aperi21ConceptSource = {
  id: 'rc-circuit',
  label: 'Charging and Discharging by Time Constant',
  canonicalSim: 'aperi21:rc-circuit',

  surface: {
    definition:
      'Charging and discharging a capacitor through a resistor, where the voltage still missing from the one being headed for falls away by the same fraction in each successive time constant.',
    exemplarKeywords: [
      'RC circuit',
      'time constant of a resistor and capacitor',
      'charging a capacitor through a resistor',
      'why does a capacitor fill quickly at first and then slowly',
      'exponential charging and discharging curve',
      'tau equals R times C',
      'capacitor voltage against time',
      'what a larger resistor does to the charging time',
      'the same fraction is given up in every tau',
      'waiting for a flash capacitor to fill',
    ],
  },

  briefing: {
    observable: [
      'On the left a loop is drawn with a battery, a zigzag resistor, a pair of plates and a switch with three contacts and a bypass wire, each part carrying its name.',
      'Dots travel along the wire and visibly slow as the run goes on, until they are barely creeping.',
      'Plus and minus marks gather on the two plates as the dots arrive, the newest one fading in rather than appearing whole.',
      'A short bar beneath the resistor shortens by exactly as much as the dots slow.',
      'On the right a graph is ruled along the bottom in marks one time constant apart, with a dashed level for the battery and a curve climbing toward it.',
      'At every ruled mark a bar is left standing between the curve and the level it is heading for, and the row of bars steps down like a staircase, each about a third of the one before it.',
      'Between neighbouring bars the factor itself is written, so the equal ratio is not left to the eye.',
      'After five marks the switch throws over to the bypass wire, the curve falls away toward the bottom and the same staircase of bars is built underneath it.',
      'The seconds that one time constant is worth is written once, at the top right, and the upright side of the graph carries no figures at all.',
      'The run is joined a little way into a charge rather than at an empty capacitor, and charge and discharge repeat without a break.',
    ],

    screen: {
      affordances: [
        'Three named settings in a row fix the resistance — small, standard and large — and taking one begins the run again from charging, so a curve is never half in one setting and half in another.',
        'The bottom of the graph is ruled in time constants rather than seconds, which is why the curve keeps exactly the same shape at all three settings and only the seconds written for one time constant change.',
        'Nothing else is offered: there is no play, pause or step, and the cycle repeats on its own.',
        'One colour is carried by the dots, by the marks on the plates and by the climbing curve, because all three are the charge; a second colour is kept for the gap still to be closed and is used by the staircase bars, by the bar under the resistor and by the written factor.',
        'How much is flowing is shown by how fast the dots travel rather than by a second curve, so only one curve is ever drawn.',
        'The parts of the circuit are named on the drawing, so the graph can be tied to the circuit without knowing the symbols.',
      ],
    },

    useWhen: [
      'The article has given the time constant as a product and the reader takes the exponential on trust. A staircase of bars measured at each ruled mark, with the ratio written between them, is where the same fraction every time constant becomes something counted rather than asserted.',
      'The prose needs the reader to see why the filling slows instead of going at a steady rate, and the dots slowing as the marks pile onto the plates puts the cause and the curve in one picture.',
    ],

    avoidWhen: [
      'The article is about alternating current, frequency, reactance or filtering. One switch throws over at a fixed point and nothing here goes back and forth.',
      'A number is wanted — a resistance in ohms, a capacitance in farads, a stored charge, or the percentage reached after one time constant. The only figures written are the seconds one time constant is worth and the ratio between neighbouring bars.',
      'The subject is how the current changes with time as a curve of its own. Flow appears here only as the speed of the travelling dots.',
      'The article is about what a capacitor is for, how its plates hold energy, or what its capacitance depends on. The capacitor is drawn as two plates and never taken apart.',
      'The reader is meant to rewire or build the circuit. The loop is fixed and only the resistance is offered, in three named steps.',
    ],

    contrastWith: [
      {
        concept: 'damped-oscillation',
        note: 'Both turn on a quantity keeping the same fraction of itself over equal stretches of time, but one is a single approach to a value it settles at, while the other measures that fraction from one swing to the next of something still going back and forth.',
      },
      {
        concept: 'terminal-velocity',
        note: 'One closes on what it is heading for by an equal fraction in each equal stretch, so the subject is how long it takes; the other closes on its limit because the opposition grows with the speed itself, so the subject is two forces coming into balance.',
      },
      {
        concept: 'charging-methods',
        note: 'One has charge driven along a wire until what has already gathered holds the flow back; the other is about how a body comes to be charged at all, and which way the electrons went.',
      },
    ],
  },
};
