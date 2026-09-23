/**
 * impulse-momentum-theorem 개념 선언.
 *
 * 이미 선언된 `impulse-force-relation` 과 가장 붙기 쉽다. **무엇을 주장하는가**로 갈랐다.
 *   impulse-momentum-theorem  쌓이는 힘-시간 넓이 = 운동량이 옮겨 간 양. 튕기면 멈추는
 *                             몫에 되돌리는 몫이 더해져 처음 운동량보다 크다
 *   impulse-force-relation    **같은** 충격량을 길게 받으면 힘이 작다 — 에어백 · 완충
 * 이쪽은 힘의 모양 · 길이를 바꾸지 않는다. 에어백 · 완충 구간 · 무릎 굽히기 어휘를 쓰지
 * 않고, 충돌 조각들과 달리 벽에 운동량을 주지 않는다(한 물체 · 한 번의 힘).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const impulseMomentumTheoremConcept: Aperi21ConceptSource = {
  id: 'impulse-momentum-theorem',
  label: 'Impulse as the Change of Momentum',
  canonicalSim: 'aperi21:impulse-momentum-theorem',

  surface: {
    definition:
      'The area a push builds up over the time it lasts, matching step for step how far the body’s momentum has shifted, so that coming back takes more of it than merely being halted.',
    exemplarKeywords: [
      'impulse',
      'impulse equals change in momentum',
      'J = Δp',
      'area under a force-time graph',
      'how much momentum did the wall take away',
      'why a ball that bounces back hits harder than one that sticks',
      'the stopping part and the reversing part',
      'momentum change during a bounce off a wall',
      'force acting over an interval of time',
      'newton seconds',
    ],
  },

  briefing: {
    observable: [
      'A ball rolls into a wall, squashes sideways while it is touching, and runs back the way it came.',
      'A single arrow reaches from the wall face into the ball while the two are in contact, growing and dying away with exactly the shape of the curve on the graph.',
      'On the right a force-against-time graph is drawn only as far as it has already happened, so the curve is built rather than displayed, and the space beneath it fills in the accent colour as it goes.',
      'Below left a momentum line carries one arrow; the instant contact begins, a dashed ghost of the starting momentum is left standing and the live arrow begins to shrink away from it.',
      'On its own row beneath that line an accent arrow reaches from the tip of the ghost to the tip of the live arrow, and it lengthens at exactly the pace the area on the graph fills.',
      'When the filled area has reached the size of the starting momentum, the accent arrow’s tip arrives at zero and the live arrow disappears — the ball is momentarily at a stand — and a dashed mark of the same shape stands at that place on both the graph and the line.',
      'Past that mark the live arrow grows out the other way while the accent arrow keeps lengthening at the same pace, so its tip runs on past zero.',
      'At the end the accent arrow is plainly longer than the ghost of the starting momentum, and the filled area on the graph is divided by the dashed mark into the part that halted the ball and the part that sent it back.',
    ],

    screen: {
      affordances: [
        'The approach, the contact and the departure run in order and then begin again; nothing has to be pressed.',
        'The contact is drawn out about twelvefold while the ball stays against the wall, so the filling of the area and the travel of the arrow can be watched side by side rather than inferred from before and after.',
        'The accent colour is kept for impulse alone and is used in both places — the area and the arrow — so the two read as one thing rather than as a cause and a result.',
        'The squash of the ball tracks the size of the push, which ties the height of the curve to something happening in the picture.',
        'No scale, tick or value is written, so the two lengths are compared against each other rather than read off.',
      ],
    },

    useWhen: [
      'The reader has the rule that impulse equals change of momentum and is carrying it as an equation between two symbols. Watching the area fill and the arrow lengthen at the same pace is what makes the equality an event.',
      'The article claims that a body which rebounds undergoes more change than one which is merely stopped, and a case is wanted where the two parts of that change are separated on the picture itself.',
    ],

    avoidWhen: [
      'The point is that drawing the contact out in time keeps the force small — airbags, crumple zones, bending at the knees, a landing mat. Nothing here changes the length or the shape of the push; there is one push and it is always the same one.',
      'Two bodies are exchanging momentum and the article is about what the pair has between them. The wall is never given a momentum here, and only the ball’s is drawn.',
      'The subject is how bouncy the ball is, or what a different bounciness would do. There is one bounce and no way to change it.',
      'The subject is the force at the moment of impact — how many newtons, how the peak compares with the body’s weight. No size is written anywhere.',
      'The article needs values in newton seconds or kilogram metres per second, or an area to be worked out. Nothing is numbered.',
    ],

    contrastWith: [
      {
        concept: 'impulse-force-relation',
        note: 'One says the accumulated push is the change of momentum and watches it accumulate; the other holds that accumulated push fixed and asks what stretching its duration does to the force.',
      },
      {
        concept: 'conservation-of-momentum',
        note: 'One follows a single body and the momentum an outside push takes from it; the other follows a pair and the total that no push between them can shift.',
      },
      {
        concept: 'newtons-second-law',
        note: 'One measures a push by what it adds up to over an interval; the other reads the same push at an instant, as the rate at which speed is being gained.',
      },
      {
        concept: 'ballistic-pendulum',
        note: 'One is about the momentum a single push delivers; the other is about which conserved quantity may be carried across each of two stages, and why one rule cannot serve for both.',
      },
    ],
  },
};
