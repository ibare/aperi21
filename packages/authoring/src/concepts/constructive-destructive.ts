/**
 * constructive-destructive 개념 선언.
 *
 * 위험한 셋 중 하나. `superposition` · `interference` 와 **주어**로 갈랐다.
 *   superposition             주어 = 한 번 만났다 헤어지는 두 펄스 — 더해지고 그대로 남는다
 *   constructive-destructive  주어 = **어긋난 정도**. 주장 = 그것이 합의 **크기**를 정한다
 *   interference              주어 = 수면 위 **자리** — 잠잠한 줄이 제자리에 머문다
 * 이쪽만 「위상이 맞다 · 반 파장 어긋나다 · 두 배 · 사라진다 · 그 사이」 어휘를 갖는다.
 * 무늬 · 줄 · 파원 · 통과 · 처음 모양은 쓰지 않는다.
 *
 * 조작기가 없다 — 자동 진행이 0 → π → 0 을 연속으로 훑는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const constructiveDestructiveConcept: Aperi21ConceptSource = {
  id: 'constructive-destructive',
  label: 'Constructive and Destructive Addition Set by How Far Out of Step',
  canonicalSim: 'aperi21:constructive-destructive',

  surface: {
    definition:
      'How far out of step two otherwise identical waves are decides the size of their sum: in step it swings twice as far, half a wavelength apart it vanishes, and between those it takes every size in turn.',
    exemplarKeywords: [
      'constructive and destructive interference',
      'in phase and out of phase',
      'phase difference between two waves',
      'crest on crest and crest on trough',
      'why do two waves cancel each other out',
      'the amplitude doubles when waves line up',
      'half a wavelength out of step',
      'antiphase',
      'two identical waves added together',
      'the sum shrinks as the waves slip apart',
    ],
  },

  briefing: {
    observable: [
      'Two strings are drawn one above the other. The upper one carries two waves of the same height and the same wavelength — one solid, one dashed — and the lower one carries nothing but their sum, drawn as a single thick line.',
      'All three keep flowing steadily to the right at the same speed throughout, so the sum is plainly another wave of the same wavelength and not a static graph.',
      'Faint guide lines mark `A` above and below the upper string and `2A` above and below the lower one, with those marks written at the right-hand end. The two strings share a vertical scale, so `2A` stands exactly twice as far out as `A`.',
      'The round opens with the dashed wave lying exactly on the solid one, reading as a single line, while the sum below reaches its crests and troughs right onto the `2A` guides.',
      'The dashed wave then slides steadily backwards, and as it does the sum shrinks continuously — it passes through every height between twice and nothing rather than jumping between two cases.',
      'When the dashed wave has slipped half a wavelength it is the mirror of the solid one, crest sitting where trough sits, and the sum below lies perfectly flat along its centre line.',
      'At that same moment the two waves above are still swinging out to `A` exactly as before: what has gone is the sum, not the waves.',
      'The dashed wave then slides back toward the solid one, the sum grows back through the intermediate heights, and the round joins onto its own beginning.',
      'The two waves are told apart by line style alone and never by colour, which is why in step they merge into one line rather than showing as two.',
      'No number appears for how far out of step they are, none for the size of the sum, and no expression is written for either.',
    ],

    screen: {
      affordances: [
        'The round runs by itself, carrying the offset from none out to half a wavelength and back; nothing has to be pressed, and every value in between is passed through on the way.',
        'The sum is given a string of its own rather than being drawn over the two waves, which is what keeps a flat sum from being lost against the centre line and a doubled sum from burying the pair above.',
        'The guide lines at `A` and `2A` on a shared scale are what let "twice as far" be read as a height rather than taken on trust.',
        'The waves keep moving rather than being held still, so that the sum is seen to be a travelling wave whose height alone is at stake.',
        'The screen opens already flowing and in step, with the sliding about to begin.',
      ],
    },

    useWhen: [
      'The article has given the two extreme cases — crest on crest doubling, crest on trough cancelling — as a pair of pictures, and the reader has no sense of what lies between them. The sum shrinking continuously as the dashed wave slips is exactly that middle ground.',
      'The reader takes cancellation to mean the waves have been destroyed. The two waves still swinging at full height above a perfectly flat sum is what corrects it.',
      'The point being made is that the one thing deciding the outcome is the offset — the two waves being alike in every other respect is what makes the claim clean.',
    ],

    avoidWhen: [
      'The waves in the article are of unequal size, or of different wavelengths, or of different frequencies. The two here are identical by construction, and the doubling and the vanishing both depend on it.',
      'The subject is two single pulses meeting once and going on their way unchanged. These waves are endless trains that overlap everywhere along the string, and nothing here departs.',
      'The article is about a pattern spread across a surface, about places that are permanently quiet, or about two separated sources. Everything here lives on one line, and what changes is one offset.',
      'The combined swing that swells and dies away over and over is wanted. Both waves here have the same wavelength, so the offset only ever changes because it is being changed.',
      'Numbers are wanted — a phase difference in degrees or radians, the size of the sum. Only the marks `A` and `2A` are written.',
    ],

    contrastWith: [
      {
        concept: 'superposition',
        note: 'One takes for granted that overlapping waves add and asks what size the sum comes to; the other establishes the adding itself, and that each wave survives the meeting intact.',
      },
      {
        concept: 'interference',
        note: 'Both turn on waves reinforcing or cancelling, in different variables — one varies how far out of step two waves are and watches one sum change size, the other holds everything fixed and finds the cancelling and the reinforcing sitting at different places on a surface.',
      },
      {
        concept: 'beats-in-oscillation',
        note: 'One keeps the two rates identical so that the offset only changes when it is changed, and reads off the size of the sum against it; the other makes the two rates slightly unequal so that the offset drifts of itself and the sum swells and dies over and over.',
      },
      {
        concept: 'normal-modes',
        note: 'One adds two waves and asks what their sum amounts to; the other takes a tangled motion as given and asks which few fixed shapes it is the sum of.',
      },
    ],
  },
};
