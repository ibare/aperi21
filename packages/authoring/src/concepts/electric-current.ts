/**
 * electric-current 개념 선언.
 *
 * 이 묶음에서 홀로 **흐름**을 다룬다 — 나머지 아홉은 모두 멈춰 있는 전하 · 장 · 판이다.
 *   electric-current   한 단면을 **정해진 시간에 지나는 수**. 빠름과 촘촘함, 두 길로 같은 두 배
 * 「세다」 를 속력으로만 읽는 오해를 세 도선의 4 · 8 · 8 로 가른다. 전자 ← / 관례 전류 → 는
 * 부주장이라 한 번만 나온다. 실제로 얼마나 느린가는 drift-velocity, 무엇이 흐름을 만드는가
 * (전압 · 저항 · 회로)는 다른 조각의 몫이라 검색어에도 두지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const electricCurrentConcept: Aperi21ConceptSource = {
  id: 'electric-current',
  label: 'Current as How Much Charge Passes in a Given Time',
  canonicalSim: 'aperi21:electric-current',

  surface: {
    definition:
      'That a current is how much charge crosses one section of a wire in a given time, so that carriers running twice as fast and carriers packed twice as closely each give the same doubled count.',
    exemplarKeywords: [
      'electric current',
      'current is charge per unit time',
      'what does the size of a current mean',
      'counting charges past a cross section',
      'why is conventional current opposite to the electrons',
      'how many carriers and how fast they go',
      'amperes',
      'charge flowing along a wire',
      'electrons drift one way and the current points the other',
      'does a bigger current mean faster charges',
    ],
  },

  briefing: {
    observable: [
      'Three wires are drawn one above another with carriers flowing leftward along each: the top named v, d, the middle named 2v, d with the same spacing but visibly quicker, and the bottom named v, d/2 at the same pace with its carriers twice as close together.',
      'Once, above them all, two arrows are drawn: one pointing left named e⁻ and one pointing right named I.',
      'A gate — a short bold line across the wire — opens at the same place on all three at the same moment, and a bar above them begins filling, named 1 s.',
      'While the bar fills, every carrier that passes a gate turns to the accent colour and a small square is added to a row beside that gate.',
      'When the bar is full the gates close and the three rows stand at four, eight and eight squares, which can be counted one by one.',
      'The carriers that were counted keep flowing left as a group: on the quick wire that group is twice as long, and on the crowded wire it is the same length with twice as many inside it.',
      'The counted group then returns to its ordinary colour and the counting begins over.',
      'Carriers fade into view at the right-hand end of each wire and fade out at the left rather than appearing at a cut edge, so each wire reads as part of a longer one.',
      'No current value and no charge value is written — only the wire names, the two direction arrows, and the time on the bar.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the wires flow, the gates open together, the rows fill, and the run begins again.',
        'The three gates sit at one place and open at one moment, so that "the same time" is a premise built into the picture rather than something a reader has to check.',
        'The count is shown as a row of squares that can be counted one at a time, rather than as a figure written out.',
        'The accent colour means counted, and everything that carries it — the open gate, the carriers that got through, the squares, the filling bar — means only that.',
        'The first crossing of each run is placed half a spacing after the gate opens, so no carrier ever straddles the moment of opening and every run gives the same whole number.',
        'Everything runs at one slowed pace, so that the quick wire can be counted at all and the flow never changes speed from one part of the run to the next.',
        'The gate sits near the right-hand end, leaving room for the counted group to stay in view behind it.',
        'There is no grid, since what is being read is a count rather than a distance.',
      ],
    },

    useWhen: [
      'The article defines current as charge per unit time and the reader is reading it as how fast the charges go. Two wires reaching the same count for entirely different reasons — one quicker, one more crowded — is what separates the two.',
      'The prose needs the sign convention put on screen once without dwelling on it: carriers going one way under an arrow named for the electron, and an arrow for the current pointing the other.',
    ],

    avoidWhen: [
      'The subject is how slowly the carriers actually creep along a real wire, or how a lamp comes on at once while they do not. Nothing here says how fast the carriers really are.',
      'The subject is what drives the flow — a voltage, a battery, a resistance, a circuit to go round. There is no source here; the wires simply flow.',
      'The subject is current dividing at a junction, or being the same all the way round a loop.',
      'A value is wanted in amperes or coulombs, or the count is to be worked out from a carrier density and a cross-sectional area.',
      'The subject is what a current then does — heating a wire, making a field around it, feeling a force.',
      'The carriers are meant to be positive, or the interest is in ions moving in a liquid or a gas.',
    ],

    contrastWith: [
      {
        concept: 'electric-charge',
        note: 'One is about how much charge goes past a place in a given time; the other is about the two kinds of charge and what they do to one another while nothing goes anywhere.',
      },
      {
        concept: 'charging-methods',
        note: 'One is a lasting stream past a fixed place, counted while it runs; the other is a single transfer that leaves a sign behind and then stops.',
      },
      {
        concept: 'gausss-law',
        note: 'Both count things crossing a boundary, but one counts carriers crossing a line over a stretch of time, and the other counts field lines crossing a closed boundary at one instant.',
      },
      {
        concept: 'parallel-plate-capacitor',
        note: 'One counts what crosses a section while the flow is running; the other draws a flow only in passing and is about what is left sitting on plates once it stops.',
      },
      {
        concept: 'continuity-equation',
        note: 'Both take a section and ask what passes it in a given time, but one counts discrete carriers to give a rate its meaning, and the other takes the rate as settled and asks what a narrowing does to the speed.',
      },
    ],
  },
};
