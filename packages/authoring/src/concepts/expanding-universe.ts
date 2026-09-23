/**
 * expanding-universe 개념 선언.
 *
 * 이 묶음에서 홀로 **우주 규모의 운동학**이다. 형제가 없으므로 이미 선언된 기준계 셋과
 * 갈랐다 — 그쪽은 관찰자를 바꾸면 그림이 **달라지는** 것을 보이고, 이쪽은 관찰자를 바꿔도
 * 그림이 **같은** 것을 보인다. 그것이 「가운데가 없다」 의 뜻이다.
 * 적색 이동 · 색은 화면에 없다(빛의 색을 쓰지 않는다). 나오는 것은 격자 · 자취 · 비뿐이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const expandingUniverseConcept: Aperi21ConceptSource = {
  id: 'expanding-universe',
  label: 'Uniform Expansion and the Absence of a Center',
  canonicalSim: 'aperi21:expanding-universe',

  surface: {
    definition:
      'Uniform stretching of space, under which a viewer on any galaxy sees all the rest retreating, one twice as remote drawing away twice as quickly.',
    exemplarKeywords: [
      'the expanding universe',
      'are we at the centre of the universe',
      'every galaxy is moving away from us',
      'Hubble law, farther means faster',
      'raisins in rising dough',
      'dots on a balloon being blown up',
      'space itself is stretching, not the galaxies flying apart',
      'recession velocity proportional to distance',
      'where was the big bang',
      'the universe has no edge and no middle',
    ],
  },

  briefing: {
    observable: [
      'Galaxies are scattered over a faint grid, and three of them stand in a row across the middle at even spacing.',
      'A ring marks the galaxy being viewed from, with a phrase beside it saying so, and it begins on the leftmost of the row.',
      'The grid stretches and the galaxies go with it — they do not run across the grid, the whole mesh opens out and carries them.',
      'Small grey dots stay where each galaxy used to be, joined to it by a trail, so how far each one has travelled is a line on the picture.',
      'All the trails point away from the ringed galaxy, and the further out a galaxy is, the longer its trail; the ringed one has no trail at all.',
      'Two arrows on the row are named as a speed and twice that speed, and two measuring lines beneath are named as a spacing and twice that spacing, with the longer arrow visibly double the shorter.',
      'The stretched picture is not wound back; it fades and the unstretched grid returns intact.',
      'The ring then travels along the row to the galaxy at the other end, and the same stretch is applied a second time.',
      'This time every trail springs from the right-hand galaxy, and the galaxy that had just been the viewpoint is the one retreating at the doubled speed.',
      'The second picture is the mirror image of the first, which the closing line takes as its point: each galaxy looks like the middle from where it stands.',
      'No distance, speed or rate is written as a number anywhere; only the letters for a spacing and a speed and their doubles appear.',
    ],

    screen: {
      affordances: [
        'The stretching, the fading, the move of the ring and the second stretching run in that order by themselves and then start over.',
        'The picture opens part way through the first stretch, with trails already short and the arrows already growing.',
        'Neither the view nor the frame shifts when the ring changes galaxies, because sliding the whole picture over would itself read as motion.',
        'The scattered galaxies are left without arrows so that the one pair carrying a speed and its double is not lost in a thicket of them.',
        'The grid is the space itself rather than a decoration, and it is spaced so that the three galaxies of the row sit on its crossings.',
        'No colour is used to stand for speed or remoteness; all the galaxies are drawn alike and the evidence is the length of a trail.',
      ],
    },

    useWhen: [
      'The article has said that everything is moving away from us and the reader has concluded we are at the middle of it. Moving the viewpoint to the far end and getting the identical picture is what removes that conclusion.',
      'The relation between remoteness and speed of retreat has been stated as a proportionality, and a picture is wanted in which the factor of two shows up twice over — once as a trail length and once as an arrow.',
    ],

    avoidWhen: [
      'The evidence for expansion is the subject — shifted lines in a spectrum, how the rate is measured, who measured it. Nothing here is observed through light at all.',
      'The beginning of the expansion, its future, or what the universe is expanding into, is at issue. One stretch is shown and it is never traced backward.',
      'Gravity, the contents of the universe, or the pull between galaxies matters. The galaxies here simply ride the grid.',
      'The article needs the expansion to be shown speeding up or slowing down. Each stretch here runs at one steady rate and they are identical to each other.',
      'The reader should stand on a galaxy of their own choosing. Two viewpoints are used, both at the ends of the row, and the pair carrying the ratio exists only for those two.',
      'A rate, an age or a distance has to be quoted. Only letters standing for a spacing and a speed are written.',
    ],

    contrastWith: [
      {
        concept: 'reference-frame',
        note: 'Both change who is doing the watching and redraw the motions accordingly; there the point is that the description changes, here that it comes out identical however the choice is made.',
      },
      {
        concept: 'relative-velocity',
        note: 'Both give every body a speed only with respect to a chosen one, but here that speed is fixed by separation alone, so every viewer finds the same rule rather than the same values.',
      },
      {
        concept: 'coordinate-choice',
        note: 'Both show a choice of origin as something the observer makes rather than something the situation contains, one to simplify a description and one to demonstrate that no origin is privileged.',
      },
    ],
  },
};
