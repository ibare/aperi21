/**
 * gravity-inside-earth 개념 선언.
 *
 * 위험한 형제는 `shell-theorem` 이다 — 둘 다 구 내부다. **주장을 갈랐다.**
 *   gravity-inside-earth  **꽉 찬** 구 — 깊이마다 값이 다르고 곧은 선으로 줄어 0 이 된다(그래프가 주인공)
 *   shell-theorem         **속 빈** 껍질 — 안에서는 어디서나 0 이고, 그 **이유**가 주인공
 * 이쪽만 「깊이 · 굴 · 지표가 가장 세다 · 곧은 선 · 꺾임」 어휘를 갖는다. 바깥 껍질이 왜 빠지는지는
 * 이름표 한 줄로만 말하고 원뿔 · 조각 어휘는 저쪽에 둔다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const gravityInsideEarthConcept: Aperi21ConceptSource = {
  id: 'gravity-inside-earth',
  label: 'How Gravity Falls Away Below the Surface',
  canonicalSim: 'aperi21:gravity-inside-earth',

  surface: {
    definition:
      'Down a shaft into a solid body of even density only the sphere still beneath the traveller draws, so the pull is greatest at the surface and dwindles along a straight line to nothing at the middle.',
    exemplarKeywords: [
      'gravity inside the Earth',
      'is gravity stronger if you dig down',
      'g at depth',
      'a tunnel through the centre of the Earth',
      'gravity at the centre is zero',
      'strongest at the surface, not at the core',
      'deep mine shaft gravity',
      'how gravity varies with radius inside a planet',
      'falling through a hole in the Earth',
      'uniform density planet interior',
    ],
  },

  briefing: {
    observable: [
      'A planet is drawn in section, and a small dark body comes in toward it from well outside along the horizontal line through its middle, that line being both the route in and the axis of a graph whose origin is the planet centre.',
      'The height of the curve directly above the body is the strength of gravity where the body is, so the two pictures are read without any line drawn between them.',
      'While the body is outside, the whole planet is filled in the accent colour as the matter doing the pulling, and the arrow toward the centre lengthens as the body approaches.',
      'At the surface the arrow is at its longest and the graph point sits on a corner marked with the surface value and the planet radius.',
      'As the body descends, the accent-coloured ball shrinks with it, always reaching exactly as far out as the body, and the grey rind left outside carries a note that it sums to nothing.',
      'Through the whole descent the graph point comes down from the corner along a straight line, while the arrow shortens.',
      'At the middle the arrow and the coloured ball are both gone, the graph point has reached the origin, and a small reading says that gravity is zero there.',
      'A faint copy of the whole curve is laid down in advance, and the part the body has already passed is drawn over it in ink, so the curve is seen to be traced rather than presented.',
      'The outside part of the curve is a tail that falls away smoothly, and it meets the straight inside part at the corner over the surface.',
      'No value for the present strength is written at any depth; only the surface figure, the radius and the zero at the middle appear.',
      'The whole descent runs and repeats by itself.',
    ],

    screen: {
      affordances: [
        'The approach, the pause at the surface, the descent and the arrival at the middle happen in order and then begin again; nothing has to be pressed.',
        'The graph shares its origin with the centre of the planet, so the position in the section and the position on the curve are the same horizontal position.',
        'The straight line is worked out from the shrinking ball — its mass against its radius — rather than drawn as a straight line, so its straightness is a result.',
        'The accent colour is kept for one meaning only: the matter that is still doing the pulling at this moment, which is the whole planet from outside and a shrinking ball from within.',
        'The arrow and the graph height are driven by the same ratio, so they shorten in step.',
        'There are no axis ticks apart from the corner over the surface, and no grid, since what is to be read is the shape of the line and not a coordinate.',
        'The body stops at the middle and the cycle restarts, so the shaft is never travelled through to the far side.',
      ],
    },

    useWhen: [
      'The article has said that gravity weakens with depth and the reader expects it to strengthen toward the core, since the centre is where everything is being pulled toward. Watching the pulling ball shrink to nothing under the traveller is what makes the weakening reasonable rather than surprising.',
      'The prose wants the surface singled out as the place of greatest pull, with both the outward falloff and the inward falloff meeting there as one line with a corner.',
    ],

    avoidWhen: [
      'The body in the article is inside a cavity or a hollow shell, and the question is why the surrounding wall does nothing. The note on the outer rind states that result and does not argue it.',
      'The article uses the real Earth, with a dense core and a layered interior, and the shape of the actual curve matters. The planet here is taken as evenly dense, which is what makes the inside line straight.',
      'The point is an object dropped down a shaft and swinging back and forth through the planet. The traveller here stops at the middle and the run starts over.',
      'What is needed is the strength at particular depths, in metres per second squared, or a calculation from a formula. Only the surface value, the radius and the zero at the centre are written.',
      'The article is about a body outside a planet and how the pull changes with distance from it. The outside stretch here is a short approach that sets up the corner, not the subject.',
      'The subject is weight as felt on a scale, or a person feeling lighter. Nothing is weighed; what is drawn is an arrow and a curve.',
    ],

    contrastWith: [
      {
        concept: 'shell-theorem',
        note: 'One uses the result that matter further out than you contributes nothing, and asks what remains; the other is the argument for that result, in a sphere with nothing inside it at all.',
      },
      {
        concept: 'gravitational-field',
        note: 'One follows the value along a single line inward, where the source is progressively left behind; the other lays out values at places outside, where the whole source is always ahead.',
      },
      {
        concept: 'gravitational-acceleration',
        note: 'One is about where the pull is strong and where it is weak; the other holds it fixed and is about what a steady pull does to a falling body.',
      },
      {
        concept: 'equilibrium-points',
        note: 'One has the pull reach zero at one place because the matter drawing you has been used up; the other has it reach zero because two separate sources cancel.',
      },
    ],
  },
};
