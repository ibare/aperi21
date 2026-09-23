/**
 * radius-of-curvature 개념 선언.
 *
 * 형제 넷의 갈림은 주어다 (`centripetal-acceleration.ts` 의 주석에 표를 두었다).
 * 이쪽만 **가속도가 주어가 아니다** — 주어는 경로의 굽음이고, 주장은 「그 굽음이
 * 한 자리에 맞는 원의 반지름이라는 길이로 재진다」이다.
 *
 * 화면에 점이 달리지만 그 속도도 가속도도 그려지지 않는다. 그래서 형제 셋의
 * 속도·Δv·몫 어휘를 하나도 쓰지 않고, 기하 어휘(접촉원·축폐선·굽음)만 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const radiusOfCurvatureConcept: Aperi21ConceptSource = {
  id: 'radius-of-curvature',
  label: 'Radius of Curvature',
  canonicalSim: 'aperi21:radius-of-curvature',

  surface: {
    definition:
      'How sharply a curve bends at a place, given as the radius of the circle matching it there: small where the bend is tight, large where the curve almost straightens.',
    exemplarKeywords: [
      'radius of curvature',
      'osculating circle',
      'the circle that best fits a curve at a point',
      'how tight is the bend',
      'curvature is one over the radius',
      'why bending is measured with a length',
      'tight corner versus gentle sweep',
      'kappa and rho',
      'a curve looks like a circle close up',
      'where the centre of curvature sits',
    ],
  },

  briefing: {
    observable: [
      'A closed looping path is drawn in dark, running slack in some places and tight in others.',
      'A dot travels round the path, covering the same length of path in each moment.',
      'A circle rides with the dot: it meets the path at the dot and is drawn darkest there, fading away on both sides as it parts from the path.',
      'For a stretch either side of the meeting point the circle and the path lie over one another and cannot be told apart; further round they separate plainly.',
      'A thin line joins the dot to the circle’s centre, and the length of that line is the radius. No figure is put on it.',
      'The centre is marked with a dot of its own, and it runs along a faint four-cornered star of a curve that is laid out in full before anything moves.',
      'The circle swells and shrinks as the dot goes round: at its smallest it sits whole inside the picture, at its largest it runs off the top or the bottom and only part of it is on screen.',
      'The joining line stays whole even when the circle itself is cut by the edge, so the growth is still there to be read as a length.',
      'A line under the picture says whether the path is straightening and the circle swelling or the path bending and the circle shrinking, and it changes over as the dot passes the slackest and tightest places.',
      'The dot can be caught and dragged, and it stays fastened to the path while it is dragged, so one stretch can be gone over back and forth.',
    ],

    screen: {
      affordances: [
        'The dot can be taken hold of within a short reach of it and dragged; it keeps to the path throughout, so the tight and slack stretches can be crossed and re-crossed by hand.',
        'Let go of, it carries on round on its own, and it was already running on arrival, so the account can be made with no handling at all.',
        'The circle is drawn darkest where it meets the path and fades with distance from that meeting, which puts the "here, not everywhere" into the drawing itself.',
        'The picture is not shrunk to hold the largest circle: the widest one runs off the edge while the smallest sits inside, which is what makes the change of size something to see rather than to infer.',
        'The road the centre travels is laid out whole from the first moment, so the way the centre swings is there to be read before the dot has been anywhere.',
      ],
    },

    useWhen: [
      'The reader is asked to accept that bending is measured by a length and finds the wording circular; a circle sized afresh at each place, riding the curve while the joining line grows and shrinks, is what makes the length the measure.',
      'The radius of curvature is about to be used in a formula and the geometry behind the symbol has to be settled first, including that it belongs to a place on the curve and not to the curve as a whole.',
    ],

    avoidWhen: [
      'The subject is a body’s motion along the curve — its speed, its acceleration or where any of that points. A dot travels here, but nothing of its velocity is drawn and its pace carries no part of the argument.',
      'Values are wanted, or a formula is to be checked against a case. No figure is written for radius, for curvature or for place on the curve.',
      'The curve in question has a straight stretch, an inflection or a cusp, where the matching circle grows without bound or changes sides. This path bends the one way everywhere and the circle stays finite throughout.',
      'The point is how a curve is drawn, fitted or parametrised. The path is simply there, and the only thing spoken of is its bend.',
    ],

    contrastWith: [
      {
        concept: 'centripetal-acceleration',
        note: 'One measures the bend of a path as a length, with no body’s velocity in the account; the other holds a body to a bend of one fixed size and asks where the change in its velocity aims.',
      },
      {
        concept: 'tangential-normal-acceleration',
        note: 'One is about the path alone and how tightly it turns from place to place; the other is about what an acceleration does to a velocity, sorted into changing the pace and changing the heading.',
      },
    ],
  },
};
