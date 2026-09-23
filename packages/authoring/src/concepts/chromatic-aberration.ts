/**
 * chromatic-aberration 개념 선언.
 *
 * 수차 둘 가운데 **색**이 원인인 쪽이다. 짝과는 「무엇이 자리를 가르느냐」 하나로 갈렸다.
 *   chromatic-aberration  들어온 **색**이 모이는 자리를 정한다 — 줄기 높이는 상관없다(일부러 근축)
 *   spherical-aberration  들어온 **높이**가 건너는 자리를 정한다 — 색은 하나
 * 이쪽만 흰빛 · 파랑 초점 · 빨강 초점 · 테두리 색이 뒤집힘 어휘를 갖는다. 조리개 · 가장자리 줄기는 쓰지 않는다.
 * 한 면에서 색이 갈리는 것 자체는 아직 선언되지 않은 이웃의 몫이라 avoidWhen 으로 되돌린다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const chromaticAberrationConcept: Aperi21ConceptSource = {
  id: 'chromatic-aberration',
  label: 'One Focus for Each Colour',
  canonicalSim: 'aperi21:chromatic-aberration',

  surface: {
    definition:
      'The defect a lens has because glass bends each colour by a different amount: white light gathers at a nearer place for blue than for red, leaving a coloured rim wherever it is caught.',
    exemplarKeywords: [
      'chromatic aberration',
      'colour fringing at the edges of a photograph',
      'each wavelength has its own focal length',
      'blue focuses closer than red',
      'purple fringes in a cheap telescope',
      'why white light will not focus to a point',
      'the refractive index depends on wavelength',
      'achromatic doublet',
      'coloured edges around a bright object',
      'a lens cannot focus all colours together',
      'the fringe changes colour as you move the screen',
    ],
  },

  briefing: {
    observable: [
      'Against a dark panel, two pairs of white beams travel in parallel toward a convex lens.',
      'Past the lens each white beam becomes three — blue, green and red — which lie on top of one another just behind the glass, where they still look white, and draw apart as they go.',
      'The blue beams cross the axis first, the red ones further along. A point is marked at each of those two places with a line dropped to the foot of the panel, and the two are named as the blue focus and the red focus.',
      'A line of writing below the panel states that the distance between the two foci is shown fifteen times larger than it is.',
      'A bright screen is then stood up at the blue focus. The light beyond it disappears, and a second, face-on view of that screen opens at the side of the picture.',
      'In that face-on view the three colours land as three discs laid on top of one another: blue is a tight point, green is larger, red is largest of all, so what shows around the outside is a red rim with a white centre.',
      'The screen slides along the axis toward the red focus. As it goes the blue disc widens and the red one shrinks, and partway across the rim has already changed hands.',
      'At the red focus the arrangement is reversed — red is the tight point and blue is the widest disc, so the rim is now blue.',
      'The screen and the marks fade, and the round starts again with the white beams arriving at the lens.',
    ],

    screen: {
      affordances: [
        'The screen is put up and slid from one focus to the other in a fixed round, over and over, with nothing to press.',
        'Each colour’s gathering distance is worked out from its own bending in the glass, so the order of the foci along the axis is a consequence rather than a drawing choice.',
        'The colours are the colours of the light itself rather than labels for parts, and the discs are laid on one another so that the overlap brightens toward white and only the widest colour is left showing at the rim.',
        'The green beam is there so that the mixed centre reads as white light rather than as a third colour; only the blue and red foci are marked and named.',
        'Every beam here is drawn as though it entered close to the axis, which leaves the colour as the one thing that can account for the foci being apart.',
        'The whole picture sits on a dark panel and the light is painted as light, so the white beams and the pale rims read the same way in a bright or a dark setting, with the writing kept outside the panel.',
        'The amount by which the gap between the foci has been enlarged is stated on screen rather than left to be inferred.',
        'The screen opens with the colours already drawn apart and both foci marked.',
      ],
    },

    useWhen: [
      'The article has said that a lens bends different colours differently and the reader takes it as a footnote. Here it is the whole of what is on screen — two separate foci from one lens and one beam of white light.',
      'The point being made is the coloured edge seen in a photograph or a cheap instrument, and the article wants where the colour comes from. Sliding the screen between the two foci turns the rim from red to blue, which shows the edge as a consequence of where the light is caught.',
      'The reader has been told that a single lens cannot be sharp for white light, and needs a picture of what "cannot" means. There is no setting of the screen here at which all three colours are points together.',
    ],

    avoidWhen: [
      'The subject is a prism, a rainbow, or colours being separated as light crosses a single flat face. The splitting here is what a lens does to its focus; no beam is followed through a prism.',
      'The article is about light failing to gather because of where across the lens it entered, or about the effect of an aperture. Every beam here is drawn as a near-axis one and the entry heights are not at stake.',
      'The figures wanted are focal lengths, refractive indices for each colour, or how far apart the foci really are. The separation on screen is deliberately enlarged and the amount is stated, so no distance here can be quoted as a measurement.',
      'The point is how the defect is cured — a converging and a diverging lens paired to bring two colours back together. Only the single uncorrected lens is drawn.',
      'The subject is why glass bends colours by different amounts, or the shape of the curve of index against wavelength. That is nowhere on screen; what is shown is the outcome at the focus.',
      'The article is about an object and the image made of it, its size or its way up. The light arrives parallel and nothing stands for a thing being imaged.',
    ],

    contrastWith: [
      {
        concept: 'spherical-aberration',
        note: 'Both are ways one lens fails to gather light at a single place; in one the colour decides where the light gathers, in the other the entry height decides, and each is silent about the other’s cause.',
      },
      {
        concept: 'snells-law',
        note: 'One shows that the amount a material turns light is not one number but a number per colour; the other establishes that amount for a single beam of a single colour as the material changes.',
      },
      {
        concept: 'lens-combination',
        note: 'One shows the defect that a converging and a diverging lens held together are chosen to undo; the other shows what such a pairing does to the gathering distance, with colour never at stake.',
      },
      {
        concept: 'telescope',
        note: 'One shows what a single lens does wrong to white light; the other builds an instrument out of lenses and asks only what happens to the angle, taking the gathering itself for granted.',
      },
      {
        concept: 'dispersion',
        note: 'One takes it as given that glass bends each colour by its own amount and asks what that costs an instrument; the other is that difference itself, stated at a single face as a dependence of bending on wavelength, where nothing is gathered and so nothing is yet at fault.',
      },
    ],
  },
};
