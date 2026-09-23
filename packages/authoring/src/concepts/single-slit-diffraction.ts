/**
 * single-slit-diffraction 개념 선언.
 *
 * 회절 넷 가운데 **틈이 하나**인 쪽이다. 무엇이 바뀌는지로 형제와 갈랐다.
 *   single-slit-diffraction  바뀌는 것 = 틈의 **폭**. 주장 = 가운데 밝은 띠가 **어디서 끝나는가**
 *   diffraction-grating      바뀌는 것 = 틈의 **수**. 주장 = 밝은 줄이 같은 자리에서 날카로워진다
 *   thin-film-interference   바뀌는 것 = 막의 **두께**. 주장 = 남는 색이 옮겨 간다
 *   newtons-rings            바뀌는 것 = 자리마다의 틈 두께. 주장 = 고리 간격이 촘촘해진다
 * 이미 선언된 `diffraction`(그늘에도 물결이 있다) · `slit-width-and-diffraction`(퍼짐의 정도를
 * 폭 ÷ 파장이 정한다)은 둘 다 물결통의 수면이다. 이쪽만 「스크린 · 밝은 띠 · 어두운 무늬 ·
 * 반 파장 · 짝 짓기」 어휘를 갖고, 「그늘 · 돌아 들어간다 · 폭 대 파장의 비」 는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 저절로 일어나는 것을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const singleSlitDiffractionConcept: Aperi21ConceptSource = {
  id: 'single-slit-diffraction',
  label: 'Where the Bright Band from One Opening Ends',
  canonicalSim: 'aperi21:single-slit-diffraction',

  surface: {
    definition:
      'Where the broad bright band left by light through one opening comes to an end, set by rays from the opening’s two halves arriving half a wavelength apart, and how narrowing the opening widens that band.',
    exemplarKeywords: [
      'single slit diffraction',
      'the dark fringes either side of a bright middle',
      'why one slit leaves a broad bright band rather than a sharp line',
      'first minimum of a single slit',
      'a sin theta equals lambda',
      'the bright middle grows wider as the slit is narrowed',
      'laser shone through one narrow slit',
      'pairing a ray from the top half with one from the bottom half',
      'path difference of half a wavelength cancels',
      'width of the central maximum',
      'the intensity curve with one tall peak and small side peaks',
    ],
  },

  briefing: {
    observable: [
      'Red light arrives from the left as evenly spaced straight fronts and meets a wall with one opening in it; the spacing of those fronts is one wavelength, so the opening can be read as so many wavelengths across.',
      'On the screen at the right there is one broad bright band in the middle with much fainter bands beyond it, and beside the screen a curve of the same shape, one tall peak with small ones either side.',
      'Rays are then drawn from four points spread across the opening, and from its top and bottom edges, all running to the first dark place on the screen.',
      'An arc centred on that dark place is swept through the top edge, and the extra length each ray has beyond the arc grows as a step for every ray further down; the bottom edge’s extra length is marked as one wavelength.',
      'The two halves of the opening are then numbered off in pairs, and for each pair all but half a wavelength of the extra length is dimmed, leaving equal marked pieces of half a wavelength each.',
      'At the place where those rays land the screen is dark and the curve touches zero — the same place the construction was built for.',
      'The opening then closes to half its width. The bright band and the peak both widen, and a bracket drawn across the earlier width stays as a dashed mark beside the new solid one, which ends up about twice as long.',
      'The whole construction is repeated at the narrow opening: the bottom edge is again a wavelength longer, the pairs again differ by half a wavelength, but the place where it all happens is further from the middle of the screen.',
      'The opening widens back and the round begins again. Only one colour of light is used throughout.',
    ],

    screen: {
      affordances: [
        'The round runs by itself — wide opening, construction, narrowing, the same construction again — and repeats, with nothing to press.',
        'The two widths are joined by the act of narrowing rather than shown side by side, so the widening of the band is watched as it happens.',
        'The earlier width is kept on screen as a dashed bracket beside the current solid one, so the comparison does not rest on memory.',
        'The screen, the curve and the dark place the rays run to come from one and the same calculation, so the construction lands where the pattern is actually dark.',
        'The extra length beyond the arc is the only thing drawn in the strong colour, which is what makes the steps and the half-wavelength pieces read as one quantity.',
        'The marks written on screen are one wavelength, half a wavelength and the pair numbers; no angle and no intensity is given a figure.',
        'The screen opens with the wide opening already lit and the pattern standing.',
      ],
    },

    useWhen: [
      'The article has stated the condition for the first dark fringe and the reader can apply it but cannot see where it comes from. Watching the opening divided into pairs that differ by half a wavelength turns the condition into a construction rather than a rule.',
      'The point being made is that a narrower opening gives a wider bright band — the inverse relation that sounds wrong on first hearing. The band, the peak and the bracket all widen together while the opening closes.',
      'The reader has seen a pattern from one opening and assumes the bright band is just the shape of the opening projected. The construction gives the band an edge that is calculated rather than geometric.',
    ],

    avoidWhen: [
      'The article is about several openings, about lines that grow sharp as more are added, or about orders and spectra. One opening is used throughout here.',
      'The subject is whether waves reach into the shadow at all, or how far a sound bends round a doorway. What is drawn here is a light pattern on a screen, and the question is where its bright band ends, not whether anything gets past the wall.',
      'The article turns on the ratio of opening to wavelength as the thing that decides how much the wave spreads. Both widths here are several wavelengths across, and the spreading is read off the screen as a band width rather than as an angle compared to a ratio.',
      'The subject is colour — a spectrum, or different wavelengths ending up in different places. One colour is used at both widths.',
      'The point is that two distant objects stop looking like two. There is one opening and one pattern here, with no second source to merge with.',
      'The article needs the angle, the intensity formula, or fringes beyond the first dark one worked out. Only the first dark place is constructed, and no angle is written anywhere.',
    ],

    contrastWith: [
      {
        concept: 'diffraction-grating',
        note: 'One asks how wide the bright band from a single opening is; the other holds the spacing of many openings fixed and asks how sharp their bright lines become as more are added.',
      },
      {
        concept: 'slit-width-and-diffraction',
        note: 'Both turn on the width of one opening, at different ends — one asks how far past the opening the wave gets at all, the other takes the spreading for granted and locates the first place where it cancels.',
      },
      {
        concept: 'diffraction',
        note: 'One says a wave arrives where a shadow was expected; the other says that what arrives is structured, with a band that ends at a place the wavelength decides.',
      },
      {
        concept: 'resolving-power',
        note: 'Both hinge on the first dark ring of a pattern from an opening, for opposite purposes — one uses it to bound a single pattern, the other to say when two patterns can still be told apart.',
      },
    ],
  },
};
