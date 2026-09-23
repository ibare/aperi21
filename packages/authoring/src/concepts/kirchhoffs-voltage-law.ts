/**
 * kirchhoffs-voltage-law 개념 선언.
 *
 * 회로 법칙 셋 가운데 이쪽은 **고리** — 한 바퀴 돌아 제자리로 오는가.
 *   kirchhoffs-voltage-law      전위가 오르내리다 **출발한 높이로** 돌아온다, 거꾸로 돌면 부호만 뒤집힌다
 *   kirchhoffs-current-law      **마디** — 들어온 만큼 나간다
 *   emf-and-internal-resistance **전지 안** — 단자 전압이 내려간다
 * 고리·한 바퀴·전위 오름과 내림·부호 규약 어휘는 이쪽에만 둔다. 소자마다의 전압 값은
 * 화면에 없으므로 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const kirchhoffsVoltageLawConcept: Aperi21ConceptSource = {
  id: 'kirchhoffs-voltage-law',
  label: "Kirchhoff's Voltage Law Around a Loop",
  canonicalSim: 'aperi21:kirchhoffs-voltage-law',

  surface: {
    definition:
      'That walking once around a closed loop brings the potential back to the height it started from, the rises at the sources and the falls across the resistances cancelling exactly, and walking the other way merely exchanges every rise for a fall.',
    exemplarKeywords: [
      "Kirchhoff's voltage law",
      'the loop rule',
      'the voltages around a loop sum to zero',
      'potential rises and drops around a circuit',
      'why the drops add up to the supply voltage',
      'conservation of energy in a circuit',
      'sign convention going round a loop',
      'does it matter which way round the loop I go',
      'the voltage drop across each resistor',
      'a potential diagram of a circuit',
    ],
  },

  briefing: {
    observable: [
      'A loop carries two sources pushing the same way and three resistances of different size.',
      'A single point travels round the loop, and a panel on the right draws the potential at whatever place the point has reached.',
      'The drawn line climbs straight up between the plates of a source and slopes steadily down across the zigzag of a resistance.',
      'An arrow grows beside each step as the point passes an element, pointing up for a rise and down for a fall.',
      'The walk gives a rise, two falls, a rise and a fall, and finishes at the height it started from.',
      'A baseline in the accent colour then joins the start to the point one full turn along, so the two heights are seen to agree.',
      'The point turns and walks the other way, and because the panel measures across by the place on the loop rather than by the distance walked, the same staircase is retraced from the far end.',
      'The earlier walk stays faintly behind, so at every element a bold arrow and a faint arrow stand side by side pointing opposite ways.',
      'The reverse walk falls at the sources and rises at the resistances, and again ends level with where it began.',
      'No voltage figure is written for any element; only the two source voltages and the three resistance values, which were set.',
      'One arrow names the direction of the conventional current once, and the panel carries no numbered scale.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the loop is walked one way, then the other, and the run begins again.',
        'The panel measures across by the place on the loop rather than by how far the walk has gone, so both walks trace one and the same staircase and the reversal comes down to the direction of the arrows.',
        'The earlier walk is left faintly in place, so the reversal of every rise and fall is seen side by side instead of being held in memory.',
        'Both sources push the same way, so the first walk reads simply as rising at sources and falling at resistances, and the opposite case arrives with the reverse walk.',
        'The three resistances differ and the walk rises twice, so what cancels is not merely one climb against one descent.',
        'Rises and falls are separated by which way the arrow points rather than by colour, and the accent colour is kept for the claim that the walk ended where it began.',
        'The panel carries no scale, because the only thing being measured is whether the finish is level with the start.',
      ],
    },

    useWhen: [
      'The article has written the loop rule as a signed sum and the reader is unsure what decides the signs. A staircase retraced in the opposite direction, every arrow reversed and the finish still level, is where the convention stops looking arbitrary.',
      'The prose wants the loop rule read as energy per unit charge being conserved, and a height returned to after a full circuit is the form that carries it.',
    ],

    avoidWhen: [
      'The article has more than one loop, or a branch shared between loops. One loop is walked here and it is walked alone.',
      'A value in volts is to be read off for a particular element, or the sum is to be checked numerically. The panel carries no scale and no element has its drop written.',
      'The subject is what happens where wires meet, or how a current divides. This loop has no junction in it.',
      'A source is to oppose the others, driving the walk down where the rest drive it up. Both sources here push the same way.',
      'The source is to be treated as imperfect, sagging under load. The two sources hold their stated values throughout.',
      'Charge carriers are to be followed round the circuit. What travels here is a single marker for the place whose potential is being read.',
      'The article concerns a circuit whose current is changing, or an element that stores energy and gives it back. Everything here is steady.',
    ],

    contrastWith: [
      {
        concept: 'kirchhoffs-current-law',
        note: 'One is about a closed walk and what is conserved on returning to the start; the other about a place where wires meet and what is conserved in passing through it.',
      },
      {
        concept: 'emf-and-internal-resistance',
        note: 'One walks the whole loop and finds every rise and fall cancelling; the other stops at the source and divides it into the part that reaches the terminals and the part lost inside.',
      },
      {
        concept: 'conservative-force',
        note: 'Both turn on a round trip costing nothing, but one follows the potential around a circuit where the resistances give energy up for good, and the other is about work done by a force being the same whatever path is taken.',
      },
      {
        concept: 'conservation-of-mechanical-energy',
        note: 'Both return a quantity to its starting value after a complete circuit, but one tracks potential per unit charge around wires and elements, and the other trades height against speed for a moving body.',
      },
      {
        concept: 'series-parallel-resistors',
        note: 'One asks how the potential rises and falls all the way round; the other asks only what current the arrangement of two resistors draws from the supply.',
      },
    ],
  },
};
