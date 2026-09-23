/**
 * shell-theorem 개념 선언.
 *
 * 위험한 형제는 `gravity-inside-earth` 다 — 둘 다 구 내부에 들어간다. **주장을 갈랐다.**
 *   shell-theorem         **속 빈** 껍질 — 안에서는 어디에 있든 0 이고, 그 **이유**(좁은 조각 ↔ 넓은 조각)가 주인공
 *   gravity-inside-earth  **꽉 찬** 구 — 깊이마다 **값이 다르고**, 곧은 선으로 줄어 0 이 된다
 * 이쪽만 「속 빈 · 벽 · 가까운 쪽이 더 세지 않나 · 맞선다」 어휘를 갖고, 「깊이 · 굴 · 그래프 · 곧은 선」 은
 * 저쪽에 둔다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const shellTheoremConcept: Aperi21ConceptSource = {
  id: 'shell-theorem',
  label: 'Why a Hollow Shell Pulls on Nothing Inside It',
  canonicalSim: 'aperi21:shell-theorem',

  surface: {
    definition:
      'Inside a hollow sphere the pull is gone from every position, because along any direction the near narrow patch of wall and the far wide patch draw with exactly equal strength the opposite ways.',
    exemplarKeywords: [
      'shell theorem',
      'no gravity inside a hollow sphere',
      'surely the nearer wall pulls harder',
      'hollow shell interior',
      'the near patch is closer but smaller',
      'why the patches cancel',
      'gravity inside a hollow ball is zero everywhere',
      'not only at the centre but anywhere inside',
      'a spherical wall of matter',
      'being inside a sphere of mass',
    ],
  },

  briefing: {
    observable: [
      'A thin ring stands for a hollow sphere cut through the middle, drawn as a single line with no thickness.',
      'A small dark body approaches from outside with an arrow aimed at the centre, and that arrow lengthens as the body draws nearer, being longest just outside the wall.',
      'The instant the body crosses the wall the arrow is gone, and nothing replaces it.',
      'A twinned wedge then opens from the body as its apex and reaches out both ways, cutting one short patch out of the near wall and one long patch out of the far wall; both patches light up in the accent colour.',
      'Two arrows of exactly equal length leave the body toward those two patches in opposite directions, with the words for a sum of zero standing beside them.',
      'The wedge turns slowly and sweeps through every direction, and at each direction the two arrows are still the same length as each other, though both grow and shrink together a little as it turns.',
      'The body then moves to a different position inside — off centre, well away from the middle — and the wedge keeps turning there, with the two arrows still matched.',
      'When the body finally leaves through the wall on the other side, the arrow toward the centre comes back, short because it is now far away.',
      'The whole cycle runs and repeats by itself.',
    ],

    screen: {
      affordances: [
        'The approach, the crossing, the opening of the wedge, the move to a second position inside and the exit happen in order and then begin again; nothing has to be pressed.',
        'The two arrow lengths are worked out from the geometry of the wedge rather than set equal by hand, so their agreeing is evidence and not a drawing convention.',
        'Only one pair of patches is shown at a time, and the sweep of the wedge is what carries the claim over all directions; several pairs at once would pile the arrows on top of one another.',
        'The wall is a bare line with no thickness, so the moment of crossing and the moment the pull vanishes are the same moment.',
        'The accent colour is kept for the two cut patches alone, and the two are not coloured differently from each other, since they are the same wall and differ only in distance and in width.',
        'Nothing is numbered — no masses, no distances, no ratio of areas — and no net arrow is drawn inside, there being nothing to draw.',
      ],
    },

    useWhen: [
      'The reader accepts that the pull inside is zero but does not believe it, holding on to the thought that the nearer wall must win. Watching the near patch come out narrow and the far patch wide, with equal arrows, is what removes the objection.',
      'The article needs the claim to be about every point inside and not only the middle, where cancelling by symmetry is too easy to accept.',
    ],

    avoidWhen: [
      'The body in the article is inside solid matter rather than a cavity, or the question is how the pull changes with depth. The sphere here is bare wall with nothing between it and the body.',
      'The point is the other half of the theorem — that from outside, a sphere pulls as though all its mass sat at the centre. The outside stretch is only the before and after of the vanishing, and never claims a point mass.',
      'The article is about mapping gravity at places around a body. Only one small body is followed, and no values are laid out at other positions.',
      'The subject is how a pull grows as the square of the closing distance, or the arithmetic of that growth. The approaching arrow simply lengthens; there is nothing to measure a ratio against.',
      'A weightless feeling, an orbiting cabin or free fall is what the article means by no gravity. Nothing here is falling — the body is carried into the shell and moved about inside it.',
      'Numbers are needed for the patches — how much area, how many times further. The picture is a flat section, and any figures for the patch sizes would be untrue to it.',
    ],

    contrastWith: [
      {
        concept: 'gravity-inside-earth',
        note: 'One says that a spherical wall contributes nothing to anything within it; the other takes that result as given and asks what is left of the pull when the matter below you still counts and the matter above you no longer does.',
      },
      {
        concept: 'newtons-law-of-gravitation',
        note: 'One applies the pull between two point masses to a body spread over a sphere and finds the contributions cancelling; the other keeps both bodies as points and changes only their separation.',
      },
      {
        concept: 'gravitational-field',
        note: 'One is about the one place a source produces nothing at all — the hollow it encloses; the other is about the values it produces everywhere outside itself.',
      },
      {
        concept: 'equilibrium-of-forces',
        note: 'One has the cancelling arise from the shape of the source, so that it holds at every interior point and in every direction at once; the other is the general case of pulls adding to nothing at a particular arrangement.',
      },
    ],
  },
};
