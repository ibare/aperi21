/**
 * maxwells-equations 개념 선언.
 *
 * 전자기파 다섯 가운데 이쪽은 **왜 스스로 나아가는가** — 원인이 사라져도 고리가 고리를 낳는다.
 *   maxwells-equations    **사슬** — 바뀌는 한쪽 둘레에 다른 쪽 고리가 생기며 번져 간다 (원천 없음)
 *   electromagnetic-wave  **떨어져 나감** — 원천을 화면에 두고, 장이 전하에서 끊겨 나간다
 *   antenna-radiation     **방향** — 옆은 세고 축은 0
 *   poynting-vector       **길** — 에너지가 어느 쪽으로 지나가는가
 *   radiation-pressure    **밀기** — 닿은 것이 받는 운동량
 * 이쪽만 「서로를 낳는다 · 사슬 · 원인이 없어도」 어휘를 갖는다. 네 식을 늘어놓는 그림도,
 * 직교 사인파도 화면에 없어 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const maxwellsEquationsConcept: Aperi21ConceptSource = {
  id: 'maxwells-equations',
  label: 'The Chain That Keeps a Wave Going',
  canonicalSim: 'aperi21:maxwells-equations',

  surface: {
    definition:
      'That a growing magnetic field is ringed by an electric one and a growing electric field by a magnetic one, so rings go on forming ahead of one another once the first cause is gone.',
    exemplarKeywords: [
      'Maxwell’s equations',
      'how the equations lead to light',
      'a changing electric field makes a magnetic field',
      'a changing magnetic field makes an electric field',
      'Faraday and Ampère-Maxwell coupled together',
      'the two fields making one another over and over',
      'a chain of linked loops',
      'the link between electricity, magnetism and light',
      'electricity and magnetism unified',
      'mutual induction of the two fields',
    ],
  },

  briefing: {
    observable: [
      'Seen at a slant from above, an upright arrow marked B grows up and down at the left with nothing else on the stage.',
      'A flat ring marked E is then drawn round it in one continuous turn, a head riding at the drawing end, with the arrow passing up through the ring’s hole.',
      'An upright dashed ring marked B is next drawn round the right-hand end of that flat ring, and while it is being drawn the first arrow fades out.',
      'With the first arrow gone, flat and upright rings keep appearing one step further to the right, each threading the end of the one before it like links of a chain.',
      'Rings two steps back go faint, so a darker head of the chain is seen moving rightward.',
      'Every ring is the same size as every other, so nothing in the picture claims that one is stronger.',
      'The flat rings are solid and lie down, the upright ones are dashed and stand up; both are drawn in the same ink and told apart by their attitude and their letters.',
      'The whole chain fades away and a new arrow begins to grow at the left for the next round.',
      'No equation, no number and no scale appears anywhere on the screen.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the chain builds link by link, fades, and begins again.',
        'A ring being made is shown by its being drawn round with a head at its leading end, so that “is created” is something watched rather than stated.',
        'Which way round a ring goes follows the physical rule, so the flat rings all turn one way and the upright rings all turn one way, and the chain repeats the same shape every two links.',
        'The rings are set deep enough into one another to read as threaded rather than merely standing side by side.',
        'The first arrow is deliberately let go, so that from the third link onward nothing on the stage could be driving what follows.',
        'How far the chain has got is told only by where its dark head stands, so nothing is drawn that would suggest something pushing it along.',
      ],
    },

    useWhen: [
      'The article has named the two coupling laws and said that together they give a wave, and the reader cannot see how a law becomes a wave. Watching each ring made round the last, and then the first cause taken away while the chain carries on, is exactly the step the prose cannot take.',
      'The prose wants to say why light needs nothing to travel in. A chain that makes its own next link is the whole of the answer, and no medium is drawn for it to travel in.',
    ],

    avoidWhen: [
      'The article needs the equations written out, named one by one, or counted. Nothing is written on the stage and only the two coupling steps take part.',
      'The subject is charge as the source of a field, or the fact that a magnetic pole cannot be had alone. Neither of those laws appears in the chain.',
      'The familiar picture of two curves at right angles is wanted, or wavelength, frequency or amplitude are to be read off. The rings are all one size and nothing here is a curve.',
      'The article is about how a wave is launched from a source, or what an antenna does. The first cause here is a bare arrow with nothing behind it.',
      'The speed of light is to be arrived at or given a value, or the wave is to be timed.',
      'The strength of the field at one place or another is at issue. Every ring is drawn exactly alike.',
    ],

    contrastWith: [
      {
        concept: 'electromagnetic-wave',
        note: 'One removes every source and asks what keeps the field going afterwards; the other keeps the source in view and watches the field part from it.',
      },
      {
        concept: 'displacement-current',
        note: 'One follows the coupling out into empty space where no wires exist; the other pins one half of it down inside a circuit, where a gap can be held against a wire.',
      },
      {
        concept: 'amperes-law',
        note: 'One takes the ringing of one field by another as given and follows it link by link; the other settles, for a real current, how that ringing is totalled along a path.',
      },
      {
        concept: 'faradays-law',
        note: 'One has a changing field ringed by another field and measures nothing at all; the other has a changing field read off as a voltage in a coil and asks how large it is.',
      },
    ],
  },
};
