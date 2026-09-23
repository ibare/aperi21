/**
 * greenhouse-effect 개념 선언.
 *
 * 들어온 빛과 온도 넷 중 하나. 주어를 **층**으로 잡았다 — 주장은
 * **같은 햇빛인데 지표가 더 높은 자리에 다시 선다** 이고, 까닭은 지표가 낸 적외선의
 * 일부가 아래로 돌아와 들어옴 쪽에 얹히는 것이다.
 *
 * `radiative-equilibrium` 과 화면 장치(막대 짝 · 맞춤선)를 나눠 쓰므로 definition 이
 * 가장 붙기 쉽다. 갈림은 **무엇이 바뀌는가** 다 — 저쪽은 출발 온도가 달라도 같은 값,
 * 이쪽은 같은 햇빛인데 값 자체가 올라간다. 이쪽만 「층 · 적외선 · 되돌아옴 · 더 높은」
 * 어휘를 갖는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const greenhouseEffectConcept: Aperi21ConceptSource = {
  id: 'greenhouse-effect',
  label: 'Greenhouse Effect as a Raised Balance',
  canonicalSim: 'aperi21:greenhouse-effect',

  surface: {
    definition:
      'The extra warmth a layer overhead gives the ground by absorbing its infrared and handing part of it back down, so the same sunlight balances at a higher temperature.',
    exemplarKeywords: [
      'greenhouse effect',
      'why is the Earth warmer than the sunlight alone would make it',
      'carbon dioxide traps heat',
      'the atmosphere works like a blanket',
      'infrared absorbed overhead and sent back down',
      'sunlight gets in but the heat cannot get straight out',
      'back radiation warming the surface',
      'why greenhouse gases raise the temperature',
      'adding a layer lifts the surface temperature',
      'the difference between with and without an atmosphere',
    ],
  },

  briefing: {
    observable: [
      'In cross-section, short ripples come down from the sky to the ground and long ripples climb from the ground all the way out of the top, each with a small arrowhead at its end saying which way it travels; short and long are told apart by the spacing of the ripples alone, both drawn in the same plain colour.',
      'To begin with there is no layer: the ground’s two bars stand level with each other and its temperature curve runs flat across the panel at the temperature written there.',
      'A hatched band then rises into place. The short ripples cross it without a break, while the long ripples leak out above it only faintly, and fresh long ripples come out of the band in both directions, up and down, on a stem of their own so that absorbing and re-emitting is not mistaken for passing through.',
      'The share handed back down is stacked as a hatched block on top of the plain block of the incoming bar, and the guideline carrying the incoming height lifts clear above the outgoing bar.',
      'The plain sunlight block never changes height through any of this — the same sunlight is arriving as before.',
      'The ground then warms: the outgoing bar climbs toward the raised guideline while the curve rises past a mark showing where the layer was added, steeply at first and then flattening.',
      'At the end the top of the outgoing bar meets the raised guideline and the curve runs level again, with a dashed line and a higher written temperature naming the new height.',
      'The hatching carries a single meaning, came from the layer: the band and the returned share of the incoming bar are the only things wearing it, so the two blocks of the incoming bar are told apart by texture rather than by colour.',
      'The layer’s own temperature is never shown, nothing is given in watts, no running temperature is written, and the time axis carries no marks — the only figures are the temperature before the layer and the temperature after.',
    ],

    screen: {
      affordances: [
        'One round runs from no layer, through the layer arriving and the bars going out of balance, to the new balance, and then takes the layer away again; nothing has to be pressed.',
        'The bar pair and the guideline are read exactly as in the bare case, and what is new is that the incoming bar now stacks two shares instead of one.',
        'The wording waits for each step: it speaks of the layer only once the layer is in, of warming only once the ground is warming, and of having settled only once the bar has met the guideline.',
        'How much of the infrared the layer takes in is shown by how faint the ripples leaking above it are, rather than by any figure.',
        'The spacing of the ripples carries only the difference between short and long; it is nowhere near the real ratio, which would crush the short ones into a smear.',
        'That the layer takes in the infrared and not the sunlight is said only by the short ripples crossing it unbroken.',
      ],
    },

    useWhen: [
      'The article has said that greenhouse gases warm the surface, and the reader pictures heat being shut in rather than returned. The long ripples coming back down out of the layer, and the hatched share stacking on the incoming side, is what shows it as an addition to what arrives rather than a lid on what leaves.',
      'The point being made is that the sunlight is untouched — that nothing more is coming in from outside and the surface is nonetheless hotter — and the plain block of the incoming bar holding its height while the hatched block appears above it is exactly that.',
    ],

    avoidWhen: [
      'The article turns on which gases absorb, or on what parts of the spectrum they absorb. There is one featureless layer here and no gas is named.',
      'The subject is how much sunlight is reflected away, or how a bright surface differs from a dark one. Nothing bounces here, and the arriving sunlight is already what was taken in.',
      'The point is the temperature a bare sunlit body settles at, and why it settles at all. That is where this begins, before anything of interest has happened.',
      'The article is about an actual glass greenhouse, or a parked car, kept warm by stopping the warm air from escaping. Nothing here is stopped from moving; everything turns on radiation being returned.',
      'What is wanted is the fourth-power law, an expression for the new temperature, or a figure for how much the layer absorbs. Only the two temperatures are written.',
      'The subject is how warm the air aloft is. The layer’s temperature is deliberately left off the screen.',
    ],

    contrastWith: [
      {
        concept: 'radiative-equilibrium',
        note: 'One shows a balance being struck at a temperature fixed by what arrives; the other changes nothing about what arrives and finds the balance struck somewhere higher.',
      },
      {
        concept: 'albedo',
        note: 'Both are about radiation being turned back, at opposite ends: one turns away sunlight before the ground ever gets it, the other returns the ground’s own emission after it has set off.',
      },
      {
        concept: 'insulation',
        note: 'One keeps a body warm by slowing what leaves it; the other lets it radiate at full strength and instead hands a share of that straight back, which is why the ground can be hotter with nothing wrapped round it.',
      },
      {
        concept: 'thermal-radiation',
        note: 'One is about radiation crossing a gap and being stopped by whatever is put in the way; the other is about what happens when the thing put in the way does not simply stop it but sends part of it back the way it came.',
      },
    ],
  },
};
