/**
 * time-dilation 개념 선언.
 *
 * 시간 넷 중 하나. 넷이 전부 「움직이는 시계가 느리다」 로 수렴하기 쉬워 **묻는 말**로 갈랐다.
 *   time-dilation          **얼마나** — 세어 본다. 다섯 째깍 대 세 째깍
 *   light-clock            **왜** — 빛이 더 긴 비스듬한 길을 간다는 작도
 *   muon-decay-evidence    **정말인가** — 재어 갈린 도달 수
 *   twin-paradox           **누가** — 다시 만났을 때 한쪽만 덜 늙는 까닭
 * 이쪽만 문자판 · 바늘 · 째깍 세기 · 5 대 3 어휘를 갖는다. 느려지는 까닭도 왕복 여행도 없다.
 *
 * 조각에 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const timeDilationConcept: Aperi21ConceptSource = {
  id: 'time-dilation',
  label: 'How Much Slower a Moving Clock Ticks',
  canonicalSim: 'aperi21:time-dilation',

  surface: {
    definition:
      'A clock carried past a row of clocks already set together is found to have counted fewer ticks than they did, by a fixed factor that grows with its speed.',
    exemplarKeywords: [
      'time dilation',
      'moving clocks run slow',
      'how much slower does a fast clock tick',
      'five ticks against three',
      'the factor gamma at four fifths of light speed',
      'a clock flying past a row of clocks set together',
      'does time really pass more slowly at high speed',
      'counting ticks in two frames',
      'a travelling clock falls behind the ones it passes',
      'the slowing is a ratio, not a delay',
    ],
  },

  briefing: {
    observable: [
      'A row of six identical clock faces stands along the bottom, all reading the same and all set together, with a single clock of exactly the same make running along a rail above them.',
      'Every clock has one hand, and one full turn of that hand is one tick; as the hand passes the top a ring spreads out from the rim, so a tick is something seen rather than counted in the head.',
      'The travelling clock is timed to cover exactly one gap in the row per tick of the standing clocks, so each time it draws level with one of them that clock has just finished a tick.',
      'Marks and whole numbers running nought to five are laid down beneath the standing clocks as their ticks accumulate.',
      'The travelling clock lays down its own marks on the rail above, each one where it happened to be when its hand passed the top, and those marks fall between the first and second standing clocks, between the third and fourth, and over the last one.',
      'Dotted lines drop from the upper marks to the row below, so where each of the travelling clock\'s ticks landed is joined to the standing clocks it fell between.',
      'The hands themselves turn at visibly different rates, the one on the rail lagging the ones in the row.',
      'When the run is over the record reads five against three, and a measured span from the start of the rail to the first upper mark is labelled with the ratio five thirds.',
      'The speed of the travelling clock is written as four fifths of light speed, and no elapsed times, distances or other figures appear.',
    ],

    screen: {
      affordances: [
        'The approach, the run past the row, the record and the fade go round by themselves; nothing has to be pressed.',
        'Comparison is only ever made between two clocks standing beside each other at that instant, never across the width of the screen, which is what keeps the reading honest.',
        'Both kinds of clock are drawn identically and differ only in where they are and whether they move, so the difference in the hands cannot be put down to different instruments.',
        'The numbers on the record are counted whole ticks rather than rounded readings, and the only other figures on screen are the stated speed and the stated ratio.',
      ],
    },

    useWhen: [
      'The article has stated that moving clocks run slow and the reader wants to know by how much and how one would ever tell. A record of five ticks against three, laid down as the clocks pass each other, turns a formula into a count.',
      'The reader suspects that the slowing is just light taking time to arrive from a distant clock. Each comparison here is made between two clocks side by side, which removes that escape.',
    ],

    avoidWhen: [
      'The question is why a moving clock runs slow. Nothing here shows a mechanism — the hands simply turn at different rates and the ticks are counted.',
      'The article follows a traveller who leaves and comes back. This clock passes through once and never returns, and no ageing or reunion is drawn.',
      'The subject is the measured length of a moving object, or the order in which two distant events happen. Nothing is measured for length and nothing is ordered.',
      'The article needs a real measurement backing the claim. These clocks are drawn for the argument; no data and no experiment is shown.',
      'The reader is being shown how the pitch of a passing siren changes. Nothing here involves waves, sound, or what reaches an observer late.',
    ],

    contrastWith: [
      {
        concept: 'light-clock',
        note: 'One counts how many ticks each of two clocks got through and puts a ratio on it; the other asks what makes a single tick take longer in the first place.',
      },
      {
        concept: 'muon-decay-evidence',
        note: 'One establishes the size of the effect with clocks built for the argument; the other asks whether anything in nature actually behaves that way and answers with a count of survivors.',
      },
      {
        concept: 'twin-paradox',
        note: 'One has a clock pass by once, so each observer can say the other is the slow one; the other has a traveller return, which breaks that symmetry and leaves a permanent difference in age.',
      },
      {
        concept: 'length-contraction',
        note: 'The two are the pair of consequences that come together — one is what motion does to the count of a clock, the other is what it does to the measured extent of a body.',
      },
    ],
  },
};
