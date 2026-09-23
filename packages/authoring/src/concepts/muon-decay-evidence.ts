/**
 * muon-decay-evidence 개념 선언.
 *
 * 시간 넷 중 「**정말인가**」 를 맡는다 (`time-dilation` = 얼마나 · `light-clock` = 왜 ·
 * `twin-paradox` = 누가). 이 조각만 **재어 갈린 결과**다 — 시계도 빛도 없고, 같은 알갱이
 * 떼가 두 기둥에서 한쪽만 지표에 닿는다. 「그러므로 시간 지연은 관측된다」 가 주장이다.
 * 이쪽만 뮤온 · 대기 · 반감기 · 도달 수 어휘를 갖는다.
 *
 * 조각에 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const muonDecayEvidenceConcept: Aperi21ConceptSource = {
  id: 'muon-decay-evidence',
  label: 'Muons Reaching the Ground as Evidence',
  canonicalSim: 'aperi21:muon-decay-evidence',

  surface: {
    definition:
      'Short-lived particles made high in the atmosphere arrive at the ground in numbers that could not happen unless their decay clock ran slow while they descended at nearly light speed.',
    exemplarKeywords: [
      'muons',
      'cosmic ray muons reaching sea level',
      'experimental evidence that time dilation is real',
      'particles that should have decayed long before arriving',
      'half-life stretched out by high speed',
      'unstable particles live longer when they move fast',
      'ten kilometres of atmosphere and a microsecond of life',
      'how do we know time really slows down',
      'counting how many survive to the ground',
      'accelerator particles lasting longer than they should',
    ],
  },

  briefing: {
    observable: [
      'Two tall columns stand side by side with a shared height scale between them, marked at the top with ten kilometres, at the bottom with the ground, and carrying the downward speed and the half-life of the particles.',
      'Written words name each column: one is what would happen if time ran as usual, the other is what actually happens with the clock running about five times slow.',
      'The very same three hundred particles are released into both columns — same positions across, same starting heights, same individual lifespans — so the only thing that differs between the columns is how far each one gets before decaying.',
      'The outer edge of each column is ticked at the distance covered in one half-life: crowded ticks on one side, four widely spaced ones on the other.',
      'Particles descend as dark dots; each one that decays pops a small ring and leaves a faint dot behind at that height.',
      'The swarm on one side has almost entirely vanished within the first kilometre or two, while the swarm on the other side comes down still thick.',
      'Lower down, one column has nothing left flying at all, while on the other side particles keep arriving, each landing one settling on the ground as a bright point with a spreading half-ring.',
      'Counts appear beneath the two columns at the end — none for one side, a dozen or so for the other — and the count differs a little from one run to the next.',
      'The faint dots left where particles decayed form a record of their own: piled up near the top on one side, spread over the whole height on the other.',
      'The written factor of about five, the two half-life distances, the height and the speed are the only figures; no percentages, formulae or decay curves appear.',
    ],

    screen: {
      affordances: [
        'The release, the descent, the arrivals and the counts run through by themselves on a loop, with a fresh draw of particles each time round.',
        'Both columns are on screen at once and share one height scale, so the comparison is made by looking across rather than by changing anything.',
        'Because the same particles with the same individual lifespans are sent down both columns, the difference in outcome cannot be put down to luck of the draw.',
        'Lifespans are drawn so that the outcome is dependable run after run — the count on one side never reaches one and the count on the other never falls into single figures.',
        'Everything in the picture belongs to the ground observer; no second account of the same descent is offered.',
      ],
    },

    useWhen: [
      'The article has made the case for time dilation by argument and the reader wants to know whether it is ever seen. Two columns of the same particles, one arriving and one not, is the measurement stated as a picture.',
      'A piece is arguing that relativity is not a philosophical position but something that particle counters register daily, and needs one concrete instance the prose can point at.',
    ],

    avoidWhen: [
      'The subject is how radioactive decay works, what a half-life means, or the curve of a decaying population. Decay appears here only as dots disappearing, and no curve is drawn.',
      'The question is by what factor time stretches or where that factor comes from. The factor is stated in passing and neither counted out nor derived.',
      'The article gives the muon\'s own account, in which the atmosphere is the thing that shrinks. Only the ground observer\'s account is drawn.',
      'What is needed is the survival probability, an expected number, or a fraction. Only whole counted arrivals are shown.',
      'The subject is cosmic rays themselves — where they come from, what showers they make. The particles are already there at the top when the picture starts.',
    ],

    contrastWith: [
      {
        concept: 'time-dilation',
        note: 'One is the measured consequence, taken from a population whose survival can be counted; the other establishes the size of the effect with clocks built for the argument.',
      },
      {
        concept: 'light-clock',
        note: 'One is the evidence that a moving clock really does fall behind; the other is the reasoning that says it must.',
      },
      {
        concept: 'length-contraction',
        note: 'Both can account for the same arrivals, depending on whose account is taken — one has the particle\'s clock stretched, the other has the atmosphere it must cross shortened.',
      },
      {
        concept: 'michelson-morley',
        note: 'Both are measurements rather than arguments, but one is a signal that was expected and never appeared, while the other is a signal that appeared where none should have been possible.',
      },
    ],
  },
};
