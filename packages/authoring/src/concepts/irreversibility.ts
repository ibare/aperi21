/**
 * irreversibility 개념 선언.
 *
 * 방향 · 기관 다섯 중 하나(가름은 `second-law-of-thermodynamics.ts` 머리 참조).
 * 이 조각은 **되감은 장면**을 주장한다 — 바닥 전체로 흩어진 떨림이 공 밑 한 점으로 모여
 * 공을 띄우는 역재생이 실제로 돌아가고, 그것이 어색하다는 것이 곧 비가역의 뜻이다.
 * 이쪽만 튀는 공 · 알갱이 바닥 · ▶ ◀ 표식 · h₀ 점선 어휘를 갖는다.
 * 엔트로피를 재는 값 · 식은 화면에 없어 avoidWhen 으로 되돌린다(간극 장부 참조).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const irreversibilityConcept: Aperi21ConceptSource = {
  id: 'irreversibility',
  label: 'Irreversibility Seen by Reversing the Film',
  canonicalSim: 'aperi21:irreversibility',

  surface: {
    definition:
      'Irreversibility shown by running a settled scene backwards, so that energy which scattered into countless small motions would have to gather from everywhere into one place at once.',
    exemplarKeywords: [
      'irreversibility',
      'why can it not be undone',
      'running the film backwards',
      'a bouncing ball never bounces back higher',
      'energy spread into heat cannot be gathered up again',
      'the reversed video looks wrong',
      'nothing forbids it yet it never happens',
      'the ball comes to rest and the floor warms',
      'entropy and the direction of time',
      'why do broken things not unbreak',
    ],
  },

  briefing: {
    observable: [
      'A ball above a floor made of a fine grid of grains, with a dashed line at the left marking the height it is let go from.',
      'A small marker in the top corner shows which way the film is running, pointing forward at first.',
      'The ball falls and bounces, each bounce lower than the one before. Where it lands the grains shake hard and the floor darkens beneath it, and the shaking and the darkening then spread outward through the floor.',
      'By the time the ball has stopped, every grain over the whole floor is shaking, harder than any of them was at the start, and the darkening lies evenly across it.',
      'The film halts and the marker turns to point backwards.',
      'Now the shaking and the darkening drain in from all over the floor and gather beneath the resting ball, and at the moment they arrive the ball is kicked upward.',
      'Each following bounce is higher than the last, and the final one leaves the ball hanging still at the dashed starting line while the floor goes quiet again.',
      'Nothing is broken in the reversed run — the ball rises to exactly the height it was let go from, so what is absurd is not that energy appeared but where it had to come from.',
      'The marker turns forward again and the round begins afresh.',
      'Heat is shown twice over, as the length of each grain’s shaking stroke and as the darkness beneath it, so it reads both in motion and in a still frame.',
      'The ball and the grains carry different colours because they are different things; forward and backward are told apart by the marker and the wording, never by colour.',
      'No numbers appear anywhere — no bounce height, no energy, no measure of the spreading.',
    ],

    screen: {
      affordances: [
        'The round runs by itself and plays both directions in turn, which is the only way the comparison can be made at all.',
        'The backward run is the same motion with its time reversed rather than a freshly drawn animation, so nothing has been staged to make it look wrong.',
        'Each grain’s shaking stroke points the way it is actually moving on screen, so the strokes reverse along with everything else.',
        'The dashed starting line is there so the reversed ball can be seen arriving exactly where it began, which is what makes it a genuine rewind rather than a rough one.',
        'The shaking is drawn far larger than life so that it can be seen at all; what is claimed is the direction of the gathering, not its size.',
      ],
    },

    useWhen: [
      'The article has said a process is irreversible and the reader objects that the backward version breaks no conservation law. Watching that backward version play in full, and feeling it to be impossible although nothing is violated, is the answer that objection needs.',
      'The reader is being asked to think of heat as motion scattered among countless small pieces, and the moment wanted is the one where all of that scattered motion converges beneath the ball and lifts it.',
    ],

    avoidWhen: [
      'The article is about a gas filling a space, or about a count settling at its even share. Nothing here is a gas and nothing is counted.',
      'A measure of the spreading is wanted — a value, a formula, a change in some quantity. Nothing is measured; the argument is made by direction alone.',
      'The subject is how bouncy a ball is, or how to work out its rebound height. The bouncing is only the carrier for where the energy went.',
      'Heat flowing from a hot body to a cold one is the point, or two bodies settling to a shared temperature. There is one floor here and it warms all over at once.',
      'An engine is the subject, or work bought and passed on. No machine appears in the picture.',
    ],

    contrastWith: [
      {
        concept: 'second-law-of-thermodynamics',
        note: 'Both are the one-wayness of change — one lets the forward run go on until the return is plainly not coming, the other plays the return itself so its absurdity can be judged.',
      },
      {
        concept: 'energy-dissipation',
        note: 'One follows ordered motion leaving for countless small ones and stops there; the other goes on to ask what calling it back would take.',
      },
      {
        concept: 'heat-engine',
        note: 'One says scattered energy will not gather itself; the other is a machine built around that fact, keeping a share and having to let the rest scatter.',
      },
      {
        concept: 'refrigerator-heat-pump',
        note: 'One plays a reversal that nobody could pay for; the other is a reversal that is arranged and paid for, and shows the bill.',
      },
    ],
  },
};
