/**
 * energy-in-capacitor 개념 선언.
 *
 * 축전기 넷 가운데 이쪽은 **담는 데 든 일**이고, 답이 **절반**이라는 비다.
 *   energy-in-capacitor        몫마다 커지는 일이 **삼각형**을 채우고, 직사각형 QV 의 절반이다
 *   parallel-plate-capacitor   같은 전압에서 **얼마나 담기는가** (기하가 정한다)
 *   dielectric                 담긴 뒤 **속을 채우면** 장이 약해진다
 *   capacitors-in-circuit      **둘을 합치면** 어떤 하나인가
 * 이쪽만 「한 몫씩 옮긴다 · 미는 힘이 커진다 · V–Q 직선 아래 띠 · 직사각형의 절반」 어휘를 갖는다.
 * 화면에 장이 없어 「전기장에 저장된 에너지」(u ∝ E²) 쪽은 avoidWhen 으로 되돌렸다 (간극 장부).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const energyInCapacitorConcept: Aperi21ConceptSource = {
  id: 'energy-in-capacitor',
  label: 'Why Charging Costs Half of Charge Times Voltage',
  canonicalSim: 'aperi21:energy-in-capacitor',

  surface: {
    definition:
      'That the work of charging a capacitor is the triangle beneath the straight voltage-against-charge line, exactly half the rectangle, because every portion carried across meets a higher voltage than the one before it.',
    exemplarKeywords: [
      'energy stored in a capacitor',
      'why is the stored energy half of Q times V',
      'one half C V squared',
      'area under the voltage against charge line',
      'work done in charging a capacitor',
      'the voltage rises as charge builds up on the plates',
      'where the factor of a half comes from',
      'charging a capacitor a little at a time',
      'each extra charge is harder to push on',
      'energy of a charged capacitor',
    ],
  },

  briefing: {
    observable: [
      'On the left two plates are drawn from the side, with the capacitance 2 μF written beside them, and a single plus named Δq rises from the lower plate to the upper.',
      'When that portion leaves, a minus is left behind in its place below; when it arrives, it becomes a plus above, and each portion keeps its own slot along the plates so the marks build up without shifting about.',
      'An arrow named F stands just outside the plates pointing upward; it holds one length while a portion is crossing and lengthens each time a new portion sets off, the first barely visible and the last reaching about two thirds of the gap.',
      'On the right stand a pair of axes named Q across and V up, with 6 V marked at the top of the upright one, and a straight line rising from the corner where they meet.',
      'As a portion rises, a strip grows upward in its own column of the graph, and at the moment the portion arrives the top of that strip meets the straight line.',
      'The strips stand side by side, each taller than the last, like steps.',
      'When all eight have gone across, the strips fill the triangle beneath the line with no gaps left between their tops and the line, and nothing sticking out above it.',
      'A dashed pair of sides then appears — one across at 6 V and one upright at the far end of the charge axis — closing a rectangle named QV, with the triangle of strips sitting underneath it.',
      'Finally ½QV is written in the accent colour on a small patch inside the triangle, alongside the dashed QV above it.',
      'No energy is written, no charge in coulombs, and no formula — only the names Q, V, Δq, F, QV and ½QV, and the two declared figures 2 μF and 6 V.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the portions cross one by one, the triangle fills, the rectangle appears, and the run begins again.',
        'Each strip is given the height of the average voltage its portion actually crosses, so the tops land exactly on the straight line and no sawtooth is left over between the strips and the line.',
        'The pushing arrow follows that same average, so the arrow outside the plates and the strip on the graph are saying one thing in two places.',
        'The strips are all one tone with only their side edges ruled, so a strip stands for one portion while the straight line stands for where their tops reach.',
        'The axes are fitted to the charge finally carried and the voltage finally reached, so the shape fills its frame whatever capacitance is written beside the plates.',
        'The accent colour is kept for the work that has been done — the strips and the name ½QV.',
        'The pushing arrow stands beside the plates at a fixed height rather than travelling with the portion, so it never runs into a plate.',
        'Nothing is given in energy units, because what is claimed is a ratio between two areas.',
      ],
    },

    useWhen: [
      'The article gives the stored energy as half the charge times the voltage and the reader cannot say where the half comes from, or suspects it of being an approximation left over from slicing. Strips whose tops land exactly on the line and fill the triangle with no gaps settles that it is not an approximation.',
      'The prose needs the reason the cost climbs as the charge builds. The arrow lengthening between one portion and the next, and each strip standing taller than the last, is that reason drawn in two places at once.',
    ],

    avoidWhen: [
      'The subject is a battery charging a capacitor and where the other half of what it supplies goes. No battery or resistor appears here; the charge is simply carried across.',
      'The subject is the energy held in the field itself, as an amount per volume of the gap. No field is drawn here at all; the whole account is kept in work done on charge.',
      'The subject is how the charging goes in time — a rising curve, a time constant, a current dying away. Nothing here is plotted against time.',
      'The subject is how much charge a given pair of plates will take, or how area and gap settle that. The arrangement here is never altered.',
      'Numbers are wanted — an energy in joules, a charge in coulombs, a calculation to be followed through.',
      'A capacitor is discharging, or giving its store back to something.',
    ],

    contrastWith: [
      {
        concept: 'parallel-plate-capacitor',
        note: 'One never changes the arrangement and asks what the charging cost; the other changes the arrangement and asks how much it will then take.',
      },
      {
        concept: 'work-by-variable-force',
        note: 'Both read a work as an area beneath a line, but one has a straight line, and the whole of its claim is that the area beneath it is half the rectangle that encloses it.',
      },
      {
        concept: 'capacitors-in-circuit',
        note: 'One stays with a single capacitor and accounts for the work of filling it; the other leaves the filling alone and asks what two of them together are equivalent to.',
      },
      {
        concept: 'dielectric',
        note: 'One is about what was paid to put the charge on the plates; the other takes the charge as already there and unable to change, and asks what putting matter in the gap does.',
      },
      {
        concept: 'elastic-potential-energy',
        note: 'Both are a store that grows as the square because what resists grows in step with what is done, but one pushes charge onto plates and reads the store as an area, while the other stretches a spring and reads it as what is given back.',
      },
    ],
  },
};
