/**
 * refrigerator-heat-pump 개념 선언.
 *
 * 방향 · 기관 다섯 중 하나(가름은 `second-law-of-thermodynamics.ts` 머리 참조).
 * 이 조각은 **일을 사서 거꾸로 보낸다** 를 주장한다 — 들어오는 두 띠가 기계에서 합쳐져
 * 더 굵은 띠로 부엌에 닿고, 전기를 끊으면 가는 띠가 반대 방향으로 샌다.
 * 이쪽만 냉장고와 부엌 · 콘센트 · 쌓이는 띠 굵기 · 끊김과 새어 듦 어휘를 갖는다.
 * 화면에 있는 것은 냉장고 하나뿐이라 열펌프(겨울 집)는 avoidWhen 으로 되돌린다(간극 장부 참조).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const refrigeratorHeatPumpConcept: Aperi21ConceptSource = {
  id: 'refrigerator-heat-pump',
  label: 'Moving Heat Against Its Grain',
  canonicalSim: 'aperi21:refrigerator-heat-pump',

  surface: {
    definition:
      'A machine fed with work so that heat leaves a cold space for a warmer one, which receives the sum of what was taken and what was fed in.',
    exemplarKeywords: [
      'refrigerator',
      'heat pump',
      'how does a fridge make things cold',
      'moving heat from a cold place to a warm one',
      'work must be put in to move heat uphill',
      'why is the back of the fridge warm',
      'coefficient of performance',
      'what happens when you unplug the fridge',
      'the heat delivered is the heat taken plus the work',
      'leaving the fridge door open does not cool the room',
    ],
  },

  briefing: {
    observable: [
      'A fridge on the left whose inside is cold, a machine in the middle, and a warmer kitchen on the right, with a thermometer for each space standing on one shared scale — the fridge column low, the kitchen column high.',
      'A band of heat flows out of the cold inside into the machine, and a band of electrical work comes down into the machine from a socket above it.',
      'A third band leaves the machine and drives its arrowhead into the kitchen, thicker than either of the two going in.',
      'The thicknesses are the amounts: the outgoing band’s lower part lines up exactly with the incoming heat band, with the work’s share stacked on top of it, so the sum is read off as a stacking rather than announced.',
      'Figures ride beside each of the three bands naming the amounts.',
      'Grains flow along every band at the same speed and the same spacing, so a thicker band simply carries more of them abreast — the flow is watched as well as counted.',
      'Heat is one colour wherever it is, going in or coming out, and the electrical work is another. What leaves for the kitchen is not split by colour into a heat part and a work part, because all of it arrives as heat.',
      'Then the electricity is cut: the top of the work band pulls away from the socket, a gap opens, the grains halt where they stand and the bands fade to faint traces.',
      'With the machine stopped a thin band appears running the other way, from the warm kitchen into the cold fridge, its arrowhead pointing into the fridge.',
      'The fridge thermometer climbs above a short mark left behind at the temperature it started from.',
      'The thin leaking band is drawn slim and carries no figure, so it says that heat seeps in without inviting a reading of how fast.',
      'Hot and cold are shown by column heights on one scale rather than by warm and cool colours, and the two spaces are drawn in the same tones.',
    ],

    screen: {
      affordances: [
        'The whole round plays by itself — the machine running first, then the cut, then the seeping — with nothing to press and no amounts to set.',
        'The two inflowing bands are drawn to the same scale as the outflow, which is the only reason their stacking can be read as an addition.',
        'The figures beside the bands withdraw once the machine has stopped, since an amount written on a band that is not flowing would be false.',
        'A short mark is left at the fridge’s starting temperature so the rise can be judged in a still frame instead of having to be remembered.',
        'No performance figure is worked out from the three amounts; the division is left to the prose.',
      ],
    },

    useWhen: [
      'The article has said that heat will not go from cold to hot by itself and that work must be paid to send it there, and the reader wants the payment made visible. Two bands entering and one thicker band leaving is that payment shown as an addition.',
      'The reader is surprised that the back of a fridge is warm, or that a fridge left open warms the room rather than cooling it. The outgoing band being thicker than the one drawn from inside is the reason, in one picture.',
      'The article needs the contrast between a flow that is driven and a flow that happens by itself, and the cut is where both appear on the same screen in turn.',
    ],

    avoidWhen: [
      'The machine in question takes heat in and yields work. Everything here runs the other way, with work bought.',
      'The subject is how much useful effect comes back per unit paid, or a performance figure for the machine. The three amounts are shown but never divided into one another.',
      'The point is what goes on inside — the compressor, the coolant, the strokes and stages. The machine here is a single box the bands pass through.',
      'The article is about heating a house from the cold outdoors in winter. The two spaces here are a fridge and a kitchen, named as such throughout, and the outdoor case is not drawn.',
      'How quickly the fridge warms once it is off is wanted, or by how many degrees. The leaking band carries no amount and the rise is shown only against a starting mark.',
    ],

    contrastWith: [
      {
        concept: 'heat-engine',
        note: 'The same three streams with the arrows turned round — one is fed heat and yields work, the other is fed work to carry heat the way it will not go by itself.',
      },
      {
        concept: 'second-law-of-thermodynamics',
        note: 'One shows the direction things take when left alone; the other shows what has to be bought to go the other way, and what happens the moment the buying stops.',
      },
      {
        concept: 'carnot-cycle',
        note: 'One shows that work must be paid to move heat uphill; the other prices the opposite trade, fixing how much work heat running downhill can be made to yield.',
      },
      {
        concept: 'irreversibility',
        note: 'One asks what it would take to call scattered motion back; the other is a case where the going-back is arranged, paid for, and shown to stop the instant the payment does.',
      },
    ],
  },
};
