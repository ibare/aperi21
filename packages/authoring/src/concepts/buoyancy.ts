/**
 * buoyancy 개념 선언.
 *
 * 부력 넷 중 하나. 넷이 전부 「부력」 이라 **무엇을 묻는가**로 갈랐다.
 *   buoyancy                 **원인** — 아랫면이 윗면보다 깊어 더 세게 밀린다, 그 차이다
 *   archimedes-principle     **크기** — 밀려난 물의 무게와 같다 (넘침 그릇 · 두 저울)
 *   buoyant-force-as-force   **힘으로서** — 잠긴 부피가 정한다 (용수철 · 무게)
 *   floating-and-draft       **결과** — 뜬 물체가 멈추는 깊이는 밀도 비다
 * 이쪽만 면마다 미는 힘 · 옆면이 지워짐 · 두 막대 · 차이가 그대로 어휘를 갖는다.
 * 밀려난 물 · 무게 · 저울 · 용수철 · 뜬다는 말은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const buoyancyConcept: Aperi21ConceptSource = {
  id: 'buoyancy',
  label: 'Buoyancy as a Difference Between Two Faces',
  canonicalSim: 'aperi21:buoyancy',

  surface: {
    definition:
      'The upward push a fluid gives a body as what is left over when the harder press on its lower face is set against the weaker press on its upper one.',
    exemplarKeywords: [
      'where does buoyancy come from',
      'why does water push things up',
      'the push on the bottom face is greater than on the top',
      'the origin of upthrust',
      'a net upward push out of a pressure difference',
      'does the upward push grow as you go deeper',
      'the sideways pushes cancel out',
      'the water squeezes a submerged block from every side',
      'the difference between the pushes on two faces',
      'why should there be an upward force at all',
    ],
  },

  briefing: {
    observable: [
      'A block is lowered into a tank, with arrows on each of its faces showing how hard the water presses there; every arrow’s length is the depth at that spot.',
      'The arrows on the two sides face inward at one another and match pair for pair, so they plainly cancel; they are drawn faintly, being what the claim discards.',
      'The arrows on the top point down and those on the bottom point up, and the bottom ones are always the longer.',
      'Two bars stand on the floor beside the tank, one for the push on the top face and one for the push on the bottom. The bottom bar is split — the part it shares with the top bar in ink, and the part it has over and above it in the accent colour.',
      'A dotted line runs across from the head of the top bar to mark where the shared part ends.',
      'An arrow in the accent colour rises from the middle of the block, drawn to the same scale and exactly as long as the accent part of the bar, and the name of the upward push is written beside that part.',
      'While the block is still going in, only its lower face is wet, so the whole of the bottom bar is accent-coloured and grows with how much has gone under.',
      'Once the block is wholly under and goes on descending, every face arrow lengthens and both bars grow — and the accent part and the arrow on the block do not move at all.',
      'No numbers appear anywhere, and there is no depth scale on the tank.',
    ],

    screen: {
      affordances: [
        'One round carries the block from above the surface, through going in, to a long descent well below, and the descent is the part that does the work, because that is where everything grows but the difference.',
        'The claim is checked against two lengths that have to stay equal — the accent part of the bar and the arrow on the block — which are drawn to one scale for exactly that.',
        'The accent colour is spent on a single meaning, the extra push on the lower face, so the bar and the arrow are visibly one quantity shown in two places.',
        'The bars stand on the tank floor rather than hanging from the surface, so they read as amounts of push and not as a ruler for depth.',
      ],
    },

    useWhen: [
      'The article has asserted that a fluid pushes bodies up and the reader wants to know why it should, given that the water presses inward from every side. The side arrows cancelling while the two face arrows disagree is the answer.',
      'The reader expects that going deeper buys more lift, and the moment wanted is the one where every arrow on the block is lengthening while the accent part of the bar holds still.',
    ],

    avoidWhen: [
      'The size of the upward push is at stake, or its tie to the fluid the body has put out of the way. Nothing here is weighed, spilled or collected.',
      'The article is about whether the body floats or sinks, or about how deep it comes to rest. The block never floats, never settles, and has no weight drawn on it.',
      'The point is how much lighter a body feels when held in water. There is no spring, no hand and no scale in the picture.',
      'The subject is pressure growing with depth in its own right. Depth sets the arrow lengths here, but the tank carries no scale and no depth is ever read off it.',
      'An absolute pressure is needed, or the atmosphere’s share of it. That share is left out because it falls on every face alike and cancels out of the difference.',
      'Values are wanted in newtons or pascals. There is not a number anywhere in the picture.',
    ],

    contrastWith: [
      {
        concept: 'archimedes-principle',
        note: 'One says where the upward push comes from — a disagreement between two faces; the other says how big it turns out to be — the weight of the fluid the body has put out of the way.',
      },
      {
        concept: 'buoyant-force-as-force',
        note: 'One takes the body apart into the pushes on its several faces; the other leaves it whole and sets one upward push against its weight and the spring holding it.',
      },
      {
        concept: 'floating-and-draft',
        note: 'One drives a body down regardless of what it weighs and asks what the fluid is doing to it; the other lets bodies go and asks where each of them stops.',
      },
      {
        concept: 'hydrostatic-pressure',
        note: 'One takes the tie between depth and pressure for granted and works only with the difference between two depths; the other is where that tie is itself the claim.',
      },
      {
        concept: 'pressure-isotropy',
        note: 'One turns on faces lying at different depths, where the opposed side faces cancel and only the disagreement between top and bottom is left over; the other stays at one place and turns a surface there, finding the strength of the push unaltered by which way it faces.',
      },
    ],
  },
};
