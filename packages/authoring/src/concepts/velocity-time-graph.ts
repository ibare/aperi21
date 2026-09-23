/**
 * velocity-time-graph 개념 선언.
 *
 * 그래프 셋 중 넓이를 말하는 둘(`velocity-time-graph` · `acceleration-time-graph`)이
 * 가장 붙기 쉽다. **넓이가 무엇으로 바뀌는가**로 갈랐다.
 *   velocity-time-graph      넓이 → **간 거리**. 기둥이 길 위로 내려와 말뚝 사이를 채운다
 *   acceleration-time-graph  넓이 → **속도 변화**. 칸이 막대에 쌓이고, 축 아래 칸은 깎는다
 * `position-time-graph` 와는 읽는 것 자체가 다르다(기울기 ↔ 넓이).
 *
 * 이 조각의 주장은 기울기가 아니라 넓이 하나다. avoidWhen 에 기울기를 명시해 오검출을
 * 되돌린다 — 화면에 접선도 기울기 표시도 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const velocityTimeGraphConcept: Aperi21ConceptSource = {
  id: 'velocity-time-graph',
  label: 'Velocity-Time Graph',
  canonicalSim: 'aperi21:velocity-time-graph',

  surface: {
    definition:
      'A record of speed through time whose area shut in beneath the curve equals the ground actually covered, a wide slow stretch counting for as much as a tall brief one.',
    exemplarKeywords: [
      'velocity-time graph',
      'area under a velocity-time graph',
      'the area gives the distance travelled',
      'v-t graph',
      'speed-time graph area',
      'trapezium under the graph',
      'how far did it travel according to the graph',
      'why is the area the distance',
      'finding displacement from a graph',
      'area of the shape under the line',
    ],
  },

  briefing: {
    observable: [
      'A velocity curve is drawn on named axes: it rises, holds level, drops to a lower level, holds again, and comes down to nothing at nine seconds.',
      'The space under the curve fills in as the clock runs, divided by an upright line at every whole second.',
      'A pin rides the curve at whatever speed the body has now.',
      'Below the graph a straight road carries a cart with wheels and a pointer, travelling along it.',
      'As each second closes, the column of filled space belonging to that second leaves the graph, flies down to the road and flattens into a long thin band on the way.',
      'Stakes stand on the road at the places the cart had reached at each whole second, sticking up above the bands.',
      'Every landed band reaches from one stake exactly to the next — tall narrow columns become long low bands, short ones become shorter bands, and none overlaps or falls short.',
      'The stakes stand close together at the start, are furthest apart while the curve is at its tallest, and crowd together again as the curve comes down.',
    ],

    screen: {
      affordances: [
        'The run, the peeling away of each column and its landing on the road happen in order and then begin again, so every column comes round without being asked for.',
        'The graph and the road are drawn to one another’s scale, which makes the fit between a band and the space between two stakes something to look at rather than to work out.',
        'Stakes are drawn over the bands rather than under them, so whether a band truly reaches a stake can be seen at the join.',
        'The curve is built so the columns change shape a great deal, which lets the fit be watched when the shape being laid down is quite unlike the space it goes into.',
      ],
    },

    useWhen: [
      'The reader has been handed the area rule and is carrying it as something to memorise. A column leaving the graph and dropping into the space between two stakes turns the rule into something that happened.',
      'The claim is that a long slow stretch can contribute as much as a brief fast one, and a case is wanted where the shapes change a great deal while the fit keeps holding.',
    ],

    avoidWhen: [
      'The subject is the tilt of the curve as the acceleration. The corners are there to see, but no tilt is drawn, marked or measured anywhere.',
      'The curve in question dips below the axis and distance has to be separated from displacement. This body only goes forward and the curve stays above.',
      'Values are wanted — how far, how fast, how much area. Not one number is written.',
      'The point is where the body is at a given moment rather than how far it has got. There are no axes for place, only a road with stakes along it.',
    ],

    contrastWith: [
      {
        concept: 'position-time-graph',
        note: 'One says the area shut in beneath the drawn line is the ground covered; the other says the tilt of the drawn line is the speed.',
      },
      {
        concept: 'acceleration-time-graph',
        note: 'Both claim an area is what matters, but of different things — here the area buys ground covered, there it buys velocity gained, and there it can also be taken away again.',
      },
      {
        concept: 'average-acceleration',
        note: 'One reads a velocity-time graph by the area shut in beneath the curve; the other reads the same kind of graph by the tilt of a line joining two moments.',
      },
    ],
  },
};
