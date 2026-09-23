/**
 * wave-vs-particle-transport 개념 선언.
 *
 * 「파동이 무엇인가」 넷 중 하나. 이쪽만 **건너간 것이 무엇인가**를 묻는다.
 *   wave-basics                 네 수가 맞물린 방식
 *   wave-vs-particle-transport  **저쪽 끝이 움직이기 시작한다** — 매질은 제 고리로 돌아온다
 *   transverse-wave             흔들림과 나아감의 각
 *   longitudinal-wave           같은 축 · 빽빽한 띠
 * 이쪽만 「돌아온다 · 도착한다 · 에너지」 어휘를 갖는다. 방향(수직 · 나란함) · 파장 ·
 * 주기 · 빠르기는 쓰지 않는다 — 화면에 펄스 하나뿐이라 잴 것이 없다.
 *
 * 조작기가 없다. affordances 에 저절로 일어나는 것을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const waveVsParticleTransportConcept: Aperi21ConceptSource = {
  id: 'wave-vs-particle-transport',
  label: 'What Crosses When a Wave Travels',
  canonicalSim: 'aperi21:wave-vs-particle-transport',

  surface: {
    definition:
      'What a travelling wave actually moves along: marked pieces of the medium lift and settle back into the very places they left, while something arrives at the far end and sets a body there moving.',
    exemplarKeywords: [
      'what does a wave transport',
      'waves carry energy, not matter',
      'a cork bobs but the water does not travel',
      'does the water move along with the wave',
      'a pulse sent down a rope',
      'the far end starts to move',
      'nothing is carried along by a wave',
      'energy arriving somewhere without matter',
      'the medium is left where it was',
      'what gets delivered across a medium',
    ],
  },

  briefing: {
    observable: [
      'Three pieces of the rope are marked, and at the starting place of each an empty ring is drawn in the same colour, so the place a piece came from stays on screen after the piece has left it.',
      'A single pulse leaves the handle at the left and runs along the rope. As it arrives under a marked piece, that piece lifts out of its ring and the ring is left plainly empty underneath.',
      'The pulse moves on and the piece drops straight back down into its own ring. By the time the pulse reaches the far end, all three pieces are sitting in their rings again and the rope is flat.',
      'The far end of the rope is tied to a weight hung on a spring from the ceiling, and beside the weight an outline marks where it was hanging still.',
      'When the pulse arrives, the weight leaves that outline and swings well above and below it, the spring compressing and stretching as it goes.',
      'The rope is flat again while the weight is still bouncing — nothing is left on the rope, yet something at that end is now in motion.',
      'The bounce dies down slowly rather than stopping, so a faint residual sway is still there when the next pulse sets out.',
      'The end takes the pulse in and nothing comes back along the rope, so each marked piece rises once and only once in a round.',
      'The word for what crossed appears in the closing line only; nothing on the picture is labelled with a quantity, and no distance is written for either the pieces or the pulse.',
    ],

    screen: {
      affordances: [
        'One round carries a pulse from the handle to the weight and starts again; nothing has to be pressed.',
        'The rings under the pieces and the outline beside the weight are the same device — a mark of where something was resting — which is what lets one be read against the other: the pieces come back to theirs and the weight does not.',
        'Only three pieces of the rope are marked rather than all of them, so that an empty ring stands out instead of becoming a row.',
        'One colour is spent on the crossing pulse alone; the ceiling, the spring and the weight’s resting outline are drawn plainly so that nothing competes with it.',
        'The screen opens with the pulse already partway along the rope, so the crossing is watched rather than waited for.',
      ],
    },

    useWhen: [
      'The article has said that a wave carries energy without carrying the medium, and the reader has no way to tell that apart from the medium simply flowing along. An empty ring left under a lifted piece, and that piece settling back into it, is what makes the difference visible.',
      'The point being made is that something genuinely arrives at the far side. The rope going flat while the weight keeps bouncing supplies the arrival, so the prose can point at it rather than assert it.',
    ],

    avoidWhen: [
      'The article turns on which direction the medium moves in relative to the travel. The pieces here only rise and fall, and nothing is drawn to say whether another kind of wave would behave otherwise.',
      'Sizes of the wave are wanted — wavelength, period, how fast, how high. There is a single pulse here and no repetition to measure against.',
      'How much energy is at issue, or an energy expression is being derived. Nothing here is metered, and the size of the bounce depends on the weight and the spring rather than on the wave alone.',
      'The subject is what happens when a wave reaches a boundary. The end takes the pulse in and nothing returns along the rope.',
      'The article is about two waves meeting. One pulse crosses at a time, and there is never a second one on the rope.',
    ],

    contrastWith: [
      {
        concept: 'transverse-wave',
        note: 'Both watch marked bits of a medium that do not travel, but for different ends — one asks what did travel and points to the far end, the other asks in which direction the bits moved and answers with a right angle.',
      },
      {
        concept: 'longitudinal-wave',
        note: 'One has a medium whose parts return to where they began and a delivery at the other end; the other has a medium whose parts also stay put, and identifies what moves as a pattern of crowding rather than as something delivered.',
      },
      {
        concept: 'wave-basics',
        note: 'One asks what a wave brings across; the other asks how big and how quick the wave is, questions that have the same answers whether anything is waiting at the far end or not.',
      },
      {
        concept: 'thermal-conduction',
        note: 'Both have energy crossing a body that does not itself move, but by different means — one passes it along as a shape that travels and keeps its form, the other seeps it along a temperature slope with nothing keeping any shape.',
      },
    ],
  },
};
