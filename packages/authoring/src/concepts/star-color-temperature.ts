/**
 * star-color-temperature 개념 선언.
 *
 * 온도 · 분류 셋 중 하나. 셋이 모두 「온도가 정한다」 로 수렴할 수 있어 **무엇을 정하는지**로 갈랐다.
 *   star-color-temperature  매끈한 곡선의 **봉우리 자리** → 섞인 **색**
 *   stellar-spectral-class  연속빛에서 **깎여 나간 선의 무늬** → 글자 순서
 *   hr-diagram              온도를 밝기와 함께 놓았을 때 **무리가 만드는 띠**
 * 이쪽만 파장 · 봉우리 · 가시광 띠 · 「섞이면 무슨 색인가」 어휘를 갖는다. 흡수선 ·
 * 분광형 글자 · 주계열이라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const starColorTemperatureConcept: Aperi21ConceptSource = {
  id: 'star-color-temperature',
  label: 'Surface Temperature and the Color of Starlight',
  canonicalSim: 'aperi21:star-color-temperature',

  surface: {
    definition:
      'Why hot stars glow bluish and cool ones reddish: raising surface temperature slides the peak of the emitted curve toward shorter wavelengths, tilting the visible portion.',
    exemplarKeywords: [
      'star colour and temperature',
      'why is a blue star hotter than a red one',
      'Betelgeuse is red and Rigel is blue',
      'blackbody curve of a star',
      'the peak moves to shorter wavelengths as it heats',
      'red hot, white hot, blue hot',
      'what decides the colour of starlight',
      'glowing metal changes colour as it heats',
      'colour tells you the surface temperature',
      'the Sun looks white because the peak is in the middle',
    ],
  },

  briefing: {
    observable: [
      'A single round star sits on a dark field at the left and a smooth emission curve is drawn against wavelength at the right.',
      'The high point of the curve is picked out with a dot and a dropped line, and it slides bodily to the left as the run goes on — out in the long-wavelength region at first, then inside the band the eye can see, then past its short-wavelength edge.',
      'The area under the curve within the visible band is filled wavelength by wavelength with the colour belonging to that wavelength, so which side of the band stands higher is which colour of light is more plentiful.',
      'Outside that band the filling is left colourless, marking the light that takes no part in what is seen.',
      'A thin ribbon of the full visible range runs under the axis, with dashed edges and the names of the two regions on either side, so the band is still located even when the curve lies flat there.',
      'The star at the left changes colour in the same moments: a reddish orange while the high point is out in the long wavelengths, near white when it sits inside the band, bluish once it has passed beyond.',
      'That colour is taken from the very curve being drawn rather than picked by hand, so the star and the graph cannot disagree.',
      'A temperature in kelvin is written beside the star only while it is being held steady at one of the three settings, and disappears while it is on the move.',
      'The star keeps the same size and the same overall strength the whole way through — the curves are drawn to a common height so that only shape is being compared.',
      'After the hottest setting the run reverses and the high point slides back to the long wavelengths with the colour following it.',
    ],

    screen: {
      affordances: [
        'The heating, the holding and the cooling run through in order by themselves and then repeat.',
        'The picture opens on the coolest setting with a moment to look at it before the temperature begins to climb.',
        'The temperature moves by repeated multiplication rather than by equal additions, so the high point travels at a steady-looking pace instead of lurching at the end.',
        'The vertical direction carries no scale and no name, because reading a strength off it would substitute a different question for this one.',
        'The second colour is reserved for the high point alone — the dot, its dropped line and its tag.',
        'The star sits on a dark patch of its own while the axes and wording sit outside it, so a near-white star stays visible.',
      ],
    },

    useWhen: [
      'The article has paired colours with temperatures and the reader is holding the pairing as a table to memorise. Seeing the high point travel while the star changes hue supplies the mechanism behind the table.',
      'A reader finds it backwards that blue should mean hotter than red, and a picture is needed in which the blue end rising is plainly a consequence of heating.',
    ],

    avoidWhen: [
      'Dark lines cut into the light, or the letters astronomers sort stars by, are the subject. The curve here is perfectly smooth and no letter appears.',
      'The article is about how much a star radiates, or how radiated power climbs with temperature. All the curves are drawn to one height precisely so that this question is kept out.',
      'The displacement rule is to be used numerically, or its constant quoted. No wavelength for the high point is ever printed.',
      'Brightness, size or output is being compared between stars. One star is on screen and it holds its size and strength throughout.',
      'The reader should be able to set a temperature and see the colour. Three settings are visited in turn and nothing else can be reached.',
      'The point is that the light of a star can be split into a band of colours at all, or how a prism does it. The band is present from the start and is never produced.',
    ],

    contrastWith: [
      {
        concept: 'stellar-spectral-class',
        note: 'Both read temperature off starlight — one from the shape of the smooth background and the hue it mixes to, the other from what has been carved out of that background.',
      },
      {
        concept: 'hr-diagram',
        note: 'One establishes what a single surface temperature does to the light; the other treats temperature as a coordinate already available for every star in a crowd.',
      },
    ],
  },
};
