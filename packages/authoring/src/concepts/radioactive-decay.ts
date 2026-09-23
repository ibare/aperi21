/**
 * radioactive-decay 개념 선언.
 *
 * 붕괴 넷은 각자 다른 것을 주장한다.
 *   radioactive-decay   **얼마나 빨리 줄어드는가** — 반감기마다 남은 것의 절반이 다시 없어진다.
 *                       두 번이면 다 없어진다는 오해를 되돌리는 자리
 *   decay-types         나온 방사선이 **무엇을 뚫는가** — 종이 · 알루미늄 · 납
 *   radiometric-dating  남은 비율에서 **시간을 역산한다** — 곡선을 거꾸로 읽는 도구
 *   nuclear-fission     저절로가 아니라 **맞아서** 갈라지는 한 번의 사건
 * 이쪽만 무리 · 빈자리 · 계단 곡선 · 구간마다의 절반 목표선 어휘를 갖는다. 나오는 것이 무엇인지,
 * 몇 년이 지났는지는 여기서 말하지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const radioactiveDecayConcept: Aperi21ConceptSource = {
  id: 'radioactive-decay',
  label: 'Half-Life and the Thinning of a Population',
  canonicalSim: 'aperi21:radioactive-decay',

  surface: {
    definition:
      'What a half-life does to a crowd of unstable atoms: each one takes away half of whatever is still left, so the survivors are never used up after a fixed number of them.',
    exemplarKeywords: [
      'half-life',
      'exponential decay of a radioactive sample',
      'why is it not all gone after two half-lives',
      'the decay curve',
      'how many atoms are left',
      'decay is random for a single atom',
      'halving again and again',
      'an atom has no memory of how long it has waited',
      'activity falling off over time',
      'a sample thinning out',
      'the remaining half halves again',
    ],
  },

  briefing: {
    observable: [
      'Four hundred filled dots sit on a grid at the left, each one an atom.',
      'One at a time, and each at its own moment, a dot flashes in the highlight colour, a ring spreads out from it, and it is left as an empty outline. The number of filled dots only ever falls.',
      'On the right a curve panel carries a horizontal and a vertical reference line, with the starting count written at the top of one and nothing at the bottom.',
      'Five dotted verticals cross the panel, each named for which half-life it ends, so the horizontal direction is counted in half-lives rather than in seconds.',
      'A staircase runs down from the top left, dropping one step for each atom as it goes, and a moving point rides along it.',
      'At the start of each interval a fresh target line is drawn across at half of whatever that interval began with, and a vertical bracket is drawn beside it spanning from the starting count down to that target.',
      'The curve comes down to meet each target line before the next dotted vertical.',
      'Each bracket is about half as tall as the one before it, so five of them shrink visibly across the panel. Only the first carries words.',
      'The counts written out are the ones actually drawn, and they are near half rather than exactly half.',
      'After the fifth interval the picture holds still with the counts at each boundary in view, and the grid still has filled dots on it.',
      'The round then begins again with the grid full, and this time the atoms go in a different order and the counts come out a little different.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. Atoms go on their own, the curve follows them, and the round repeats.',
        'What falls is the atoms themselves, left as empty outlines on the grid, rather than a figure counting down.',
        'The target in each interval is set from that interval\'s own starting count, so "half again" is stated afresh five times over instead of once at the beginning.',
        'The brackets are kept as drawn rather than rescaled, which is what makes each one being half the last a thing to look at.',
        'No smooth ideal curve is laid over the staircase, so what is on the panel is only what happened on the grid.',
        'The highlight colour means one thing, an atom that has just gone, and the live atoms share their colour with the curve because both stand for what is left.',
        'The figures in the caption are read off the drawing, so they scatter around half and are not rounded to it.',
        'Which atoms go when is drawn fresh each round, so the counts differ from one round to the next while the halving does not.',
        'The horizontal direction is marked only at the half-life boundaries; no unit of time is put on it.',
        'It opens with atoms already going.',
      ],
    },

    useWhen: [
      'The reader has made the slip that two half-lives finishes the job. The second interval visibly stops at a quarter rather than at nothing, and three more intervals follow it.',
      'The point is that decay belongs to the crowd rather than to a schedule for any one atom. No atom on the grid is marked as being next, and the order changes every round.',
      'The article needs the scatter to be admitted. The counts shown are the ones that actually occurred, they miss exact halves, and they come out differently each round.',
      'The reader should see a decay curve built rather than quoted: the staircase is drawn by the atoms going, one step per atom.',
    ],

    avoidWhen: [
      'The subject is working an age out of how much is left. Nothing here is read backwards and no span of years is named.',
      'The article is about what comes out of a decay, how the three kinds differ, or what the nucleus turns into.',
      'The subject is a nucleus broken apart by something striking it, or one event followed through in detail.',
      'The figures wanted are a decay constant, a mean lifetime, or an activity in counts per second.',
      'The article is about something else falling off in the same fashion — charge draining away or a swing dying down — rather than about a countable population of atoms.',
      'The subject is what makes a particular nucleus unstable, or which nuclei are.',
    ],

    contrastWith: [
      {
        concept: 'radiometric-dating',
        note: 'One watches the halving happen and asks how much is left after so many half-lives; the other takes how much is left as the one measured thing and works back to how long it has been.',
      },
      {
        concept: 'decay-types',
        note: 'One counts how fast a population goes without ever saying what leaves; the other says nothing about rate and everything about what leaves and how far it gets.',
      },
      {
        concept: 'nuclear-fission',
        note: 'One is about nuclei that come apart of their own accord, each at its own moment; the other about a nucleus made to come apart by something striking it.',
      },
      {
        concept: 'rc-circuit',
        note: 'Both fall by the same fraction in equal steps, but one is a continuous quantity draining away smoothly while the other is a countable crowd whose individual departures are visible and whose totals scatter.',
      },
      {
        concept: 'statistical-fluctuation',
        note: 'One is about how the scatter in a count behaves as the count changes; the other about a count halving again and again, with the scatter showing up as a side effect.',
      },
    ],
  },
};
