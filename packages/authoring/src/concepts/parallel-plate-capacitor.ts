/**
 * parallel-plate-capacitor 개념 선언.
 *
 * 축전기 넷 가운데 이쪽은 **전압 고정 · 기하를 바꾼다** 다 — 전지가 붙어 있고 전하가 드나든다.
 *   parallel-plate-capacitor   전압 그대로, **간격 · 넓이**를 바꾸면 담기는 전하가 바뀐다
 *   dielectric                 전하 그대로(전지에서 뗌), **물질**을 끼우면 장이 1/κ
 *   capacitors-in-circuit      판은 그대로, **둘을 어떻게 잇는가**
 *   energy-in-capacitor        배치는 그대로, **담는 데 든 일**이 왜 절반인가
 * 이쪽만 「전지가 붙어 있다 · 간격을 좁힌다 · 판을 넓힌다 · 도선에 전류가 선다」 어휘를 갖는다.
 * 판 사이 장은 uniform-field 의 몫이라 화살표도 장선도 화면에 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const parallelPlateCapacitorConcept: Aperi21ConceptSource = {
  id: 'parallel-plate-capacitor',
  label: 'What Sets How Much Charge a Pair of Plates Takes',
  canonicalSim: 'aperi21:parallel-plate-capacitor',

  surface: {
    definition:
      'That two plates kept at one fixed voltage take on more charge when they are brought closer together or made larger, so that the geometry of the pair alone settles how much it will hold.',
    exemplarKeywords: [
      'parallel plate capacitor',
      'capacitance depends on area and separation',
      'capacitance equals epsilon times area over separation',
      'bringing capacitor plates closer together',
      'why do larger plates hold more charge',
      'charge on a capacitor held at constant voltage',
      'what capacitance actually means',
      'making a capacitor hold more charge',
      'plate separation and stored charge',
      'a capacitor connected across a battery',
    ],
  },

  briefing: {
    observable: [
      'A battery symbol stands at the left named 6 V, with a wire from each terminal running across to a pair of plates seen from the side.',
      'Four plus marks sit along the underside of the upper plate and four minus marks along the top of the lower one, the pair named +Q and −Q; a dimension line at the left of the gap is named d and the length of the plates is named A.',
      'The gap narrows, and while it does an arrow named I stands on the upper wire pointing toward the plates and on the lower wire pointing back toward the battery, while marks fade in one at a time along both plates.',
      'When the gap comes to rest at half its first width there are eight marks on each plate, named +2Q and −2Q, while the plate length is still named A and the battery still reads 6 V — the one thing that moved is the gap.',
      'The gap then opens back out, the arrows on the wires turn the other way, and the marks fall back to four.',
      'Next, with the gap held where it began, the plates grow rightward to twice their length; the arrows point toward the plates again and the marks build back to eight, the plates now named 2A and the charge +2Q while the gap is still named d.',
      'The plates grow only to the right, so the battery, the wires and the dimension line stay exactly where they were.',
      'The names d, d/2, A, 2A, Q and 2Q appear only while the plates are standing still, though the dimension line itself is always drawn.',
      'No quantity is written anywhere except the battery’s 6 V — no capacitance, no charge in coulombs, no separation in metres.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the gap closes, opens, the plates grow and shrink, and the run begins again.',
        'How much is held is shown by counting marks and by the names Q and 2Q, never by writing an amount.',
        'The wires carry no resistance, so the charge follows the geometry at once and nothing is seen lagging behind a change.',
        'Arrows appear on the wires only while charge is actually on the move, and the gap and charge are named only while everything is standing still, so no name is ever left contradicting the picture.',
        'The plates grow in one direction only, which leaves every other thing on screen in place and makes the single changed quantity plain.',
        'The accent colour is kept for the charge held on the plates — the marks and the names Q.',
        'Marks come in partly faint as the count passes between whole numbers, so that their places slide rather than jump.',
      ],
    },

    useWhen: [
      'The article has given capacitance as area over separation and the reader is treating it as a formula to substitute into. Marks doubling on the plates while the battery reading never moves is what makes the geometry the cause and the charge held the consequence.',
      'The prose needs the constant-voltage case kept straight from the isolated one. The battery stays attached throughout here, so what gives way when the plates move is the amount of charge.',
    ],

    avoidWhen: [
      'The plates are cut off from any supply and something is done to them with their charge fixed. Here they are joined to a battery from first frame to last.',
      'The interest is in how the charging takes time — a rising curve, a time constant, a current that dies away. The charge here follows the geometry with no delay at all.',
      'The subject is the field between the plates, whether it is even, or how strong it is. No field is drawn.',
      'The energy held, or the work of charging, is the subject. Nothing here is added up.',
      'A slab of insulating material is put between the plates. The gap here is empty throughout.',
      'Figures are wanted — a capacitance in farads, the permittivity constant, a charge in coulombs.',
      'Several capacitors are present and how they combine is the question. There is one pair of plates here.',
    ],

    contrastWith: [
      {
        concept: 'dielectric',
        note: 'One keeps the supply attached so the voltage cannot change and moves the plates; the other cuts the supply so the charge cannot change and puts matter into the gap.',
      },
      {
        concept: 'capacitors-in-circuit',
        note: 'One alters the shape of a single pair of plates; the other leaves every pair exactly as it is and alters only how two of them are wired.',
      },
      {
        concept: 'energy-in-capacitor',
        note: 'One asks how much charge a given arrangement will take; the other never changes the arrangement and asks what putting the charge there cost.',
      },
      {
        concept: 'uniform-field',
        note: 'One is about what a pair of plates holds and never draws the space between them; the other is about that space alone and never asks how much charge the plates carry.',
      },
      {
        concept: 'electric-current',
        note: 'One draws a flow only to say which way charge went while the plates were moving; the other is about what makes a flow large, and counts what passes in a fixed time.',
      },
    ],
  },
};
