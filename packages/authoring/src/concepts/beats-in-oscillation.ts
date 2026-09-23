/**
 * beats-in-oscillation 개념 선언.
 *
 * 「두 진자가 주고받는」 형제 셋 중 **두 진동수를 더한 결과**를 맡는다.
 *   beats-in-oscillation 가까운 두 진동수를 더하면 합이 부풀었다 잦아든다.
 *                        **차이가 작을수록 느리다** — 차이와 부풂의 빠르기가 짝이다
 *   coupled-oscillators  흔들림이 **옆으로 옮겨 갔다 되돌아온다** (몫의 이동)
 *   normal-modes         뒤섞인 흔들림은 **정해진 모양들의 합**이다 (분해)
 *
 * 이쪽만 「더한다 · 부푼다 · 잦아든다 · 차이 · 발맞춤과 엇갈림」 어휘를 갖는다.
 * 「넘어간다 · 몫」(coupled-oscillators), 「모양 · 나눈다」(normal-modes)는 쓰지 않는다.
 * 소리(음 · 울림)는 `waves` 분과의 몫이라 구어에서도 피했다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const beatsInOscillationConcept: Aperi21ConceptSource = {
  id: 'beats-in-oscillation',
  label: 'Beats in Oscillation',
  canonicalSim: 'aperi21:beats-in-oscillation',

  surface: {
    definition:
      'What two oscillations of slightly unequal rate come to when added: a combined motion that swells out and dies back over and over, and the closer the two rates are, the slower that swelling goes.',
    exemplarKeywords: [
      'beats',
      'beat frequency',
      'two frequencies very close together',
      'the combined amplitude swells and fades',
      'envelope of a sum of two oscillations',
      'why the two drift in and out of step',
      'the closer the frequencies the slower the beat',
      'adding two nearly equal oscillations',
      'in step and then exactly opposed',
      'slow throb on top of a fast oscillation',
      'difference of two frequencies',
    ],
  },

  briefing: {
    observable: [
      'Two rigs are stacked one above the other. Each is a pair of masses hanging on springs from a ceiling, with a light rod laid across the two of them, and a point marked at the middle of that rod.',
      'In each rig the left mass bobs at one rate and the right mass at a slightly different one; the midpoint of the rod therefore follows the average of the two.',
      'When the two masses of a rig happen to rise and fall together the rod stays level and the midpoint travels the full way up and down. When they come to be exactly opposed the rod see-saws about its middle and the midpoint stands still.',
      'The midpoint leaves ink on a chart that runs out to the left, the right-hand end of it being the present, so the recent history of the combined motion stays on view behind the rig.',
      'In that record the fast up-and-down is gathered into swellings and pinches: the wave grows wide, narrows to almost nothing, and widens again. A dotted outline runs along the top and bottom of the ink following that width.',
      'The left mass of all four is set to one and the same rate. What differs is the right mass — the upper rig is further from its partner than the lower rig is, and the two rigs are labelled with that gap.',
      'Because the lower rig’s two rates are the closer pair, its record carries one swelling in the same length of chart in which the upper record carries two.',
      'The pinches in the two records fall at different times, so at any given moment one rig can be at its widest while the other is at its narrowest.',
      'A line of text below says which rig is currently falling out of step and which is coming back.',
    ],

    screen: {
      affordances: [
        'Everything runs by itself and comes round exactly, so the picture on returning to a moment is the picture that was there before.',
        'The two gaps are put side by side on one shared time axis from the start, rather than being reached by changing one of them, so the comparison sits in one frame instead of in the reader’s memory.',
        'The accent colour is kept for one meaning only — the combined motion — and marks the midpoint of each rod and the ink that midpoint leaves.',
        'All four masses are drawn in the same ink and the two rigs are drawn alike, so the only difference on show is the gap that is named in the labels.',
        'The dotted outline is fainter and thinner than the ink it follows, so it reads as a guide to the width rather than as a second record.',
        'The labels carry symbols for the gap and its half, and no rates, periods or times are written as figures anywhere.',
      ],
    },

    useWhen: [
      'The article has given the reader the rule that two nearby rates produce a throbbing at their difference, and what is wanted is for the difference and the slowness to be seen as the same statement. Two records on one time axis, one carrying twice the swellings of the other, is that statement.',
      'The point being made is that the swelling is nothing added from outside but simply the two oscillations falling into and out of step, and a case is wanted where the falling out of step is a thing to look at rather than to infer.',
    ],

    avoidWhen: [
      'The article is about a motion crossing between two bodies, with each in turn going quiet. The masses here are not linked to each other and none of them ever stops.',
      'The subject is breaking a motion into the fixed shapes a system can vibrate in. Only the combined motion is recorded here; the two contributions are never drawn as separate traces.',
      'What is needed is the beat rate as a value, or the two rates themselves. The labels carry symbols and the picture carries no figures.',
      'The article is about sound — two notes, tuning by ear, the throb a listener hears. This is a mechanical rig and nothing is heard.',
      'The reader is to be shown what happens as the gap is closed towards nothing. Two fixed gaps are compared and neither changes.',
    ],

    contrastWith: [
      {
        concept: 'coupled-oscillators',
        note: 'Both show a slow swelling built out of two close rhythms, but one adds two independent oscillations into a single record, while the other has two bodies joined so that a share passes from one to the other.',
      },
      {
        concept: 'normal-modes',
        note: 'One adds two rhythms together and reads the rate of the result; the other takes a motion apart into the shapes a system can hold, each with a rhythm of its own.',
      },
      {
        concept: 'vector-addition',
        note: 'Both are about what two things come to when combined, but one combines oscillations in time so that the sum is large at some moments and nearly nothing at others, while the other combines arrows in space.',
      },
    ],
  },
};
