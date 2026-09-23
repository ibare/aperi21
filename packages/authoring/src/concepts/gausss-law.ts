/**
 * gausss-law 개념 선언.
 *
 * 장 다섯 가운데 이쪽은 **세는 일**이다 — 경계 모양을 바꿔도 알짜 수가 같다.
 *   gausss-law       닫힌 경계를 지나는 **알짜 수**는 **안에 든 전하**만 본다 (밖이면 0)
 *   field-lines      **몰린 곳이 세다** — 간격이 주장이다
 *   electric-field   **자리 값**과 단위 전하
 *   field-of-dipole  한 쌍의 모양과 빠른 떨어짐
 *   uniform-field    평행판 사이는 어디서나 같다
 * 이쪽만 「닫힌 경계 · 감싼다 · 나감과 들어옴이 상쇄 · 모양을 바꿔도 같다」 어휘를 갖는다.
 * 간격 · 밀도 · 알갱이는 field-lines 에 둔다. 대칭면을 잡아 장을 **구하는** 쓰임은
 * 화면이 하지 않으므로 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const gausssLawConcept: Aperi21ConceptSource = {
  id: 'gausss-law',
  label: 'Net Count Through a Closed Boundary',
  canonicalSim: 'aperi21:gausss-law',

  surface: {
    definition:
      'That the net number of field lines crossing a closed boundary is settled by the charge enclosed and by nothing else: squeeze the boundary into a new shape or swell it, and the count is the same; enclose nothing and it is zero.',
    exemplarKeywords: [
      "Gauss's law",
      'flux through a closed surface',
      'does the shape of the surface change the answer',
      'the enclosed charge is all that matters',
      'net flux is zero when no charge is inside',
      'choosing a surface to draw around a charge',
      'lines going in cancel lines coming out',
      'counting field lines through a boundary',
      'why any surface around the same charge gives the same result',
      'a surface that encloses nothing',
    ],
  },

  briefing: {
    observable: [
      'A charge marked plus sits on the left with eight straight lines running out of it, each ending in a head that points away.',
      'On the right stand four columns built of separate dots, with two reference lines across them — a solid one at nothing and a dotted one at the count the charge is worth — and beneath each column a small picture of the boundary it belongs to.',
      'A point sets off anticlockwise round a small closed curve drawn about the charge, and at each place where it passes a line a filled dot is left on the curve and another is added to the first column.',
      'The first column comes to rest exactly on the dotted reference.',
      'The curve then folds itself into a pinwheel with reaching arms, and going round it again some lines are met three times over — filled dot, then a hollow ring where the line is crossed the other way, then filled again.',
      'Each hollow ring takes the top dot back off the column, so the column rises and falls as the point travels, yet finishes on the same dotted reference as before, with twelve filled dots and four hollow rings left on the curve.',
      'A large circle comes next, met by each line just once and far out from the charge, and its eight filled dots leave the third column level with the other two.',
      'Finally the curve moves off to one side so that the charge is outside it: two crossings are gained on the far edge, two hollow rings are taken back on the near edge, and the fourth column climbs and then settles on the solid line at nothing.',
      'Three columns level with one another and a fourth at nothing are held together before the whole thing fades and begins again.',
      'Nothing is written but the count on the dotted reference; going out and coming in are told apart by filled dot against hollow ring, both in the same accent colour.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the four boundaries are counted in turn and the run repeats.',
        'The count is taken from the crossings themselves with their direction, so an enclosing boundary reaches exactly the line count and a boundary that encloses nothing reaches exactly nothing.',
        'The four boundaries are shapes of one family, so the changes read as squeezing, swelling and shifting one boundary rather than as four unrelated drawings.',
        'A small picture of its boundary beneath each column ties the two together without a word of labelling.',
        'What is drawn is a closed curve in the plane, and the lines are straight rays, so the counting stands as counting rather than as a picture of a surface in space.',
        'Going out and coming in share one colour because they are the same event in two directions; the accent colour carries the single meaning of a counted crossing.',
      ],
    },

    useWhen: [
      'The article has stated that the flux depends only on the charge enclosed and the reader cannot see why the boundary is allowed to be arbitrary. A boundary folded into arms, where lines are crossed three times and two of them cancel, is where the freedom is earned rather than asserted.',
      'The prose needs the case of a boundary that encloses nothing, and a column that climbs and then comes back to nothing says more than the word cancel.',
    ],

    avoidWhen: [
      'The article works a field out by choosing a symmetric surface — a sphere round a ball of charge, a cylinder round a wire, a box at a sheet. Here the crossings are counted and no field is ever solved for.',
      'More than one charge is enclosed, or a negative charge is involved. There is one positive charge and the count is taken from its size alone.',
      'The subject is how strong the field is at a distance, or how the lines thin out as they go. The crossings are counted wherever the boundary happens to meet them.',
      'Numbers are wanted — a flux, the constant in the law, the equation itself. Only the line count appears, as a label on a reference line.',
      'The reader is meant to draw or drag a boundary of their own. The four are fixed and worked through in turn.',
      'The article needs a surface in three dimensions to be pictured, with area and a direction out of it.',
    ],

    contrastWith: [
      {
        concept: 'field-lines',
        note: 'One counts how many lines cross a boundary and finds the spacing makes no difference; the other is entirely about spacing and says nothing about boundaries.',
      },
      {
        concept: 'inverse-square-law',
        note: 'Both turn on a number that is conserved as things spread outward, but one keeps the boundary fixed and watches what crosses it thin out; the other lets the boundary be any shape at all and finds the total unchanged.',
      },
      {
        concept: 'electric-field',
        note: 'One asks what is true of a whole region taken together, whatever its shape; the other asks what is true at a single place.',
      },
      {
        concept: 'field-of-dipole',
        note: 'One would count nothing net for a boundary enclosing both of a pair, since the charges cancel; the other is about the pattern that same pair makes, which is far from nothing.',
      },
    ],
  },
};
