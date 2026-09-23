/**
 * generator 개념 선언.
 *
 * 이미 선언된 `ac-generation` · `motor` 와 **무엇을 묻는가**로 갈랐다.
 *   generator      돌리는 **값** — 전구를 켜면 같은 빠르기에서 손잡이가 무거워진다
 *   ac-generation  나오는 **모양** — 각도에 따라 사인파, 빨리 돌리면 높고 촘촘
 *   motor          **거꾸로** — 전류가 들어와 축이 돈다(정류자가 요점)
 * 이쪽만 「손의 힘 · 값 · 에너지가 어디서 오는가」 어휘를 갖는다. 출력 모양 · 기전력 크기는
 * ac-generation · faradays-law 의 몫이라 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const generatorConcept: Aperi21ConceptSource = {
  id: 'generator',
  label: 'What Turning a Generator Costs',
  canonicalSim: 'aperi21:generator',

  surface: {
    definition:
      'That closing a lamp’s switch makes a generator handle far harder to turn at the very same rate, so that the effort spent at the hand is what the light is paid for.',
    exemplarKeywords: [
      'why a dynamo gets harder to pedal once the light is on',
      'bicycle dynamo',
      'where does a generator get its energy from',
      'hand crank generator',
      'putting a load on a generator',
      'mechanical work turned into electrical energy',
      'the generator resists more when current is drawn',
      'winding a wind-up torch takes effort',
      'electricity is not made from nothing',
      'closing the switch makes the crank heavy',
    ],
  },

  briefing: {
    observable: [
      'The generator is seen end on, along its shaft: two pole pieces lettered N and S, a coil turning between them, and a handle on the same shaft riding a dotted circle.',
      'Two leads run down from the shaft to a circuit below carrying a lamp and a switch.',
      'While the switch stands open the two wire cross-sections are blank, the lamp is a dark circle, and a short arrow sits at the rim of the handle.',
      'At the moment the switch closes, marks appear in the wire cross-sections — a dot in one and a cross in the other — the lamp warms up and throws out rays, and the arrow at the very same handle position grows several times longer.',
      'The arrow swells twice in each turn, at its longest when the two marks are at their darkest.',
      'Opening the switch again makes the marks vanish and the arrow shrink back at once, while the lamp cools over about a second before it is fully dark.',
      'The handle turns at one unchanging rate from beginning to end, so nothing about the driving has changed between the light parts and the dark parts.',
      'Nothing on the screen carries a number — no voltage, no current, no force, no dial.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the run goes open, closed, opened again, and repeats.',
        'The turning rate never varies, so the only thing that differs between the two halves of the run is whether a current is flowing.',
        'The arrow at the handle is the one thing picked out in colour; poles, coil, handle and circuit are all in plain ink.',
        'The marks in the wire cross-sections stand for current and appear only while the switch is closed, so weight in the hand and current in the wires arrive together.',
        'The arrow is the value at that instant rather than an average, which is why it beats twice per turn along with the marks.',
        'The lamp reads as lit by a filled glow and rays, and as dark by an unlit circle, rather than by any colour.',
        'The two poles are told apart by their letters alone.',
      ],
    },

    useWhen: [
      'The article has said that a generator turns mechanical work into electrical energy and the reader takes it as a slogan. Watching one unchanging turn become heavy the instant a lamp is lit puts a price on the hand, and the price is the argument.',
      'The prose needs conservation of energy to bite inside a circuit rather than in a textbook sum: the light is not free, and the screen charges for it at the handle.',
    ],

    avoidWhen: [
      'The article is about the shape of what comes out — a sine wave, peaks and zeros, the coil’s angle, or turning faster giving a bigger output. Nothing here is plotted and the turning rate is never altered.',
      'The subject is a current being fed in to make something turn, or the reversing arrangement that keeps a coil going round. Here the hand drives and the lamp is fed.',
      'The size of the induced voltage, the number of turns on the coil, or flux through it is wanted. The coil is never rewound and no voltage appears.',
      'A value in volts, amps or watts is needed, or a share of input to output is to be worked out. Nothing on the screen carries a quantity.',
      'The article is about which way the induced current runs, or about a sign. The two marks show that the two wires carry opposite ways, but no rule for which is given.',
      'The reader is meant to open and close the switch themselves and feel the change. The run is fixed and goes by on its own.',
    ],

    contrastWith: [
      {
        concept: 'ac-generation',
        note: 'One asks what the turning costs whoever does it and never plots anything; the other asks what shape the output takes and lives on that plot.',
      },
      {
        concept: 'motor',
        note: 'One has the hand paying and the lamp receiving; the other has the supply paying and the shaft receiving, which is why the reversing arrangement is the whole question there and no question at all here.',
      },
      {
        concept: 'faradays-law',
        note: 'One is about what induction costs and leaves the voltage unmeasured; the other is about how large the induced voltage is and leaves the cost unmentioned.',
      },
      {
        concept: 'lenzs-law',
        note: 'One meets the opposition as weight felt by whoever drives the machine; the other meets it as a force on a magnet and asks which way the current runs.',
      },
      {
        concept: 'efficiency',
        note: 'One shows only that the hand is charged for the light; the other counts what share of what went in came out as the thing wanted.',
      },
    ],
  },
};
