/**
 * angular-momentum-vector 개념 선언.
 *
 * 형제는 `gyroscopic-precession`. 둘 다 도는 바퀴와 축 위 화살표가 나오므로 definition 이
 * 붙기 쉽다. **화살표를 세우는 규칙이냐, 그 화살표를 돌리는 원인이냐**로 갈랐다.
 *   angular-momentum-vector  화살표가 **어디를 가리키는가** — 축 위, 오른손으로 정해진 끝
 *   gyroscopic-precession    돌림힘이 그 화살표를 **어떻게 돌리는가** — 떨어뜨리지 않고 옆으로
 * 이쪽만 오른손 규칙 · 엄지 · 감는 방향 · 뒤집힘 어휘를 갖는다. 돌림힘 · 무게 · 세차 ·
 * 떨어지지 않음이라는 말은 쓰지 않는다. 크기(관성 모멘트 · 값)도 이쪽 것이 아니다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const angularMomentumVectorConcept: Aperi21ConceptSource = {
  id: 'angular-momentum-vector',
  label: 'Direction of Angular Momentum',
  canonicalSim: 'aperi21:angular-momentum-vector',

  surface: {
    definition:
      'The rule fixing which way a rotation points: the arrow standing along the axis, with the right hand’s fingers curled the way the body turns and the thumb choosing the end.',
    exemplarKeywords: [
      'right-hand rule',
      'direction of angular momentum',
      'why does a spinning wheel have a direction',
      'curl your fingers with the spin and your thumb points along the axis',
      'which end of the axis does the arrow point to',
      'reversing the spin flips the vector',
      'the axis of rotation as a direction',
      'how can something turning in place be a vector',
      'the arrow lies along the axis, not along the motion',
      'clockwise and anticlockwise as opposite directions',
    ],
  },

  briefing: {
    observable: [
      'A wheel with three spokes is seen from above and slightly to one side, threaded on a dotted line that runs through it and out both ways, standing for the axis.',
      'A curved arrow wraps around the rim, sweeping the way the wheel turns and ending in a head, and a single mark on the rim lets the turning be followed.',
      'A bold arrow of its own colour stands along the dotted line, out from the wheel on one side; the dotted line always reaches further than the arrow does, so the arrow is seen to lie on it.',
      'The axis then tilts over to one side by about fifty degrees; the wheel, the curved arrow and the bold arrow all lean together, and the bold arrow stays on the dotted line throughout.',
      'The turning then slows down, stops, and picks up the other way; the curved arrow shrinks as it does, and the bold arrow shortens along with it.',
      'At the moment the curved arrow disappears the bold arrow is gone too — there is no arrow at all for an instant.',
      'The bold arrow then grows out of the other end of the same tilted axis, and the curved arrow wraps the rim the opposite way.',
      'Whichever end the bold arrow takes, it takes the end that the curled hand would send a thumb to.',
      'When the arrow points away from the viewer it shows through the face of the wheel rather than in front of it.',
      'The whole sequence dims and starts again from the upright, forward-turning wheel.',
    ],

    screen: {
      affordances: [
        'The turning, the tilt, the reversal and the regrowth run on their own and repeat, so both things the arrow does come round without anything being asked for.',
        'The bold arrow carries one colour used for nothing else, and the curled arrow round the rim is left in the plain line colour, so the two are related by the geometry rather than by matching colours.',
        'The length of the bold arrow follows how fast the wheel is turning, which is what makes the reversal a passage through nothing rather than a jump from one end to the other.',
        'The viewpoint is fixed, so the axis is seen to tilt rather than the scene to rotate.',
        'The tilt is chosen so the face of the wheel stays half open and the axis keeps nearly its full length, which lets the curl and the arrow be read together throughout.',
        'The hand itself is not drawn; the curled arrow around the rim and the arrow along the axis stand for the fingers and the thumb, and the sentence names them.',
        'No spin rates, angles or magnitudes appear anywhere.',
      ],
    },

    useWhen: [
      'The article has just told the reader to point the thumb along the axis and the reader cannot see why a body going nowhere should have a direction at all. An arrow that stays glued to a tilting axis and then walks out of the other end when the spin reverses is what makes the direction a property of the rotation.',
      'The writing needs the reversal treated as a continuous thing — the arrow shrinking through nothing and regrowing the other way — rather than as a sign flip in an equation.',
    ],

    avoidWhen: [
      'The question is how much angular momentum there is, or how it depends on the mass and its arrangement. Nothing here is measured and nothing about the wheel changes but its spin.',
      'Something is being applied to the spinning body and the point is what that does to it. Nothing acts on this wheel; the axis is simply shown in two orientations.',
      'The subject is a body speeding up or slowing its rotation under an applied turning effort. The reversal here is shown, not accounted for.',
      'The article is about a quantity being kept constant while a body pulls in or spreads out. This wheel neither changes shape nor conserves anything.',
      'The reader needs a numerical answer or a formula worked through. The screen has no figures.',
    ],

    contrastWith: [
      {
        concept: 'gyroscopic-precession',
        note: 'One establishes which way the arrow points and that it lives on the axis; the other takes that as given and is about what happens to the arrow when something tries to tip it.',
      },
      {
        concept: 'angular-acceleration',
        note: 'One is about the direction a rotation is assigned; the other is about how fast that rotation is changing and what changes it.',
      },
      {
        concept: 'uniform-circular-motion',
        note: 'One is about a body turning in place and the direction given to that turning; the other is about a body carried around a circle and the direction it is actually travelling.',
      },
      {
        concept: 'vector-addition',
        note: 'Both are about arrows standing for physical quantities, but one is about how the direction of such an arrow is decided for a rotation and the other about combining arrows once they exist.',
      },
      {
        concept: 'angular-momentum',
        note: 'One fixes which way a rotation points and which end of the axis is chosen; the other is about how much of it there is, and that having more of it makes the axis harder to turn aside.',
      },
    ],
  },
};
