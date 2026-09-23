/**
 * ohms-law 개념 선언.
 *
 * 저항 넷은 **무엇이 저항 또는 전류를 바꾸는가**로 갈랐다. 이쪽은 **전압**이다.
 *   ohms-law                   전압을 올리면 전류가 **비례**로 늘고 점들이 원점을 지나는 직선에 놓인다
 *   resistance-and-geometry    **형태**(길이·단면적)가 저항을 정한다
 *   temperature-and-resistance **온도**가 저항을 바꾼다 (금속 ↔ 반도체 반대)
 *   series-parallel-resistors  **연결 방식**이 같은 전지에서 끌어내는 전류를 바꾼다
 * 비례·직선·기울기·원점·I–V 어휘는 이쪽에만 둔다. emf-and-internal-resistance 도 직선이
 * 나오지만 그쪽은 ε 에서 **내려가는** 직선이라 contrastWith 로 갈라 둔다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const ohmsLawConcept: Aperi21ConceptSource = {
  id: 'ohms-law',
  label: "Ohm's Law as a Straight Line Through the Origin",
  canonicalSim: 'aperi21:ohms-law',

  surface: {
    definition:
      'That the current through a fixed resistance grows in proportion to the voltage put across it, so that points taken at several voltages fall on one straight line through the origin, and a larger resistance lays that line flatter.',
    exemplarKeywords: [
      "Ohm's law",
      'V equals I R',
      'current proportional to voltage',
      'straight line through the origin on a current against voltage graph',
      'doubling the voltage doubles the current',
      'what the slope of an I-V graph means',
      'adding cells to a battery makes more current flow',
      'a bigger resistor passes less current at the same voltage',
      'ohmic conductor',
      'resistance as the ratio of voltage to current',
    ],
  },

  briefing: {
    observable: [
      'Two loops stand one above the other on the left, the upper named five ohms and the lower ten, each with a battery built of cells and a zigzag for its resistance.',
      'The two batteries always carry the same number of cells, and a cell is added at each step so the reading goes two volts, four, then six.',
      'Electron grains run round both loops and follow the zigzag through the resistance, each with a tail behind it that lies along the wire rather than cutting the corner.',
      'At every step both flows quicken together and the tails lengthen; at any one voltage the upper loop always runs faster than the lower.',
      'On the right a plane carries current upward and voltage across; at each step the present current of each loop is put down as a point in the accent colour, and the points from earlier steps stay in ink.',
      'The marks along the bottom are the step voltages themselves; the upright axis carries only a letter and no numbers.',
      'At the same voltage the five-ohm point stands at twice the height of the ten-ohm point, and the ten-ohm point at four volts sits level with the five-ohm point at two.',
      'Then two straight lines reach out from the origin, each passing through all three of its own points and on to the far edge, and the ten-ohm line lies visibly flatter.',
      'The resistance labels ride along, first beside the present point and then out at the end of the line.',
      'A small mark names the origin, the points and lines fade, the batteries drop back to one cell and the climb begins again.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; a cell is added, the flow quickens, a point is put down, the lines are drawn, and the run begins again.',
        'Voltage is raised by adding a cell rather than by sliding a value, so one step up is one more cell and one more point, and the steps are always the same three.',
        'The voltage holds steady through each step and changes only at the boundary, so the two loops can be held side by side at a single voltage.',
        'Current is carried entirely by how fast the grains move: their spacing is the same in both loops and at every step, so a faster flow means more current and means nothing else.',
        'Both lines are drawn in the same ink because they are the same kind of thing, and which loop each belongs to is said by its resistance label.',
        'The accent colour is kept for the present point on the plane; earlier points, the lines, the resistances and the batteries stay in ink.',
        'Two separate loops are used rather than one loop with its resistance exchanged, so that the two lines can be compared as lines rather than remembered one after the other.',
      ],
    },

    useWhen: [
      'The article has stated the proportionality and the reader has taken it as a definition rather than a finding. Three points put down one at a time and then found to lie on one straight line through the origin is the evidence the sentence is quietly asserting.',
      'The prose needs two resistances compared at the same voltage, and needs that comparison to survive as a difference of slope rather than as two numbers the reader must hold.',
    ],

    avoidWhen: [
      'The article concerns a component whose line is not straight — a lamp, a diode, anything that heats or switches on. Both loops here are plain resistances and both lines come out straight.',
      'A value is to be worked out in amperes or in ohms. No current is written anywhere and the upright axis carries no scale.',
      'The subject is what makes a resistance large or small, whether by shape, by material or by temperature. Here the two resistances are simply given and never change.',
      'Two resistances are to be joined into one circuit, end to end or side by side. These two loops stay separate and never share a battery.',
      'The battery is to be treated as imperfect, its voltage sagging as more is drawn. The cells here hold their stated voltage through every step.',
      'The subject is the direction convention for current or what the carriers are. A single mark names the grains once; the run is about how fast they go.',
      'The reader is meant to set the voltage themselves. The three steps run by themselves and the points are meant to land on the marked voltages.',
    ],

    contrastWith: [
      {
        concept: 'resistance-and-geometry',
        note: 'One takes the resistance as a given number and asks what raising the voltage does to the current; the other keeps one voltage throughout and asks what the shape of the conductor does to the resistance.',
      },
      {
        concept: 'temperature-and-resistance',
        note: 'One has the resistance holding one value while the voltage is stepped up; the other has the very same conductor changing its resistance with no change of voltage at all.',
      },
      {
        concept: 'series-parallel-resistors',
        note: 'One compares two resistances that each have their own supply; the other joins two resistances into a single circuit and asks what the pair together draws from one supply.',
      },
      {
        concept: 'emf-and-internal-resistance',
        note: 'Both end with points lying on a straight line, but one line rises from the origin as the supply is raised, and the other falls away from the supply voltage as more current is drawn out of it.',
      },
      {
        concept: 'spring-force',
        note: 'Both are proportional relations read off a straight line through the origin — one between the voltage applied and the current that answers, the other between how far a spring is pulled and how hard it pulls back.',
      },
    ],
  },
};
