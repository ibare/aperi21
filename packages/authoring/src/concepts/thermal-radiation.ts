/**
 * thermal-radiation 개념 선언.
 *
 * 열 이동 넷 중 하나. 무엇을 타고 가는가로 갈랐다 — 이쪽은 **아무것도 없는 곳을 건너**간다.
 *   thermal-conduction   닿은 물질을 타고, 재질이 정한다
 *   thermal-convection   흐름에 실려, 흐름을 멈추면 멎는다
 *   thermal-radiation    **빈 곳을 건너** 닿아 데운다 — 가리개로 막으면 멈춘다
 *   stefan-boltzmann-law 건너가는 이야기가 아니라 **내보내는 양**이 온도로 정해진다
 * 이쪽만 「진공 · 아무것에도 닿지 않은 판 · 가리개 · 물결이 건너간다」 어휘를 갖는다.
 * 네제곱 · 스펙트럼 · 거리에 따른 감소는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const thermalRadiationConcept: Aperi21ConceptSource = {
  id: 'thermal-radiation',
  label: 'Heat Crossing Empty Space',
  canonicalSim: 'aperi21:thermal-radiation',

  surface: {
    definition:
      'Heat reaching a body across empty space as waves it takes in, wanting neither contact nor anything in between, and ceasing the moment something is set in the path.',
    exemplarKeywords: [
      'thermal radiation',
      'how does the sun heat the earth through space',
      'heat that needs no medium',
      'infrared radiation',
      'radiant heat from a fire you are not touching',
      'why a vacuum flask keeps things hot',
      'radiation crosses a vacuum',
      'blocking radiant heat with a screen',
      'heat travelling as waves',
      'feeling the warmth before you reach the stove',
    ],
  },

  briefing: {
    observable: [
      'A sealed box is filled at first with grains of air, which are drawn out through a port in the floor marked as going to a pump, thinning as they go until none are left and the box is named a vacuum.',
      'Inside stand a hot block at 400 ℃ and, at some distance from it, a plate with its own temperature bar; three wave lines run from the block toward the plate.',
      'While the air is still being drawn off, the waves are cut short at a shield standing between the two, and the plate’s bar sits unmoved at 20 ℃.',
      'The shield is then lifted out through a slot in the ceiling, and as its lower edge clears each wave line in turn, that line’s leading edge sets off across the emptiness.',
      'The waves arrive at the plate, its bar climbs, and a faint tint spreads over the plate itself as it takes more in.',
      'Nothing is drawn supporting either the plate or the block — no stand, no bracket — so no path of contact is available to account for the warming.',
      'The shield comes back down, the waves are cut off at it again, the ones already past finish arriving, and then the bar stands still at 45 ℃ and goes no higher.',
      'The waves are drawn as plain dark lines rather than coloured, and the block’s own appearance never changes while all of this happens.',
    ],

    screen: {
      affordances: [
        'One round runs blocked, then clear, then blocked again, so the bar holding still, rising, and holding still once more are all seen in a single pass; nothing has to be pressed.',
        'The air being pumped out is shown happening rather than declared in words, so the emptiness is something the reader watched arrive.',
        'The shield going back down is the control on the whole claim: the same emptiness remains and the warming stops, which leaves the waves as the only thing that had been doing it.',
        'The bar carries two marked values only, the temperature it starts from and the one it comes to rest at; nothing is written while it is climbing.',
        'The spacing of the waves and the pace of their leading edge are chosen so they can be seen, and stand for the real wavelength and speed rather than reporting them.',
      ],
    },

    useWhen: [
      'The article has stated that radiation needs no medium, and the reader’s objection is that some air must have been left, or that the plate would have warmed anyway. The shield coming down inside the same vacuum, and the bar stopping, answers both at once.',
      'The article needs a body that is touched by nothing at all and warms regardless, so that conduction through a support cannot be offered as the explanation.',
    ],

    avoidWhen: [
      'The article is about how much a surface gives off and how that depends on its temperature. Nothing here is emitted in a measured amount; the block’s temperature never changes.',
      'The subject is the spectrum, the wavelength, or the colour of a glowing body. The waves are drawn plainly and the hot block is never shown glowing.',
      'The point is a body cooling by its own radiation. While the shield is down the plate simply holds where it is and never falls back.',
      'Reflection, emissivity or the fraction a surface takes in is at issue. No portion is split off or written down anywhere.',
      'The article turns on radiation weakening with distance. The gap here is fixed and is never varied.',
      'The heat in question travels through something — a solid in contact, or a fluid in motion. The whole point of this box is that neither is present.',
    ],

    contrastWith: [
      {
        concept: 'stefan-boltzmann-law',
        note: 'One asks whether anything gets across a gap with nothing in it, and what stops it; the other has nothing to get across and asks only how much a surface at a given temperature pours out.',
      },
      {
        concept: 'thermal-conduction',
        note: 'One needs an unbroken material path and depends on what that material is; the other needs nothing in the way and is undone only by putting something there.',
      },
      {
        concept: 'thermal-convection',
        note: 'One is stopped by emptying the space of everything; the other is stopped by keeping the matter and stilling it, which is a good way to see that the two are not the same mechanism.',
      },
    ],
  },
};
