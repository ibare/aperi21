/**
 * biot-savart-law 개념 선언.
 *
 * 자기장 넷 가운데 이쪽은 **합의 출처**다 — 한 점의 장을 조각마다의 몫으로 쪼개
 * 머리-꼬리로 이으면 옆 몫이 지워지고 축 방향 하나가 남는다.
 *   biot-savart-law       **더하기** — 방향이 다른 몫들이 쌓여 축으로 닫힌다
 *   field-of-straight-wire 이미 선 장의 **모양과 떨어짐** (감기고, 멀수록 약하다)
 *   magnetic-field        자석 장의 모양이 **드러나는** 일
 *   magnetic-field-lines  한 가닥에 **끝이 있는가**
 * 이 화면은 축 위 점이라 모든 몫의 **크기가 같다** — 「멀거나 비스듬하면 작다」 는 하지 않으므로
 * avoidWhen 으로 되돌렸다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const biotSavartLawConcept: Aperi21ConceptSource = {
  id: 'biot-savart-law',
  label: 'Field Built from Current Elements',
  canonicalSim: 'aperi21:biot-savart-law',

  surface: {
    definition:
      'That the field at a point is the sum of a separate contribution from every short length of the current: laid nose to tail, the sideways parts of those contributions cancel one another and the total is left standing along the axis.',
    exemplarKeywords: [
      'Biot-Savart law',
      'contribution of a current element',
      'field on the axis of a current loop',
      'adding up what each bit of wire contributes',
      'why do the sideways components cancel',
      'building a field out of small pieces',
      'integrating round a circular loop of current',
      'every short length of current makes its own small field',
      'vector sum of field contributions',
      'field at the centre of a circular coil',
    ],
  },

  briefing: {
    observable: [
      'A circular loop of current is seen at an angle, so it is drawn as an upright ellipse with the near half dark and the far half faint; twelve marks divide it into pieces and a letter names the direction the current runs.',
      'A dashed line runs along the axis of the loop and carries a named point on it.',
      'Pieces are lit one at a time in the accent colour, and a dashed line is drawn from the lit piece across to that point.',
      'As each piece lights, an arrow grows out of the tip of the one before it, so the arrows build a chain nose to tail starting from the point.',
      'The pieces of the upper half are taken first and every one of their arrows tilts upward, so the chain leaves the point almost flat, steepens, and rises to the top of an arch.',
      'The pieces of the lower half follow, their arrows tilting downward, and the chain comes back down to land exactly on the dashed axis.',
      'A single thick arrow is then drawn from the point to the end of the chain, lying along the axis, and the arch and that straight arrow are held side by side.',
      'Every arrow in the chain is the same length as every other, since from a point on the axis each piece is the same distance away and square to the line joining them.',
      'The chain arrows and the total are in the same colour and differ only in thickness, because they are the same kind of quantity.',
      'No strength, distance or constant is written; a line of text at the start names how many pieces the loop has been divided into.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the pieces are lit in turn, the chain is built, the total is drawn and the run begins again.',
        'One scale with no ceiling is used for every arrow, so the chain is a genuine sum rather than an arrangement made to look like one.',
        'Depth is given only by drawing the far half of the loop faintly and the near half dark.',
        'The pieces are lit starting from one side, so that every arrow of the first half tilts one way and every arrow of the second half the other, and the two halves of the account match the two halves of the chain exactly.',
        'The point stays on the axis, where the chain closes back onto the axis; anywhere off it the chain would not close and a different claim would be made.',
        'The dashed line from the lit piece across to the point is what that piece contributes square to, so the rule can be checked against the drawing piece by piece.',
      ],
    },

    useWhen: [
      'The article has written the law as an integral and the reader cannot see what is being added or why the answer ends up along the axis. A chain of equal arrows rising into an arch and coming back down onto the axis is where the cancelling is watched rather than asserted.',
      'The prose needs the idea that a field is built out of contributions before any particular case is worked out, and here the adding itself is shown one contribution at a time.',
    ],

    avoidWhen: [
      'The article is about a contribution weakening with distance or with the angle the piece makes. Every piece here is the same distance from the point and square to it, so all the contributions come out the same length.',
      'The wire is straight, or the field is wanted all around a wire rather than at one point on an axis.',
      'The subject is the shape of the field over a region, the lines it makes, or a coil of several turns. One point is answered here.',
      'A number is wanted — a field strength, the constant in the law, the integral written out. Nothing carries a figure but the count of pieces.',
      'The reader is meant to drag the point off the axis. It is fixed, because off the axis the chain would not close and the conclusion would be a different one.',
      'The field under discussion is made by a magnet rather than by a current.',
    ],

    contrastWith: [
      {
        concept: 'field-of-straight-wire',
        note: 'One takes a field apart into the contributions that were added to make it, at a single point; the other takes the field as it stands around a wire and is about how it wraps and how it fades with distance.',
      },
      {
        concept: 'superposition-of-forces',
        note: 'Both rest on each source contributing as though the others were absent, but one adds many contributions from one continuous source and watches most of them cancel; the other keeps a few distinct sources and watches what altering one of them leaves untouched.',
      },
      {
        concept: 'magnetic-field-lines',
        note: 'One answers how large the field is at one point on an axis; the other never asks how large anything is and follows a single line to see whether it ends.',
      },
      {
        concept: 'equilibrium-of-forces',
        note: 'Both lay arrows nose to tail, but one is adding contributions whose total is the answer; the other is about arrows that close into a shape with nothing left over at all.',
      },
    ],
  },
};
