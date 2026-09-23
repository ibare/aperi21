/**
 * charles-law 개념 선언.
 *
 * PVT 셋 중 하나. 이쪽은 **직선과 되이음** 을 주장한다.
 *   ideal-gas-law  셋의 묶임 — 붙들고 바꾸면 남은 하나가 배수로 따라간다
 *   boyles-law     곱 — 모양이 다른 직사각형 셋의 넓이가 같다
 *   charles-law    **직선과 되이음** — 양이 다른 셋의 선을 거꾸로 이으면 한 자리에 모인다
 * 이쪽만 실린더 셋 · 같은 무게추 · 기울기가 다른 세 선 · 이어 본 점선 · 만나는 한 점 어휘를 갖는다.
 * 자물쇠 · 배수 막대 · 곡선 · 넓이는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const charlesLawConcept: Aperi21ConceptSource = {
  id: 'charles-law',
  label: 'Volume Against Temperature and Where the Lines Meet',
  canonicalSim: 'aperi21:charles-law',

  surface: {
    definition:
      'Held at one pressure, a gas grows in step with its temperature along a straight line, and lines for different amounts, continued backwards, all vanish at a single temperature.',
    exemplarKeywords: [
      'Charles’s law',
      'a balloon shrinks when taken outside in the cold',
      'volume rises in step with temperature',
      'where does minus two hundred and seventy three come from',
      'extending the line back to zero volume',
      'heating a gas under a free piston',
      'why is there a lowest possible temperature',
      'different amounts of gas give different slopes',
      'straight line of volume against degrees',
      'the lines all point to the same place',
    ],
  },

  briefing: {
    observable: [
      'Three cylinders stand at the left, each with a free piston carrying the same weight, so the push on all three gases is the same; the gases are of different amounts and are marked with a circle, a square and a triangle.',
      'A plate beneath all three glows while it heats them, and the three pistons rise together.',
      'At the right a dotted upright line marks the temperature now and travels rightward, and each time it passes a twenty-five degree place a point is dropped for each gas at the height of its piston.',
      'The gas columns and the vertical axis of the graph are drawn to one scale, so a point sits exactly as high as the piston it came from.',
      'Once the points are down, each gas has them joined by a straight solid line, and the three lines visibly differ in slope.',
      'The three lines are then continued leftward as dotted lines, past the axis, into temperatures no cylinder ever reached.',
      'The dotted lines draw closer as they descend and arrive together at one place on the horizontal axis, where a ring appears and the number minus two hundred and seventy three point one five is written.',
      'The vertical axis stands at zero degrees, so everything to its right was measured and everything to its left was continued — the divide is a place on the picture rather than a warning.',
      'Cooling lowers the pistons, the drawing fades, and the round begins again.',
      'Nothing states a current temperature as a number; where the temperature has reached is the position of the travelling dotted line.',
    ],

    screen: {
      affordances: [
        'One round heats, drops the points, joins them, continues them and marks the meeting place, then begins again; nothing has to be pressed.',
        'The volumes are worked out from the state of each gas at every instant, and the meeting place is found by continuing the lines through the points actually dropped — three separate lines arriving at one place is therefore evidence rather than a drawn decision.',
        'The three gases are told apart by the shape of their marks rather than by colour, and the same marks appear on the cylinders, so a line can be traced back to the cylinder it came from.',
        'The measured stretch is drawn solid and the continued stretch dotted, so how much of the claim rests on measurement is legible.',
        'Numbers appear only at the first and last temperature heated to and at the meeting place; no running temperature or volume is written.',
      ],
    },

    useWhen: [
      'The article has named a lowest possible temperature and the reader has taken it on authority. Three lines of different slope, continued backwards from measurements that stop well above freezing, arriving together at one place is what turns it into something reasoned.',
      'The reader believes a larger amount of gas should respond differently, and the moment wanted is the one where the three slopes plainly differ yet the three continuations still meet.',
    ],

    avoidWhen: [
      'The push on the gas is changing in the article, or the argument turns on squeezing. Every piston here is free and carries the same weight from start to finish.',
      'The claim is that a pressure and a volume trade off, or that something is conserved as a gas is compressed. Nothing here is compressed and no product is formed.',
      'The article works in kelvin and the point is that the line then passes through the origin. One horizontal scale is drawn here, in degrees Celsius, and a second scale would make it a second claim.',
      'The reader is to be shown a gas actually reaching the meeting place, or what happens near it. Every measurement here is taken between zero and a hundred degrees; the rest is a line continued on paper.',
      'Real volumes in litres, or the amounts of gas as numbers, are to be quoted. That the amounts differ shows as differing column heights, and no amount is written.',
      'The subject is molecules moving faster as a gas is heated. Nothing inside these cylinders is drawn.',
    ],

    contrastWith: [
      {
        concept: 'ideal-gas-law',
        note: 'One passes through this condition long enough to say that the volume doubled with the temperature; the other stays in it and asks what the straight line is pointing at.',
      },
      {
        concept: 'boyles-law',
        note: 'Both hold one quantity and watch two others, but one ends with a product that survives a squeeze while the other ends with a line continued past everything measured.',
      },
      {
        concept: 'maxwell-boltzmann-distribution',
        note: 'Both turn on what a temperature is, one by asking what the gas as a whole does as the temperature falls towards nothing, the other by asking how the molecules inside it are spread at a temperature it actually has.',
      },
    ],
  },
};
