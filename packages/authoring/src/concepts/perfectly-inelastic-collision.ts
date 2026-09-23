/**
 * perfectly-inelastic-collision 개념 선언.
 *
 * 충돌 다섯 중 하나. 이 조각의 주장은 「붙는다」 가 아니라 **함께 가는 속력이 정해지는
 * 방식** 이다 — 같은 수의 칸이 넓어진 질량 위로 퍼져 줄 수가 줄어든다.
 *   perfectly-inelastic-collision  퍼져서 낮아진다 — 폭이 두 배면 줄이 절반
 *   inelastic-collision            얼마가 사라지는가 · 매번 같은 비율
 *   elastic-collision              속도가 통째로 옮겨 간다
 *   ballistic-pendulum             박힌 뒤 **오르는 단계**까지 가는 두 단계 측정
 * 이쪽만 붙어 함께 간다 · 공통 속력 · 「무거운 것과 붙으면 더 느리다」 어휘를 갖는다.
 * 잃은 에너지는 말하지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const perfectlyInelasticCollisionConcept: Aperi21ConceptSource = {
  id: 'perfectly-inelastic-collision',
  label: 'Common Velocity When Bodies Stick',
  canonicalSim: 'aperi21:perfectly-inelastic-collision',

  surface: {
    definition:
      'A hit after which two bodies travel on as one, their shared speed fixed by spreading the same momentum across the widened mass: twice as wide leaves it half as high.',
    exemplarKeywords: [
      'perfectly inelastic collision',
      'completely inelastic collision',
      'they stick together and move off as one',
      'common velocity after the collision',
      'coupling railway wagons',
      'putty thrown at a trolley',
      'catching a moving cart',
      'why do they go slower after joining',
      'combined mass and combined speed',
      'twice the mass half the speed',
    ],
  },

  briefing: {
    observable: [
      'A cart runs at a cart standing still, and on the running one a stack of eight tiles is carried: the width of the stack is the mass and its height is the speed, so a tile is one share of momentum.',
      'On contact the tiles pour out over both carts and spread: the bottom row stays where it is and the rows above slide out to the right until the stack is as wide as the two carts together.',
      'No tile is ever made or removed, so a stack twice as wide has half as many rows and a stack four times as wide has one; the number of rows left is the speed they go on at.',
      'A dashed outline of the stack as it stood before contact is left beside the spread stack while they travel together, so a tall narrow shape and a low wide one can be compared directly.',
      'The carts themselves visibly slow as the tiles spread, in the same picture and at the same moment.',
      '`m` and `3m` are written under the carts and `v` and `v′` beside the stacks, so that width means mass and height means speed without a legend.',
      'Two hits happen in each round — first into a cart of the same size, then into one three times as wide — and the carts fade away and return between them while the rail stays put.',
      'After the second hit the eight tiles stand in a single row four carts wide.',
    ],

    screen: {
      affordances: [
        'The two hits run in order and then begin again; nothing has to be pressed.',
        'The momentum is drawn as countable tiles rather than as a solid bar, so that halving and quartering are counted rather than judged by eye.',
        'The second hit is there because one case alone reads as a particular outcome; two widths make a relation.',
        'Only two things are coloured — the carts and the tiles — and nothing carries a number, so the reading is the number of rows.',
      ],
    },

    useWhen: [
      'The article has given the common-velocity formula and the reader is treating it as algebra with masses added in the denominator. The tiles spreading is that division happening.',
      'The reader expects the joined bodies to keep going at something like the striker’s speed, and a case is wanted where the drop is counted out in rows rather than asserted.',
      'The article claims the drop depends on how much mass was joined, and two widths are needed to make that a relation rather than one outcome.',
    ],

    avoidWhen: [
      'The point is how much kinetic energy the sticking costs. No energy is drawn here — the tiles are momentum, and the picture would be read for a claim it never makes.',
      'The bodies in the article come apart again after the hit, or one of them rebounds.',
      'The subject is what keeps the total constant, or what would break it. There is no outside push here and no boundary is drawn.',
      'The article follows the joined bodies on into a second stage — a swing, a rise, a measurement made afterwards.',
      'The collision is off-centre and the bodies leave at angles.',
      'Values are wanted — a speed in metres per second, a mass in kilograms. Only `m`, `3m`, `v` and `v′` are written.',
    ],

    contrastWith: [
      {
        concept: 'elastic-collision',
        note: 'Two opposite ends of the same range: one has the bodies keep no separate speeds and travel on as a single body, the other has a whole speed pass from one to the other.',
      },
      {
        concept: 'inelastic-collision',
        note: 'One asks what speed the joined bodies go on at; the other asks how much was lost in an impact, and shows it as a height not reached.',
      },
      {
        concept: 'ballistic-pendulum',
        note: 'One ends the moment the two are travelling as one; the other takes that as its first stage and carries the joined body into a second, where a different quantity is the one that holds.',
      },
      {
        concept: 'conservation-of-momentum',
        note: 'One takes the total as given and reads off the speed it forces; the other asks what keeps the total fixed in the first place and what could move it.',
      },
      {
        concept: 'energy-in-collision',
        note: 'One is a single kind of collision followed closely; the other sets this kind beside two others to show which quantity survives all of them and which does not.',
      },
    ],
  },
};
