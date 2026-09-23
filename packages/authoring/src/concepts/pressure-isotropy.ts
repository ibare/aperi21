/**
 * pressure-isotropy 개념 선언.
 *
 * 압력 여섯 중 하나. 여섯이 전부 「압력」 이라 definition 이 붙기 쉬워 **각자 무엇을
 * 주장하는지**로 갈랐다.
 *   pressure-isotropy            한 점에서 면의 **방향**을 바꿔도 크기가 그대로다
 *   hydrostatic-pressure         **깊이**에 정비례한다
 *   pressure-and-container-shape **그릇 모양 · 담긴 양**과 무관하다
 *   atmospheric-pressure         **머리 위 공기 기둥의 무게**다
 *   barometer                    기압을 **재는 장치** — 수은 기둥의 높이
 *   manometer                    두 압력의 **차이를 재는 장치** — 액면 높이 차
 * 이쪽만 돌린다 · 각도 · 방향 · 면의 기울기 어휘를 갖는다. 깊이가 바뀐다는 말도,
 * 그릇 · 공기 · 눈금 어휘도 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const pressureIsotropyConcept: Aperi21ConceptSource = {
  id: 'pressure-isotropy',
  label: 'Isotropy of Pressure at a Point',
  canonicalSim: 'aperi21:pressure-isotropy',

  surface: {
    definition:
      'In a fluid at rest, the push on a small surface at one point has the same strength whichever way that surface is turned; only the direction of the push follows the turning.',
    exemplarKeywords: [
      'pressure is the same in all directions',
      'isotropy of pressure',
      'does pressure have a direction',
      'pressure is a scalar while force is a vector',
      'turning a plate in a fluid',
      'pressure at a point does not depend on orientation',
      'the same reading whichever way the sensor faces',
      'the push on a surface is perpendicular to it',
      'tilting a face does not change how hard it is pressed',
      'a diver is squeezed the same from every side',
    ],
  },

  briefing: {
    observable: [
      'A thin plate sits at one point below the surface of still water and turns slowly through half a revolution, which is every orientation a two-sided plate can have.',
      'An arrow stands on each face of the plate, always at right angles to it and pointing inward, and both swing round as the plate turns.',
      'The arrows never change length while they swing.',
      'The tails of the two arrows leave a trail of marks behind them, and because the length holds, that trail closes into a true circle rather than into anything squashed.',
      'The moment the circle closes, the trail stops fading and hardens into one bright line, and a line of writing says the tails have traced a circle.',
      'Writing beside the scene gives the depth, the density and gravity, the pressure that follows from them, and the area of the plate with the size of the force on it; none of these move while the plate turns.',
      'The letter F is written on the force arrows.',
    ],

    screen: {
      affordances: [
        'The half-revolution runs by itself from the moment the scene opens, and nothing has to be pressed to reach the closed circle.',
        'Only once the circle has closed is a dial offered, and the reader can then turn the plate to any orientation by hand; the arrow tails run exactly along the circle already drawn.',
        'The dial covers the whole of the plate’s orientation space rather than a chosen slice, since a plate with two faces repeats itself after half a turn.',
        'The plate stays at one point throughout, so an arrow that did change length would have nothing to blame but the turning.',
      ],
    },

    useWhen: [
      'The article has called pressure a scalar while calling force a vector, and the reader is stuck on how one can have no direction while the other plainly does. An arrow that swings while refusing to change length separates the two.',
      'The claim that the orientation of a surface is irrelevant is better tested than asserted, and handing the reader the dial afterwards is an invitation to look for an exception and fail to find one.',
    ],

    avoidWhen: [
      'The point is that the push grows with depth. The plate stays at one depth the whole way through and the depth written beside it never changes.',
      'The article turns on the shape of the vessel or on how much liquid it holds. There is one point in one tank and nothing is set beside it for comparison.',
      'The fluid in the article is moving, or the surface is being dragged through it. The water here is still and the plate only pivots in place.',
      'A pressure or a force has to be worked out from what is shown. The figures beside the scene are fixed settings and none of them respond to anything.',
      'The subject is how a fluid holds a body up. One small plate is shown and nothing about weight, floating or sinking appears.',
    ],

    contrastWith: [
      {
        concept: 'hydrostatic-pressure',
        note: 'One holds the place fixed and varies the direction, finding no change; the other holds the direction fixed and varies the depth, finding a proportional one.',
      },
      {
        concept: 'pressure-and-container-shape',
        note: 'One says the pressure does not care which way a surface faces; the other says it does not care what shape of vessel holds the liquid.',
      },
      {
        concept: 'pascals-principle',
        note: 'One is about a single point and the orientations a surface can take there; the other is about two widely separated places in a closed fluid standing at the same pressure.',
      },
    ],
  },
};
