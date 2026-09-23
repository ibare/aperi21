/**
 * pressure-from-collisions 개념 선언.
 *
 * 알갱이 넷 중 하나. 이쪽은 **두 곱** 을 주장한다.
 *   gas-pressure        합 — 수많은 두드림이 쌓여 매끈한 한 값이 된다
 *   pressure-from-collisions       **세기 × 횟수** — 속력을 두 배 하면 둘 다 두 배라 네 배
 *   maxwell-boltzmann-distribution 퍼짐 — 분자마다 속력이 다르다
 *   mean-free-path                 사이 거리 — 다음 분자까지 얼마나 가나
 * 이쪽만 두 상자를 나란히 · 한 번의 세기 화살표 · 센 눈금 · 칸으로 쌓은 막대 어휘를 갖는다.
 * 매끈함 · 들썩임 · 데우기 · 온도는 쓰지 않는다 — 여기서 바뀌는 것은 속력뿐이다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const pressureFromCollisionsConcept: Aperi21ConceptSource = {
  id: 'pressure-from-collisions',
  label: 'Strength Times Rate at a Measured Wall',
  canonicalSim: 'aperi21:pressure-from-collisions',

  surface: {
    definition:
      'What a wall receives from a gas is one blow’s worth times how many arrive, and doubling the molecular speed doubles each of those and so quadruples the total.',
    exemplarKeywords: [
      'momentum delivered to a wall',
      'each bounce gives the wall twice the momentum it arrived with',
      'twice as fast gives four times the push',
      'how hard and how often',
      'counting bounces in a fixed stretch of time',
      'deriving pressure from molecular collisions',
      'why is the push proportional to the speed squared',
      'a rebound reverses the momentum',
      'two boxes side by side at different speeds',
      'both the size of a blow and the rate of blows grow together',
    ],
  },

  briefing: {
    observable: [
      'Two boxes stand side by side holding the same five molecules in the same arrangement; a mark above them reads `v` for the left and `2v` for the right, and the trails in the right box are twice as long.',
      'Both boxes have a thickened right-hand wall, and a flash spreads inward from that wall whenever a molecule reaches it.',
      'First, one arrow is drawn beneath each box on a row headed as one blow’s worth: the right arrow is twice the left, and the two are written as a rebound for a molecule of speed `v` and for one of twice that.',
      'Then a stretch of counting begins, and on a second row a tally stroke is added for each arrival while a block is laid onto that box’s bar — the flash, the stroke and the block appearing together.',
      'The strokes are all the same width and all the same height, so the two rows can be compared as lengths, and the blocks in one bar are all the same height while the blocks in the other are twice as tall.',
      'At the end the left bar has five blocks and the right has ten, with the tallies reading five against ten, and the right bar stands four times as high.',
      'The two factors are the bar’s own shape: how tall a block is, and how many there are.',
      'The count in each box comes out exact — the stretch of counting is as long as one crossing and return, so every molecule reaches the wall once in the slow box and twice in the fast one, wherever it happened to start.',
      'No pressure, momentum or speed is ever written as a number with a unit; the only figures are the doubling and the letters on the arrows.',
      'The round then fades and runs again with the same two boxes.',
    ],

    screen: {
      affordances: [
        'One round shows the blow, then the counting, then the finished bars, and begins again; nothing has to be pressed.',
        'The arrivals are found by solving for when each molecule reaches the wall rather than by a count written in, so five against ten is a result.',
        'The bars are built from separate blocks rather than filled in, because a solid bar would show the fourfold and hide that it is two doublings.',
        'The strike colour is spent on one meaning only — a single arrival — so the flash, the arrow, the tally stroke and the block are legibly four faces of the same event.',
        'Both boxes are the same colour and the same size; what differs between them is stated by the marks `v` and `2v` and by the length of the trails.',
        'The fourfold is written as two doublings rather than as a four, so the arithmetic is never handed over finished.',
      ],
    },

    useWhen: [
      'The article has arrived at a push proportional to the square of the speed and the reader cannot see where the square comes from. Watching one doubling in the height of a block and another in the number of blocks is where the square is assembled.',
      'The reader grants that faster molecules hit harder but forgets that they also return sooner, and the moment wanted is the tally row where the fast box records twice as many strokes over the very same stretch of time.',
    ],

    avoidWhen: [
      'The point is that a measured push is smooth only because the events are many, or that it wavers when they are few. Five molecules is too few for that and the bars here are built deliberately as countable blocks.',
      'The article changes the temperature rather than the speed. Nothing here is heated, and no temperature is named or drawn.',
      'The molecules in the article differ from one another in speed. Every molecule inside a box here moves across at the same rate, which is what lets one arrow stand for a blow.',
      'The subject is molecules colliding with each other, or how far they get between such meetings. They pass through one another here and only the wall is struck.',
      'Values in pascals, newton-seconds or metres per second are wanted. The mass and speed set the lengths on the screen and are never written out.',
      'The volume is to change, or a piston to move, or one quantity to be held while others vary. Both boxes are rigid and identical.',
    ],

    contrastWith: [
      {
        concept: 'gas-pressure',
        note: 'One establishes that a push is a heap of blows at all; the other assumes that and works out how the heap grows when the molecules are hurried.',
      },
      {
        concept: 'impulse-momentum-theorem',
        note: 'One follows what a single body gains from a push acting over a time; the other turns that around to ask what the wall receives, and multiplies it by how often it is received.',
      },
      {
        concept: 'maxwell-boltzmann-distribution',
        note: 'One needs every molecule to share a speed so that one blow can stand for all of them; the other is about the fact that they do not.',
      },
      {
        concept: 'ideal-gas-law',
        note: 'One derives how the push on a wall grows with molecular speed; the other states the rule between pressure, volume and temperature with the molecules left out.',
      },
    ],
  },
};
