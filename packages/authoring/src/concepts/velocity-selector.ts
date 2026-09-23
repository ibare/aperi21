/**
 * velocity-selector 개념 선언.
 *
 * 힘 다섯 가운데 이쪽은 **두 힘의 크기 경쟁**이다 — 방향이 아니라 길이가 판정이고,
 * 그 경쟁이 속력 하나를 골라낸다.
 *   velocity-selector                  전기력과 자기력의 **길이 견줌** — 맞는 속력만 곧게
 *   lorentz-force                      자기력의 **방향** (맞서는 것이 없다)
 *   charged-particle-in-magnetic-field 자기장 하나에서의 한 바퀴 시간
 *   mass-spectrometer                  속력이 정해진 뒤 **질량**을 가른다
 *   force-on-current-wire              도선 전체가 받는 힘
 * 이미 선언된 `charge-in-uniform-field` 와도 갈랐다 — 저쪽은 맞서는 것이 없어 들어온 전하가
 * 모두 휜다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const velocitySelectorConcept: Aperi21ConceptSource = {
  id: 'velocity-selector',
  label: 'One Speed Passes Between Crossed Fields',
  canonicalSim: 'aperi21:velocity-selector',

  surface: {
    definition:
      'An electric and a magnetic field crossed and set against each other so that only charges of one particular speed cross without bending, slower ones being carried toward the electric force and faster ones toward the magnetic.',
    exemplarKeywords: [
      'velocity selector',
      'crossed electric and magnetic fields',
      'v equals E over B',
      'only one speed goes straight through',
      'Wien filter',
      'balancing an electric force against a magnetic one',
      'trimming a beam down to a single speed',
      'which way does a slow ion bend in crossed fields',
      'electric force one way and magnetic force the other',
      'picking particles by speed before measuring them',
    ],
  },

  briefing: {
    observable: [
      'Two charged plates lie one above the other, marked plus and minus, with the space between them filled by a pattern of circled crosses for a field into the page and a slit in a wall at either end.',
      'A charge is fired in through the entrance slit and, once between the plates, gains two arrows of the same colour: one straight down named for the electric force, one square to its own direction of travel named for the magnetic.',
      'For the first charge the electric arrow is the longer; it curves downward onto the lower plate and stops, its arrows vanish, and it is named there as the slow one.',
      'The next charge has the longer magnetic arrow; it curves upward onto the upper plate and is named as the fast one, with the previous path left behind in grey.',
      'The third carries two arrows of exactly equal length pointing exactly opposite ways; it runs dead straight down the middle, out through the exit slit and onto a detector, and is named as the one whose two forces match.',
      'All three paths are then held on the screen together, one bending up, one bending down and one straight between them.',
      'The arrows are carried only while a charge is inside the field; before the entrance slit and after it has come to rest there are none.',
      'The magnetic arrow turns as the charge turns, staying square to the direction of travel throughout.',
      'The charge now flying and its path are in the dark tone while paths already finished are grey.',
      'No speed, field value or size of force is written anywhere, so the whole comparison is made by the lengths of the two arrows.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; three charges are fired in turn and all three paths are held together at the end before the run begins again.',
        'Both forces are drawn in one colour and told apart by their names and their directions, since giving them separate colours would turn the colour into a key to be learnt.',
        'One scale with no ceiling is used for both arrows, so their lengths may be set against each other directly.',
        'The names appear only on charges that have come to rest, so the three paths held at the end can be read without having to remember which was which.',
        'The speed that passes straight is worked out from the two field strengths rather than set on its own, so it goes on passing straight whatever the fields are altered to.',
        'Only positive charges are fired, so nothing in the picture turns on a sign.',
        'The forces are shown by arrow length alone rather than by a written size, so what is read is which of two is longer.',
      ],
    },

    useWhen: [
      'The article has arrived at the condition for passing straight through and the reader sees only two expressions set equal. Two arrows of one colour drawn against each other, unequal twice and equal once, is where the equation becomes a competition with an outcome.',
      'The prose needs the reader to know which way a charge goes wrong when it is not at the chosen speed, and slow bending one way against fast bending the other is held in a single picture at the end.',
    ],

    avoidWhen: [
      'The article is about a full circle in a magnetic field, a radius or a lap time. Each charge here is followed through a short bend and then stops.',
      'The particles differ in mass or in charge. These differ only in the speed they are fired at.',
      'The subject is a charge deflected between charged plates with no magnetic field acting against the electric one.',
      'A number is wanted — a speed, a field, a size of force, or the condition written out. Nothing on the screen carries a figure.',
      'The article is about what is done with the beam afterwards, or about separating a mixture into its parts. What leaves the exit slit here is simply collected.',
      'The reader is meant to choose a speed and fire it. The three are fired in a fixed order.',
    ],

    contrastWith: [
      {
        concept: 'mass-spectrometer',
        note: 'One sorts by speed and sends a single speed onward, with two forces set against each other; the other takes the speed as already settled and sorts by mass, with one force acting alone.',
      },
      {
        concept: 'lorentz-force',
        note: 'One never questions which way the magnetic force points and is about its size against another force; the other is entirely about that direction and sets the force against nothing.',
      },
      {
        concept: 'charge-in-uniform-field',
        note: 'One has the electric force opposed by a second force, so a charge can cross without bending at all; the other has it unopposed, so everything that enters is bent.',
      },
      {
        concept: 'equilibrium-of-forces',
        note: 'One has two forces of particular kinds cancel for one particular speed, so what is at issue is which speed; the other is about the general condition for a point to be held still by several pulls at once.',
      },
    ],
  },
};
