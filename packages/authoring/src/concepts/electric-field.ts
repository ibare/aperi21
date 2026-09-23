/**
 * electric-field 개념 선언.
 *
 * 장 다섯 가운데 이쪽은 **E = F/q** 다 — 놓는 전하를 키우면 힘만 커지고 자리 값은 그대로.
 *   electric-field       자리 값이 **단위 전하가 받을 힘**이다 (놓는 것을 바꿔 본다)
 *   field-lines          그리는 **규약이 참인가** — 선이 몰린 곳이 정말 센가
 *   field-of-dipole      **반대 전하 한 쌍**의 모양과 떨어짐
 *   uniform-field        평행판 사이는 **어디서나 같다**
 *   gausss-law           닫힌 경계를 지나는 **알짜 수**는 안의 전하만 본다
 * 이미 선언된 `gravitational-field` 와도 갈랐다 — 저쪽은 「놓기 전부터 자리에 있다」,
 * 이쪽은 「놓는 것을 두 배로 해도 자리 값은 그대로」. 역제곱 어휘는 coulombs-law ·
 * inverse-square-law 에 둔다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const electricFieldConcept: Aperi21ConceptSource = {
  id: 'electric-field',
  label: 'Field as Force per Unit Charge',
  canonicalSim: 'aperi21:electric-field',

  surface: {
    definition:
      'The value standing at each place that says what a unit of charge would feel there: put down twice the charge and the force doubles while the value belonging to the place is unmoved.',
    exemplarKeywords: [
      'electric field',
      'field equals force divided by charge',
      'force per unit charge',
      'does a bigger test charge make a bigger field',
      'what is the field at this point',
      'test charge placed in a field',
      'why we divide the force by the charge we used',
      'newtons per coulomb',
      'field around a single positive charge',
      'the field is a property of the place, not of what you put there',
    ],
  },

  briefing: {
    observable: [
      'A positive source sits in the middle of a grid, and at some forty places around it a thin arrow is already drawn pointing straight outward, long close in and short out toward the corners.',
      'The innermost ring of arrows are all drawn at one length instead of continuing to grow, so the crowding right beside the source stops increasing.',
      'Three small test charges appear at three of the grid places, each named as one unit of charge, and each receives a thick arrow in the accent colour.',
      'Each thick arrow lies exactly along the thin arrow already at that place and matches it in length, with the thin one drawn on top so a band of accent colour shows on either side of it.',
      'The test charge on the left is then renamed as twice the charge and its thick arrow grows to twice the length, while the thin arrow lying on it stays at the length it always had.',
      'The test charge on the right, the same distance from the source, keeps a single-length thick arrow throughout, so at two places of equal strength the difference is only in what was put down.',
      'Released, the three travel outward along the arrow that was at their place, leaving a faint dotted trail, and the thick arrow each carries shortens as it goes.',
      'The grid arrows at the places they set out from are still drawn, unchanged, after the charges have left them.',
      'The two kinds of arrow are told apart by thickness and by which is drawn over which, not by writing a symbol on either; no strength, distance or unit is written anywhere.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the arrows are laid, the charges are placed, one is enlarged and all three are released, and the run begins again.',
        'The size of a test charge is shown by its name rather than by drawing it bigger, so nothing suggests that bulk has anything to do with the force.',
        'The unit test charge is not adjustable, because the whole arrangement rests on the place arrow being what one unit would feel; the enlargement is made to the charge on the left and named on screen.',
        'The accent colour is kept for the force a test charge is feeling right now, and the thin place arrows are drawn in a quieter tone.',
        'Test charges are placed only where the arrows are not capped, so the exact overlap and the doubling are seen where the drawing is still in proportion.',
      ],
    },

    useWhen: [
      'The article has defined the field as force divided by charge, and the reader is reading the division as a piece of bookkeeping. The thick arrow doubling while the thin one under it holds still is what makes the quotient stand for something present at the place.',
      'The prose needs a reader to stop asking how big the test charge should be, by showing that the answer belonging to the place does not depend on it.',
    ],

    avoidWhen: [
      'The article uses field lines, line density or tubes as its picture. Nothing continuous is drawn here; each place answers for itself with a separate arrow.',
      'Two or more sources are present and the question is how their fields combine. Exactly one source lays these arrows.',
      'A negative charge is put into the field and the point is that it goes the other way. Every test charge here is positive.',
      'The article is about how the strength falls off with distance in numbers — a quarter, a ninth. There are no distance marks and the ring closest to the source is drawn at a capped length.',
      'A value is wanted in newtons per coulomb, or two fields are to be compared in size. Nothing is labelled with a quantity.',
      'The subject is gravity, or a field that anything at all responds to. What is put down here is charge, and its amount is what the screen varies.',
    ],

    contrastWith: [
      {
        concept: 'gravitational-field',
        note: 'One varies what is put down and shows that the place keeps its value regardless; the other never varies it, because with gravity the thing put down brings nothing that could change the response.',
      },
      {
        concept: 'field-lines',
        note: 'One gives every place its own arrow, so a single place can be read off directly; the other draws a small number of continuous lines and rests on crowding, which is a claim about neighbourhoods rather than points.',
      },
      {
        concept: 'uniform-field',
        note: 'One is about what a value at a place means; the other is about an arrangement where that value happens to be the same at every place inside it.',
      },
      {
        concept: 'coulombs-law',
        note: 'One divides the second charge out so what is left belongs to the place alone; the other keeps both charges in the answer and asks what the separation does to it.',
      },
    ],
  },
};
