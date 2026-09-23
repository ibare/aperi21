/**
 * star-life-cycle 개념 선언.
 *
 * 별의 일생 넷 중 하나. 넷이 모두 「별에서 일어나는 일」 이라 **무엇을 주장하는지**로 갈랐다.
 *   star-life-cycle                 **질량**이 경로와 빠르기를 가른다 — 둘을 나란히 놓고 견준다
 *   star-radiation-gravity-balance  **왜 안 무너지나** — 두 화살표가 같아지는 크기로 되돌아간다
 *   stellar-nucleosynthesis         **무엇을 만드나** — 결합 에너지 곡선을 오르다 철에서 멎는다
 *   supernova-and-neutron-star      **끝의 1 초** — 무너졌다 튕긴다
 * 이쪽만 두 질량 · 갈라짐 · 수명 견줌 · 단계 이름 어휘를 갖는다. 화살표 · 결합 에너지 ·
 * 충격파라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const starLifeCycleConcept: Aperi21ConceptSource = {
  id: 'star-life-cycle',
  label: 'How Mass Divides the Path and Pace of a Star',
  canonicalSim: 'aperi21:star-life-cycle',

  surface: {
    definition:
      'How mass alone settles a star’s route and pace, a heavy one racing through a swollen phase to a violent finish while a light one lingers a thousandfold longer.',
    exemplarKeywords: [
      'life cycle of a star',
      'what decides how a star ends',
      'massive stars die young',
      'the Sun will become a red giant then a white dwarf',
      'evolutionary track of a star',
      'from main sequence to giant to remnant',
      'why some stars end as black holes and others as white dwarfs',
      'how long does a star live',
      'twenty solar masses versus one solar mass',
      'planetary nebula and the exposed core',
    ],
  },

  briefing: {
    observable: [
      'Two points start together on a diagonal band drawn against surface temperature and brightness — a large bluish-white one high on the band and a small white one halfway along it — each tagged with its mass in solar units.',
      'The heavy point moves first, crossing to the right at nearly constant brightness and turning orange as it swells, with a name appearing beside it for the swollen phase.',
      'It then goes dark, leaving an empty ring where it stood and a tag naming what the collapse leaves behind.',
      'Throughout all of that the light point has not moved a hair from where it started, which the wording under the picture points out in as many words.',
      'A straight ruler of years runs below the chart with a marked line showing the present age, and it has barely left zero by the time the heavy star has finished.',
      'Two bars hang on that ruler, one per star: the heavy star’s is so short it is a dot with its lifetime written beside it, and the light star’s later grows out across most of the ruler before stopping at its own figure.',
      'Only afterwards does the light point move, swelling up and to the right, turning orange and growing as it goes.',
      'It then crosses to the left at nearly constant brightness while a greenish ring blooms around it and a name for the shed shell appears.',
      'Finally it shrinks to a small point and slides down to the lower right along a cooling line, named as what is left of it.',
      'At the end both routes remain drawn on the one chart, visibly parted, with every stage along them named.',
      'Each point carries the colour its own surface temperature gives it and a size set by how far it has swollen, so swelling and cooling are seen rather than asserted.',
    ],

    screen: {
      affordances: [
        'The two routes are drawn one after the other, heavy first, and the sequence repeats from the beginning without anything being pressed.',
        'A single clock runs the whole thing at paces that differ wildly between phases, and the straight ruler of years is there so that the difference is not hidden — on a squeezed ruler the two lifetimes would look comparable.',
        'The picture opens with the heavy star already a little way up the band, so there is no still frame to wait through.',
        'The chart sits on a dark field so that near-white points keep their colour, and the names sit on small backing patches so they stay readable over it.',
        'The second colour marks the present age on the ruler and nothing else; the two lifetime bars share one plain colour and are told apart by the mass written beside each.',
        'No age, no lifetime formula and no temperature or brightness figure is shown; the ages are read off the marker and the lifetimes only from the two end tags.',
      ],
    },

    useWhen: [
      'The article has said that heavier stars live shorter lives and the reader has no feel for the size of the gap. A lifetime that is one dot beside a bar spanning the whole ruler is what gives it a scale.',
      'The text names the stages a star passes through and the reader needs them placed in order on one picture, with the branching point shown to be mass and not chance.',
    ],

    avoidWhen: [
      'The subject is a population of stars rather than individuals — a cluster, its band, or how such a band changes. Two points are followed here and nothing is drawn from a crowd.',
      'What holds a star steady while it is burning, or what happens when that steadiness is upset, is the point. Nothing here is drawn pushing or pulling.',
      'The article turns on which elements are made and why the making stops. No material and no element is shown anywhere.',
      'The collapse and rebound at the end of the heavy star is the subject. That ending is a point going out and a tag, over in a moment.',
      'Masses other than the two shown are needed, or the reader should choose one. The two routes are laid down in advance and cannot be redirected.',
      'Ages, lifetimes or luminosities have to be quoted as figures for particular moments. Only the two lifetimes are written, at the ends of their bars.',
    ],

    contrastWith: [
      {
        concept: 'hr-diagram',
        note: 'Both move things across temperature against brightness; one follows two named individuals through named phases, the other watches a crowd thin out from the top with no phase named at all.',
      },
      {
        concept: 'supernova-and-neutron-star',
        note: 'One passes the violent finish in a moment because its subject is everything on either side of it; the other stops the clock there and makes that second its whole subject.',
      },
      {
        concept: 'stellar-nucleosynthesis',
        note: 'One is about where a star goes and how long it takes; the other is about what is being made inside it while it goes, and why the making has an end.',
      },
      {
        concept: 'star-radiation-gravity-balance',
        note: 'One follows the long succession of settled sizes a star passes through; the other asks why any of those sizes is settled at all.',
      },
    ],
  },
};
