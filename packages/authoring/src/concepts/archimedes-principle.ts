/**
 * archimedes-principle 개념 선언.
 *
 * 부력 넷 중 **크기**를 맡는다 — 밀려난 물의 무게와 같다. 원인(면 사이 압력 차)은
 * `buoyancy`, 힘으로서의 부력(용수철 · 잠긴 부피)은 `buoyant-force-as-force`,
 * 뜨는 깊이는 `floating-and-draft` 의 몫이다. 이쪽만 넘침 그릇 · 넘친 물 · 두 저울 ·
 * 부채꼴 · 잃은 만큼 얻는다 어휘를 갖는다.
 *
 * 주제 desc 의 「뜨고 가라앉는 조건」 은 화면이 하지 않는다(물체를 손으로 끝까지
 * 담근다). avoidWhen 으로 되돌리고 간극 장부에 남겼다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const archimedesPrincipleConcept: Aperi21ConceptSource = {
  id: 'archimedes-principle',
  label: 'Archimedes’ Principle — the Size of the Upward Push',
  canonicalSim: 'aperi21:archimedes-principle',

  surface: {
    definition:
      'That the upward push on a body put into a fluid equals the weight of the fluid it has displaced, so what the body loses in weight the overflow gains exactly.',
    exemplarKeywords: [
      'Archimedes principle',
      'the weight of the displaced fluid',
      'eureka',
      'the overflow can experiment',
      'the water that spills weighs what the object loses',
      'the displacement method',
      'the crown of Syracuse',
      'why is the upthrust exactly that much',
      'catching the overflow in a cup',
      'apparent loss of weight equals the water pushed out',
    ],
  },

  briefing: {
    observable: [
      'An overflow can is filled right up to its spout, and a written line says so, so that there is no room left for the level to rise.',
      'A block is lowered into it, and every part of the block that goes under sends that much water out over the spout into a waiting cup.',
      'The stream arcs across with drops travelling along it, and its thickness follows how fast the block is going in — when the block stops, the water stops.',
      'The level in the cup climbs by exactly what the volume put in demands, so the rise is not a gesture.',
      'Two identical dial scales hang side by side on one range, the left one carrying the block and the right one carrying the cup.',
      'The left needle turns one way and the right needle the other, through the same angle at every instant.',
      'On each dial a sector opens from where its needle began to where it is now, and the two sectors are congruent at every moment, not only at the end.',
      'Beneath the sectors two figures appear with the same size and opposite signs.',
      'An arrow above the block, for the upward push, grows to match the weight of the water that has left.',
      'A written line names the claim: the weight lost is the weight of the water that went out.',
    ],

    screen: {
      affordances: [
        'The lowering runs by itself from the moment the scene opens and carries the block all the way under, so the whole comparison happens with nothing pressed.',
        'A slider then takes the block to any depth, forward or back, so the equality can be checked where the reader chooses rather than only at the end; taking hold of it stops the automatic run.',
        'Dragging backwards moves the two needles back but draws no stream, since water does not run back up a spout.',
        'The two dials share one range and one face, so the mirroring of the needles is a comparison of angles rather than of figures.',
        'The can is brim-full on purpose, which is why what goes in has to come out rather than raise the level.',
      ],
    },

    useWhen: [
      'The article states the principle as an equality and the reader has no reason to think it exact rather than roughly so. Two congruent sectors opening in opposite directions at every instant is what makes exactness something to look at.',
      'The reader grants the equality at full submersion but doubts it halfway, and the slider stops the scene anywhere so the two dials can be read against each other there.',
    ],

    avoidWhen: [
      'The question is why there is an upward push at all. Nothing here takes the body apart or looks at what the water does to its several faces.',
      'The article is about floating and sinking, or about how deep a floating body comes to rest. This block is carried under by hand and is never released.',
      'The point is that the push stops growing once the body is wholly under, or that further depth makes no difference. The run ends at full submersion and goes no deeper.',
      'The fluid is air and the body is a balloon, or the fluid displaced is a gas.',
      'Figures are wanted in other terms — litres against kilograms, or a density worked out from two readings. Both dials are in the same force units and the only numbers are their readings.',
      'The vessel in the article is not full and the point is the level rising as the body goes in. This can is brim-full on purpose and its level never moves.',
    ],

    contrastWith: [
      {
        concept: 'buoyancy',
        note: 'One says how large the upward push is by weighing what was put out of the way; the other says why there is one at all, out of a disagreement between two faces.',
      },
      {
        concept: 'buoyant-force-as-force',
        note: 'One weighs the fluid that has left and matches it against what the body has lost; the other never looks at the fluid that left and follows only how much of the body is under.',
      },
      {
        concept: 'floating-and-draft',
        note: 'One carries a body all the way under and asks how large the push is; the other lets bodies go and asks how far under each settles for the push to match its weight.',
      },
      {
        concept: 'apparent-weight',
        note: 'Both have a reading that falls below the usual figure, but one is a body in a fluid that is carrying part of its weight, and the other is a ride whose speed is changing while nothing carries anything.',
      },
    ],
  },
};
