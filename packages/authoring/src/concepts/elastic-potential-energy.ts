/**
 * elastic-potential-energy 개념 선언.
 *
 * 퍼텐셜 셋 가운데 이쪽만 **제곱**이다. 갈림은 저장량이 무엇에 비례하는가다.
 *   elastic-potential-energy        누른 깊이의 **제곱** — 두 배 눌림 → 네 배 높이
 *   gravitational-potential-energy  높이에 **곧바로 비례** — 두 배 높이 → 두 배 깊이
 *   potential-energy-curve          저장이 아니라 곡선 읽기
 * `spring-force`(늘인 만큼 힘이 커진다) · `work-by-variable-force`(넓이로 쌓는다) 와도
 * 갈라야 한다 — 이쪽은 **담긴 양의 결과**만 말하고 힘의 규칙도 넓이도 말하지 않는다.
 * `kinetic-energy` 와는 같은 「네 배」 지만 주어가 다르다 — 거기는 속력, 여기는 변형.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const elasticPotentialEnergyConcept: Aperi21ConceptSource = {
  id: 'elastic-potential-energy',
  label: 'Elastic Potential Energy',
  canonicalSim: 'aperi21:elastic-potential-energy',

  surface: {
    definition:
      'Energy put into a spring by deforming it, held while the deformation lasts and growing with the square of how far it was pushed in, so twice the squeeze carries four times as much.',
    exemplarKeywords: [
      'elastic potential energy',
      'energy stored in a compressed spring',
      'half k x squared',
      'does pressing twice as deep launch it twice as high',
      'spring energy and how high it throws something',
      'strain energy in a stretched spring',
      'energy stored in a deformation',
      'why the spring energy has a square in it',
      'a spring launcher and the height reached',
      'twice the compression gives four times the energy',
    ],
  },

  briefing: {
    observable: [
      'Two identical springs stand side by side, each with the same ball resting on a pan on top, and the two are pressed down together — the right one to twice the depth of the left.',
      'A measuring line beside each spring lengthens as it is pressed and takes the symbols x and 2x once the pressing has finished.',
      'An arrow above each ball grows as the spring goes down, so the deeper-pressed spring is visibly resisting harder, but the arrows carry no labels and disappear the moment the balls are released.',
      'On release a coloured measuring line climbs with each ball, starting from the point it was let go, and the right one lengthens strikingly faster.',
      'At the moment the left ball reaches its highest point the right one has already passed the third mark and is still rising — the moment at which an expectation of twice as high collapses.',
      'The right line stops at the fourth mark, four times the left, and each line stays at the greatest height of its run while the ball falls back.',
      'Each lane carries a scale whose one cell is the height the shallow ball reached, and the two scales start at different levels because the two balls were released from different depths.',
      'The pressed-in depth lines stay on screen after release, so each lane ends up showing its depth beside its height — x with h on the left, 2x with 4h on the right.',
      'The balls keep bouncing: the right one falls back and presses the spring in to the same depth again, so nothing drains away between the cycles.',
      'Only symbols are written — x, 2x, and h through 4h. No depths, heights or energies appear as numbers.',
    ],

    screen: {
      affordances: [
        'The pressing, the release, the climb and the settling of the two measuring lines happen in order and then begin again, so the four-to-one comparison comes round on its own.',
        'The run opens with both springs already going down under the press.',
        'The climb is played at about a third of real pace, because the deeper-pressed ball reaches its top in well under a second otherwise.',
        'Heights are measured from where each ball was released rather than from the springs’ natural length, which is what makes the ratio come out at exactly four.',
        'The two launchers are drawn identical in ball, pan and spring, so only the depth pressed differs; the accent colour is kept for the height reached alone.',
        'The picture is built tall rather than wide, because four times a height is the claim and the top mark has to fit on screen.',
      ],
    },

    useWhen: [
      'The reader has been handed the squared term in a spring’s stored energy and has no reason to believe it. Two identical springs, one pressed twice as deep, throwing their balls to one and four times a height makes the square something that was watched.',
      'A passage is about launchers, catapults or anything that stores by being deformed, and a case is wanted where the store is read off as height rather than as a formula.',
    ],

    avoidWhen: [
      'The subject is how the force from a spring grows with stretch, or the constant that relates them. The arrows here carry no labels and no rule is stated about them.',
      'The work done by a force that varies has to be built up step by step. The strips of such a construction are not drawn here; only the outcome of the store is shown.',
      'The article is about energy stored by lifting something. What is stored here is put in by squashing, and the height that appears is how the store is measured, not where it came from.',
      'The point is that a moving body carries energy according to its speed. No velocity arrow appears once the balls are away.',
      'Oscillation, period or how a mass on a spring keeps time is the theme. The balls here leave the spring entirely and fly free.',
      'Damping, heat or energy lost is the theme. Nothing drains away here — each ball comes back down and presses the spring in as deep as before.',
      'Values are wanted — a compression in centimetres, a spring constant, an energy in joules. Only ratios are written.',
    ],

    contrastWith: [
      {
        concept: 'gravitational-potential-energy',
        note: 'Both are stores filled by doing work and emptied later, but one fills with the square of the deformation while the other fills in simple step with the height.',
      },
      {
        concept: 'spring-force',
        note: 'One is about how much a squeezed spring holds; the other is about how hard it pushes back at a given squeeze, which is a statement about force rather than about a store.',
      },
      {
        concept: 'work-by-variable-force',
        note: 'One shows the size of the store that results; the other shows the procedure by which such a store is counted up when the force changes throughout.',
      },
      {
        concept: 'kinetic-energy',
        note: 'Both land on a factor of four, but from different causes — there the body was going twice as fast, here the spring was pushed in twice as far.',
      },
      {
        concept: 'potential-energy-curve',
        note: 'One is a single store being filled by a deformation; the other treats stored energy as a landscape whose shape says where a body can and cannot go.',
      },
    ],
  },
};
