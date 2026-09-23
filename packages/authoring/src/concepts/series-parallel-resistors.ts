/**
 * series-parallel-resistors 개념 선언.
 *
 * 저항 넷 가운데 이쪽은 **연결 방식**이다 — 낱개 저항 둘을 한 전지에 어떻게 잇느냐.
 *   series-parallel-resistors  한 줄로 이으면 적게, 나란히 이으면 많이 흐른다
 *   ohms-law                   저항 하나에 **전압**을 올린다
 *   resistance-and-geometry    도선 한 개의 **형태**를 바꾼다
 *   temperature-and-resistance 도선 한 개를 **데운다**
 * 직렬·병렬·합성·연결 어휘는 이쪽에만 둔다. 화면이 소자별 전류 **값**을 글자로 쓰는
 * 유일한 조각이라, 마디에서 세어 합치는 일(kirchhoffs-current-law)과는 다르게 갈라 둔다.
 * canonicalSim 은 주제의 `sim` 값 그대로 `aperi21:dc-circuit` 이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const seriesParallelResistorsConcept: Aperi21ConceptSource = {
  id: 'series-parallel-resistors',
  label: 'Series and Parallel Arrangements of Two Resistors',
  canonicalSim: 'aperi21:dc-circuit',

  surface: {
    definition:
      'That two resistors joined end to end behave differently from the same two joined side by side across one supply: the first arrangement draws less current from it than either resistor alone, the second draws more than either.',
    exemplarKeywords: [
      'resistors in series and in parallel',
      'combined resistance of two resistors',
      'equivalent resistance of a circuit',
      'why adding a resistor in parallel lets more current flow',
      'resistances in series add up',
      'reciprocal sum for parallel resistors',
      'total current drawn from the battery',
      'same two resistors wired two different ways',
      'current dividing between two branches',
      'does it matter how the two resistors are connected',
    ],
  },

  briefing: {
    observable: [
      'A circuit is drawn with a battery and resistor symbols, each carrying the value it has been set to in volts or in ohms.',
      'Three arrangements can be moved between: a single resistor across the battery, two resistors end to end in one loop, and two resistors on separate branches between the same pair of junction dots.',
      'Moving between them redraws the wiring, and the side-by-side arrangement shows the two points where the branches part and rejoin.',
      'A second display writes, above each resistor and above the battery, the current passing through it in amperes.',
      'In the end-to-end arrangement the two resistors and the battery all carry the very same figure, and it is smaller than the single resistor alone gave.',
      'In the side-by-side arrangement the two branch figures differ, the smaller resistance taking the larger share, and the battery figure is their sum and larger than either.',
      'Raising the supply raises every figure at once; raising either resistance lowers them in the way that arrangement dictates.',
      'Both resistance values carry over unchanged when the arrangement is changed, so the two wirings are compared on the same pair of resistors.',
      'The picture is still: it changes only when a value is changed or another arrangement is chosen.',
    ],

    screen: {
      affordances: [
        'Three sliders set the supply and the two resistances, and the drawing and the figures follow the moment they move.',
        'Three named arrangements are offered — one resistor, two end to end, two side by side — and the same two resistances carry across from one to the next, so what is compared is the wiring and nothing else.',
        'A second display writes the current through each resistor and through the battery; without it the drawing carries only the values that were set.',
        'The single-resistor arrangement is there as the case to measure the other two against, so that adding the second resistor is seen to help or to hinder.',
        'The supply holds whatever value it is given, however much the arrangement draws from it.',
        'Everything is read from written figures rather than from motion, so the reader chooses the numbers and reads what follows.',
      ],
    },

    useWhen: [
      'The article has given the two combination rules and the reader cannot see why one adds and the other does not. Carrying the same pair of resistors between the two wirings and watching what the battery delivers is where the asymmetry shows.',
      'The prose is working through a numbered example and the reader would gain from setting those same numbers and seeing the branch currents divide.',
    ],

    avoidWhen: [
      'The article treats the junction as a law in its own right, with what enters and leaves being counted. The branch figures are simply written out here; no counting or summing happens on screen.',
      'The subject is the potential around the loop, or which resistor takes the larger share of the voltage. Only currents are written and no potential is shown anywhere.',
      'The reader is meant to watch charge move. Nothing flows in the drawing; the current appears only as a figure.',
      'The battery is to be treated as imperfect, its terminal voltage sagging under load. The supply here holds its set value whatever is drawn.',
      'The subject is what makes one resistance larger than another — its length, its thickness, its material or its temperature. Here the two resistances are simply numbers that get set.',
      'More than two resistors are needed, or a network that is neither purely end to end nor purely side by side. Only the three arrangements are offered.',
      'The article is about which resistor heats more. Nothing on screen warms and no power is written.',
    ],

    contrastWith: [
      {
        concept: 'ohms-law',
        note: 'One keeps a single resistance and raises the supply to show the proportionality; the other keeps the supply and the two resistances and changes only how they are joined.',
      },
      {
        concept: 'resistance-and-geometry',
        note: 'One joins separate components and asks what the pair comes to; the other never joins anything, taking one piece of material and cutting it longer or thicker.',
      },
      {
        concept: 'kirchhoffs-current-law',
        note: 'One writes out branch and supply currents and leaves the reader to notice that they agree; the other makes that agreement the whole event, counting what passes and stacking the branches up against the trunk.',
      },
      {
        concept: 'kirchhoffs-voltage-law',
        note: 'One asks what the pair of resistors does to the current the supply delivers; the other asks how the potential rises and falls all the way round and comes back to where it started.',
      },
      {
        concept: 'emf-and-internal-resistance',
        note: 'One holds the supply voltage at its set value however heavily the wiring draws on it; the other is precisely about the supply failing to hold it.',
      },
    ],
  },
};
