/**
 * direction-of-acceleration 개념 선언.
 *
 * 형제는 `average-acceleration`. 갈림은 **무엇을 말하는가**다.
 *   average-acceleration      크기 — 두 끝 속도가 정하고 중간 이력은 떨어져 나간다
 *   direction-of-acceleration 방향 — 속도와 같은 쪽이냐 반대쪽이냐가 빨라짐/느려짐을 정한다
 * 크기 어휘(값 · 나눗셈 · 기울기)를 이쪽에는 한 낱말도 두지 않았다. 화면에서도 두 레인의
 * 가속도 화살표 길이가 같고 다른 것은 방향 하나뿐이다.
 *
 * `gravitational-acceleration` 과도 갈라 둔다 — 저쪽은 아래 하나로 고정된 방향을 두고
 * 속도가 뒤집히는 이야기를 하고, 이쪽은 방향 자체를 둘로 나눠 나란히 놓는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const directionOfAccelerationConcept: Aperi21ConceptSource = {
  id: 'direction-of-acceleration',
  label: 'Direction of Acceleration',
  canonicalSim: 'aperi21:direction-of-acceleration',

  surface: {
    definition:
      'Whether acceleration points along the velocity or opposes it, which is what decides speeding up from slowing down, the size of the acceleration deciding neither.',
    exemplarKeywords: [
      'direction of acceleration',
      'can something be accelerating and slowing down',
      'negative acceleration',
      'braking counts as acceleration',
      'deceleration',
      'acceleration opposite to the direction of motion',
      'pushed backwards while still moving forwards',
      'sign of the acceleration',
      'what a minus sign in front of a means',
      'why slowing down is called acceleration',
    ],
  },

  briefing: {
    observable: [
      'Two balls set off from the same start line at the same speed, one along an upper lane and one along a lower lane.',
      'Each ball carries two arrows — a dark one ahead of it for its velocity, and an accent-coloured one above it, each named in words at its tip.',
      'The accent arrow is exactly the same length in both lanes; the single difference on screen is that the upper one points forward and the lower one points back.',
      'The dark arrow grows longer in the upper lane and shorter in the lower one as the run goes on.',
      'Each ball drops a dot every half second: the upper dots open out further and further apart, the lower dots crowd closer and closer together.',
      'The lower ball’s velocity arrow shrinks away to nothing and the ball stands still, while the accent arrow above it keeps its full length and its backward pointing.',
      'The name beside a velocity arrow disappears once the arrow is too short to carry it, so the dark arrow is last seen as a stub and then is gone.',
      'The written line follows the run — both alike at the start, then one gaining while the other loses, then the second having come to a stop.',
    ],

    screen: {
      affordances: [
        'The two lanes run side by side off one clock and then repeat, so the comparison arrives without anything being set.',
        'The two lanes are built to differ in exactly one thing, which lets the difference in outcome be pinned on the way the accent arrow points.',
        'Both arrows are named in words at their tips rather than left to colour, so which arrow is which can be told without a key.',
      ],
    },

    useWhen: [
      'The reader hears "acceleration" as "getting faster" and is stuck on how a braking car can be accelerating. Two balls alike in every arrow except which way one of them points is the case to write on.',
      'Signs on a one-dimensional axis are about to be introduced, and the physical meaning of the minus is wanted before the algebra arrives.',
    ],

    avoidWhen: [
      'The subject is how large an acceleration is, or how its value is worked out. Both lanes carry one size throughout and not a single number is written.',
      'The topic is acceleration that turns a body rather than changing its speed — circular motion, a bend, a sideways push. Both arrows lie along one straight lane.',
      'The text is about what happens after a slowing body reaches zero. The lower ball halts and stays halted; it is never shown going back the other way.',
      'The argument needs a body falling or thrown under gravity. The lanes are level and nothing drops.',
    ],

    contrastWith: [
      {
        concept: 'average-acceleration',
        note: 'One says nothing about size and everything about which way it points relative to the velocity; the other says the size is fixed by the two end velocities whatever happened between.',
      },
      {
        concept: 'gravitational-acceleration',
        note: 'One splits pointing-with from pointing-against and lays both out at once on level ground; the other keeps one fixed downward pointing and asks what it does to a velocity that reverses.',
      },
    ],
  },
};
