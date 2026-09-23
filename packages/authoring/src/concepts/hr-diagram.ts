/**
 * hr-diagram 개념 선언.
 *
 * 온도 · 분류 셋 중 하나이자 HR 도를 쓰는 둘 중 하나. **무리냐 둘이냐**로 갈랐다.
 *   hr-diagram       성단의 별 **천 개** — 띠가 드러나고 위에서부터 빈다(전향점)
 *   star-life-cycle  별 **둘** — 단계 이름을 달고 한 줄 경로를 간다
 *   star-color-temperature · stellar-spectral-class  가로축 값을 **어떻게 얻는가**
 * 이쪽만 성단 · 주계열 띠 · 「무거운 별부터 떠난다」 · 나이 어휘를 갖는다. 단계 이름
 * (붉은 거성 · 백색 왜성)과 봉우리 · 흡수선이라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const hrDiagramConcept: Aperi21ConceptSource = {
  id: 'hr-diagram',
  label: 'The HR Diagram and the Emptying of the Main Band',
  canonicalSim: 'aperi21:hr-diagram',

  surface: {
    definition:
      'The chart placing every member of a cluster by surface temperature against brightness, where most lie along one diagonal band that empties from its top downward with age.',
    exemplarKeywords: [
      'Hertzsprung-Russell diagram',
      'HR diagram',
      'main sequence band',
      'main-sequence turnoff',
      'how the age of a star cluster is measured',
      'plotting stars by temperature and brightness',
      'giants sit above the band and white dwarfs below',
      'the heaviest stars run out first',
      'colour-magnitude diagram of a cluster',
      'why the band has a bend at the top',
    ],
  },

  briefing: {
    observable: [
      'A thousand points sit on a dark field whose horizontal direction is surface temperature, running hot to the left, and whose vertical direction is brightness on a ladder of powers.',
      'Most of the points lie inside one broad diagonal band, drawn faintly behind them and named on the chart.',
      'Each point carries the colour its own temperature gives it, so the band runs blue at its top through white to orange at its bottom without any of that being labelled.',
      'The points do not hold still: those at the top of the band leave it first, travelling to the right and upward, and their colour warms toward orange as they go.',
      'A short trailing streak behind each departing point shows where it was a moment earlier, so leaving reads as motion rather than as a rearranged picture.',
      'A marked bar sits across the band at the height the departures have reached, and it slides steadily downward as the run goes on.',
      'The top of the band is visibly empty by the middle of the run while the lower part is still packed.',
      'Points also collect at the lower left, small and bluish-white, and cool toward white as the run goes on.',
      'A line of text below states the age of the cluster and the mass above which stars have already left, and both figures keep changing as the run proceeds.',
      'No point is labelled with its own mass and no stage of a star’s life is named anywhere on the chart.',
    ],

    screen: {
      affordances: [
        'The cluster ages on its own from the first moment, runs to the end and holds there before starting over; there is nothing to press and no age to set.',
        'The chart is laid over a dark field so that near-white points keep their own colour instead of vanishing into the page.',
        'The second colour is used for the bar marking the height reached and for nothing else, which is what ties the moving bar to the mass quoted in the text.',
        'The horizontal direction runs hot to the left, as the chart is conventionally drawn, and its axis says so in words.',
        'The same thousand stars are used every time round, laid out by a fixed recipe, so the shape of the band is not an accident of one run.',
      ],
    },

    useWhen: [
      'The article has described the band as something stars sit on, and the reader has taken it for a fixed feature of the sky. Watching the top of it empty while the bottom stays full is what turns the band into a record of time.',
      'The text explains that a cluster is dated by where its band bends, and a picture is wanted in which the bend forms while it is being watched rather than being pointed at in a finished chart.',
    ],

    avoidWhen: [
      'The route one individual star follows, or the names of the stages along it, is the subject. Nothing here is named and no single point can be followed by eye through a crowd of a thousand.',
      'How the two coordinates of the chart are obtained from a star’s light is the point. Both are given from the start, with no spectrum and no colour measurement shown.',
      'The article needs what happens at the very end of a heavy star’s life. Departing points simply travel away and are not seen to finish.',
      'A single named cluster, or real catalogue data, has to be shown. The population is built to a recipe and no object is identified.',
      'The reader should set an age, a mass or a population and see the result. The ageing runs once through and cannot be steered.',
      'Absolute figures are needed off the chart — a temperature for a given point, a brightness in physical units. Only a few tick labels exist and no point can be read individually.',
    ],

    contrastWith: [
      {
        concept: 'star-life-cycle',
        note: 'Both use temperature against brightness as a stage for change; one follows a crowd whose upper ranks thin out with age, the other follows two individuals whose stages are named.',
      },
      {
        concept: 'star-color-temperature',
        note: 'One takes surface temperature as a coordinate already in hand for a thousand stars; the other is about how a single surface temperature announces itself in the light.',
      },
      {
        concept: 'stellar-luminosity',
        note: 'One works out what a single star must be producing from what arrives; the other assumes that figure for every member of a population and asks what pattern they make.',
      },
      {
        concept: 'phase-space',
        note: 'Both are plots whose axes are two properties rather than position and time, and both are read by the shape a path or a crowd makes rather than by single values.',
      },
    ],
  },
};
