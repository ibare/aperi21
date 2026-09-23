/**
 * ideal-gas-law 개념 선언.
 *
 * PVT 셋 중 하나. 셋 다 압력 · 부피 · 온도라 **무엇을 묻는가**로 갈랐다.
 *   ideal-gas-law  **셋의 묶임** — 하나를 붙들고 하나를 바꾸면 남은 하나가 정해진 배수로 따라간다
 *   boyles-law     **곱** — 온도가 같으면 P×V 넓이가 남는다
 *   charles-law    **직선과 되이음** — 압력이 같으면 곧게 늘고, 이어 보면 한 점에 모인다
 * 이쪽만 붙듦(자물쇠) · 세 막대 · 배수 · 세 번을 갈아 가며 어휘를 갖는다.
 * 곡선 · 넓이 · 직사각형 · 곧은 선 · 모이는 점은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const idealGasLawConcept: Aperi21ConceptSource = {
  id: 'ideal-gas-law',
  label: 'Which Quantity Follows When One Is Held',
  canonicalSim: 'aperi21:ideal-gas-law',

  surface: {
    definition:
      'Pressure, volume and temperature of a gas are tied so that holding any one of them still and altering a second forces the third to move by a settled multiple.',
    exemplarKeywords: [
      'ideal gas law',
      'PV = nRT',
      'how are pressure volume and temperature related',
      'combined gas law',
      'keeping one quantity fixed and changing another',
      'what happens to pressure if I heat a sealed container',
      'the third quantity has no choice',
      'gas equation of state',
      'isothermal isobaric isochoric',
      'three quantities and one relation',
    ],
  },

  briefing: {
    observable: [
      'A single cylinder with a piston runs the same errand three times, starting each time from the same state and returning to it.',
      'Three bars stand to the right, marked `P`, `V` and `T` beneath them, each showing what it is now as a multiple of what it was at the start; a dotted line across them marks that starting height.',
      'Each run begins with a padlock appearing over one bar, and that bar then stays on the dotted line while the other two move.',
      'In the first run the temperature is locked and the piston is pushed in until the gas column is halved; the pressure bar rises to twice the line.',
      'In the second the pressure is locked, the piston is left free, and the plate under the cylinder is heated until the absolute temperature is doubled; the piston is driven out and the volume bar doubles with it.',
      'In the third the piston is pinned so the volume is locked, and the same heating doubles the pressure bar instead.',
      'A multiple is written above each of the two bars that moved once the change is finished, and the padlock and the writing fade as the cylinder returns to its starting state.',
      'Molecules drift in the cylinder throughout: squeezing the column crowds them into a shorter space without lengthening their trails, and heating lengthens the trails.',
      'The heating plate glows only while heat is going in, and is a plain hatched plate otherwise.',
    ],

    screen: {
      affordances: [
        'The three runs follow one another and then begin again; nothing has to be pressed.',
        'The bar that moves on its own is worked out from the state of the gas at every instant rather than written in, so a bar landing on twice the line is a result and not a caption.',
        'All three bars are the same colour because all three measure the same thing — how many times the starting value — and the letters beneath say which is which.',
        'No absolute pressures, volumes or temperatures are shown anywhere; the dotted starting line is the only reference, and doubled height is read against it.',
        'The padlock is what carries “this one is being held”, so each run is legible as a separate condition rather than as three unrelated pictures.',
      ],
    },

    useWhen: [
      'The article has given the gas relation as a single equation and the reader cannot tell what it licenses. Locking one letter at a time and watching which of the other two is forced to follow is what turns the equation into three usable statements.',
      'The reader has conflated “heating a gas expands it” with “heating a gas raises its pressure” and needs the two cases set apart by what was held — a free piston in one, a pinned one in the other.',
    ],

    avoidWhen: [
      'The whole article is one of the three conditions and the claim rests on the shape of a curve or the extension of a line. Each condition is shown here only long enough to say which quantity followed.',
      'A graph is wanted, or a point moving along one. Nothing here is plotted; the reading is three upright bars against a line.',
      'Real values in kilopascals, litres or kelvin are to be quoted. Only multiples of the starting value appear.',
      'The article is about pressure arising from molecules striking a wall. Molecules drift in the cylinder here as background, and nothing counts or weighs their blows.',
      'The gas is to be shown as non-ideal, condensing, or leaking. The amount of gas never changes and the relation never breaks.',
      'The point is heat being spent — on warming the gas or on shifting the piston. Nothing here is accounted for as energy.',
    ],

    contrastWith: [
      {
        concept: 'boyles-law',
        note: 'One says that with the temperature held a pressure and a volume are forced to trade; the other says what survives that trade, namely their product.',
      },
      {
        concept: 'charles-law',
        note: 'One shows the volume following the temperature by the same multiple and stops there; the other follows that same case as a straight line and asks where the line points when it is continued backwards.',
      },
      {
        concept: 'kinetic-theory-of-gases',
        note: 'One treats pressure, volume and temperature as three quantities with a rule between them; the other asks what pressure is made of before any rule is stated.',
      },
      {
        concept: 'first-law-of-thermodynamics',
        note: 'One asks where the gas ends up when something is changed; the other asks what the heat that was put in was spent on getting there.',
      },
    ],
  },
};
