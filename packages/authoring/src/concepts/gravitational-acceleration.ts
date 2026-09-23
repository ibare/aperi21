/**
 * gravitational-acceleration 개념 선언.
 *
 * 형제는 `free-fall`. 갈림은 주어다 — 이쪽은 **한 물체의 속도가 어떻게 변하는가**,
 * 저쪽은 **무게가 다른 둘의 견줌**이다. 이쪽만 순간 속도·변화량·꼭대기 어휘를 갖는다.
 *
 * 화면에 조작기가 없다. affordances 에 "조작이 없다" 를 적지 않고 **무엇이 저절로
 * 일어나는지**를 적는다 — 없는 것을 적으면 그 개념을 맥락에 집어넣는 역효과만 낸다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const gravitationalAccelerationConcept: Aperi21ConceptSource = {
  id: 'gravitational-acceleration',
  label: 'Gravitational Acceleration',
  canonicalSim: 'aperi21:gravitational-acceleration',

  surface: {
    definition:
      'The steady downward change of velocity of a body in flight, which is the same in every equal interval and does not pause at the top where the body is momentarily at rest.',
    exemplarKeywords: [
      'gravitational acceleration',
      'g is 9.8 metres per second squared',
      'is the acceleration zero at the top of a throw',
      'velocity zero but acceleration not zero',
      'ball thrown straight up',
      'slowing down then speeding up',
      'equal change of velocity in equal times',
      'acceleration points down the whole time',
      'at the highest point of the path',
      'deceleration on the way up',
    ],
  },

  briefing: {
    observable: [
      'A ball is thrown straight up and comes back down, and an arrow drawn from it is its velocity — long at the start, shorter as it rises.',
      'A second arrow, drawn in the accent colour, is how much the velocity changed over the last fifth of a second. It points down and it is the same length in every one of those intervals, going up and coming down alike.',
      'At the top the velocity arrow is gone and a small dot stands in its place, while the change arrow beside it stays exactly the length it has had all along.',
      'Samples are taken at even intervals, so the arrows can be compared one against the next rather than watched as a blur.',
      'On the way up the caption says it slows by the same amount every equal interval; at the top it says the speed is zero but the downward change stays the same; coming down it says it speeds up by the same amount.',
      'The rise, the top and the fall run at half speed, and the screen holds for two seconds after landing with the closing line that the velocity never stopped at zero.',
      'Going down, the velocity arrow grows in the same steps by which it shrank going up, so the two halves of the flight are the same run read in opposite directions.',
    ],

    screen: {
      affordances: [
        'The throw runs and repeats on its own, with the rise, the top and the fall slowed to half speed and a two second hold after landing.',
        'Everything the argument needs is on screen at once — the ball, its velocity, and the change in that velocity over a fixed interval — so the comparison is made by looking from one arrow to the next.',
      ],
    },

    useWhen: [
      'The reader has to be talked out of "at the top it is stopped, so nothing is pulling it any more". The moment where the velocity arrow disappears and the change arrow stays the same length is the one to write against.',
      'The article claims that acceleration is a rate of change rather than a speed, and needs a screen where the two are drawn separately and one of them goes to zero while the other does not.',
    ],

    avoidWhen: [
      'The point is that the fall does not depend on weight. Only one body flies here and it has no weight written on it.',
      'The article is about a projectile thrown at an angle, or about the shape of a path. The flight is straight up and straight back down.',
      'The subject is how strong gravity is somewhere else — on another planet, high above the ground, or inside the Earth. The strength never changes here and no number for it is shown.',
      'The article is about reading motion off a position-time or velocity-time graph. No axes are drawn; the argument is made with arrows on the moving body itself.',
      'Air resistance matters to the argument. The rise and the fall are exact mirrors, which is only true because nothing resists.',
    ],

    contrastWith: [
      {
        concept: 'free-fall',
        note: 'One asks what gravity does to a single velocity moment by moment; the other asks whether what it does depends on the body, and answers that it does not.',
      },
    ],
  },
};
