/**
 * vector-decomposition 개념 선언.
 *
 * 형제는 `vector-addition`. **개수와 축**으로 갈랐다.
 *   vector-decomposition  화살표 **하나**를 둔 축 방향 **둘**로 가른다 — 축이 있어야 성립한다
 *   vector-addition       주어진 화살표 **둘**을 머리-꼬리로 이어 **하나**로 만든다 — 축이 없다
 * 이쪽만 성분·수선·축 어휘를 갖고, 저쪽만 합·머리-꼬리·삼각형 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const vectorDecompositionConcept: Aperi21ConceptSource = {
  id: 'vector-decomposition',
  label: 'Vector Components',
  canonicalSim: 'aperi21:vector-decomposition',

  surface: {
    definition:
      'Replacing one slanted arrow by how far it reaches along each of two chosen axes, the reaches being found by dropping straight from its tip onto each axis in turn.',
    exemplarKeywords: [
      'vector components',
      'resolving a vector into components',
      'x component and y component',
      'breaking a force into horizontal and vertical parts',
      'dropping perpendiculars from the tip of a vector',
      'component along an axis',
      'v cos theta and v sin theta',
      'splitting a slanted arrow into two',
      'how to find the parts of a vector',
      'horizontal and vertical parts of a velocity',
    ],
  },

  briefing: {
    observable: [
      'Two plain axes cross the picture with no ticks, numbers or arrowheads on them, and one slanted arrow leaves the crossing point.',
      'Two dashed guide lines appear, running from the arrow’s tip straight down to the horizontal axis and straight across to the vertical one.',
      'Out of the slanted arrow two shorter arrows grow, both in the same accent colour, one lying along each axis and each ending exactly where its guide line met that axis.',
      'The two of them are then picked up and laid end to end — one starts where the other finishes — and the chain’s far end lands precisely on the tip of the original arrow.',
      'With the chain formed, the dashed guide lines dim, leaving the triangle standing on its own.',
      'The chain is undone, the two components slide back onto the slanted arrow and merge into it again, leaving one arrow.',
      'The arrow then swings to a different direction and the whole splitting begins again — across four directions in turn, including one leaning back over the vertical axis where the horizontal component runs the other way.',
      'The captions say in order: one slanted arrow; dropping straight to both axes, the arrow splits into across and up; put the two end to end and they land exactly on the original tip; the two merge back into one.',
    ],

    screen: {
      affordances: [
        'The tip of the slanted arrow is a handle marked by a ring, and dragging it moves the arrow to any direction and length the reader chooses while the splitting keeps up with it.',
        'The handle is a ring rather than a filled dot, so the arrowhead stays visible underneath and what is being dragged reads as the end of that arrow rather than a separate point.',
        'Dragged to the far left the horizontal component turns and runs the opposite way along its axis while the chain still closes on the tip, so the claim can be tested where it looks least likely to hold.',
        'The arrow is kept within a fixed reach and from dropping far below the horizontal axis, so a drag cannot put the tip somewhere the pair of components could not be drawn.',
        'Left alone the arrow cycles through four preset directions, so the whole argument is made without dragging anything.',
      ],
    },

    useWhen: [
      'The reader has been handed the component formulas and needs to see where the two lengths come from. The guide lines dropping from the tip and the two arrows ending exactly there is the geometry those formulas stand for.',
      'The article claims a slanted quantity may be treated as two separate quantities along the axes, and wants that swap shown to be exact rather than approximate — the chain landing on the original tip is the check.',
    ],

    avoidWhen: [
      'The subject is combining two vectors that were given separately. Only one arrow is given here; the two shorter ones are made from it and go back into it.',
      'The article turns on which axes to use or on tilting them to suit a slope. The axes here are fixed horizontal and vertical and are never moved.',
      'Numbers are wanted — the components, the angle, the magnitude. Nothing on screen is labelled or measured, and the axes carry no scale.',
      'The point is about a specific physical quantity, such as a velocity during a flight or a force on a slope. The arrow here stands for nothing in particular and there is no body, ground or motion.',
      'The argument needs three dimensions or a component along a direction that is not one of the two axes.',
    ],

    contrastWith: [
      {
        concept: 'vector-addition',
        note: 'One takes a single arrow apart into reaches along axes that were laid down first; the other puts two arrows that were given separately together, and needs no axes for it.',
      },
      {
        concept: 'coordinate-choice',
        note: 'One works within axes already fixed and asks what an arrow amounts to along them; the other asks where the axes should be laid in the first place and what a good placement buys.',
      },
      {
        concept: 'projectile-motion',
        note: 'One is the geometry of splitting an arrow along two directions; the other is the physical claim that, once split, what happens along each direction proceeds without regard to the other.',
      },
    ],
  },
};
