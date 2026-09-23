/**
 * poynting-vector 개념 선언.
 *
 * 전자기파 다섯 가운데 이쪽은 **에너지가 지나가는 길**이다 — 파동이 아니라 정상 회로에서,
 * 도선 속이 아니라 둘레 공간으로 간다.
 *   poynting-vector       **길** — 전지 틈에서 나와 도선 사이를 지나 저항으로 모인다
 *   electromagnetic-wave  **떨어져 나감** · maxwells-equations  **사슬**
 *   radiation-pressure    **밀기** — 닿은 것이 받는 몫
 * 이쪽만 「어느 길로 · 도선 밖 · 전지에서 저항으로」 어휘를 갖는다. 얼마나 데우는가는
 * `joule-heating`, 단계별 몫은 `energy-flow-diagram` 의 몫이라 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const poyntingVectorConcept: Aperi21ConceptSource = {
  id: 'poynting-vector',
  label: 'The Route a Circuit’s Energy Takes',
  canonicalSim: 'aperi21:poynting-vector',

  surface: {
    definition:
      'That the energy warming a resistor does not run along inside the wires but crosses the space beside them, leaving the gap between the battery’s plates and gathering into the resistor’s body.',
    exemplarKeywords: [
      'Poynting vector',
      'where does the energy in a circuit actually travel',
      'energy flows in the space around the wires, not within them',
      'S equals E cross B over mu nought',
      'energy flux of an electromagnetic field',
      'how energy gets from a battery to a resistor',
      'do the electrons carry the energy along the wire',
      'the fields beside a wire carry the power',
      'which direction electromagnetic energy flows',
      'energy entering a resistor from outside it',
    ],
  },

  briefing: {
    observable: [
      'A battery at the left and a resistor at the right are joined by two wires, the whole circuit seen face on.',
      'At six places between the two wires, arrows appear first, all of them pointing from the upper wire down to the lower one.',
      'Rings are then drawn wrapping each wire, passing behind it on one side and in front of it on the other; where a ring crosses the plane between the wires a crossed mark sits, and outside the wires a ringed dot.',
      'From the foot of each of those marks a third arrow rises square to the first, and all six of them point toward the resistor.',
      'The first two sets then fade and flow lines appear, with grains running along them: they fan out of the narrow gap between the battery’s two plates, cross the space between the wires, and gather into the zig-zag of the resistor.',
      'Not one grain ever runs along a wire.',
      'Letters naming the three kinds of arrow are put on one column only, so the screen is not crowded with repeated labels.',
      'Everything fades and the arrows are laid down again from the beginning.',
      'No number, no unit and no equation appears anywhere.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the three quantities are laid down in turn, the flow runs, and the round begins again.',
        'The arrows and the flow lines are worked out from the arrangement rather than drawn by hand, so the fanning out at the battery and the gathering at the resistor come from the calculation and not from the drawing.',
        'The direction energy goes is the one meaning picked out in colour, and the running grains share that colour because they stand for the same thing.',
        'The three quantities are told apart by shape — a straight downward arrow, a wrapped ring with its dot and cross marks, a thick arrow lying across — rather than by colour alone.',
        'Every grain moves at the same speed, so it is the spacing of the flow lines and the length of the arrows that speak for strength.',
        'Only the region between the two wires is furnished with arrows, and the line of text beneath keeps its claim to that region.',
      ],
    },

    useWhen: [
      'The article has stated that energy travels in the field rather than in the wire and the reader takes it for a figure of speech. Grains that leave the battery’s gap, cross open space and never once touch a wire make the claim literal.',
      'The prose needs two fields at right angles to yield a third direction, and needs that third direction to point somewhere that matters rather than being an exercise in vectors.',
    ],

    avoidWhen: [
      'The article is about a wave in open space, about radiation, or about light carrying energy from far away. The stage here is a steady circuit with a battery and a resistor.',
      'The subject is how much power is delivered, a value in watts, or two resistors compared by how fast they warm.',
      'The point is that a resistance turns a current into heat at all, or where the heat appears inside it.',
      'The article needs energy accounted for stage by stage as a budget with losses taken off each step.',
      'The reader is to change the voltage or the current and see what follows. Altering either would change the lengths of the arrows and leave every direction exactly as it is.',
      'The energy in the space outside the wires is the subject, or the flow there is to be traced. Only the region between the wires is furnished, and the claim is kept to it.',
    ],

    contrastWith: [
      {
        concept: 'joule-heating',
        note: 'One asks by what route the energy reaches the resistor; the other takes its arrival for granted and asks how fast it warms what.',
      },
      {
        concept: 'electromagnetic-wave',
        note: 'One is a steady circuit in which nothing travels but the energy; the other is a field coming loose from its source and travelling off as a wave.',
      },
      {
        concept: 'energy-flow-diagram',
        note: 'One asks the geographical question of where the energy passes; the other asks the bookkeeping question of how much of it survives each stage.',
      },
      {
        concept: 'kirchhoffs-voltage-law',
        note: 'One follows energy through the space beside the circuit; the other follows potential round the loop of the circuit itself and never leaves the wire.',
      },
    ],
  },
};
