/**
 * magnetic-field-lines 개념 선언.
 *
 * 자기장 넷 가운데 이쪽은 **끝이 있는가**를 묻는다 — 한 가닥을 따라가 자석 속을 지나
 * 제자리로 돌아오고, 잘라도 반쪽마다 닫힌다.
 *   magnetic-field-lines  **닫힌다** — 자석 속 구간이 주장의 절반이다
 *   magnetic-field        **드러남** — 자석 바깥, 선 없이 가루가 모양을 낸다
 *   field-of-straight-wire 전류가 만든 장, 끄고 뒤집는다
 *   biot-savart-law       한 점의 장이 조각들의 합이다
 * 이미 선언된 `field-lines`(전기력선)와도 갈랐다 — 저쪽은 **촘촘함 = 세기**라는 규약의
 * 참·거짓이고 선이 전하에서 나고 든다. 이쪽은 세기를 아예 말하지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const magneticFieldLinesConcept: Aperi21ConceptSource = {
  id: 'magnetic-field-lines',
  label: 'Lines That Close on Themselves',
  canonicalSim: 'aperi21:magnetic-field-lines',

  surface: {
    definition:
      'That a magnetic line has no end: it runs round the outside from one pole to the other and back up through the body of the magnet, and closes the same way around each half of a magnet that has been cut in two.',
    exemplarKeywords: [
      'magnetic field lines form closed loops',
      'field lines inside a magnet',
      'do magnetic lines have a beginning and an end',
      'cutting a bar magnet in half',
      'why you cannot get a single magnetic pole',
      'no magnetic monopole',
      'outside from north to south and inside from south to north',
      'magnetic lines never stop in mid-air',
      'breaking a magnet gives two magnets',
      'closed loop of magnetic flux',
    ],
  },

  briefing: {
    observable: [
      'A bar magnet stands upright with a letter at its top and another at its bottom, its face drawn faintly enough that whatever passes behind it still shows through.',
      'A dozen lines loop down either side of it, and not one of them stops in mid-air.',
      'A mark set at the top corner travels down the outside of one side and enters the bottom of the magnet, leaving a coloured trail behind it.',
      'Rather than stopping there it carries on upward through the faint face of the magnet, and the trail is seen inside.',
      'It arrives back at the corner it set out from and the trail is a ring with no break anywhere in it.',
      'Small chevrons sit on every line, one on the outside stretch and one on the stretch inside the magnet, and the two point opposite ways along the line.',
      'A dashed line is then drawn across the middle of the magnet and the two halves draw apart.',
      'As the gap opens a new letter appears on each newly exposed face, and the lines rearrange into loops going round one half, loops bridging the gap, and loops enclosing both halves at once.',
      'The mark sets out again from the new face of the lower half, goes round the outside, in at the other end of that half and up through it, closing a ring around that half alone.',
      'The halves come back together, the new letters and the trail go, and it begins again.',
      'Nothing is written anywhere but the letters at the poles, and lines lie closer together near the magnet without anything being claimed about that.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the line is traced, the magnet is cut, the halves are drawn apart and pushed back together, and the run repeats.',
        'Only one line is traced at a time, so the closing belongs to a single line rather than to the picture as a whole.',
        'The face of the magnet is drawn under the lines rather than over them, because the stretch that passes inside is half of what is being shown.',
        'The letters at the poles sit in the middle of the magnet with no backing patch behind them, so no line appears to be broken by a label.',
        'Lines that would have to leave the picture before closing are left out, so no line is cut off at the edge and read as a line with an end.',
        'The two halves are drawn as a single outline while they are joined, so no seam is visible before the cut is made.',
        'The chevrons on the lines sit at slightly different places from one line to the next, so that inside the magnet, where the lines run close, they do not gather into one clump.',
      ],
    },

    useWhen: [
      'The article has said that magnetic lines are closed while electric ones begin and end on charges, and the reader has only the word closed to go on. A single mark that goes in at one pole and comes out of the other from inside is where the word is earned.',
      'The prose is about why breaking a magnet gives two magnets rather than a loose pole, and halves drawing apart with fresh poles on the cut faces settles it without an argument.',
    ],

    avoidWhen: [
      'The article is about how strong the field is, or about spacing standing for strength. Only whether a line closes is at issue here.',
      'The subject is the pattern iron filings make, or how the shape of a field can be found at all. These lines are drawn from the start and nothing discovers them.',
      'The field being discussed is made by a current rather than by a permanent magnet.',
      'A figure is wanted, or the lines are to be counted. Nothing here carries a quantity.',
      'The reader is meant to cut the magnet or move the halves. The cut and the separation happen on their own.',
      'The article is about a compass, or about which way a needle would swing. Nothing in this picture responds to the field.',
    ],

    contrastWith: [
      {
        concept: 'magnetic-field',
        note: 'One asks whether a line has an end, which is why the inside of the magnet is where it is settled; the other never goes inside and is about a shape appearing outside, among pieces that nobody arranged.',
      },
      {
        concept: 'field-lines',
        note: 'One is about whether a line closes; the other is about whether spacing may be read as strength, and its lines begin and end on charges instead of closing.',
      },
      {
        concept: 'gausss-law',
        note: 'One has every line closing, so as much comes into any boundary as goes out of it; the other counts a net crossing that is not nothing, because a charge can sit alone inside.',
      },
      {
        concept: 'field-of-dipole',
        note: 'One takes a pair of opposite poles that cannot be prised apart, since cutting only makes further pairs; the other takes a pair of opposite charges that exist perfectly well on their own.',
      },
    ],
  },
};
