/**
 * magnetic-field 개념 선언.
 *
 * 자기장 넷 가운데 이쪽은 **무늬가 드러나는 일**이다 — 아무도 선을 긋지 않았는데
 * 쇳가루가 **제자리에서 돌기만 해서** 모양이 나온다.
 *   magnetic-field        **드러남** — 흩어진 가루가 돌아서서 모양을 이룬다 (세기 = 정돈된 정도)
 *   magnetic-field-lines  **끝이 있는가** — 한 가닥을 따라가 자석 속을 지나 닫힌다
 *   field-of-straight-wire **전류가 만든다** — 끄고 뒤집을 수 있고 감긴다
 *   biot-savart-law       **어디서 오는가** — 조각마다의 몫을 이어 더한다
 * 이미 선언된 `field-lines`(전기장 그림 규약)와도 갈랐다 — 저쪽은 사람이 그은 선의
 * 규약이 참인가, 이쪽은 선이 아예 없고 가루 무리가 모양을 낸다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const magneticFieldConcept: Aperi21ConceptSource = {
  id: 'magnetic-field',
  label: 'Field Revealed by Iron Filings',
  canonicalSim: 'aperi21:magnetic-field',

  surface: {
    definition:
      'The pattern a magnet imposes on scattered iron filings, which turn on the spot without travelling until they lie along the field, coming round sooner and straighter the nearer a pole they happen to lie.',
    exemplarKeywords: [
      'iron filings around a bar magnet',
      'sprinkling filings on paper over a magnet',
      'what does a magnetic field look like',
      'mapping the field of a magnet',
      'why do the filings line up',
      'the pattern is tightest near the poles',
      'field of a bar magnet',
      'making an invisible field visible',
      'classroom demonstration with a magnet under paper',
      'filings turn rather than travel',
    ],
  },

  briefing: {
    observable: [
      'A sheet is covered with a couple of thousand short strokes, each lying whichever way it happened to land.',
      'A bar magnet, drawn as an outline in two halves with a letter on each half, comes down in the middle of the sheet.',
      'Strokes close beside either end swing round almost at once, taking the direction running out of that end.',
      'The ordering then spreads outward, and the curves that run from one end round to the other appear a region at a time.',
      'The corners furthest from the magnet are still disordered seconds later, so the sheet is never uniformly tidy.',
      'Every stroke stays exactly where it was scattered, and the stroke lengths vary a little from one another, so it reads as filings rather than as a row of needles.',
      'No stroke carries a head, so the pattern has a shape without having a way round it.',
      'Nothing is drawn for the field beforehand, so the whole pattern is made by the strokes alone.',
      'The sheet is swept clear and scattered again in exactly the same scatter, and the whole thing happens once more.',
      'The magnet is the only thing in the accent colour, and nothing is written but the letter on each of its halves.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the filings are scattered, the magnet is laid down, the pattern spreads outward, the sheet is swept clear and it begins again.',
        'How strong the field is at a place shows in how quickly and how straight the filings there come into line, and is never written as a figure.',
        'The two ends of the magnet are told apart by their letters alone, with no red and blue.',
        'No filings are scattered where the magnet is going to sit, so none of them ends up lying on top of it.',
        'The filings only turn, and nothing is dragged toward an end, so what makes the pattern is direction and not gathering.',
        'The same scatter is used each time round, so what changes between one run and the next is nothing at all.',
      ],
    },

    useWhen: [
      'The article says a magnet has a field around it and the reader has no way to picture something invisible. A few thousand pieces that each answer for their own spot, with no line drawn in advance, is what lets the shape be found rather than shown.',
      'The prose needs the reader to notice that the field is stronger near the ends without a figure being quoted, since the nearest filings are the ones that come round first and end up straightest.',
    ],

    avoidWhen: [
      'The article is about which way the field points, or about a field running from one named end to the other. The filings carry no heads and the pattern reads the same either way round.',
      'The subject is whether the lines close on themselves, or what happens inside the magnet. Nothing is drawn inside the magnet and no single line is ever followed.',
      'The field being discussed is made by a current. What lays this pattern is a bar magnet that is simply there.',
      'A strength is wanted in numbers, or two places are to be compared by how much. Nothing on the sheet carries a quantity.',
      'The article describes filings being dragged toward the ends and clumping into whiskers. Each filing here stays exactly where it fell.',
      'The reader is meant to move the magnet or try an arrangement of their own. One magnet is laid in the middle and the run repeats unchanged.',
    ],

    contrastWith: [
      {
        concept: 'magnetic-field-lines',
        note: 'One is about a shape emerging where nothing was drawn, and never goes inside the magnet; the other takes a single line as given and asks whether it ever ends, which is answered inside the magnet.',
      },
      {
        concept: 'field-lines',
        note: 'One has no lines at all and lets a crowd of separate pieces make the pattern; the other begins from drawn lines and asks whether their crowding may be trusted.',
      },
      {
        concept: 'field-of-straight-wire',
        note: 'One has a field that is simply present, so the only question is what shape it has; the other has one that can be switched off and run the other way, which is how it is known to have been made by the current.',
      },
      {
        concept: 'biot-savart-law',
        note: 'One takes the whole pattern as found and asks nothing about where it came from; the other takes the field at a single place apart into the contributions that were added to make it.',
      },
    ],
  },
};
