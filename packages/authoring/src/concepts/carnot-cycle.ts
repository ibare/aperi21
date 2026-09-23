/**
 * carnot-cycle 개념 선언.
 *
 * 방향 · 기관 다섯 중 하나(가름은 `second-law-of-thermodynamics.ts` 머리 참조).
 * 이 조각은 **버려야 할 몫의 크기가 어디서 오는가** 를 주장한다 — 받은 열이 0 K 바닥부터
 * 쌓여 있어 차가운 쪽 온도 아래 깔린 몫은 애초에 남을 수 없다. 조작기로 찬 쪽을 끝까지
 * 내려도 그 층은 사라지지 않는다.
 * 이쪽만 온도 세로축 · 0 K 바닥 · 바닥 아래로 가라앉는 기둥 · 빈 점선 자리 · 퍼센트 어휘를
 * 갖는다. 「버릴 곳이 없으면 선다」(heat-engine) 는 형제 몫이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const carnotCycleConcept: Aperi21ConceptSource = {
  id: 'carnot-cycle',
  label: 'Where the Ceiling on Engine Efficiency Comes From',
  canonicalSim: 'aperi21:carnot-cycle',

  surface: {
    definition:
      'The most any engine between two fixed temperatures can keep, seen as heat stacked from absolute zero of which all that lies below the colder temperature must be given back.',
    exemplarKeywords: [
      'Carnot cycle',
      'maximum possible efficiency',
      'ideal heat engine',
      'one minus the cold temperature over the hot one',
      'why is efficiency limited by the two temperatures',
      'temperature entropy diagram',
      'the four strokes of the Carnot cycle',
      'even a perfect engine gives heat back',
      'lowering the cold side temperature',
      'no friction and still not a hundred percent',
    ],
  },

  briefing: {
    observable: [
      'A picture whose upright direction is temperature, with a floor line drawn at absolute zero and the sideways direction running rightward with no scale on it.',
      'Two dashed lines across the picture mark the hot and the cold temperature, each carrying its value.',
      'A marker traces four strokes. Along the hot line it runs rightward and the region beneath it fills with grey, stacked all the way down from that line to the zero floor — that filled region is the heat taken in.',
      'It then drops from the hot line to the cold line with nothing added or taken.',
      'Along the cold line it travels back leftward, and as it passes, the columns of grey beneath it turn to the accent colour and sink down through the floor and out of the picture. Leaving through the floor, rather than merely fading, is what makes it a quantity actually going away.',
      'It then climbs from the cold line back to the hot line and the loop is closed.',
      'What is left is the grey block lying above the cold line, with a dashed empty outline where the sunken part used to be.',
      'Two figures are written as percentages of the heat taken in — the share left as work, and the share that drained away.',
      'The reason the drained share cannot be nothing is on the screen rather than in the wording: the heat was stacked upward from zero, so whatever sat under the cold line was always going to be under it.',
      'The accent colour is spent only on what leaves — the sinking columns, the dashed empty place, the figure for the drained share. What was taken in and what is left as work are the same grey, because the work is part of what was taken in.',
      'No entropy scale, no absolute amounts of heat, and no pressure or volume appear anywhere.',
    ],

    screen: {
      affordances: [
        'A slider sets the colder of the two temperatures in steps, while the hot side stays where it is.',
        'Dragging it down thins the sinking layer and enlarges the work share, and the figures, the dashed lines and the shape of the picture all move together at every setting.',
        'At the very lowest setting the sinking layer is thin but still plainly there, which is the thing to try for and fail at.',
        'The hot side is fixed so that the shares always come out as whole percentages with nothing rounded, which keeps the figures trustworthy as the slider moves.',
        'Nothing has to be touched at all: the four strokes play through by themselves and the argument is complete without the slider being used.',
      ],
    },

    useWhen: [
      'The article has given the efficiency of an ideal engine as one minus a ratio of two temperatures and the reader wants to know where the subtraction comes from. Heat stacked from absolute zero, with the part beneath the cold line unable to stay, is that subtraction drawn.',
      'The reader suspects the losses are friction and leakage that better engineering would remove, and what is needed is a machine with neither, still handing a share back. Pushing the cold side down as far as it will go and finding a layer still leaving is what settles that suspicion.',
    ],

    avoidWhen: [
      'The subject is what a real engine actually does with its fuel, or how much it throws away in practice. Nothing here is a real machine and no amounts are given.',
      'The article works in pressure and volume, or wants the loop drawn there. The upright direction here is temperature, and heat given back is not an area one could see on a pressure–volume loop.',
      'Work is bought to drive heat from cold to hot. All four strokes here serve an engine taking heat in and yielding work.',
      'A cycle is wanted whose legs run at fixed pressure or fixed volume. Every stroke here is either at a fixed temperature or with nothing exchanged.',
      'The point is that a machine needs somewhere to exhaust to at all. That there is a cold side is assumed here; what is argued is what its temperature costs.',
    ],

    contrastWith: [
      {
        concept: 'heat-engine',
        note: 'One is that a share must be given back, and that a machine with nowhere to give it stops; the other is how large that share has to be once the two temperatures are named.',
      },
      {
        concept: 'adiabatic-process',
        note: 'One is a single stroke with the heat path sealed; the other joins two such strokes to two at fixed temperature and asks what the closed loop is obliged to surrender.',
      },
      {
        concept: 'cyclic-process',
        note: 'One asks whether a round trip leaves anything at all; the other asks how much of what was taken in could possibly have been left.',
      },
      {
        concept: 'second-law-of-thermodynamics',
        note: 'One says change runs one way; the other puts a number on what that costs — a ceiling no engine between two temperatures can pass.',
      },
      {
        concept: 'efficiency',
        note: 'One is the share of an input that comes out useful, for any machine at all; the other is why, for heat drawn between two temperatures, that share meets a ceiling no workmanship can raise.',
      },
    ],
  },
};
