/**
 * orbital-transfer 개념 선언.
 *
 * 위험한 짝은 `gravitational-slingshot` — 둘 다 속도를 바꿔 궤도를 옮긴다. **주장을 갈랐다.**
 *   orbital-transfer         **두 번 민다** — 그런데 밀지 않은 쌍둥이보다 느려진다
 *   gravitational-slingshot  엔진을 **한 번도 켜지 않는다** — 빨라짐은 보는 틀에서 온다
 * 이쪽만 밀기 · Δv · 호만 · 두 원 사이 어휘를 갖고, 스침 · 두 틀 · 빌려 옴은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const orbitalTransferConcept: Aperi21ConceptSource = {
  id: 'orbital-transfer',
  label: 'Orbital Transfer — Two Pushes That Leave You Slower',
  canonicalSim: 'aperi21:orbital-transfer',

  surface: {
    definition:
      'Moving between two circular orbits takes a push along the travel direction, a coast up half an ellipse, and a second push, after which the craft circles slower than before.',
    exemplarKeywords: [
      'Hohmann transfer',
      'raising a satellite to a higher orbit',
      'two burns to change orbit',
      'delta-v needed to move between orbits',
      'why does speeding up put you in a slower orbit',
      'transfer ellipse between two circles',
      'firing prograde to raise the far side',
      'the cost of getting to a higher orbit',
      'orbital mechanics is counterintuitive',
      'going up means going slower',
    ],
  },

  briefing: {
    observable: [
      'A craft circles a planet on the inner of two dotted guide circles, carrying a velocity arrow whose length is simply how fast it is going.',
      'The destination circle is drawn from the start, so where the craft is headed is on screen before anything happens to it.',
      'At the bottom of the inner circle the motion pauses and a second arrow grows from the tip of the velocity arrow, along the same direction, and is named as the first push.',
      'With that added the arrow is at its longest, and the craft leaves the circle on a curve that climbs toward the outer one, its own path drawn behind it as it goes.',
      'As it climbs the arrow shortens noticeably, so the craft is plainly losing speed over the very stretch in which it is gaining height.',
      'From the moment of the first push a faint twin splits off and stays on the inner circle, carrying its own arrow, so the shortening arrow always has the original speed beside it to be measured against.',
      'Partway up the climbing craft’s arrow has already become shorter than the twin’s, which is the push having made it slower than not pushing would have.',
      'At the top of the climb the motion pauses again and a second push grows from the tip of the now-short arrow, and the craft settles onto the outer circle.',
      'Going round that outer circle its arrow remains visibly shorter than the twin’s down below, although it has now been pushed twice.',
      'The two pushes stay behind as short marks at the two places they happened, on opposite sides of the planet, and the closing sentence says these two are all the move took.',
      'Both pushes are short compared with the velocity arrows they were added to, and no speed, height or cost is written as a number.',
    ],

    screen: {
      affordances: [
        'The whole journey runs and repeats on its own; the pushes are not aimed or sized by anyone.',
        'Every part of the picture runs on one time scale, so a craft that has slowed is seen to take longer, rather than the slowing being asserted by the arrow alone.',
        'Time stops during each push so that a change which is really instantaneous can be watched as an arrow growing from the tip of another.',
        'Only the pushes carry the accent colour, so what was added by the engine and what was there already need no legend.',
      ],
    },

    useWhen: [
      'The article has stated that firing forward raises an orbit and the reader expects that to mean going faster. Watching the arrow shrink below the untouched twin’s while the craft climbs is what turns the paradox into something seen.',
      'The prose needs the shape of a transfer — push, half an ellipse, push — as a sequence with a beginning and an end, and needs the two burn marks left on opposite sides as the picture of what it cost.',
    ],

    avoidWhen: [
      'The speed change in the article comes from passing a planet rather than from an engine. Everything here is done by firing, twice, at chosen places.',
      'The point is how different launch speeds from one place produce differently shaped paths. One craft makes one journey here and the two circles are fixed.',
      'Delta-v budgets, transfer times or fuel masses are wanted as figures. Only symbols name the two pushes and nothing is measured.',
      'The subject is arriving at a particular place at a particular time — launch windows, phasing, rendezvous. Nothing is being met here.',
      'The article is about an orbit decaying, or a craft returning and entering an atmosphere. Both circles here are stable and the move is outward.',
      'Where the destination orbit came from, or why one height is wanted over another, is the question. The outer circle is simply given.',
    ],

    contrastWith: [
      {
        concept: 'gravitational-slingshot',
        note: 'Both change how fast a craft goes. One does it with engine burns at chosen moments and ends up circling more slowly; the other fires nothing and gains only in the eyes of a different observer.',
      },
      {
        concept: 'geostationary-orbit',
        note: 'One is the journey between two circular orbits and what it costs; the other is about what a satellite already settled on such a circle does for someone on the turning ground below.',
      },
      {
        concept: 'gravitational-potential-energy',
        note: 'One follows the speed through a climb and finds it lower at the top; the other is the store that climbing fills, and is what the lost speed went into.',
      },
      {
        concept: 'impulse-momentum-theorem',
        note: 'One is two short pushes whose point is what they do to an orbit; the other is the general accounting of what a push of a given size and duration does to a body’s motion.',
      },
    ],
  },
};
