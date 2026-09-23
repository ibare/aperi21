/**
 * rolling-race 개념 선언.
 *
 * 질량 분포 형제 셋 가운데 **여러 모양을 나란히 놓는 쪽**이다 — `moment-of-inertia` 는 한
 * 바퀴의 질량을 옮기고, `parallel-axis-theorem` 은 축을 옮긴다. 결과도 종류가 다르다:
 * 저 둘은 「저항」 · 「얹힌 조각」 이고 이쪽은 **도착 순서**다.
 * `rolling-without-slipping` 과는 넷 다 구르는 것을 전제로 하느냐로 갈린다 — 이쪽은
 * 전제하고 모양만 묻는다. 이쪽만 공 대 원판 대 고리 · 먼저 닿는다 · 크기는 상관없다
 * 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const rollingRaceConcept: Aperi21ConceptSource = {
  id: 'rolling-race',
  label: 'Rolling Race',
  canonicalSim: 'aperi21:rolling-race',

  surface: {
    definition:
      'Which of several bodies released together down a slope arrives first, settled by where each one keeps its mass rather than by how big or how heavy it is.',
    exemplarKeywords: [
      'rolling race',
      'ball versus disc versus hoop down a ramp',
      'which one rolls down fastest',
      'a hollow cylinder loses to a solid one',
      'does the bigger one get there first',
      'shape decides the order of arrival',
      'a full can beats an empty can down a slope',
      'racing objects down an incline',
      'why size and mass drop out of the answer',
      'order of finish on a slope',
    ],
  },

  briefing: {
    observable: [
      'Four ramps of the same angle and the same length are stacked one above another, carrying a hoop, a large disc, a small disc and a ball, all let go from one line at the same moment.',
      'All four are drawn in the same ink, and what tells them apart is where the shading lies: the hoop is a bare heavy rim, the two discs are evenly filled, and the ball is darkest at its centre.',
      'The radii are deliberately mixed — the large disc is the biggest of the four and the small disc the smallest — so no ordering by size holds anywhere on the screen.',
      'The two discs stay level with each other the whole way down although one is twice the size of the other; the small one’s marker line simply turns twice as fast.',
      'The hoop falls behind from the start and the gap goes on widening.',
      'The ball crosses the finishing line first, the two discs arrive together a little later, and the hoop comes in last, each of them stopping against a bar at the line.',
      'A ripple spreads at the line as each arrives and a place stays behind it — one, two, two, three — so the two discs are given the same place.',
      'Dotted lines run down through all four lanes at the start and at the finish, so the common start and the order of finish are each read off a single line.',
    ],

    screen: {
      affordances: [
        'The release, the descent and the finish run in order by themselves and then come round again.',
        'The lanes are stacked so that the same distance down the ramp falls on one vertical line across all four, which is what lets the two discs be seen to be level rather than merely close.',
        'The last stretch is slowed to about a third of speed, so the tenth of a second between the ball and the discs can be told apart by eye.',
        'The places are worked out from shape alone, which is why two bodies of very different size are given the same one.',
        'The accent colour is kept for arrival alone — the ripple and the place — while the ramps, the lines and the names stay quiet.',
        'Each body carries a single radius line that turns as it goes, hollowed at its middle so the shading it is drawn over stays visible.',
      ],
    },

    useWhen: [
      'The article has said that a hollow body loses to a solid one and the reader suspects that weight or size is doing the work. Two discs of very different size finishing level is the case that closes that door.',
      'This is a first meeting with the idea that a body can have a property of shape which decides how it behaves whatever the amount of it, and a race is wanted rather than an algebraic cancellation.',
    ],

    avoidWhen: [
      'The article is about bodies sliding rather than rolling, or about friction deciding a descent. All four here roll, and the difference between them is entirely one of shape.',
      'How much energy a rolling body carries, or where that energy goes, is the subject. Nothing on the screen stands for energy.',
      'The condition that makes rolling rolling, and what it does to the point on the ground, has to be explained. The contact is never drawn here.',
      'The masses are central to the argument — that the large disc is four times the small one, for instance. No weights are shown or named.',
      'Values are wanted: times, rates, or a shape factor for each body. Only the places one, two, two and three are written.',
      'One body is being studied and its axis moved about. Each of these turns about its own centre throughout.',
    ],

    contrastWith: [
      {
        concept: 'moment-of-inertia',
        note: 'One sets whole shapes against one another and reads the difference off who finishes first; the other takes a single wheel, rearranges it, and reads it off how far behind it falls.',
      },
      {
        concept: 'rolling-without-slipping',
        note: 'One assumes rolling in all four of its bodies and asks only what their shapes do to the finishing order; the other asks what rolling itself means for the point touching the ground.',
      },
      {
        concept: 'rotational-kinetic-energy',
        note: 'One releases several shapes from the same height and reads the answer off who arrives first; the other sends two bodies in at the same speed and reads it off the height they reach.',
      },
      {
        concept: 'inclined-plane',
        note: 'One has several bodies on identical slopes and asks only which arrives first; the other asks what a slope does to a single body at all.',
      },
    ],
  },
};
