/**
 * uncertainty-principle 개념 선언.
 *
 * 양자 상태 넷과 이웃하지만 주장이 다르다 — 넷은 상태가 무엇이냐를 말하고, 이쪽은
 * 두 분포의 **폭이 맞바꿈**이며 그 곱에 바닥이 있다고 말한다. 재는 일이 일어나지 않는다.
 *   uncertainty-principle  한쪽을 좁히면 다른 쪽이 넓어진다 — 곱의 바닥
 *   measurement-collapse   재면 한 자리가 나오고 상태가 그리로 모인다
 * 이쪽만 두 켤레 분포 · 폭 · 곱의 바닥 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const uncertaintyPrincipleConcept: Aperi21ConceptSource = {
  id: 'uncertainty-principle',
  label: 'Uncertainty Principle',
  canonicalSim: 'aperi21:uncertainty-principle',

  surface: {
    definition:
      'How sharply a particle can have both a position and a momentum at once: narrowing the spread of either widens the spread of the other, and the product of the two has a floor beneath it.',
    exemplarKeywords: [
      'uncertainty principle',
      'Heisenberg',
      'delta x delta p',
      'position and momentum cannot both be sharp',
      'conjugate quantities',
      'is there a limit to how precisely we can know things',
      'squeezing the position spreads the momentum',
      'h-bar over two',
      'a trade-off between two spreads',
      'minimum uncertainty state',
      'why quantum mechanics has a built-in fuzziness',
    ],
  },

  briefing: {
    observable: [
      'Two panels of the same width stand on the left, one above the other: the upper is the spread in position, the lower the spread in momentum, each named.',
      'Each holds a single hump with a marked bar laid across it at its width, and both bars are drawn in the one colour reserved for width.',
      'At the start the upper hump is low and wide while the lower is tall and narrow.',
      'The upper hump then gathers toward the middle and rises, and in the very same moment the lower one settles down and spreads out — the two width bars move in opposite directions.',
      'The area under each hump stays the same throughout, so a hump that narrows must grow taller, and the narrowing reads as probability gathering rather than as anything being lost.',
      'On the right stands a plane whose two directions are the two widths. A curve crosses it, and everything beneath the curve is hatched and marked as the region where the product would be below the floor.',
      'A dot for the state now on the panels slides along that curve, down to one side and back up to the other, and never once enters the hatched region.',
      'Along the two edges of that plane, bars run out from the corner as far as the present widths, so that whenever one shortens the other lengthens.',
      'Dashed lines run from the dot down to each edge, tying the point on the curve to the two bars.',
      'Nothing is given in numbers and neither panel nor plane is ruled; the two settings are simply squeezed and released over and over.',
      'The writing below names what is happening at each stage and closes by saying there is no way to narrow both.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The position is squeezed and released on a fixed round and the momentum answers.',
        'The two panels are shown together rather than one after the other, so "they move opposite ways" is seen at one glance rather than held in memory.',
        'The area under each hump is preserved, so the vertical scale carries meaning: the taller a hump gets, the narrower it must be.',
        'The width bars are drawn where the hump has fallen to a fixed fraction of its height, so they stand for the spread rather than for the full extent of the curve.',
        'The plane on the right is what turns "they move opposite ways" into "their product cannot go below this" — the floor is drawn as the edge of a forbidden region, and the dot riding that edge is what makes it a floor.',
        'Only states sitting exactly on the floor are shown, so there is one dot to follow and one statement being made.',
        'The colour reserved for width is used for the bars on the panels, the bars on the plane and the dot, and for nothing else.',
        'It opens with the position already spread wide, a moment before the squeezing starts.',
      ],
    },

    useWhen: [
      'The article has stated the limit as an inequality and the reader needs to see it as a trade rather than as a failure of instruments. One hump is squeezed and the other visibly pays for it in the same instant.',
      'The point is that the limit is a floor and not merely a tendency. The dot slides the whole length of the curve without ever crossing into the hatched region below it.',
      'The article wants both spreads treated as widths of distributions rather than as errors in a reading. Each is drawn as a hump of fixed area with its width marked.',
    ],

    avoidWhen: [
      'The point turns on a measurement disturbing what it measures, on a photon jostling the electron it is used to see, or on an observer effect. Nothing is measured here and no result is taken.',
      'The article is about what a measurement yields or what it leaves the state in.',
      'The conjugate pair in question is energy and time, or the quantities are components of spin. The two panels here are position and momentum and nothing else.',
      'The figures wanted are a value of the constant, or an uncertainty worked out for a given case. Nothing is ruled or numbered.',
      'The subject is a beam through a narrow opening spreading out more the narrower the opening is. There is no opening, no beam and no screen here — only two distributions belonging to one particle.',
      'The article is about statistical spread in a sample shrinking as more is gathered.',
    ],

    contrastWith: [
      {
        concept: 'slit-width-and-diffraction',
        note: 'Both are a narrowing in one place answered by a widening in another, but one is a wave through an opening in a wall, while the other is a claim about one particle having two spreads at once whose product cannot be shrunk.',
      },
      {
        concept: 'measurement-collapse',
        note: 'One is about what a state can be before anyone touches it; the other is about what measuring does to it, and the floor holds whether or not any measurement is made.',
      },
      {
        concept: 'de-broglie-wavelength',
        note: 'One gives a particle of definite speed a single sharp wavelength; the other is about the price of pinning down position instead, at which point no single wavelength is left to give.',
      },
      {
        concept: 'statistical-fluctuation',
        note: 'One is a spread that narrows toward nothing as more particles are counted; the other is a spread that no amount of counting removes, because it is a property of the state rather than of the sample.',
      },
    ],
  },
};
