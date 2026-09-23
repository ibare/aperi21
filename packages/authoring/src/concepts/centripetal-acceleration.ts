/**
 * centripetal-acceleration 개념 선언.
 *
 * 이 묶음의 형제 넷이 전부 「가속도」다. **주어로 갈랐다.**
 *   centripetal-acceleration        속력이 안 바뀌는 물체의 **속도 변화** — 어디서 재도 중심을 향한다
 *   angular-acceleration            **도는 빠르기 자체**가 커진다 — 같은 0.5초가 더 넓은 각을 쓴다
 *   tangential-normal-acceleration  비스듬한 가속도의 **분해** — 한 몫은 길이만, 한 몫은 방향만 바꾼다
 *   radius-of-curvature             **경로의 굽음**을 길이로 잰다 — 속도도 가속도도 나오지 않는다
 *
 * 이쪽만 「꼬리를 맞댄 두 속도의 차」 · 「중심을 향함」 어휘를 갖는다. 크기(v²/r)는
 * 화면에 없으므로 definition 이 방향 하나만 주장하고, 크기는 avoidWhen 이 막는다
 * (`tasks/topic-gaps/entries/kinematics-3.md`).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const centripetalAccelerationConcept: Aperi21ConceptSource = {
  id: 'centripetal-acceleration',
  label: 'Centripetal Acceleration',
  canonicalSim: 'aperi21:centripetal-acceleration',

  surface: {
    definition:
      'The change in velocity of a body whose speed never alters, taken between two instants of a circular orbit and leaning toward the centre wherever it is measured.',
    exemplarKeywords: [
      'centripetal acceleration',
      'accelerating although the speed never changes',
      'why going round in a circle counts as accelerating',
      'which way the acceleration points on a circular orbit',
      'subtracting one velocity arrow from another',
      'tail to tail velocity vectors',
      'delta v aims at the centre',
      'centre-seeking',
      'the direction changes while the pace stays put',
      'acceleration on a circular track',
    ],
  },

  briefing: {
    observable: [
      'A ball runs round a faint circle at an unchanging pace, carrying ahead of it a blue arrow whose length never alters.',
      'A small mark sits at the centre of the circle — the place the argument will end up pointing at.',
      'The velocity at one instant is left behind as a paler copy; the velocity a moment later is left beside it, and the earlier copy slides over until the two stand tail to tail.',
      'The two kept arrows are plainly the same length and differ only in the way they lean.',
      'An arrow in the accent colour grows from the tip of the earlier one to the tip of the later one, closing the triangle, with Δv written beside it.',
      'Once it is complete the two velocity copies fade away and Δv alone is carried, keeping its direction, to the middle of the arc between the two instants — where it is seen to lie along the line to the centre.',
      'The Δv arrows from earlier rounds stay on screen and fade slowly; they stand at different places round the circle and every one of them lies along a line to the centre.',
      'The written line follows the steps: keep one velocity, put the next tail to tail, same length and only the direction changed, move the difference to the middle of the arc and it points to the centre.',
      'Each round takes its two instants a little further along than the last, so the construction never repeats in the same place twice.',
    ],

    screen: {
      affordances: [
        'The construction runs and repeats by itself, and each repeat picks its pair of instants at a fresh place on the circle.',
        'The two instants compared are set far enough apart that the two velocities and their difference stand as a triangle to look at rather than a hairline.',
        'Δv is drawn to the same scale as the velocities themselves, which is what lets the three arrows close on one another.',
        'The centre is marked, so that "toward the centre" is something to check by eye rather than to take on trust.',
        'The leftover arrows from earlier rounds are left standing at their own places, so the claim can be read off several places at once rather than one.',
      ],
    },

    useWhen: [
      'The reader will grant that a body going round is accelerating but not where that acceleration aims, and what is wanted is a construction that arrives at the answer out of two velocities rather than asserting it.',
      'The prose has just used the word centripetal and the centre-seeking in it has to be earned from velocities alone, before any force, string or formula is allowed in.',
    ],

    avoidWhen: [
      'Something has to be worked out — how large the acceleration is, how it answers to speed or radius, what v²/r means. Not one number is written and no magnitude is ever drawn; the whole argument is a direction.',
      'The subject is what holds the body on the circle: a string, a rail, gravity, a push. No force and no cause of any kind appears.',
      'The speed changes in the case being written about, or the body is entering or leaving a bend. The pace here is the same at every instant of every round.',
      'The article is about the period, the frequency or how many turns are made in a second. The clock is never read and no round is counted.',
    ],

    contrastWith: [
      {
        concept: 'angular-acceleration',
        note: 'One keeps the rate of turning fixed and asks what the turning does to a velocity; the other asks what happens when the rate of turning is itself picking up.',
      },
      {
        concept: 'tangential-normal-acceleration',
        note: 'One takes the case where the whole of the acceleration goes into turning and asks where it aims; the other takes one set at an angle and separates the half that turns from the half that changes the pace.',
      },
      {
        concept: 'direction-of-acceleration',
        note: 'One is about acceleration across the motion, which shifts the heading and leaves the pace alone; the other is about acceleration along it, where pointing with or against is the entire question.',
      },
    ],
  },
};
