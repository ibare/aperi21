/**
 * string-vibration 개념 선언.
 *
 * 「정상파」 네 형제 중 **흔들리는 길이와 음높이**를 맡는다.
 *   string-vibration      주어 = **흔들리는 길이**. 주장 = 누른 자리부터만 흔들려
 *                         짧아지는 만큼 **더 빨리** 흔들린다 (2/3 → 3/2 배, 1/2 → 두 배)
 *   harmonics             주어 = 진동수 모임. 주장 = 정수배만 남는다
 *   standing-wave         주어 = 반대로 달리는 두 파동. 주장 = 무늬가 흐르기를 멈춘다
 *   air-column-resonance  주어 = 관의 끝. 주장 = 막으면 절반 · 홀수 배만 울린다
 *
 * 이쪽만 「손가락 · 누른다 · 짧아진다 · 옥타브 · 기타」 어휘를 갖는다. 줄은 언제나
 * 가장 단순한 모양 하나로만 흔들리므로 배음 · 정수배 · 모드 · 거름 어휘는 쓰지 않는다.
 * 장력 · 굵기도 화면에 없어 avoidWhen 으로 되돌린다(간극 장부 참조).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const stringVibrationConcept: Aperi21ConceptSource = {
  id: 'string-vibration',
  label: 'Shortening the Sounding Length Raises the Note',
  canonicalSim: 'aperi21:string-vibration',

  surface: {
    definition:
      'Why pressing a string down raises its note: only the part from the pressing point onward swings, and a shorter swinging part goes through its to-and-fro more often in the same time.',
    exemplarKeywords: [
      'why does pressing a guitar string raise the pitch',
      'vibrating length of a string',
      'stopping a string with a finger',
      'half the length is an octave higher',
      'fret positions and pitch',
      'shorter string higher note',
      'two thirds of the length gives a fifth',
      'string length and frequency',
      'sliding a finger up the neck',
      'the nut the fret and the bridge',
      'the shorter it is the faster it vibrates',
    ],
  },

  briefing: {
    observable: [
      'A string is stretched between two small blocks, one at the left and one at the right, and it swings as a single arch from end to end.',
      'A finger comes in and presses the string down, then slides to a marked place two thirds of the way along, waits there, slides on to the middle, waits again, and finally slides back and lifts off.',
      'Wherever the finger is, the stretch to its left lies flat and only the stretch from the finger to the right-hand block swings, always as a single arch and never as anything more elaborate.',
      'A measuring line under the string spans exactly the part that is swinging. While the finger rests on a marked place, that line carries a name for how much of the whole it is — the whole, two thirds of it, half of it — and while the finger slides, the line has no name on it.',
      'Lower down, a window holds the to-and-fro of one point of the swinging part, drawn over a span of time that never changes. Over that same span a second, fainter trace runs alongside: it is what the unpressed string does, kept there for comparison.',
      'While the finger rests, the solid trace goes through two, then three, then four swings across that window while the faint one always goes through two, and the right-hand end of the window names the rate as a multiple of the unpressed one.',
      'While the finger slides, the swinging visibly quickens as the measured span shortens, and the naming disappears for that stretch.',
      'The arch keeps the same height however short the swinging part becomes, so nothing but its length and its quickness is changing.',
      'A line of text below says what is happening — the open string, the finger sliding, the shortened part sounding, the half length being an octave above.',
    ],

    screen: {
      affordances: [
        'The finger travels to its marked places and back on its own, over and over; nothing is pressed. The places are fixed ones so that the same comparison comes round each time.',
        'The comparison trace of the unpressed string is left running the whole time, so the count is made inside one picture rather than against a memory of an earlier one.',
        'Names appear only where the finger is resting on a marked place, because only there is the fraction an exact one; in between, the spans are shown by length alone.',
        'The string and its record are drawn in one ink, since they are the same movement; the frets, the blocks, the measuring line and the comparison trace are all held back, and no accent colour is spent anywhere.',
        'Nothing is given in cycles per second and no note is named; the writing is fractions of a length and multiples of a rate.',
        'The finger is drawn only while it is pressing, so the unpressed string is genuinely unpressed.',
        'On arriving, the open string is already swinging and the window is already full.',
      ],
    },

    useWhen: [
      'The article has said that halving the sounding length doubles the rate, and the reader has taken it as arithmetic. Seeing the same window fill with four swings where it held two, while the measured span is visibly half, is what makes it an observation.',
      'What is being explained is what a player actually does to change a note, and a case is wanted where the change of length and the change of quickness happen in the same gesture.',
    ],

    avoidWhen: [
      'The point is that a string accepts a ladder of rates, or that several shapes can live on it at once. Only the simplest arch is ever on this string.',
      'The article turns on tightening a string or choosing a thicker one. Nothing here is tightened or exchanged; the only thing altered is where the string is pressed.',
      'The subject is a pipe or a column of air rather than a string, or ends that are open rather than held.',
      'Figures are wanted — a rate in cycles per second, a note name, a length in centimetres. Everything written here is a ratio.',
      'The article is about what makes a pattern stand still on a string in the first place, or about the places in it that do not move. No still places are marked here.',
      'The reader is meant to hear the pitch change. Nothing sounds; the change is shown by how many swings fill the window.',
    ],

    contrastWith: [
      {
        concept: 'harmonics',
        note: 'One holds the shape at its simplest and shortens the length to raise the rate; the other holds the length and sweeps the rate to find which shapes the ends will admit.',
      },
      {
        concept: 'standing-wave',
        note: 'One is about what sets the rate of a bounded string; the other is about why a pattern on a string can stop travelling at all.',
      },
      {
        concept: 'air-column-resonance',
        note: 'Both change a pitch by changing what is sounding, but one shortens the swinging part of a string while the other leaves the size alone and changes what the ends are.',
      },
      {
        concept: 'simple-harmonic-motion',
        note: 'One is about what fixes the rate of a to-and-fro for a stretched string; the other is about the shape in time that any such to-and-fro traces out.',
      },
    ],
  },
};
