/**
 * simple-circuit 개념 선언.
 *
 * 이미 선언된 회로 개념들과 **무엇을 묻는가**로 갈랐다.
 *   simple-circuit   **이어졌는가** — 끊김 없는 한 고리라야 켜지고, 어디를 끊어도 전체가 멎는다
 *   electric-current 흐름의 **크기** — 단위 시간에 지나는 전하
 *   ohms-law         크기의 **비례** — 전압에 따라 정해진다
 *   drift-velocity   **빠르기 대 즉시성** — 전자는 느린데 먼 전구가 곧 켜진다
 * 이쪽만 「고리 · 끊김 · 어디를 끊어도」 어휘를 갖고, 수는 하나도 쓰지 않는다.
 * 「곧바로 · 즉시」 어휘는 drift-velocity 의 것이라 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const simpleCircuitConcept: Aperi21ConceptSource = {
  id: 'simple-circuit',
  label: 'Making a Circuit That Lights',
  canonicalSim: 'aperi21:simple-circuit',

  surface: {
    definition:
      'That a lamp lights only while battery, wires and lamp make one unbroken ring, and that parting the ring at any place at all halts every carrier in it and puts the lamp out.',
    exemplarKeywords: [
      'making a simple circuit',
      'the lamp lights only if the circuit is complete',
      'breaking a wire turns the bulb off',
      'a complete loop of battery, wire and bulb',
      'open and closed circuit',
      'why does the bulb go out when one wire comes loose',
      'does it matter where the break is',
      'connecting a battery to a bulb',
      'a circuit has to be a closed path',
      'a gap at one place stops the whole circuit',
    ],
  },

  briefing: {
    observable: [
      'A rectangular loop: a battery drawn as a long plate and a short one on the left side, and a lamp set in the middle of the top side.',
      'Carriers, each trailing a tail that follows the wire, run out of the short plate, round the bottom and right sides, through the lamp, and back into the long plate.',
      'The lamp’s circle is filled with light and throws five rays upward.',
      'A short length of wire just beyond the lamp swings up on a hinge; the moment it parts, every carrier all the way round the loop halts, the tails disappear, the lamp goes dark and its rays are gone.',
      'The break itself is circled in colour.',
      'The length swings back down, and at the instant it touches, everything runs again and the lamp lights.',
      'The same thing happens at a second place, on the side farthest from the lamp, and again at a third, right beside the battery.',
      'A carrier that happens to be standing on the lifted length is carried up with it rather than left hanging in the gap.',
      'Joining points are drawn all round the loop, so the places that could be parted are visible from the start.',
      'No voltage, no current, no resistance and no number appears anywhere.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; three different places are parted and rejoined in turn and the round repeats.',
        'The three breaks are at different distances from the lamp — right beside it, as far from it as the loop allows, and next to the battery — and all three give the same result.',
        'Everything halts together at one instant rather than the halt spreading out from the break, so the loop is not read as a pipe with a plug in it.',
        'Whether anything is flowing can be told from a still picture by whether the carriers have tails.',
        'The break being made is the one thing picked out in colour, and it deepens as the wire swings.',
        'The carriers are labelled once to say what they are, and they leave the short plate and return to the long one.',
        'The lamp is either lit or dark and never anything in between.',
      ],
    },

    useWhen: [
      'The article is teaching a young reader to build a circuit, and the mistake to be headed off is thinking that the lamp need only be joined to the battery somehow. A ring parted three times in three places, with the same result each time, is what gives “complete” its meaning.',
      'The prose needs a break far from the lamp to matter every bit as much as one beside it, which is the point a drawing with a single switch in it cannot make.',
    ],

    avoidWhen: [
      'The article is about how large a current is, what settles its size, or how much charge goes past a place in a given time.',
      'The subject is voltage, resistance, or the proportion between the two.',
      'Two lamps, two branches, or the difference between joining components end to end and side by side is at issue. There is one ring here and nothing in it but a lamp.',
      'The point is how slowly the carriers really move, or how promptly a distant lamp answers. What is claimed here is that the ring must be whole, and nothing is timed.',
      'The article needs a switch as a component, or a circuit diagram with its symbols. The break here is a piece of wire lifted on a hinge, in three ordinary places.',
      'The lamp is to be dimmer or brighter, or two brightnesses are to be compared.',
      'The reader is meant to choose where to part the ring. The three places are fixed and come round on their own.',
    ],

    contrastWith: [
      {
        concept: 'electric-current',
        note: 'One asks only whether anything is flowing at all; the other takes the flow for granted and asks what the size of it means.',
      },
      {
        concept: 'ohms-law',
        note: 'One is about a ring that is whole or parted, with nothing in between; the other is about a current that takes a definite size from the voltage put across it.',
      },
      {
        concept: 'drift-velocity',
        note: 'One parts the ring in three places to show that a whole ring is what is needed; the other keeps the ring whole and asks how a distant lamp answers so promptly when the carriers creep.',
      },
      {
        concept: 'series-parallel-resistors',
        note: 'One has a single ring and asks whether it is complete; the other has two components and asks what difference the manner of joining them makes.',
      },
    ],
  },
};
