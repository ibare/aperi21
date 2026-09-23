/**
 * drift-velocity 개념 선언.
 *
 * 이 묶음의 열 가운데 이쪽만 **나르개가 얼마나 빠른가**를 주장한다. 나머지 아홉은
 * 「얼마나 흐르는가」 를 다루고, 이쪽은 「무엇이 얼마나 느리게 움직이는가」 를 다룬다.
 *   drift-velocity   전자는 초당 0.1 mm 를 기는데 **먼 전구는 곧바로** 켜진다 — 이미 차 있던
 *                    전자가 **한꺼번에** 밀리기 시작한다
 *   ohms-law         같은 저항에 전압을 올리면 전류가 **비례**로 는다
 *   joule-heating    저항이 흐름을 **열**로 바꾼다
 * 빠르기·느림·동시·신호 어휘는 이쪽에만 둔다. 전류량(A)·수 밀도·식 `I = nqAv` 는 화면에
 * 없으므로 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const driftVelocityConcept: Aperi21ConceptSource = {
  id: 'drift-velocity',
  label: 'Drift Velocity and the Instant the Lamp Lights',
  canonicalSim: 'aperi21:drift-velocity',

  surface: {
    definition:
      'That the electrons in a wire creep forward by a fraction of a millimetre each second, while a lamp far along the circuit lights the instant the switch closes, because every electron already in the wire begins moving at once.',
    exemplarKeywords: [
      'drift velocity',
      'why does the light come on instantly if electrons move so slowly',
      'how fast do electrons actually travel in a wire',
      'slow carriers and an immediate effect',
      'the wire is already full of electrons before the switch closes',
      'a millimetre per second',
      'closing a switch lights a distant bulb at once',
      'electrons do not have to reach the bulb to light it',
      'thermal jostling against a steady creep',
      'water already filling a hose',
    ],
  },

  briefing: {
    observable: [
      'A square loop carries a battery on the left, a switch on the bottom edge beside it, and a lamp on the far side, unlit.',
      'Inside a pale band along every edge the electrons sit already packed, jittering in place with no tail on any of them while the switch stands open.',
      'One electron just past the switch is picked out with a ring in the accent colour.',
      'The lever comes down and touches, and at that same instant the lamp fills with light and rays spread from it.',
      'In the same instant every electron on all four edges gains a tail in the direction of the push and the whole line begins to creep, and a mark naming the grains as electrons appears.',
      'A tick in the accent colour stays behind at the place the ringed electron stood when the switch closed.',
      'Eight seconds later the ring has advanced less than one electron spacing from that tick, while the lamp, many times further along the wire, has been lit the whole time.',
      'A label above the tick gives the real drift speed in millimetres per second.',
      'When the lever lifts, the lamp goes out, and the tails and the electron mark vanish together; the electrons go back to jittering where they stand.',
      'A fresh electron beside the switch is ringed for the next run, and the wire is never drawn empty and filling.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the switch closes, the lamp lights, the marked electron creeps a little way, the switch opens, and the run begins again.',
        'The creep on screen is drawn several times faster than the real thing, because at the true rate nothing would be seen to move at all; the label beside the tick gives the real speed instead.',
        'The lamp is placed on the edge furthest from the switch along the wire, so that how little the marked electron has gone stands beside how long the lamp has been lit.',
        'Electrons inside the gap are lifted away with the lever while the switch is open, so nothing appears to cross a break.',
        'The tails show only the steady push and not the jostling, so the flow reads as one direction rather than as scatter.',
        'The accent colour is kept for the marked electron and for the tick where it stood; battery, switch and lamp are drawn in a quieter tone.',
      ],
    },

    useWhen: [
      'The article has quoted a drift speed and the reader immediately objects that the light comes on at once. The tick a fraction of a spacing behind the ring, with the lamp lit far down the wire, holds both facts in one picture instead of asking for either to be conceded.',
      'The prose needs the wire pictured as already full of mobile charge before anything is switched on, rather than as a pipe being filled from the battery.',
    ],

    avoidWhen: [
      'The article is about how quickly the signal or the field travels along the wire. Nothing is drawn spreading down the wire here; the lighting and the pushing begin at one and the same moment everywhere.',
      'The subject is current as a quantity — amperes, charge per second, how speed, carrier density and cross-section combine. No current, no count of carriers and no cross-section appears.',
      'The article turns on resistance, on what slows the flow or on part of the circuit being different from the rest. The loop here is one unbroken wire with nothing singled out.',
      'The direction convention, conventional current set against electron flow, is the point. Only the electron mark is shown, and only while the flow lasts.',
      'The reader is meant to measure the speed on screen or compare it with another. The movement is deliberately exaggerated and only the real figure is written.',
      'Alternating current, or a flow that reverses, is the subject. The push here starts once and holds one way until the switch opens.',
    ],

    contrastWith: [
      {
        concept: 'ohms-law',
        note: 'One asks how fast the carriers themselves travel and finds the answer has almost nothing to do with when the lamp lights; the other never asks about speed and speaks only of how much flows for a given push.',
      },
      {
        concept: 'wave-vs-particle-transport',
        note: 'Both separate what arrives from what barely moves, but one has a disturbance passing through a medium that stays put, and the other has the carriers themselves all inching forward together.',
      },
      {
        concept: 'brownian-motion',
        note: 'Both set a faint steady bias against violent random jostling; one follows a single grain wandering because of the jostling, the other a whole population creeping in spite of it.',
      },
      {
        concept: 'electric-charge',
        note: 'One takes it for granted that the wire is already full of mobile charge and asks only how fast it moves; the other is about charge itself, its two kinds and how a body comes by it.',
      },
    ],
  },
};
