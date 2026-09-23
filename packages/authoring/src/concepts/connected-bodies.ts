/**
 * connected-bodies 개념 선언.
 *
 * 줄 형제 셋 가운데 하나다. 이쪽 주어는 **묶여 함께 끌리는 물체들**이고 주장은
 * **어떻게 나눠 이어도 가속도가 하나**라는 것이다 — 줄이 무엇을 전하느냐(`tension`)도,
 * 가닥이 힘을 얼마로 나누느냐(`pulley-system`)도 여기서는 묻지 않는다.
 * 이쪽만 계·전체 질량·한 덩어리 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const connectedBodiesConcept: Aperi21ConceptSource = {
  id: 'connected-bodies',
  label: 'Connected Bodies',
  canonicalSim: 'aperi21:connected-bodies',

  surface: {
    definition:
      'Bodies tied together and pulled by one force, which move as a single system whose acceleration follows from the total mass however that mass is split between them.',
    exemplarKeywords: [
      'connected bodies',
      'two blocks joined by a string',
      'treat the system as one body',
      'acceleration of a system of masses',
      'acceleration equals force over total mass',
      'train of carts behind one engine',
      'blocks tied by a cord and dragged along',
      'does it matter how the mass is divided up',
      'the system approach to a Newton second law problem',
      'only the total mass gets into the answer',
    ],
  },

  briefing: {
    observable: [
      'Three rows are stacked one above another on the same ground line, and each is pulled from the front by an arrow of six newtons with the figure written on it.',
      'The top row is one block of three kilograms; the middle is two kilograms and one kilogram joined by a cord; the bottom is three blocks of one kilogram joined by two cords.',
      'Every block is drawn as wide as it is heavy, so each row comes out exactly as long as the others and the fronts begin level.',
      'The three rows set off together and their leading faces stay level with one another the whole way across.',
      'Marks are dropped below the ground line at even beats of the clock, and one set of marks serves all three rows because the three pass them at the same moments.',
      'The marks start close together and spread further apart as the run goes on, so the rows are not only keeping together but getting faster.',
      'The cords stay taut and straight between the blocks, and nothing in any row slips behind or runs ahead of the block in front.',
      'The run lasts three seconds and begins again from the start line, and the caption holds one sentence: the same six newtons on the same three kilograms, however the three kilograms are cut up.',
    ],

    screen: {
      affordances: [
        'The three rows run at once from one clock, so whether the split changes anything is settled by looking across rather than by remembering a previous run.',
        'The rows are stacked with their leading faces on one starting line, which makes staying level something visible at any instant.',
        'A single row of marks below the ground line serves all three rows, so agreement shows up as the three fronts reaching the same mark together.',
        'Widths are drawn in proportion to mass, so the one heavy block and the three light ones are the same length of picture.',
      ],
    },

    useWhen: [
      'The article is about to treat several tied bodies as one body of the combined mass, and the reader has no reason yet to accept the move. Three rows, split differently, passing the same marks at the same beats, is the licence for it.',
      'The claim is that only the total mass reaches the answer and the arrangement drops out, and a screen is wanted where three arrangements are run side by side rather than argued about.',
    ],

    avoidWhen: [
      'The pull in the connecting cord is the question. The cords are drawn but nothing on them is measured, and only the one arrow at the front carries a value.',
      'The bodies are meant to move differently from one another — one hanging over a pulley, one on a different surface, or two colliding. All three rows run flat and forward with everything in them moving alike.',
      'Friction, weight or the surface pushing back is part of the reckoning. One arrow acts on each row and nothing opposes it.',
      'Numbers are wanted for the acceleration, the speed or the distance covered. Only the masses and the single force are written down.',
      'The point is that a force can be applied to one body and not another within the group. Each row is pulled at its front and nowhere else.',
    ],

    contrastWith: [
      {
        concept: 'tension',
        note: 'One asks what the bodies a rope ties together end up doing; the other asks what that rope itself carries from one end to the other.',
      },
      {
        concept: 'pulley-system',
        note: 'Both put several things on one rope, but here the pull is passed on whole to drag them along, and there it is divided among strands to hold something up.',
      },
      {
        concept: 'uniformly-accelerated-motion',
        note: 'One asks what sets the acceleration when one force is shared among tied bodies; the other asks what a steady acceleration looks like in the marks it leaves behind.',
      },
      {
        concept: 'newtons-second-law',
        note: 'One keeps a single push and asks what mass answers to it when bodies are tied together — the total, however unevenly it is split; the other keeps the body and varies the push, finding the gain of motion follow it.',
      },
    ],
  },
};
