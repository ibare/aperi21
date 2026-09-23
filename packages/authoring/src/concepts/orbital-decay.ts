/**
 * orbital-decay 개념 선언.
 *
 * 이 묶음에서 유일하게 **궤도를 도는 물체**를 다룬다. 이미 선언된 항력 · 흩어짐 개념과
 * 갈랐다 — 그쪽은 끌리면 느려지고, 이쪽은 **끌리는데 빨라진다.** 그 역설이 주장이다.
 * 까닭은 에너지의 행방이라 기둥 둘이 답한다 — 내놓은 것의 절반만 공기가 가져간다.
 * 부푸는 구면 · 별 · 등급 어휘는 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const orbitalDecayConcept: Aperi21ConceptSource = {
  id: 'orbital-decay',
  label: 'Orbital Decay and the Speeding Up of a Dragged Satellite',
  canonicalSim: 'aperi21:orbital-decay',

  surface: {
    definition:
      'A satellite held back by thin upper air, winding down in a tightening spiral yet moving ever faster, since the air claims only half of what the descent releases.',
    exemplarKeywords: [
      'orbital decay',
      'atmospheric drag on a satellite',
      'why a satellite speeds up as its orbit decays',
      'the satellite paradox, drag makes it go faster',
      'spiralling in and burning up',
      'low Earth orbit is not empty',
      'reboost to keep a station up',
      'half the released potential energy goes into speed',
      'losing altitude but gaining velocity',
      'the orbit sinks a little each lap',
    ],
  },

  briefing: {
    observable: [
      'A satellite circles a planet, starting on a dashed ring marking the orbit it began in, with an arrow forward whose length is its speed and an arrow backward for the drag, each named.',
      'The backward arrow never once points anywhere but against the motion, so the pull is always plainly a retarding one.',
      'The path it has already taken stays on screen as a spiral, close-wound for the first few laps and opening up further in, so each later lap is seen to lose more height than the one before.',
      'The air is drawn as overlapping faint discs that deepen toward the surface, which is the reason the spiral opens.',
      'The satellite goes round visibly quicker as it gets lower, and the forward arrow grows by about half again over the run.',
      'At the right two columns hang from one baseline: the left one is the height given up, the right one is where it went, stacked as a part that became speed above a part the air took.',
      'The two columns stay the same length as each other throughout, and the right-hand one is split nearly evenly, which is the answer to why a retarded body is going faster.',
      'On the last lap it drops straight into the thick air, reaches the ground and both arrows vanish.',
      'The whole spiral and both columns remain on screen afterwards while the wording accounts for where the height went.',
      'No figure is printed for the drag, the speed, the height or either column; what is read is the spacing of the spiral, the length of an arrow and the shape of two bars.',
    ],

    screen: {
      affordances: [
        'The satellite is already part way round its first lap when the picture opens, and the whole descent plays through and restarts without anything being pressed.',
        'The forward arrow is drawn at a length proportional to the actual speed, so its growth is evidence; the backward one is held at a fixed length and only reports direction, because a true length would either be invisible at the start or off the screen at the end.',
        'The final plunge is not slowed down — a last lap that goes past quickly is itself part of what is being claimed.',
        'Each colour carries one meaning: one for what the air takes, one for speed, one for the descent, with the columns named in words so that the colours are not asked to explain themselves.',
        'The motion is worked out by stepping the equations forward from the same starting condition every cycle, so the same instant always looks the same.',
        'No ruler or grid is offered, since what is to be read is spiral spacing, arrow length and bar shape rather than a distance.',
      ],
    },

    useWhen: [
      'The reader has been told that drag brings a satellite down and expects it to be slowing all the while. The forward arrow lengthening lap by lap while the drag never stops pulling backward is what makes the puzzle land.',
      'The article resolves that puzzle by accounting for the height given up, and a picture is wanted where the split into two nearly equal parts can be pointed at rather than derived.',
    ],

    avoidWhen: [
      'The subject is a deliberate change of orbit — a thrust, a transfer, a rendezvous. The only influence here besides gravity is the air, and it is never switched off or aimed.',
      'The article is about a body falling straight through air toward a steady speed. This one is in orbit throughout and its speed rises to the last moment.',
      'Re-entry heating, break-up or where the debris lands is the point. The run ends at the surface with nothing further drawn.',
      'The air itself is the topic — its layers, its composition, how its density is measured. It appears only as a deepening shade.',
      'Figures are required: an altitude, a speed, a lifetime, a drag coefficient. Nothing on screen is numbered.',
      'The reader should set the drag or the starting height and watch the outcome. One descent is laid out and its timing is matched to the one set of values it was built with.',
    ],

    contrastWith: [
      {
        concept: 'drag-force',
        note: 'Both have the air resist a moving body, but here the resisted body is bound to a centre, so the immediate loss shows up as a gain in speed instead of a slowing.',
      },
      {
        concept: 'terminal-velocity',
        note: 'Both end with the air deciding how a fall proceeds, one settling at a steady speed once the resistance matches the pull and one never settling at all.',
      },
      {
        concept: 'energy-dissipation',
        note: 'Both track a store draining away through resistance; here the point is that only part of what is released is drained, and the remainder is what makes the body quicker.',
      },
      {
        concept: 'gravitational-potential-energy',
        note: 'Both turn height into a store that a descent gives up, one accounting for that store in a straight fall and one splitting it between speed and the surroundings.',
      },
      {
        concept: 'uniform-circular-motion',
        note: 'One is the unspoiled case, a path that closes on itself forever; the other is what a tiny persistent tug does to it lap after lap.',
      },
    ],
  },
};
