/**
 * simple-pendulum 개념 선언.
 *
 * 진자 형제 셋 중 **점 질량 · 작은 흔들림 · 무엇이 박자를 정하는가**를 맡는다.
 *   simple-pendulum                 줄 **길이**가 정하고 추 무게는 상관없다
 *   physical-pendulum               매단 물체에 **크기가 있을 때** 매단 자리가 정한다
 *   pendulum-amplitude-dependence   같은 진자를 **크게 흔들면** 조금씩 늦는다
 * 이쪽만 줄 길이 · 추의 무게 · 「무거운 추가 더 빠른가」 어휘를 갖는다. 각도 · 진폭 ·
 * 매단 자리 · 막대라는 말은 쓰지 않는다. 용수철 쪽(`mass-spring-system`)과는 질량의
 * 역할이 정반대인 것이 갈림의 근거다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const simplePendulumConcept: Aperi21ConceptSource = {
  id: 'simple-pendulum',
  label: 'Simple Pendulum',
  canonicalSim: 'aperi21:simple-pendulum',

  surface: {
    definition:
      'The swinging of a bob hung on a string, whose round-trip time in a narrow swing is fixed by the length of the string alone and is untouched by how heavy the bob is.',
    exemplarKeywords: [
      'simple pendulum',
      'does a heavier bob swing faster',
      'what sets the period of a pendulum',
      'the string length decides the beat',
      'T = 2 pi root L over g',
      'four times the string, twice the swing',
      'why the mass is missing from the pendulum formula',
      'lengthening a clock pendulum to slow it down',
      'a weight on a string swinging back and forth',
      'two pendulums keeping time with each other',
    ],
  },

  briefing: {
    observable: [
      'Three pendulums hang from one beam. The left two have strings of the same length, the right one a string four times as long.',
      'The two left bobs are drawn the same size but one is hollow and one is filled, and the symbols beneath them name the filled one as four times the weight of the other.',
      'A faint dotted line drops straight down from each pivot, marking where that pendulum would hang at rest.',
      'A measuring line on the left gives the short string one name and another on the far right gives the long string a name four times it.',
      'All three are released together from the same angle.',
      'The two left bobs stay side by side for the whole run — stopped at any instant, their strings are parallel, and they cross their dotted lines in the same moment.',
      'Each time a bob completes a round trip and reaches the place it was let go, a ring spreads from it and a dot joins a row lower down.',
      'When the short pendulums have come back the long one is out at the opposite extreme, and it flashes once for every two flashes on the left.',
      'At the end the three stand together where they began and the rows of dots read four, four and two.',
    ],

    screen: {
      affordances: [
        'The release, the swinging, the flashes and the final gathering run on their own and repeat, so the comparison completes without anything being asked for.',
        'The two bobs of different weight are drawn at the same size and told apart by whether they are filled, which keeps the difference between them a matter of weight rather than of bulk.',
        'The two comparisons share the light short pendulum, so each pair differs in exactly one thing — weight on one side, string length on the other.',
        'The rows of dots remain after the flashes that made them, so a still moment carries the ratio of round trips.',
        'The page opens with the three already swinging.',
        'No seconds, angles or lengths are written as numbers; the string lengths are named only as one and four times the other.',
      ],
    },

    useWhen: [
      'The reader has been shown a formula with no mass in it and is not convinced. Two bobs of very different weight sweeping side by side with parallel strings for the whole run is what settles that, and the dots hold the result once the motion is over.',
      'The article wants the square root made visible: the string is four times longer but the beat is only twice as slow, and the counts four and two say that without arithmetic.',
    ],

    avoidWhen: [
      'The thing swinging has size of its own and is hinged rather than hung — a rod, a bat, a board. Every bob here is a small weight on a string.',
      'The point is that the timing drifts when the swing is opened wide. These three are released at one narrow angle and never depart from each other.',
      'The subject is a bob swept round in a horizontal circle rather than back and forth in a plane.',
      'The article turns on the shape of the motion against time, or on where the energy is during it. Nothing here is plotted or divided.',
      'A value is needed — the period in seconds, the length in metres, the strength of gravity. Not one number is written.',
      'The point is the tension in the string or the force that pulls the bob back. No forces are drawn.',
    ],

    contrastWith: [
      {
        concept: 'physical-pendulum',
        note: 'One treats the swinging thing as a weight concentrated at the end of a string, so only the string length matters; the other is about what changes once the body has size of its own and the choice of pivot enters.',
      },
      {
        concept: 'pendulum-amplitude-dependence',
        note: 'One holds the swing narrow and asks what else changes the beat; the other holds everything else fixed and opens the swing, which is exactly the condition the first one leans on.',
      },
      {
        concept: 'mass-spring-system',
        note: 'Both say what sets the time for one round trip, but with opposite verdicts on weight: it governs the spring and drops out of the string.',
      },
      {
        concept: 'conical-pendulum',
        note: 'One is about a bob swinging back and forth in a plane; the other is about the same bob carried round a circle at a steady angle, never reversing.',
      },
      {
        concept: 'simple-harmonic-motion',
        note: 'One asks how long one swing takes; the other asks what form the swinging takes between one end and the other.',
      },
    ],
  },
};
