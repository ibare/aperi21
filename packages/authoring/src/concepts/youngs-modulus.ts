/**
 * youngs-modulus 개념 선언.
 *
 * 형제는 `stress-strain-curve`. 둘 다 「당기면 늘어난다」 라 definition 이 수렴하기 쉽다.
 * **무엇을 바꿔 가며 묻는가**로 갈랐다.
 *   youngs-modulus       당김은 작게 둔 채 **재료와 길이**를 바꾼다 — 재료가 정한다
 *   stress-strain-curve  재료는 하나로 둔 채 **얼마나 멀리 당기는가**를 바꾼다
 * 이쪽만 여러 선의 견줌 · 눈금 높이 · 길이 무관 어휘를 갖고, 꺾임 · 남은 늘어남 어휘를
 * 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const youngsModulusConcept: Aperi21ConceptSource = {
  id: 'youngs-modulus',
  label: "Young's Modulus",
  canonicalSim: 'aperi21:youngs-modulus',

  surface: {
    definition:
      'The stiffness belonging to a material rather than to any one specimen, so that under the same load every marked length of a given material gives by the same fraction whatever the wire’s own length.',
    exemplarKeywords: [
      "Young's modulus",
      'stiffness of a material',
      'why does a longer wire stretch more',
      'is a long wire made of a softer material',
      'steel wire against aluminium wire',
      'stretch per unit length',
      'elastic modulus of a material',
      'same weight on different materials',
      'does length change how stiff something is',
      'wire loaded with a hanging mass',
    ],
  },

  briefing: {
    observable: [
      'Three wires hang from a hatched ceiling — steel one metre, steel two metres, aluminium one metre — each with its material and length written beside it and each carrying a five kilogram weight.',
      'Every wire is marked off every 25 cm, and faint ticks show where each mark stood before the wire carried any load.',
      'A platform under the weights is lowered, handing more and more of the load over to the wires, then raised again, in a round of eight seconds.',
      'As the load goes on, the marks travel down away from their old ticks, and the further down a wire a mark is, the further it has gone.',
      'A dashed line runs across from each mark of the long steel wire, and the marks of the short steel wire come down onto those very lines.',
      'The aluminium wire’s marks drop past those lines, further down than either steel wire’s at the same height.',
      'The stretch of each whole wire is written in millimetres and changes as the platform moves — 0.23, 0.47 and 0.67 mm at one moment, 0.31, 0.62 and 0.89 mm at another.',
      'A written note says by roughly what factor the stretch has been drawn larger than life, and gives the wire diameter and the spacing of the marks.',
    ],

    screen: {
      affordances: [
        'The platform lowers, holds, rises and holds again by itself, so the load on the wires goes up and comes back down without anything being asked for; arriving, it is already on its way down.',
        'Even at its highest the platform leaves a fifth of the weight on the wires, so every wire is under some load at every moment.',
        'The comparison is set up as heights lining up rather than distances being measured — the dashed lines carry the long steel wire’s marks across to the other two.',
        'The drawing owns up to its own exaggeration in writing, so the enlarged stretch is read as enlarged.',
      ],
    },

    useWhen: [
      'The reader has seen a two metre wire stretch twice as far as a one metre wire of the same stuff and has concluded that length changes how stiff a thing is. The short wire’s marks coming down exactly onto the long wire’s dashed lines is what settles it.',
      'The article is about to separate what belongs to a material from what belongs to a particular piece of it, and needs a case where two specimens of one material agree and a third of another does not.',
    ],

    avoidWhen: [
      'The point is what happens once a material is pulled past the place it can come back from. Every wire here stays inside the range where the load comes off and the mark returns.',
      'Stress and strain are being defined as quantities, or plotted one against the other. No axes are drawn and neither quantity is given a value.',
      'The subject is breaking, snapping or how much a material can take before it fails. Nothing here is taken anywhere near that.',
      'A coil spring and its stiffness is what the article is about. These are straight wires and no spring constant is named.',
      'A figure for the modulus is wanted. No such number is written; only the stretch of each wire in millimetres.',
    ],

    contrastWith: [
      {
        concept: 'stress-strain-curve',
        note: 'One keeps the pull gentle and varies the specimen, asking which of material and length decides how far it gives; the other keeps one specimen and varies the pull, asking what changes once it is taken far enough.',
      },
    ],
  },
};
