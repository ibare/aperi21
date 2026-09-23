/**
 * faradays-law 개념 선언.
 *
 * 유도 다섯은 definition 이 가장 붙기 쉬운 자리다. **무엇을 주장하는가**로 갈랐다.
 *   faradays-law     유도 전압의 **크기** — 빨리 밀수록 · 많이 감을수록 크고, 멈추면 0
 *   lenzs-law        유도의 **방향** — 전류는 뒤집혀도 힘은 늘 움직임을 거스른다
 *   motional-emf     움직이는 도체 **속에서** 전하가 갈라지는 기작 — 양 끝이 + 와 −
 *   eddy-current     회로 없는 **덩어리 도체** 속에서 저절로 도는 전류가 움직임을 막는다
 *   self-inductance  코일이 **자기 자신의** 전류 변화에 맞서 전압을 만든다
 * 이쪽만 「얼마나 큰가 · 빠르기 · 감은 수 · 멈추면 0」 어휘를 갖는다. 방향 · 부호는
 * lenzs-law, 회로 속 전류와 제동은 eddy-current 의 몫이라 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const faradaysLawConcept: Aperi21ConceptSource = {
  id: 'faradays-law',
  label: 'How Big the Induced Voltage Is',
  canonicalSim: 'aperi21:faradays-law',

  surface: {
    definition:
      'That the voltage induced in a coil is set by how quickly a magnet is driven through it and by how many turns it has, and drops back to nothing the instant the magnet stops.',
    exemplarKeywords: [
      "Faraday's law",
      'how large is the induced voltage',
      'moving the magnet faster gives a bigger voltage',
      'more turns on the coil more voltage',
      'induced electromotive force',
      'rate of change of magnetic flux',
      'why the voltage vanishes when the magnet is held still',
      'pushing a magnet into a coil of wire',
      'a generator gives more output when spun faster',
      'what determines the size of an induced EMF',
    ],
  },

  briefing: {
    observable: [
      'A coil, drawn from the side as a run of rings, has two leads going off to a chart at the right where a trace is written from left to right from a common origin.',
      'A magnet approaches the coil carrying a short arrow labelled with a speed, and while it travels the trace swells into a low, broad hump with a point marking where the pen is now.',
      'The magnet reaches the middle of the coil and stops; the arrow disappears and the trace settles onto the bottom line and runs along it.',
      'The same magnet returns to its starting place and comes in again with an arrow twice as long, and the new hump is twice as high and half as wide as the first, which is now left behind dotted and faint.',
      'Stopped again, the second trace also drops to the bottom line, and the two humps stand side by side for comparison.',
      'The coil is then wound more closely — the same length but twice as many rings, the label beneath it changing accordingly — and the magnet comes in once more at the faster speed.',
      'The third hump rises to twice the height of the second and four times the first, and its label names both the speed and the turns.',
      'Each hump keeps a small name beside it so that the three can be told apart without colour: all three traces are drawn in the same ink, the current one solid and the earlier ones dotted.',
      'The arrow above the magnet exists only while the magnet is moving, and its length is proportional to the speed, so a still magnet carries no arrow at all.',
      'Nothing on the chart is numbered — no scale marks, no voltage, no time.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the three runs go by in order — slow, fast, and fast with more turns — and the cycle repeats.',
        'All three traces are written from the same origin on the same chart at the same scale, so their heights and widths can be compared directly.',
        'The travel distance and the magnet are identical in all three runs, leaving the speed as the only thing that differs between the first two and the winding as the only thing that differs between the last two.',
        'Lengthening the coil is avoided when the turns are increased — the rings are simply packed closer over the same length — so nothing suggests that a bigger coil is what did it.',
        'The magnet is withdrawn by having it fade where it stopped and reappear at the start, so only pushing in is ever shown and only one sense of voltage is drawn.',
        'Height on the chart is the whole measurement, and since no scale marks appear, the question asked can only be which trace is higher.',
        'The pen point riding at the end of the current trace is what stands in for a needle jumping in real time.',
      ],
    },

    useWhen: [
      'The article has said that the induced voltage depends on how fast the flux changes, and the reader has read that as a formula rather than a fact. Two humps from identical pushes, one twice as high and half as wide as the other, makes the speed dependence something seen.',
      'The prose needs the number of turns to enter as a second, independent way of making the voltage larger, and the third run supplies it without changing anything else.',
    ],

    avoidWhen: [
      'The article is about which way the induced current or voltage goes, or about the minus sign, or about the magnet being resisted as it enters. Only pushing in is shown, only one sense is drawn, and no force on the magnet appears.',
      'Flux itself is the subject — what it is, how the lines through the coil change in number as the magnet nears. No field lines and no flux are drawn; the argument runs on speed and turns.',
      'The article needs the magnet withdrawn, or moved back and forth, or a voltage that alternates. The magnet only ever enters, and then reappears at the start.',
      'A voltage is wanted in volts, or the area under a hump is to be discussed, or the law is to be applied to a value. Nothing on the chart carries a number.',
      'The subject is a current flowing in a closed circuit, a lamp being lit, or power being delivered. The leads go only to the chart.',
      'The conductor moves and the magnet stands still, or a straight wire rather than a coil is involved. Here the coil is fixed and a magnet is driven into it.',
      'The reader is meant to push the magnet themselves and feel the speed matter. The three runs are fixed and go by on their own.',
    ],

    contrastWith: [
      {
        concept: 'lenzs-law',
        note: 'One answers how big the induced voltage is and never needs a direction; the other answers which way it goes and never needs a size.',
      },
      {
        concept: 'motional-emf',
        note: 'One takes the induced voltage as a whole and asks what makes it larger; the other opens up a single conductor and asks what inside it the voltage consists of.',
      },
      {
        concept: 'self-inductance',
        note: 'One has a separate magnet supplying the change to a coil; the other has the coil answering a change in its own current, with nothing outside it involved.',
      },
      {
        concept: 'eddy-current',
        note: 'One measures the voltage a change induces and leaves the circuit open; the other never mentions a voltage and is about what the resulting current does back to the motion.',
      },
    ],
  },
};
