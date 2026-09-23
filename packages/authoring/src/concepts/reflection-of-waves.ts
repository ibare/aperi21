/**
 * reflection-of-waves 개념 선언.
 *
 * 「끝이 하는 일」 로 정상파 넷과 붙을 위험이 있어 **주어를 갈랐다.**
 *   reflection-of-waves   주어 = 끝에 닿았다 **되돌아오는 한 펄스**. 주장 = 묶인 끝에서는
 *                         뒤집혀 오고 미끄러지는 끝에서는 그대로 온다
 *   standing-wave         주어 = 이미 반대로 달리는 두 파동. 주장 = 무늬가 흐르기를 멈춘다
 *   air-column-resonance  주어 = 관의 끝. 주장 = 어떤 진동수가 살아남는가
 *   harmonics             주어 = 진동수 모임. 주장 = 정수배만 남는다
 *
 * 이쪽만 「펄스 하나 · 뒤집힌다 · 그대로다 · 매듭이 꼼짝 않는다 · 고리가 두 배로 오른다」
 * 어휘를 갖는다. 진동수 · 모드 · 마디 · 정수배는 쓰지 않는다 — 화면에 진동수도 반복도 없다.
 * 부분 반사 · 투과는 화면 밖이라 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const reflectionOfWavesConcept: Aperi21ConceptSource = {
  id: 'reflection-of-waves',
  label: 'A Pulse Returns Flipped from a Tied End and Upright from a Free One',
  canonicalSim: 'aperi21:reflection-of-waves',

  surface: {
    definition:
      'What the far end does to a pulse sent back along a string: an end that cannot move returns it upside down, while an end free to ride up and down returns it the same way up.',
    exemplarKeywords: [
      'reflection of a wave pulse',
      'fixed end and free end',
      'why does a pulse come back upside down',
      'the pulse flips when the end is tied',
      'free end reflection keeps the pulse upright',
      'phase change on reflection',
      'a pulse on a rope hitting a wall',
      'ring sliding on a rod at the end of a string',
      'the end rises to twice the pulse height',
      'reflected pulse inverted',
      'what happens at the end of a rope',
    ],
  },

  briefing: {
    observable: [
      'Two strings lie one above the other, each carrying the same pulse, a single hump raised on the upper side. At any moment the two pulses are at the same place along their strings and the same size.',
      'The two strings differ only at their far ends. The upper one is knotted against a hatched wall; the lower one ends in a small open ring threaded onto an upright rod it can slide along. Each end is named beside it, with a short note saying what it is.',
      'Both pulses travel to the right together and reach their ends at the same moment.',
      'That stretch is played out slowly. At the upper string the knot never stirs at all, and the string in front of it is pressed down until, for an instant, the whole of it lies almost flat.',
      'At the lower string the ring rides up the rod to twice the height the pulse had, carrying the string end with it, and then comes back down.',
      'The two pulses then come away and travel back to the left, once again at the same place as each other at every moment.',
      'The upper pulse now hangs below its string as a trough while the lower one still stands above its string as a hump. The two strings are drawn in exactly the same ink, so the only thing telling the two outcomes apart is which side of the string the hump is on.',
      'The ring is back at string height by then, and the knot is where it always was.',
      'The pulses enter from off the left of the strings and leave off the left again, and a quiet stretch follows before the next one comes in.',
      'A line of text below says what is happening: the same pulse running out on both, what each end does while the pulse is on it, and which one comes back flipped.',
    ],

    screen: {
      affordances: [
        'The whole thing runs by itself and repeats; nothing is pressed. The two kinds of end are given side by side from the start rather than one being changed into the other, so the comparison is made in one frame instead of against a memory.',
        'The stretch where the pulse is actually on the end is played at about a third of the ordinary pace, because that is where half of what is being shown happens and at full pace it is over too quickly to follow.',
        'Both strings are drawn in one ink and the wall and rod are held back; no accent colour is used at all, so the flip has to be read off the shape rather than from a colour.',
        'The two strings are told apart by the drawing of their ends and by the names beside them, and those names stay at string height so they do not move when the ring rides up.',
        'The ends are the two extremes — one wholly held, one wholly free — and nothing in between is offered.',
        'Nothing is written as a figure; the doubled height is something the ring reaches on the rod and the text names once in words.',
        'On arriving, the pulses are already running along both strings.',
      ],
    },

    useWhen: [
      'The article has stated that reflection at a fixed end inverts the pulse, and the reader has taken it as a rule with no cause. The knot standing absolutely still while the string flattens in front of it is the cause, and the free end beside it shows what happens when that constraint is lifted.',
      'The point being made is that a boundary acts on a wave, and a case is wanted where two boundaries differing in one respect give opposite outcomes on the same pulse at the same moment.',
      'The reader is to be shown that a free end is not simply the absence of an end — the ring overshooting to twice the pulse height is a thing the end does.',
    ],

    avoidWhen: [
      'The article is about a boundary between two materials, about part of a wave passing through and part coming back, or about how much of it comes back. Both ends here are complete — nothing goes past either of them.',
      'The subject is a continuing wave, a pattern that holds still, or the places in such a pattern that never move. One pulse at a time runs here and there is nothing for it to overlap with.',
      'The point turns on which rates a bounded body accepts, or on whole multiples of a lowest one. Nothing here repeats and no rate is named.',
      'The article is about a wave bouncing off a surface at an angle, or about the angle in against the angle out. Everything here runs along one line.',
      'Figures are wanted — a phase in radians, a reflected height, a speed. Nothing is numbered.',
      'The subject is sound, a pipe, or a pitch. These are strings and nothing is heard.',
    ],

    contrastWith: [
      {
        concept: 'standing-wave',
        note: 'One follows a single pulse out to an end and back, asking which way up it returns; the other takes two opposite running waves as already present and asks what they make together.',
      },
      {
        concept: 'air-column-resonance',
        note: 'Both turn on what an end does — one held, one free. One follows a single pulse through such an end; the other asks which continuing shapes those two kinds of end permit to last.',
      },
      {
        concept: 'harmonics',
        note: 'One shows what a boundary does to a pulse arriving at it; the other shows the ladder of rates that follows once such boundaries are at both ends of a body.',
      },
      {
        concept: 'string-vibration',
        note: 'Both are strings with ends that hold them, but one sends a single pulse at those ends to see how it comes back, while the other leaves the ends alone and moves where the string is pressed.',
      },
      {
        concept: 'wave-vs-particle-transport',
        note: 'Both send a single pulse down to the far end of a string, for different questions: one asks what the end sends back and which way up, the other asks what reached the end at all, and answers that the string itself went nowhere.',
      },
    ],
  },
};
