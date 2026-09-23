/**
 * rocket-equation 개념 선언.
 *
 * 형제는 `explosion-and-recoil`. **한 번인가 계속인가**로 갈랐다.
 *   rocket-equation       같은 양 · 같은 빠르기로 버리는데 **뒤 칸이 더 큰 속도를 붙인다**
 *                         — 먼저 태운 칸은 아직 실린 연료까지 밀어야 했다
 *   explosion-and-recoil  한 번 갈라진 결과 — 두 속력의 비가 질량의 역비
 * 이쪽만 계속 버림 · 실린 연료 · 「연료에 비례하지 않는다」 어휘를 갖는다. 화면에 식도
 * 수도 없어 식 · 값을 요구하는 글은 avoidWhen 으로 되돌린다(간극 장부 참조).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const rocketEquationConcept: Aperi21ConceptSource = {
  id: 'rocket-equation',
  label: 'Speed Bought by Throwing Mass Away',
  canonicalSim: 'aperi21:rocket-equation',

  surface: {
    definition:
      'Speed gained by throwing mass backward, where equal loads thrown at equal speed buy steadily more of it, because each earlier load had to shove the fuel still aboard as well.',
    exemplarKeywords: [
      'rocket equation',
      'Tsiolkovsky equation',
      'why rockets need so much fuel',
      'delta-v',
      'burning fuel in order to push the remaining fuel',
      'mass ratio',
      'the last tank of fuel is worth more than the first',
      'exhaust velocity',
      'speed gained is not proportional to fuel burned',
      'why the gain comes out as a logarithm',
    ],
  },

  briefing: {
    observable: [
      'Eight fuel cells of equal width sit in the body of a rocket, so that equal amount is said by equal width.',
      'Directly beneath each cell stands a bar for the speed that cell added, and since the widths are all the same the only thing that can differ between the bars is their length.',
      'The bars step upward from left to right, the last of them roughly four times the length of the first.',
      'A dotted line joins the cell now burning to its own bar, so each of the eight is named as it happens.',
      'The view rides with the rocket, so the rocket holds still and the stars stream backwards; each star is drawn as a stroke whose length is the speed at this moment, which makes the present speed readable from a single still frame.',
      'Every time a cell is finished the strokes lengthen by one step, and the steps themselves get bigger toward the end.',
      'The exhaust is drawn the same thickness, the same speed and the same amount for every cell, so nothing about the burning itself can be blamed for the difference.',
      'There is no ground and no horizon — deep space, with nothing else acting on the rocket.',
      'One label to the left of the row of bars says what the bars are; nothing else on the screen carries a number or a word.',
      'The bar still growing is briefly shorter than the one before it, and the dotted line is what says it is not finished.',
      'At the end the bars fade and the cells fill again, and the whole thing begins once more.',
    ],

    screen: {
      affordances: [
        'The burning of the eight cells, the holding of the finished row of bars and the refilling run in order and then begin again; nothing has to be pressed.',
        'The cells and their bars share the same left-to-right positions, which ties each bar to its cell by place rather than by a legend.',
        'Arrival is partway through the fifth cell, so several bars are already standing and the stepping can be seen before any waiting.',
        'The accent colour is kept for the speed a cell added, and the fuel keeps one colour whether it is still in a cell or already streaming out behind.',
        'Nothing is numbered, so what is compared is the length of one bar against another on a shared baseline.',
      ],
    },

    useWhen: [
      'The reader has the rocket equation and cannot see where its shape comes from. The bars stepping up while the cells stay equal is the reason, laid out one cell at a time.',
      'The article claims that speed gained is not proportional to fuel burned, and a case is wanted where the equality of the loads is visible so that the inequality of the results has nowhere else to come from.',
      'The article needs the present speed readable at a glance while the argument runs, and the star strokes give it without a dial.',
    ],

    avoidWhen: [
      'The subject is a single parting of one body into two, and the two speeds that follow.',
      'The article involves gravity, air, a launch from a planet, or losses on the way up. There is nothing here but the rocket and what it throws.',
      'The point is thrust as a force, or that the exhaust pushes back on the rocket. Nothing here is drawn as a force and the exhaust is identical every time.',
      'The article is about staging, engines, or the design of real launchers. There is one body and eight identical cells.',
      'Values are wanted — a delta-v figure, an exhaust speed, a mass ratio to compute. Not one number is written.',
      'The article needs the equation itself set out, or its logarithm derived on screen. No formula appears anywhere.',
    ],

    contrastWith: [
      {
        concept: 'explosion-and-recoil',
        note: 'One throws the mass away in one go and reads off the two speeds; the other throws it away load by load and is about how much each successive load is worth.',
      },
      {
        concept: 'conservation-of-momentum',
        note: 'One is the rule that what is thrown backward must be paid for forward; the other spends that rule eight times over and looks at what the payments add up to.',
      },
      {
        concept: 'newtons-third-law',
        note: 'One is about the pairing of the two pushes; the other takes the pairing for granted and asks how much speed each identical throw ends up buying.',
      },
    ],
  },
};
