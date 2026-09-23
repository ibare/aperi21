/**
 * wheatstone-bridge 개념 선언.
 *
 * 이 묶음에서 이쪽만 **재는 법**을 주장한다 — 값을 읽는 것이 아니라 **0 을 맞춰** 얻는다.
 *   wheatstone-bridge  가운데 두 마디의 전위를 같게 맞추면 계기가 0 에 서고, 그 자리에서 읽는다
 *   ohms-law           여러 전압에서 **읽어** 기울기로 저항을 얻는다
 *   kirchhoffs-*       회로가 지키는 **법칙**이지 재는 절차가 아니다
 * 평형·널·검류계·가변 저항·미지 저항 어휘는 이쪽에만 둔다. 평형 조건식은 화면에 없으므로
 * avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const wheatstoneBridgeConcept: Aperi21ConceptSource = {
  id: 'wheatstone-bridge',
  label: 'Measuring a Resistance by Bringing a Bridge to Balance',
  canonicalSim: 'aperi21:wheatstone-bridge',

  surface: {
    definition:
      'That an unknown resistance can be found without reading any current at all, by adjusting a known one until the two middle nodes sit at the same potential and the instrument between them comes to rest at zero.',
    exemplarKeywords: [
      'Wheatstone bridge',
      'null method of measurement',
      'a balanced bridge',
      'the galvanometer reads zero',
      'measuring an unknown resistance accurately',
      'the balance condition of a bridge',
      'why a null measurement is more accurate than a reading',
      'adjusting a variable resistor until no current flows through the meter',
      'two points brought to the same potential',
      'metre bridge and slide wire',
    ],
  },

  briefing: {
    observable: [
      'The circuit is drawn as a ladder: an upper arm of two resistances with a node between them, a lower arm of two more with a node between them, the two middle nodes one directly above the other, and an instrument standing between them.',
      'The instrument is a dial with its zero at the centre, a needle on a pivot, a shaded sector that grows with the reading, and an arrow beside it naming which way the current runs through it.',
      'On the right a panel shows the potentials of the two middle nodes as two marks at their heights, with a bar in the accent colour drawn between them whenever they differ.',
      'The adjustable resistance climbs in fixed steps, and at each step the lower node’s mark comes closer to the upper, the bar shortens, the sector narrows, the arrow shrinks and the needle swings back towards zero.',
      'At balance the two marks sit at one height, the bar, the sector and the arrow all vanish together, and the needle stands straight up on the zero mark.',
      'Only at that moment does the unknown resistance show its value; at every other step its place reads as a question mark.',
      'Past balance the lower mark drops below the upper, the bar grows out on the other side, the needle swings the opposite way and the arrow reverses.',
      'The adjustment then runs back down through balance to where it started.',
      'The panel does not begin at zero: its two ends carry their own voltages, because the difference being watched is a fraction of a volt.',
      'Nowhere is the relation between the four resistances written down.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the adjustable resistance is turned up past balance and brought back again, and the run begins once more.',
        'The adjustment moves only in steps of a fixed size, so its reading is always one of the settings it can actually take, and the turning reads as the click-by-click of a measurement.',
        'The instrument is built with its zero at the centre and carries no figure at all, because the only thing it has to say is whether it reads zero.',
        'The panel of node potentials is there so that the needle standing at zero has a reason on screen: the two nodes have been brought to the same height.',
        'The panel shows only a narrow window of voltage rather than the whole range, since the difference at stake is small next to the supply.',
        'Which way the meter current runs is given by which way the arrow points rather than by colour, and its length follows the size of that current.',
        'The unknown value appears only at balance, because the reading is what balance produces and not something available beforehand.',
      ],
    },

    useWhen: [
      'The article has given the balance condition as a ratio and the reader cannot see why anyone would measure this way at all. A needle brought to rest at zero, with the unknown value appearing only then, is what makes a null method a method rather than a formula.',
      'The prose needs the reason the needle rests — two nodes brought to the same potential — rather than the bare fact that it rests.',
    ],

    avoidWhen: [
      'The balance condition is to be derived or checked, or the ratio of the arms computed. The relation between the four resistances appears nowhere on screen.',
      'The article is about an instrument’s own resistance, about how a meter loads the circuit it is put into, or about measurement uncertainty. This instrument says only zero or not zero.',
      'The subject is the current a supply delivers or the potential across an ordinary element. Only the two middle nodes are shown, and only within a narrow window.',
      'The reader is to turn the adjustment and find balance for themselves. The turning runs by itself, past balance and back.',
      'A strain gauge, a temperature-sensitive resistance or another sensor read by a bridge is the subject. The unknown here is a plain fixed resistance.',
      'The article is about a slide wire with a moving contact and a length ratio. What is adjusted here is a resistance in fixed steps.',
      'An alternating supply, or a bridge balanced for anything other than resistance, is the subject. The supply here is steady throughout.',
    ],

    contrastWith: [
      {
        concept: 'balance-scale',
        note: 'Both find an unknown by adjusting a known one until an indicator returns to zero, so that nothing has to be read off a graduated scale; one balances potentials against a meter, the other weights against a beam.',
      },
      {
        concept: 'ohms-law',
        note: 'One gets a resistance without reading any current at all; the other reads the current at several voltages and makes the resistance the slope the readings lie on.',
      },
      {
        concept: 'emf-and-internal-resistance',
        note: 'One arranges for no current to pass through the instrument, so nothing is disturbed by the measuring; the other is about what drawing current does to a source, which is why drawing none is worth arranging.',
      },
      {
        concept: 'kirchhoffs-voltage-law',
        note: 'One brings two points of a network to the same potential so that nothing flows between them; the other walks one loop and accounts for every rise and fall along the way.',
      },
      {
        concept: 'series-parallel-resistors',
        note: 'One is about reading an unknown resistance off an arrangement brought to balance; the other about what a pair of known resistances does to the current a supply delivers.',
      },
    ],
  },
};
