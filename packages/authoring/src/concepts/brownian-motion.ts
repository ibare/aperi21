/**
 * brownian-motion 개념 선언.
 *
 * 무작위 걸음 삼형제 중 하나 — `diffusion` · `random-walk` 와 섞으면 셋 다 「제멋대로
 * 걷는다」 로 수렴한다. **주어와 주장을 갈랐다.**
 *   brownian-motion  주어 = 보이는 **알갱이 하나** + 안 보이는 때리는 것. 주장 = 적게 맞은 쪽으로 **튄다**(까닭)
 *   diffusion        주어 = **무리와 구간마다의 수**. 주장 = 진한 데서 옅은 데로 번져 **고르게 된다**
 *   random-walk      주어 = **처음 자리에서의 거리와 걸음 수**. 주장 = 네 배 걸어도 두 배만 멀어진다
 * 이쪽만 「안 보이는 것이 때린다 · 확대 · 한쪽이 더 많다」 어휘를 갖는다. 걸음 거리 ·
 * 퍼짐 · 충돌 사이 거리는 쓰지 않는다 — 화면이 재지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const brownianMotionConcept: Aperi21ConceptSource = {
  id: 'brownian-motion',
  label: 'Brownian Motion as Uneven Bombardment',
  canonicalSim: 'aperi21:brownian-motion',

  surface: {
    definition:
      'The jitter of a visible speck afloat in a liquid, kept going by unseen molecules battering it from every side and jolting it whenever one side lands fewer blows.',
    exemplarKeywords: [
      'Brownian motion',
      'a pollen grain jiggles in water with nothing touching it',
      'why does a speck of dust dance under the microscope',
      'invisible molecules knocking something visible about',
      'smoke particles seen to tremble',
      'evidence that matter is made of molecules',
      'struck more often on one side than the other',
      'nobody is pushing it and yet it moves',
      'Robert Brown and the pollen',
      'the jitter of a suspended particle',
    ],
  },

  briefing: {
    observable: [
      'On the left, at ordinary magnification, there is only a small dot for the grain and a winding trail fading out behind it — nothing that could be pushing it is drawn.',
      'A little square around the grain is joined by connecting lines to a window that opens on the right, and inside that window the grain is a large disc surrounded by molecules far smaller than itself.',
      'The molecules arrive from every direction without pause, bounce off and fly away, and a ring of the highlight colour spreads from each spot that was hit.',
      'The picture then runs at a third of speed and the hits of one short stretch are left behind as marks: a dashed line divides the grain, ten marks on one side of it and two on the other, plainly countable.',
      'A dashed circle stays where the grain stood when that stretch began, so the distance between the circle and the grain is the displacement that follows.',
      'One arrow in the highlight colour comes out of the grain pointing away from the crowded side, and the grain has shifted out of the dashed circle that way; at the same moment the trail on the left panel kicks in the same direction.',
      'The marks, the arrow and the dashed circle fade, the battering from every side carries on, the window closes, and the grain is left jittering with only its trail again.',
      'Nothing anywhere is numbered — neither how many hits, nor how far, nor how fast.',
    ],

    screen: {
      affordances: [
        'One round carries the grain from plain wandering, through the window opening on the cause, to the window closing, and then begins again; nothing has to be pressed.',
        'Two stretches run slowed down — the one where the hits are counted and the one where the grain is jolted — so the two things the eye must catch are not over in an instant.',
        'The highlight colour carries a single meaning, that the grain was struck: the rings at the moment of contact, the marks left behind, and the arrow that sums them are all the same colour.',
        'The crowded side and the sparse side are not told apart by colour but by how many marks lie on each side of the dashed dividing line.',
        'The grain keeps the same colour in both panels, so the dot on the left and the disc in the window are read as one and the same body.',
      ],
    },

    useWhen: [
      'The article has said that the jitter of a suspended particle is caused by molecular collisions, and the reader has to take it on trust because the molecules cannot be seen. The window opening on ten hits against two, and the grain moving away from the ten, is what turns the assertion into something watched.',
      'The point being made is that the unevenness is what matters — that being struck equally from all sides would leave the grain sitting still, and that it is the chance imbalance which shifts it.',
    ],

    avoidWhen: [
      'The subject is how far such wandering carries a body after a great many steps, or how that distance grows with the number of steps. Nothing here is measured against a start, and the path on the left panel is drawn exaggerated so that distances on it cannot be read.',
      'The article is about a crowd of particles evening out across a vessel. There is one grain here and nothing to be evenly shared.',
      'The point is how far a molecule travels between one collision and the next. Only the molecules that reach the grain are drawn, and only just before and after they hit it.',
      'The subject is the push a gas exerts on the walls of its container, or where pressure comes from. There is no wall here being drummed on — only one body in the middle being jostled.',
      'Values are wanted: how many collisions a second, how big the displacement, how heavy the grain against a molecule. All of those are pitched far from life so that single hits can be counted by eye, and none of them is written.',
    ],

    contrastWith: [
      {
        concept: 'random-walk',
        note: 'One asks why an aimless path happens at all and answers with what is doing the pushing; the other takes the aimless stepping as given and asks only how far it gets you.',
      },
      {
        concept: 'diffusion',
        note: 'One follows a single body and the chance imbalance that shifts it; the other ignores any single body and follows what a whole crowd of them does to the way a substance is shared out.',
      },
      {
        concept: 'gas-pressure',
        note: 'Both build something from innumerable separate molecular taps, but one has the taps land on a movable speck and never cancel out perfectly, while the other has them land on a wall and add into one steady push.',
      },
      {
        concept: 'mean-free-path',
        note: 'One is about what molecules do to a body far larger than themselves; the other is about what molecules do to each other, and how far one gets between two such meetings.',
      },
    ],
  },
};
