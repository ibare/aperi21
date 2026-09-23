/**
 * conservation-of-mechanical-energy 개념 선언.
 *
 * 주제 id 는 `conservation-of-mechanical-energy`, 조각 등록 키는 `aperi21:ramp-energy` 다
 * (`docs/topics/topics.yaml` 의 `sim` 값 그대로).
 *
 * 위험한 형제와 갈린 자리 —
 *   conservation-of-mechanical-energy  **낙차 하나가 도착 속력을 정한다** — 길이 달라도, 걸린 시간이 달라도
 *   work-energy-theorem                밖에서 해 준 일이 끝 속력을 정한다 (수평 바닥, 외부 밀기)
 *   energy-dissipation                 총량이 유지되지 **않을** 때의 행방
 *   conservative-force                 힘이 한 일의 누적이 경로에 무관하다는 것 자체
 * 이쪽만 「먼저 도착한 것과 빠르게 도착한 것은 다르다」 · 「간격이 굳는다」 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const conservationOfMechanicalEnergyConcept: Aperi21ConceptSource = {
  id: 'conservation-of-mechanical-energy',
  label: 'Conservation of Mechanical Energy',
  canonicalSim: 'aperi21:ramp-energy',

  surface: {
    definition:
      'The rule that with no friction the store held in height turns wholly into motion, so that bodies descending the same drop by different routes end up moving alike however long each took.',
    exemplarKeywords: [
      'conservation of mechanical energy',
      'do steeper slopes make you arrive faster',
      'same drop same speed at the bottom',
      'the total of potential and kinetic energy stays the same',
      'arriving first is not the same as arriving faster',
      'speed at the bottom of a ramp',
      'height turning into speed',
      'why the shape of the slope does not change the final speed',
      'frictionless slides from the same height',
      'energy is neither gained nor lost along the way',
    ],
  },

  briefing: {
    observable: [
      'Three balls of the same size and the same colour leave the same height at the same instant, each on its own lane, down a differently shaped slope onto a level runway that all three share.',
      'A dashed line at the left of each lane marks the drop, so the three starts are visibly at one height even though the lanes are stacked.',
      'The slopes differ in where they are steep rather than in overall tilt — the top route falls away early and its ball reaches the flat first, the bottom route saves its steep part for the end and its ball arrives last.',
      'A line in the accent colour joins the three balls. While any of them is still descending its shape changes from moment to moment.',
      'Once all three are on the runway that joined line stops changing shape entirely and simply slides to the right, keeping the same form — the gaps have frozen.',
      'A dot is dropped behind each ball at equal intervals of time. On the slopes the dots bunch and then open out; on the runway all three rows are equally spaced, and the three rows are spaced alike.',
      'Because the lanes are stacked one above the other, the three rows of dots can be read down a single vertical line with no ruler and no scale.',
      'The three routes start at the same horizontal position and end at the same one, so nothing about the final gaps can be blamed on where a slope happened to stop.',
      'When all three have run off the screen the whole scene returns to the start and runs again.',
      'No speeds, times or heights are written anywhere, and no axes or grid are drawn.',
    ],

    screen: {
      affordances: [
        'A handle on each lane can be dragged up and down to set the starting height, and all three move together, so the three drops stay equal whatever height is chosen.',
        'While a handle is held the balls wait at the start line, and on letting go all three set off together from the new height — the drop is never changed part way down a run.',
        'Lowering the drop pulls the spacing of all three rows of dots in together, and the three rows still match each other, which is how the claim stops being about one particular height.',
        'The run opens with the descent already under way rather than with three balls waiting at the top.',
        'The accent colour is kept for the joining line alone, so what has frozen and what is merely scenery need no legend.',
      ],
    },

    useWhen: [
      'The reader has watched one ball reach the bottom before the others and has fused arriving first with arriving faster. The joining line that keeps changing shape and then stops is what prises the two apart.',
      'A passage states that only the drop decides the speed at the bottom, and a case is wanted where the reader can set a different drop and find the statement still holding.',
    ],

    avoidWhen: [
      'Friction, air resistance or anything that drains the total is part of the article. These routes are frictionless by construction and the total never falls.',
      'The energy comes from an outside push, a motor or a hand doing work on the body. Nothing pushes here; each ball is simply released.',
      'The subject is how much is stored at a given height, or that the store is proportional to height. No store is drawn or measured here — only how the balls come out at the bottom.',
      'The point is how much energy a body at a stated speed holds, or the square in that quantity. No comparison of energies at different speeds is made.',
      'The article needs the time taken, or which route is quickest. The routes deliberately differ in arrival time, and that difference is the thing being set aside rather than studied.',
      'Values are wanted — a speed at the bottom, a height, an energy. Nothing numeric is written.',
      'Rolling, spin or a body turning as it descends is the theme. These are drawn simply as balls sliding along their routes.',
    ],

    contrastWith: [
      {
        concept: 'work-energy-theorem',
        note: 'One is about a body left to itself, where a drop already held turns into speed; the other is about work delivered from outside deciding the speed a body ends with.',
      },
      {
        concept: 'gravitational-potential-energy',
        note: 'One shows the total holding fixed while it changes form along a route; the other shows how the store is filled in the first place and that it is proportional to height.',
      },
      {
        concept: 'energy-dissipation',
        note: 'One is the case where nothing is taken out and the total stays whole; the other is what happens to the total once friction begins taking a share.',
      },
      {
        concept: 'conservative-force',
        note: 'One follows bodies and their speeds and finds the outcome route-blind; the other follows the running work of a single force and finds the same blindness in the tally.',
      },
      {
        concept: 'potential-energy-curve',
        note: 'One holds a total fixed and asks how fast a body ends up going; the other varies the total on purpose and asks how far a body is allowed to travel before it turns back.',
      },
      {
        concept: 'free-fall',
        note: 'One is about routes of different shapes delivering the same speed from one drop; the other is about bodies of different weights falling alike when there is no route at all.',
      },
    ],
  },
};
