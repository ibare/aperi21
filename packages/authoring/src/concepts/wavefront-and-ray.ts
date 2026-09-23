/**
 * wavefront-and-ray 개념 선언.
 *
 * `huygens-principle` 와 짝이다. 둘 다 파면을 주어로 삼으므로 **무엇을 주장하는지로 갈랐다.**
 *   wavefront-and-ray  파면과 광선이 **어느 거리에서나 직각**이다 — 두 그림법 사이의 관계
 *   huygens-principle  다음 파면이 **어디서 오는가** — 지금 파면의 점마다 낸 잔물결의 겹침
 * 이쪽만 「곁에서는 둥글고 부채꼴 · 멀리서는 곧고 나란함」 어휘를 갖는다. 작도 · 잔물결 ·
 * 새 파원은 쓰지 않는다.
 *
 * `transverse-wave` 도 직각을 말하지만 그쪽 직각은 매질의 흔들림과 진행 사이다 —
 * avoidWhen 과 contrastWith 로 갈랐다.
 *
 * 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const wavefrontAndRayConcept: Aperi21ConceptSource = {
  id: 'wavefront-and-ray',
  label: 'Wavefront and Ray — The Right Angle Between Two Drawings',
  canonicalSim: 'aperi21:wavefront-and-ray',

  surface: {
    definition:
      'Two ways of drawing one spreading wave and the relation that holds between them: the surface joining points of equal phase, and the line of travel that crosses it squarely at every distance from the source.',
    exemplarKeywords: [
      'wavefront',
      'ray diagram',
      'normal to the wavefront',
      'spherical wavefronts near a source',
      'a plane wave far from its source',
      'why distant light can be drawn as parallel rays',
      'rays fanning out from a point source',
      'surfaces of equal phase',
      'rays run perpendicular to the wavefronts',
      'circular ripples and the directions they travel in',
    ],
  },

  briefing: {
    observable: [
      'A ripple tank is seen from above, with the rippling itself shaded faintly underneath, so that the front lines lie on the crests of a real wave rather than being ruled on top of a blank surface.',
      'Arcs mark the crests. One of them is drawn thick and followed as it advances, handing over to the next crest when it has gone a full wavelength.',
      'Seven straight lines run out from the source across the tank, and at each of the seven places where one of them meets the thick front, a right-angle corner is drawn and rides along with the front as it moves.',
      'Near the source the fronts are strongly curved and the seven lines fan out widely from a visible point.',
      'The tank is then carried further and further from the source. The source slides out of view to the left, the fronts flatten and the lines turn toward parallel — and the corners keep their shape at all seven meetings throughout.',
      'At the greatest distance the fronts are straight and upright and the lines are parallel and level, and the seven corners are still right angles.',
      'The tank then comes back, the fronts curve again and the lines spread apart again, so the round shows the same relation surviving the whole journey.',
      'The moving away is drawn out so that the flattening happens gradually rather than all in the first moment.',
      'The rippling is shaded evenly however far the tank is from the source, so nothing here says anything about the wave growing weaker with distance.',
      'Nothing is numbered — no wavelength, no distance, no angle. The squareness is said by the corners alone.',
    ],

    screen: {
      affordances: [
        'The round carries the tank from beside the source out to a great distance and back, by itself; nothing has to be pressed, because the point is that the answer is the same at every distance.',
        'One tank is moved rather than two being set side by side, so the round front and the straight front read as the same wave at two places rather than as two different waves.',
        'The corners are put on one followed front only, rather than at every crossing, so that they are seen travelling with a front instead of forming a pattern of their own.',
        'The seven lines are held to the same seven directions throughout, so the very same seven are followed from near to far rather than a new set being chosen at each distance.',
        'One colour is spent on the lines of travel and their corners together, since a corner is where a line meets a front; the fronts, the source and the rippling are drawn plainly.',
      ],
    },

    useWhen: [
      'The article has switched from talking about fronts to talking about rays — or is about to — and the reader has no idea that the two are pictures of one thing. A corner riding along at each crossing is what ties them together.',
      'The point being made is that light or sound from a distant source may be treated as parallel lines of travel with flat fronts. Watching the tank carried away until the arcs straighten is what earns that simplification instead of asserting it.',
    ],

    avoidWhen: [
      'The article is about where the next front comes from — wavelets, secondary sources, or the construction that builds one front from the previous one. Nothing here is built; the fronts simply advance.',
      'The right angle in the article is between the medium’s own motion and the direction of travel. That angle lives in the moving matter; the one here is between two lines on a map of the wave.',
      'The subject is bending at a boundary, spreading past an edge, or turning back from a surface. One uniform tank is shown and the wave meets nothing in it.',
      'The claim concerns the wave weakening as it spreads. The rippling is drawn at the same strength everywhere so that the geometry is not confused by shading.',
      'Two sources are at work in the article. There is one source here and one family of fronts.',
    ],

    contrastWith: [
      {
        concept: 'huygens-principle',
        note: 'Both take a wavefront as the subject, for different questions — one states the fixed geometry between a front and the direction it advances in, the other states where the next front comes from at all.',
      },
      {
        concept: 'transverse-wave',
        note: 'Both end at a right angle, between different pairs — here between a surface of equal phase and the line the wave runs along, there between the medium’s own motion and the advance, which is matter moving rather than geometry on a map.',
      },
      {
        concept: 'interference',
        note: 'One has a single source and asks how its fronts and its directions of travel are related; the other has two, and asks what their fronts do to each other where they cross.',
      },
      {
        concept: 'inverse-square-law',
        note: 'Both watch what happens to a wave as it gets further from a point source — one follows the shape of the fronts, the other follows how thinly the wave is spread, and only the second needs any distance to be measured.',
      },
    ],
  },
};
