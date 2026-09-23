/**
 * inelastic-collision 개념 선언.
 *
 * 충돌 다섯 중 하나. 이 조각은 두 물체의 견줌이 아니라 **공과 바닥의 한 번의 충돌에서
 * 얼마가 사라지는가, 그리고 그것이 매번 같은 비율로 되풀이된다** 하나를 주장한다.
 *   inelastic-collision            튈 때마다 꼭짓점이 **같은 비율**로 낮아진다 —
 *                                  모자란 높이가 그 한 번에 사라진 양
 *   energy-in-collision            세 반발 계수를 **나란히** 놓고 무엇이 남는지 견준다
 *   perfectly-inelastic-collision  하나도 안 돌려받는 끝점, 그리고 함께 가는 속력
 *   elastic-collision              전부 돌려받는 끝점, 그리고 속도의 맞바꿈
 * 이쪽만 반발 계수 · 되풀이 · 「놓은 높이까지 못 올라온다」 어휘를 갖는다. 운동량 · 충돌
 * 종류의 견줌은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const inelasticCollisionConcept: Aperi21ConceptSource = {
  id: 'inelastic-collision',
  label: 'Energy Lost in a Rebound',
  canonicalSim: 'aperi21:inelastic-collision',

  surface: {
    definition:
      'A rebound that returns only a fixed fraction of the speed that arrived, so each bounce tops out the same proportion lower, the height never reached measuring what that one impact took.',
    exemplarKeywords: [
      'inelastic collision',
      'coefficient of restitution',
      'why a dropped ball never comes back to the height it fell from',
      'a bouncing ball dying down',
      'energy lost in a bounce',
      'rebound speed is less than impact speed',
      'each bounce is lower than the one before',
      'bounce height ratio',
      'how bouncy is it',
      'the ball keeps some of it and loses some',
    ],
  },

  briefing: {
    observable: [
      'A ball is released from a height and drifts steadily sideways as it bounces, so the arches it draws stand in a row instead of piling onto one another.',
      'At each high point a dashed level line starts there and runs right alongside the ball, so the next arch has something to fall short of.',
      'The next arch turns back below that line, and the gap between the line and the new high point stands as an accent measure, the first of them named as the energy lost.',
      'Inside the arches the high points are named `h`, `e²h`, `e⁴h`, `e⁶h`, `e⁸h`, so the sameness of the step is said by the symbols rather than by any number.',
      'At the first landing the arriving speed and the departing speed stand as two arrows on either side, the arriving one dashed and clearly the longer, with `e = 0.8` written beneath them.',
      'A half-circle ripple spreads out from each landing point in the accent colour, and it is smaller at every later landing.',
      'Once the bouncing has died away the ball stands still and the whole trail is held on screen — five named high points, four measures between them, each shorter than the last, and a tail of small quick arches beyond.',
      'The measures and the names stop after the fifth high point, while the trail keeps going.',
    ],

    screen: {
      affordances: [
        'The drop, the run of bounces and the holding of the finished trail happen in order and then begin again; nothing has to be pressed.',
        'Sideways drift is what spreads the bounces out, and the floor is smooth so the sideways speed never changes and cannot be mistaken for part of the story.',
        'The energy is read as height rather than from a bar, because in a bouncing ball the height already is the energy.',
        'The accent colour is kept for the lost share alone, in both the measures and the ripples; arriving and departing speed are the same colour and are told apart by one being dashed.',
        'The bounciness is written as a single symbol and nothing else on the screen carries a number, so what is compared is a run of heights.',
      ],
    },

    useWhen: [
      'The reader accepts that a collision loses energy but has no size for the loss. The gap between the dashed line and the next high point gives that loss a length on the picture.',
      'The article claims the same proportion goes at every impact, and a row of high points stepping down is wanted rather than a single before-and-after pair.',
      'The reader is puzzled that a ball stops bouncing at all, and the shrinking measures make the dying away a consequence of one constant rather than of tiredness.',
    ],

    avoidWhen: [
      'Two moving bodies are colliding and the article is about what the pair has between them, or what each carries away. There is one ball and a floor here, and the floor is never given a motion.',
      'The bodies in the article stay together after the impact and go on as one.',
      'The article sets different kinds of collision beside each other to establish which quantity survives which.',
      'The question is where the lost energy went — into heat, sound, a squashed shape. The ball never deforms here and nothing is drawn leaving it.',
      'Values are wanted — joules lost, a percentage, a bounce height in metres. Only symbols are written.',
      'The subject is momentum, or that something is conserved through the impact. Nothing here is summed or held constant.',
    ],

    contrastWith: [
      {
        concept: 'elastic-collision',
        note: 'One is the case where a body comes away with a fixed part of what it arrived with, again and again; the other is the case where the whole of it comes away, and passes to a second body.',
      },
      {
        concept: 'perfectly-inelastic-collision',
        note: 'One measures how much of a bounce is returned when some of it is; the other is the end of that range, where none is returned and the bodies go on together.',
      },
      {
        concept: 'energy-in-collision',
        note: 'One follows one degree of bounciness through many impacts and measures what each takes; the other sets three degrees of bounciness against one another at a single impact.',
      },
    ],
  },
};
