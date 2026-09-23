/**
 * rayleigh-scattering 개념 선언.
 *
 * 이 묶음에서 유일하게 **색을 파장이 가르는** 조각이다. 색 셋과 이렇게 갈랐다.
 *   color-addition           빛끼리 **더해져** 색이 된다 — 겹친 자리
 *   object-color             겉면이 **되쏠 것을 고른다** — 물체의 색
 *   light-through-materials  재료가 **통과를 가른다** — 색이 아니라 또렷·흐림·막힘
 *   rayleigh-scattering      공기가 **파장마다 다르게 흩뜨린다** — 하늘의 파랑, 노을의 빨강
 * 이쪽만 파장 · 길이 · 하늘 · 노을 어휘를 갖는다.
 *
 * 「흩어진다」는 이웃이 여럿이라 좁게 썼다. 주장은 **파장에 따라 흩어지는 정도가 달라
 * 짧은 길은 거의 희고 긴 길은 붉다** 하나이고, 흩뜨리는 것이 무엇인지(알갱이 · 거친 면)나
 * 흩어짐 일반은 이 조각의 몫이 아니다. 굴절로 색이 갈리는 쪽(프리즘 · 무지개)은
 * avoidWhen 으로 되돌린다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const rayleighScatteringConcept: Aperi21ConceptSource = {
  id: 'rayleigh-scattering',
  label: 'Why the Sky Is Blue and the Low Sun Red',
  canonicalSim: 'aperi21:rayleigh-scattering',

  surface: {
    definition:
      'Air scatters short wavelengths much more than long ones, so sunlight thrown sideways out of a beam is blue while what is left after a long path through air is red.',
    exemplarKeywords: [
      'Rayleigh scattering',
      'why is the sky blue',
      'why are sunsets red',
      'blue light is scattered more than red light',
      'scattering that falls off with the fourth power of wavelength',
      'the sun looks red when it is near the horizon',
      'sunlight takes a longer path through the air at dusk',
      'the colour of the daytime sky',
      'why the setting sun reddens but the midday sun does not',
      'air molecules and the colour of the sky',
    ],
  },

  briefing: {
    observable: [
      'Two panels sit side by side. On the left a curve rises steeply toward the short-wavelength end of a wavelength axis, and two bars grow up under it — one in blue at four hundred and fifty nanometres, one in red at seven hundred — until each bar’s top comes to rest on the curve.',
      'The blue bar ends up close to six times the height of the red one, and the multiple is written beside each top once they have settled: times five point nine over the blue, times one over the red.',
      'On the right is a slice of sky: a dark panel with a thin band of air above the ground, an observer standing on the ground, and the sun above.',
      'With the sun overhead, a white beam comes straight down through the thin band, short strokes of blue scatter sideways off it along the way, and the band itself is washed a faint blue. A disc below the observer, named as the light reaching the eye, is very nearly white.',
      'The sun then sinks toward the horizon, and the beam’s run through the air grows longer and more slanted until at the horizon it is fifteen times the overhead length.',
      'Along that long run the beam changes colour from end to end — white near the sun, then yellow, then orange and red where it meets the observer — and the disc below the observer turns a red orange.',
      'The sideways strokes change colour along the run in step: blue near the sun where the beam is still white, paler and more orange further along, so the order in which the blue leaves is readable off the strokes.',
      'Longer runs carry more strokes than the short overhead one; the overhead run is broken into three lengths, the horizon run into forty-five.',
      'The writing on screen is the two wavelengths, the two multiples and the axis names; the path length, the sun’s angle and how much light survives are each carried by length or by colour rather than by a figure.',
    ],

    screen: {
      affordances: [
        'One round runs from the bars growing, through the overhead sun, through the sun sinking, to the low red sun, and then begins again, with nothing to press.',
        'The screen opens with the bars already part-way up, so the comparison is the first thing under way.',
        'The bars and the curve carry the wavelength dependence on their own: the multiple is read first as a height and only afterwards as a figure.',
        'The slice of sky is laid on a lightless panel so that the white sun and the white beam hold their colour whichever theme the page is in, and so that the reddening is read as colour rather than as dimming.',
        'The colours of the beam, the strokes, the disc and the sky are each worked out from what is left of the spectrum at that point, so they move together rather than being set one by one.',
        'The earth is drawn smaller than it is so that the horizon run is fifteen times the overhead run instead of nearly forty, which keeps both runs inside the same panel.',
        'Brightness is set aside and only hue is kept, so that the light at dusk reads as red rather than as dark.',
      ],
    },

    useWhen: [
      'The article has stated that scattering is stronger for short wavelengths and the reader has no feel for how much stronger. The blue bar standing close to six times the red one gives the difference a height before it gives it a number.',
      'The point being made is that the blue sky and the red sunset are one and the same effect seen at two path lengths. The sun sinking, with the beam reddening along its run as the blue leaves near the front, puts both in a single picture.',
      'The reader knows that the sun reddens near the horizon and takes it for something the sun does. Here the sun is unchanged and only the length of air the light crosses grows.',
    ],

    avoidWhen: [
      'The article is about colours being pulled apart by bending — a prism, a rainbow, the spread of a beam entering glass. Nothing here is bent at a boundary; light is taken out of the beam sideways along its run.',
      'The subject is scattering as such — off dust, off a rough surface, off particles suspended in a liquid — with wavelength playing no part. The whole claim here rests on blue being treated differently from red.',
      'The point is that a star or a hot body glows blue or red according to its temperature. The sun here never changes; what changes is what the air removes on the way.',
      'The article needs how much light survives a given path, or the sun’s angle, or the exponent itself as a written relation. Two wavelengths and two settled multiples are all that is put in figures.',
      'The subject is why clouds are white, why the sea looks blue, or the colour of a surface. There is no object in the picture at all — only air, a beam and an observer.',
      'The article turns on the sky dimming at dusk, or on day turning to night. Hue is kept and brightness deliberately set aside, so nothing here grows darker.',
    ],

    contrastWith: [
      {
        concept: 'star-color-temperature',
        note: 'Both end in a body looking red or blue, from opposite causes: one has the colour set where the light is made, the other has it set by what the air removes between there and the eye.',
      },
      {
        concept: 'object-color',
        note: 'Both are about light losing part of itself and the remainder being what is seen, but one has a surface choose what it returns, and the other has the air along the path choose what it takes out.',
      },
      {
        concept: 'light-through-materials',
        note: 'Both have light thrown out of its original direction on the way through something; one sorts by wavelength so the colour changes, the other treats all of it alike and only the sharpness changes.',
      },
      {
        concept: 'albedo',
        note: 'One asks what share of arriving light a surface turns back regardless of its colour; the other asks which wavelengths are removed from a beam as it crosses air.',
      },
      {
        concept: 'scattering',
        note: 'One keeps the scatterer fixed as air and makes wavelength the variable, so the claim is which colour is thrown sideways and which survives a long path; the other makes the size of the scattering particle the variable, so a split of colour is only one of the outcomes a size can produce.',
      },
    ],
  },
};
