/**
 * stellar-spectral-class 개념 선언.
 *
 * 온도 · 분류 셋 중 하나. 이쪽만 **깎여 나간 선의 무늬**를 주장한다.
 *   stellar-spectral-class  O B A F G K M 은 **온도의 순서**다 — 수소 선이 A 에서 가장 짙은 까닭
 *   star-color-temperature  매끈한 곡선의 봉우리 → 섞인 **색**
 *   hr-diagram              온도와 밝기 두 축 위에 놓인 **무리**
 * 이쪽만 흡수선 · 발머 · 금속 · 분자 띠 · 글자 순서 어휘를 갖는다. 봉우리 · 별빛의 색 ·
 * 주계열이라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const stellarSpectralClassConcept: Aperi21ConceptSource = {
  id: 'stellar-spectral-class',
  label: 'Spectral Classes as an Ordering by Absorption Pattern',
  canonicalSim: 'aperi21:stellar-spectral-class',

  surface: {
    definition:
      'The letter sequence O B A F G K M, arranged by how dark the absorption features of hydrogen, metals and molecules grow as a stellar surface cools.',
    exemplarKeywords: [
      'spectral classification of stars',
      'O B A F G K M',
      'Oh Be A Fine Girl Kiss Me',
      'why hydrogen lines are strongest in class A',
      'Balmer lines in stellar spectra',
      'dark lines in the spectrum of a star',
      'the Sun is a G-type star',
      'titanium oxide bands in cool stars',
      'Annie Jump Cannon reordered the classes',
      'the letters are not in alphabetical order for a reason',
    ],
  },

  briefing: {
    observable: [
      'A wide ribbon of the visible colours runs across the upper part of the view, and dark features are cut into it rather than painted over it.',
      'The pattern of those features actually changes as the run goes on: a nearly clean ribbon with a few faint marks at the hot end, then four broad black bars, then a thicket of hairline marks across the whole ribbon, then stepped shadows eating into the green-to-red stretch at the cool end.',
      'Only the four hydrogen features carry names on the ribbon, written in the same ink as the hydrogen curve below so the two parts of the picture read as one statement.',
      'Below the ribbon a graph carries three strength curves — hydrogen as a solid line, metals dashed, molecules dotted — told apart by line style and by their names rather than by colour.',
      'A marker travels along a temperature axis from the hot end toward the cool end, and whichever class letter it is nearest is lit up as it passes.',
      'When the marker reaches the top of the hydrogen curve, the four broad bars on the ribbon are at their darkest — the same fact stated twice in one frame.',
      'The colours of the ribbon itself never change with temperature, so what moves is the pattern of absorption and nothing else.',
      'Arrows at the two ends of the axis say which way is hotter and which cooler, and short ticks sit under each letter without any dividing lines between the classes.',
      'A temperature in kelvin is shown only while the run is resting on one of the four classes, and is absent while it is sliding between them.',
      'After the coolest class the run turns around and the pattern travels back the other way, which the closing line names as the order of the letters being the order of temperature.',
    ],

    screen: {
      affordances: [
        'The cooling, the pauses on four classes and the return run in that order on their own and then repeat.',
        'The picture opens on the hottest class with a moment to look before the cooling begins.',
        'The features are made by taking light away from the ribbon rather than by drawing dark strokes on top of it, so they stay dark whatever the surrounding page is like.',
        'Alongside the named lines there are dozens of unnamed weak ones scattered by a fixed recipe, because the crowdedness of a cool spectrum is itself part of what is being shown.',
        'The second colour is reserved for the present temperature — the marker, the three dots on the curves, and the letter nearest the marker.',
        'The temperature moves by repeated multiplication, so the hot classes do not flash past in the first instant.',
      ],
    },

    useWhen: [
      'The article has given the letter order and the reader is asking why it is not alphabetical, or why the class with the strongest hydrogen does not come first. The curve peaking in the middle while the marker slides past it answers both at once.',
      'A reader thinks of classification as bookkeeping rather than measurement, and a picture is wanted where a sorting scheme is visibly produced by one physical quantity.',
    ],

    avoidWhen: [
      'What the star looks like to the eye, or the mixed hue of its light, is the point. The ribbon holds its colours fixed here so that only the pattern is in play.',
      'Emission lines, or lines produced by a gas cloud in front of something, are the subject. Every feature here is cut out of the star’s own continuous light.',
      'The article needs the ionisation and excitation equations, or an energy-level diagram behind the hydrogen series. The strengths come from a table and the reasoning is left to the wording.',
      'Finer labels — a decimal subclass, a size class, a named individual star — are required. Only the seven letters appear.',
      'Brightness, output or how large the star is matters. Nothing here is drawn at any size and no amount of light is compared.',
      'The reader should choose a temperature and inspect the resulting pattern. Four classes are visited in turn and nothing else is reachable.',
    ],

    contrastWith: [
      {
        concept: 'star-color-temperature',
        note: 'One follows what is missing from starlight and turns it into an ordering of letters; the other follows the smooth light that remains and turns it into a hue.',
      },
      {
        concept: 'hr-diagram',
        note: 'One shows how the temperature coordinate is obtained from a single star’s light; the other plots that coordinate for a whole population and reads the shape they form.',
      },
    ],
  },
};
