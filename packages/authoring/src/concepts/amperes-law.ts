/**
 * amperes-law 개념 선언.
 *
 * 자기장 만들기 셋 가운데 이쪽은 **세는 일**이다 — 길을 한 바퀴 돌며 쌓은 합이 길의
 * 모양과 무관하고 감싼 전류만 본다.
 *   amperes-law                 닫힌 길 **한 바퀴의 합** · 감싸지 않으면 0
 *   field-of-loop-and-solenoid  고리를 겹치면 안이 고르고 세진다 (모양의 이야기)
 *   force-between-wires         두 전류가 서로에게 주는 힘
 * 이쪽만 「닫힌 길 · 걷는다 · 길 방향 몫 · 쌓인 합 · 모양을 바꿔도 같다 · 감싸지 않으면 0」
 * 어휘를 갖는다. 이미 선언된 `gausss-law` 와는 **경계가 무엇인가**로 갈랐다 — 저쪽은
 * 닫힌 면을 지나는 알짜 수, 이쪽은 닫힌 길을 따라 쌓은 합이다. 대칭면을 잡아 장을
 * **구하는** 쓰임은 화면이 하지 않으므로 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const amperesLawConcept: Aperi21ConceptSource = {
  id: 'amperes-law',
  label: 'Circulation of the Field Around an Enclosed Current',
  canonicalSim: 'aperi21:amperes-law',

  surface: {
    definition:
      'That walking once round a closed path and adding up the part of the magnetic field lying along it gives a total fixed by the current the path encircles, whatever shape the path is given.',
    exemplarKeywords: [
      "Ampère's law",
      'circulation of the magnetic field',
      'adding up B along a closed path',
      'does the shape of the path change the total',
      'the current the path goes around',
      'a path that misses the current',
      'going with the field adds, going against it takes away',
      'why any loop drawn around a wire gives the same answer',
      'walking a loop around a current-carrying wire',
      'the tangential part of the magnetic field',
    ],
  },

  briefing: {
    observable: [
      'A wire is seen end-on at the left as a ringed dot marked with a current symbol, and three empty columns stand at the right with two reference lines across them — a solid one at nothing and a dashed one at the height the current is worth.',
      'A point sets off from the bottom of a circle drawn round the wire and walks anticlockwise, the stretch behind it thickening as it goes.',
      'From the walking point two arrows come: the field there, and beneath it a broader one for the part of that field lying along the path. On the circle the two lie on top of one another, since the field is entirely along the way.',
      'The lap is cut into sixteen equal stretches, and each completed stretch is added to the first column as a tick, so the column climbs in steps.',
      'After one full lap the first column stands exactly on the dashed line.',
      'The circle is then left faint and a squashed, lobed loop is walked instead, the same sixteen equal stretches: close to the wire the ticks are tall, far from it they are short, so the column climbs unevenly.',
      'On that loop the field arrow and the along-the-path arrow no longer coincide, and a dotted line is dropped between their tips to show the two coming apart.',
      'The second column nonetheless finishes on the same dashed line as the first.',
      'A third loop, a tall narrow one standing to the right of the wire so that the wire is outside it, is walked last: the far side adds to the column and the near side takes away, and the column climbs and then falls back to rest exactly on the solid line at nothing.',
      'How high the column had reached before it fell is left behind as a hatched block above the final level, so the climb is still readable after the fall.',
      'The three columns are held together at the end — two level on the dashed line, one at nothing — each with a small drawing of its own loop beneath it, and then everything fades and begins again.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the three paths are walked in turn and the run repeats.',
        'All three start at the same place, at the bottom, and go the same way round, so shape is the only thing that differs between them.',
        'The walking speed is even along each path, which is what makes the column climbing fast near the wire read as the field being strong there rather than as the point hurrying.',
        'The total is built from the turning of the direction to the wire rather than from sampling, so an encircling path lands exactly on the reference line and a path that encircles nothing lands exactly on nothing.',
        'A small picture of its own loop sits beneath each column, which ties column to path without a word of labelling.',
        'The accent colour is kept for the stretch being added right now, and the amount taken back off is left as a hatched block in the quieter tone.',
      ],
    },

    useWhen: [
      'The article has asserted that the circulation depends only on the current enclosed and the reader cannot see why the path is allowed to be any shape at all. The squashed loop, where the stretches are wildly uneven yet the column ends on the same line, is where that freedom is earned.',
      'The reader has taken a nearby wire to matter because its field is plainly there in the region the path crosses. Watching the column climb where the field pushes along the path and give it all back where the field opposes it settles what being outside the loop costs — nothing at all, however close the wire sits.',
    ],

    avoidWhen: [
      'The article uses the law to work out a field — a circle round a wire, a cylinder round a cable, a long coil. Here the field is known throughout and the walking only totals it up; nothing is ever solved for.',
      'More than one current is enclosed, or currents run in opposite directions and their contributions have to be added with signs. There is one wire and one direction.',
      'The path is walked the other way round and the point is that the total comes out negative. Every lap here goes anticlockwise.',
      'The subject is how strong the field is at a given distance, or how it falls off. Whatever the field happens to be where the path passes is simply added in.',
      'Numbers are wanted — a value for the circulation, the constant in the law, or the expression itself. Only the reference line carries a label.',
      'The reader is meant to draw or drag a path of their own. The three are fixed and worked through in order.',
      'A surface in three dimensions is needed, with an area and a direction out of it. What is drawn is a closed curve in the plane.',
    ],

    contrastWith: [
      {
        concept: 'gausss-law',
        note: 'Both find a total that shape cannot touch, but one totals along a closed path and is settled by what the path goes around, while the other totals across a closed boundary and is settled by what the boundary holds inside.',
      },
      {
        concept: 'field-of-loop-and-solenoid',
        note: 'One deliberately throws away the shape of the field and keeps only a single number per path; the other is entirely about the shape, and has no number at all.',
      },
      {
        concept: 'force-between-wires',
        note: 'One asks what a current does to the field around it, taken as a total over a path; the other asks what that field does to a second current sitting in it.',
      },
      {
        concept: 'inverse-square-law',
        note: 'Both are about a quantity that survives being spread out, but one keeps a total constant over closed paths of any shape, while the other watches a strength thin out with distance in a fixed way.',
      },
    ],
  },
};
