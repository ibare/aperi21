/**
 * potential-vs-field 개념 선언.
 *
 * 전위 둘 가운데 이쪽은 **가파름과 세기가 한 짝**이라는 크기 관계다 — 한 축, 부호까지.
 *   potential-vs-field      곡선이 **가파를수록 화살표가 길고**, 평평하면 0, 방향은 **내려가는 쪽**
 *   equipotential-surface   평면에서 두 곡선족이 만나는 **각**(직각), 크기는 말하지 않는다
 * 이쪽만 「접선의 기울기 · 골짜기 바닥에서 0 · 화살표가 돌아선다 · 0 인 장과 0 아닌 전위」
 * 어휘를 갖는다. 2차원 지도 · 지형 · 등고선은 화면에 없으므로 검색어에도 두지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const potentialVsFieldConcept: Aperi21ConceptSource = {
  id: 'potential-vs-field',
  label: 'Reading the Field off the Steepness of the Potential Curve',
  canonicalSim: 'aperi21:potential-vs-field',

  surface: {
    definition:
      'That how strong the field is at a place is how steeply the potential curve runs there, and which way it points is the way that curve falls: flat means none at all, steep means strong.',
    exemplarKeywords: [
      'relation between potential and electric field',
      'field is the gradient of the potential',
      'E equals minus dV by dx',
      'reading the field from a potential graph',
      'where the potential curve is steep the field is strong',
      'flat potential means zero field',
      'which way does the field point on a potential graph',
      'can the potential be large where the field is zero',
      'slope of the voltage against distance curve',
      'what the minus sign in the gradient relation does',
    ],
  },

  briefing: {
    observable: [
      'Three panels are stacked sharing one horizontal axis: a potential curve on top named V, a row of field arrows in the middle named E, and at the bottom three bands of charge marked with plus and minus strokes, the axis itself named x at the right.',
      'The bands are a narrow one crowded with plus strokes, a wide one of minus strokes, and a broad sparse one of plus strokes, so that how densely the strokes sit says how dense the charge is.',
      'A dotted vertical line sweeps from left to right, cutting through all three panels at once.',
      'Where it meets the curve, a short straight segment is laid along the curve; the segment keeps one length throughout and only its tilt changes.',
      'At the same place on the arrow row an arrow appears whose length follows how far the segment has tilted, and where the segment lies flat a small dot stands in place of an arrow.',
      'Behind the sweep, arrows are left standing at evenly spaced places, so the row fills in as it is read rather than being laid out in advance.',
      'Down the steep fall the left-behind arrows are long and point right; at the bottom of the valley there is a dot; up the gentle rise the arrows are turned round to point left and are plainly shorter than those on the fall.',
      'The bottom of the valley is high above the lowest part of the drawn panel and yet carries a dot, so a place that is far from flat in height is flat in slope.',
      'Both ends of the curve run level although they do not run level at the same height — the right-hand end sits above the left.',
      'When the sweep has gone by, the finished row is held whole: long right-pointing arrows under the fall, dots at the bottom and at both ends, short left-pointing arrows under the rise.',
      'Nothing bears a number — no scale, no tick values, only the letters V, E and x.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the sweep runs across, the row fills in, and the finished row is held before the run begins again.',
        'The straight segment laid on the curve keeps one fixed length and changes only its tilt, so steepness is read as an angle and never mistaken for a length.',
        'The left fall and the right rise are deliberately made unequal — a narrow crowded band against a broad sparse one — so that stronger and weaker can be compared rather than merely noticed.',
        'An arrow too short to carry a readable head is left out of the row rather than drawn as a headless bar, since a headless bar would say a direction it does not know.',
        'The accent colour is kept for the place being read right now — the sweep line, the segment on the curve, and the arrow it produces.',
        'The vertical extent of the curve is fitted to its panel rather than to a scale, because what is compared is the tilt at a place against the arrow at the same place.',
        'There is no grid, since a grid would invite the question of how many volts and leave the pairing of tilt with length unread.',
      ],
    },

    useWhen: [
      'The article has written the field as minus the derivative of the potential and the reader can carry out the differentiation but cannot say what the minus sign is doing. The arrow turning round at the bottom of the valley while still pointing the way the curve falls is what that sign is.',
      'The prose needs the case readers most often get wrong — a place where the potential is far from zero and the field is nothing at all. The bottom of the valley sits high and carries a dot.',
    ],

    avoidWhen: [
      'The arrangement is two dimensional and the question concerns contours, maps, or the direction across a level curve. Everything here lies on one axis.',
      'A value is wanted — volts, a field strength, a gradient worked out as a number. Nothing on screen bears a quantity.',
      'The subject is how a set of charges builds the potential in the first place, or how contributions from several sources add. The three bands are simply given and never change.',
      'A charge is released and the motion that follows is the subject. Nothing moves here but the reading sweep.',
      'The subject is the energy of a particular body in a landscape, or whether it is stable at a minimum. The valley bottom is read here only as a place where the field is nothing.',
      'Point charges are wanted, with the potential running off to infinity at them. These are broad slabs, so the curve is smooth all the way across.',
    ],

    contrastWith: [
      {
        concept: 'equipotential-surface',
        note: 'One is about a size read at a place along a line — how steep against how strong; the other never speaks of size and makes its claim about the angle at which two families of curves meet.',
      },
      {
        concept: 'electric-field',
        note: 'One arrives at the field by differencing the potential from place to place; the other never mentions potential and settles the field by what a unit of charge feels.',
      },
      {
        concept: 'potential-energy-curve',
        note: 'One reads a slope as a field belonging to the place, whatever might be put there; the other reads the same slope as the force on one particular body and follows where that body may go.',
      },
      {
        concept: 'uniform-field',
        note: 'One needs the strength to change from place to place, which is what makes a slope worth reading; the other is an arrangement built so that it does not change at all.',
      },
      {
        concept: 'velocity-time-graph',
        note: 'Both turn a slope into a second quantity, but one reads the slope of a curve over position and gets something belonging to that place, while the other reads a slope over time and gets what happens next.',
      },
    ],
  },
};
