/**
 * floating-and-draft 개념 선언.
 *
 * 부력 넷 중 **결과**를 맡는다 — 뜬 물체가 멈추는 깊이, 잠기는 몫 = 물체 밀도 ÷ 물 밀도.
 * 원인은 `buoyancy`, 크기는 `archimedes-principle`, 힘으로서는 `buoyant-force-as-force`.
 * 이쪽만 놓는다 · 멈춘다 · 세 재료 · 밀도 비 · 소금물 · 빙산 어휘를 갖는다. 넘친 물 ·
 * 저울 · 용수철 · 면마다 미는 힘은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const floatingAndDraftConcept: Aperi21ConceptSource = {
  id: 'floating-and-draft',
  label: 'How Deep a Floating Body Settles',
  canonicalSim: 'aperi21:floating-and-draft',

  surface: {
    definition:
      'How far a floating body settles into a fluid: it goes in until the fluid pushed aside weighs as much as it does, making the submerged share its own density divided by the fluid’s.',
    exemplarKeywords: [
      'how deep does a floating object sit',
      'the draft of a ship',
      'why does an iceberg float with most of it under',
      'nine tenths of an iceberg is below',
      'ships ride higher in salt water',
      'the submerged fraction equals the density ratio',
      'cork floats high and ice floats low',
      'floating in the Dead Sea',
      'the Plimsoll line',
      'what decides how much of it goes under',
    ],
  },

  briefing: {
    observable: [
      'Three blocks of one size rest on the surface of a tank and are let go together; being the same size, their weights differ only by their densities, which are written under each one — cork, wood, ice.',
      'On every block two arrows stand at mid-height, offset left and right so their lengths can be read against each other: a dark one pointing down, the weight, whose length never changes; and an accent-coloured one pointing up, the weight of the water pushed aside, which grows as the block goes in.',
      'Each block stops the instant its upward arrow has grown as long as its weight arrow, and the three stop at three different depths — the cork a quarter under, the wood a little past half, the ice nearly all of it.',
      'Only the ice block carries the two written names, having the room for them.',
      'The water then thickens into salt water — it darkens and its written name changes — and all three blocks rise, while the upward arrows stay exactly as long as the weights throughout.',
      'A dotted line stuck to each block, marking how far the clear water had reached up it, comes clear of the new surface, which is how the rising is read.',
      'The submerged part of each block lies under the water’s colour, so how much is under is something to look at rather than to measure.',
      'No percentages and no depths are written; the densities under the blocks and the water’s own label are the only figures.',
    ],

    screen: {
      affordances: [
        'One round covers both halves of the claim with nothing pressed — three densities of body side by side, then two densities of fluid one after the other.',
        'The three blocks are drawn in one colour, so that nothing but the written density tells them apart and the depth each settles at is left to carry the difference.',
        'The two arrows on a block share one scale, so "it stops when these are equal" is a comparison of lengths made on the spot.',
        'The dotted lines carry over from the clear water into the salt water, which is what turns a small rise into something readable.',
      ],
    },

    useWhen: [
      'The article has given the submerged share as a ratio of densities and the reader holds it as arithmetic. Three blocks of one size stopping at a quarter, at half and at nearly all is that ratio laid out as three depths.',
      'The claim that the fluid’s density counts as much as the body’s is at stake, and the moment wanted is the one where the water thickens and all three rise with their weights unchanged.',
    ],

    avoidWhen: [
      'The question is why a fluid pushes up at all, or what about the body settles the size of that push. The upward arrow simply grows with how deep the block has gone and nothing shows where it comes from.',
      'The article needs the fluid that was pushed aside caught or weighed. No water leaves the tank and nothing is put on a scale.',
      'The subject is a body held wholly under, or one that goes to the bottom. All three float and come to rest with part of them showing.',
      'The point is whether a floating body stays upright or tips and rights itself. The blocks never lean.',
      'Percentages or depths are wanted as figures. Only the densities are written and the submerged part is read by eye.',
      'The article is about a body in air, or a balloon that rises.',
      'The bobbing a released body does before it settles is the subject. These go down smoothly and never overshoot.',
    ],

    contrastWith: [
      {
        concept: 'archimedes-principle',
        note: 'One lets bodies go and asks where each stops; the other carries one body all the way under by hand and asks how large the push there is.',
      },
      {
        concept: 'buoyancy',
        note: 'One reports where a released body comes to rest; the other opens the body up and shows the push as a leftover between two of its faces.',
      },
      {
        concept: 'buoyant-force-as-force',
        note: 'One lets bodies go and reports where they stop; the other keeps a body hanging on a spring the whole way and never lets it find its own level.',
      },
      {
        concept: 'equilibrium-of-forces',
        note: 'One is a particular pair of forces coming level at a particular depth; the other is the general condition that the forces on a resting body add up to nothing.',
      },
    ],
  },
};
