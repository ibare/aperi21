/**
 * equilibrium-points 개념 선언.
 *
 * 이 묶음에서 힘의 균형을 말하는 유일한 조각이고, 이미 선언된 `equilibrium-of-forces`
 * 와 가장 붙기 쉽다. **무엇을 판정하는가**로 갈랐다.
 *   equilibrium-points   평형인 세 자리를 **조금 옮겼을 때 생기는 힘의 방향**으로 가른다
 *   equilibrium-of-forces 여러 힘이 닫혀 **평형이 성립하는지**를 가린다
 * 이쪽만 「돌아온다 · 굴러떨어진다 · 머문다」 · 작은 교란 어휘를 갖는다. 힘의 합성 ·
 * 닫히는 다각형이라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const equilibriumPointsConcept: Aperi21ConceptSource = {
  id: 'equilibrium-points',
  label: 'Stable, Unstable and Neutral Equilibrium',
  canonicalSim: 'aperi21:equilibrium-points',

  surface: {
    definition:
      'Resting places that are all equilibria alike, told apart only by which way the ground pushes after the same small displacement — back, further away, or not at all.',
    exemplarKeywords: [
      'stable equilibrium',
      'unstable equilibrium',
      'neutral equilibrium',
      'ball in a valley and ball on a hilltop',
      'why a pencil balanced on its point topples',
      'what happens after a small disturbance',
      'restoring push toward the resting place',
      'marble in a bowl',
      'balanced but ready to fall',
      'a resting place that does not last',
    ],
  },

  briefing: {
    observable: [
      'Three plates stand side by side, each carrying one ball of the same size and colour: a valley, a hilltop, and a flat stretch.',
      'A dashed upright line runs through each ball where it was resting, and it stays there for the whole run so that the ball can be seen to come back to it, leave it, or sit beside it.',
      'While the three are at rest there is not a single arrow anywhere on the screen.',
      'All three balls are then moved sideways by the same distance at the same moment, and an arrow grows on two of them — toward the dashed line on the valley plate, away from it on the hilltop plate — while the ball on the flat gets none at all.',
      'Released, the valley ball swings back through its dashed line, rocks about it and settles on it; the hilltop ball runs off down the slope faster and faster and comes to a stand against a stop at the end of its plate; the flat ball simply stays where it was put.',
      'Only at the end do the names — stable, unstable, neutral — appear beneath the plates, so they read as names for something already watched.',
      'Each plate is separate, so the ball that rolls off the hilltop never arrives in the next valley.',
    ],

    screen: {
      affordances: [
        'The resting, the nudging, the release and the naming happen in order and then begin again; nothing has to be pressed.',
        'All three are moved by the same distance in the same instant, so the only thing that differs between the plates is the shape of the ground under the ball.',
        'The accent colour is kept for the push of the ground on the ball alone, and only the one arrow along the slope is drawn, so that a resting ball plainly has no arrow rather than two that cancel.',
        'No number, axis or grid is drawn, because what is being read is a direction and not a size.',
      ],
    },

    useWhen: [
      'The article has defined equilibrium as a place where the forces come to nothing, and the reader is treating every such place as the same kind of place. Running the same nudge on three of them at once is what splits the one definition into three cases.',
      'The article needs the names attached to something already seen rather than defined in advance, and a case is wanted where the three differ in nothing but the ground.',
    ],

    avoidWhen: [
      'The article works with a potential energy curve, where a level energy line cuts the curve and fixes how far the body may roam. No energy line, no turning points and no energy bars are drawn here.',
      'The subject is whether several forces on a body cancel, or how to find the place where they do. Only one arrow is ever drawn, and finding the resting place is not the question — the balls start on them.',
      'The subject is a floating or tilted body that rights itself, where the geometry of a righting pair of forces is the point. Nothing floats and nothing turns here.',
      'Values are wanted — how far it was nudged, how steep the slope is, how strong the push. Nothing is measured or written.',
      'The point is how the valley ball’s rocking dies away, or how long it takes. The settling happens but is not measured or named.',
    ],

    contrastWith: [
      {
        concept: 'equilibrium-of-forces',
        note: 'One takes a resting place as given and asks what a small displacement does to it; the other asks whether the forces on a body come to nothing in the first place.',
      },
      {
        concept: 'newtons-first-law',
        note: 'One is about staying put after a disturbance — whether the body comes back; the other is about keeping a motion when nothing disturbs it at all.',
      },
      {
        concept: 'normal-force',
        note: 'One reads only the along-the-slope share of the push from the ground, as a direction; the other is about the across-the-surface share and how large it has to be.',
      },
    ],
  },
};
