/**
 * thermal-conduction 개념 선언.
 *
 * 열 이동 넷 중 하나. 넷 다 「열이 간다」 라 **무엇을 타고 가는가와 무엇이 그것을 정하는가**로
 * 갈랐다.
 *   thermal-conduction   **닿은 물질 자체를 타고** 간다 — 얼마나 멀리 가는지는 재질이 정한다
 *   thermal-convection   **움직이는 유체에 실려** 간다 — 흐름을 멈추면 실려 가지 않는다
 *   thermal-radiation    **아무것도 없는 곳을 건너** 간다 — 막으면 멈춘다
 *   stefan-boltzmann-law 가는 이야기가 아니다 — **얼마나 많이 내보내는가**가 온도로 정해진다
 * 이쪽만 「막대를 타고 번져 나간다 · 머문다 · 구슬이 차례로 떨어진다 · 재질 둘」 어휘를 갖는다.
 * 유체 · 진공 · 물결 · 복사량은 쓰지 않는다.
 *
 * `canonicalSim` 은 주제 id 와 다르다 — `topics.yaml` 의 `sim` 값(`aperi21:heat-conduction`)
 * 을 그대로 쓴다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const thermalConductionConcept: Aperi21ConceptSource = {
  id: 'thermal-conduction',
  label: 'Heat Working Its Way Through the Material Itself',
  canonicalSim: 'aperi21:heat-conduction',

  surface: {
    definition:
      'Heat making its way through a body by contact alone, nothing travelling bodily, reaching the far end of one material while barely leaving the flame in another.',
    exemplarKeywords: [
      'thermal conduction',
      'why does a metal spoon in hot soup burn your fingers',
      'conductors and insulators',
      'wax beads dropping off a heated rod',
      'heat travelling along a bar',
      'a wooden handle stays cool',
      'thermal conductivity of a material',
      'which material conducts heat better',
      'the far end of the rod gets hot too',
      'heat spreading through a solid',
    ],
  },

  briefing: {
    observable: [
      'Two rods lie side by side, drawn the same size and the same colour, told apart only by the grain lines along them and by the names steel and wood.',
      'An identical burner flame sits under one end of each, so the only thing differing between the two is what they are made of.',
      'Beads are stuck along the underside of each rod at even spacing, and a bead drops when the place it is stuck to gets past 60 ℃.',
      'On the steel rod the drops run outward from the flame in order, one place at a time, and the pauses between them lengthen as the heat gets further out.',
      'The last few drops on the steel come closer together again rather than further apart, because the far end has nowhere to pass the heat on to and it banks up there.',
      'On the wood rod a single bead falls, and it falls long after the steel has dropped every one of its ten; the rest stay stuck for the whole of the picture.',
      'A thin upright line marks how far 60 ℃ has got at this moment and slides along between the drops, so something is visibly still happening in the gaps.',
      'The fallen beads stay lying on the floor beneath each rod — ten under the steel and one under the wood — so the finished state records what happened.',
    ],

    screen: {
      affordances: [
        'The two rods run together and repeat; nothing has to be pressed, and the screen opens with both already heating.',
        'Even the bodies of the two rods are drawn alike, so a reader cannot attribute the difference to anything but the material named on the label.',
        'The beads turn temperature into an event at a place rather than a number rising, and the fallen ones are not cleared away, so a reader arriving late still has the record.',
        'The sliding line and the falling beads carry the same fact at two grains — one continuous, one in steps — and the rhythm of the steps is itself worth reading.',
        'The far ends of both rods are closed off, which is what makes the last steel beads bunch instead of spreading further apart.',
      ],
    },

    useWhen: [
      'The article has said that metals conduct better than wood, and the reader has the sentence with nothing behind it. Two identical flames, one rod dropping bead after bead along its length and the other holding still, is what "better" looks like.',
      'The point is that the spreading slows as it goes further — that the first centimetre is quick and the tenth is slow — and the widening pauses between drops carry that without any graph being drawn.',
    ],

    avoidWhen: [
      'The article explains why metals conduct well — free electrons, lattice vibrations. Nothing inside either material is drawn or named.',
      'The heat in question is carried by a moving fluid, or crosses a gap with nothing in it. Both rods are touched directly by a flame and the heat never leaves the material.',
      'The subject is two bodies drawing level at a shared temperature. Neither rod reaches one temperature; the flame keeps burning and the far end keeps taking heat in.',
      'Figures are needed — a conductivity in watts per metre per kelvin, or the temperature at a given place and time. The only figure on the screen is the temperature at which a bead lets go.',
      'The point is how much heat a material soaks up per degree rather than how readily it passes heat along.',
    ],

    contrastWith: [
      {
        concept: 'thermal-convection',
        note: 'One has the heat work its way through matter that stays where it is; the other has matter itself do the travelling and take the heat along as cargo.',
      },
      {
        concept: 'thermal-radiation',
        note: 'One needs an unbroken material path and is at the mercy of what that material is; the other needs nothing between at all and is stopped by putting something in the way.',
      },
      {
        concept: 'thermal-equilibrium',
        note: 'One follows heat inside a body and asks how far it has got; the other follows two bodies and asks when the flow between them gives out.',
      },
      {
        concept: 'specific-heat',
        note: 'Two ways materials differ that are easily run together — one is how readily a material passes heat along, the other is how much heat it swallows for each degree of its own.',
      },
    ],
  },
};
