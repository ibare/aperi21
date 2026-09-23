/**
 * kirchhoffs-current-law 개념 선언.
 *
 * 회로 법칙 셋 가운데 이쪽은 **마디** — 도선이 갈라지는 한 자리에서 무엇이 보존되는가.
 *   kirchhoffs-current-law      들어온 더미와 **포갠** 세 더미의 높이가 같다 (몫이 달라져도)
 *   kirchhoffs-voltage-law      **한 바퀴** 돌면 전위가 제자리 높이
 *   emf-and-internal-resistance **전지 안**에서 잃는 몫
 * 마디·갈래·나뉨·합·전하 보존 어휘는 이쪽에만 둔다. 갈래마다의 전류 **값**을 글자로 쓰는
 * 쪽은 series-parallel-resistors 라 그쪽과도 갈라 둔다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const kirchhoffsCurrentLawConcept: Aperi21ConceptSource = {
  id: 'kirchhoffs-current-law',
  label: "Kirchhoff's Current Law at a Junction",
  canonicalSim: 'aperi21:kirchhoffs-current-law',

  surface: {
    definition:
      'That everything arriving at a junction leaves it: the charge counted through the outgoing branches, stacked one heap on another, comes level with the heap counted coming in, however unevenly the branches divide it.',
    exemplarKeywords: [
      "Kirchhoff's current law",
      'the junction rule',
      'current in equals current out',
      'conservation of charge at a node',
      'the branch currents add up to the total',
      'how does the current divide between branches',
      'is current used up as it goes round',
      'writing the node equation',
      'current splitting where wires meet',
      'the easiest branch takes the biggest share',
    ],
  },

  briefing: {
    observable: [
      'A battery feeds a trunk wire that reaches a junction and divides into three branches, each carrying a different resistance.',
      'The grains are spaced identically on every wire, so a branch carrying more runs faster, and the tails behind the grains keep that difference readable while the picture is still.',
      'A gate stands just before the junction and one just past it on each branch, and all four darken while the counting is on.',
      'Every grain that passes a gate adds one square to its own heap on a panel at the right: one heap for what came in and three for what went out.',
      'The counting stops with six squares in and three, two and one out.',
      'The second and third heaps then slide up onto the first until the three are one column, and the branch labels travel with their own groups.',
      'A line in the accent colour joins the top of that column to the top of the incoming heap, and the two stand level.',
      'The panel clears, the value written on the third resistance changes, and the grains in that branch and in the trunk quicken.',
      'Counting again gives eight in and three, two and three out, and stacked the column again comes level with the incoming heap.',
      'No current is written anywhere; every count is a height of squares that can be counted one at a time.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the counting, the stacking and the comparison happen twice over with different branch resistances, and the run begins again.',
        'Three branches are used, all with different resistances, so that no even split can be mistaken for the rule itself.',
        'The grains are spaced the same on every wire, so more current is always shown as faster flow and never as a denser line.',
        'Every square is the same size in every heap, so the comparison is a comparison of heights and needs no number.',
        'The stacking is carried out on screen instead of being left to the reader, so the sum is watched rather than performed.',
        'The gates sit immediately before and after the junction, so that what is counted is plainly what enters and leaves that one place.',
        'The accent colour is kept for the line that says the two stand level, so nothing else on screen claims to be the point.',
      ],
    },

    useWhen: [
      'The article has stated the junction rule and the reader half-suspects that current is used up along the way. Two counts with different splits, both stacking to the same height, turns the rule from an assertion into something watched.',
      'The prose needs the uneven division itself, the easiest branch taking the largest share, kept separate from the rule that the shares must add up.',
    ],

    avoidWhen: [
      'A value in amperes is needed, or the node equation is to be written out. Nothing is written but the resistances; every count is a height of squares.',
      'The subject is the potential round the circuit, or how the supply is shared between elements. Nothing here is drawn in volts.',
      'The junction where the branches rejoin is the point being made. Only the dividing junction is counted here.',
      'The article concerns a changing current — a circuit being switched, a store of charge filling or emptying. Everything here is steady while the counting runs.',
      'The reader is to change a branch resistance themselves. The two arrangements are worked through in turn by the run.',
      'The convention that current runs opposite to the electrons is being taught. The grains are named once and no conventional arrow is drawn.',
      'What is wanted is the value each branch takes, written out so it can be checked. The branches here are counted, not reported.',
    ],

    contrastWith: [
      {
        concept: 'kirchhoffs-voltage-law',
        note: 'One is about a place where wires meet and what is conserved in passing through it; the other is about a closed walk and what is conserved on returning to the start.',
      },
      {
        concept: 'series-parallel-resistors',
        note: 'One makes the adding the whole event, counting what passes and stacking the branches against the trunk; the other writes the branch and supply currents out as figures and leaves the agreement to be noticed.',
      },
      {
        concept: 'continuity-equation',
        note: 'Both insist that what enters a division must leave it, but one counts charge through the branches of a circuit, and the other follows an incompressible fluid, where the speed must rise wherever the channel narrows.',
      },
      {
        concept: 'electric-charge',
        note: 'One takes charge for granted and claims only that none of it is lost where wires meet; the other is about charge itself, its two kinds and how a body comes by it.',
      },
      {
        concept: 'ohms-law',
        note: 'One is about how a fixed total divides between branches of unequal resistance; the other about how much a single resistance lets through at a given voltage.',
      },
    ],
  },
};
