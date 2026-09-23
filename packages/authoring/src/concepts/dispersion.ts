/**
 * dispersion 개념 선언.
 *
 * 색 갈라짐 셋 가운데 **원인**을 다루는 쪽이다. 셋은 주어가 다르다.
 *   dispersion  유리의 굴절률이 **파장마다 다르다** — 면 하나 · 굴절률-파장 곡선
 *   prism       면이 **둘**이라 벌어짐이 곱절이 된다 — 스크린의 띠
 *   rainbow     물방울에서 꺾이고 되비쳐 **한 각에 몰린다** — 하늘의 띠와 그 높이
 * 이쪽만 파장(nm) · 굴절률 값 · 곡선 어휘를 갖는다. 띠 · 스크린 · 각도(42° · 40°)는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const dispersionConcept: Aperi21ConceptSource = {
  id: 'dispersion',
  label: 'Why One Glass Bends Each Colour by a Different Amount',
  canonicalSim: 'aperi21:dispersion',

  surface: {
    definition:
      'That a material’s bending power depends on wavelength: one white beam meeting a single glass face at a fixed slant leaves as a fan, violet turned most and red least.',
    exemplarKeywords: [
      'dispersion of light',
      'refractive index depends on wavelength',
      'why white light comes apart into colours',
      'violet bends more than red',
      'Cauchy relation for glass',
      'index against wavelength curve',
      'crown glass index at 656 and 404 nanometres',
      'a single surface already separates the colours',
      'the colours are in the light, not made by the glass',
      'chromatic spread in an optical material',
    ],
  },

  briefing: {
    observable: [
      'On a dark panel a single white beam comes down and meets a flat glass face at a set slant, with the square direction drawn as a faint line at the meeting point.',
      'From that one point a spread of seven coloured beams grows into the glass, opening out like a fan. Violet runs closest to the square direction and red furthest from it, with the rest in order between them.',
      'Near the meeting point the coloured beams still overlap and add back to white, and they separate as they go on into the glass.',
      'All seven arrived along the same single beam at the same slant, so nothing about the arrival can account for their leaving in different directions.',
      'One beam is then left bold and the others dimmed, so a single wavelength can be followed.',
      'To the right a curve is drawn with wavelength along the bottom and refractive index up the side. A large dot in the colour of the wavelength in force rides that curve.',
      'The dot travels from the red end of the curve to the violet end. As it climbs, the index reading rises, and in the same moment the bold beam over on the panel swings toward the square direction.',
      'Three places on the curve carry their measured index, so the curve is anchored to real values rather than being a sketch of a trend.',
      'A note under the panel says that the spread between the colours has been exaggerated, giving the factor, so the fan on screen is not read as the size of the real effect.',
    ],

    screen: {
      affordances: [
        'The beam splits, the fan opens, one colour is picked out and the dot sweeps the curve, over and over, with nothing to press.',
        'The angle of arrival never changes for the whole round, which leaves the wavelength as the only thing that can account for the different departures.',
        'Each beam is drawn in the colour of its own light rather than in a colour assigned to tell objects apart, and where beams overlap the light adds, as light does.',
        'The height of the dot on the curve and the swing of the bold beam are driven by one wavelength, so the cause and the effect move in the same instant.',
        'The amount of exaggeration is written on the screen rather than left for the reader to discover, since without it the seven beams would lie along one line.',
        'No angle of departure is written as a figure, because those angles have been stretched; the figures on screen are wavelengths and indices, which have not.',
        'The screen opens with the fan already spread out.',
      ],
    },

    useWhen: [
      'The article has said that the index of a material is a single number and now needs the reader to give that up. The curve here has an index for every wavelength, and the beam on the panel answers to whichever one is being pointed at.',
      'The reader knows white light contains colours but treats the glass as adding them. Watching one beam arrive and seven leave from the same point, at the same slant, puts the difference in the glass’s response rather than in the light.',
      'The article wants a cause put underneath a familiar sight before the sight itself is discussed. Here the cause is on screen as a curve, and it is tied by movement to the only thing that changes about the beam.',
    ],

    avoidWhen: [
      'The subject is a wedge of glass, a band thrown on a screen, or a spread wide enough to see across a room. One face is shown here and the opening it gives is small enough to need exaggerating.',
      'The article is about raindrops, the sky, or a band standing at a particular height. Nothing here is round and nothing is reflected.',
      'The point is that different materials bend one beam by different amounts. The material here never changes; the wavelength does.',
      'The subject is mixing coloured lights or paints, or why an object looks the colour it does. Nothing here is mixed or absorbed; one beam is taken apart.',
      'The article is about why the sky is blue or why sunsets are red. That turns on light being thrown sideways by small particles, and nothing here is scattered.',
      'The exact angle each colour leaves at is wanted, or the article will quote it. The angles on screen have been stretched for visibility and only the wavelengths and indices are written as figures.',
    ],

    contrastWith: [
      {
        concept: 'prism',
        note: 'One names the cause — the index climbing with falling wavelength — at a single face; the other takes that cause as given and shows what two faces in a row make of it.',
      },
      {
        concept: 'rainbow',
        note: 'One is about a property of the material, shown as a curve; the other is about where in the sky the light that property separates ends up, which needs a drop, a reflection and an observer.',
      },
      {
        concept: 'snells-law',
        note: 'Both watch a beam turn as it enters glass, but one holds the colour fixed and changes the material, while the other holds the material fixed and changes the colour.',
      },
    ],
  },
};
