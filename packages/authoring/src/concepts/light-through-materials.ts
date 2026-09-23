/**
 * light-through-materials 개념 선언.
 *
 * 색 셋 가운데 **색이 주장이 아닌** 하나다. 가르는 것은 재료이고, 갈리는 것은
 * 통과 방식 — 곧게 지남 · 흩어져 지남 · 막힘이다. 판도 빛도 무채색이라 색 어휘를
 * 쓰지 않는다.
 *   color-addition           빛끼리 더해져 색이 된다
 *   object-color             겉면이 되쏠 색을 고른다 — **되돌아오는** 쪽
 *   light-through-materials  재료가 통과를 가른다 — **지나가는** 쪽, 또렷 · 흐림 · 그림자
 *
 * `shadow-umbra-penumbra` · `rectilinear-propagation` 과는 그림자의 **원인**으로 갈랐다 —
 * 저쪽들은 광원과 가림판의 기하가 그림자의 크기 · 겹을 정하고, 이쪽은 세 재료 가운데
 * 하나가 막았다는 것만 말한다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const lightThroughMaterialsConcept: Aperi21ConceptSource = {
  id: 'light-through-materials',
  label: 'Transparent, Translucent and Opaque in the Same Beam',
  canonicalSim: 'aperi21:light-through-materials',

  surface: {
    definition:
      'What materials do to identical beams: a transparent one passes light straight to a sharp bright patch, a translucent one spreads it into a wide dim glow, an opaque one leaves a shadow.',
    exemplarKeywords: [
      'transparent translucent and opaque materials',
      'which materials let light through',
      'frosted glass lets light through but you cannot see through it',
      'why does a wooden board cast a shadow',
      'sorting objects by how much light passes',
      'a bathroom window that lets in light but not a view',
      'curtains let some light through',
      'materials that block light completely',
      'clear glass, frosted glass and wood side by side',
      'light passing through everyday objects',
    ],
  },

  briefing: {
    observable: [
      'A lightless room holds three identical lamps in a row, each sending an identical beam straight down to a screen that runs across the bottom of the room inside a grey border.',
      'Before anything is put in the way, the screen carries three bright patches that match one another exactly, and three boards wait to one side of the beams.',
      'The boards slide sideways into the beams, and while they are only part-way in, just the covered part of each beam changes while the uncovered part still runs straight to the screen; each bright patch changes by the same fraction.',
      'Under the clear board the beam carries on in the same straight line and the patch below stays as sharp as it was, only slightly less bright.',
      'Under the frosted board the beam breaks into strands going several ways at once, and the screen below carries a wide, dim glow instead of a patch.',
      'At the wooden board the beam stops, and the screen below it is the same black as the room — the grey border is what shows that the screen is still there under the shadow.',
      'Above the boards the three beams stay identical for the whole round, so the light arriving at each board is plainly the same light.',
      'The boards then slide out and the three patches on the screen come back to matching one another.',
      'Below the room the three materials are named — glass, frosted glass, wood — each under the beam it stands in.',
      'The brightness along the screen and the strands drawn below the frosted board come from one and the same reckoning, so the wide glow is as wide as the strands go.',
      'The boards are told apart by how dark they are and how solidly they are filled: the clear one barely more than an outline, the frosted one filled a pale grey, the wooden one filled solid and dark.',
    ],

    screen: {
      affordances: [
        'The boards slide in, hold, and slide out again by themselves, over and over, with nothing to press.',
        'The round opens with the beams bare, so the three matching patches are seen before anything is put in their way — which is what allows the difference afterwards to be laid at the door of the materials.',
        'The boards are visible off to the side before they enter, so the reader knows which material is about to stand in which beam.',
        'Only the covered part of a beam changes while a board is half-way in, which ties the change to the board rather than to the moment.',
        'The materials are given greys and fills rather than colours of their own, since the claim is carried by the beams below them and by the screen.',
        'A few strands are drawn under the frosted board rather than every direction the light takes, so that spreading is still read as light going several ways instead of a filled haze.',
        'The screen is drawn with a border so that a shadow reads as a dark place on the screen rather than as a gap where the screen ends.',
        'The room is laid down as lightless so that the shadow is the darkest thing in the picture whichever theme the page is in.',
        'What is written is the three material names; how much light each passes is left to the brightness on the screen.',
      ],
    },

    useWhen: [
      'The article has given the reader the three words — transparent, translucent, opaque — and they are still three labels. Three identical beams and three different results on one screen put a picture behind each word.',
      'The point being made is that translucent is its own case and not a halfway house between clear and blocked. The wide dim glow under the frosted board looks nothing like a smaller version of the sharp patch.',
      'The reader is to sort materials by what they do to light, and the article wants the test itself shown: the same light, the material changed, the result read off a screen.',
    ],

    avoidWhen: [
      'The subject is light changing direction as it enters glass — refraction, the bending at a boundary, a beam displaced sideways. The beam through the clear board carries straight on with no bend at all.',
      'The article is about the shape or the size of a shadow, its edges, or how it changes as the blocker is moved. Each board stays at its own height and only whether the beam is stopped is at stake.',
      'The point turns on colour — a tinted pane, what colour comes through, why a material looks the colour it does. The light and all three boards are colourless here.',
      'The subject is light bouncing back off a surface toward the viewer. Only what carries on past the board is followed.',
      'The article needs how much light gets through as a number or a per cent, or a material other than these three. What is on screen is three named materials and the brightness they leave.',
      'The point is that the blocked light warms the material or is absorbed into it. The beam simply ends at the wooden board.',
    ],

    contrastWith: [
      {
        concept: 'shadow-umbra-penumbra',
        note: 'Both end in a shadow on a screen, but one asks what material was in the way, and the other takes the blocker for granted and asks what the size of the source does to the shadow’s layers.',
      },
      {
        concept: 'object-color',
        note: 'One follows the light that carries on past a material, the other the light that comes back off it; the first is read as sharpness, the second as colour.',
      },
      {
        concept: 'specular-diffuse-reflection',
        note: 'Both turn one orderly sheaf of light into many directions, but one does it at a surface the light leaves from, the other inside something the light passes through.',
      },
      {
        concept: 'seeing-requires-light',
        note: 'One asks what stands between a source and what lies beyond it, the other whether the source is giving light in the first place.',
      },
      {
        concept: 'rectilinear-propagation',
        note: 'Both put something in the path of light and look at the screen behind, but one reads off where the straight lines grazing an edge land, and the other what the thing in the path is made of.',
      },
    ],
  },
};
