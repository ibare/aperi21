/**
 * non-inertial-frame 개념 선언.
 *
 * 가속 기준틀 셋(`non-inertial-frame` · `fictitious-force` · `coriolis-effect`)이 이 묶음에서
 * 가장 붙기 쉽다. **주장의 주어**로 갈랐다.
 *   non-inertial-frame  **아무것도 밀지 않았다** — 틀이 빠져나가는 것이 밀림으로 보인다
 *   fictitious-force    **도입한 그 힘의 크기** — 중력처럼 질량에 비례한다
 *   coriolis-effect     **경로의 모양** — 곧게 던진 것이 휜 길로 그려진다
 * 이쪽만 곧게 가속하는 탈것 · 제자리에 남은 물체 어휘를 갖는다. 힘 어휘는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const nonInertialFrameConcept: Aperi21ConceptSource = {
  id: 'non-inertial-frame',
  label: 'Non-Inertial Frame',
  canonicalSim: 'aperi21:non-inertial-frame',

  surface: {
    definition:
      'Motion as told from a frame that is itself picking up speed, where a body nothing has touched sets off backwards because the frame is drawing away from under it.',
    exemplarKeywords: [
      'non-inertial frame',
      'accelerating frame of reference',
      'why does a ball roll backwards when the bus pulls away',
      'thrown back in your seat as the train starts',
      'what pushed it if nothing touched it',
      'standing in a lift that starts moving',
      'the frame itself is accelerating',
      'seen from the road versus seen from inside',
      'a body left alone in a starting vehicle',
      'why laws of motion seem to fail inside a vehicle',
    ],
  },

  briefing: {
    observable: [
      'Two panels lie one above the other, each carrying a written label naming whose account it is — seen from the road, seen from inside the bus.',
      'Both draw the very same instant. A bus stands on a road with a ball on its floor, and a dashed spot marks the piece of road the ball was put down over.',
      'The bus sets off. In the upper panel the ball stays squarely over its dashed spot on the road while the bus slides forward out from under it.',
      'In the lower panel the bus holds still, the roadside ticks stream backwards past it, and the ball slides toward the back wall as though something were taking it there.',
      'The ball meets the back wall at the exact moment its sliding stretch ends, and from there on it travels forward with the bus in both panels.',
      'The bus then dims away and comes back standing at its starting place, with the ball once more in the middle of the floor.',
      'The wheels turn while the bus runs, and the ticks along the road say how much ground it has covered.',
      'The claim is made with places rather than with quantities — the dashed spot the ball keeps, and the roadside ticks the bus passes.',
    ],

    screen: {
      affordances: [
        'A round of five seconds runs and repeats by itself; arriving, the bus has already pulled away and the ball is on its way to the back wall.',
        'Both panels are driven off one clock, so the same instant is drawn twice and the comparison is made by looking from the upper account to the lower one.',
        'Each panel keeps its own frame throughout — the upper one fixed to the road, the lower one fixed to the bus — so which frame an account belongs to is settled by its label and never changes under the reader.',
      ],
    },

    useWhen: [
      'The reader has felt himself thrown backwards as a vehicle starts and is looking for what did the throwing. The upper panel, where the ball simply stays where it was, is what takes the question apart.',
      'The article is about to say that the usual laws hold only in frames that are not speeding up, and the thing needed first is one motion that appears in one frame and is absent in the other.',
    ],

    avoidWhen: [
      'The article wants a force with a size attached to it — what to call it, what it is proportional to, how big it comes out. Nothing here is drawn as an arrow.',
      'The frame in question is turning rather than picking up speed along a line. The bus runs straight down a road.',
      'Both observers are moving steadily with respect to each other, with neither of them speeding up. The whole argument here turns on one of them starting.',
      'The subject is how the bus itself speeds up — how its velocity grows, or how far it gets in a given time. No speed, distance or time is written.',
    ],

    contrastWith: [
      {
        concept: 'fictitious-force',
        note: 'One says nothing pushed the body and the appearance comes from the frame pulling away; the other takes the appearance at its word, introduces a force for it, and asks what that force is proportional to.',
      },
      {
        concept: 'coriolis-effect',
        note: 'One has a frame picking up speed along a line, so what appears is a body left behind; the other has a frame turning, so what appears is a path bent to one side.',
      },
      {
        concept: 'reference-frame',
        note: 'One has two observers in steady relative motion, where both accounts stand as they are; the other has one of them speeding up, so his account contains a motion with nothing behind it.',
      },
    ],
  },
};
