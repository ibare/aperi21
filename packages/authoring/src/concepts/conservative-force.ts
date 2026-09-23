/**
 * conservative-force 개념 선언.
 *
 * 셋이 붙는다. **무엇을 세는가**로 갈랐다.
 *   conservative-force      **힘이 한 일의 누적** — 도중에는 두 길이 전혀 다르다가 끝에서만 같아진다
 *   non-conservative-force  **잃은 양의 누적** — 경로가 길수록 크고, 돌아와도 줄지 않는다
 *   energy-dissipation      잃은 것의 **행방** — 경로 비교가 아니라 열이 어디 남는가
 * 이쪽만 「경로 무관」 · 「음의 일과 되찾음」 · 「끝점 높이만 남는다」 어휘를 갖는다.
 * 속력 · 마찰 · 열은 말하지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const conservativeForceConcept: Aperi21ConceptSource = {
  id: 'conservative-force',
  label: 'Conservative Force',
  canonicalSim: 'aperi21:conservative-force',

  surface: {
    definition:
      'A force whose total work between two given points comes out the same along any route taken, the running tally swinging apart mid-journey and settling on the endpoints alone.',
    exemplarKeywords: [
      'conservative force',
      'work independent of the path',
      'why gravity is a conservative force',
      'the work done depends only on the start and end points',
      'path independence of work',
      'why a potential energy can be defined for a force',
      'does the route change the work gravity does',
      'negative work going up and getting it back coming down',
      'same two points different path same work',
      'which forces have a potential and which do not',
    ],
  },

  briefing: {
    observable: [
      'Two identical boxes leave the same marked point A at the same moment and arrive at the same marked point B at the same moment, each along its own curved route: one rising above A before coming back down, the other dipping below B before coming back up.',
      'To the right, two coloured bars stand on a common base line and record the running total of the work gravity has done on each box so far.',
      'While one box climbs, its bar sinks below the base line into the negative; while the other descends, its bar grows upward — the two move in opposite directions at the same time.',
      'At the far point of each route the disagreement is at its worst: one bar is at its deepest below the line, the other has risen past the guide line drawn at the height of A, so it looks momentarily as though the dipping route were gaining more.',
      'On the way back the first bar climbs out of the negative and the second gives back the excess it had piled up.',
      'At B the two boxes lie on top of one another, and the tops of the two bars come to rest at exactly the same level, touching the guide line drawn across from A.',
      'A measuring line marked h between the guide line and B is drawn at the same height the bars finish at, so the final total is visibly the drop between the endpoints and nothing else.',
      'A gravity arrow of identical length and direction is drawn on both boxes throughout, so the force is the same everywhere and only the route differs.',
      'The two routes are told apart by their labels and by which of them runs high and which runs low, not by colour, and the boxes tilt to lie along whatever slope they are on.',
      'No numbers are written anywhere — only the point names, the route names, mg, the two bar names and h.',
    ],

    screen: {
      affordances: [
        'The parting, the far point, the return and the meeting at B happen in order and then begin again.',
        'The run opens with the two boxes already parted, so a bar below the line and a bar above it are on screen from the first moment.',
        'Both boxes reach their far point at the same horizontal position and at the same instant, so the comparison of the two tallies never turns into a question of who arrives first.',
        'The bars stand on the height line of B with the height of A drawn across beyond them, which turns the final claim into whether two bar tops touch one drawn line.',
        'The accent colour is kept for the work tallies alone, and neither route is given a colour of its own.',
      ],
    },

    useWhen: [
      'The article is about to say that a potential energy can be defined for gravity, and the reader needs a reason why such a thing is even possible. Two tallies that disagree violently in the middle and finish level is that reason.',
      'A passage claims the route does not matter and the reader suspects the longer or higher route must cost more. The moment where one tally has climbed past the guide line, before giving the excess back, is where that suspicion is met head on.',
    ],

    avoidWhen: [
      'The force under discussion is friction, drag or anything that takes energy away for good. Nothing here is lost; each tally returns what it borrowed.',
      'The subject is how the energy is stored between the two points, or how much a raised body holds. What is tallied here is the work the force does along the way, not a store sitting in the body.',
      'The point is how fast the body arrives, or that the arrival speeds match. No velocity is drawn and the two boxes are simply carried along their routes in the same time.',
      'A closed loop returning to its starting point is what the article uses to define the idea. Both routes here run between two distinct points and neither comes back to where it started.',
      'The article needs gravity broken into components along a slope, or the mechanics of moving along an incline. The gravity arrow here is left whole and is never resolved.',
      'Values are wanted — a work in joules, a height in metres. Only symbols are written.',
    ],

    contrastWith: [
      {
        concept: 'non-conservative-force',
        note: 'One is the case where two routes between the same points come to the same total; the other is the case where they do not, and where the longer route costs strictly more.',
      },
      {
        concept: 'gravitational-potential-energy',
        note: 'One is why a store may be assigned to position at all, since the work depends only on the endpoints; the other is that store in use, filled by lifting and handed back on the way down.',
      },
      {
        concept: 'conservation-of-mechanical-energy',
        note: 'One is a statement about a single force and its work along two routes; the other is a statement about a running total of energy that stays fixed throughout a motion.',
      },
      {
        concept: 'potential-energy-curve',
        note: 'One establishes that a force may be summarised by position alone; the other takes such a summary as given and reads the resulting curve for where a body can go.',
      },
      {
        concept: 'inclined-plane',
        note: 'One keeps the gravity arrow whole and counts only the work it has done; the other splits that same arrow along and across the slope.',
      },
    ],
  },
};
