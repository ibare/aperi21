/**
 * explosion-and-recoil 개념 선언.
 *
 * 형제는 `conservation-of-momentum` · `center-of-mass-motion` · `rocket-equation`.
 * **무엇을 주장하는가**로 갈랐다.
 *   explosion-and-recoil      정지에서 **한 번** 갈라진 결과 — 속력이 질량에 반비례
 *   rocket-equation           **계속** 버리는 경우 — 한 몫이 붙이는 속도가 커진다
 *   conservation-of-momentum  합이 그대로인 것 자체와 계의 경계
 *   center-of-mass-motion     안에서 무슨 일이 나도 한 점은 제 길을 간다
 * 이쪽만 반동 · 총의 되차임 · 「무거운 쪽이 덜 간다」 어휘를 갖는다. 운동량 막대도 질량
 * 중심 표지도 화면에 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const explosionAndRecoilConcept: Aperi21ConceptSource = {
  id: 'explosion-and-recoil',
  label: 'Explosion and Recoil from Rest',
  canonicalSim: 'aperi21:explosion-and-recoil',

  surface: {
    definition:
      'Two pieces driven apart from a standstill, each sent the opposite way at a speed set against its own mass, so the heavier one covers correspondingly less ground in the same time.',
    exemplarKeywords: [
      'recoil',
      'explosion into two pieces',
      'a gun kicks back when it fires',
      'cannon recoil',
      'why the rifle pushes into your shoulder',
      'two skaters pushing off each other',
      'bursting apart from rest',
      'the heavier piece moves away more slowly',
      'recoil velocity',
      'equal and opposite momenta starting from nothing',
    ],
  },

  briefing: {
    observable: [
      'Two slabs of the same height meet at a dashed seam and stand still, one three times as wide as the other, with `3m` and `m` written beneath them so that width means mass.',
      'Fragments spray out from the seam and the two slabs part, moving in opposite directions.',
      'As they glide, a thin upright tick is left at each slab’s inner face once every second, so the spacing between ticks is a speed that can be compared without a number.',
      'The narrow slab leaves its ticks three times as far apart as the wide one does.',
      'Accent arrows named `v` and `3v` ride with the slabs and stand in that same ratio.',
      'At the end the slabs travel on and fade out, and what is left is the two rows of ticks with measures `d` and `3d` reaching from the seam to the third tick on each side.',
      'The floor is smooth, so neither slab ever slows down and neither comes to rest.',
      'The same ratio is therefore said four times over — by the widths, by the tick spacings, by the arrow lengths and by the measures — and nothing on the screen carries a value.',
    ],

    screen: {
      affordances: [
        'The standing still, the burst, the gliding apart and the comparison of the two measures happen in order and then begin again; nothing has to be pressed.',
        'The two slabs differ in width and nothing else, so heavier and wider are the same thing here without a legend.',
        'The measures are taken from the seam to the inner face rather than from centre to centre, so the widths of the slabs do not creep into the ratio.',
        'The accent colour is kept for velocity alone, and the two pieces are not told apart by colour — only by width and by the letters under them.',
        'The burst itself is stretched over a moment rather than happening between frames, and the arrows grow from nothing during it.',
      ],
    },

    useWhen: [
      'The article says the two momenta must come to nothing because they started at nothing, and the reader cannot see what that forces. The tick spacings give both speeds at once, in a ratio rather than in numbers.',
      'The reader expects the two pieces of a burst to be alike, and a case is wanted where they are alike in everything but width and still leave at plainly different speeds.',
      'The article needs recoil pictured as a single event with two outcomes rather than as a force felt by one party.',
    ],

    avoidWhen: [
      'The pieces in the article are slowed by friction, or the question is how far something slides before it stops. The floor here is smooth and the slabs never stop.',
      'The mass is being shed continuously rather than in one split — a rocket burning through its fuel, a jet, a leaking wagon.',
      'The point is that the two forces during the burst are equal, rather than what the two speeds end up being. No force arrow is drawn here.',
      'The subject is the total and what keeps it fixed, or where the boundary of the system is drawn. No momentum arrow, bar or total appears.',
      'The subject is the average point of the two pieces and what it does. No such point is marked.',
      'The article is about the energy released, where it came from, or how it divides between the pieces.',
      'Values are wanted — a recoil speed, a distance in metres, a mass in kilograms.',
    ],

    contrastWith: [
      {
        concept: 'rocket-equation',
        note: 'One is a single parting in which the whole of the mass leaves at once; the other throws mass away in load after load, and is about how the worth of each load changes as the rest gets lighter.',
      },
      {
        concept: 'conservation-of-momentum',
        note: 'One takes the total to be nothing from the start and reads off what it forces on two speeds; the other asks what makes the total hold at all, and what could move it.',
      },
      {
        concept: 'center-of-mass-motion',
        note: 'One follows the two pieces and the speeds they were left with; the other ignores the pieces and follows the average point, which the bursting cannot shift.',
      },
      {
        concept: 'newtons-third-law',
        note: 'One is about the two speeds the parting leaves behind, inversely matched to the masses; the other is about the two pushes during it, equal to each other whatever the masses are.',
      },
    ],
  },
};
