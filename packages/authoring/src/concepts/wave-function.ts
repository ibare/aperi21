/**
 * wave-function 개념 선언.
 *
 * 양자 상태 넷은 각자 다른 것을 주장한다.
 *   wave-function          진폭에는 **부호**가 있고 제곱한 것이 분포다 — 점이 쌓여 확인한다
 *   superposition-quantum  둘을 겹친 상태는 **출렁인다** — 「사실은 하나」 와 다르다
 *   measurement-collapse   재면 **한 자리**가 나오고 상태가 그리로 모인다
 *   particle-in-a-box      벽이 **에너지를 띄엄띄엄**하게 만든다
 * 이쪽만 부호 있는 진폭 · 제곱 · 마디 · 거듭 측정의 분포 어휘를 갖는다. 상태는 측정
 * 사이에 변하지 않는다 — 붕괴도 출렁임도 여기 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const waveFunctionConcept: Aperi21ConceptSource = {
  id: 'wave-function',
  label: 'Wave Function and Its Square',
  canonicalSim: 'aperi21:wave-function',

  surface: {
    definition:
      'What the wave function says about where a particle may be found: the amplitude carries a sign, its square does not, and repeated results on one prepared state gather into that squared shape.',
    exemplarKeywords: [
      'wave function',
      'psi squared',
      'the Born rule',
      'probability amplitude',
      'what does a negative wave function mean',
      'probability density of a particle',
      'why do we square the wave function',
      'amplitude versus probability',
      'nodes where the particle is never found',
      'results piling up into a distribution',
      'how to read psi',
    ],
  },

  briefing: {
    observable: [
      'Three panels are stacked one above the other and all share the same left-to-right direction, so a single vertical line through them picks out one place.',
      'The top panel holds the signed amplitude: one lobe dips below the line and the other rises above it, and between them the curve crosses the line at a point.',
      'The middle panel starts as a copy of the top curve and then turns into its square — the dipping lobe flips up, the rising one stays up, and the crossing point stays at zero.',
      'Below them a band is set aside for results, named as such.',
      'Results then come one at a time. Each new one is marked out and a dashed guide runs up from it through both panels, marking the point of each curve directly above it.',
      'A result landing where the amplitude dips marks a point below the line on the top panel and above the line on the middle one — the same place, opposite signs.',
      'The rest of the results then pour in, and in the middle panel a stack of them builds up column by column, filling from the line upward toward the squared curve.',
      'When they are all down, the top of the stack follows the squared curve, two mounds with a hollow between them, and the band below shows the same two clumps and the same gap.',
      'The place where the curve crossed the line stays almost bare of results.',
      'Everything then clears away, and the next round is a fresh set of results on the same prepared state, landing in different places but gathering into the same shape.',
      'Nothing is ruled or numbered on any panel; what is read is the shape.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The squaring, the one-at-a-time results and the flood all come on their own and the round repeats.',
        'The amplitude and its square are kept on separate panels rather than laid over one another, because their heights mean different things and one height cannot carry two meanings.',
        'The squaring is shown as a movement from one shape into the other rather than as two finished pictures, which is what pairs the dipping lobe with the mound it becomes.',
        'The first few results are drawn one at a time with a guide running through the panels, so that a single result being a single place, and its falling where the amplitude is negative, are both visible before the flood begins.',
        'The first few results always include one where the amplitude dips below the line, so the statement about negative places never lacks an example.',
        'The stack of results is topped only where results actually fell, so an empty column stays empty and the hollow between the mounds is genuine.',
        'The colour set aside for a result just taken is used for the new mark, its guide and the points it picks out on the curves, and for nothing else.',
        'The state does not change from one result to the next; the same thing is prepared again and read again.',
        'It opens with two results already down and the next about to be taken.',
      ],
    },

    useWhen: [
      'The article has introduced the amplitude and the reader is stuck on what a negative value could mean. Results land in the dipping lobe as readily as in the rising one, and the square is what they gather into.',
      'The point is that squaring is not a formality but the step that makes the shape into a distribution. The copy of the amplitude is squared on screen and the results then fill up to that very curve.',
      'The article needs the node to be a real prediction — a place where the particle is essentially never found. The crossing point stays bare while everything around it fills.',
      'The reader should see that a distribution is a claim about many repetitions rather than about one particle. The round starts over with new results in new places gathering into the same shape.',
    ],

    avoidWhen: [
      'The point is what a measurement leaves the state in, or that a second reading right afterwards gives the same answer. The state here is unchanged between readings and each one starts from the same preparation.',
      'The subject is a state made of two parts beating against each other, or a distribution that moves. Nothing here moves after the squaring; the shape is a fixed target.',
      'The article turns on complex amplitudes, on real and imaginary parts, or on how a state develops in time. The amplitude here is fixed and its sign is all that it carries.',
      'The subject is which energies a confined particle may have, or the ladder of levels in a well.',
      'The subject is two openings, two paths, or a pattern arising from interference between them. There are no openings here and no second path.',
      'The figures wanted are a probability, an expectation value or a normalisation. Nothing is numbered.',
    ],

    contrastWith: [
      {
        concept: 'measurement-collapse',
        note: 'One repeats a measurement on a freshly prepared state and cares about the collection; the other makes two measurements on one particle and cares about what the first did to it.',
      },
      {
        concept: 'superposition-quantum',
        note: 'One asks how a fixed state is turned into a distribution; the other asks what it means for a state to be made of two at once, which shows up as a distribution that will not hold still.',
      },
      {
        concept: 'particle-in-a-box',
        note: 'One is about reading a given shape as a distribution, sign and all; the other is about which shapes a pair of walls allows in the first place and what energy each carries.',
      },
      {
        concept: 'double-slit-with-electrons',
        note: 'Both end with separate landings gathered into a shape, but one is about two paths interfering and the other about a single given state whose sign disappears on squaring.',
      },
    ],
  },
};
