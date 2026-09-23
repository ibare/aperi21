/**
 * calorimetry 개념 선언.
 *
 * 위험한 짝 셋 중 하나. 주어로 갈랐다 — 이쪽의 주어는 **섞은 결과가 멈추는 자리**다.
 *   thermal-equilibrium  다가가는 과정과 멎음
 *   specific-heat        물질의 성질 — 같은 열에 오르는 폭
 *   calorimetry          **어느 온도에서 멈추는가**, 그리고 그 자리를 정하는 장부
 * 이쪽만 「잃은 열 = 얻은 열 · 가운데가 아니다 · 많은 쪽으로 치우친다 · 칸 수」 어휘를
 * 갖는다. 다가가는 빠르기 · 시간 곡선 · 물질의 차이는 쓰지 않는다 — 두 쪽 다 물이다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const calorimetryConcept: Aperi21ConceptSource = {
  id: 'calorimetry',
  label: 'Where a Mixture Comes to Rest',
  canonicalSim: 'aperi21:calorimetry',

  surface: {
    definition:
      'Locating where a mixture ends up by setting the heat one portion gives up against the heat the other takes in, which lands it nearer the larger portion than midway.',
    exemplarKeywords: [
      'calorimetry',
      'final temperature of a mixture',
      'mixing hot and cold water',
      'heat lost equals heat gained',
      'why is it not just the average of the two temperatures',
      'the mixing temperature problem',
      'm c delta T on both sides of the equation',
      'pouring hot water into a larger amount of cold',
      'weighted toward the bigger mass',
      'working out what temperature the bath ends up at',
    ],
  },

  briefing: {
    observable: [
      'On the left, a cup of darkly shaded water at 80 ℃ empties in droplets into a beaker already holding pale water at 20 ℃, and the darker layer piles on top of the paler one; the depth of shade is the temperature, with the amounts written inside the water as 100 g and 200 g.',
      'On the right stands a temperature axis marked at 80, 50 and 20 ℃, with a bar two squares wide starting at 80 ℃ and one four squares wide starting at 20 ℃, their widths being the two amounts.',
      'As the mixing runs, the upper rectangle grows downward and the lower one grows upward, and at every moment the two hold the same number of squares — so the narrower one has to come down twice as fast as the wider one goes up.',
      'The squares are drawn as separate tiles with gaps between them, so the count is something the reader can do rather than take on trust; both rectangles share their left edge, which puts their widths side by side.',
      'They meet and stop at eight squares each, and a heavy dashed line marked 40 ℃ sits plainly below the 50 ℃ line that marks the midpoint; by then the beaker is one even shade.',
      'A second round swaps the two amounts — 200 g of hot poured into 100 g of cold — and this time the upper rectangle is the wide one, coming down slowly while the narrow lower one climbs fast.',
      'That round stops at 60 ℃, above the midpoint line, so the same axis carries both results and the stopping place has visibly moved across.',
      'The two rectangles are named heat lost and heat gained and drawn in the same colour, and no amount of heat is written as a number anywhere.',
    ],

    screen: {
      affordances: [
        'Two rounds run one after the other and then begin again; nothing has to be pressed, and the second round is what shows that the answer moves when the amounts do.',
        'The midpoint is drawn as a marked line rather than described, so the result being below it in one round and above it in the other is read off directly.',
        'The counting is done in squares of one fixed worth rather than in joules, which keeps the equality between the two rectangles a matter of counting and not of arithmetic.',
        'Both portions are water, so nothing on the screen distinguishes them but how much there is of each and how hot each started.',
        'The screen opens with the pouring already under way.',
      ],
    },

    useWhen: [
      'The article has written down that the heat lost equals the heat gained, and the reader is likely to guess the answer is the average of the two temperatures. Watching a narrow rectangle fall twice as fast as a wide one rises, to keep the counts equal, is where that guess breaks.',
      'The point is that the larger portion dominates the result. The second round, where swapping the two amounts throws the stopping line from below the midpoint to above it, is the evidence for that.',
    ],

    avoidWhen: [
      'The subject is how the two temperatures approach over time, or how the approach slows near the end. Nothing here is plotted against time; the two rectangles simply grow together and stop.',
      'The article needs materials to differ. Both portions are water, and no specific heat is written on the screen.',
      'A change of state is involved — ice added to a drink, steam condensing. Nothing melts, freezes or boils here.',
      'Amounts of heat in joules are wanted, or a calculation to follow. The only quantities written are temperatures and masses; the heat is counted in squares.',
      'The article is about heat leaking away to the surroundings, or about the vessel taking its share. Nothing is lost here — the two rectangles stay equal to the end.',
    ],

    contrastWith: [
      {
        concept: 'thermal-equilibrium',
        note: 'One asks where two portions stop; the other asks how they get there — that the flow is brisk at first, slackens as the gap narrows, and finally ceases.',
      },
      {
        concept: 'specific-heat',
        note: 'One measures the property by feeding materials the same heat and comparing rises; the other assumes the property and uses it to place the answer for a mixture.',
      },
      {
        concept: 'latent-heat',
        note: 'One balances heat against temperature change on both sides of a mixture; the other is the case where heat arrives and no temperature changes at all.',
      },
    ],
  },
};
