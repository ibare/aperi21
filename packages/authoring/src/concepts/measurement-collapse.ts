/**
 * measurement-collapse 개념 선언.
 *
 * 양자 상태 넷 가운데 **재는 순간**을 주장한다.
 *   wave-function          거듭 재면 분포가 드러난다 — 상태는 그대로다
 *   superposition-quantum  겹친 상태는 출렁인다 — 재지 않는다
 *   measurement-collapse   한 번 재면 **한 자리**가 나오고 상태가 그리로 **모인다**
 *   particle-in-a-box      벽이 에너지를 띄엄띄엄하게 만든다
 * 이쪽만 측정 뒤의 상태 · 곧바로 다시 재기 · 같은 자리 어휘를 갖는다. 한 주기에 측정은
 * 둘뿐이라 점이 쌓이지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const measurementCollapseConcept: Aperi21ConceptSource = {
  id: 'measurement-collapse',
  label: 'What Measuring Leaves Behind',
  canonicalSim: 'aperi21:measurement-collapse',

  surface: {
    definition:
      'What measuring does to a state spread over many places: the result is one place, the state left behind is gathered at that place, and measuring again at once returns the same one.',
    exemplarKeywords: [
      'collapse of the wave function',
      'measurement in quantum mechanics',
      'observing fixes the state',
      'why does measuring change anything',
      'measuring twice gives the same answer',
      'the state right after a measurement',
      'from spread out to a single place',
      'projection onto the result',
      'the quantum measurement problem',
      'the act of observation',
      'reproducibility of a quantum measurement',
    ],
  },

  briefing: {
    observable: [
      'A single panel holds where the particle may be — a shape spread into two broad mounds with a dip between them.',
      'Below the panel are two rows set aside for results, the first named for the first measurement and the second for the repeat, both empty to begin with.',
      'A flash drops from the panel onto one place, and a circle appears in the first row directly beneath where it landed.',
      'The spread shape then draws itself in: the two mounds sink away and a narrow, tall spike rises at that one place.',
      'The area under the shape is the same before and after, so the spike stands several times higher than the mounds did — all of what was spread has gone to that place rather than some of it being lost.',
      'The shape it had before the measurement stays behind as a faint dotted outline, so what gathered and where from is still on screen.',
      'A second flash then drops down the very same vertical line, and a circle appears in the repeat row directly under the first one.',
      'The two circles stand on one vertical line, which is the whole of the comparison — no value is written for either.',
      'Everything then clears and the same spread shape is prepared over again, and the next round\'s result falls somewhere else, sometimes under one mound and sometimes under the other.',
      'The shape holds perfectly still except in the moment it gathers; it does not drift, spread or swing at any other time.',
      'No axis is ruled and nothing anywhere is numbered.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The preparing, the measuring, the gathering and the repeat all run on a fixed round.',
        'Only two measurements are made in a round, so what is being shown is what one measurement does rather than what many of them reveal.',
        'The gathering is drawn as a short movement rather than switching between two pictures, so what went where can be followed; this is a matter of being able to see it, not a claim about how long anything takes.',
        'The area under the shape is preserved as it gathers, which is what makes the tall spike mean "all of it is here now" rather than "there is more of it than before".',
        'The shape from before the measurement is kept as a faint outline, without which the gathering would read as the state having been replaced rather than concentrated.',
        'The repeat measurement drops on the same vertical line by construction, because the state it reads is the narrow spike the first one left.',
        'The colour set aside for a result is used for the two flashes and the two circles, and for nothing else; the shape stays one colour whether spread or gathered.',
        'Each round takes a fresh result on the same preparation, so the place is not always the same one from round to round.',
        'It opens with the spread shape already in place, a moment before the first measurement falls.',
      ],
    },

    useWhen: [
      'The article has said that observing changes the system and the reader needs to see what exactly changes. The result is one place and the state afterwards is a narrow spike at that place.',
      'The point is that the change is not a loss but a gathering. The area is kept, the old shape stays as an outline, and the spike stands as tall as the gathering requires.',
      'The article needs measurements on a quantum state to be reproducible rather than capricious. The second reading falls on the same vertical line as the first, immediately below it.',
      'The reader should see that the unpredictability lies in which place comes up and not in what follows. The place changes from round to round; the repeat never does.',
    ],

    avoidWhen: [
      'The subject is many results accumulating into a distribution, or how a distribution is read off a state. Two measurements are made in a round and nothing piles up.',
      'The article is about a state being made of two parts at once, or about the difference between that and being one of them unknown.',
      'The point turns on how a measuring instrument works, on decoherence, or on which interpretation of quantum mechanics is right. What is drawn is the before and the after, with nothing said about the mechanism.',
      'The subject is a particle landing on a screen behind openings, or a pattern accumulating from separate arrivals.',
      'The article is about a state developing on its own over time, or about a narrow spike spreading out again afterwards. The shape here holds still and the repeat comes immediately.',
      'The figures wanted are a probability for the result or the position it came out at. Nothing is numbered and no axis is ruled.',
    ],

    contrastWith: [
      {
        concept: 'wave-function',
        note: 'One takes many results on freshly prepared states and cares about the shape they gather into; the other takes two results on one particle and cares about what the first left behind.',
      },
      {
        concept: 'superposition-quantum',
        note: 'One is about what such a state is while nobody touches it; the other is about the moment somebody does, and about how little of the spread survives it.',
      },
      {
        concept: 'uncertainty-principle',
        note: 'One is a limit on what a state can be at all, holding whether or not anything is measured; the other is about the act of measuring and what it leaves.',
      },
      {
        concept: 'double-slit-with-electrons',
        note: 'One measures the same particle twice and asks whether the answers agree; the other measures each particle once and asks what the whole crowd of answers looks like.',
      },
    ],
  },
};
