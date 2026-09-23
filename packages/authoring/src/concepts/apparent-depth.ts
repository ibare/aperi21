/**
 * apparent-depth 개념 선언.
 *
 * 굴절 넷 가운데 「보이는 자리가 옮겨 간다」 쪽이다. 형제와는 **무엇이 옮겨 가는가**로 갈랐다.
 *   apparent-depth             물속 물체가 **위로** 떠 보인다 — 깊이의 비가 주장
 *   mirage                     하늘이 길바닥 **아래로** 보인다 — 층 기울기가 휘게 한 결과
 *   snells-law                 꺾이는 **각** 자체 (이미 선언됨)
 *   total-internal-reflection  아예 **나가지 못하는** 문턱
 * 이쪽만 동전 · 물통 · 실제 깊이 ↔ 보이는 깊이 · cm 어휘를 갖는다. 각 · 굴절률의 수를
 * definition 에 쓰지 않는다 — 화면에도 각 글자가 없다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const apparentDepthConcept: Aperi21ConceptSource = {
  id: 'apparent-depth',
  label: 'How Much Shallower a Submerged Coin Looks',
  canonicalSim: 'aperi21:apparent-depth',

  surface: {
    definition:
      'Seen from almost straight above, a coin under water sits higher than it lies: the eye traces the bent rays straight back and meets them short of the true depth.',
    exemplarKeywords: [
      'apparent depth',
      'the bottom of a pool seems raised toward you',
      'a coin at the bottom of a glass of water',
      'real depth divided by the refractive index',
      'a submerged object appears raised',
      'a fish is not quite where you see it',
      'spearing a fish and missing it',
      'water looks about three quarters as deep',
      'a thick glass block makes printed letters look closer',
      'apparent position of something seen through a flat surface',
    ],
  },

  briefing: {
    observable: [
      'A tank is drawn in cross-section. A filled coin lies on the bottom, and a plain measuring line down the left side gives the actual depth as twelve centimetres.',
      'Two rays leave the coin, ten degrees either side of an upright dashed line, and at the surface each turns away from that dashed line and goes on up into an eye placed right above the coin.',
      'Dashed lines then grow downward from the two places where the rays crossed the surface, carrying on the direction the eye received, and they meet at a point above the coin.',
      'At that meeting point a coin of the same colour appears with its middle left empty, and a highlighted measuring line on the right reads the depth it is seen at — nine centimetres for water.',
      'On the left a short column names the liquid with its index beside it; only the one in force is written boldly.',
      'The water is then replaced with glass while the coin itself never moves. The rays above the surface open out further, the meeting point and the hollow coin rise, and the reading becomes eight centimetres.',
      'The place where the coin appeared in water is kept as a faint hollow coin, so the glass reading stands above it and the two can be compared in one picture.',
      'The actual-depth line on the left stays exactly where it is the whole way through, while the highlighted line on the right shortens.',
      'The figure for the seen depth is written only while the picture is at rest; it goes away while the liquid is changing and comes back once the new reading has settled.',
    ],

    screen: {
      affordances: [
        'The liquid changes from water to glass and back again, over and over, with nothing to press.',
        'The coin is fixed for the whole round, which leaves the liquid as the only thing that can account for the reading moving.',
        'Both measuring lines are ruled against the same tank, so how much has been gained is read off as the difference in their lengths rather than worked out.',
        'The coin the light really comes from is drawn filled and the coin the eye seems to see is drawn hollow, in the same colour, since they are two showings of one thing.',
        'The eye is drawn wide enough to take both rays, which a single point could not do, and it sits over the ends of the rays so that they read as going into it.',
        'The upright dashed line at each crossing point is what the turn is measured against, though no angle is written anywhere.',
        'The screen opens with the rays already running from the coin to the eye in water.',
      ],
    },

    useWhen: [
      'The article has given the reader the rule that depth divides by the index and the reader can apply it but has no picture of what is being divided. Here the two measuring lines stand side by side in one tank and the quotient is a length on screen.',
      'The reader has been told that light bends leaving water and accepts it, yet still expects to find a coin where they see it. Following the dashed lines back to a point above the coin is what breaks that expectation.',
      'The point being made is that a denser liquid raises the object further, and the article wants the two cases held together rather than described one after the other. The water reading is kept faintly on screen when glass takes over.',
    ],

    avoidWhen: [
      'The subject is how many degrees the ray turns, or the rule connecting the two angles. No angle is written here and no arc is drawn; what is measured is a depth.',
      'The article is about looking at the water from the side or at a steep slant, or about an object that appears shifted sideways rather than raised. The eye here is almost directly over the coin.',
      'The point is that light can fail to get out of the water altogether. Every ray here leaves the liquid and reaches the eye.',
      'The article is about something seen in a mirror rather than through a surface. Nothing here is reflected; both rays cross the surface and carry on.',
      'The subject is a hot road, the open sky, or bending spread out through air rather than happening at one face. There is a single flat surface here and the turn happens only there.',
      'The reader is meant to vary the depth, the viewing angle or the liquid themselves. The coin stays at one depth and the round runs through two liquids on its own.',
    ],

    contrastWith: [
      {
        concept: 'snells-law',
        note: 'One asks how far a ray turns as it crosses a surface; the other takes that turn as given and asks where the object it came from therefore appears to be.',
      },
      {
        concept: 'mirage',
        note: 'Both end with an eye tracing light back to a place nothing is, but one has the turn happen at a single flat face and raise the object, while the other has it spread through a thickness of air and put the thing below ground.',
      },
      {
        concept: 'plane-mirror-image',
        note: 'Both locate an apparition by following the arriving light backward; one has the light cross the surface, so the shift is a fraction of the true distance, the other has it turn back, so the shift is a mirror copy.',
      },
    ],
  },
};
