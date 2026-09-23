/**
 * elastic-collision 개념 선언.
 *
 * 충돌 다섯 중 하나. 「운동량은 보존되고 운동 에너지는 아니다」 를 다섯이 나눠 말하지
 * 않는다 — 이 조각은 **같은 질량 정면 충돌에서만 일어나는 일** 하나를 주장한다.
 *   elastic-collision              같은 이름의 속도가 **통째로 주인을 바꾼다**
 *   inelastic-collision            튈 때마다 **같은 비율**로 낮아진다
 *   perfectly-inelastic-collision  퍼져서 낮아진다 — 함께 가는 **속력이 정해지는 방식**
 *   two-dimensional-collision      성분 합이 **따로** 제자리다
 *   energy-in-collision            무엇이 남고 무엇이 안 남는가의 **견줌**
 * 이쪽만 맞바꿈 · 딱 서는 공 · `v` 이름표가 옮겨 가는 어휘를 갖는다. 운동 에너지 보존은
 * 화면에 없어 avoidWhen 으로 되돌린다(간극 장부 참조).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const elasticCollisionConcept: Aperi21ConceptSource = {
  id: 'elastic-collision',
  label: 'Velocity Exchange in an Equal-Mass Collision',
  canonicalSim: 'aperi21:elastic-collision',

  surface: {
    definition:
      'A head-on meeting of two equal bodies in which a speed passes over whole: the one that arrives with it is left standing and the other departs carrying exactly it.',
    exemplarKeywords: [
      'elastic collision',
      'equal masses exchange velocities',
      'Newton’s cradle',
      'the cue ball stops dead and the other goes',
      'they swap speeds',
      'head-on collision of two identical balls',
      'the struck ball leaves with what arrived',
      'what happens when equal masses collide',
      'perfectly elastic collision of identical bodies',
      'each gives the other its speed back',
    ],
  },

  briefing: {
    observable: [
      'Two balls of the same size and colour sit on a thin rail, each with an `m` written below it so that equal mass is stated rather than assumed.',
      'Above each ball rides an arrow whose length is its speed, and above the arrow a name — `v` or `½v` — saying which of the starting speeds this one is.',
      'While the balls are touching, which lasts a short moment drawn out to well over a second, one arrow shrinks by just as much as the other grows, and neither carries a name during that time.',
      'When they part, the name has changed owner: the arrow that leaves is the same length as the one that arrived, and it wears the same letter.',
      'Two meetings happen in each round. In the first a ball rolls at a ball standing still, and afterwards the runner is the one standing still while the struck one leaves at the arriving speed.',
      'In the second the two come at each other with different speeds, and afterwards each leaves carrying the other’s — the faster one goes back slowly and the slower one departs fast.',
      'The balls fade away and a new pair fades in between the two meetings, while the rail stays put.',
      'During contact the two balls overlap very slightly rather than deforming, so the eye stays on the arrows.',
    ],

    screen: {
      affordances: [
        'The two meetings run in order and then begin again; nothing has to be pressed.',
        'The names are chosen by value — a name is only shown when the present speed really equals one of the starting speeds — so a name appearing on the other ball is evidence rather than decoration.',
        'The second meeting is there because the first alone reads as the runner handing over its speed; the struck body handing one back is what makes it an exchange.',
        'Only two things are coloured — the bodies and the velocities — and nothing is numbered, so the comparison is between two lengths carrying the same letter.',
      ],
    },

    useWhen: [
      'The article has stated that equal masses trade velocities and the reader has taken it as a formula with the masses cancelled out. The same letter turning up above the other ball is what turns it into something seen.',
      'The reader is reading the first case as the runner giving away its speed, and a second case is needed where the struck body plainly gives one back.',
    ],

    avoidWhen: [
      'The claim to be carried is that kinetic energy is conserved. No energy is drawn anywhere here — no bar, no area, no accounting — and the picture would be borrowed for a claim it never makes.',
      'The masses in the article differ, and the point is what the heavier one does to the lighter. Both bodies here are the same size and marked with the same letter, and the exchange holds only because of it.',
      'The point is the total the two have between them, or that the total survives the meeting. Nothing sums the two arrows.',
      'The bodies in the article stay together after the hit, or come away slower than they arrived.',
      'The collision is off-centre and the bodies leave at angles. Everything here runs along one rail.',
      'Values are wanted — how fast, by how much. Only the letters `v` and `½v` are written.',
    ],

    contrastWith: [
      {
        concept: 'perfectly-inelastic-collision',
        note: 'Both fix what the bodies do after the hit, at opposite ends of the range — one has the whole speed pass across, the other has them keep none of their separate speeds and go on as one.',
      },
      {
        concept: 'inelastic-collision',
        note: 'One is the case where a body leaves with everything that arrived; the other is the case where it leaves with a fixed fraction of it, over and over.',
      },
      {
        concept: 'energy-in-collision',
        note: 'One says what the speeds do in one particular case — equal masses, head-on; the other stands three kinds of collision beside one another and asks which quantity survives each.',
      },
      {
        concept: 'conservation-of-momentum',
        note: 'One follows named speeds from body to body; the other ignores which body holds what and watches only the total the pair carries.',
      },
    ],
  },
};
