/**
 * buoyant-force-as-force 개념 선언.
 *
 * 형제는 `drag-force`. 둘 다 유체가 주는 힘이라 definition 이 수렴하기 쉽다.
 * **그 힘을 정하는 것**으로 갈랐다 — 이쪽은 **잠긴 부피**, 저쪽은 **빠르기**.
 * 이쪽만 무게 · 떠받침 · 다 잠김 어휘를 갖고, 속도 어휘는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **한 주기가 저절로 하는 일**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const buoyantForceAsForceConcept: Aperi21ConceptSource = {
  id: 'buoyant-force-as-force',
  label: 'Buoyant Force as a Force',
  canonicalSim: 'aperi21:buoyant-force-as-force',

  surface: {
    definition:
      'The upward push a fluid gives a body placed in it, growing with the part of the body that is under the surface and growing no further once the body is wholly under.',
    exemplarKeywords: [
      'buoyant force',
      'buoyancy as a force',
      'upthrust',
      'does a body lose weight in water',
      'why does something feel lighter under water',
      'weighing an object hung in water on a spring',
      'the water holds up part of the weight',
      'how much of it has to be submerged',
      'going deeper does not push harder',
      'Archimedes upward push of a fluid',
    ],
  },

  briefing: {
    observable: [
      'A block hangs from a spring under a handle, and the handle is lowered into a tank of water and raised again through a round of sixteen seconds.',
      'Three arrows start from inside the block, each with its name written beside it: the weight pointing down on the left, and on the right the push of the water and the pull of the spring laid head to tail pointing up.',
      'The weight arrow is exactly the same length at every depth.',
      'As more of the block goes under, the water arrow grows and the pull of the spring shrinks by that much, and the spring coils draw together.',
      'Once the block is entirely below the surface, the water arrow stops growing however much further down the handle takes it, and the spring stops changing too.',
      'The names are pushed clear of the waterline, so no label ever sits on the surface line where it could be read as belonging to it.',
      'The caption follows the depth in three statements: out of the water the spring holds the whole weight; partly in, the water holds up as much as is submerged; fully under, going deeper changes nothing.',
    ],

    screen: {
      affordances: [
        'One round takes the block through all three states — out, partly in, fully under — and lowering and raising run by themselves; arriving, the block is already more than half under and still going down.',
        'The three arrows are drawn to one scale and joined head to tail, so the two upward ones can be read against the downward one by looking rather than by adding.',
        'The spring is the instrument: how far it is stretched is what says how much of the weight is still being carried by it.',
      ],
    },

    useWhen: [
      'The reader has been told that a body in water gets lighter and is quietly taking that as the weight having changed. Three arrows on one block, with the down arrow fixed and the two up arrows trading length, is what puts the change where it belongs.',
      'The claim is that the push is bought by submerged volume and not by depth, and the moment wanted is the one where the block goes on sinking while the water arrow has stopped growing.',
    ],

    avoidWhen: [
      'The question is whether a body floats or sinks, or how its density compares with the fluid. The block hangs from a spring the whole way through and is never let go.',
      'The article rests on the pressure on the bottom face being greater than on the top, or on the water level rising as the block goes in. Neither is drawn.',
      'The subject is a body travelling through a fluid and what the fluid does to it for moving. The handle moves slowly and nothing about its speed enters the picture.',
      'Forces are wanted in newtons, or a volume in litres. Lengths of arrows are all there is.',
      'The point is how a spring itself behaves — its stiffness, or its bobbing up and down. The spring here never oscillates; it is read only for how far it is drawn out.',
    ],

    contrastWith: [
      {
        concept: 'drag-force',
        note: 'One is a force the fluid gives for being surrounded and which settles once the body is fully in; the other is a force the fluid gives for being passed through, and it has no size at all until the body moves.',
      },
      {
        concept: 'equilibrium-of-forces',
        note: 'One has a body already standing still and asks how three forces on it share out as conditions change; the other asks what it takes for such a set of forces to add to nothing in the first place.',
      },
      {
        concept: 'normal-force',
        note: 'Both hold a body up from what it rests in or on, but one is sized by how much of the body the fluid has closed around, and the other by however much is needed to keep the body from being driven through.',
      },
    ],
  },
};
