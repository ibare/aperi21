/**
 * stability-of-floating-body 개념 선언.
 *
 * 뜨는 것을 다루는 개념들과 **묻는 것**으로 갈랐다.
 *   buoyancy                 부력의 **원인** — 아랫면이 윗면보다 세게 밀린다
 *   archimedes-principle     부력의 **크기** — 밀려난 물의 무게와 같다
 *   buoyant-force-as-force   **힘으로서** — 잠긴 부피가 정한다
 *   floating-and-draft       뜬 물체가 **어디에 멈추는가** — 밀도 비가 정한다
 *   stability-of-floating-body  뜬 물체가 **기울면 돌아오는가** — 부심이 무게중심 너머까지
 *                            옮겨 가느냐가 정한다
 * 이쪽만 「기울다 · 부심이 옮겨 간다 · 짝힘 · 되세워진다 · 뒤집힌다 · 폭」 어휘를 갖는다.
 * 밑면에 선 물체가 넘어지는 것은 `center-of-gravity` 의 몫이라 갈라 둔다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const stabilityOfFloatingBodyConcept: Aperi21ConceptSource = {
  id: 'stability-of-floating-body',
  label: 'Whether a Heeled Boat Rights Itself',
  canonicalSim: 'aperi21:stability-of-floating-body',

  surface: {
    definition:
      'Whether a floating body tipped to one side comes back: as it heels its centre of buoyancy shifts toward the low side, and it rights only if that shift carries past the centre of gravity.',
    exemplarKeywords: [
      'stability of a floating body',
      'why do boats capsize',
      'centre of buoyancy shifts when a boat heels',
      'righting moment of a ship',
      'a narrow boat tips over while a wide one rocks back',
      'metacentre',
      'top-heavy boat',
      'ballast low down keeps a ship upright',
      'beam and stability',
      'will it roll back upright or keep going over',
    ],
  },

  briefing: {
    observable: [
      'Two hull sections float side by side in the same water, one wide and one narrow, each with its beam written under its name; the water is shaded darker with depth.',
      'The part of each hull below the surface is hatched, and the hatching is recut every instant as the hull heels, so what counts as submerged is always the present shape.',
      'Short arrows stand on every wetted face of each hull, longer the deeper the face lies.',
      'Two points are marked and named on each hull — the centre of buoyancy and the centre of gravity — and a dashed line of action runs through each of them.',
      'A trail follows where the centre of buoyancy has been, so its travel toward the low side is left behind as a curve rather than having to be remembered.',
      'When the two lines of action are apart, an amber couple is drawn between them — an arm barred at both ends and a curved arrow showing which way it turns the hull.',
      'The wide boat heels a little, its centre of buoyancy passes beyond the centre of gravity, and the couple turns it back; it rocks about upright.',
      'The narrow boat, at the height it starts at, heels further each swing: its centre of buoyancy moves too but falls short, and the couple pushes the same way it was already going.',
      'The caption is two clauses side by side, one for each boat, naming what each of them is doing at that moment.',
      'Nothing is written as a number except the two beams and the slider’s own value — no angle, no arm length, no curve of righting against heel.',
    ],

    screen: {
      affordances: [
        'A slider sets how high the centre of gravity sits above the keel, the same height for both boats, from well down in the hull to well above it.',
        'Both boats always carry the same setting, so the only difference left between them is the beam, and the comparison stays honest.',
        'Moving it clears the trail and rebuilds the boats’ behaviour from that height on, without putting them upright again — the hulls carry on from the attitude they were in.',
        'Bring it low enough and the narrow boat rights itself too, and the caption for it changes accordingly; take it high enough and the narrow boat goes right over and stays over.',
        'One colour is spent on one meaning: amber is the couple and nothing else, so wherever it appears the hull is being turned.',
        'The judgement is made by which side of the centre of gravity the centre of buoyancy has reached, which is why the two are the only named points in the picture.',
      ],
    },

    useWhen: [
      'The article has said that a low centre of gravity makes a boat stable and the reader takes it as a rule to memorise. Two hulls at the same height, one coming back and one going over, turns the rule into something with a cause: the beam decides how far the buoyancy can travel.',
      'The reader believes a floating body is stable so long as it floats at all, and the point wanted is that floating and staying upright are two separate matters.',
    ],

    avoidWhen: [
      'The question is how deep a body floats, or what share of it is under. Both hulls here settle at the same draft and it is never at issue.',
      'The size of the upward push is at stake, or its tie to the fluid pushed aside. Nothing is weighed, spilled or collected here.',
      'The subject is a body standing on a base and tipping over when its weight line leaves that base. These hulls have no base and their support moves as they turn.',
      'The article needs the metacentre named, or a curve of righting arm against angle of heel. Neither is drawn, and neither can be read off the picture.',
      'The point is waves, wind or anything else that heels a real vessel from outside. What tips these hulls is only their being set down out of trim.',
    ],

    contrastWith: [
      {
        concept: 'floating-and-draft',
        note: 'Both are about a body that has come to rest in a fluid: one asks how deep it sits, the other asks whether it stays the way up it was put.',
      },
      {
        concept: 'center-of-gravity',
        note: 'Both turn on whether the weight acts inside or outside the support: one has a fixed base under the body, the other a support that travels as the body heels, which is why floating bodies can right themselves at all.',
      },
      {
        concept: 'buoyancy',
        note: 'One asks where the upward push acts and what happens when that place moves; the other asks why there is an upward push in the first place.',
      },
      {
        concept: 'archimedes-principle',
        note: 'One takes the size of the upward push for granted and works entirely with where it acts; the other is where that size is the whole of the claim.',
      },
      {
        concept: 'static-equilibrium',
        note: 'One is a body whose forces already cancel while its turnings do not, so it keeps rolling; the other is the general condition that both must cancel before anything is at rest.',
      },
    ],
  },
};
