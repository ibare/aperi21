/**
 * dielectric 개념 선언.
 *
 * 축전기 넷 가운데 이쪽은 **전하 고정 · 물질을 끼운다** 다 — 전지에서 뗐고 장이 양보한다.
 *   dielectric                 판의 전하 그대로, 분자가 돌아서며 장이 **1/κ** 로 약해진다
 *   parallel-plate-capacitor   전압 그대로, **기하**를 바꾸면 전하가 드나든다
 *   capacitors-in-circuit      **둘을 잇는 법**이 합성을 정한다
 *   energy-in-capacitor        전하를 **담는 데 든 일**
 * 이쪽만 「분자 쌍극자가 돌아선다 · 묶인 전하 · κ · 장 화살표가 짧아진다」 어휘를 갖는다.
 * 용량 · 전압 · 전류 · 에너지는 화면에 없으므로 검색어에도 두지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const dielectricConcept: Aperi21ConceptSource = {
  id: 'dielectric',
  label: 'Sliding Matter into a Gap Whose Charge Cannot Change',
  canonicalSim: 'aperi21:dielectric',

  surface: {
    definition:
      'That sliding an insulating slab between plates whose charge is unable to change turns its molecules to face the field, and that the turned molecules weaken the field across the gap by a fixed factor of the material.',
    exemplarKeywords: [
      'dielectric',
      'dielectric constant kappa',
      'polarization of an insulator in a field',
      'inserting a slab between capacitor plates',
      'bound charge on the faces of a dielectric',
      'why does a dielectric weaken the field',
      'relative permittivity',
      'molecules line up with an applied field',
      'field inside an insulating slab',
      'isolated charged plates with a slab pushed in',
    ],
  },

  briefing: {
    observable: [
      'Two plates are drawn from the side, six plus marks along the inner face of the upper and six minus marks along the inner face of the lower, named +Q and −Q.',
      'Six arrows point down across the gap, reaching most of the way from plate to plate, with the letter E set beside them.',
      'A slab waits clear of the plates on the right, marked κ = 3, filled with a grid of small ellipses each carrying a plus at one end and a minus at the other, every one of them facing a different way.',
      'The slab slides left into the gap, and each ellipse turns as it passes the edge of the plates until its plus end faces downward; the ones still outside keep facing as they were.',
      'While the slab moves, every arrow in the gap shortens together — not only those over the part already covered.',
      'The plate marks stay six and six throughout the whole run, but they slide along the plates to crowd over the covered part.',
      'When the slab has filled the gap, every ellipse faces down, so the minus ends of the top row face the plus plate and the plus ends of the bottom row face the minus plate.',
      'The arrows are then a third of the length they began at and are named E/3, while the plates are still named +Q and −Q.',
      'Drawing the slab back out lets the ellipses that leave the gap scatter again while the arrows grow back to their first length, and the run begins over.',
      'The names E and E/3 are written only while the slab is standing still, and no other quantity appears — no voltage, no store, no energy.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the slab goes in, is held, and comes out again.',
        'The plates are cut off from any supply, so the number of marks on them cannot change and only their spacing along the plates does.',
        'The picture drawn partway is worked out for a gap that much filled, which is why all the arrows shorten together instead of only those above the slab.',
        'The bound charge is shown by the ends of the lined-up molecules themselves rather than by drawing separate sheets of charge on the slab faces, so the same thing is not drawn twice.',
        'Only the net field is drawn, one arrow to a place, so no arrow ever has to be sorted out from another one meaning something else.',
        'The accent colour is kept for the charge sitting on the plates, and the molecules are drawn in plain ink because they are a different thing from it.',
        'The factor written on the slab and the name of the shortened arrows come from one declared number, so they cannot fall out of step.',
        'The turning is drawn as complete and settled, with no jostling left over.',
      ],
    },

    useWhen: [
      'The article says a dielectric weakens the field or improves the store and the reader is treating the material constant as a number looked up in a table. Molecules turning as they cross the plate edge, with the arrows shortening as they do, puts a mechanism underneath that number.',
      'The reader is about to be told what a slab of material does, with no battery anywhere in the account. Nothing can leave these plates, so what the slab pushes on is the field between them and the arrows shortening is the whole of the answer.',
    ],

    avoidWhen: [
      'The plates are held at a fixed voltage by a supply and the interest is in charge flowing in or out. Nothing flows here; the marks are fixed in number from beginning to end.',
      'A capacitance, a charge or an energy is to be worked out, or the factor by which the store improves is the point. No store and no capacitance appear on screen.',
      'The subject is the force that pulls the slab in, or the energy change on inserting it.',
      'The subject is how molecules behave in general — thermal jostling, why some materials polarise more than others, or a material whose molecules have no separation to begin with. The ellipses here turn fully and stay turned.',
      'The subject is conduction through the insulator, leakage, or breakdown at a high field.',
      'Separate bound-charge sheets are wanted, or the polarisation field drawn as its own arrows set against the free field. One set of arrows is drawn here and it is the net one.',
    ],

    contrastWith: [
      {
        concept: 'parallel-plate-capacitor',
        note: 'One holds the charge fixed and lets the field give way when matter is put in; the other holds the voltage fixed and lets the charge change when the geometry is moved.',
      },
      {
        concept: 'electrostatic-shielding',
        note: 'One fills a space with matter whose charges are bound in place and can only turn, so the field is cut by a factor; the other surrounds a space with matter whose charges are free to travel, and the field is wiped out altogether.',
      },
      {
        concept: 'capacitors-in-circuit',
        note: 'One changes what lies between one pair of plates; the other leaves every gap as it is and changes only how two pairs are wired together.',
      },
      {
        concept: 'energy-in-capacitor',
        note: 'One is about the state a filled gap settles into once the charge is there; the other is about what it cost to get the charge onto the plates at all.',
      },
      {
        concept: 'uniform-field',
        note: 'One takes the evenness of the field across a gap for granted and asks what weakens it; the other asks whether it is even at all and puts nothing in the way.',
      },
    ],
  },
};
