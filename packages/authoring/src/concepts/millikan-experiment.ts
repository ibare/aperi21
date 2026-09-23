/**
 * millikan-experiment 개념 선언.
 *
 * 전하를 다루는 이웃들과 **무엇을 주장하는가**로 갈랐다. 이쪽은 **띄엄띄엄하다**이다.
 *   millikan-experiment     여러 방울의 전하를 한 축에 찍으면 **정수배 자리에만** 모이고 사이가 빈다
 *   electric-charge         전하가 **두 가지**라는 것 (밀고 당김)
 *   charge-in-uniform-field 고른 장 속에서 전하가 **어떻게 움직이는가**
 *   uniform-field           평행판 사이의 장이 **고르다**는 것
 *   terminal-velocity       저항력이 받쳐 **속력이 멎는다**
 * 균형 한 방울은 이쪽에서도 보이지만 그것은 재는 방법이고, 주장은 **점이 모이는 자리**다.
 * 그래서 기본 전하 · 양자화 · 정수배 어휘는 이쪽에만 둔다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const millikanExperimentConcept: Aperi21ConceptSource = {
  id: 'millikan-experiment',
  label: 'Charge Found Only in Whole Multiples',
  canonicalSim: 'aperi21:millikan-experiment',

  surface: {
    definition:
      'That charge is not had in any amount whatever: bringing many oil drops to a standstill between charged plates and setting each measured charge on one axis leaves points only at whole multiples, with the places between them empty.',
    exemplarKeywords: [
      'Millikan oil drop experiment',
      'elementary charge',
      'charge is quantised',
      'measuring the charge on an electron',
      'one point six times ten to the minus nineteen coulombs',
      'balancing an oil drop between two plates',
      'charges come in whole lumps',
      'no charge smaller than e has ever been found',
      'how do we know charge comes in a smallest amount',
      'oil drops and a sprayer',
      'the charge of every drop is a multiple of the same number',
      'evidence that charge is grainy',
    ],
  },

  briefing: {
    observable: [
      'Two plates face each other with a small hole in the upper one, and to the right of them an upright axis rises, marked off at the origin and at several evenly spaced places named for the whole multiples.',
      'The first drop comes through the hole with nothing but a downward arrow on it, and nothing is marked on the plates, so it simply falls.',
      'Then lines between the plates and a sign on each plate come up out of nothing, and a bright upward arrow on the drop grows as they do.',
      'As the bright arrow lengthens the drop slows, and when the two arrows are of equal length it is standing still halfway between the plates.',
      'A point then leaves the drop in the drop’s own colour and travels across to the axis, settling at a place on it.',
      'Drop after drop follows, each of its own size, each already standing still with its two arrows matched, and each sending one point across.',
      'The downward arrow is longer on the larger drops and the bright arrow always matches it, so a heavier drop is simply held by a stronger pull.',
      'Points landing at the same place on the axis stack upward, one above another, so the marked places grow into columns.',
      'After a dozen or so drops the axis carries columns standing squarely on the named multiples, and the whole stretches between them are bare.',
      'The stretch between the origin and the first mark is bare as well, so nothing smaller than one lump has turned up.',
      'The points scatter very slightly about their marks, enough to be seen as measurements, but nowhere near enough to fill a gap.',
      'Nothing on the screen carries a voltage or a charge in figures; a single line names the value of the lump itself.',
      'Nothing is drawn inside the drops, so what is in them is never shown in advance of the columns.',
      'The points are then swept away and a fresh set of drops is measured, with different sizes and a different order but the same columns and the same empty places.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the first drop falls and is brought to rest, then the rest are measured one after another, and the set is cleared and drawn again.',
        'The voltage is shown by how strongly the lines and the plate signs come up and by the length of the upward arrow, and is never written as a figure.',
        'A measured charge appears only as where its point lands on the axis, so reading the result means reading a position.',
        'The first drop alone is shown falling and being brought to rest; the rest are already at rest, so the run gets through enough drops for columns to form.',
        'The accent colour is kept for the upward pull on the drop, which is the one thing the voltage changes; each drop and the point taken from it share one colour, because they are the same thing.',
        'Every fresh set is drawn so that the lowest few multiples are certain to appear, so the pattern of filled marks and empty gaps holds on every run.',
        'Drop sizes differ from one another and the points scatter a little about their marks, so the columns read as measurements rather than as a diagram.',
      ],
    },

    useWhen: [
      'The article states that charge comes in a smallest amount and the reader has no reason to believe it rather than take it on authority. A dozen independent measurements landing on the marks and nowhere between them is the evidence the sentence is standing on.',
      'The prose needs the emptiness to carry the argument — that what is not there between the columns, and below the first of them, is the finding.',
    ],

    avoidWhen: [
      'The subject is the two kinds of charge, or attraction and repulsion. Every drop here is held up the same way and nothing is pushed apart or drawn together.',
      'The article is about how a charge moves in a field, the path it takes, or being accelerated by plates. Each drop here is brought to a standstill and kept there.',
      'The point is that the field between parallel plates is even, or what decides its strength. The plates here are the means of weighing a drop, not the subject.',
      'The article is about a body falling through air reaching a steady speed, or about the drag that a small sphere meets. The one fall shown here is the prelude to the measurement.',
      'A charge, a voltage or a drop radius is to be worked out. A single line names the lump; nothing else on the screen carries a figure.',
      'The subject is the structure of the atom, or what is inside the drops. Nothing is drawn inside them, and that is what keeps the columns from being assumed.',
      'The reader is meant to tune the voltage and catch the balance themselves. Each drop is brought to rest on its own.',
    ],

    contrastWith: [
      {
        concept: 'electric-charge',
        note: 'One asks how much charge a body may have and answers that only whole multiples occur; the other asks how many kinds there are and answers two.',
      },
      {
        concept: 'charge-in-uniform-field',
        note: 'One uses a field only to hold a body still so that its charge may be weighed; the other lets the field move the charge and makes the motion the subject.',
      },
      {
        concept: 'uniform-field',
        note: 'One takes the sameness of the field between plates for granted as the thing that makes the weighing trustworthy; the other makes that sameness what is being shown.',
      },
      {
        concept: 'terminal-velocity',
        note: 'Both begin with a small body falling and coming to a steady state, but one ends with the body stopped altogether by an electrical pull, and the other with it still falling at a settled speed.',
      },
      {
        concept: 'equilibrium-of-forces',
        note: 'One uses the matching of two pulls as an instrument for reading out a quantity; the other makes the matching itself the claim.',
      },
      {
        concept: 'statistical-fluctuation',
        note: 'Both put many separate measurements together and read the shape of the collection, but one finds gaps that no number of measurements will fill, and the other finds a spread that narrows as they accumulate.',
      },
    ],
  },
};
