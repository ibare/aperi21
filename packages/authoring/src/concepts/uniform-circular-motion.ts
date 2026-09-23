/**
 * uniform-circular-motion 개념 선언.
 *
 * 이 묶음에서 유일하게 곡선 궤도를 도는 것이라 형제가 붙지 않는다. 대신 이미 선언된
 * `uniform-motion` 과 갈랐다 — **무엇이 그대로인가**가 다르다.
 *   uniform-circular-motion  **속력**만 그대로, 방향은 쉬지 않고 바뀐다
 *   uniform-motion           **속도**가 통째로 그대로 (방향까지)
 * 이쪽만 「길이는 같은데 돌아간다」·한 점에 모은 화살표 어휘를 갖는다.
 * 가속도의 방향과 크기는 `centripetal-acceleration` 의 몫이라 여기서 말하지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const uniformCircularMotionConcept: Aperi21ConceptSource = {
  id: 'uniform-circular-motion',
  label: 'Uniform Circular Motion',
  canonicalSim: 'aperi21:uniform-circular-motion',

  surface: {
    definition:
      'Going round a circle at unchanging speed, where the velocity keeps its size the whole way but never holds its direction, turning through every bearing once each lap.',
    exemplarKeywords: [
      'uniform circular motion',
      'constant speed around a circle',
      'is velocity changing if speed is constant',
      'direction of velocity keeps changing',
      'velocity is tangent to the circle',
      'going round a roundabout at a steady speed',
      'speed constant but velocity not',
      'ball on a string swung in a circle',
      'one lap of a circular orbit',
      'why circular motion counts as accelerated',
    ],
  },

  briefing: {
    observable: [
      'A body travels round a faint circular track at a steady rate, carrying an arrow that stands for its velocity and always lies along the direction it is heading, square to the line out from the centre.',
      'That arrow is the same length at every point of the lap, whether the body is at the top, the side or the bottom of the circle.',
      'Along the track, arrows from the recent past are left standing where they were taken, one every thirty degrees, fading with age so the freshest is the clearest.',
      'Those left-behind arrows all have the same length as the current one and point in a ring of different directions — the same arrow, rotated.',
      'Off to the side, a second copy of every one of those arrows is drawn from a single fixed point, gathered tail to tail, with a small dot marking where they all start.',
      'Gathered at that point the arrows fan out around the full turn, and their tips mark out a circle of their own without any circle having been drawn for them.',
      'A note beside the fan reads that these are the same arrows, gathered at one point.',
      'The caption states that the arrow keeps its length and only its direction keeps turning.',
      'The reader arrives with the body already part way round and several arrows already standing.',
    ],

    screen: {
      affordances: [
        'The lap runs and repeats by itself at an even rate, and the trail of past arrows holds one full lap, so a complete set of directions is on screen at once.',
        'The same velocity is drawn twice, once where the body is and once gathered with its predecessors at a fixed point, so the equal lengths can be compared side by side instead of across the width of the circle.',
        'The gathered arrows are laid tail to tail, which is what lets the constancy of length and the turning of direction be read as two separate facts about one arrow.',
        'The tips of the gathered arrows are left to trace out their circle on their own, with no outline drawn ahead of them.',
      ],
    },

    useWhen: [
      'The reader treats constant speed as meaning nothing is changing. The fan of equal arrows pointing every which way is the picture that separates the size of a velocity from its direction.',
      'The article is about to argue that circular motion is accelerated and needs the change it is accelerating in to be visible first — the turning of the arrow, with its length held.',
      'The claim is that velocity is a direction as well as a size, and a case is wanted where only one of the two varies, so that the reader cannot attribute the change to the other.',
    ],

    avoidWhen: [
      'The subject is the acceleration of the circling body — which way it points, how big it is, or the difference between two velocities. No such arrow is drawn; that is a separate screen.',
      'The article is about what holds the body on the circle — a string, a force, the road. No forces appear and nothing shows why the body does not leave the track.',
      'The speed, the radius, the period or the number of laps are wanted as figures. Not one number is written.',
      'The motion in question speeds up or slows down around the loop, or the track is not a circle. This lap is at an even rate around a fixed circle.',
      'The argument turns on turning rate, angle swept or radians as such. Angles are neither marked nor measured here.',
    ],

    contrastWith: [
      {
        concept: 'uniform-motion',
        note: 'One holds only the size of the velocity fixed and lets its direction turn without pause; the other holds the whole velocity fixed, direction included, which is why its marks fall in a straight line.',
      },
      {
        concept: 'direction-of-acceleration',
        note: 'One is the case where the speed never changes at all, so that only direction is left to change; the other turns on whether an acceleration speeds a body up or slows it down.',
      },
      {
        concept: 'average-velocity',
        note: 'One watches the velocity turn continuously through a lap; the other is a single figure got from two endpoints, which over a full lap returns nothing at all.',
      },
    ],
  },
};
