/**
 * damping-regimes 개념 선언.
 *
 * 형제는 `damped-oscillation`. **한 감쇠의 법칙이냐, 감쇠 세기의 견줌이냐**로 갈랐다.
 *   damped-oscillation  감쇠 하나 — 마루가 같은 비로 줄고 간격은 그대로
 *   damping-regimes     감쇠 셋 — 넘실거림 · 넘치지 않음 · 기어 옴, 가장 먼저 멎는 것은 가운데
 * 이쪽만 부족 · 임계 · 과도 · 넘침 · 멎는 시각 · 「더 세게 해도 더 빠르지 않다」 어휘를
 * 갖는다. 같은 비율 · 포락선이라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const dampingRegimesConcept: Aperi21ConceptSource = {
  id: 'damping-regimes',
  label: 'Regimes of Damping',
  canonicalSim: 'aperi21:damping-regimes',

  surface: {
    definition:
      'The three outcomes of raising the resistance on an oscillator — overshooting and swinging back, returning without overshoot, and creeping slowly in — with the quickest settling at the middle case.',
    exemplarKeywords: [
      'underdamped critically damped overdamped',
      'critical damping',
      'damping ratio zeta',
      'why does more damping take longer to settle',
      'settling time and overshoot',
      'tuning a shock absorber',
      'a door closer that slams or crawls',
      'damping a needle so it does not swing past the reading',
      'the three regimes of damping',
      'is stronger damping always better',
    ],
  },

  briefing: {
    observable: [
      'Three identical springs and blocks hang in three rows, one above another, each with its own ceiling and its own horizontal rest line, and a label on each row gives the damping of that row as a number.',
      'The damping rises from the top row to the bottom one: the label on the top row is well under one, the middle row exactly one, the bottom row several times one.',
      'All three blocks are held pulled down by the same amount, then released together.',
      'Each block acts as the tip of a curve that grows out to its right at a steady rate, so the height of the curve at its right-hand end is the height of that block now.',
      'The top curve crosses its rest line and comes back over it again and again, swinging above and below.',
      'The middle and bottom curves never cross their rest lines at all.',
      'When a curve has come close enough to its rest line and stops leaving again, a short upright mark is set on it with a word beside it.',
      'The middle row gets its mark first, early in the run, and a faint vertical dotted line is drawn through all three rows at that instant.',
      'Well past that dotted line the top curve is still rippling above and below, and the bottom curve is still approaching its rest line from beneath without having reached it.',
      'The bottom row gets its mark last of all, far to the right — the row with the most damping is not the row that finished first.',
      'The three curves and their three marks are held together at the end, so the order of the marks along the same time axis can be read in one look.',
    ],

    screen: {
      affordances: [
        'The holding, the release, the growing of the three curves and the setting of the marks run on their own and repeat, so all three outcomes come round without anything being asked for.',
        'The rows are stacked in order of increasing damping, so more damping is a direction down the picture rather than a fact to be looked up in the labels.',
        'Each curve is drawn beside its own block and to the same vertical scale, so what is plotted is visibly the height that block has been at rather than an abstract graph.',
        'The three rows are drawn in one colour and told apart by their labels alone, so they read as one setup with one property changed.',
        'The vertical dotted line at the moment the middle row settles cuts across all three rows, so the comparison is a single moment rather than a memory of two.',
        'One colour is kept for the settling marks and used for nothing else, so where each row finished is the thing the eye finds.',
        'The page opens with the three already released and moving.',
        'Apart from the three damping labels there are no numbers — no time axis, no settling times, no scale.',
      ],
    },

    useWhen: [
      'The article has claimed that critical damping is the fastest way to bring something to rest and the reader takes it for granted that more resistance means sooner. A row with several times the damping still crawling toward its line long after the critical row has finished is what unseats that.',
      'The writing needs the two failure modes shown against each other in one place — the one that goes past and comes back, and the one that never goes past but takes far too long.',
    ],

    avoidWhen: [
      'The subject is the law the successive peaks obey within a single damped oscillation. Only the top row has peaks here and none of them is measured against another.',
      'The oscillator is being driven from outside, or the point is the height or sharpness of a response near a resonant frequency. Nothing pushes these three after the release.',
      'The article is about an undamped oscillation and its unchanging cycles. Every row here comes to rest.',
      'What is wanted is the force of a spring or the energy stored in it. Neither is drawn.',
      'The reader needs settling times, damping ratios in context, or anything read off a time axis. There is no time scale on the screen.',
    ],

    contrastWith: [
      {
        concept: 'damped-oscillation',
        note: 'One compares what different amounts of resistance do, including amounts that stop the swinging altogether; the other stays with one amount and states how its successive peaks are related.',
      },
      {
        concept: 'simple-harmonic-motion',
        note: 'One is about the several ways an oscillation can be brought to rest; the other is about the form it takes when nothing is bringing it to rest at all.',
      },
      {
        concept: 'mass-spring-system',
        note: 'One asks how soon the motion ends and which resistance ends it soonest; the other asks how long each cycle lasts while it continues.',
      },
      {
        concept: 'drag-force',
        note: 'One is about how much resistance to apply and what each amount produces; the other is about what a resistance is and how it grows with speed.',
      },
    ],
  },
};
