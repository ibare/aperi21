/**
 * maxwell-boltzmann-distribution 개념 선언.
 *
 * 알갱이 넷 중 하나. 이쪽은 **퍼짐** 을 주장한다.
 *   kinetic-theory-of-gases        합 — 두드림이 쌓여 한 값이 된다
 *   pressure-from-collisions       두 곱 — 세기 × 횟수
 *   maxwell-boltzmann-distribution **퍼지며 내려앉는다** — 분자 수가 그대로라 넓어진 만큼 낮아진다
 *   mean-free-path                 사이 거리 — 다음 분자까지 얼마나 가나
 * 이쪽만 더미 · 봉우리 · 꼬리 · 내려앉음 · 속력 축 어휘를 갖는다.
 * 벽 · 두드림 · 압력 · 세기 · 횟수는 쓰지 않는다 — 이 화면에 벽이 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const maxwellBoltzmannDistributionConcept: Aperi21ConceptSource = {
  id: 'maxwell-boltzmann-distribution',
  label: 'Spread of Molecular Speeds and Why the Peak Sinks',
  canonicalSim: 'aperi21:maxwell-boltzmann-distribution',

  surface: {
    definition:
      'Molecules of a gas do not share one speed but are spread over a range that widens and flattens as it warms, the same number covering more ground.',
    exemplarKeywords: [
      'Maxwell–Boltzmann distribution',
      'speed distribution of gas molecules',
      'not every molecule moves at the same speed',
      'why does the peak get lower when it is heated',
      'the fast tail of the distribution',
      'most probable speed',
      'a few molecules are always much faster than the rest',
      'the hump shifts right and flattens',
      'how spread out are the speeds in a gas',
      'the same number of molecules spread over a wider range',
    ],
  },

  briefing: {
    observable: [
      'Five hundred molecules are drawn as small dots packed under a curve, each standing at its own speed along a horizontal scale marked in metres per second.',
      'The heap is not symmetric: it rises steeply from the left to a peak and then trails away to the right, so a few molecules stand far out where most never reach.',
      'Warming pushes every dot outward by the same factor, so the ones already fast move much further than the slow ones and the heap stretches rightward.',
      'Because the number of dots never changes, the heap that has widened must also come down: the peak visibly sinks as it spreads.',
      'A dotted curve is left standing where the heap was at the starting temperature, so the widening and the sinking are both read against it.',
      'Three of the molecules are singled out in the strike colour and shown below the heap as short travelling lines, one per row, whose lengths are in proportion to their speeds; the fastest of the three always runs the longest line.',
      'Cooling gathers the dots back inward and the heap narrows and rises again over the dotted curve.',
      'No vertical scale is drawn, so what the height says is “how many of them are around here”, not a number.',
      'A handle at the lower left can be taken over to set the temperature; the reading beside it snaps to the nearest ten kelvin rather than showing the value the picture is actually at.',
    ],

    screen: {
      affordances: [
        'The round warms and cools by itself and finishes what it has to say; the handle is there for a reader who wants to stop partway and look.',
        'Once the handle has been taken over the round stops running and the heap settles smoothly to the chosen temperature rather than springing back.',
        'The dots and the curve are placed by the same measure of height, so the dots stay under the curve at every temperature and the sinking of the peak is the sinking of the dots.',
        'The dotted curve for the starting temperature stays in the picture throughout, which is what makes “wider” and “lower” comparisons rather than impressions.',
        'The strike colour is spent on one meaning only — the three molecules being followed — so their travelling lines are readably the speeds of dots standing at particular places in the heap.',
      ],
    },

    useWhen: [
      'The article has quoted an average or a typical molecular speed and the reader has taken it as the speed the molecules have. The heap with its long right-hand trail is what replaces one number with a range.',
      'The reader expects heating to lift the curve, since faster surely means more, and the moment wanted is the one where the peak comes down while the heap moves right.',
      'The article turns on the small population out in the fast tail — molecules energetic enough to escape or to react — and needs that tail seen to swell as the gas warms.',
    ],

    avoidWhen: [
      'The point is what molecules do to a wall — how hard or how often they strike it. There is no container drawn here at all, only a scale of speed.',
      'The article treats every molecule as having the same speed, as a first derivation of pressure does. That assumption is exactly what this picture denies.',
      'The subject is how far a molecule travels between meeting other molecules. Nothing here collides; each dot stands at its speed.',
      'A number is wanted from the picture — how many molecules lie above some speed, what the most probable speed is. No vertical scale exists and no such figure is written.',
      'A volume or a pressure is to change. Only the temperature moves here, and the number of molecules is fixed.',
      'Two different gases are to be compared, or the mass of the molecules is at issue. One gas is shown and its identity never enters the picture.',
    ],

    contrastWith: [
      {
        concept: 'kinetic-theory-of-gases',
        note: 'One treats the molecules as an interchangeable crowd whose collective effect on a wall is the whole story; the other looks inside the crowd and finds it is not uniform.',
      },
      {
        concept: 'pressure-from-collisions',
        note: 'One rests on every molecule sharing a speed so that a single blow can represent them all; the other exists to say that they do not share one.',
      },
      {
        concept: 'mean-free-path',
        note: 'Both take a single molecule out of the crowd, but one asks how fast it is compared with its neighbours and the other asks how far it gets before it runs into one.',
      },
      {
        concept: 'charles-law',
        note: 'Both hang on what a temperature is, one by spreading the molecules of a gas out by their speeds, the other by following the whole gas down towards a temperature at which it would have no size at all.',
      },
    ],
  },
};
