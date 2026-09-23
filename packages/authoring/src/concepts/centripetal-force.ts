/**
 * centripetal-force 개념 선언.
 *
 * 원운동 형제 넷 가운데 하나다. **주어와 주장을 넷으로 갈랐다.**
 *   centripetal-force  안쪽 힘이 **없어지면 어디로 가는가** — 바깥이 아니라 접선
 *   conical-pendulum   매달린 줄이 그 힘을 **무엇으로 대는가**, 그리고 무엇을 정하는가(깊이)
 *   banked-curve       기울인 노면이 그 힘을 **얼마나 대는가** — 모자람·넘침 둘 다 실패
 *   vertical-loop      그 힘이 **스스로 바닥나는 자리** — 꼭대기 전에 레일을 떠난다
 * 이쪽만 놓음·접선·가상의 바깥힘 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const centripetalForceConcept: Aperi21ConceptSource = {
  id: 'centripetal-force',
  label: 'Centripetal Force',
  canonicalSim: 'aperi21:centripetal-force',

  surface: {
    definition:
      'The inward force that keeps a body on a circular path, whose removal sends the body off along the tangent it then had rather than outward from the centre.',
    exemplarKeywords: [
      'centripetal force',
      'is centrifugal force real',
      'what happens when you let go of a whirling ball',
      'ball on a string released',
      'flies off at a tangent not straight outward',
      'the force points to the centre',
      'why does it not fly straight out',
      'hammer throw release',
      'mud thrown off a spinning wheel',
      'the string breaks while it is being swung round',
    ],
  },

  briefing: {
    observable: [
      'A ball circles a fixed centre on a taut string, and an arrow from the ball points straight in at that centre for the whole time it is held.',
      'The path it goes round is drawn as a faint dotted ring, so the circle is there to compare against afterwards.',
      'At the moment the string is let go, a short dashed line is laid outward from the centre through the ball, and the ball’s own path is traced beside it.',
      'The trace comes out straight and set at an angle to the dashed outward line — it runs the way the ball was already travelling.',
      'The two lines are cut to the same length from the point of release, so nothing but their directions differ.',
      'After the flight the ball, the trace and the dashed line all fade, the string takes hold again, and the next release comes at a different place round the circle.',
      'Let go at the top the ball leaves sideways; let go at the side it leaves along the side — each time along the circle, never away from the centre.',
      'While the ball is held the caption says the string pulls it toward the centre at every moment and so bends a course that would otherwise be straight; on release it says the ball goes along the tangent and not along the dotted outward line.',
    ],

    screen: {
      affordances: [
        'A button at the lower right lets go of the string at whatever place the ball has reached, so the release is not only the one the run would have chosen.',
        'Left alone the run holds the ball for three seconds, releases, lets it fly, fades and takes hold again, moving the release a quarter turn each time.',
        'The trace and the outward dashed line are drawn the same length, which makes the comparison one of direction alone.',
        'The ball is taken round slowly enough that the straightness of the flight can be watched rather than assumed.',
      ],
    },

    useWhen: [
      'The reader carries the idea of a force flinging things outward and expects a released ball to fly away from the centre. Pressing the release at a place of their own choosing and finding the path along the circle instead of along the dashed outward line is what takes it away.',
      'The article needs the point where the inward force is named as the cause of the turning rather than of the going, and a screen where taking it away leaves straight motion behind.',
    ],

    avoidWhen: [
      'A value is wanted for the force, the speed, the radius or the period. No numbers appear anywhere on this screen.',
      'The subject is what supplies the inward force in a particular case — a road, a rail, gravity, or a string hanging at a slant. Here it is always a plain string, and the string is the thing let go of.',
      'The article is about circular motion in an upright plane, where the pace round the circle changes with height. This circle lies flat and the ball keeps one pace.',
      'The point is that the inward force sets how fast the body goes. The pace never changes here; only the direction does.',
      'The body is meant to spiral outward or inward gradually. The ball holds one circle and then leaves it in a straight line, with nothing in between.',
    ],

    contrastWith: [
      {
        concept: 'conical-pendulum',
        note: 'One asks what the inward force does and where the body goes without it; the other asks what supplies it when a string hangs at a slant, and what the slant then settles.',
      },
      {
        concept: 'banked-curve',
        note: 'One takes the inward force away altogether; the other asks how much of it a tilted road can give, and what goes wrong when that is too little or too much.',
      },
      {
        concept: 'vertical-loop',
        note: 'One removes the inward force on purpose and asks where the body goes; the other waits for it to run out by itself and asks where round the loop that happens.',
      },
      {
        concept: 'uniform-motion',
        note: 'The flight after the release is motion at unchanging velocity; the other concept is about that motion in its own right, read off the evenly spaced marks it leaves.',
      },
    ],
  },
};
