/**
 * thermal-convection 개념 선언.
 *
 * 열 이동 넷 중 하나. 무엇을 타고 가는가로 갈랐다 — 이쪽은 **움직이는 유체에 실려** 간다.
 *   thermal-conduction   닿은 물질 자체를 타고, 재질이 정한다
 *   thermal-convection   **흐름에 실려** 간다 — 온도차를 그대로 두고 흐름만 멈추면 멎는다
 *   thermal-radiation    빈 곳을 건너간다 — 막으면 멈춘다
 *   stefan-boltzmann-law 가는 이야기가 아니라 내보내는 양
 * 이쪽만 「실려 간다 · 고리 · 흐름을 멈춘다 · 따라가는 덩어리」 어휘를 갖는다. 왜 데워진
 * 유체가 뜨는가(부력 · 밀도)는 화면에 없어 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const thermalConvectionConcept: Aperi21ConceptSource = {
  id: 'thermal-convection',
  label: 'Heat Riding Along With Moving Fluid',
  canonicalSim: 'aperi21:thermal-convection',

  surface: {
    definition:
      'Heat moved by the bulk travel of a fluid, riding along with the matter carrying it, so stopping the motion stops the transport even with the temperature difference untouched.',
    exemplarKeywords: [
      'convection',
      'hot air rises and carries heat with it',
      'convection current',
      'why does a radiator warm the whole room',
      'circulation in a pan of heating water',
      'heat carried by a moving fluid',
      'warm fluid up, cool fluid down',
      'a convection cell',
      'heat transported rather than spread',
      'sea breeze and land breeze',
    ],
  },

  briefing: {
    observable: [
      'A wide box has a hot floor and a cold ceiling, each named, with fluid between them shaded so that the hotter it is the brighter it shows.',
      'Small tracers with short tails drift through the fluid and reveal that it is turning in standing rolls rather than drifting at random.',
      'One parcel is singled out in a distinct colour with a ring drawn round it, and the brightness inside that ring is the heat it happens to be holding.',
      'The parcel brightens as it passes the floor, keeps that brightness as it rises the whole height of the box, and gives it up near the ceiling — so the heat is seen to travel as freight on something that is itself moving.',
      'A fading trail behind the parcel keeps its route on the screen, so the full loop — up one way, across and down the other — is present at once instead of having to be remembered.',
      'With the flow turned right down, the rolls die away and the tracers go still while the floor stays exactly as hot as before.',
      'The bright region then stays near the floor and only creeps outward slowly, and the caption changes to say the heat is no longer being carried, only spreading where it is.',
      'The cold ceiling is legible mainly from its label, since the coolest fluid is drawn at the faintest shade.',
    ],

    screen: {
      affordances: [
        'A slider sets how strongly the fluid circulates, from nothing up to brisk, while the floor and ceiling hold their temperatures throughout — so exactly one thing changes.',
        'Turning that slider to nothing is the whole test: the same driving difference remains and the transport ceases, which is what identifies carrying as the mechanism.',
        'Only the followed parcel is drawn in the distinct colour, so there is never a question of which thing is being tracked.',
        'The flow is shown by tracers with tails rather than by arrows, so speed and direction come from the same marks that show where the fluid actually goes.',
        'Temperature is shown as brightness on one colour rather than as a hot-and-cold pair, so the picture reads as one quantity with more or less of it.',
      ],
    },

    useWhen: [
      'The article has said that warm fluid rises and carries heat, and the reader is likely to take "carries" as a turn of phrase. Turning the circulation off while the floor stays hot, and watching the heat stall near the bottom, makes carrying the operative word.',
      'The point needs the closed circuit rather than a single rising plume — that fluid going up must be matched by fluid coming down — and the followed parcel with its trail is what makes the loop one object instead of two events.',
    ],

    avoidWhen: [
      'The article explains why warmed fluid goes up. There is no density, no weight and no upward push anywhere here; the circulation is simply given.',
      'The heat in question makes its way through something solid, or crosses a gap with nothing in it.',
      'Rates or amounts of heat are needed — how much is delivered, in what time. Nothing is numbered on the screen.',
      'The subject is boiling, bubbles or turbulence. The fluid here turns in smooth standing rolls and never breaks up.',
      'The point is the fluid reaching one uniform temperature. The floor and ceiling are held apart for the whole of the picture and the circulation never settles.',
    ],

    contrastWith: [
      {
        concept: 'thermal-conduction',
        note: 'One has the carrier itself travel and the heat go as freight; the other has the material stay put while the heat works its way along it.',
      },
      {
        concept: 'thermal-radiation',
        note: 'One needs a fluid in motion, and fails the moment the motion stops; the other needs nothing between at all, and fails only when something is put in the way.',
      },
      {
        concept: 'buoyancy',
        note: 'One takes the circulation for granted and asks what it does to the heat; the other is where the fluid’s upward push on what is in it is itself the claim, and is the reason such a circulation gets going.',
      },
    ],
  },
};
