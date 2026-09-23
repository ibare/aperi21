/**
 * poiseuille-flow 개념 선언.
 *
 * 점성 셋 중 **관이 내보내는 양** 쪽.
 *   viscosity        층과 층 사이의 힘
 *   poiseuille-flow  **관 하나가 같은 압력에서 내보내는 양** — 반지름 4제곱
 *   stokes-drag      유체 속을 가는 물체가 가라앉는 빠르기
 * 이쪽만 「관 · 포물선 속도 · 벽에서 0 · 열여섯 칸 · 반지름 네제곱」 어휘를 갖는다.
 *
 * `continuity-equation` 과도 갈린다 — 그쪽은 단면 전체가 한 빠르기이고 굵기가 바뀌면 빨라진다는
 * 주장이다. 이쪽은 **한 단면 안에서 빠르기가 다르고**, 같은 압력에서 굵은 관이 얼마나 더
 * 내보내는가를 센다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const poiseuilleFlowConcept: Aperi21ConceptSource = {
  id: 'poiseuille-flow',
  label: 'A Pipe’s Fourth-Power Delivery',
  canonicalSim: 'aperi21:poiseuille-flow',

  surface: {
    definition:
      'How much a viscous fluid a pipe passes under a given push: quickest along the axis and still at the wall, and adding up to a total that grows as the fourth power of the radius.',
    exemplarKeywords: [
      'Poiseuille flow',
      'Hagen-Poiseuille law',
      'flow rate goes as the fourth power of the radius',
      'parabolic velocity profile in a pipe',
      'why does a slightly wider pipe carry so much more',
      'blood through a narrowed artery',
      'twice the radius gives sixteen times the flow',
      'fluid is slowest right at the pipe wall',
      'steady flow driven down a tube by a pressure difference',
      'doubling a pipe’s width for more throughput',
    ],
  },

  briefing: {
    observable: [
      'Two pipes of the same length lie one above the other, seen from the side, pushed by the same pressure; the lower one has twice the radius of the upper.',
      'At the left of each, the pipe’s circular cross-section is drawn face on, and the two circles stand in the ratio of one to two.',
      'Dye is laid across each inlet in a straight line and then carried along by the flow, so each line bows out into a tongue — farthest along the axis, held back at the wall, where it never leaves the inlet at all.',
      'Comparing tongues of the same age, the wide pipe’s tip has run four times as far as the thin pipe’s.',
      'Fresh dye lines are laid at intervals, and the older tongues fade as they go, so several ages of the same shape are in the picture at once.',
      'Dots drift through the water in both pipes, quick in the middle and crawling near the walls.',
      'To the right of each pipe stands a set of cells to be filled: one cell for the thin pipe, sixteen in four rows of four for the wide one, all of the same size.',
      'They fill together from the bottom row up, and they come full in the same instant — one cell against sixteen, out of pipes whose radii differ by two.',
      'A single caption stands under the picture and says the same thing at every moment of the round.',
    ],

    screen: {
      affordances: [
        'One round runs on its own and repeats: eight seconds of filling, two seconds full, then empty and begin again.',
        'Arriving readers land partway through a filling, with the thin pipe’s cell an eighth full and two of the wide pipe’s already done.',
        'Nothing is offered to press or drag. Letting the radius be changed would make the cell counts stop being whole numbers, and the one-against-sixteen count is what carries the claim.',
        'The cells are all of one size and fill from the bottom, so reading the result is counting rather than comparing volumes by eye.',
        'The claim is made twice over, once by the tongue tips at four to one and once by the cells at sixteen to one, so the two powers can be told apart: four from the speed, four again from the area.',
        'The dye holds at the wall, which is the assumption the whole result rests on, and it is left plainly visible rather than tidied away.',
      ],
    },

    useWhen: [
      'The article has stated that flow goes as the fourth power of the radius and the reader finds the figure implausible. Sixteen cells filling in the time one cell takes makes the number something counted instead of asserted.',
      'The reader knows that a wider pipe carries more but supposes the gain to be in proportion to the area. The tongue tips at four to one, with the cells at sixteen to one, is where the second factor becomes visible.',
    ],

    avoidWhen: [
      'The claim is that a stream quickens where its channel narrows, with the same amount getting through either way. These pipes are both of a constant width and neither one narrows.',
      'The article is about flow breaking up into eddies, or at what point smooth flow stops. Both of these pipes are smooth throughout.',
      'The subject is a body moving through a fluid and the resistance it meets. Nothing is put into these pipes but the fluid.',
      'The article needs the fluid’s thickness itself — what viscosity is, or how it is measured. It is assumed here and never varied; the two pipes hold the same fluid.',
      'The point is pressure in a pipe, or the pressure lost along its length. The push is the same on both and is never drawn.',
      'Values are wanted — litres per second, a pressure drop, a viscosity. There is not a number in the picture.',
    ],

    contrastWith: [
      {
        concept: 'viscosity',
        note: 'One is the friction between layers isolated as a force on a boundary; the other is what that friction adds up to across a round pipe, which is how much the pipe delivers.',
      },
      {
        concept: 'continuity-equation',
        note: 'One lets the speed vary from axis to wall and asks how much a whole pipe passes under a given push; the other holds the speed uniform across a cross-section and asks what narrowing does to it.',
      },
      {
        concept: 'stokes-drag',
        note: 'Both are results of the same slow, sticky flow, and both go as a power of a radius: one is how much a pipe of that radius carries, the other how fast a sphere of that radius settles.',
      },
      {
        concept: 'laminar-vs-turbulent',
        note: 'One holds throughout only so long as the layers keep their order; the other is where whether they keep it is the question.',
      },
    ],
  },
};
