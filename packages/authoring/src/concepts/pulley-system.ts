/**
 * pulley-system 개념 선언.
 *
 * 줄 형제 셋 가운데 하나다. 이쪽 주어는 **장치**이고 주장은 **받치는 가닥 수가 힘과
 * 거리를 맞바꾼다**이다 — 가닥이 n 이면 힘은 1/n, 당길 줄은 n 배다. `tension` 은 한
 * 가닥이 어디서나 같다는 것이고, `connected-bodies` 는 묶인 물체들의 가속도가 하나라는
 * 것이다. 이쪽만 가닥 수·이득·거래 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const pulleySystemConcept: Aperi21ConceptSource = {
  id: 'pulley-system',
  label: 'Pulley System',
  canonicalSim: 'aperi21:pulley-system',

  surface: {
    definition:
      'An arrangement of pulleys in which the strands holding a load share it, so the hand pulls with a smaller force but draws in that many times more rope.',
    exemplarKeywords: [
      'pulley system',
      'mechanical advantage of a block and tackle',
      'why does a pulley make lifting easier',
      'number of supporting strands',
      'block and tackle',
      'trading force for distance',
      'a movable pulley halves the force',
      'you have to pull twice as much rope',
      'lifting a heavy load with a light pull',
      'nothing is gained overall, only exchanged',
    ],
  },

  briefing: {
    observable: [
      'Three rigs hang side by side from one ceiling beam, holding loads of the same forty newtons; the first has the rope going over a single fixed pulley, the second adds a movable one, the third two.',
      'Under each load the count of strands actually holding it is written out — one, two, four.',
      'A hand grips the free end of each rope, and beside each hand an arrow with its size in newtons: forty, twenty, ten.',
      'The three loads rise together, and each stops after the same one metre; a dashed outline is left where each load started.',
      'A scale at the right of each rig measures that rise, and the three read the same figure.',
      'A second bar, in the accent colour, measures how much rope each hand has drawn in, and the three read one metre, two metres and four metres.',
      'The hands back away by exactly those distances, so the rig needing the weakest pull is the one whose hand travels furthest across the picture.',
      'Rope markings flow over the pulleys toward the hands as the strands shorten, which is where the extra rope on the four-strand rig is coming from.',
      'The loads come down again and the whole thing repeats, and while they hold at the top the caption reads off the three lengths of rope pulled for the same one metre raised.',
    ],

    screen: {
      affordances: [
        'The three rigs run at once from one clock, so the weaker pull and the longer haul are seen in the same moment rather than one after another.',
        'The rise and the rope pulled are measured on bars drawn to the same scale, which makes one metre of lift and four metres of rope directly comparable as lengths on the picture.',
        'The whole round — rise, hold, lower — plays and begins again by itself.',
        'The loads are equal and only the rigging differs, so whatever changes between the three columns is down to the strand count alone.',
      ],
    },

    useWhen: [
      'The article has stated a mechanical advantage and the reader is taking it as something got for nothing. Three hands pulling forty, twenty and ten newtons while backing away one, two and four metres for the same one metre of lift is where the price shows up.',
      'The claim is that a machine can change how hard you have to pull without changing what the job costs, and a screen is wanted where both sides of the exchange are measured on the same picture.',
    ],

    avoidWhen: [
      'The subject is whether the rope carries the same pull all along its length. The strand counts are written down, but nothing is measured anywhere along a rope.',
      'Work or energy is to be named and totted up. Forces and distances are drawn, but nothing multiplies them on screen and no total appears.',
      'The rig is expected to accelerate or to be used dynamically. The loads rise at a gentle, scripted pace and stop.',
      'The article is about friction in the bearings, the weight of the pulleys or a rope that stretches. All three rigs are drawn as ideal and nothing is lost anywhere.',
      'A gear train, a lever or a hydraulic press is the machine in question. What is drawn here is rope over sheaves.',
    ],

    contrastWith: [
      {
        concept: 'tension',
        note: 'One counts how many strands of a rope hold a load and what the count buys; the other asks what a single strand carries, and answers that it is the same at every point of it.',
      },
      {
        concept: 'inclined-plane',
        note: 'Both are ways of needing less force for the same job, one by spreading a load over strands, the other by aiming only part of a weight along the path.',
      },
      {
        concept: 'connected-bodies',
        note: 'Both hang several things on one rope, but here the rope is rigged to hold a load up, and there it is there to drag bodies along together.',
      },
      {
        concept: 'mechanical-advantage',
        note: 'One settles the factor by counting the strands that share the load; the other is the trade behind any such factor — force cut and distance lengthened by the same amount, whatever the tool.',
      },
    ],
  },
};
