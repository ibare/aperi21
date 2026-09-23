/**
 * thermistor-and-ldr 개념 선언.
 *
 * 저항이 변하는 이웃들과 **무엇이 저항을 바꾸는가 · 그래서 무엇을 얻는가**로 갈랐다.
 *   thermistor-and-ldr        **바깥 세계**(온도 · 밝기)가 저항을 바꾸고, 그 변화를 **전압으로 읽는다**
 *   temperature-and-resistance 온도가 저항을 바꾸는 **까닭** — 금속 ↔ 반도체가 반대 방향
 *   potential-divider         나눔 자체 — 접점이 가른 **길이의 비**대로 전압이 나뉜다
 *   iv-characteristic         전압을 쓸었을 때 곡선의 **모양**
 * 이쪽만 감지기 · 입력 변환기 · 써미스터 · 광저항 어휘를 갖는다. 「비」 · 「접점」 ·
 * 「나뉜다」 는 potential-divider 에 두고, 이쪽은 **줄어드는 막대 → 오르는 바늘**로 쓴다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const thermistorAndLdrConcept: Aperi21ConceptSource = {
  id: 'thermistor-and-ldr',
  label: 'Sensing Warmth and Light as a Voltage',
  canonicalSim: 'aperi21:thermistor-and-ldr',

  surface: {
    definition:
      'That a thermistor loses resistance when warmed and a light-dependent resistor loses it when lit, so that pairing either one with a fixed resistance turns warmth or brightness into a voltage that can be read off.',
    exemplarKeywords: [
      'thermistor paired with a fixed resistor',
      'light dependent resistor',
      'LDR',
      'NTC resistance falls as it gets hotter',
      'dark resistance of an LDR',
      'temperature sensing circuit',
      'street lamp that switches on at dusk',
      'input transducer',
      'turning temperature into a voltage a circuit can use',
      'sensor and a fixed resistor',
      'frost alarm and light sensor',
      'a component that answers to its surroundings',
    ],
  },

  briefing: {
    observable: [
      'Two boards of identical build stand side by side, each with a supply rail above and a return rail below, a component in the upper place and a fixed resistance in the lower, and a dial between them reading the voltage across the lower one.',
      'The left board carries a thermistor with a thermometer beside it; the right board carries a light-dependent resistor with a lamp aimed at it.',
      'A thick bar runs out from each of the two resistances, both bars measured against one and the same scale, so the component and the fixed resistance can be set against each other by length alone.',
      'Behind the component bar a dotted outline stands at the length of its largest sample, and the gap between the bar and that outline is how far it has come down.',
      'Only one board moves at a time; the other holds still at its cold or its dark sample.',
      'As the mercury in the thermometer climbs, the thermistor bar shortens inside its outline and the needle and its bright arc grow together.',
      'When the mercury falls again the bar lengthens and the needle goes back to where it began.',
      'On the right, rays run from the lamp to the component with grains travelling along them, and further rays fill in from the middle outwards until there are several.',
      'While the rays fill in, that bar shortens and that needle rises in the same way the left board did.',
      'A resistance is written beside a bar only while it is standing still at a sample; while a bar is on the move it carries no figure and only its length speaks.',
      'The fixed resistance bar never changes on either board, so what shortens is always the component alone.',
      'When a component bar has fallen below the fixed resistance bar, the needle has passed the middle of its dial.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the thermistor is warmed and cooled, then the light on the other board is raised and lowered, and the run repeats.',
        'Both boards are built the same way from the same rails and the same fixed resistance, so the only differences on the screen are the component and what is done to it.',
        'The reading is taken across the fixed resistance rather than across the component, so the needle rises when the warmth or the brightness rises.',
        'Brightness is carried by how many rays arrive and by the grains running along them, with no colour and no glow used for it.',
        'Resistance is carried by bar length on one shared scale, so a fall is a shortening rather than a smaller number.',
        'The accent colour is spent entirely on the arc from zero to the needle, so it always means the voltage being read; both resistance bars stay in ink.',
        'Between the samples the resistance slides in the multiplying way these components actually behave, rather than evenly.',
      ],
    },

    useWhen: [
      'The article has named these components as sensors and the reader cannot see how a temperature becomes something a circuit can act on. Watching the bar shorten and the needle rise in the same movement is what joins the two halves of that sentence.',
      'The prose treats warmth and light as two instances of one arrangement, and needs the sameness to be visible — two boards built alike, differing only in the component and in what is done to it.',
    ],

    avoidWhen: [
      'The article is about why heating changes a resistance at all, or about metals and semiconductors answering heat in opposite directions. Both components here fall with the stimulus and no mechanism is shown.',
      'The subject is how the voltage comes to be split, or the ratio between two resistances. That splitting is machinery here; what is being asserted is that the reading follows the surroundings.',
      'A value is to be calculated, a resistance found at some particular temperature, or a curve of resistance against temperature read off. Only two samples are visited on each board and only those carry figures.',
      'The article turns on what is done with the reading afterwards — a comparator, a switch, a relay, an alarm firing at some level. Nothing is connected beyond the dial.',
      'The point is a component whose resistance rises rather than falls with the stimulus. Both components here fall.',
      'The reader is meant to set the temperature or the brightness themselves. The warming and the lighting run on their own.',
    ],

    contrastWith: [
      {
        concept: 'temperature-and-resistance',
        note: 'One takes the falling resistance as given and asks what useful thing can be built on it; the other asks why the resistance moves at all and sets two kinds of material against each other for their opposite answers.',
      },
      {
        concept: 'potential-divider',
        note: 'One has the pairing of two resistances as the machinery and the outside world as the subject; the other has the pairing itself as the subject and nothing outside the circuit acting on it.',
      },
      {
        concept: 'iv-characteristic',
        note: 'One holds the supply fixed and lets something outside the circuit change a resistance; the other leaves every component alone and sweeps the supply to find the shape of its answer.',
      },
      {
        concept: 'series-parallel-resistors',
        note: 'One joins two resistances in a line in order to read a voltage between them; the other joins them in order to ask what the pair together draws from the supply.',
      },
      {
        concept: 'wheatstone-bridge',
        note: 'Both read a resistance without measuring it directly, but one reads it as a voltage that moves with it, and the other adjusts until there is nothing left to read.',
      },
    ],
  },
};
