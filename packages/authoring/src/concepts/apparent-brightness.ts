/**
 * apparent-brightness 개념 선언.
 *
 * 밝기 넷 중 하나. 넷이 모두 「멀면 어둡다」 로 수렴할 수 있어 **무엇을 주장하는지**로 갈랐다.
 *   apparent-brightness  한 별을 **거리마다** 보았을 때 한 조각이 받는 몫 — 36 · 9 · 4 로 세어진다
 *   inverse-square-law   **왜 제곱인가** — 별이 없다. 퍼지는 것이 구면의 넓이라서다
 *   magnitude-scale      **수를 매기는 방식** — 거리가 없다. 한 칸마다 같은 비로 나뉜다
 *   stellar-luminosity   **거꾸로 되짚기** — 같아 보이는 두 별의 실제 빛의 양
 * 이쪽만 칸 · 세기 · 「네 배 옅다」 어휘를 갖는다. 구면 · 넓이 · 제곱이라는 말과 등급 ·
 * 광도라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const apparentBrightnessConcept: Aperi21ConceptSource = {
  id: 'apparent-brightness',
  label: 'Apparent Brightness at Different Distances',
  canonicalSim: 'aperi21:apparent-brightness',

  surface: {
    definition:
      'The dimming of one unchanged star with range, its emission shared among four equal patches at double the remove and among nine at triple.',
    exemplarKeywords: [
      'apparent brightness',
      'why distant stars look faint',
      'the same star seen from farther away',
      'brightness falls off with distance',
      'twice as far, four times fainter',
      'a streetlamp looks dim from down the road',
      'how bright a star appears to us',
      'the light is spread thinner farther out',
      'near star and far star of the same kind',
      'brightness we receive versus how far it is',
    ],
  },

  briefing: {
    observable: [
      'A star sits at the left and lets go of a packet of thirty-six grains of light, which travels to the right across the picture.',
      'Three square frames stand in its path at one, two and three times the same spacing, each frame the same physical size but ruled into one, four and nine cells.',
      'When the packet passes a frame the grains land in its cells and can be counted: thirty-six in the single cell, nine in each of the four, four in each of the nine.',
      'A tag beside each frame names it as the reference distance, twice as far, three times as far, and a second tag states how many grains one cell holds.',
      'Each cell is filled with light rather than with a shade of paint, so the far frame really is a ninth as luminous as the near one and the near one is four times the middle.',
      'The outline of a frame flares and then dies away in the moment the packet crosses it, and a ring widens outward from the frame at the same instant.',
      'The frames stay lit after the packet has gone by, so the three amounts of light stand side by side in one picture rather than one after another.',
      'The closing line for each crossing names both the number of cells and the number of grains in one of them.',
      'Packet after packet leaves the star, so at times two of them are in flight at once and the same thirty-six grains are seen both tight and loose in a single view.',
    ],

    screen: {
      affordances: [
        'The packets leave and cross the frames on their own and the cycle repeats; nothing is pressed and nothing is dragged.',
        'A packet is already past the first frame when the picture opens, so all three frames are lit at their own levels from the first moment.',
        'The frames are drawn in one quiet colour and the light in another, so what is structure and what is the thing being measured needs no legend.',
        'The grains are placed so that none of them ever straddles a dividing line, which is why the counts in the tags and the counts on the screen cannot disagree.',
        'Distances are named only as multiples — there is no ruler and no number of metres anywhere.',
      ],
    },

    useWhen: [
      'The reader has been told that a star looks fainter the farther it is and has taken the falling-off as a rule to memorise. Counting thirty-six, then nine, then four grains in one cell turns the rule into something arrived at.',
      'A comparison between a near star and a far one is being set up, and the writer needs a picture where the star itself is held fixed so that only the viewing range is doing the work.',
    ],

    avoidWhen: [
      'The point is why the falling-off goes as the square rather than plainly with range. Nothing here opens out into a sphere; the frames are flat and the counting is done in cells.',
      'The article is about the number astronomers write down for brightness, or about a step on a scale of such numbers. No numbering appears here at all.',
      'The question is how much light the star itself puts out, or how two stars of different output can look alike. There is only one star here and it never changes.',
      'Colour, temperature or the kind of star is at issue. The light is a single warm tone throughout and nothing about the star varies.',
      'A distance in light years or parsecs has to be quoted, or the reader must be able to try a distance of their own. Only the multiples one, two and three exist.',
      'The subject is a lamp or sound heard at a distance and a household example is wanted. What is drawn is a star and the light leaving it.',
    ],

    contrastWith: [
      {
        concept: 'inverse-square-law',
        note: 'One shows what a fixed patch receives from a star at several ranges; the other shows why that sharing goes as the square at all, with nothing emitting in particular.',
      },
      {
        concept: 'stellar-luminosity',
        note: 'Both hold brightness and range together, in opposite directions — one goes from the star outward to what arrives, the other from what arrives back to what the star must be producing.',
      },
      {
        concept: 'magnitude-scale',
        note: 'One is about the physical cause of a star seeming faint; the other is about the number astronomers write once it seems that way, and range plays no part in it.',
      },
    ],
  },
};
