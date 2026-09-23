/**
 * moment-of-inertia 개념 선언.
 *
 * 질량 분포를 다루는 형제 셋 가운데 하나다. **무엇을 옮기는가**로 갈랐다.
 *   moment-of-inertia      같은 물체의 **질량을** 옮긴다 (축은 그대로) — 같은 돌림힘에 뒤처진다
 *   parallel-axis-theorem  같은 물체의 **축을** 옮긴다 (분포는 그대로) — Md² 가 얹힌다
 *   rolling-race           **여러 모양을** 나란히 놓는다 — 도착 순서가 갈린다
 * 이쪽만 알갱이 · 자리 · Σmr² · 테 무거운 바퀴 어휘를 갖는다. 「축을 옮긴다」 · 「모양」 ·
 * 「도착 순서」 는 쓰지 않는다. `conservation-of-angular-momentum` 과는 **언제** 옮기는가로
 * 갈린다 — 이쪽은 멈춘 뒤에만, 저쪽은 도는 중에.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const momentOfInertiaConcept: Aperi21ConceptSource = {
  id: 'moment-of-inertia',
  label: 'Moment of Inertia',
  canonicalSim: 'aperi21:moment-of-inertia',

  surface: {
    definition:
      'How hard a body is to spin up, decided not by how much mass it carries but by how far out from the axis that mass is placed.',
    exemplarKeywords: [
      'moment of inertia',
      'rotational inertia',
      'sum of m r squared',
      'same mass but harder to get spinning',
      'weights near the hub versus out at the rim',
      'why a heavy-rimmed wheel is sluggish',
      'flywheel',
      'spreading the mass outward',
      'does mass alone decide how hard it is to spin',
      'I in the rotational equations',
    ],
  },

  briefing: {
    observable: [
      'Two wheels stand side by side, each carrying twelve mass beads of the same size; the left wheel keeps its beads close in at 0.30 of the rim radius and the right wheel starts with its own out at the rim.',
      'An identical curved torque arrow is hung on each hub and both wheels are let go from rest at the same moment.',
      'The spokes and the beads actually turn: the left wheel builds up to about three full turns while the right one has not managed a third of a turn.',
      'Each bead drags a short fading arc behind it, so how far a bead itself has travelled is on the screen alongside how far the wheel has turned.',
      'Below the wheels two curves of turned angle against time grow together and spread further apart as the run goes on, with marks at one, two and three turns to read against.',
      'Between runs both wheels are brought to a stop and the right wheel’s beads are moved inward — first to 0.60, then to 0.30 — and both are released again from rest.',
      'At 0.30 the two curves lie on top of one another and the wheels turn together, so what had been making the difference was the placing and not the amount of mass.',
      'A line under each wheel names twelve beads and the distance they are sitting at, and it changes as the beads are moved.',
      'Every move of the beads happens while the wheels are standing still, and each run then starts from rest.',
    ],

    screen: {
      affordances: [
        'A slider at the lower right sets how far out the right wheel’s beads sit, anywhere from 0.30 to the rim in steps of 0.05.',
        'Moving it stops both wheels where they are, carries over the angle they have already turned, and begins a fresh run from rest at the new distance, repeating turn and stop from then on.',
        'Left alone, the piece works through its three set distances by itself and the slider follows the distance currently in use.',
        'The steps are small enough that the reader can feel the lag growing faster than the distance does, which the three set distances by themselves would not show.',
        'The accent colour is kept for the wheel whose beads move — its beads, its trails, its curve and the slider — while the reference wheel stays in plain ink.',
      ],
    },

    useWhen: [
      'The reader has met I = Σmr² and is stuck at “but the mass is the same”. Two wheels carrying identical beads, one of them badly behind, puts the difference exactly where the formula puts it.',
      'The article claims the dependence goes as the square of the distance and the reader should be able to feel it — a small move near the rim costs far more than the same move near the hub.',
    ],

    avoidWhen: [
      'The body is left alone and its axis moved instead, with the article about what that move adds. Both wheels here turn about their own hub throughout.',
      'Several ready-made shapes are being compared, or which of them wins a descent. One kind of wheel is used here and the beads are moved about on it.',
      'A number for I, or the units it carries, is what is wanted. No value is written; the run is read off the lag and off two curves.',
      'The article is about mass being gathered inward while a body is already turning, with the speed answering back. The beads here are only ever moved after the wheels have stopped.',
      'A force applied at different distances from a pivot is the point. One and the same torque arrow is hung on both wheels and never changes.',
    ],

    contrastWith: [
      {
        concept: 'torque',
        note: 'One is about what the body brings to a turning; the other about what the force brings to it.',
      },
      {
        concept: 'parallel-axis-theorem',
        note: 'One moves the mass and keeps the axis where it is; the other keeps the mass exactly where it is and moves the axis instead.',
      },
      {
        concept: 'rolling-race',
        note: 'One takes a single wheel and rearranges it, reading the difference off how far behind it falls; the other sets whole shapes against each other and reads it off who arrives first.',
      },
      {
        concept: 'conservation-of-angular-momentum',
        note: 'Both rearrange a body’s mass, but one does it at rest so that each arrangement can be started fairly from nothing, and the other does it mid-turn, which is when the rate of turning answers back.',
      },
      {
        concept: 'angular-acceleration',
        note: 'One says what decides how quickly a rate of turning grows; the other is that growth itself, taken as a quantity.',
      },
    ],
  },
};
