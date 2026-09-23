/**
 * newtons-law-of-gravitation 개념 선언.
 *
 * 위험한 형제는 `gravitational-field` 다 — 둘 다 역제곱을 말한다. **주어를 갈랐다.**
 *   newtons-law-of-gravitation  **두 물체 사이**의 한 쌍 — 길이가 늘 같고 함께 제곱으로 준다
 *   gravitational-field         **한 원천이 자리마다 미리 깔아 둔 것** — 놓인 질량이 그 화살표를 따른다
 * 이쪽만 「한 쌍 · 서로 · 거리를 2배 3배」 어휘를 갖고, 저쪽만 「자리 · 놓으면 · 미리」 를 갖는다.
 * 역제곱 검색어(inverse square · 1/4 · r²)는 이쪽에만 둔다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const newtonsLawOfGravitationConcept: Aperi21ConceptSource = {
  id: 'newtons-law-of-gravitation',
  label: 'The Mutual Pull of Two Bodies and Its Fall with Distance',
  canonicalSim: 'aperi21:newtons-law-of-gravitation',

  surface: {
    definition:
      'The pull two bodies exert on one another, equal in size on each however unequal they are, and cut to a quarter and to a ninth as the gap between them is doubled and tripled.',
    exemplarKeywords: [
      'law of universal gravitation',
      'inverse square law',
      'twice as far away means a quarter of the pull',
      'why does gravity get weaker with distance',
      'the Earth pulls the apple and the apple pulls the Earth',
      'both feel the same force even though one is tiny',
      'distance squared in the denominator',
      'how much weaker at three times the distance',
      'gravitational attraction between two masses',
      'does the small one pull back just as hard',
    ],
  },

  briefing: {
    observable: [
      'A large body and a much smaller one sit on one line, with an arrow leaving each of them aimed at the other, so the two arrows face each other across the gap.',
      'The two arrows are the same length from beginning to end, although one body is drawn many times the size of the other.',
      'At the starting separation the two arrowheads very nearly touch in the middle of the gap.',
      'As the small body moves outward, both arrows shorten together, and the length each of them had at the start stays behind as a faint dotted arrow from the same tail.',
      'A ruler marked at the starting distance and at two and three times it runs out from the large body, and the small body comes to rest exactly on those marks.',
      'At the second mark the two arrows are a quarter of their dotted ghosts and both carry the name `F/2²`; at the third they are a short stub of a ninth and both carry `F/3²`.',
      'The names appear only while the bodies are standing still, and disappear while the gap is changing.',
      'On the way back in, the two arrows lengthen together and quickly.',
      'The whole cycle runs and repeats by itself.',
    ],

    screen: {
      affordances: [
        'The opening and closing of the gap and the two holds at the marked distances happen in order and then begin again; nothing has to be pressed.',
        'The starting length is kept on screen as a dotted ghost, so a quarter and a ninth are read as a ratio of two lengths rather than taken from a number.',
        'No force values, no masses and no gravitational constant are written anywhere — the marks carry `2r` and `3r` and the arrows carry `F/2²` and `F/3²`, which puts the squared distance and the squared reduction side by side.',
        'Both bodies are drawn in the same ink and differ only in size, so nothing but length distinguishes the two arrows — and their lengths never differ.',
      ],
    },

    useWhen: [
      'The article has written the force as dividing by distance squared and the reader is likely to be halving the force when the distance doubles. The stub beside its own dotted ghost at three times out is what corrects the arithmetic.',
      'The prose needs the two-sidedness stated as something seen rather than asserted — that the heavy body and the light one are pulled by exactly as much as each other.',
    ],

    avoidWhen: [
      'The point is that a bigger mass pulls harder, or the article changes a mass and asks what happens. Only the gap changes here; the two bodies keep their sizes throughout.',
      'The article needs a number of newtons, a value for the gravitational constant, or a worked calculation. Nothing on screen is a quantity — the only writing is the distance marks and the names on the arrows.',
      'What is wanted is what gravity does at places where nothing has been put yet, or a picture of the surrounding space. Here there are two bodies and nothing between them but the arrows they exert on each other.',
      'The subject is the motion that this pull produces — falling, orbiting, speeding up. The small body is moved outward and back as a way of changing the gap, and never falls.',
      'The article is about light, sound or brightness spreading out and thinning with distance. Nothing here spreads; what shortens is an arrow.',
    ],

    contrastWith: [
      {
        concept: 'gravitational-field',
        note: 'One is a quantity that needs two bodies and belongs to neither of them alone; the other is a quantity one body assigns to every place around it, before any second body is there to be pulled.',
      },
      {
        concept: 'newtons-third-law',
        note: 'One is the particular pull for which the two-sidedness is easiest to doubt, since the bodies are so unequal; the other is the general rule that every force comes in such a pair.',
      },
      {
        concept: 'gravitational-acceleration',
        note: 'One says how the pull between two bodies depends on how far apart they are; the other treats that pull as fixed and follows what it does to a velocity second by second.',
      },
      {
        concept: 'shell-theorem',
        note: 'One takes the two bodies as points and asks only about the gap; the other asks what happens to that same law when one of them is spread out over a sphere and the other is inside it.',
      },
    ],
  },
};
