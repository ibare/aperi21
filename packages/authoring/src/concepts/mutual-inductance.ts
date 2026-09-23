/**
 * mutual-inductance 개념 선언.
 *
 * 코일 넷 가운데 이쪽은 **「이어지지 않은 이웃에게 무슨 일이 일어나는가, 그리고 언제인가」** 다.
 *   mutual-inductance   도선으로 안 이어진 **이웃**에 전압이 선다 — **바뀌는 동안에만**
 *   energy-in-inductor  그 코일 안에 **에너지가 쌓였다가 돌아 나온다**
 *   rl-circuit          스위치를 닫은 뒤 전류가 **시간을 들여 차오른다** — 누가 전압을 맡는가
 *   transformer         철심을 함께 쓰는 두 코일에서 **감은 수의 비**가 전압을 정한다
 * 이쪽만 「일정하면 0」 어휘를 갖는다. 감은 수 · 비 · 에너지 · 시간 상수는 형제의 몫이라 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const mutualInductanceConcept: Aperi21ConceptSource = {
  id: 'mutual-inductance',
  label: 'Voltage Raised in an Unconnected Neighbouring Coil',
  canonicalSim: 'aperi21:mutual-inductance',

  surface: {
    definition:
      'One coil raises a voltage in a neighbouring coil it is not wired to, but only while its own current is changing — held steady, however large that current is, the neighbour gets nothing.',
    exemplarKeywords: [
      'mutual inductance',
      'voltage induced in a nearby coil',
      'two coils that are not connected by any wire',
      'why does the needle only move while I am changing the current',
      'a steady current induces nothing',
      'coupling between two circuits',
      'the induced voltage flips sign when the current is turned back down',
      'one circuit affecting another across a gap',
      'changing current in the first coil',
      'induced emf in a second winding',
      'henry as a measure of coupling',
    ],
  },

  briefing: {
    observable: [
      'Two coils of four loops each stand on one axis, side by side, with no wire running between them; the left one ends in a pair of terminals and the right one carries a dial whose zero is in the middle, marked plus on one side and minus on the other.',
      'To the right sit two recording strips one above the other on a shared time axis — the upper one named for the first coil’s current, the lower one for the neighbour’s voltage.',
      'While the first current is being raised, an arrow beside that coil lengthens and magnetic loops come up one at a time around it, the ones nearest the axis reaching far enough to pass through the second coil while the outer ones turn back before they get there.',
      'For the whole of that raising the needle leans to the plus side and the lower trace stands one step above its zero line — not a spike at the moment of switching but a level that lasts exactly as long as the raising does.',
      'When the current is then held large and unchanging, the loops stay at their fullest and yet the needle returns to the middle and the lower trace drops back onto its zero line.',
      'While the current is brought back down, the loops vanish one by one, the arrow shortens, the needle leans to the minus side and the lower trace sits one step below zero.',
      'Once the current has reached zero a whole cycle is left standing on the strips: a flat-topped trapezium above, and beneath it a raised block, a flat stretch and a sunken block.',
      'Four dotted verticals drop from the corners of the upper trace onto the lower one, so the raised and the sunken blocks line up with exactly the stretches where the upper trace was sloping.',
      'No volts, amps or seconds are written anywhere and the strips carry no gradations — only the names of the two quantities and the marks plus, zero and minus, which the dial repeats.',
    ],

    screen: {
      affordances: [
        'Nothing is offered to press or drag; the raising, the holding and the lowering run one after another on their own, and the strips wipe clean before each new cycle.',
        'The reader arrives partway through a raising, with three loops already standing, the needle already over on the plus side and the raised block already under way.',
        'How quickly the current is changed is not left to the reader, so the screen never goes on to make a second claim about a faster change giving a bigger voltage.',
        'The second coil is given a dial and nothing else — no current is drawn in it and no direction of circulation is marked, so the answer it gives is only a sign and a size of lean.',
        'The two strips are told apart by the names on their axes rather than by colour, and both traces are drawn in the same ink.',
      ],
    },

    useWhen: [
      'The article has said that a changing current induces a voltage in a nearby circuit, and the reader is likely to hear the word current and skip the word changing. The stretch where a large steady current produces a flat zero is what forces the two words apart.',
      'The prose needs the reversal of sign to be something other than a rule to be memorised — the block below zero shows up exactly while the current is being taken back down, and the dropped verticals put the two facts against each other in one picture.',
      'The reader is being told that two circuits can act on one another with nothing joining them, and a case is wanted where the absence of any wire between them is plainly visible.',
    ],

    avoidWhen: [
      'The subject is how large the induced voltage comes out, or how the coupling depends on spacing, on the number of turns or on a core between the coils. Nothing is measured, and neither coil is ever moved or rewound.',
      'The article is about which way the induced current runs and what it sets itself against. The second coil carries no current here at all.',
      'The point is a voltage raised by moving a magnet in and out, or by a circuit being broken. Both coils stay where they are and the first current is only ever ramped smoothly up and down.',
      'The article turns on stepping a supply up or down by a ratio. The two coils are wound with the same number of loops and share no core.',
      'What is wanted is where the energy goes, or how a current is passed from one circuit to another to do work. Nothing here is counted as energy.',
    ],

    contrastWith: [
      {
        concept: 'energy-in-inductor',
        note: 'One asks what a changing current does to a second circuit that is not joined to it; the other stays with the single coil and asks what the changing current banks inside it.',
      },
      {
        concept: 'rl-circuit',
        note: 'Both turn on a current changing rather than merely being large, but one reads the change off as a voltage appearing elsewhere, while the other reads it as the reason the current in its own loop takes time to arrive.',
      },
      {
        concept: 'transformer',
        note: 'One says only whether and when a neighbouring coil answers at all; the other takes that answer for granted and asks what fixes its size, which is the count of turns on each side.',
      },
      {
        concept: 'self-inductance',
        note: 'Both turn on a current changing rather than merely being large, but one has that change answered by a voltage in a second coil no wire joins, and the other by a voltage in the very coil carrying it.',
      },
    ],
  },
};
