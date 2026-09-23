/**
 * double-slit-with-electrons 개념 선언.
 *
 * 물질파 셋 가운데 **쌓이는 쪽**이다.
 *   de-broglie-wavelength      물결 간격이 속력에 달렸다
 *   electron-diffraction       고리가 있고, 빠르게 하면 안쪽으로 움직인다
 *   double-slit-with-electrons 알갱이가 **하나씩** 도착해 **쌓여야** 무늬가 된다
 * 이미 선언된 `youngs-double-slit` 은 「빛을 보탰는데 꺼진다」 로, 한꺼번에 오는 빛의 그림이다.
 * 이쪽만 한 번에 하나 · 도착 개수 · 제멋대로인 자리 · 쌓임 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const doubleSlitWithElectronsConcept: Aperi21ConceptSource = {
  id: 'double-slit-with-electrons',
  label: 'Electrons Arriving One at a Time',
  canonicalSim: 'aperi21:double-slit-with-electrons',

  surface: {
    definition:
      'What happens when particles are sent through two openings one at a time: each lands whole, at a place that looks like no other, yet thousands of such landings gather into banded stripes.',
    exemplarKeywords: [
      'double slit with electrons',
      'one electron at a time',
      'single particles build up an interference pattern',
      'the Tonomura experiment',
      'each electron arrives as one dot',
      'a pattern that only appears after enough arrivals',
      'does a single electron go through both openings',
      'random-looking dots that add up to stripes',
      'the most beautiful experiment in physics',
      'wave and particle in the same experiment',
      'counting arrivals on a detector',
    ],
  },

  briefing: {
    observable: [
      'A source on one side, a wall with two openings in it, and a detector screen seen face-on fill the picture from left to right.',
      'Before each arrival a spreading wave runs from the source, through the openings and on toward the screen.',
      'Each electron then lands as a single point. The one that has just arrived is marked out, and every earlier one stays behind as a small mark.',
      'The number that have arrived so far is written beside the screen and climbs as they come.',
      'With only a handful down, the marks are scattered about the screen with nothing to them — no order is visible at all.',
      'As they accumulate, upright bands of marks emerge with nearly bare gaps between them, and the bands sharpen the longer it goes on.',
      'A row of bars, one for each height across the screen, grows with the count at that height, so the same banding appears a second time as a set of lengths.',
      'When the arrivals come quickly the spreading wave is drawn fainter and at last not at all, leaving only the marks accumulating.',
      'At the end thousands of marks hold the stripes plainly; then everything fades and the round begins again with the same arrivals landing in the same places.',
      'The writing below moves through three statements as the count grows: that they come one at a time, that each place looks like chance, and that the marks have built into stripes.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The arrivals come on their own and the pattern is whatever has accumulated by the moment being watched.',
        'The arrivals are kept rather than allowed to fade, which is the whole point — the pattern belongs to the collection and to nothing in any single one of them.',
        'The count written by the screen advances with the arrivals, so the stage the pattern has reached can be named by a number rather than by an impression.',
        'The statement below changes at the counts where the appearance really changes, so what it says and what is on screen never disagree.',
        'The bars grow from the same arrivals that make the marks, so the banding is available both as a scatter of points and as a set of lengths.',
        'The wave is faded out once arrivals are coming faster than the eye can separate them, leaving the accumulation to speak for itself.',
        'Nothing marks which opening an arrival came through, and no expected curve is drawn over the screen in advance.',
        'No axis, ruling or spacing is written anywhere.',
        'It opens with three arrivals already down and a fourth on its way.',
      ],
    },

    useWhen: [
      'The article has said that particles behave as waves and the reader wants to know how that can be, given that each one is caught whole. Each arrival here is a single mark and the pattern is in the pile, not in the mark.',
      'The point is that the early appearance of randomness is not evidence against a pattern. The same picture is watched from a handful of marks, which look like nothing, to thousands, which look like stripes.',
      'The article needs a count to hang the argument on — how many arrivals before the banding is undeniable. The number is written beside the screen throughout.',
    ],

    avoidWhen: [
      'The point turns on which opening the particle went through, or on the pattern vanishing once the path is watched. Nothing here marks a path and the openings are never treated separately.',
      'The article is about light rather than matter, or about a screen going darker in places when a second opening is uncovered.',
      'The subject is rings from a crystal, or a pattern that shifts when the beam is changed. The openings and the beam here are never altered.',
      'The figures wanted are the spacing between stripes, the wavelength, or the separation of the openings. None of these is written and no scale is drawn.',
      'The article is about what a measurement does to the state afterwards, or about repeating a measurement on the same particle. Each arrival here is a fresh particle in the same conditions.',
    ],

    contrastWith: [
      {
        concept: 'youngs-double-slit',
        note: 'Both are two openings and a screen, but one is about light arriving all at once and certain places going darker for it, while the other is about arrivals that come singly and only make a pattern by accumulating.',
      },
      {
        concept: 'electron-diffraction',
        note: 'Both are evidence that matter diffracts; one watches a standing pattern respond to a change in the beam, the other watches a pattern come into existence out of separate landings.',
      },
      {
        concept: 'wave-function',
        note: 'Both end with marks gathered into a shape, but one is about two paths and their interference, while the other is about a distribution being read off a given state and its sign playing no part in it.',
      },
      {
        concept: 'measurement-collapse',
        note: 'One repeats the same preparation over and over and cares only about the collection of outcomes; the other keeps to one particle and asks what the act of measuring leaves behind.',
      },
    ],
  },
};
