/**
 * isobaric-isochoric 개념 선언.
 *
 * 과정 다섯 중 하나(가름은 `pv-diagram.ts` 머리 참조).
 * 이 조각은 **같은 열을 넣을 때 무엇을 고정하느냐** 를 주장한다 — 한 상태에서 두 점이
 * 동시에 떠나 가로와 세로로 갈리고, 넓이는 가로 쪽에만, 온도 상승은 세로 쪽이 더 크다.
 * 이쪽만 나란한 두 실린더 · 추와 핀 · 같은 눈금 두 온도 막대 · `W = 0` 어휘를 갖는다.
 * 같은 끝 상태 · 두 길 견줌(pv-diagram) 과 닫힌 고리(cyclic-process) 는 형제 몫이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const isobaricIsochoricConcept: Aperi21ConceptSource = {
  id: 'isobaric-isochoric',
  label: 'Fixed Pressure Against Fixed Volume',
  canonicalSim: 'aperi21:isobaric-isochoric',

  surface: {
    definition:
      'Two ways of heating one gas by the same amount — pinning its pressure, so it expands and does work, or pinning its volume, which does none and heats it further.',
    exemplarKeywords: [
      'isobaric process',
      'isochoric process',
      'constant pressure versus constant volume',
      'heating a gas at fixed volume does no work',
      'why does a gas have two heat capacities',
      'Cp and Cv',
      'a pinned piston cannot move',
      'gas under a free weight expands as it warms',
      'same heat but a different temperature rise',
      'which arrangement gets hotter',
    ],
  },

  briefing: {
    observable: [
      'One pressure–volume plot on the left with two markers leaving the same starting state at the same instant — one running rightward, the other running straight up.',
      'Beneath the rightward path an area fills in the accent colour as it goes; beneath the upward one nothing fills at all.',
      'Two cylinders stand side by side on the right. The left one carries a weight on a piston that is free to ride up; the right one has its piston held by a pair of pins and it does not move.',
      'Both cylinders sit on heating plates that come on at the same moment and stay on together, each bearing the same mark for heat, so the amounts supplied are plainly matched.',
      'Each marker and each cylinder carries the same words — fixed pressure, fixed volume — so which line belongs to which cylinder never has to be guessed.',
      'Two temperature bars climb from one shared starting mark on one shared scale, and the pinned-volume bar visibly outclimbs the free one.',
      'When the heating stops, the letter for work sits inside the filled area, a mark reading that the work is zero stands beside the upright path, and each bar’s top is labelled with how far it rose.',
      'The closing line names the two rises side by side and says only the sideways path has area beneath it.',
      'The two paths and the two markers are drawn in the same plain ink; the accent colour is spent on the filled area alone.',
      'Temperature is a bar height and nothing more — hot and cold are not given colours of their own.',
      'No pressure or volume numbers, no amount of heat and no quantity of gas appear anywhere.',
    ],

    screen: {
      affordances: [
        'Both cases run at once in a single picture rather than one after the other, so the moment of parting is watched instead of remembered.',
        'Which quantity is pinned is shown by the apparatus itself — a weight free to ride, or a pair of pins — so the constraint is read off the cylinder rather than off a line of words.',
        'The two bars share one starting mark and one scale, which is the only thing that makes their heights comparable at a glance.',
        'A zero mark is placed beside the upright path because an area that stayed empty cannot otherwise be told from an area not yet filled.',
        'The round plays through by itself and begins again with both markers back together at the start.',
      ],
    },

    useWhen: [
      'The article has introduced two different heat capacities for one gas and the reader is wondering why a single substance should need two numbers. Equal heat going in while one bar outclimbs the other, with the shortfall showing up as shaded area, is the reason.',
      'The reader can recite that no work is done at constant volume but has never seen it. An upright path with nothing beneath it, set beside a sideways one with a filled area, is that fact drawn.',
    ],

    avoidWhen: [
      'The article turns on the route taken between two given states, or on two routes costing different amounts. The two cases here set out together and finish nowhere in common.',
      'The change in question is sealed against heat, or the gas cools as it expands. Both cylinders are being heated and both get warmer.',
      'A curved path is wanted, or a temperature held steady along one. Both paths are straight and neither holds the temperature.',
      'A closed cycle is the subject, or what is left after a round trip. Nothing comes back here.',
      'Values are wanted for the heat supplied, the amount of gas, or the final pressure and volume. Only the two temperature rises are written down.',
    ],

    contrastWith: [
      {
        concept: 'pv-diagram',
        note: 'One varies the constraint from a shared start and lets the two end wherever they will; the other fixes both end states and varies only the route between them.',
      },
      {
        concept: 'adiabatic-process',
        note: 'One supplies heat and asks what pinning a quantity does with it; the other supplies none and asks what the gas has to give up instead.',
      },
      {
        concept: 'isothermal-process',
        note: 'Both pin something while a gas changes — one pins pressure or volume and lets the temperature climb, the other pins the temperature and lets both of the others go.',
      },
      {
        concept: 'cyclic-process',
        note: 'One shows two changes parting from one state and never meeting; the other strings changes of exactly these two kinds into a closed loop and asks what survives it.',
      },
    ],
  },
};
