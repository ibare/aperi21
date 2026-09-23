/**
 * field-of-dipole 개념 선언.
 *
 * 장 다섯 가운데 이쪽은 **반대 전하 한 쌍이라는 것 자체**가 주어다.
 *   field-of-dipole   사이는 곧고 촘촘 · 바깥은 휘어 돌아옴 · 축을 따라 **훨씬 빨리** 약해짐
 *   field-lines       그림 규약(촘촘함 = 세기)의 참 · 거짓 — 전하 쌍은 편의일 뿐
 *   electric-field    자리 값과 단위 전하
 *   uniform-field     평행판 사이는 어디서나 같다
 * 이쪽만 「쌍극자 · 두 전하 사이와 바깥 · 거의 상쇄 · 전하 하나보다 빨리 떨어짐」 어휘를 갖는다.
 * 「몰린 곳이 세다」 는 field-lines 에, 역제곱은 coulombs-law · inverse-square-law 에 둔다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const fieldOfDipoleConcept: Aperi21ConceptSource = {
  id: 'field-of-dipole',
  label: 'Field of Two Close Opposite Charges',
  canonicalSim: 'aperi21:field-of-dipole',

  surface: {
    definition:
      'What a close pair of opposite charges does to the space around it: between them the lines run nearly straight and packed, outside they bulge and curve back, and along the axis the strength dies away far faster than a lone charge’s.',
    exemplarKeywords: [
      'electric dipole',
      'field of two equal and opposite charges',
      'what a plus and minus pair looks like',
      'why a dipole’s field dies away so quickly',
      'lines running between the two charges and looping outside',
      'two opposite charges almost cancelling far away',
      'field along the axis of a dipole',
      'a molecule with a positive end and a negative end',
      'one over r cubed',
      'a pair of charges seen from far off',
    ],
  },

  briefing: {
    observable: [
      'On the left, two dozen lines are traced from a charge marked plus through the plane that holds it and a charge marked minus a short way off.',
      'First only the handful of lines that stay close to the line joining the charges are drawn dark, and the rest recede to a faint grey: those few cross from plus to minus almost straight and packed into a narrow band.',
      'Then the darkness is swapped, so the outer lines stand out instead: they swell far out on both sides and curve back round into the minus charge, while the band between fades.',
      'It is the same drawing both times, with only the darkness changed, so the two families can be seen as parts of one pattern.',
      'On the right a second panel starts a probe out along the axis, with the strength of a lone charge and the strength of the pair deliberately set equal at the starting distance.',
      'As the probe walks out to three times that distance, two curves grow behind it — a solid one for the lone charge and a dotted one for the pair.',
      'The dotted curve falls away much more steeply and lies almost on the floor at the far end, while the solid one is still well clear of it.',
      'A dotted ray and a single tick on the left panel show that the distance being walked is measured along the line through the two charges.',
      'Names ride beside the two probe points rather than being gathered into a key, and the only accent colour on screen marks those two points.',
      'No strength, distance or ratio is written; both charges are drawn in one colour and told apart by their marks.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the two families are shown in turn, the comparison is set up and the probe walks out, and the run begins again.',
        'The two families of lines are separated by dimming rather than by colour, so that the faded family stays in view as the thing being compared against.',
        'The two curves are separated by being solid and dotted rather than coloured, and by names that travel with their own probe point.',
        'Matching the two strengths at the starting distance makes the comparison about how fast each falls rather than which is larger.',
        'The dotted curve is the field of two charges an actual distance apart rather than an idealised pair, so it is a little steeper than the textbook limit.',
      ],
    },

    useWhen: [
      'The article has said that two opposite charges nearly cancel at a distance and the reader takes that as a figure of speech. Two curves matched at the start, with one collapsing while the other is still high, is what gives the phrase a size.',
      'The prose needs the two halves of the pattern told apart — the packed straight crossing between, the swelling return outside — and a single drawing whose darkness moves between them keeps them as one pattern.',
    ],

    avoidWhen: [
      'A ratio is wanted — a twenty-seventh at three times out, or the exponent named. The curves are for a real separation, so the drop is steeper than the ideal, and nothing on screen is numbered.',
      'The article is about the field out to the side of the pair rather than along the line joining them. Only the axis is walked.',
      'The subject is a dipole placed in someone else’s field — the turning it feels, a molecule lining up. Nothing external acts on this pair.',
      'The reader is meant to rearrange the charges or vary the separation. The pair is fixed and there is nothing to drag.',
      'The point is the general rule that packed lines mean a strong field. Here the packing between the charges is one feature of one pattern, not the claim.',
      'The article needs two charges of the same sign, or charges of unequal size.',
    ],

    contrastWith: [
      {
        concept: 'field-lines',
        note: 'One makes the pair itself the subject and describes its pattern and its falling-off; the other uses charges only as a way of making a field and asks whether line spacing can be trusted at all.',
      },
      {
        concept: 'electric-field',
        note: 'One is about the shape of a whole pattern and how it thins with distance; the other is about what a single value at a single place means.',
      },
      {
        concept: 'coulombs-law',
        note: 'One shows what a plus and a minus together do to the space around them, where the two nearly undo each other; the other stays with one pair and the force it exerts, which never cancels.',
      },
      {
        concept: 'uniform-field',
        note: 'One is a field that changes sharply from place to place and collapses with distance; the other is an arrangement built so that it does neither.',
      },
    ],
  },
};
