/**
 * iv-characteristic 개념 선언.
 *
 * `ohms-law` 와 둘 다 V-I 평면이라 겹칠 위험이 가장 크다. **주장을 뒤집어 갈랐다.**
 *   ohms-law         비례가 **성립한다** — 점들이 한 직선에 놓이고 기울기가 저항이다
 *   iv-characteristic 비례가 **깨지는 소자가 있다** — 세 곡선의 **모양**을 한 평면에서 견준다
 * 기울기 · 비례 · 원점 지나는 직선 · V=IR 어휘는 저쪽에 두고, 이쪽은 휨 · 문턱 ·
 * 역방향 · 비선형 어휘만 갖는다. `temperature-and-resistance` 와도 갈랐다 —
 * 전구가 눕는 까닭(뜨거워짐)은 캡션 한마디이고, 금속 ↔ 반도체 견줌은 저쪽 몫이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const ivCharacteristicConcept: Aperi21ConceptSource = {
  id: 'iv-characteristic',
  label: 'Components Whose Current-Voltage Trace Is Not Straight',
  canonicalSim: 'aperi21:iv-characteristic',

  surface: {
    definition:
      'That not every component answers a swept voltage with a trace that stays straight: a filament lamp bends over as it heats, and a diode hugs zero until a threshold is passed and then soars.',
    exemplarKeywords: [
      'non-ohmic component',
      'characteristic curve of a component',
      'filament lamp current voltage graph bends over',
      'why does a bulb stop obeying the simple rule',
      'diode turn-on voltage of nought point seven volts',
      'diode conducts one way only',
      'reverse biased diode passes nothing',
      'the knee of a diode curve',
      'a lamp is not ohmic',
      'comparing a resistor, a lamp and a diode',
      'sweeping the supply and plotting what comes out',
      'graph curves instead of staying straight',
    ],
  },

  briefing: {
    observable: [
      'One plane carries current upward and voltage across, the voltage axis beginning to the left of the origin in the reverse direction and running out to the right.',
      'Only two marks stand along the voltage axis, one at the diode threshold and one at the far end, and the upright axis carries no scale at all.',
      'A bright point sweeps from the reverse end through the origin and onward, leaving an ink trace behind it, and a dotted line drops from the point to the voltage axis so the sweeping of the voltage is watched below.',
      'The first sweep is a plain resistance and its trace comes out dead straight from end to end, and it stays on the plane for the rest of the run.',
      'The second sweep is a lamp, and near the origin its curve lies along the straight one before parting from it and leaning further and further over as the voltage grows.',
      'The third sweep is a diode: the point crawls along the voltage axis itself, through the reverse end and the origin and right up to the threshold mark, with its curve flat on the axis all the way.',
      'Where the other two curves have gone below the axis in the reverse direction, the diode curve alone sits at nothing.',
      'Just past the threshold mark the diode curve turns upright and climbs almost vertically, and the dotted line stays clamped beside the threshold while the point runs up.',
      'Each curve carries the name of its component; the resistance and the lamp names travel with the point, and the diode name waits high up where its curve will arrive.',
      'At the end all three traces stand together on the one plane — the straight one, the one leaning over beneath it, and the one bent at a right angle — before they fade and the sweeps begin again.',
      'The point moves evenly along the curve rather than evenly along the voltage, so the crawl and the climb of the diode are both given time to be seen.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the three sweeps run one after another on the one plane and the run repeats.',
        'All three traces are drawn in the same ink, and the components are told apart by the shape of their curve and by a name, never by colour.',
        'The accent colour is kept for the one point that is being swept, so it always means the current at the voltage reached so far.',
        'The lamp is given the same resistance when cold as the plain resistance has, so the two curves start out lying on one another and the parting is watched rather than assumed.',
        'The earlier traces stay on the plane while the later ones are drawn, so the bending and the bending back are compared against a straight line that is still there.',
        'The dotted line falls away to nothing whenever the point is lying on the voltage axis, so a crawl along the axis shows as no line at all.',
        'No current or resistance is written anywhere, and no circuit or component symbol is drawn; the shapes and the two axis marks carry the whole account.',
      ],
    },

    useWhen: [
      'The article has stated that some components do not answer voltage in proportion, and the reader needs the failure itself rather than the word for it. Three sweeps onto one plane, with the straight trace left standing while the other two depart from it, is what turns the claim into a comparison of shapes.',
      'The prose needs a threshold to be a place rather than a number — the diode crawling along the axis right up to a marked voltage and then standing up at it.',
    ],

    avoidWhen: [
      'The article is about the proportional case itself — what the slope of such a graph means, or that doubling the voltage doubles the current. The straight trace is present here only as the thing the others depart from.',
      'The subject is why a conductor heats or how metals and semiconductors differ in their answer to heat. The lamp here is one curve among three and its heating is named in passing.',
      'A value is to be worked out in amperes, in ohms or in volts. Only two voltages are marked and nothing else on the plane carries a figure.',
      'The article turns on how a diode is used — rectifying, a circuit around it, or which way round it is connected. No circuit is drawn and nothing is connected to anything.',
      'The point is reverse breakdown, or what a diode does at large reverse voltages. The reverse end here is short and the curve simply lies at nothing across it.',
      'The reader is meant to choose a component or sweep the voltage themselves. The three sweeps run in a fixed order.',
    ],

    contrastWith: [
      {
        concept: 'ohms-law',
        note: 'One asserts that the proportion holds and reads a resistance off the straightness; the other asserts that the proportion is a special case and puts two components beside it that break it in different ways.',
      },
      {
        concept: 'temperature-and-resistance',
        note: 'One is about the shape a trace takes as the voltage is swept, with heating mentioned only as the reason one trace leans; the other is about heating itself and about two kinds of material answering it in opposite directions.',
      },
      {
        concept: 'emf-and-internal-resistance',
        note: 'Both show a trace that is not the simple rising straight line, but one departs because of what the component does, and the other because of what is happening inside the supply.',
      },
      {
        concept: 'resistance-and-geometry',
        note: 'One keeps each component as it is and asks how its current answers a changing voltage; the other keeps the voltage fixed and asks what the shape of a conductor does to its resistance.',
      },
      {
        concept: 'digital-vs-analog-signal',
        note: 'Both turn on a threshold at which behaviour changes abruptly, but one has the threshold as a property found in a component, and the other has it as a decision imposed on a signal.',
      },
    ],
  },
};
