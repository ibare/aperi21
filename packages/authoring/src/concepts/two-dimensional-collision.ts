/**
 * two-dimensional-collision 개념 선언.
 *
 * 충돌 다섯 중 하나. 이 조각만 **합이 둘**이라는 것을 주장한다 — 가로 합과 세로 합이
 * 서로 주고받지 않고 각자 제자리에 머문다.
 *   two-dimensional-collision  성분마다 **따로** 성립하는 보존 — 빗맞음
 *   conservation-of-momentum   한 줄 위의 **하나의** 합, 그리고 계 밖의 밀기
 *   elastic-collision          정면 · 같은 질량에서 속도가 옮겨 감
 * 이쪽만 빗맞음 · 성분 분해 · 「화살표 길이를 더하면 안 된다」 어휘를 갖는다. 계의 안팎 ·
 * 에너지는 말하지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const twoDimensionalCollisionConcept: Aperi21ConceptSource = {
  id: 'two-dimensional-collision',
  label: 'Momentum Components in a Glancing Collision',
  canonicalSim: 'aperi21:two-dimensional-collision',

  surface: {
    definition:
      'A glancing hit that sends two bodies off at angles, where the sideways total and the up-and-down total each keep their own starting value without either lending to the other.',
    exemplarKeywords: [
      'two-dimensional collision',
      'glancing collision',
      'oblique collision',
      'hitting a ball off centre',
      'momentum conserved in x and y separately',
      'resolving momentum into components',
      'collision in a plane',
      'the arrows after the hit do not add up in length',
      'components are conserved independently',
      'billiard balls going off at angles',
    ],
  },

  briefing: {
    observable: [
      'A table fills the left of the picture and a ledger the right: the sideways shares lie along a horizontal row, the up-and-down shares stand in an upright column, each kept in the direction it actually has.',
      'In each of the two, the shares of the two bodies are laid so that one begins where the other ends, which makes the far end of the pair the total.',
      'An accent dashed line stands where each total began and does not move.',
      'While only one body is running, the horizontal row has a single arrow reaching the dashed line and the upright column is empty, with its dashed line at nothing.',
      'The contact is drawn out over more than two seconds. In the horizontal row the single arrow divides into two pieces and the join between them travels leftward — yet the far end stays on the dashed line.',
      'In the upright column the struck body’s share grows upward and the other comes down from its head by exactly as much, ending at nothing, so the column is built and unbuilt while its total stays at zero.',
      'The two bodies then separate, one going up and to the right and the other down and to the right, leaving dotted tracks behind them, and the ledger stands divided with both ends still on their dashed lines.',
      'Each body carries an arrow at its edge, and the arrows in the ledger carry the same letters as the bodies so the shares are not told apart by colour alone.',
      'Nothing on the screen carries a number.',
    ],

    screen: {
      affordances: [
        'One row of chips picks how square the hit is — twenty, thirty-five or fifty-five degrees — and picking one sends the body in again from the start.',
        'Changing the angle changes how the shares divide while both far ends stay exactly where they were, so the reader can settle for themselves that it is not a coincidence of one arrangement.',
        'The up-and-down shares really stand upright rather than being laid out sideways with signs, so up on the table is up in the ledger.',
        'The arrows on the table and the shares in the ledger are drawn to the same scale, which makes the ledger a shadow of the table rather than a separate diagram.',
        'The accent colour is kept for the two starting totals alone.',
      ],
    },

    useWhen: [
      'The reader has met momentum conservation along a line and is now trying to add the lengths of the two after-arrows to check it. Two ledgers each holding their own end is what replaces that one sum with two.',
      'The article claims the up-and-down total is nothing before and nothing after, and a case is wanted where the two shares are plainly large in the middle while the total never leaves zero.',
      'The article needs the reader to try more than one angle before believing that the shares may move freely as long as the ends do not.',
    ],

    avoidWhen: [
      'The point is what happened to the kinetic energy, or whether the collision was elastic. Nothing about energy is drawn.',
      'The bodies in the article stay together after the hit.',
      'The article needs the reason the struck body leaves along the line joining the two centres. That line is not drawn, and the outgoing direction is given rather than explained.',
      'The subject is when momentum is not conserved, or what lies outside the system. Nothing outside ever pushes here.',
      'The point is that two equal balls in an elastic hit leave at right angles. That is on the screen but never claimed, and the picture would be borrowed.',
      'Angles or values are to be read off or calculated. Only the chip labels carry numbers.',
    ],

    contrastWith: [
      {
        concept: 'conservation-of-momentum',
        note: 'One keeps a single total on one line and asks what could move it; the other asks what a total means once the motion leaves that line, and answers with two that hold separately.',
      },
      {
        concept: 'vector-decomposition',
        note: 'One splits an arrow into two directions as a way of reading a picture; the other makes the split carry a claim — that each direction keeps its own account through a collision.',
      },
      {
        concept: 'elastic-collision',
        note: 'One is about where the momentum went once the hit is off-centre; the other is about a dead-on hit between equal bodies, where a whole speed changes owner.',
      },
    ],
  },
};
