/**
 * pascals-principle 개념 선언.
 *
 * 압력 여섯과 이웃하지만 유일하게 **닫힌 유체**를 다룬다 — 가한 압력이 어디에나 같게
 * 전해져 넓이가 N 배인 피스톤이 N 배 힘으로 밀리고, 대신 1/N 만 오른다. 깊이
 * (`hydrostatic-pressure`) · 그릇 모양(`pressure-and-container-shape`) 은 열린 유체의
 * 주장이라 화면이 일부러 뺐다(두 피스톤 높이 차의 ρgΔh 를 넣지 않는다).
 * 이쪽만 전달 · 유압 · 화살표 개수 · 힘과 거리의 맞바꿈 어휘를 갖는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const pascalsPrincipleConcept: Aperi21ConceptSource = {
  id: 'pascals-principle',
  label: 'Pascal’s Principle and the Hydraulic Press',
  canonicalSim: 'aperi21:pascals-principle',

  surface: {
    definition:
      'That a push put into an enclosed fluid reaches every part of it undiminished, so a piston of several times the area is driven with that many times the force and travels that many times less far.',
    exemplarKeywords: [
      'Pascal’s principle',
      'hydraulic press',
      'a car jack',
      'hydraulic brakes',
      'a small force lifting a car',
      'pressure transmitted through a closed fluid',
      'why does the wide piston push harder',
      'force multiplied by the ratio of areas',
      'the big piston hardly moves',
      'an enclosed fluid passes a push on undiminished',
    ],
  },

  briefing: {
    observable: [
      'A U-shaped hydraulic press seen from the side: a narrow cylinder on the left, a cylinder four times as wide on the right, joined below by a channel of water.',
      'A hand’s push comes down on the small piston, marked F.',
      'Pressure arrows stand up under both pistons, every one of them the same length, one for each width of the small piston — one on the left, four on the right.',
      'Those arrows appear before either piston has moved, so the carrying across is not a consequence of the motion.',
      'A load rides on the large piston with 4F written on it.',
      'The small piston then sinks a long way while the large one rises only a quarter as far; ghost outlines mark where each began, and a dimension line grows from each outline to its piston, marked d and d/4.',
      'The water that has left the small cylinder and the water that has arrived under the large one are both picked out in the accent colour — a narrow tall column and a wide thin band, the same amount shaped two ways.',
      'The pressure arrows stay equal to one another all through the stroke.',
      'After a pause the hand lets go, the arrows fade and both pistons settle back to their outlines.',
    ],

    screen: {
      affordances: [
        'One round presses, strokes, holds and releases by itself, and the hold is the longest part, when the count of arrows and the two dimension lines are both standing to be read.',
        'Force is shown as a count of equal arrows rather than as one long arrow, so "the pressure is the same" and "the force is larger" are visible at once instead of competing for the same length.',
        'Arrows are placed under the two piston faces only, so nothing invites a comparison between one part of the fluid and another.',
        'The area ratio comes from one declared figure, and the number of arrows, the width of the wide cylinder, the written names and the caption all follow it together.',
      ],
    },

    useWhen: [
      'The article has said that pressure is passed on undiminished and the reader has heard it as force being passed on undiminished. Four arrows of one length under the wide piston where there was one under the narrow is the correction.',
      'The reader suspects a machine of giving something for nothing, and the moment wanted is the one where the small piston has gone a long way down and the large one has barely risen.',
    ],

    avoidWhen: [
      'The subject is how the pressure differs between two heights inside a fluid. The two pistons sit at different heights here and that difference is left out on purpose so the arrows can be equal.',
      'The article is about a vessel open to the air, where the pressure on the base follows the height of liquid standing above it.',
      'The point is a fluid flowing along a pipe, or a liquid speeding up through a narrowing. The water here only shifts from one cylinder to the other.',
      'Forces or pressures have to be quoted as numbers. Only F, 4F, d and d/4 are written.',
      'The article is about levers, ramps or pulleys and the general trade of force against distance. One machine is drawn here and it is a hydraulic one.',
      'The fluid’s compressibility is at stake, or how a real hydraulic system leaks and loses. The water here is perfectly closed and gives nothing up.',
    ],

    contrastWith: [
      {
        concept: 'pressure-isotropy',
        note: 'One is about two widely separated places in a closed fluid standing at one pressure; the other is about one place and the orientations a surface can take there.',
      },
      {
        concept: 'hydrostatic-pressure',
        note: 'One sets aside the difference in pressure between two heights so that the transmitted push can be shown alone; in the other that very difference is the whole claim.',
      },
      {
        concept: 'pressure-and-container-shape',
        note: 'One has a closed fluid whose pressure is settled by what is pushed in at a piston; the other has open vessels whose base pressure is settled by the height of liquid above.',
      },
      {
        concept: 'mechanical-advantage',
        note: 'Both show force traded against distance, but one has the ratio fixed by an area and carried by a fluid, and the other compares three tools that do it by geometry.',
      },
    ],
  },
};
