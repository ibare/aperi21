/**
 * normal-modes 개념 선언.
 *
 * 「두 진자가 주고받는」 형제 셋 중 **분해**를 맡는다.
 *   normal-modes         뒤섞인 흔들림 = **정해진 모양 몇 개의 합**. 모양마다 제 박자
 *   coupled-oscillators  흔들림이 **옆으로 옮겨 갔다 되돌아온다**
 *   beats-in-oscillation 가까운 **두 진동수의 합**이 부풀었다 잦아든다
 *
 * 이쪽만 「모양 · 나눈다 · 더한 것이다 · 어느 모양이 들어 있나」 어휘를 갖는다.
 * 「넘어간다 · 몫 · 합이 그대로」(coupled-oscillators)와 「부푼다 · 차이」
 * (beats-in-oscillation)는 쓰지 않는다. 화면은 흔들림을 **사슬 하나**로 두고 아래에
 * 모양 다섯 줄을 나란히 둔다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const normalModesConcept: Aperi21ConceptSource = {
  id: 'normal-modes',
  label: 'Normal Modes',
  canonicalSim: 'aperi21:normal-modes',

  surface: {
    definition:
      'The fixed shapes a many-part system can vibrate in, each holding its shape while swelling and shrinking at its own single rate, so that any tangled motion of the system is these shapes added together.',
    exemplarKeywords: [
      'normal modes',
      'mode shapes of a system',
      'a chain of masses on a string',
      'the fundamental and the higher modes',
      'each mode has its own frequency',
      'breaking a vibration into modes',
      'superposition of mode shapes',
      'which modes are present depends on where you pluck',
      'a complicated vibration is a sum of simple ones',
      'degrees of freedom and how many modes there are',
      'modes of a discrete system',
    ],
  },

  briefing: {
    observable: [
      'Five beads sit in a row on a line stretched between two walls, and the whole row shakes in a way with no pattern to it — the beads are not in step and the row never repeats a shape.',
      'Below the row stand five more rows, one under another, each showing a different simple shape the same five beads can take: one long hump, then one up and one down, then three alternations, and so on up to every bead against its neighbour.',
      'Between the tangled row and the five below it, and between each of the five, small signs are written so the whole picture reads as one row being equal to the five added together.',
      'Each of the five shapes keeps its own shape exactly — the humps never wander or change place. What changes is only how big it currently is, swelling out and back through a dashed outline that marks its largest size.',
      'Each of the five swells and shrinks at its own rate: the top shape goes slowly and each one below it goes faster, which is visible as the shapes below cycling several times while the top one does it once.',
      'To the right of each shape a line runs out recording how big that shape has been over the last few seconds, and the five records have visibly different wave spacings, one above another.',
      'Any bead can be pulled up or down and let go. The row then shakes tangled again, and the five shapes below take up whatever amounts the pulled shape contained.',
      'Pulling the middle bead leaves some of the five completely flat, and the record lines of those stay as straight lines — which shapes are in the motion depends on where the row was disturbed.',
      'While a bead is being held, the row is a still bent shape, and the five below already show the amounts that bent shape is made of before anything has been released.',
      'A line of text below changes to say how many of the shapes the current motion is made of.',
    ],

    screen: {
      affordances: [
        'The row is already shaking when the reader arrives, a moment or two after a bead was released.',
        'Any of the five beads can be picked up and dragged along its own upright track and let go; the beads only move up and down, and the amount is held to a set of steps.',
        'Releasing a bead restarts the motion from exactly the shape it was let go in, so the reader can choose the starting shape and read off which of the five it contained.',
        'The five shapes are laid out in one column under the row with the same horizontal spacing as the beads, so a hump below sits directly under the bead it belongs to.',
        'The accent colour is kept for one thing — how much of a given shape is in the motion right now — and both the shape drawings and the records use it.',
        'The dashed outline around each shape stays the same size, which is what lets a swelling be read as a fraction of something rather than as an unbounded growth.',
        'There are no axes, no scale marks and no figures anywhere.',
      ],
    },

    useWhen: [
      'The article has stated that a complicated vibration can be broken into simple ones and the reader is taking that as an article of faith. The tangled row being written as five shapes added, each visibly holding its own form, turns it into something watched.',
      'The point to be made is that the shapes belong to the system while what the system is doing on any occasion depends on how it was started. Choosing where to pull a bead and seeing some shapes stay flat is what separates the two.',
      'The article needs each mode to have its own rate, and a case is wanted where five different rates are on view at once in the same frame.',
    ],

    avoidWhen: [
      'The subject is a motion handed back and forth between two bodies. Nothing crosses over here; each of the five shapes swells on its own schedule.',
      'The article is about two close frequencies added into one record that swells and fades. Five rates are shown here at once and none of them is set against another.',
      'What is wanted is an outside rhythm applied to the system to find which part answers. Nothing drives this row — it is started once by hand and left alone.',
      'A continuous string, a vibrating column, or how the modes of such a thing are spaced is the point. This row is five separate beads.',
      'The article needs frequencies, mode numbers, or the ratios between them as values. No numbers are written anywhere.',
    ],

    contrastWith: [
      {
        concept: 'coupled-oscillators',
        note: 'One says a tangled motion is a set of fixed shapes laid over each other; the other watches a swing cross from one body to the other and back, which is what the overlaying of two such shapes looks like from the outside.',
      },
      {
        concept: 'beats-in-oscillation',
        note: 'Both put two rhythms together, but one breaks a motion apart into shapes belonging to the system, while the other adds two rhythms up and reads how fast the result swells.',
      },
      {
        concept: 'resonance',
        note: 'One is about the rhythms a system already holds, found by disturbing it and letting go; the other is about an outside shaking arriving and picking out the body that agrees with it.',
      },
      {
        concept: 'vector-decomposition',
        note: 'Both split one thing into parts chosen in advance, but one splits a motion into the shapes a system can vibrate in, while the other splits a single arrow into directions the reader picks.',
      },
    ],
  },
};
