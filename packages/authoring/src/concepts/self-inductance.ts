/**
 * self-inductance 개념 선언.
 *
 * 유도 다섯 가운데 이쪽만 **바깥에 원인이 없다** — 코일이 자기 자신의 전류 변화에 맞선다.
 *   self-inductance  코일이 **자기 자신의** 전류 변화에 맞서 전압을 만든다 (끊는 순간 불꽃)
 *   faradays-law     바깥 자석이 코일에 만드는 전압의 **크기**
 *   lenzs-law        유도의 **방향** — 힘은 늘 움직임을 거스른다
 *   motional-emf     움직이는 도체 속 전하가 갈라진다
 *   eddy-current     덩어리 도체 속 저절로 도는 전류가 움직임을 막는다
 * 이쪽만 「스위치 · 끊는 순간 · 불꽃 · 전지 전압을 넘는다 · 일정할 때는 0」 어휘를 갖는다.
 * 움직이는 물체가 하나도 없는 것도 이 조각뿐이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const selfInductanceConcept: Aperi21ConceptSource = {
  id: 'self-inductance',
  label: 'A Coil Opposing the Change of Its Own Current',
  canonicalSim: 'aperi21:self-inductance',

  surface: {
    definition:
      'That a coil answers changes in its own current with a voltage of its own: none at all while the current is steady, and one far above the battery the instant a switch breaks it.',
    exemplarKeywords: [
      'self-inductance',
      'why does a spark jump when a switch is opened',
      'back EMF from a coil',
      'an inductor opposes a change in current',
      'voltage spike when a current is interrupted',
      'a steady current through a coil produces no voltage',
      'the coil kicks back when the circuit is broken',
      'flyback voltage across a relay or a solenoid',
      'inductance measured in henries',
      'the voltage depends on how fast the current changes, not how large it is',
    ],
  },

  briefing: {
    observable: [
      'A single loop of circuit stands at the left — a battery down one side, a coil of five humps along the top, a switch along the bottom — and two charts stand at the right on a shared time axis, the upper one for the current and the lower one for the voltage across the coil.',
      'While the switch is closed an arrow along the right-hand side shows a steady current, the upper trace runs level, and the lower trace lies flat on its baseline, well below a dashed reference line marked with the battery\'s voltage.',
      'A large current is therefore running while the coil\'s voltage is nothing at all.',
      'The switch blade then swings out of the loop, and between its tip and the contact a zigzag and a burst of rays spring out in the accent colour.',
      'In that same instant the lower trace shoots almost vertically to some eight times the height of the dashed reference line, while the upper trace bends sharply downward.',
      'A vertical dotted line runs between the two charts to tie the spike in the one to the bend in the other as the same moment.',
      'The current arrow shortens as the current dies away, and the spark shrinks and fades in step with it, since it is the spark that is carrying the current across the open gap.',
      'With the blade fully open and the current at zero there is no spark and no arrow, both traces run along their baselines, and the lower chart is left with a single narrow peak on it.',
      'That solitary peak beside a long flat stretch is the whole argument: the voltage stood up only while the current was changing.',
      'The switch then closes again, the record fades away and the current arrow darkens back to its steady length.',
      'Only the battery\'s voltage is written down, on its own dashed line; the height of the peak is never given a number and the charts carry no scale marks.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the current runs steady, the switch is broken, the spark comes and goes, and the switch closes again.',
        'Two charts are stacked on one time axis so that the flat stretch of the current can be seen against the flat stretch of the voltage, and the bend in one against the spike in the other.',
        'The dashed line at the battery\'s voltage is the only yardstick offered, which makes the question how far above it the peak goes rather than how many volts it is.',
        'The break is drawn out over a fraction of a second instead of the thousandths a real one would take, so that the spark and the spike can be followed; since the time axis carries no marks, there is nothing on view that reads as the real duration.',
        'The current arrow is kept alive, shortening, after the blade has opened, and that brief impossibility — current still flowing through a switch that is open — is what the spark is for.',
        'Only the size of the coil\'s voltage is plotted, drawn upward, so the record is not asked to carry a sign as well.',
        'The accent colour is reserved for the spark alone, whose rays grow with the voltage and dim as it falls.',
        'The two charts are told apart by the names on their axes rather than by colour.',
      ],
    },

    useWhen: [
      'The article has said that an inductor opposes changes in current, and the reader hears it as a property with no consequences. A spark jumping a gap because the coil would not let its current stop is the consequence.',
      'The prose needs the distinction between a current being large and a current changing, and a big steady current sitting beside a flat zero voltage settles it in one frame.',
      'The article explains why switches, relays and motor windings need protection, and needs the size of the kick to be visible against the supply that produced it.',
    ],

    avoidWhen: [
      'The subject is the current rising gradually after a switch is closed, the time constant of a coil and resistor, or energy being stored in the coil as the current builds. Here the current is already steady when the picture begins and the closing is only a reset.',
      'The direction or sign of the induced voltage is the point, or which way the coil drives the current as it dies. Only the size is plotted, drawn upward.',
      'A voltage, an inductance, a resistance or a time is wanted as a number, or the peak is to be worked out from them. Only the battery carries a figure.',
      'The changing flux is to be drawn, or the field inside the coil, or the flux linkage that the voltage comes from. No field is shown at all.',
      'Something outside the circuit supplies the change — a magnet, a second coil, a moving conductor. Nothing here moves but the switch blade.',
      'The article is about alternating current, reactance, or how a coil behaves at different frequencies. One break is shown, once per cycle.',
      'The reader is meant to choose how fast the current is interrupted and watch the peak answer. The break is fixed.',
    ],

    contrastWith: [
      {
        concept: 'faradays-law',
        note: 'One needs something else to supply the change and asks what governs the size of the answer; the other has nothing outside it at all, the coil answering a change it is itself undergoing.',
      },
      {
        concept: 'lenzs-law',
        note: 'One is opposition to an external body in motion, readable as a force pointing back at it; the other is opposition to a change in a circuit, readable only as a voltage, with nothing moving to be pushed.',
      },
      {
        concept: 'motional-emf',
        note: 'One needs a conductor to be carried across a field before anything happens; the other has everything standing still and the change residing entirely in the current.',
      },
      {
        concept: 'eddy-current',
        note: 'One has currents that close on themselves in solid metal and spend themselves on braking; the other has a current confined to one wire that, when the wire is cut, forces its way across the gap instead.',
      },
    ],
  },
};
