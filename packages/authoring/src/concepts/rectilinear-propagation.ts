/**
 * rectilinear-propagation 개념 선언.
 *
 * 빛의 직진 셋 가운데 하나. 셋 다 「빛이 곧게 간다」 를 깔지만 **주장이 다르다.**
 *   rectilinear-propagation  그림자의 **끝이 어디인가** — 가장자리를 스친 두 선이 닿는 자리.
 *                            광원은 점이고, 바뀌는 것은 가림판의 자리다
 *   shadow-umbra-penumbra    그림자가 **왜 두 겹인가** — 광원의 크기. 거리는 고정이다
 *   pinhole-camera           구멍 하나가 만드는 **상** — 밝아짐과 또렷함의 맞바꿈
 * 이쪽만 점광원 · 가림판 자리 · 그림자 배수(2배 · 4배) 어휘를 갖는다. 가장자리의 부드러움 ·
 * 상 · 밝기는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const rectilinearPropagationConcept: Aperi21ConceptSource = {
  id: 'rectilinear-propagation',
  label: 'Straight-Line Light and the Size of a Shadow',
  canonicalSim: 'aperi21:rectilinear-propagation',

  surface: {
    definition:
      'Light leaving a single point in straight lines, so that a blocker’s shadow ends exactly where the lines grazing its edges land, and widens as the blocker is brought nearer the point.',
    exemplarKeywords: [
      'light travels in straight lines',
      'the ray model of light',
      'why a shadow grows when the object moves closer to the lamp',
      'hand shadow on a wall',
      'a torch, a card and a screen',
      'light cannot bend around a corner',
      'how big will the shadow be',
      'shadow puppets held near the lamp',
      'a point source of light',
      'similar triangles and shadow size',
      'the shadow keeps the outline of the thing that blocks it',
    ],
  },

  briefing: {
    observable: [
      'A dark room holds three things in a row: a tiny bright point on the left, an upright plate standing in the middle, and a screen closing the right-hand side.',
      'A fan of faint strands leaves the point and runs toward the screen; the ones aimed within the plate’s height stop at its front face and are drawn no further.',
      'Two strands are drawn full and thick — the pair that just grazes the top and bottom edge of the plate — and the dark band on the screen begins and ends precisely where those two land.',
      'Behind the plate a wedge of the room stays as black as the room itself, widening with distance until it runs into the band on the screen.',
      'Beyond the screen, outside the dark room, a bracket spans the dark band and a line beside it says the shadow is twice the plate’s height.',
      'The plate then slides toward the point. The two thick strands pivot about the point and open wider, more strands are caught, and the wedge, the band and the bracket grow together.',
      'With the plate halfway in, the reading becomes four times the plate’s height and only a strip at the top and bottom of the screen is still lit.',
      'While the plate is travelling the bracket keeps measuring but no ratio is written; the figure returns once the plate has come to rest.',
      'The plate slides back out, everything closes up again, and the round begins over.',
    ],

    screen: {
      affordances: [
        'The plate travels in, holds, travels back out and holds, over and over, with nothing to press.',
        'The point stays where it is and the plate keeps its height — across a whole round the only thing that changes is how far the plate is from the point.',
        'The strands, the two grazing lines, the wedge and the dark band are all drawn from the same straight-line rule, so the band’s edges cannot fall anywhere other than where the two lines arrive.',
        'Only the two grazing lines are drawn bright and thick; every other strand is faint and thin, which puts the eye on the pair that fixes the edge.',
        'The screen opens with the plate already at its far stop and the shadow already cast.',
      ],
    },

    useWhen: [
      'The article has said that light travels in straight lines and the reader would take that as a definition with nothing following from it. Here the straightness is what puts the shadow’s edge where it is — the dark band starts exactly where the grazing line arrives.',
      'The claim being made is that bringing something closer to a lamp enlarges its shadow, and the reason wanted is a geometric one: the two edge lines pivot about the point and open wider, so the same plate blocks a taller slice of the screen.',
    ],

    avoidWhen: [
      'The article is about the soft edge of a real shadow, or about a lamp that is anything other than a single point. Every edge here is perfectly sharp, and the room has one bright speck in it.',
      'The subject is a recognisable picture landing on a surface rather than an outline. The plate is a plain rectangle and what reaches the screen is its silhouette.',
      'The point turns on how bright the lit part is, or on light weakening with distance. Nothing on the screen is brighter or dimmer than anything else — it is lit or it is not.',
      'The article is about the Sun, the Earth and the Moon. The three things here are a lamp, a plate and a wall, and the plate is slid to and fro rather than orbiting.',
      'Distances are wanted in figures. The only number written is the ratio of the shadow to the plate — two, then four — and even that disappears while the plate is moving.',
    ],

    contrastWith: [
      {
        concept: 'shadow-umbra-penumbra',
        note: 'One keeps the source to a single point and asks where the shadow ends; the other gives the source a size and asks why the ending is no longer a line but a band with a graded edge.',
      },
      {
        concept: 'pinhole-camera',
        note: 'One has light stopped by an object and asks how large the missing patch is; the other has light let through a gap and asks what picture the surviving light assembles.',
      },
      {
        concept: 'eclipse',
        note: 'One is this geometry in a room, with the blocker slid to and fro at will; the other is the same geometry in the sky, where the question is why the three bodies so seldom line up for it.',
      },
    ],
  },
};
