/**
 * wave-speed-in-medium 개념 선언.
 *
 * 묶음 안에서 유일하게 **속도가 어디서 오는가**를 묻는다. `wave-basics` 가 속도를 λ · T 의
 * 결과로 다루는 자리와 갈랐다 —
 *   wave-basics          속도는 **주어진 파동의** 두 수에서 따라 나온다
 *   wave-speed-in-medium 그 속도를 **무엇이 먼저 정했는가** — 펄스가 아니라 줄이다
 * 이쪽만 장력 · 선밀도 · 같은 시간에 두 배 · 절반 어휘를 갖는다.
 *
 * 주제 설명의 「탄성」 이 화면보다 넓다 — 줄 하나의 어휘(장력 · 선밀도)로 좁혔다. 장부 참조.
 *
 * 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const waveSpeedInMediumConcept: Aperi21ConceptSource = {
  id: 'wave-speed-in-medium',
  label: 'What Fixes the Speed of a Wave',
  canonicalSim: 'aperi21:wave-speed-in-medium',

  surface: {
    definition:
      'That the speed of a wave is settled by the medium carrying it rather than by the wave itself: tightening the string doubles it, and making the string heavier halves it.',
    exemplarKeywords: [
      'what determines the speed of a wave',
      'speed of a wave on a string',
      'tension and mass per unit length',
      'a tighter string carries waves faster',
      'a heavier rope slows the wave down',
      'square root of tension over density',
      'the medium decides how fast the wave goes',
      'thick and thin guitar strings',
      'stretching a rope to speed up a pulse',
      'why the same wave goes at different speeds',
    ],
  },

  briefing: {
    observable: [
      'Three strings are stacked one above another, all fixed at a wall on the left. The middle one is the reference; the top one is held at four times the tension; the bottom one is four times as heavy per length.',
      'The tension is shown as the length of the arrow pulling each string’s right-hand end — the top arrow is four times as long — and the heaviness as the thickness of the string, so the bottom one is visibly the fattest.',
      'Each string is named by a symbol at its left rather than by a number, so what differs between them is read as a multiple of the same two quantities.',
      'The same pulse — identical in height and in width on all three — is launched from the same place at the same instant on every string.',
      'As each pulse runs, a bar grows under its string from the launching place to the pulse, and all three bars start from one line on the left so their lengths can be laid against one another.',
      'The bars carry fine ticks, one tick being the distance the slowest pulse covers in the race, so the comparison falls on whole numbers.',
      'When the race ends the bars stop at four ticks, two ticks and one tick, with each pulse sitting at the end of its own bar, and the closing line says the tighter string carried it twice as far and the heavier string half as far.',
      'The three pulses keep exactly the same shape as one another throughout, so nothing but the distance covered can account for the difference.',
      'No speed, tension or density value is written anywhere; the ratios stand in the string names and in the tick counts.',
      'The race is stopped before the fastest pulse reaches the far end, so nothing ever comes back along a string.',
    ],

    screen: {
      affordances: [
        'The three pulses are launched together, the bars grow, the picture holds at the finish and then starts again; nothing has to be pressed.',
        'Two comparisons run at once rather than in turn — one string differs from the reference only in tension and the other only in heaviness — so a single glance separates the two causes.',
        'One colour is spent on the distance covered alone; the wall, the pulling arrows, the ticks and the names are drawn plainly, because what tells the strings apart is meant to be the medium itself and not a colour.',
        'The screen opens with the three pulses already spread apart, so the race is watched in progress rather than waited for.',
      ],
    },

    useWhen: [
      'The article has given a formula for wave speed in terms of tension and mass per length, and the reader cannot see why a wave would care about the rope at all. Three identical pulses ending up four, two and one tick along is what makes the rope the cause.',
      'The reader half believes that a stronger flick makes a faster wave. Pulses of identical shape and height travelling at three different speeds is what answers that without arguing it.',
    ],

    avoidWhen: [
      'The article turns on elasticity, or on how fast sound travels through steel, water and air. Everything here is a stretched string, and the two quantities on offer are its tension and its heaviness.',
      'The claim is that frequency has no bearing on the speed. There is no repetition here at all — a single pulse runs down each string and nothing sets a rate.',
      'The point is that a taller or wider pulse is no faster. All three pulses here are drawn identically, and the picture never varies a pulse against itself.',
      'The subject is what happens at the end of a string. The race is stopped short of the ends and no pulse ever returns.',
      'Numbers are wanted — a speed in metres per second, a tension in newtons. Only the multiples and the tick counts are shown.',
    ],

    contrastWith: [
      {
        concept: 'wave-basics',
        note: 'One asks what set a wave’s speed before any wave was sent; the other takes the speed as it stands and ties it to the wave’s own length and period.',
      },
      {
        concept: 'tension',
        note: 'One has the pull in a string as the cause of something else — how fast a disturbance crosses it; the other is about that pull itself, and that it arrives undiminished wherever along the string it is measured.',
      },
      {
        concept: 'youngs-modulus',
        note: 'Both make a material’s stiffness the thing that matters, for different outcomes — one for how quickly a disturbance runs through it, the other for how far it gives under a load.',
      },
      {
        concept: 'longitudinal-wave',
        note: 'One asks how fast the pattern moves and answers with the medium; the other asks what the pattern is made of and answers with crowding, a question the speed never touches.',
      },
    ],
  },
};
