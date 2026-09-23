/**
 * heat-engine 개념 선언.
 *
 * 방향 · 기관 다섯 중 하나(가름은 `second-law-of-thermodynamics.ts` 머리 참조).
 * 이 조각은 **얼마가 버려지는가 · 버릴 곳이 없으면 어떻게 되는가** 를 주장한다 —
 * 띠가 갈리고, 바퀴마다 같은 비로 두 더미가 쌓이고, 찬 열원을 떼면 바퀴가 선다.
 * 이쪽만 두 열원 사이 띠 흐름 · 점이 네모가 됨 · 쌓이는 줄 · 떼어 낸 빈 자리 어휘를 갖는다.
 * 한계의 크기와 그 출처(carnot-cycle) · 실린더 속 과정(과정 다섯) 은 두지 않았다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const heatEngineConcept: Aperi21ConceptSource = {
  id: 'heat-engine',
  label: 'The Share a Heat Engine Must Throw Away',
  canonicalSim: 'aperi21:heat-engine',

  surface: {
    definition:
      'A machine cycling between a hot and a cold store, keeping only part of the heat it takes in as work and passing the rest on to keep running.',
    exemplarKeywords: [
      'heat engine',
      'how much of the heat becomes work',
      'waste heat',
      'why can an engine not use all of its heat',
      'hot reservoir and cold reservoir',
      'the engine dumps heat into the cold side',
      'an engine needs somewhere to exhaust to',
      'only part of the fuel energy turns into motion',
      'heat in, work out, heat rejected',
      'a cycle running between two temperatures',
    ],
  },

  briefing: {
    observable: [
      'A hot store on the left, an engine with a turning wheel in the middle and a cold store on the right, joined by bands whose thickness is the amount of heat.',
      'The band leaving the hot store is the thickest of the three. Inside the engine an upper slice of it bends upward as a thin band of work, and the rest carries straight on to the cold store.',
      'Heat travels along the bands as grains. Ten leave the hot store each turn; three of them change from round dots into squares at the engine and ride the upward band to a pile of work, and seven stay round and settle on the floor of the cold store.',
      'The three that become work are spread through the order of departure rather than bunched at the front, so it never reads as though only the first few are usable.',
      'The wheel turns once as each turn’s worth of grains passes through, and every turn adds one row to the work pile and one row to the cold side, so after three turns three rows of three stand beside three rows of seven.',
      'Figures ride beside each band — the amount taken in, the amount turning upward, the amount carried on — so the split can be named as well as seen.',
      'The accent colour belongs to work alone: the upward band, the square grains, the pile. Heat that is passed on wears the same colour as heat that was taken in, because it is the same stuff.',
      'The two stores differ only in how darkly they are filled, the hot one darker, so hot and cold are not given separate colours.',
      'Then the cold store is pushed away, carrying off everything piled on it and leaving a dashed empty outline in its place.',
      'With it gone no grains leave the hot store at all and the wheel stands still — nothing is jammed and nothing backs up, the machine simply does not run.',
      'The cold store slides back into place and the round begins again.',
    ],

    screen: {
      affordances: [
        'The whole argument plays by itself in one run: the split first, then three turns showing the same split repeat, then the removal.',
        'Nothing can be dragged and the share that becomes work cannot be set, which is deliberate — a control able to raise it to everything would draw the opposite of what is claimed.',
        'The change from heat into work is carried by shape as well as colour, a round grain becoming a square one, so it survives being seen in a still frame.',
        'Counting the rows in each pile stands in for a running total, so no sums are written anywhere.',
        'No percentage is worked out; the figures beside the bands are the amounts themselves and they are never divided into one another.',
      ],
    },

    useWhen: [
      'The article has stated that no engine turns all its heat into work and the reader has taken it for a shortcoming of engineering. Taking the cold store away and watching the wheel stop is what makes it a requirement rather than a defect.',
      'The reader holds efficiency as a formula and needs to see what the formula is dividing — a thick band coming in, a thin one turning upward and a thick one carrying on, all in one picture at one scale.',
    ],

    avoidWhen: [
      'The article is about how good an engine could possibly be, or where the ceiling on that comes from. Neither store is given a temperature here and no limit is worked out.',
      'Work is put in to drive heat the other way, from cold to hot. Everything here flows onward from the hot store.',
      'The point is what goes on inside the cylinder — the strokes, the curves, the area enclosed by a loop. The engine here is a box with a wheel on it.',
      'Two machines are being compared, or a share is being followed along a chain of stages. There is one machine and two stores.',
      'A percentage or a figure for the efficiency is wanted. Only the three amounts appear, and they are never divided.',
    ],

    contrastWith: [
      {
        concept: 'carnot-cycle',
        note: 'One says a share has to be passed on, and shows the machine stopping when there is nowhere to pass it; the other says how large that share must be and where its size comes from.',
      },
      {
        concept: 'refrigerator-heat-pump',
        note: 'The same three streams with the arrows turned round — one is paid in heat and yields work, the other is paid in work to carry heat the way it will not go by itself.',
      },
      {
        concept: 'second-law-of-thermodynamics',
        note: 'One is the rule that change has a direction; the other is the price that rule charges a machine obliged to come back to its start every turn.',
      },
      {
        concept: 'efficiency',
        note: 'One asks what share of an input comes out useful, comparing two machines of unequal size; the other asks why, for an engine fed with heat, that share can never be the whole of it.',
      },
      {
        concept: 'cyclic-process',
        note: 'One takes for granted that a loop leaves work behind and asks what feeding it costs; the other is where that leaving-behind is itself the claim.',
      },
    ],
  },
};
