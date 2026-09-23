/**
 * mass-spring-system 개념 선언.
 *
 * 「주기를 무엇이 정하는가」를 말하는 형제가 셋이다. **무엇을 바꿔 견주는가**로 갈랐다.
 *   mass-spring-system              **질량** — 네 배 무거우면 두 배 느리다, 진폭은 상관없다
 *   simple-pendulum                 **줄 길이** — 네 배 길면 두 배 느리다, 추 무게는 상관없다
 *   physical-pendulum               **매단 자리** — 옮기면 빨라지다가 다시 느려진다
 *   pendulum-amplitude-dependence   **진폭** — 크게 흔들면 조금씩 늦는다
 * 이쪽만 용수철 · 질량 · 튕김 어휘를 갖는다. 줄 · 매단 자리 · 각도라는 말은 쓰지 않는다.
 * 「진폭은 주기를 바꾸지 않는다」는 이 조각(용수철, 소진폭)과
 * `pendulum-amplitude-dependence`(진자, 큰 각)가 반대 방향으로 말하므로 avoidWhen 이 가른다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const massSpringSystemConcept: Aperi21ConceptSource = {
  id: 'mass-spring-system',
  label: 'Mass on a Spring',
  canonicalSim: 'aperi21:mass-spring-system',

  surface: {
    definition:
      'The oscillation of a mass on a spring, whose round-trip time is set by the mass it carries and the stiffness of the spring, and not by how far it was first pulled.',
    exemplarKeywords: [
      'mass on a spring',
      'period of a spring oscillator',
      'does a heavier weight bounce more slowly',
      'T = 2 pi root m over k',
      'four times the mass, twice the period',
      'pulling it further does not make it slower',
      'bouncing weight on a spring',
      'how mass and spring constant set the rate of bouncing',
      'car suspension bounce rate',
      'spring oscillator frequency',
    ],
  },

  briefing: {
    observable: [
      'Three identical springs run horizontally from a wall along three lanes stacked one above the other, each ending in a block on the floor.',
      'The top and middle blocks are the same size; the bottom block has sides twice as long, and symbols at the wall name the top two as one weight and the bottom as four times that.',
      'Before the release all three are held out at their starting marks and measuring lines show how far each was pulled — the middle one twice as far as the other two.',
      'The three are let go in the same instant.',
      'Each time a block comes back to its own starting mark a ring spreads out there and a dot is added to a row on the right of that lane.',
      'The top two flash together every time, although one of them was pulled twice as far as the other — their dot rows grow in step.',
      'The bottom lane flashes once for every two flashes above it, and its row of dots stays half as long.',
      'When the heavier block has been out and back twice, all three stand at their starting marks together and the rows read four, four and two.',
      'The dots then clear, the measuring lines come back, and the three are pulled out and released again.',
    ],

    screen: {
      affordances: [
        'The holding, the release, the flashes and the gathering-together run on their own and repeat, so the whole comparison completes without anything being asked for.',
        'The measuring lines are shown only while the blocks are held, so the difference in how far each was pulled is established before the motion starts and then stops competing with it.',
        'Weight is carried by the size of the block rather than by its colour, and all three are drawn the same colour, which keeps them readable as one kind of thing with one property changed.',
        'The rows of dots stay on the screen after the flashes that made them, so a single still moment still carries the ratio.',
        'The page opens with the three already swinging.',
        'No periods, masses or distances are written as numbers anywhere; the ratio is carried by the count of dots.',
      ],
    },

    useWhen: [
      'The article has given the period formula for a spring and the reader still half-believes that a wider pull takes longer. Two blocks pulled to different distances flashing in the same instant, over and over, is what removes that.',
      'The claim being made is that quadrupling the mass only doubles the time, and a case is wanted where the square root shows up as a count — two returns against four — rather than as an arithmetic step.',
    ],

    avoidWhen: [
      'The subject is a swinging bob on a string or a hinged body. Everything here slides along a floor on the end of a spring.',
      'The point is the shape the motion traces against time. Nothing is plotted; what is recorded is the instants of return.',
      'The article is about where the energy sits during the cycle. Nothing here is divided into shares.',
      'The claim concerns a swing so wide that the timing starts to drift. These three keep perfect time with each other for as long as they run.',
      'Values are wanted — seconds, kilograms, newtons per metre. Nothing on the screen is a measurement.',
      'The article is about the pull a stretched spring exerts, or about how that pull grows with the stretch. No forces are drawn.',
    ],

    contrastWith: [
      {
        concept: 'simple-pendulum',
        note: 'Both say what sets the time for one round trip, but of different devices and with opposite roles for weight: on a spring the mass governs the timing, while on a string it drops out of it entirely.',
      },
      {
        concept: 'simple-harmonic-motion',
        note: 'One is about how long a cycle lasts; the other is about the form the motion takes within it, which is the same however long it lasts.',
      },
      {
        concept: 'shm-energy',
        note: 'One counts the moments of return; the other accounts for the energy between those moments.',
      },
      {
        concept: 'pendulum-amplitude-dependence',
        note: 'One says the size of the excursion leaves the timing alone; the other is about the case where that independence is only approximate and fails once the excursion grows large.',
      },
      {
        concept: 'spring-force',
        note: 'One is about how long the bouncing takes; the other is about the pull that drives it, which this one never has to draw.',
      },
    ],
  },
};
