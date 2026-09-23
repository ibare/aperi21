/**
 * emf-and-internal-resistance 개념 선언.
 *
 * 회로 법칙 셋은 **어디를 보는가**로 갈랐다. 이쪽은 **전원 자신**이다.
 *   emf-and-internal-resistance 전지 안에서 잃는 몫 — 많이 끌어 쓸수록 **단자 전압이 내려간다**
 *   kirchhoffs-current-law      **마디** — 들어온 만큼 나간다
 *   kirchhoffs-voltage-law      **고리** — 한 바퀴 돌면 제자리 높이
 * 기전력·단자 전압·내부 저항·부하 어휘는 이쪽에만 둔다. 직선이 나오는 것은 ohms-law 와
 * 같지만 그쪽은 원점에서 **오르고** 이쪽은 ε 에서 **내려간다**.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const emfAndInternalResistanceConcept: Aperi21ConceptSource = {
  id: 'emf-and-internal-resistance',
  label: 'EMF, Internal Resistance and the Sagging Terminal Voltage',
  canonicalSim: 'aperi21:emf-and-internal-resistance',

  surface: {
    definition:
      'That a source is a fixed driving voltage together with a small resistance inside it, so that the more current the external load draws, the larger the share lost within and the lower the voltage left at the terminals.',
    exemplarKeywords: [
      'EMF and internal resistance',
      'terminal voltage falls under load',
      'why headlights dim when the starter turns',
      'V equals EMF minus I times r',
      'internal resistance of a battery',
      'lost volts inside the cell',
      'open circuit voltage equals the EMF',
      'a battery cannot hold its voltage when heavily loaded',
      'finding internal resistance from the slope of a graph',
      'why a nearly flat battery still reads full with nothing connected',
    ],
  },

  briefing: {
    observable: [
      'A dotted box stands for the source, holding a driving cell and a zigzag of internal resistance in one line, and the two ends of the box are its terminals.',
      'Outside the box an external resistance is fitted, together with a switch.',
      'On the left a bar whose full height, outlined in dots, is the driving voltage; the part filled in the accent colour is the voltage left at the terminals.',
      'On the right a plane carries current across and voltage upward, with the driving voltage marked as a dotted level.',
      'With the switch lifted the grains stand still, the bar is filled right to the top and a single point sits on the upright axis at that level.',
      'The switch closes and the flow starts; a thin hatched slice appears at the top of the bar and the filled part drops by exactly that much.',
      'The same hatched column stands on the plane between the new point and the dotted level.',
      'As the external resistance is exchanged for smaller ones its zigzag shortens, the grains quicken, the hatched slice grows and both the filled bar and the point come down together.',
      'At the heaviest load the external zigzag and the internal one are drawn the same size, and the bar stands half filled and half hatched.',
      'A straight line then reaches from the driving voltage on the axis through all four points to the far edge of the plane.',
      'The bar and the plane share one voltage scale and one baseline, so the filled height and the height of the present point are the same height.',
      'The loss inside is told from the voltage left at the terminals by hatching rather than by any change of colour.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the switch opens and closes, the load is exchanged for a smaller one twice over, the line is drawn, and the run begins again.',
        'The run starts with the switch open, so that the point on the axis fixes what the line sets out from before any current has been drawn.',
        'The load is made heavier by making the external resistance smaller, and the zigzag is drawn in proportion, so that drawing more is something seen in the wiring.',
        'Both zigzags are drawn to one scale, so that at the last step the external and internal resistances are visibly equal and the bar divides in half.',
        'Current is carried by how fast the grains move at fixed spacing, so a faster flow means more current and nothing else.',
        'The accent colour is kept for the voltage at the terminals, which is the filled bar and the present point at the same time.',
        'The source is drawn as a box with its two parts inside it, so that the terminals, and therefore where the sagging voltage is measured, are plain.',
      ],
    },

    useWhen: [
      'The article has written the terminal voltage as the driving voltage minus a loss and the reader treats the subtraction as bookkeeping. A hatched slice taken off the top of a bar whose full height never moves is where it becomes a division of one fixed thing.',
      'The prose needs the open-circuit case to anchor what the driving voltage is, before any current has been drawn at all.',
    ],

    avoidWhen: [
      'The article treats the supply as ideal and fixed. The whole run here is about that assumption giving way.',
      'A value in volts, amperes or ohms is to be read off, or the internal resistance is to be got from the slope. Only the driving voltage and the three load values are written.',
      'The subject is how two or more external components share what the supply delivers. One resistance is fitted at a time here.',
      'Cells joined in series or side by side, or a battery made of several, are the subject. There is one source, and the only thing exchanged is what sits outside it.',
      'The article is about charging a source, its capacity, or how it runs down with use. Nothing here changes from one run to the next.',
      'The reader is meant to choose the load. Three loads are fitted in turn and the run does not wait.',
      'The point is the heat the losses turn into. Nothing here warms; the loss appears only as a missing slice of voltage.',
    ],

    contrastWith: [
      {
        concept: 'ohms-law',
        note: 'Both end with points on a straight line, but one raises the supply and watches the current rise in proportion from the origin, and the other holds the source fixed and watches its terminal voltage fall away as more is drawn.',
      },
      {
        concept: 'kirchhoffs-voltage-law',
        note: 'One divides a single source into the part delivered and the part lost inside it; the other takes that same accounting all the way round the loop and finds every rise and fall cancelling.',
      },
      {
        concept: 'series-parallel-resistors',
        note: 'One is about a supply that cannot hold its voltage when heavily loaded; the other keeps the supply perfect and asks only how the wiring of the load decides what is drawn.',
      },
      {
        concept: 'joule-heating',
        note: 'One shows the loss inside the source as a slice of voltage that never reaches the terminals; the other follows what the loss in a resistance becomes, which is heat.',
      },
      {
        concept: 'wheatstone-bridge',
        note: 'One is undone by drawing current, since the terminal voltage sags the moment any is taken; the other measures by arranging for no current at all to pass through the instrument.',
      },
    ],
  },
};
