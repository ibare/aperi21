/**
 * interference 개념 선언.
 *
 * 위험한 셋 중 하나. `superposition` · `constructive-destructive` 와 **주어**로 갈랐다.
 *   superposition             주어 = 한 번 만났다 헤어지는 두 펄스
 *   constructive-destructive  주어 = 어긋난 정도 — 합의 크기
 *   interference              주어 = **수면 위 자리**. 주장 = 파원 둘이 켜져 있는 한
 *                             **제자리에 머무는 잠잠한 줄**이 난다
 * 이쪽만 「무늬 · 줄 · 자리 · 파원 둘 · 제자리에 머문다」 어휘를 갖는다. 위상차 · 보강 ·
 * 두 배 · 통과는 쓰지 않는다.
 *
 * 화면이 마루와 골을 같은 짙기로 칠해(발산형) 정지 화면에서 오르내림이 읽히지 않는다 —
 * 부정형이 아니라 관찰이라 observable 에 적고, 마루 · 골을 읽어 달라는 글은 avoidWhen 으로 되돌린다.
 *
 * 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const interferenceConcept: Aperi21ConceptSource = {
  id: 'interference',
  label: 'The Pattern Two Sources Set Up on a Surface',
  canonicalSim: 'aperi21:interference',

  surface: {
    definition:
      'The fixed arrangement two sources of the same ripples establish across a surface: lines along which the water never moves, holding the same places while the ripples keep streaming outward through them.',
    exemplarKeywords: [
      'interference pattern',
      'two sources of ripples on water',
      'a ripple tank with two dippers',
      'nodal lines',
      'quiet places where two sets of waves overlap',
      'fringes from two sources',
      'the pattern stays where it is',
      'lines of calm water between two sources',
      'two loudspeakers and the dead spots between them',
      'stripes spreading out from a pair of sources',
    ],
  },

  briefing: {
    observable: [
      'A stretch of water is seen from above with two source points marked on it, one above the other at the left.',
      'The round opens with only the first source running, and its ripples fill the whole surface — everywhere is moving, and there is no pattern of any kind.',
      'The second source starts, and wherever its ripples have reached, lines of stillness appear and fan outward between the two sources.',
      'Those lines then hold exactly where they are while the ripples keep streaming outward through them, so the pattern is plainly standing still on a surface that is not.',
      'The still lines are simply the untouched background of the picture, which is what makes them read as places where nothing is happening rather than as lines drawn on.',
      'The second source then stops — it is shown hollow instead of filled — and as its last ripples pass beyond, the still lines are wiped away behind them and that part of the surface moves again.',
      'The lines arrive with the second source’s ripples and leave with them, so what causes them is watched rather than asserted.',
      'The water is shaded in a single tone that deepens with how far the surface is from flat, so a crest and a trough come out looking the same and the up-and-down of the ripples cannot be told from a stopped picture; the bands therefore read at half-wavelength spacing.',
      'The ripples are drawn weaker the further they have spread, so the pattern is strongest between the two sources.',
      'Nothing is numbered and no line is ruled in — no wavelength, no distance from either source, no counting of the still lines.',
    ],

    screen: {
      affordances: [
        'The round runs by itself — one source, then both, then a stretch where the pattern simply holds, then the second source withdrawn — and starts again; nothing has to be pressed.',
        'Opening with a single source running is what establishes that the whole surface can move, so that the still lines are recognised as something the second source brought about.',
        'The stretch where the pattern merely holds is given time of its own, because the claim is that the lines stay put and that takes watching rather than a single glance.',
        'One colour is spent on the two sources alone, and the water is given a single tone, so that nothing on the surface is told apart by colour.',
        'Nothing here is set by hand — moving the sources apart or changing the wavelength would change how many lines there are, which is a different question.',
      ],
    },

    useWhen: [
      'The article has said that two sources produce quiet places, and the reader expects them to wash about as the waves do. The lines holding their places while the ripples stream through them is exactly the point that needs seeing.',
      'The reader needs the phenomenon to exist before anything is worked out about it — before path differences or fringe spacings are counted. Switching the second source on and watching the lines arrive supplies that.',
      'The point being made is that this belongs to places rather than to moments: which place you stand in decides whether anything happens there.',
    ],

    avoidWhen: [
      'The article works out where the quiet places fall — path difference in whole or half wavelengths, fringe spacing, numbering the lines. Nothing here is measured or marked, and the lines are not ruled in.',
      'The subject is how far out of step two waves are and what size their sum comes to. Nothing here is out of step by a named amount; the offset differs from place to place and is never put into words.',
      'The article follows two pulses meeting once and continuing on unchanged. Both sources here run on and their ripples overlap everywhere at once.',
      'The article asks the reader to read crests against troughs, or the heights of the ripples. Crest and trough are shaded alike, so only "moving" and "still" can be told apart.',
      'The subject is what happens to the pattern when the sources are moved apart or the wavelength changed. The arrangement here is fixed throughout.',
      'A single source is at issue — its fronts, its directions of travel, or how its strength falls off. Two sources are what make this picture.',
    ],

    contrastWith: [
      {
        concept: 'constructive-destructive',
        note: 'Both turn on waves reinforcing or cancelling, in different variables — one holds everything fixed and finds the cancelling and the reinforcing sitting at different places on a surface, the other varies how far out of step two waves are and watches a single sum change size.',
      },
      {
        concept: 'superposition',
        note: 'One is an arrangement that never ends, with the adding at each place giving the same result over and over; the other is a meeting that happens once, where the adding can be watched beginning and finishing.',
      },
      {
        concept: 'huygens-principle',
        note: 'Both add up waves from several points, toward opposite ends — one has two far apart leaving lines where nothing happens, the other has many crowded together conspiring into a single clean front.',
      },
      {
        concept: 'wavefront-and-ray',
        note: 'One has two sources and asks what their ripples do to each other where they cross; the other has a single source and asks how its fronts and its directions of travel are related.',
      },
    ],
  },
};
