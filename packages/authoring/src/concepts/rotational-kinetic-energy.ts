/**
 * rotational-kinetic-energy 개념 선언.
 *
 * 구름을 다루는 형제 둘과 **묻는 것을 갈랐다.**
 *   rotational-kinetic-energy  같은 속력에 구르는 쪽이 **얼마를 담고 있나** — 오른 높이로 치른다
 *   rolling-without-slipping   구른다는 것이 **접점에 무엇을 뜻하나** — v = ωR 의 구속
 *   rolling-race               여러 모양 가운데 **누가 먼저 닿나** — 순서
 * 이쪽만 ½Iω² · 담은 에너지 · 오른 높이 · 쓸 수 있는 몫 어휘를 갖는다. 접점 · 미끄러짐 ·
 * 순서 · 모양 견줌은 쓰지 않는다. `angular-momentum` 과는 같은 「도는 몸이 지닌 양」 이지만
 * 이쪽은 **써서 높이를 산다**, 저쪽은 **축을 지킨다**.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const rotationalKineticEnergyConcept: Aperi21ConceptSource = {
  id: 'rotational-kinetic-energy',
  label: 'Rotational Kinetic Energy',
  canonicalSim: 'aperi21:rotational-kinetic-energy',

  surface: {
    definition:
      'Energy held in a body’s spinning, carried on top of the energy of its travel, so a rolling body has more to spend than a sliding one moving at the same speed.',
    exemplarKeywords: [
      'rotational kinetic energy',
      'half I omega squared',
      'a rolling body carries more energy than a sliding one',
      'energy stored in spin',
      'how high will a rolling hoop climb',
      'flywheel energy storage',
      'spin and travel each take a share of the energy',
      'does a spinning object have extra energy',
      'rolling up a ramp and coming back',
      'kinetic energy of a turning wheel',
    ],
  },

  briefing: {
    observable: [
      'Two identical hoops of the same mass and radius run in from the left of two panels that share one floor line, each with a velocity arrow of the same length marked v.',
      'The left hoop’s spokes hold their angle as it travels — it is sliding on an iced surface — while the right hoop’s spokes turn, because it is running on a surface drawn with a rough grain.',
      'Both meet ramps of the same angle at the same moment. On the ramp the left arrow shortens twice as fast as the right one, and the right hoop’s spokes slow down along with it.',
      'A bar grows in front of each panel as high as its hoop has climbed. The left bar is a single block; the right one grows as two shares at once, one of them in the accent colour, both rising together rather than one filling and then the other.',
      'When the sliding hoop turns back, a pale ghost of it stays at that height and a dotted line is drawn across both panels at the same level.',
      'The rolling hoop carries on past that dotted line and turns back only at twice the height.',
      'The dotted line then passes exactly through the join between the two shares of the right bar, and the shares are marked ½mv² and ½Iω².',
      'Both hoops run back down and out of their panels, leaving the two ghosts, the bars and the dotted line as the result.',
    ],

    screen: {
      affordances: [
        'The run-in, the climb, the turning back and the return happen in order on their own and then begin again.',
        'The two panels sit side by side on one floor line, so the heights reached are compared straight across rather than held in mind.',
        'The two hoops are the same body in the same ink, entering at the same moment with arrows of the same length; the two surfaces differ in their grain and not in their colour.',
        'The climb is slowed enough that the right hoop’s spokes can be watched losing their turn while the bar grows.',
        'The accent colour is kept for the spin’s share alone, so the added share is recognisable without a legend.',
        'Each panel is fenced off, so a hoop entering at the left edge is never read as having come down the neighbouring ramp.',
      ],
    },

    useWhen: [
      'The article has added ½Iω² to ½mv² and the reader is treating it as one more line of algebra. A hoop that climbs past another hoop of the same speed gives the extra term a height.',
      'The point is that the spin’s share is genuinely spendable — it buys height like any other energy — and a case is wanted in which both shares drain at once rather than in turn.',
    ],

    avoidWhen: [
      'The subject is why a rolling body runs down a slope at a particular rate, or which of several shapes arrives first. One shape is used here, and it is sent in at a speed rather than released from a height.',
      'The no-slip condition itself, and what it does to the point in contact with the ground, is what has to be explained. Nothing here is drawn at the contact; the rolling shows in the turning spokes.',
      'A value in joules, or a height in metres, is wanted. The claim is the ratio between two bars and nothing is written but the marks on the two shares.',
      'Friction carrying energy away is the point. The rolling hoop loses nothing to the rough surface; everything it arrives with goes into height.',
      'The article is about a body spinning in place and going nowhere. Both hoops here are running.',
    ],

    contrastWith: [
      {
        concept: 'rolling-without-slipping',
        note: 'One takes rolling as given and asks what it is worth in energy; the other asks what rolling means for the point touching the ground.',
      },
      {
        concept: 'rolling-race',
        note: 'One sets two bodies off at the same speed and reads the difference off the height they reach; the other releases several shapes from the same height and reads it off who arrives first.',
      },
      {
        concept: 'moment-of-inertia',
        note: 'One is about what a spin is worth once a body has it; the other about how hard that spin was to build up.',
      },
      {
        concept: 'angular-momentum',
        note: 'Both are carried by a spinning body, but one is spent and bought back as height, and the other is what an outside blow has to overcome to turn the axis aside.',
      },
    ],
  },
};
