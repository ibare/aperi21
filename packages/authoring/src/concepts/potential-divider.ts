/**
 * potential-divider 개념 선언.
 *
 * 저항 둘을 잇는 이웃들과 **무엇을 묻는가**로 갈랐다. 이쪽은 **사이에서 꺼내는 전압**이다.
 *   potential-divider         접점이 가른 **길이의 비**대로 전압이 나뉜다 — 옮기면 꺼내는 값이 따라 온다
 *   series-parallel-resistors 이어 놓은 쌍이 전지에서 **얼마를 끌어내는가**
 *   kirchhoffs-voltage-law    고리를 한 바퀴 돌면 전위가 **제자리로 돌아온다**
 *   thermistor-and-ldr        한쪽 저항이 **바깥 세계**를 따라 저절로 변한다
 *   wheatstone-bridge         **0 이 되게 맞춰** 모르는 저항을 찾는다
 * 이쪽만 접점 · 미끄러짐 · 몫 · 비 어휘를 갖는다. 감지기 · 써미스터 어휘는 두지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const potentialDividerConcept: Aperi21ConceptSource = {
  id: 'potential-divider',
  label: 'Tapping Off a Share of the Supply Voltage',
  canonicalSim: 'aperi21:potential-divider',

  surface: {
    definition:
      'That a supply put across a length of resistance is shared out in the ratio of the two parts a tapping point divides it into, so sliding that point takes off a voltage in proportion to the part below it.',
    exemplarKeywords: [
      'potential divider',
      'voltage divider',
      'sliding contact along a resistance wire',
      'potentiometer with a wiper',
      'getting three volts out of a twelve volt supply',
      'voltage split in the ratio of the resistances',
      'tapping off part of a supply',
      'volume control knob',
      'rheostat and slider',
      'the middle point between two resistors',
      'how much voltage is across each of two resistors in a line',
    ],
  },

  briefing: {
    observable: [
      'A thick even line of resistance runs between two lettered ends with a battery across it, so the whole of the supply is laid along that one length.',
      'A pointed contact stands on the line and divides it into two parts, each part carrying its own name beneath it.',
      'A dial above the line reads the voltage between one end and the contact, with a bright arc running from zero out to the needle.',
      'To the right a panel is drawn to exactly the width of the line, with the potential climbing evenly across it from one end to the other, and only the two end values written.',
      'At the contact the climb is cut into two heights: the lower one drawn as a bright bar, the upper one as a pale grey bar.',
      'The contact slides along the line, the two part names travel with it, and the needle, the arc and the bright bar all grow together as it goes.',
      'At the halfway stop the two parts are the same length, the two bars on the panel stand at the same height, and the needle sits at half the supply.',
      'At the three-quarter stop one part is three times the other and the bright bar stands three times the pale one.',
      'Sliding the contact back shrinks the bright bar and brings the needle down again, and the run begins once more at the first stop.',
      'A point on the sloping line marks the contact in the same colour the contact itself has, at the same fractional place along the panel as along the resistance line.',
      'No resistance value and no current is written anywhere; the parts of the line and the heights on the panel are the whole account, and only the two supply ends and the needle carry figures.',
      'Because the line is of even thickness, the two parts stand for their resistances by their lengths alone.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the contact slides between three stops and returns, and the run repeats.',
        'One long length of resistance with a sliding contact is used rather than two separate resistances, so the ratio is a comparison of lengths rather than of numbers.',
        'The panel is set to the same width as the resistance line, so a place along the line and a place along the panel are the same place.',
        'The accent colour is spent entirely on the voltage being tapped — the arc on the dial and the lower bar on the panel; the upper share is a pale grey bar and carries no figure.',
        'The two shares are told apart by where they sit and by the marks on them rather than by colour.',
        'The dial reads a declared value at each of the three stops; while the contact is sliding the needle shows a rounded value on its way.',
        'Only the two ends of the climb are numbered on the panel, so the shares there are compared as heights and the one number is read off the dial.',
      ],
    },

    useWhen: [
      'The article has given the rule for splitting a supply between two resistances, and the reader has taken it as arithmetic. A single length of resistance cut in two by a movable contact turns the ratio into two lengths that can simply be looked at.',
      'The prose needs the tapped voltage to be seen following the contact continuously rather than jumping between worked cases, since the needle and the bar rise together all the way along.',
    ],

    avoidWhen: [
      'The subject is what the pair of resistances draws from the supply, or how arranging them differently changes the total. The current is never mentioned here and the supply never changes.',
      'The article is about a component in the divider that changes by itself with warmth or with light. Both parts here are plain resistance and only the contact moves.',
      'The point is that something connected across the output disturbs the split. Nothing is connected to the output but an instrument that takes nothing.',
      'The article is about summing rises and falls around a whole loop, or about the signs one meets going round. Only one share is read and only from one end.',
      'A resistance is to be found by balancing an arrangement against a known one until nothing is read. The reading here is never brought to zero and nothing is unknown.',
      'Values in ohms or in amperes are to be worked through. Only the supply ends and the tapped voltage carry figures.',
      'The reader is meant to drag the contact themselves. It travels between three fixed stops on its own.',
    ],

    contrastWith: [
      {
        concept: 'series-parallel-resistors',
        note: 'One asks what voltage can be taken from between two resistances joined in a line; the other asks how much current a supply gives up to the pair depending on how they are joined.',
      },
      {
        concept: 'kirchhoffs-voltage-law',
        note: 'One takes one share out of a loop and asks how large that share is; the other goes right round and asserts that all the shares together come to nothing.',
      },
      {
        concept: 'thermistor-and-ldr',
        note: 'One has a contact moved along a fixed resistance, so the split is decided within the circuit; the other has one of the two resistances changed from outside by warmth or by light.',
      },
      {
        concept: 'wheatstone-bridge',
        note: 'Both put resistances in a line and watch a middle point, but one reads off how the voltage there moves, and the other adjusts until two such points agree and there is nothing to read.',
      },
      {
        concept: 'emf-and-internal-resistance',
        note: 'Both end with less than the full supply appearing somewhere, but one shares it out deliberately between two chosen parts, and the other loses part of it unavoidably inside the source.',
      },
      {
        concept: 'resistance-and-geometry',
        note: 'One leans on resistance going with length only so that two lengths may stand for two resistances; the other makes that dependence its subject and tests it against cross-section too.',
      },
    ],
  },
};
