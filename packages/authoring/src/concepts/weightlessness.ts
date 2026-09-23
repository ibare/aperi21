/**
 * weightlessness 개념 선언.
 *
 * 이미 선언된 `apparent-weight` · `free-fall` 과 갈랐다. **주장을 갈랐다.**
 *   weightlessness   저울 0 은 **중력이 없어서가 아니다** — 그 높이에도 중력은 거의 그대로다
 *   apparent-weight  눈금은 **속도가 바뀌는 동안에만** 평소를 벗어난다 — 엘리베이터의 오르내림
 *   free-fall        무게가 다른 둘이 **같이** 떨어진다
 * 이쪽만 궤도 · 정거장 · 고도 · 「중력이 거기 있다」 어휘를 갖고, 엘리베이터 · 가속의 오르내림은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const weightlessnessConcept: Aperi21ConceptSource = {
  id: 'weightlessness',
  label: 'Weightlessness — A Scale Reading Zero With Gravity Still There',
  canonicalSim: 'aperi21:weightlessness',

  surface: {
    definition:
      'A scale reads zero in orbit not because gravity has run out at that height, where it is nearly ground strength, but because scale and occupant fall together.',
    exemplarKeywords: [
      'weightlessness',
      'why do astronauts float',
      'is there gravity in space',
      'zero g on the space station',
      'microgravity aboard the ISS',
      'gravity at four hundred kilometres is almost the same',
      'floating is continuous falling',
      'the scale reads nothing in orbit',
      'zero gravity is a misleading name',
      'why things float inside a spacecraft',
    ],
  },

  briefing: {
    observable: [
      'A station circles the Earth in a picture drawn to true proportion, so close to the surface that the orbit almost hugs the globe — the height is seen to be small before any number is given.',
      'The station’s height is written beside it, and an arrow on the station points at the centre of the Earth throughout the lap.',
      'A magnified view shows the inside: a person, a scale under their feet, and the hull around them, with the Earth below.',
      'An arrow on the person, named for the strength of gravity at that height, starts from the same place as a dashed arrow named for the strength at the ground, and the two are so nearly the same length that the difference has to be looked for.',
      'The dial of the scale, meanwhile, reads nothing at all, and the person floats a little above it.',
      'The hull, the scale and the person then sink together against a dashed outline marking where they would still be if they had not fallen, and the gap under the person’s feet is unchanged throughout the sinking.',
      'An arrow of the same length appears on the hull itself, so the two are seen to be falling at the same rate rather than merely moving together.',
      'A support then appears beneath the station and holds it at that height; in the orbit picture the station stops too; the person settles onto the scale and the dial climbs to the very figure written on the arrow.',
      'The support is taken away and the dial drops straight back to nothing, while the arrow has not shortened at any point in the whole sequence.',
      'The dial is graduated against the reading the same person would give on the ground rather than in units of mass, so the held reading and the label on the arrow are literally the same figure.',
    ],

    screen: {
      affordances: [
        'The lap, the shared fall, the holding and the release run in order and then repeat; nothing has to be pressed and no height is chosen.',
        'The orbit and the inside of the station are shown at once, so the ordinary claim that the station is far out in space is contradicted by the drawing itself before the argument begins.',
        'Only one thing changes over the whole run — whether the station is held or let go — which is what leaves the dial as the single thing that responds.',
      ],
    },

    useWhen: [
      'The article has to correct the idea that space is where gravity stops. The arrow that never shortens beside a dial that swings between zero and its full reading puts the two claims in the same frame.',
      'The prose has said that an orbiting body is perpetually falling and the reader cannot connect that to astronauts drifting about a cabin. Holding the station still and watching the person land on the scale supplies the missing half.',
    ],

    avoidWhen: [
      'The article is about a ride that speeds up and slows down and a reading that goes above and below the usual figure. Only two cases occur here — held, or falling freely — and the reading is never more than the ordinary one.',
      'The point is that gravity weakens with distance, or the reader must see an inverse-square relation. The height here is fixed and the near-equality is the whole point rather than the variation.',
      'The subject is why an orbiting body does not simply fly off in a straight line, or the sideways speed an orbit needs. No tangential motion and no straight-line alternative is drawn.',
      'Bodies of different weight have to be compared in their falling. One person falls here and there is nothing to race against.',
      'The article turns on what a body long enough to span different pulls feels while falling. Everything here falls at one and the same rate, and the gap under the feet never changes.',
      'Masses in kilograms or a gravity value in metres per second squared are wanted. The dial is marked as a percentage of the ground reading and carries no unit of mass.',
    ],

    contrastWith: [
      {
        concept: 'apparent-weight',
        note: 'One is the limiting case where support has been removed entirely and the reading is zero however strong gravity is; the other is the range on either side of the usual reading that opens up while a supported ride changes speed.',
      },
      {
        concept: 'free-fall',
        note: 'One asks what a scale reads while a body falls; the other asks what the fall itself does, and shows that bodies of very different weight do it together.',
      },
      {
        concept: 'normal-force',
        note: 'One is the case where contact carries nothing and the surface pushes with zero; the other is the push itself, and why it takes whatever size the situation requires.',
      },
      {
        concept: 'inertial-vs-gravitational-mass',
        note: 'One rests on everything in the station falling at one rate; the other is the fact underneath that, that what gravity pulls on and what resists being accelerated are the same quantity.',
      },
    ],
  },
};
