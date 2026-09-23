/**
 * center-of-gravity 개념 선언.
 *
 * 돌림힘의 균형 형제 셋 가운데 **기하로 판정하는 쪽**이다.
 *   torque              팔 길이가 돌림의 크기를 정한다
 *   static-equilibrium  힘의 합과 돌림힘이 둘 다 0 이어야 멈춰 있다
 *   center-of-gravity   수직선이 받침 **안인가 밖인가** — 되돌아오거나 넘어진다
 * 화면에 힘 화살표(mg)도 돌림힘 팔도 없다. 그래서 주장이 힘이 아니라 **선과 띠의
 * 안팎**이고, 이쪽만 받침면 · 수직선 · 넘어진다 · 기울인다 어휘를 갖는다. 짝힘 · 작용선 ·
 * 두 조건은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const centerOfGravityConcept: Aperi21ConceptSource = {
  id: 'center-of-gravity',
  label: 'Centre of Gravity',
  canonicalSim: 'aperi21:center-of-gravity',

  surface: {
    definition:
      'The single point a body’s weight acts through, whose vertical dropped to the floor decides the matter: inside the base the body rights itself, outside it topples.',
    exemplarKeywords: [
      'centre of gravity',
      'center of mass and tipping',
      'when does an object topple',
      'base of support',
      'the leaning tower',
      'why a wide low object is hard to knock over',
      'the plumb line falls outside the base',
      'tipping point of a box on its edge',
      'stability of a leaning body',
      'balancing on a narrow base',
    ],
  },

  briefing: {
    observable: [
      'The same box is tipped about the same bottom edge twice over, seen from the side.',
      'A dark dotted vertical hangs from a marked point inside the box all the way down to the floor, and the box’s underside together with the strip of floor directly below it is picked out in the accent colour.',
      'On the first tip a hand — drawn as a plain arrow — leans the box part way and holds it there, and the dotted vertical lands well inside the strip.',
      'When the arrow goes, the box swings back, gathering pace, and stands up again.',
      'On the second tip the arrow leans the box further, until the vertical lands exactly on the far end of the strip, on the very edge the box is turning about, and there it is held for a moment.',
      'The arrow goes again, and this time the vertical passes outside the strip; the box carries on over, gathering pace, and comes to rest on its side.',
      'Once it is down, the strip moves to the face it is now lying on, and the vertical falls inside that one.',
      'The same box, the same edge and the same hand appear in both tips, so what separates the two outcomes is only where the vertical landed.',
      'The box is drawn in a quiet grey and the base in the accent colour, and neither changes colour when the outcome changes — what changes is where the line falls.',
    ],

    screen: {
      affordances: [
        'Lean, hold, release, lean further, hold at the edge, release again — the stages run in order by themselves and then come round.',
        'The base is shown twice over: as a thick mark along the box’s underside and as a thicker band on the floor beneath it, so that when the underside lifts there is still something on the floor to compare the vertical against.',
        'The moment at which the vertical sits exactly on the edge is held for about a second, which puts the boundary on the screen instead of leaving it between two runs.',
        'The arrow is there only while the box is being leaned and held, and its going is what stands for letting go, so neither outcome is read as a push.',
        'The proportions of the box are set in the declaration, so the angle at which it goes over follows from the box rather than being drawn in.',
      ],
    },

    useWhen: [
      'The article has said that a body topples when its centre of gravity passes beyond its base, and the reader wants to see the test applied. The same box returning once and going over once, with nothing differing but where the line fell, is that test.',
      'The boundary case itself is the point — the instant at which the vertical sits on the edge and the body is on the brink — and a still moment is wanted to hold it.',
    ],

    avoidWhen: [
      'The question is where the centre of gravity of a given shape actually is, or how to find it by hanging or by calculation. The point is marked from the start here and never has to be located.',
      'Why a wide low body is harder to overturn than a tall narrow one is the claim. One box of one shape is tipped here.',
      'The turning effect of the weight, the length of its arm, or the torque about the edge is what has to be shown. No force arrow is drawn on the box at all.',
      'The article is about balancing loads against one another on either side of a pivot. Only one body and its own weight appear here.',
      'Angles are wanted — how far it can lean, or the critical angle in degrees. Nothing on the screen is numbered.',
    ],

    contrastWith: [
      {
        concept: 'static-equilibrium',
        note: 'One asks, of a body already tilted, which way it will go; the other asks what a body needs in order not to move at all.',
      },
      {
        concept: 'torque',
        note: 'One settles the outcome geometrically, by where a line falls; the other is about how much turning a force at a given distance produces.',
      },
      {
        concept: 'balance-scale',
        note: 'One asks whether a single body stands or goes over, judging it by a line and a base; the other asks what two loads on either side of a pivot must satisfy to hold each other level.',
      },
    ],
  },
};
