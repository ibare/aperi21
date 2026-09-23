/**
 * vector-addition 개념 선언.
 *
 * 형제는 `vector-decomposition`. 갈림은 **개수와 축**이다 —
 * 이쪽은 주어진 화살표 **둘**을 이어 **하나**를 얻고, 축도 격자도 화면에 없다.
 * 저쪽은 화살표 **하나**를 축 방향 **둘**로 가른다.
 * 이쪽만 합·머리-꼬리·걸어감 어휘를 갖는다. 성분·수선·축은 이쪽 어휘가 아니다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const vectorAdditionConcept: Aperi21ConceptSource = {
  id: 'vector-addition',
  label: 'Vector Addition',
  canonicalSim: 'aperi21:vector-addition',

  surface: {
    definition:
      'Combining two given arrows by carrying the second until its tail sits on the first one’s head, the sum then running straight from the tail first left to the head last reached.',
    exemplarKeywords: [
      'vector addition',
      'head to tail method',
      'resultant of two vectors',
      'triangle rule for adding vectors',
      'adding two displacements',
      'why can you just slide a vector over',
      'sum of two arrows',
      'walking one leg then the other',
      'combining two velocities into one',
      'adding forces that point different ways',
    ],
  },

  briefing: {
    observable: [
      'Two arrows named a and b leave the same small open circle, drawn in the same colour and the same thickness so neither is the special one.',
      'Arrow b then slides across until its tail sits on the head of a, leaving a dashed ghost of itself at the place it came from.',
      'A dot sets off from the shared tail and walks the length of a, then carries on without stopping and walks the length of b, laying a broad faint band behind it that bends at the junction.',
      'From the tail the dot left to the head it reached, a single arrow in the accent colour grows, named a + b; it is the only thing on screen in that colour.',
      'The finished figure is held as a closed triangle — a, then b carried onto its head, and the sum closing the two.',
      'Then b is sent back where it was, the sum goes, and the two arrows stand on the shared tail again.',
      'The captions follow the steps: slide b over to the head of a; start at the tail and walk along a; carry on from the head of a and walk along b; draw straight from the tail you left to the head you reached; first tail to last head — this is a + b.',
      'There are no axes, no grid and no origin marker anywhere, so nothing on screen suggests counting squares.',
    ],

    screen: {
      affordances: [
        'The head of each arrow is a handle. A word reading drag appears beside them when the figure is being held, and pulling either head changes that arrow’s direction and length.',
        'While a head is being dragged the sum is redrawn with it and the caption changes to say that the sum follows, so the rule is watched holding rather than asserted for one pair.',
        'Each arrow is kept above a minimum length and inside the picture, so a drag cannot collapse an arrow to nothing or push a head out of view.',
        'Left alone the whole sequence — sliding, walking, growing the sum, and sending b back — runs on a loop, so the argument is complete without touching anything.',
      ],
    },

    useWhen: [
      'The reader has been given head-to-tail as a procedure and is unsure why the second arrow may be moved at all. The dashed ghost staying behind while b is carried over is what licenses the move.',
      'The article needs the sum shown to be a path actually travelled rather than a construction: the dot walking one arrow then the other, and the sum drawn from where it started to where it ended, says that.',
      'The claim is that the rule holds for any pair, and a case is wanted where the reader can change both arrows and watch the sum keep up.',
    ],

    avoidWhen: [
      'The subject is taking one vector apart into parts along axes. Nothing is split here and there are no axes to split along.',
      'The article turns on the parallelogram construction, on commutativity, or on adding three or more vectors. One route is walked, in one order, with two arrows.',
      'Numbers are wanted — lengths, angles, components of the sum. Nothing is measured and no scale is offered.',
      'The arrows need to stand for particular physical quantities in a scene, such as forces on a block or velocities of a boat. These are bare arrows named a and b on empty paper.',
      'The point is subtraction or the difference of two vectors.',
    ],

    contrastWith: [
      {
        concept: 'vector-decomposition',
        note: 'One joins two arrows that were given separately into a single one; the other takes a single arrow apart into reaches along axes chosen beforehand.',
      },
      {
        concept: 'relative-velocity',
        note: 'One is the bare rule for combining two arrows however they arose; the other is a case where the two being combined belong to different observers, so that what is added is the watcher’s own motion.',
      },
      {
        concept: 'river-crossing',
        note: 'One shows what the sum of two arrows is; the other is a case where the sum is a place a boat actually ends up, and the question is which aim makes it the right place.',
      },
    ],
  },
};
