/**
 * random-walk 개념 선언.
 *
 * 무작위 걸음 삼형제 중 하나. 주어를 **걸음 수와 처음 자리에서의 거리**로 잡았다 —
 * 까닭(`brownian-motion`)도 무리의 고르게 됨(`diffusion`)도 이쪽 몫이 아니다.
 * 이쪽만 「네 배 · 두 배 · 제곱근 · 동전」 어휘를 갖는다.
 *
 * `statistical-fluctuation` 과도 갈랐다 — 저쪽은 입자 수가 늘면 **흔들림이 줄고**,
 * 이쪽은 걸음 수가 늘면 **거리가 는다**. 둘 다 √N 이 뒤에 있으나 재는 양이 다르다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const randomWalkConcept: Aperi21ConceptSource = {
  id: 'random-walk',
  label: 'Random Walk and the Square-Root Distance',
  canonicalSim: 'aperi21:random-walk',

  surface: {
    definition:
      'Stepping left or right at pure chance, where four times the steps carry a walker only twice as far from the start, distance growing as the square root of the count.',
    exemplarKeywords: [
      'random walk',
      'the drunkard’s walk',
      'four times the steps but only twice as far',
      'why distance goes as the square root of the number of steps',
      'coin flip decides left or right',
      'how far after a thousand steps',
      'root mean square distance from the start',
      'a walker who makes no progress in particular',
      'spread of many walkers from where they began',
      'wandering gets you nowhere fast',
    ],
  },

  briefing: {
    observable: [
      'Thirty walkers stand on a dashed start line, one to a lane so that none is hidden behind another, and every step sends each of them one cell left or right by a toss.',
      'The column of points that began packed on the dashed line widens outward, and a bar below grows in step with how many steps have been taken.',
      'The walking stops at the first count. A bracket in the highlight colour opens across the lanes to ten cells either side of the start, the bar takes a mark at its end, and the count is written there.',
      'The wording at that first stop says plainly what the bracket measures — the root-mean-square distance from the start — so the bracket is not mistaken for how far the furthest walker got, and several points do lie outside it.',
      'Walking resumes; the first bracket is left behind as a dashed one, points spread past it, and the bar keeps taking a mark at every hundred steps.',
      'At the second stop, four hundred steps, a new bracket opens to twenty cells either side with the dashed ten-cell one sitting inside it, and the bar now stands four segments long.',
      'So the two things are on the screen together: a bar four times as long beside a bracket twice as wide.',
      'Every number written is one that was set beforehand — the two step counts, the two spreads, the number of walkers — and no running figure is shown while the walking is going on.',
    ],

    screen: {
      affordances: [
        'One round gathers the walkers, walks them, stops twice to measure, and then gathers them again; nothing has to be pressed.',
        'The second stretch of walking is quicker than the first, three hundred steps against one hundred, and this is harmless because the bar’s length follows the step count rather than the time spent.',
        'Each walker keeps a lane of its own; the vertical position says only which walker it is and never moves, so the picture stays a walk along one line.',
        'The brackets are the ones that were declared, with the crowd arranged to match them, rather than figures measured off thirty walkers and rounded for display.',
        'The earlier spread is kept in the same highlight colour as a dashed bracket, because it is the same quantity measured at an earlier moment.',
      ],
    },

    useWhen: [
      'The article has stated that distance grows as the square root of the number of steps, and the reader has taken it as algebra with nothing to picture. A bar of four segments standing beside a bracket only twice as wide is what makes the mismatch something seen.',
      'The point being made is that aimless stepping is a poor way of getting anywhere — that the extra steps mostly cancel — and the two stops give the comparison in one glance.',
    ],

    avoidWhen: [
      'The subject is why anything walks aimlessly at all, or what is doing the pushing. The steps here come from coin tosses handed to the walkers, and nothing is shown striking them.',
      'The article is about a substance evening out across a vessel, or about concentration. Nobody here is counted by region and nothing is being shared out.',
      'The wandering in the article is over a surface or through a volume. Everything here runs along one line, left or right.',
      'The point turns on how the spread grows with elapsed time, or on a diffusion coefficient in real units. The screen counts steps and cells, and the two stretches are deliberately walked at different speeds.',
      'The article is about how noisy a small sample is, or about the wobble in a measured average. What shrinks with larger numbers is not what is measured here; here something grows with more steps.',
    ],

    contrastWith: [
      {
        concept: 'brownian-motion',
        note: 'One takes aimless stepping as given and asks what it adds up to; the other asks where the aimlessness comes from, and answers with the battering that produces it.',
      },
      {
        concept: 'diffusion',
        note: 'One follows how far individual walkers have got from a common start; the other stops caring where any one of them is and asks only how the whole is shared out.',
      },
      {
        concept: 'statistical-fluctuation',
        note: 'Both trade on the same square root, in opposite directions: more steps make the distance grow, while more particles make the departure from the average shrink.',
      },
    ],
  },
};
