/**
 * work-by-variable-force 개념 선언.
 *
 * 이 묶음에서 「일」 을 말하는 둘이 가장 붙기 쉽다. **일을 어디서 읽는가**로 갈랐다.
 *   work-by-variable-force  힘이 자리마다 다를 때 **곱 한 번으로는 못 구한다** — 띠를 쌓아 넓이로 읽는다
 *   work-energy-theorem     힘이 일정한 두 방식의 **곱이 같으면** 붙는 속력이 같다
 * 이쪽만 「자리마다 다른 힘」 · 「조금씩 쌓는다」 · 「그래프 아래 넓이」 어휘를 갖는다.
 * 속력 · 에너지 · 운동 에너지라는 말은 쓰지 않는다 — 화면에 속도 화살표조차 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const workByVariableForceConcept: Aperi21ConceptSource = {
  id: 'work-by-variable-force',
  label: 'Work Done by a Varying Force',
  canonicalSim: 'aperi21:work-by-variable-force',

  surface: {
    definition:
      'Work found when the pushing force differs at every position, accumulated step by step as the area shut in under a force-against-displacement curve rather than from one multiplication.',
    exemplarKeywords: [
      'work done by a variable force',
      'area under a force-displacement graph',
      'force times distance when the force is not constant',
      'which value of the force do I use',
      'adding up small bits of work',
      'F dx summed over the push',
      'work as an integral of force over distance',
      'force-extension graph area',
      'why work is an area and not a product',
      'work done over a push where the force rises and falls',
    ],
  },

  briefing: {
    observable: [
      'A box is pushed along a track by an arrow at its left face, and the length of that arrow changes as the box travels — longest near the middle of the run, shorter at both ends.',
      'Directly below the track, sharing the same horizontal axis, a curve is drawn from end to end before the push begins, so the force at every position is settled in advance and only the filling is in progress.',
      'A faint dropped line runs from the box down to the curve, and at its foot stands an upright column of the same colour and the same length as the pushing arrow — the lying arrow set on end.',
      'Each small advance of the box lays one more strip under the curve, and the strips are separated by thin rules: the width between rules is the step, the height of each strip is the force at that place.',
      'The strip being laid now is drawn darker than the strips already finished, so the growing edge is always visible.',
      'The box travels at one steady pace throughout, so the strips widen at a constant rate and only their heights differ — where the curve is low the filled area grows slowly, where it is tall it grows fast.',
      'The tops of the strips follow the curve itself rather than stepping under it, so no gaps are left between the filling and the curve.',
      'When the push ends the arrow, the column and the dropped line disappear, and the letter W rises in the middle of the filled region.',
      'Only symbols are written — F on the arrow and on the vertical axis, x on the horizontal axis, W on the finished area. No numbers and no axis ticks appear anywhere.',
    ],

    screen: {
      affordances: [
        'The push, the laying of each strip and the appearance of W happen in order and then begin again, so every position of the changing force comes round without being asked for.',
        'The track and the curve share one horizontal axis, so the place the box has reached and the place the strip is being laid line up vertically with no transferring by eye.',
        'The run opens with the box already a couple of strips along, so a partly filled area is on screen from the first moment.',
        'The pushing arrow and the upright column are drawn in one colour because they are one force; the filled area alone carries the accent colour.',
      ],
    },

    useWhen: [
      'The reader has met work as force times distance and is now told the force changes along the way, so the honest question is which value of the force to put in the product. Watching one strip per step settle under the curve answers it without a formula.',
      'A passage is about to introduce an integral of force over distance and a picture is wanted of what is being added up before the notation arrives.',
    ],

    avoidWhen: [
      'The point is what the work then does to the body — speed gained, energy stored, a body brought to a halt. This box has no velocity arrow and nothing is said about what it carries away.',
      'The force in question is constant and the work is a single product. The whole reason for the strips here is that the force differs from place to place.',
      'The article turns on a spring and on force growing in proportion to stretch. The curve here rises and then falls, and no spring is drawn.',
      'Values in joules or newtons are needed, or the area has to be worked out. Only the letters F, x and W are written.',
      'The subject is a graph of velocity or acceleration against time. The horizontal axis here is distance travelled, not the clock.',
    ],

    contrastWith: [
      {
        concept: 'work-energy-theorem',
        note: 'One answers how to get the work at all when the force will not sit still; the other takes the work as already settled and says what it buys in speed.',
      },
      {
        concept: 'spring-force',
        note: 'One is about summing a force that changes to get the work; the other is about the rule by which a particular force changes with stretch.',
      },
      {
        concept: 'elastic-potential-energy',
        note: 'One says how work is counted up when the force varies; the other skips the counting and shows only the size of the store that results from a deformation.',
      },
      {
        concept: 'velocity-time-graph',
        note: 'Both claim a shut-in area is the quantity that matters, but of different graphs — force against distance buys work, speed against time buys ground covered.',
      },
    ],
  },
};
