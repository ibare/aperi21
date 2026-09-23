/**
 * angle-of-friction 개념 선언.
 *
 * 경사면 형제는 `inclined-plane`. **주어와 주장을 갈랐다.**
 *   angle-of-friction  주어는 **각** — 기울여 가다 버팀이 무너지는 문턱, 얹은 무게가 그 각을 바꾸지 않는다
 *   inclined-plane     주어는 **중력 벡터** — 어느 각에서든 두 성분으로 갈리는 모양, 물체는 끝내 안 움직인다
 * 이쪽만 마찰·문턱·시작 어휘를 갖고, 저쪽만 분해·성분 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const angleOfFrictionConcept: Aperi21ConceptSource = {
  id: 'angle-of-friction',
  label: 'Angle of Friction',
  canonicalSim: 'aperi21:angle-of-friction',

  surface: {
    definition:
      'The tilt at which a body resting on a slope first breaks loose, a threshold fixed by the pair of surfaces and unchanged by how much weight is stacked on.',
    exemplarKeywords: [
      'angle of friction',
      'angle of repose',
      'tilting a board until the box slides',
      'does a heavier stack slip at a smaller angle',
      'tangent of the angle equals the coefficient of static friction',
      'when does static friction give way',
      'the slope where sliding begins',
      'critical angle before slipping',
      'ramp test for grip',
      'pressed down harder but also harder to push along',
    ],
  },

  briefing: {
    observable: [
      'A plank hinged at its lower end is already leaning a little when the round opens, and it goes on tilting steadily; an arc at the hinge carries the angle in degrees, counting up as it rises.',
      'Two loads ride the plank — a single box low down and a stack of identical boxes higher up — and how many go in the stack is what the slider decides.',
      'Both loads let go in the same frame at the same angle, a little short of twenty-seven degrees, and they slide down together until they meet the lip at the lower end.',
      'A tick is left across the arc at the angle where the slipping began, so that angle is marked on the arc itself rather than only stated.',
      'A list at the upper right gains a row each round — the stack that was carried, and beside it in the accent colour the angle at which it went — and the last four rounds stay in view together.',
      'Round after round the rows agree: two boxes, five boxes, the angle written is the same one.',
      'The caption speaks in the present while the plank is still rising and turns to the past tense once both loads have come to rest.',
      'The plank is laid flat again, the loads disappear, the next stack appears and it tilts once more; left alone it works through stacks of three, five, two and four.',
    ],

    screen: {
      affordances: [
        'A slider at the upper left sets how many boxes go in the heavy stack, from two to five in whole steps.',
        'A number chosen while the plank is still rising is taken up at once; chosen after the loads have gone, it waits for the next round, so no round is rewritten while it runs.',
        'Rounds start, tilt, slip and reset by themselves, cycling through stacks of three, five, two and four when nobody touches the slider.',
        'The record list keeps the last four rounds, so the angle just measured stands beside the ones measured for other stacks rather than replacing them.',
      ],
    },

    useWhen: [
      'The reader has been told that the tilt at which something slips does not depend on how heavy it is, and is still holding the thought that more weight means more grip. A single box and a stack of five letting go in the same frame, with the two identical angles then sitting side by side in the record, is what settles it.',
      'The article wants a threshold that belongs to a pair of surfaces rather than to a body, and needs a screen where the same threshold is found again with a different load on it.',
    ],

    avoidWhen: [
      'A coefficient of friction, a mass or a force is wanted as a number. Nothing on screen carries a value except the angle itself.',
      'The subject is how weight divides into a part along a surface and a part into it. No force arrows are drawn here at any tilt.',
      'The article is about what friction does once the body is already moving, or about how far it will travel. The loads slide only as far as the lip at the lower end, and that distance is not what is being shown.',
      'Two materials are being compared, or a surface is being roughened, polished or oiled. The single box and the stack sit on one board and nothing about the surfaces changes from round to round.',
      'The body is supposed to roll or to tip over rather than slide. Both loads stay flat on the board until they go, and they go by sliding.',
    ],

    contrastWith: [
      {
        concept: 'inclined-plane',
        note: 'One names the tilt at which holding gives way; the other says how a weight is already divided at every tilt, whether or not anything gives way.',
      },
      {
        concept: 'free-fall',
        note: 'Both end with the weight of the body dropping out of the answer — there for how quickly it falls, here for the tilt at which it starts to slide.',
      },
      {
        concept: 'static-friction',
        note: 'One is about the limit alone, read off as the tilt at which holding gives way and unmoved by how much weight is stacked on; the other is about the hold below that limit, which matches every pull exactly as the pull grows.',
      },
    ],
  },
};
