/**
 * magnitude-scale 개념 선언.
 *
 * 밝기 넷 중 하나. 이쪽에는 **거리가 없다** — 수를 매기는 방식 하나를 주장한다.
 *   magnitude-scale      한 칸마다 **같은 비**로 나뉘고 다섯 칸이면 딱 100 이다
 *   apparent-brightness  거리가 정하는 **받는 몫**
 *   inverse-square-law   왜 제곱인가 — 구면의 넓이
 *   stellar-luminosity   받은 것에서 **낸 것**을 되짚는다
 *   hr-diagram           밝기를 온도와 **함께 놓아** 무리의 띠를 본다
 * 이쪽만 사다리 · 나눔 · 몫 · 「수가 커질수록 어둡다」 어휘를 갖는다. 거리 · 구면 ·
 * 온도라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const magnitudeScaleConcept: Aperi21ConceptSource = {
  id: 'magnitude-scale',
  label: 'The Magnitude Number as a Multiplying Ladder',
  canonicalSim: 'aperi21:magnitude-scale',

  surface: {
    definition:
      'The astronomical numbering in which every whole step upward divides a brightness by one fixed ratio, five such steps coming out at exactly one hundredth.',
    exemplarKeywords: [
      'stellar magnitude',
      'first magnitude and sixth magnitude',
      'why a bigger number means a dimmer star',
      'each magnitude step is about 2.512',
      'five magnitudes is a factor of a hundred',
      'the magnitude scale is multiplicative, not additive',
      'ranking stars by how bright they look',
      'naked-eye limit is sixth magnitude',
      'Hipparchus ranked the stars',
      'the steps look even but the brightnesses are not',
    ],
  },

  briefing: {
    observable: [
      'Six discs of identical size stand in a row on a dark panel, labelled with the numbers one through six, and each holds less light than the one before it.',
      'The amounts are carried in the light itself rather than in a wash of paint, so the sixth really does hold a hundredth of what the first holds.',
      'To the eye the row reads as an almost even staircase even though the amounts are not evenly spaced, and the closing line names that as the reason the numbering is written this way.',
      'A ring steps along the row one place at a time, and each time it moves a division sign with a fixed ratio lights up in the gap it just crossed — the same ratio appears five times over.',
      'Once the ring has reached the far end, a bracket closes over the first and the sixth together and a division by one hundred rises above it.',
      'On a second panel one bright disc sheds share after share, each share the exact size and light of the sixth disc on the row, and they scatter into a ten by ten grid.',
      'The bright disc grows fainter as its shares leave, and when the last one goes it is gone altogether, with nothing left over.',
      'A running tally below the grid counts the shares that have left, and it reads one hundred at the moment the disc empties.',
      'The shares then travel back in from the outside and the disc lights up again, and the whole sequence starts over.',
      'Every disc on screen is the same size and none of them is given a halo, because a bigger or fuzzier disc would make one share stop meaning one share.',
    ],

    screen: {
      affordances: [
        'The stepping, the bracket, the splitting and the gathering follow one another without being asked for, and then begin again.',
        'The picture opens with the ring already part way along the row and two of the division signs lit, so there is no empty start to sit through.',
        'The ratio written in each gap and the hundred over the bracket are the declared values themselves, not text typed to match them.',
        'The second colour marks the place being compared right now and nothing else; the ratios and bracket are in plain type.',
        'All the light sits on dark panels while the wording sits outside them, so faint amounts stay readable rather than washing out.',
        'Neither the defining formula nor negative numbers appear; the row runs from the first rank to the naked-eye limit and no further.',
      ],
    },

    useWhen: [
      'The reader has met the convention that a larger number means a fainter star and finds it backwards. Seeing the same ratio written five times between six discs is what makes the ordering feel chosen rather than perverse.',
      'The article needs the jump from first rank to sixth to land as a hundredfold, and a picture is wanted in which the hundred is arrived at by dividing rather than asserted.',
    ],

    avoidWhen: [
      'The subject is how far away the stars are or how being farther makes them look fainter. Nothing in this picture is at any range from anything.',
      'The article distinguishes how bright a star looks from how much light it truly gives off. Every disc here is taken at face value and no true output is mentioned.',
      'The defining logarithm, or converting a measured brightness into a rank, is what has to be carried. No formula is written and no conversion is performed.',
      'Stars brighter than the first rank, or objects only a telescope reaches, are at issue. The row stops at both ends of the unaided-eye range.',
      'Colour, spectral type or surface conditions matter. Every disc is the same neutral white so that only amounts are being compared.',
      'The reader needs to plug in two ranks and get a ratio out. The one comparison made is between the ends of this particular row.',
    ],

    contrastWith: [
      {
        concept: 'apparent-brightness',
        note: 'One is a way of writing down how bright something looks; the other is the physical reason it can look that way, which the numbering neither states nor needs.',
      },
      {
        concept: 'stellar-luminosity',
        note: 'One ranks what reaches the eye and stops there; the other refuses to stop there and asks what the object must be producing for that reading to occur.',
      },
      {
        concept: 'hr-diagram',
        note: 'Both put brightness on a ladder of powers, one alone and one against surface conditions, and only the second one lets a population show a shape.',
      },
    ],
  },
};
