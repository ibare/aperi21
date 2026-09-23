/**
 * wetting-and-contact-angle 개념 선언.
 *
 * 표면 넷 중 하나. 이쪽의 주장은 **각** 이다 — 가장자리에서 세 장력이 가로로 맞는 자리가
 * 접촉각이고, 고체가 바뀌면 맞섬이 기울어 가장자리가 움직인다.
 *   wetting-and-contact-angle 고체가 정하는 **각과 모양**
 *   surface-tension           같은 당김이 돌아 **받친다**
 *   laplace-pressure          곡률이 정하는 **안쪽 압력**
 *   capillary-action          그 굽음이 관 속에서 만드는 **높이**
 * 이쪽만 판 · 세 장력 · 알짜 힘 · 퍼짐과 뭉침 · 같은 방울 어휘를 갖는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const wettingAndContactAngleConcept: Aperi21ConceptSource = {
  id: 'wetting-and-contact-angle',
  label: 'Wetting and the Angle a Drop Settles At',
  canonicalSim: 'aperi21:wetting-and-contact-angle',

  surface: {
    definition:
      'The angle at which a liquid’s edge comes to rest on a solid, settled by three surface tensions balancing there, which is what makes the same drop spread thin or bead up.',
    exemplarKeywords: [
      'contact angle',
      'wetting and non-wetting surfaces',
      'why water beads on wax but spreads on glass',
      'hydrophobic and hydrophilic',
      'Young’s equation',
      'a drop on a waxed car bonnet',
      'the same drop on two different surfaces',
      'how far a liquid spreads on a solid',
      'rain beading on a lotus leaf',
      'the three tensions meeting at the rim of a drop',
    ],
  },

  briefing: {
    observable: [
      'A single drop is seen in cross-section, sitting on a flat plate.',
      'At the drop’s right edge three arrows meet: one pulling outward along the plate, one pulling inward along the plate, and one pulling along the drop’s own surface.',
      'At the drop’s left edge a wedge marks the angle, measured inside the liquid; the two edges share the work so that nothing is drawn on top of anything else.',
      'On the smooth plate the outward arrow is long and the inward one short; the surface arrow lies down low and helps inward, and the angle is a shallow one.',
      'The plate then changes from a smooth face to a hatched one, with the surface’s name written inside it. The outward arrow shortens and the inward one lengthens.',
      'For a moment the drop still has its old shape while the arrows no longer balance, and an arrow in the accent colour appears inside the plate, pointing inward, and it is long.',
      'The edge then draws in: the drop narrows and rises, the wedge opens, the surface arrow swings upright, and the accent arrow shortens as it goes.',
      'It comes to rest with the angle past a right angle, the surface arrow now pointing outward and up to help the shortened outward pull, and the accent arrow gone.',
      'The plate then goes back to smooth, the accent arrow reappears pointing the other way, and the edge is driven back out until the shallow angle returns.',
      'Through all of it the drop keeps the same area, so it stays visibly the same drop and only its shape is at issue.',
      'No angle value and no tension value is written; the angle carries a symbol only, and the drop is drawn as a circular cap with no flattening under its own weight.',
    ],

    screen: {
      affordances: [
        'One round runs by itself and goes both ways — beading once and spreading once — so neither case depends on anyone doing anything.',
        'The accent colour carries one meaning: the force left over when the three pulls do not balance. Its appearing, shrinking and vanishing is the whole of the argument.',
        'That leftover arrow is drawn inside the plate, below the two arrows lying along it and at the same scale, so it can be compared with them by length.',
        'The two surfaces are told apart by texture rather than by colour, so that colour is not quietly doing the explaining.',
        'The drop’s area is held constant on purpose, which is what makes the two shapes readable as one drop rather than two.',
        'The picture is drawn plate first, then the drop’s body, then its surface line, then the angle, then the arrows, so that the edge stays legible where everything meets.',
        'The drawing in and the spreading out both ease off at the ends, which means the edge starts slowly at the moment the leftover force is greatest.',
      ],
    },

    useWhen: [
      'The article has called a surface water-loving or water-hating and the reader takes that as something about the water. Only the solid changes here, and the arrows at the edge change with it.',
      'The article has given Young’s equation as a balance, and what is missing for the reader is the out-of-balance moment — the equation describes where that moment ends, and the leftover arrow is the moment itself.',
      'The reader has the idea that a drop beads up because it is somehow repelled. The edge being drawn in by a pull along the plate, rather than pushed away from it, is what the picture puts in its place.',
    ],

    avoidWhen: [
      'The subject is a liquid climbing a narrow tube, or the height at which it stops. Nothing rises here; a drop sits on a level plate.',
      'The claim is the pressure inside a curved drop, or a difference in pressure across its surface. No pressure appears anywhere.',
      'The claim is that a surface can hold a body up. Nothing is loaded onto the drop and nothing rests on it.',
      'The drop in question is large enough to be flattened under its own weight, or is spread into a puddle. Gravity is left out here so that the angle alone settles the shape.',
      'Values are wanted — an angle in degrees, or tensions in newtons per metre. The angle carries a symbol and nothing else.',
      'The subject is a drop rolling off a tilted surface, detaching, or drying up. The edge here only moves in and out along a plate that stays level.',
    ],

    contrastWith: [
      {
        concept: 'surface-tension',
        note: 'One has the liquid meeting a solid, where a third and a fourth pull enter and settle an angle; the other keeps the solid out of it and asks what a free surface can carry.',
      },
      {
        concept: 'laplace-pressure',
        note: 'One is about what settles the curvature of a liquid surface where it ends on a solid; the other takes that curvature as given and asks what pressure it holds behind it.',
      },
      {
        concept: 'capillary-action',
        note: 'One is about the angle itself and the shape it fixes; the other is about how far a liquid is driven by a surface already curved that way, and where the driving stops.',
      },
    ],
  },
};
