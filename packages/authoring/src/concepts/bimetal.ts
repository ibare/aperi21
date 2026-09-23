/**
 * bimetal 개념 선언.
 *
 * 늘어남 둘 중 하나. 이웃은 `thermal-expansion` 이다.
 *   thermal-expansion  한 금속의 **길이** — 늘어난 끝이 이웃과의 틈을 메운다
 *   bimetal            두 금속의 **늘어남 차** — 붙어 있어 갈 곳이 없으니 휜다
 * 이쪽만 휨 · 볼록한 바깥 · 오목한 안쪽 · 방향이 뒤집힘 · 두 금속 이름 어휘를 갖는다.
 * 틈 · 이음매 · 밀려 나온 끝은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const bimetalConcept: Aperi21ConceptSource = {
  id: 'bimetal',
  label: 'Bimetallic Strip Bending Both Ways',
  canonicalSim: 'aperi21:bimetal',

  surface: {
    definition:
      'Two metals bonded along their length cannot grow apart, so heating curls the strip with the faster-growing metal on the outside and cooling curls it the other way.',
    exemplarKeywords: [
      'bimetallic strip',
      'why does a strip of two metals bend when heated',
      'brass and steel stuck together',
      'thermostat strip',
      'which way does it curl',
      'the strip bends back the other way when cold',
      'two metals expand by different amounts',
      'a bend made out of a difference',
      'coiled strip in an old thermometer',
      'metals with different expansion rates joined',
    ],
  },

  briefing: {
    observable: [
      'A flat strip is held at its left end by a clamp; the upper layer is hatched and named as brass, the lower is filled and named as steel.',
      'At room temperature the strip lies straight and covers a dotted line drawn along where straight is, so the line is hidden.',
      'As the thermometer fills upward the strip leaves the dotted line and curls downward, putting the hatched brass on the convex outside and the steel on the concave inside; the dotted line is left showing above it.',
      'Cooling back to room temperature straightens it again onto the dotted line.',
      'Carried below room temperature the strip curls the opposite way, upward, and now the brass is on the concave inside and the steel on the convex outside.',
      'The clamped end barely moves at either extreme; the far end is where the travel is, and the names stay legible near the clamp.',
      'A note says the amount of curl is drawn four times larger than it really is.',
      'The thermometer is one single filled height with marks only at the three temperatures the round visits — no separate colour for hot and cold.',
    ],

    screen: {
      affordances: [
        'One round runs warm, back to straight, cold, and back again, and repeats; nothing has to be pressed.',
        'The cold half of the round is what makes the claim a claim rather than an observation, because it is where the bend reverses instead of merely shrinking.',
        'The two layers are told apart by their names and by one of them being hatched, not by being given different colours.',
        'The dotted straight line stays in the picture at every temperature, so the bend is always read against where straight would have been.',
        'The magnification of the curl is stated on the picture, since a real strip of this length bends by only a few degrees.',
      ],
    },

    useWhen: [
      'The article has said that different metals grow by different amounts and the reader cannot see how that becomes motion. The strip leaving the dotted line is where a difference in growth turns into something that moves.',
      'The reader has the rule as “the one that expands more goes on the outside” and takes it as a fact about brass, and the cold half — where brass is on the inside — is what shows the rule is about which is growing more, not about which metal it is.',
    ],

    avoidWhen: [
      'The article is about a single material simply getting longer, or about room being left for it to grow. One strip of one metal would do nothing here.',
      'The strip is to be shown making or breaking a contact, or a thermostat is to be shown switching. Nothing here touches anything; the strip only curls.',
      'The true angle matters, or the strip is to be shown coiled into a spiral. The bend drawn is enlarged, and the strip is a straight cantilever.',
      'A curvature formula or the two coefficients are to be quoted. No numbers appear but the three temperatures and the magnification.',
      'The point is how tightly the two layers grip one another, or whether a joined pair could peel apart. The bond is never in question here.',
    ],

    contrastWith: [
      {
        concept: 'thermal-expansion',
        note: 'One asks what a single material does when nothing stops it growing; the other asks what two of them do when each stops the other, and finds the answer is a bend rather than a length.',
      },
    ],
  },
};
