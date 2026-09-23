/**
 * boyles-law 개념 선언.
 *
 * PVT 셋 중 하나. 이쪽은 **곱이 남는다** 를 주장한다.
 *   ideal-gas-law  셋의 묶임 — 붙들고 바꾸면 남은 하나가 배수로 따라간다
 *   boyles-law     **곱** — 모양이 다른 직사각형 셋의 넓이가 같다
 *   charles-law    직선과 되이음 — 곧게 늘고, 이어 보면 한 점에 모인다
 * 이쪽만 누름 · 압력계 바늘 · 곡선 위를 따라가는 점 · 겹친 직사각형 · 넓이가 같음 어휘를 갖는다.
 * 자물쇠 · 배수 막대 · 곧은 선 · 모이는 점은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const boylesLawConcept: Aperi21ConceptSource = {
  id: 'boyles-law',
  label: 'Squeezing a Gas at One Temperature',
  canonicalSim: 'aperi21:boyles-law',

  surface: {
    definition:
      'Squeezing a gas whose temperature never changes raises its pressure by exactly as much as it shortens the volume, so the two together always account to the same amount.',
    exemplarKeywords: [
      'Boyle’s law',
      'squeezing a syringe with the end blocked',
      'halve the volume and the pressure doubles',
      'pressure times volume stays the same',
      'compressing a gas without heating it',
      'why does a plunger get harder to push',
      'pressure goes up as the space goes down',
      'the two make up for each other',
      'an air pocket shrinking as a diver descends',
      'inverse relation between the space and the push',
    ],
  },

  briefing: {
    observable: [
      'A piston is pressed slowly into a cylinder at the left, shortening the gas column to a half and then to a third of what it was.',
      'A gauge plumbed to the cylinder has a needle that climbs to two and then to three as the column shortens, and a written temperature beside the cylinder is the same at every moment of the round.',
      'At the right a point rides along a curve, moving left and upward as the column shortens, and never leaves the curve.',
      'A filled rectangle is drawn from the origin out to that point, so it narrows and grows taller as the point travels; a small mark on it names it as a pressure taken together with a volume.',
      'At each place the piston pauses a dotted outline of the rectangle is left behind, so by the third pause three outlines are lying over one another — one square, one narrow and tall, one narrower and taller.',
      'The three outlines are plainly different shapes, and just as plainly cover the same amount of the picture; nothing is written to say so.',
      'Releasing the piston walks the point back up the same curve to where it began, and the left-behind outlines fade.',
      'Numbers appear on the two axes and on the gauge only at the three places the round stops.',
      'The gas column in the cylinder and the horizontal axis of the graph are drawn to one scale, so the column shortening and the point moving left are the same distance.',
      'A couple of dozen molecules drift in the column; crowding them into a shorter space does not lengthen their trails.',
    ],

    screen: {
      affordances: [
        'One round presses, pauses, presses, pauses and releases, then begins again; nothing has to be pressed.',
        'The needle and the point are worked out from the state of the gas at every instant, so the needle standing at three is a result rather than a written value.',
        'The three rectangles are all one colour because all three are the same quantity; the one in force is filled and the finished ones are dotted.',
        'No gridlines are drawn, because counting squares would turn the equal amounts into arithmetic and bury the curve; the left-behind outlines do the work of guide lines.',
        'The amount itself is never written as a number — the claim that the three are equal is left to the shapes lying over one another.',
      ],
    },

    useWhen: [
      'The article has stated that pressure and volume vary inversely and the reader has taken it as two numbers moving in opposite directions with nothing tying them. Three rectangles of different shape covering the same amount is what makes the tie visible.',
      'The reader accepts that squeezing raises the pressure but not that the rise is settled in advance, and the moment wanted is the point arriving on a curve it never leaves.',
    ],

    avoidWhen: [
      'The temperature in the article is changing, or the argument depends on heating and cooling. The temperature written beside this cylinder is the same throughout the round.',
      'The claim is about volume following temperature, or about a line extended back to where volume would vanish. Nothing here is plotted against temperature.',
      'A third quantity is to be brought in, or the reader is to be shown which quantity was held while others moved. One condition runs here and no other is offered.',
      'Real pressures and volumes are wanted in kilopascals or litres. The axes carry only the multiples the round stops at.',
      'The article is about why the pressure rises — about molecules hitting the walls more often in a smaller space. The molecules here drift as background and nothing counts their blows.',
      'The gas is to be shown warming as it is compressed, as it does when compressed quickly. This compression is slow and the temperature is held throughout.',
    ],

    contrastWith: [
      {
        concept: 'ideal-gas-law',
        note: 'One is a single condition followed far enough to show what is conserved through it; the other passes through three conditions in turn and only reports which quantity followed in each.',
      },
      {
        concept: 'charles-law',
        note: 'Both hold one quantity and watch two others, but one ends in a product that survives while the other ends in a straight line and the place it points to when continued.',
      },
      {
        concept: 'gas-pressure',
        note: 'One takes it as given that a smaller space means a larger pressure and asks how much larger; the other asks what a pressure is made of in the first place.',
      },
    ],
  },
};
