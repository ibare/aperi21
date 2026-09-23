/**
 * mean-free-path 개념 선언.
 *
 * 알갱이 넷 중 하나. 이쪽은 **사이 거리** 를 주장한다.
 *   gas-pressure        합 — 두드림이 쌓여 한 값이 된다
 *   pressure-from-collisions       두 곱 — 세기 × 횟수
 *   maxwell-boltzmann-distribution 퍼짐 — 분자마다 속력이 다르다
 *   mean-free-path                 **빽빽함 두 배면 사이 거리 절반** — 부딪히는 상대가 벽이 아니라 다른 분자다
 * 이쪽만 가로막음 · 꺾임 · 구간 · 평균 · 절반 자리 어휘를 갖는다.
 * 벽 · 두드림 · 압력 · 세기 · 횟수 · 온도 · 속력 분포는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const meanFreePathConcept: Aperi21ConceptSource = {
  id: 'mean-free-path',
  label: 'Distance Between One Collision and the Next',
  canonicalSim: 'aperi21:mean-free-path',

  surface: {
    definition:
      'How far a molecule gets before something gets in its way, averaged over many such runs, and halved whenever the crowding of the obstacles is doubled.',
    exemplarKeywords: [
      'mean free path',
      'how far does a molecule go before it hits another one',
      'packing them twice as tightly halves the run',
      'a zigzag path through a crowd',
      'in a vacuum a particle flies a long way without meeting anything',
      'the average run between collisions',
      'how much room is there between molecules',
      'why gases conduct heat the way they do',
      'crowding shortens the free flight',
      'obstacles in the way of a straight line',
    ],
  },

  briefing: {
    observable: [
      'Two square fields are shown side by side, one sparsely populated and one with twice as many molecules in the same space.',
      'In each field a single marked molecule travels in a straight line until it meets one of the others, and then turns; the rest stay where they are.',
      'A dot in the strike colour is left where each meeting happened, so the trail of turns builds up as the round goes on, and the right-hand field collects roughly twice as many of them.',
      'A molecule leaving one edge of a field re-enters at the opposite one, so the field has no walls to be struck — the only thing in the way is another molecule.',
      'Beneath the fields two rows are drawn, one for each field. Whenever a run ends, a tick is added to that row at the length that run turned out to be, and a bar grows to the average of all the runs finished so far.',
      'Both rows are drawn to one and the same stretched scale, stated in the heading of the rows, so the two bars can be compared directly.',
      'In the denser field the ticks bunch towards the near end of the row and the bar stays short; in the sparser field they reach much further out.',
      'When the travelling stops, a dotted upright line is drawn across both rows at half the length of the upper bar — and the lower bar ends there.',
      'Neither the average length nor the number of collisions nor the ratio is ever written down; where the bar ends and where the dotted line falls is the whole statement.',
      'The first run, from the start to the very first meeting, and any run still under way when the counting stops, are left out of the averaging.',
    ],

    screen: {
      affordances: [
        'One round travels, collects, marks the halfway line and fades, then runs the same path again; nothing has to be pressed.',
        'Both fields run at once and at the same speed, so the comparison is between two things happening together rather than between a before and an after.',
        'The lengths come out of following the marked molecule through the obstacles rather than from a figure written in, and the bar is the running average of the runs that have actually finished.',
        'The runs in the rows are drawn at a stretched scale, since at the scale of the fields the two bars would both be too short to be told apart; the stretch is the same for both rows and is stated in the picture.',
        'The obstacles are held still and only the marked molecule moves, which keeps the claim about how much is in the way rather than about how everything is moving.',
        'The strike colour is spent on one meaning only — a meeting has just happened.',
      ],
    },

    useWhen: [
      'The article has said that a gas is mostly empty space and the reader has no sense of how much. A run that crosses most of a field before anything gets in the way is what gives the emptiness a size.',
      'The reader treats “denser” as merely “more molecules” and the moment wanted is the one where the same journey in the crowded field is chopped into runs half as long.',
      'The article is about a vacuum, or about how far something travels before it is intercepted, and needs the tie between how crowded the way is and how far one gets.',
    ],

    avoidWhen: [
      'The subject is what molecules do to the container. These fields deliberately have no walls: a molecule leaving one side comes back in at the other.',
      'The article is about pressure, or about a push being made of many blows. Nothing here is struck by the crowd and nothing accumulates into a push.',
      'The point is that molecules differ in speed, or that a temperature changes how fast they go. Every molecule here moves at the same rate and nothing is heated.',
      'A value is wanted — how long the path is in nanometres, or how it follows from the molecular size and the number density. Only the doubling of the crowding and the stretch of the rows appear as figures.',
      'The article needs all the molecules moving, or the extra factor that comes from their moving. Only the marked one travels here; the rest are held still, and it is the ratio between the two fields that is the claim.',
      'The point is a molecule escaping, or reacting when it meets another. A meeting here only turns the traveller aside.',
    ],

    contrastWith: [
      {
        concept: 'gas-pressure',
        note: 'One is about molecules meeting the container and what that adds up to; the other is about molecules meeting one another and how far apart those meetings are.',
      },
      {
        concept: 'maxwell-boltzmann-distribution',
        note: 'Both single a molecule out of the crowd, one to ask how its speed compares with the rest, the other to ask how far it gets before the rest are in its way.',
      },
      {
        concept: 'pressure-from-collisions',
        note: 'Both count collisions, but one counts them at a wall to build up a push and the other measures the gaps between them to size the emptiness.',
      },
    ],
  },
};
