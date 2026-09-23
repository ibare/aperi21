/**
 * shm-energy 개념 선언.
 *
 * 형제는 `simple-harmonic-motion` 과 `mass-spring-system`. 셋 다 용수철에 매인 추가
 * 오가는 화면이라 definition 이 붙기 가장 쉽다. **무엇을 세는가**로 갈랐다.
 *   shm-energy              몫과 합 — 한 칸이 비운 만큼 다른 칸이 채우고 꼭대기는 그대로다
 *   simple-harmonic-motion  변위의 모양 — 시간 쪽으로 펼치면 사인 곡선이다
 *   mass-spring-system      돌아오는 시각 — 무엇이 주기를 정하는가
 * 이쪽만 운동 에너지 · 퍼텐셜 · 합 · 교환 어휘를 갖는다. 사인 곡선 · 주기 · 질량이라는
 * 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const shmEnergyConcept: Aperi21ConceptSource = {
  id: 'shm-energy',
  label: 'Energy in Simple Harmonic Motion',
  canonicalSim: 'aperi21:shm-energy',

  surface: {
    definition:
      'The steady trade inside an oscillator between kinetic energy and stored elastic energy, each filling exactly what the other gives up so that their total never changes.',
    exemplarKeywords: [
      'energy in simple harmonic motion',
      'kinetic and potential energy in an oscillator',
      'where is the energy when the swing stops at the end',
      'half k x squared and half m v squared',
      'the total energy of an oscillator is constant',
      'energy trading back and forth in a vibrating spring',
      'fastest in the middle, momentarily still at the ends',
      'energy bar for an oscillation',
      'stored energy in a stretched spring becoming motion',
      'conservation of energy in a vibration',
    ],
  },

  briefing: {
    observable: [
      'A block on a frictionless floor is pulled back and forth by a spring anchored to a wall on the left.',
      'An arrow above the block points the way it is travelling and lengthens and shortens with its speed; at the two turning points there is no arrow at all.',
      'Three upright marks stand under the block, at the far left, the middle and the far right of its travel, and the block is watched against them.',
      'To the right stands a single upright bar of fixed height, split into a lower part and an upper part, the lower one drawn in the same colour as the speed arrow and the upper one in the colour of the spring.',
      'The dividing line between the two parts rides up and down as the block moves, while the top of the bar never leaves the line drawn across it.',
      'As the block passes the middle mark the bar is almost entirely the lower part; as the block reaches either end mark and stops, the bar is entirely the upper part.',
      'The two names stay pinned at the foot and the crown of the bar rather than drifting with the dividing line, so when one part is squeezed to nothing its name is left sitting on an empty end.',
      'In one full journey out and back the bar fills and empties twice, once at each crossing of the middle mark.',
      'A line with small overhangs is drawn across the top of the bar and carries a single letter beside it.',
    ],

    screen: {
      affordances: [
        'The sliding, the emptying and filling of the bar and the changing of the sentence beneath run by themselves and repeat, so both exchanges in a cycle come round without being asked for.',
        'The two parts of the bar borrow their colours from the two things that hold the energy — the moving block and the spring — so which part belongs to which needs no legend.',
        'Because there is one bar cut in two rather than two bars side by side, the constancy of the total is the stillness of the top edge rather than a sum to be worked out.',
        'The page opens just after the block has left one end, with the lower part already filling.',
        'No joules, no formulas and no numbers appear; the bar shows shares and nothing else.',
      ],
    },

    useWhen: [
      'The article has said that energy is conserved in an oscillation and the reader is treating that as a bookkeeping claim. A single bar whose crown never moves while the line inside it travels up and down turns the conservation into something held still on the screen.',
      'The writing needs a place where the moment of greatest speed and the moment of greatest stored energy are shown to be different moments of the same cycle.',
    ],

    avoidWhen: [
      'The subject is what shape the displacement takes against time. Nothing is plotted here; the record is a bar of shares beside the block.',
      'The question is how long a cycle takes or what sets its length. Only one oscillator runs and nothing is timed against anything.',
      'Energy is leaving the system — friction, air, a liquid, heat carried away. The floor here takes nothing and the top of the bar never drops.',
      'The energy is gravitational and the body is rising or falling in a field. The stored part here lives in the spring, and the block travels level.',
      'A reader needs the value of the energy, or of the stiffness, or of the amplitude. The bar carries proportions only.',
    ],

    contrastWith: [
      {
        concept: 'simple-harmonic-motion',
        note: 'One divides the energy of the oscillation into two shares at each instant; the other is about what path the displacement itself follows.',
      },
      {
        concept: 'mass-spring-system',
        note: 'One asks where the energy is at a given point of the cycle; the other asks how long the whole cycle takes, and answers with quantities that this one never has to name.',
      },
      {
        concept: 'spring-force',
        note: 'One is about the energy the spring has stored; the other is about the force it exerts while storing it.',
      },
      {
        concept: 'damped-oscillation',
        note: 'One is the case where nothing is lost, so the total is a fixed height; the other is the case where something is lost, which shows up as a total that shrinks by the same factor each cycle.',
      },
    ],
  },
};
