/**
 * electric-charge 개념 선언.
 *
 * 전하 둘 가운데 이쪽은 **이미 대전된 것끼리**의 일이다. **주장을 갈랐다.**
 *   electric-charge    종류가 **둘뿐**이다 — 표식만 다른 세 쌍이 벌어지거나 붙는다
 *   charging-methods   **어떻게 그 부호를 얻는가** — 전자가 가는 곳이 남는 부호를 정한다
 * 이쪽만 「같은 종류 · 다른 종류 · 밀고 당김」 어휘를 갖고, 전자 · 마찰 · 접지는 저쪽에 둔다.
 * 힘의 크기(거리 · 전하량)는 coulombs-law 몫이라 여기서는 수도 화살표도 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const electricChargeConcept: Aperi21ConceptSource = {
  id: 'electric-charge',
  label: 'Two Kinds of Charge, Told Apart by Pushing and Pulling',
  canonicalSim: 'aperi21:electric-charge',

  surface: {
    definition:
      'That charge comes in exactly two kinds, shown by three hanging pairs alike in everything but their marking: the two pairs marked alike swing apart and the pair marked oppositely swings together.',
    exemplarKeywords: [
      'like charges repel and unlike charges attract',
      'the two kinds of electric charge',
      'positive and negative',
      'why do two charged rods push each other away',
      'pith balls hanging on threads',
      'a charged balloon pulling at something',
      'charged objects that come together and ones that fly apart',
      'what the sign of a charge means',
      'there are only two kinds and not three',
      'two objects rubbed the same way push apart',
    ],
  },

  briefing: {
    observable: [
      'Three pairs of small balls hang from one ceiling on threads of the same length and at the same spacing, so nothing separates one pair from another except the mark on the balls.',
      'The marks read plus and plus on the left pair, minus and minus on the middle pair, and plus and minus on the right pair; every ball is drawn in the same colour and at the same size.',
      'A faint vertical line hangs behind each thread showing where it would rest with no charge at all, so a thread is seen to have tilted rather than merely to be at an angle.',
      'When the balls are let go, both the left and the middle pair swing outward past their vertical lines, overshoot once and settle apart.',
      'The right pair swings the other way, inward of its lines, and is drawn together until the two balls meet and stay touching.',
      'A name beneath each pair says whether it is the like pair or the unlike pair, so the marks need not be read to tell which is which.',
      'Nothing is numbered — no angle, no separation, no size of force — and no arrow is drawn on any ball.',
      'The release runs and repeats by itself, and the two balls that touched stay touching until the run begins again.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the three pairs hang, are released and settle in one run that begins again by itself.',
        'The three pairs are shown at once rather than one at a time, which is what makes the changed thing a single mark rather than a setting.',
        'No accent colour is used anywhere, because nothing on the screen carries a single meaning that would need picking out.',
        'The swing is solved as a real pendulum with the charges acting along the line between the balls, so the settling and the overshoot are the motion and not an animation.',
        'The unlike pair is drawn all the way together because two balls on threads that attract this strongly have no place to rest short of touching; they are treated as insulating, so touching changes neither mark.',
      ],
    },

    useWhen: [
      'The article has asserted that like repels and unlike attracts, and the reader has nothing yet to tell them that this is two behaviours of one property rather than two unrelated facts. Three pairs identical but for the marking, two swinging out and one swinging in, is what makes the sign the only cause.',
      'The prose needs the minus-minus case in particular, because a reader shown only plus-plus tends to read repulsion as something positives do.',
    ],

    avoidWhen: [
      'The article is about how an object comes to be charged — rubbing, contact, earthing. The balls arrive already carrying their marks and nothing is transferred during the run.',
      'The point is how strong the force is, or how it changes with separation or with the amount of charge. All six balls carry the same amount, nothing is measured and no force arrow is drawn.',
      'The subject is electrons, protons or what is happening inside the balls. A ball here is a plain circle with a sign written on it.',
      'The article is about charge being conserved or coming in whole units. Nothing moves from one body to another here and nothing is counted.',
      'A field, field lines or the force on a charge placed at a chosen place is wanted. There is no picture of the surroundings, only the two balls of each pair.',
    ],

    contrastWith: [
      {
        concept: 'charging-methods',
        note: 'One is about what two bodies do to each other once each has a sign; the other is about how a body ends up with that sign in the first place.',
      },
      {
        concept: 'coulombs-law',
        note: 'One settles that there are two kinds and which way each combination goes; the other leaves the direction alone and asks how much the force is at one separation against another.',
      },
      {
        concept: 'electric-field',
        note: 'One keeps both bodies in the picture and reads the outcome from how they move relative to each other; the other drops the second body and asks what the first has done to the places around it.',
      },
      {
        concept: 'superposition-of-forces',
        note: 'One has exactly two bodies in each pair, so the outcome is simply toward or away; the other has several charges acting at once, where no single toward-or-away answers.',
      },
    ],
  },
};
