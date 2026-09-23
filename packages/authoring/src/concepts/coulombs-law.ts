/**
 * coulombs-law 개념 선언.
 *
 * 힘 셋 가운데 이쪽은 **거리 하나**다. **바꾸는 것을 갈랐다.**
 *   coulombs-law              두 전하의 **거리**를 벌린다 — 힘이 배수의 제곱만큼 준다
 *   superposition-of-forces   **원천의 수**를 늘린다 — 각자 몫이 따로 더해진다
 *   charge-in-uniform-field   장 속의 전하가 **어떤 길**을 가는가
 * 이미 선언된 `inverse-square-law`(왜 하필 제곱인가 — 구면의 넓이) · `newtons-law-of-gravitation`
 * (두 질량 사이의 한 쌍)과도 겹치지 않아야 하므로, 이쪽은 **재는 쪽**에 선다 — 점선 기준을
 * 칸으로 나누어 1/4 · 1/9 를 읽는다. 「왜 제곱인가」 를 대답하지 않고 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const coulombsLawConcept: Aperi21ConceptSource = {
  id: 'coulombs-law',
  label: 'Coulomb Force Against Separation',
  canonicalSim: 'aperi21:coulombs-law',

  surface: {
    definition:
      'How much weaker the push between two charges becomes as they are drawn apart: taken to twice the separation it keeps a quarter, and to three times a ninth, of the length it had.',
    exemplarKeywords: [
      "Coulomb's law",
      'force between two point charges',
      'doubling the separation quarters the electric force',
      'how quickly does the electric force fall off',
      'a quarter at twice as far and a ninth at three times',
      'electrostatic repulsion at different separations',
      'how far apart before two charges stop pushing noticeably',
      'k q one q two over r squared',
      'comparing the force at r, at two r and at three r',
      'electric force and distance',
    ],
  },

  briefing: {
    observable: [
      'Three rows are set out, each holding a pair of identical charges marked plus, and in every row the pair starts at the same separation.',
      'Each row carries one arrow in the accent colour, drawn from the second charge, and at the start the three arrows are exactly the same length.',
      'The second charge of the middle row then slides outward to twice the separation, and while it moves its arrow shrinks smoothly rather than jumping to a new length.',
      'As the slide begins, the arrow the row had at the start is left behind in that row as a dotted length, and the dotted length is divided into four equal cells.',
      'The shrinking arrow comes to rest reaching exactly the first of those four cells, so the fraction is read as cells rather than as a number.',
      'Marks naming the separation and the fraction appear only once a row has stopped moving, and are absent while anything is sliding.',
      'The bottom row then goes out to three times the separation against a dotted length divided into nine cells, and its arrow finishes in the first of the nine.',
      'The top row never moves and keeps its full-length arrow throughout, so the starting length is still on screen at the end.',
      'At the close the three rows stand together at one, two and three times the separation with arrows of one, a quarter and a ninth of the same length.',
      'All six charges are drawn alike and marked plus, and every arrow is drawn at the same scale, so a length ratio is a force ratio.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the two rows move out in turn and the run repeats.',
        'The reference each row is measured against is its own starting arrow, kept in the same row, rather than the arrow of a neighbouring row, whose different starting place would make the comparison harder to see.',
        'The accent colour is kept for the force as it stands now, while the dotted reference and its cells are drawn back in a quieter tone.',
        'The naming marks wait for stillness, so nothing on screen ever claims a separation or a fraction that the picture is in the middle of leaving.',
        'No arrow is capped in length, since the pairs only ever move further apart from the starting separation.',
      ],
    },

    useWhen: [
      'The article has written the inverse square in symbols and the reader has taken it as notation rather than as a size. A dotted length cut into four, with the shrunken arrow ending in the first cell, turns the fraction into something counted.',
      'The prose needs the two cases together — a quarter and a ninth — so that the reader sees the pattern as the square of the factor rather than as one remembered result.',
    ],

    avoidWhen: [
      'The article turns on how the force depends on how much charge each body carries. Every charge here is the same size and never changes; only the separation is varied.',
      'The subject is attraction between unlike charges, or which way the force points. All six charges are alike and every arrow points the same way out.',
      'More than two charges act at once and the question is how their pulls combine.',
      'The article asks why the exponent is two — what it is about space that makes it a square. Here the shrinking is measured, not accounted for.',
      'A value in newtons, a separation in metres or an amount in coulombs is needed. Nothing carries units.',
      'The point is that the two charges push on each other equally. Only the second charge of each pair carries an arrow.',
    ],

    contrastWith: [
      {
        concept: 'inverse-square-law',
        note: 'One measures how much is left of a force at two and three times the separation; the other asks why the exponent is two at all, in terms that belong to anything spreading from a point.',
      },
      {
        concept: 'newtons-law-of-gravitation',
        note: 'Both are a pair of bodies and the same falling-off, but one belongs to charge, where the pair can also push apart and the sizes are set by how much charge each carries; the other belongs to mass, where the pull is always inward.',
      },
      {
        concept: 'superposition-of-forces',
        note: 'One keeps exactly two charges and varies the separation; the other keeps the separations fixed and asks what several charges acting at once come to.',
      },
      {
        concept: 'electric-field',
        note: 'One is about a particular pair, so both charges matter to the answer; the other divides the second charge out so that what is left belongs to the place.',
      },
    ],
  },
};
