/**
 * conical-pendulum 개념 선언.
 *
 * 원운동 형제 넷 가운데 하나다. 이쪽 주어는 **매달려 수평 원을 도는 추**이고 주장은
 * **돌리는 빠르기만이 매단 점 아래 깊이를 정한다 — 줄 길이는 아니다**이다.
 * `centripetal-force` 는 그 힘을 없앴을 때, `banked-curve` 는 노면이 얼마나 대는가,
 * `vertical-loop` 은 그 힘이 바닥나는 자리다. 이쪽만 줄 길이·한 높이·눕는 각 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const conicalPendulumConcept: Aperi21ConceptSource = {
  id: 'conical-pendulum',
  label: 'Conical Pendulum',
  canonicalSim: 'aperi21:conical-pendulum',

  surface: {
    definition:
      'A bob whirled on a string in a level circle, where the rate of spin alone sets how far the circle lies below the pivot, whatever the string’s length.',
    exemplarKeywords: [
      'conical pendulum',
      'ball on a string swung in a horizontal circle',
      'the faster you spin it the flatter the string lies',
      'angle of the string in circular motion',
      'tension and weight in a horizontal circle',
      'depth below the pivot equals g over omega squared',
      'swinging a conker round on its string',
      'governor balls rise as the engine speeds up',
      'why the string can never come fully level',
      'string length drops out of the answer',
    ],
  },

  briefing: {
    observable: [
      'Three bobs hang from one point on a turning axis, each on a string of a different length, and all three are spun around it together.',
      'Each traces a horizontal circle of its own, drawn as a faint ellipse because the whole arrangement is looked at from a little above.',
      'A shaded plane in the accent colour is drawn where those circles lie, and it is one plane — the short string and the long ones all ride it.',
      'A dashed line drops from the pivot down to that plane, so the depth being claimed is drawn rather than only described.',
      'The shortest string stands nearly upright and the longest lies far out from the axis, yet their bobs sit at one level.',
      'Spin faster and the plane rises toward the pivot with all three bobs climbing together; spin slower and it sinks with all three going down together.',
      'However fast the spin is taken, the plane closes on the pivot without ever arriving there, and the strings never come level.',
      'Seen from this angle the three bobs line up and separate again as they come round, the nearest drawn over the ones behind it.',
      'One sentence stands below throughout: different string lengths, the same spin, one height — and the height rises as the spin does.',
    ],

    screen: {
      affordances: [
        'A slider along the bottom sets the rate of spin, with the rate shown beside it in radians per second.',
        'Take hold of the slider and the spin belongs to the reader from then on, staying at whatever rate it was left at; until it is touched the rate sweeps slowly up and down by itself.',
        'The plane and the dashed drop are worked out afresh at every rate, so the claim that one depth serves all three strings can be checked at any spin the reader stops on.',
        'The whole thing is viewed from slightly above the circles, which is what turns them into ellipses and lets the single shared level be seen at all.',
      ],
    },

    useWhen: [
      'The article has arrived at a depth below the pivot that depends on the rate of spin and not on the length of the string, and the reader has no picture for so odd a result. Three strings of different lengths with their bobs on one plane, at any rate the reader stops at, is that picture.',
      'The claim is that such a string can never be brought level however hard it is whirled, and a screen is wanted where the plane can be driven toward the pivot and seen not to reach it.',
    ],

    avoidWhen: [
      'The pendulum meant is the kind that swings to and fro in a plane, or its period is the subject. Nothing here swings; the bobs go round without ever turning back.',
      'The article needs the inward force named or drawn, or the pull of the string divided into parts. No arrows are drawn on the bobs at all.',
      'The subject is what happens when the string is released or snaps. The strings hold at every rate the slider reaches.',
      'The masses of the bobs are supposed to matter. The three are drawn alike and no weight is written on any of them.',
      'Numbers are wanted for the string lengths, the radii or the height. The only value on screen is the rate of spin.',
    ],

    contrastWith: [
      {
        concept: 'centripetal-force',
        note: 'One asks what supplies the turning when a string hangs at a slant and what that slant settles; the other asks what the turning force is for, and where the body goes without it.',
      },
      {
        concept: 'banked-curve',
        note: 'Both fix an angle from a rate of turning — here the angle a hanging string finds for itself, there the angle a road has to be built to.',
      },
      {
        concept: 'tension',
        note: 'One is about a string held at a slant and what its slant decides; the other is about what a straight rope hands on from one end to the other.',
      },
    ],
  },
};
