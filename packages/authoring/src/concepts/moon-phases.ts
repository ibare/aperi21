/**
 * moon-phases 개념 선언.
 *
 * 형제는 `eclipse` 와 `earth-rotation-day-night`. **무엇이 겹치는지로 갈랐다.**
 *   moon-phases               **두 반쪽이 겹친 만큼** — 햇빛 받는 반쪽과 지구를 향한 반쪽
 *   eclipse                   한 천체의 **그림자가 다른 천체에 닿는** 드문 일 — 한 줄에 설 때만
 *   earth-rotation-day-night  같은 「밝은 반쪽은 제자리」 구조를 **하루**와 한 자리에 대해
 * 이쪽만 초승달 · 보름 · 차고 이지러짐 · 겹침 어휘를 갖는다. 그림자 · 가려짐은 쓰지 않는다 —
 * 이 화면에서 달은 무엇에도 가려지지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const moonPhasesConcept: Aperi21ConceptSource = {
  id: 'moon-phases',
  label: 'Phases of the Moon as Two Overlapping Halves',
  canonicalSim: 'aperi21:moon-phases',

  surface: {
    definition:
      'Why the Moon appears to change shape: its sunlit half stays turned toward the Sun while the half facing Earth swings round, and only their overlap looks bright.',
    exemplarKeywords: [
      'phases of the Moon',
      'crescent, half, gibbous and full',
      'why does the Moon change shape',
      'waxing and waning',
      'half the Moon is always in sunlight',
      'what shape is the Moon tonight',
      'new moon and full moon',
      'the lunar month',
      'which side of the Moon is lit up',
      'the Moon looks like a thin sliver',
    ],
  },

  briefing: {
    observable: [
      'Two panels stand side by side: on the left, Earth and the Moon’s orbit seen from above the north, with sunlight arriving from one side as flowing dashes; on the right, a large disc of the Moon as it would be seen from Earth.',
      'The Moon on the orbit is drawn as two half discs, one bright and one shaded, and the bright one faces into the sunlight however far round the orbit it has travelled.',
      'An arc in the accent colour marks off the half of the Moon that faces Earth, and a dashed line runs from Earth to the Moon to say which half that is.',
      'Eight faint Moons sit at fixed places round the orbit, each with its own bright half turned the same way as all the others.',
      'The disc on the right is lit exactly where the two halves overlap, with a soft boundary across it and a ring in the accent colour drawn round its edge.',
      'As the Moon goes round, the lit part of that disc grows from a thin sliver to a full round and shrinks back again.',
      'With the Moon on the far side from the Sun the disc is wholly lit; with the Moon on the Sun’s side it is wholly dark; at the two places between, exactly half of it is lit and split down the middle.',
      'The caption changes at the two ends to say that the halves barely overlap or that they almost coincide, and reads as partial overlap everywhere between.',
    ],

    screen: {
      affordances: [
        'The Moon goes round in about sixteen seconds on its own and begins again; the arrival point is a little past the dark end, with a thin sliver already showing.',
        'The Moon on the orbit can be taken hold of and dragged to any place on the circle, and the disc beside it follows at once; released, it carries on orbiting from where it was left.',
        'A ring is drawn on the Moon at all times, so it is visible that this is the thing to take hold of.',
        'Lit and shaded are drawn with brightness rather than colour, so the lit part of the disc is the bright part in any surroundings.',
      ],
    },

    useWhen: [
      'The reader has been told that the phase is which part of the lit half we see and cannot hold two halves in mind at once. Setting the Moon by hand at a place on the orbit and reading the shape off the disc beside it makes the geometry answerable rather than recited.',
      'The prose has to break the habit of treating each phase as its own object, and eight faint Moons with their bright halves all turned the same way says that nothing about the lighting changed.',
    ],

    avoidWhen: [
      'The article is about eclipses, or about Earth’s shadow falling across the Moon. Nothing here casts a shadow onto anything; each body is simply lit on one side.',
      'The point is the name of the phase on a given date, or how many days separate one phase from the next. No dates or counts of days are written.',
      'The tides, the Moon’s distance, or the tilt of its orbit are the subject. The orbit drawn here is a flat circle in the plane of the picture.',
      'The article is about the Moon keeping one face toward Earth, or about its far side.',
      'The subject is when and where the Moon is to be seen in the sky, or at what hour it rises. Earth is drawn from outside with nobody standing on it.',
      'Earth’s own phases as seen from the Moon, or the phases of Venus, are wanted. Only the Moon’s disc is drawn.',
    ],

    contrastWith: [
      {
        concept: 'eclipse',
        note: 'One is about which part of a permanently half-lit Moon is turned our way; the other is about a shadow reaching across from one body to another, which can happen at only two of those positions and even then seldom does.',
      },
      {
        concept: 'earth-rotation-day-night',
        note: 'Both turn a body under a half of sunlight that never moves — one turns which part of that half is aimed at us over a month, the other carries a place through it in a day.',
      },
    ],
  },
};
