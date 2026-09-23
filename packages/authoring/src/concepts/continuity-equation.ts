/**
 * continuity-equation 개념 선언.
 *
 * 「좁아지면 빨라진다」 를 말하는 셋 중 하나. **주어와 주장**으로 갈랐다.
 *   continuity-equation   **지나가는 양** — 어느 단면에서나 같은 양이 지난다, 그래서 빨라진다
 *   bernoullis-principle  **압력** — 빨라진 만큼 압력이 내려간다, 둘의 합이 일정하다
 *   venturi-effect        **장치** — 목의 낮은 압력이 통의 액체를 끌어올려 뿜는다
 * 이쪽만 「같은 양 · 단면적 · 칸 세기 · 부피 유량」 어휘를 갖는다. 압력 · 파스칼 · 분무기 ·
 * 빨아올림은 쓰지 않는다. 벽에서 0 인 속도 분포는 `poiseuille-flow` 의 몫이라 avoidWhen 으로 되돌린다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const continuityEquationConcept: Aperi21ConceptSource = {
  id: 'continuity-equation',
  label: 'Equal Volume Through Every Cross-Section',
  canonicalSim: 'aperi21:continuity-equation',

  surface: {
    definition:
      'That a stream carries the same volume past every cross-section of its channel in a given time, so where the passage is half as wide the fluid must travel twice as fast.',
    exemplarKeywords: [
      'continuity equation',
      'A1v1 = A2v2',
      'the same amount of water per second all along a pipe',
      'why does water speed up where the pipe narrows',
      'putting a thumb over the end of a hose',
      'volume flow rate',
      'a river runs fast where its bed narrows',
      'nothing piles up and nothing is lost along the way',
      'half the width means twice the speed',
      'flow through a pipe that changes thickness',
    ],
  },

  briefing: {
    observable: [
      'A pipe seen from the side runs wide from the left, tapers over a short stretch to half its thickness, and carries on narrow. A dashed gate stands across the wide part and another across the narrow part, with `A` written under the first and `A/2` under the second.',
      'The water is full of small dots drifting with it. Where the pipe is narrow the columns of dots stand twice as far apart and the rows half as close, so one dot still answers for the same patch of water; each dot trails a tail, and the narrow tails are twice as long.',
      'For a spell both gates paint the water that goes through them. The wide gate’s paint grows short and thick; the narrow gate’s paint grows twice as fast, thin and long.',
      'When the painting stops, dividing lines rise on both slugs: the wide one is cut across into two squares stacked one on the other, the narrow one cut lengthwise into two squares set side by side. The four squares are the same size, so it is two against two.',
      'Dimension marks over the two slugs read `ℓ` and `2ℓ`.',
      'The painted water keeps drifting downstream all the while the comparison stands — nothing is held still, and the slugs are placed so they never reach the taper.',
      'No value appears anywhere: the whole of the writing is `A`, `A/2`, `ℓ`, `2ℓ` and the caption line under the picture.',
    ],

    screen: {
      affordances: [
        'One round runs on its own and repeats — plain flowing, painting, the dividing lines rising, the comparison, then a fade into the next round.',
        'Arriving readers land in a pipe already flowing, with the dots spread through it.',
        'Nothing is offered to press or drag. The narrowing is fixed at exactly one half, which is what the writing `A/2` and `2ℓ` and the caption’s "twice" all rest on.',
        'The check is made by counting squares rather than reading numbers, which is why no grid, no scale and no camera are drawn.',
        'The dots earn their place before the painting begins: their spacing and tail length already say "faster here", so the painted slugs only have to add "and the same amount".',
      ],
    },

    useWhen: [
      'The article has said that a narrowing pipe speeds the flow, and the reader has taken it as a formula rearranged rather than a fact about amounts. Painting the same two seconds at both gates and cutting each slug into the same two squares is what turns the constancy into something counted.',
    ],

    avoidWhen: [
      'The claim to be carried is about pressure — that it falls where the fluid runs fast, or that speed and pressure are traded. Nothing here is pressed, weighed or read as a pressure, and the picture would be borrowed for a claim it never makes.',
      'The article is about a device that uses a throat to draw something up — a sprayer, an atomiser, a carburettor. This pipe carries only its own water.',
      'The fluid in question is compressible, or the point is gas being squeezed into a smaller space. Every dot here answers for the same patch of water everywhere, which is exactly the assumption being drawn.',
      'The article works with a general ratio of areas, or with several ratios in turn. This pipe narrows by one half and every symbol written on it says so.',
      'The subject is how the speed varies across the pipe, quick along the axis and nothing at the wall. Every dot in a cross-section here travels alike.',
      'Values are wanted — litres per second, metres per second, a cross-sectional area. There is not a number in the picture.',
    ],

    contrastWith: [
      {
        concept: 'bernoullis-principle',
        note: 'One says how fast the fluid has to run for the same amount to get through a narrower place; the other says what that speeding up costs, which is pressure.',
      },
      {
        concept: 'venturi-effect',
        note: 'One is the rule about what passes a cross-section; the other is a machine built on the consequence of that rule, where a throat is set to work lifting liquid out of a vessel.',
      },
      {
        concept: 'poiseuille-flow',
        note: 'One holds the speed the same all across a cross-section and asks what changing the width does to it; the other lets the speed vary from axis to wall and asks how much the pipe delivers altogether.',
      },
      {
        concept: 'torricellis-law',
        note: 'One is about a stream that must keep going and therefore quickens; the other is about liquid leaving a vessel at a speed that depth alone decides.',
      },
    ],
  },
};
