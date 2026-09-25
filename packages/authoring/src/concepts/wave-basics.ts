/**
 * wave-basics 개념 선언.
 *
 * 「파동이 무엇인가」 를 말하는 넷 중 하나 — `wave-vs-particle-transport` ·
 * `transverse-wave` · `longitudinal-wave` 와 섞으면 넷 다 「매질은 제자리, 물결은 간다」
 * 로 수렴한다. **무엇을 주장하는지로 갈랐다.**
 *   wave-basics                 네 수(λ · T · A · v)가 **맞물린 방식** — 한 번 흔들리는 동안 한 파장
 *   wave-vs-particle-transport  **건너간 것이 무엇인가** — 저쪽 끝의 추가 움직이기 시작한다
 *   transverse-wave             흔들림과 나아감의 **각** — 직각
 *   longitudinal-wave           흔들림과 나아감이 **같은 축** — 빽빽한 띠가 절로 생겨 나아간다
 * 이쪽만 파장 · 주기 · 진폭 · 빠르기의 어휘를 갖는다. 방향 · 건너감 · 에너지는 쓰지 않는다.
 *
 * 주제 설명의 「진동수 · 속력」 이 화면보다 넓다 — 장부 참조.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const waveBasicsConcept: Aperi21ConceptSource = {
  id: 'wave-basics',
  label: 'The Quantities of a Travelling Wave and How They Lock Together',
  canonicalSim: 'aperi21:wave-basics',

  surface: {
    definition:
      'The lock between the wavelength, the period and the speed of a travelling wave: while one point of the medium rises and falls once, the crest advances exactly one wavelength.',
    exemplarKeywords: [
      'wavelength and period of a wave',
      'amplitude of a wave',
      'how fast does a wave travel',
      'speed equals wavelength times frequency',
      'what does the height of a wave mean',
      'long waves against short waves',
      'one full cycle of a wave',
      'stretching the wavelength out',
      'the crest moves on while the water bobs',
      'measuring a wave in time and in space',
    ],
  },

  briefing: {
    observable: [
      'A rope waves to the right, and one point of it, marked `P`, is held to a short vertical span drawn from `−A` to `+A` — it goes up and down on that span and never sideways.',
      'A small trace at the right writes the height of `P` against time; a faint dotted line joins `P` to the head of that trace, so the two are one point drawn twice. The far end of the trace is marked `T`.',
      'A dimension line marked `λ` runs from `P` back to the crest one wavelength behind it, and a highlighted bar grows over that line as the crest travels, with a marker riding on the crest at the bar’s end.',
      'The two measures finish in the same instant: the trace has drawn exactly one rise and fall as it reaches `T`, and at that same moment the bar has filled the `λ` line to its end and the crest marker has arrived at `P`.',
      'The picture then holds still, and the closing line says that in the time `T` the point took to rise and fall once, the crest moved exactly one wavelength.',
      'A second dimension line marked `A` stands outside the left end of the rope, from the flat line up to crest height, so amplitude is read where nothing is moving.',
      'Setting a longer wavelength with the period held fixed makes the crest travel visibly faster — as it would on a tighter rope — yet the bar still fills exactly as the trace completes one rise and fall; the coincidence survives.',
      'Raising the amplitude changes only how high the rope goes; the bar fills over the same distance in the same time.',
      'Only symbols are written on the picture — `λ`, `A`, `T`, `t`, `P`. No speed and no wavelength value appears there.',
    ],

    screen: {
      affordances: [
        'Two sliders sit under the picture, one for wavelength and one for amplitude, each showing its own value in metres.',
        'Moving either slider starts the round again from the beginning of a period, so a half-filled bar is never compared against a new wavelength.',
        'The wave runs and repeats by itself; nothing has to be pressed to make the measurement happen.',
        'The trace is drawn to the rope’s own vertical scale, which is what lets the dotted line say that the trace head and `P` are at one height.',
        'One colour is spent on one meaning — the distance the crest has covered — so the bar and the crest marker belong together and everything else is drawn plainly.',
      ],
    },

    useWhen: [
      'The article has stated that a wave’s speed is its wavelength divided by its period, and the reader has taken it as arithmetic between three letters. Watching the trace finish one rise and fall at the same instant the bar fills the wavelength is what turns the equation into a single event.',
      'The reader is being asked to hold the time picture and the space picture of one wave at once, and the sliders let them check that, at the same period, a longer wavelength goes with a faster crest without breaking the match.',
    ],

    avoidWhen: [
      'The point is that changing the frequency changes something. The rate of the bobbing is fixed here; the sliders reach wavelength and height only.',
      'The article turns on which way the medium moves relative to the travel — across it or along it. Only a single point of the rope is marked, and its span says nothing about a second kind of wave.',
      'The subject is what decides how fast a wave goes. On a given rope the speed is set by the rope, not by the wave; here the period is held fixed, so a longer wavelength stands for a faster wave — a different or tighter rope — and what fixes that speed is left to the medium.',
      'The claim is that a wave carries energy while the medium stays put. Nothing sits at the far end here and nothing arrives anywhere.',
      'Numbers are wanted — a speed in metres per second, a frequency in hertz. The picture carries symbols only, and the sliders show just their own settings.',
    ],

    contrastWith: [
      {
        concept: 'transverse-wave',
        note: 'One is about how much — the sizes of a wave and the way they constrain each other; the other is about which way — the angle between the medium’s motion and the wave’s advance, a question no quantity answers.',
      },
      {
        concept: 'wave-speed-in-medium',
        note: 'One takes the speed as following from the wavelength and period that a wave happens to have; the other asks what fixed that speed in the first place, and answers with the medium rather than with the wave.',
      },
      {
        concept: 'wave-vs-particle-transport',
        note: 'One measures the wave — how long, how high, how quickly; the other asks what the wave delivers, and answers that the medium comes back to where it started while energy does not.',
      },
      {
        concept: 'simple-harmonic-motion',
        note: 'One follows a single point of a medium bobbing and asks what the rest of the medium is doing at the same moment; the other has a single body and asks why its motion is a sine curve at all.',
      },
    ],
  },
};
