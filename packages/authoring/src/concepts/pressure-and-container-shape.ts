/**
 * pressure-and-container-shape 개념 선언.
 *
 * 압력 여섯 중 하나. 이쪽의 주장은 **그릇 모양 · 담긴 양과 무관** 하나다 — 수면 높이가
 * 같으면 바닥 압력이 같다. `hydrostatic-pressure` 가 「깊이가 정한다」 의 긍정이라면
 * 이쪽은 「그 밖의 것은 정하지 않는다」 의 부정이라, 리터 · 그릇 모양 · 견줌 어휘를
 * 이쪽만 갖는다. 두 배 · 정비례 · 쐐기라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const pressureAndContainerShapeConcept: Aperi21ConceptSource = {
  id: 'pressure-and-container-shape',
  label: 'Bottom Pressure and the Shape of the Vessel',
  canonicalSim: 'aperi21:pressure-and-container-shape',

  surface: {
    definition:
      'That the pressure on the base of a vessel is settled by the height of liquid standing above it alone, and neither by the shape of the vessel nor by how much liquid it holds.',
    exemplarKeywords: [
      'hydrostatic paradox',
      'does the shape of the container change the pressure',
      'same level, same pressure on the base',
      'a narrow vase and a wide bowl press alike',
      'pressure does not depend on the quantity of liquid',
      'bottom pressure of differently shaped vessels',
      'more liquid yet the same pressure',
      'a thin tube presses as hard as a broad tank',
      'pressure follows height, not volume',
      'Pascal’s barrel',
    ],
  },

  briefing: {
    observable: [
      'Three vessels stand side by side on one base line. One widens upward, one is straight, one narrows almost to a point, but their bases are the same width and a written line says so.',
      'Liquid pours into all three at one rate, and the surfaces climb at three different speeds because the cross-sections differ.',
      'Each stops on reaching its own filled amount, so the three arrive at different moments, the widening one last.',
      'A chip rides on every surface with the amount held so far, and the three end at 9.0 L, 6.0 L and 3.6 L — two and a half times apart.',
      'At the instant the last one arrives, the three surfaces stand on one straight line; the target line changes colour and brightens, and a flash goes off at the base of each vessel at once.',
      'Three arrows press up under each base, nine in all, and at that moment every one of the nine is the same length.',
      'The three pressure figures beneath the vessels, kept dim while the levels differed, come up to one colour and read the same number.',
      'Two lines of writing above the scene give the density, gravity, and the base area the three share.',
    ],

    screen: {
      affordances: [
        'Nothing has to be touched: the pouring, the waiting and the moment of levelling are over within a few seconds of the scene opening.',
        'One slider then moves the level the three fill to, and they drain or refill and meet again at a new common figure — the reader’s way of asking whether the first height was a fluke.',
        'The amounts on the chips stay apart at every height, so the disagreement that matters is never quietly resolved.',
        'The nine arrows and the three figures sit on one base line, so the equality is a comparison of lengths side by side rather than three separate readings.',
      ],
    },

    useWhen: [
      'The reader has met this as a stated paradox and is privately certain that more liquid must press harder. Three chips reading 9.0, 6.0 and 3.6 litres above nine arrows of one length is what unseats that.',
      'The article needs the claim tested beyond the single height it was stated for, and the slider lets the reader pick a level and watch the three figures meet again there.',
    ],

    avoidWhen: [
      'The subject is how the pressure changes with depth inside one vessel. The reading here is taken at the base only, and what differs between the three is shape rather than depth.',
      'The point is that the push does not depend on which way a surface faces. Every arrow here is under a base and points the same way.',
      'The article is about the force on the base rather than the pressure, or about what the vessel weighs on the table. The three bases are equal in area, so the picture cannot tell those two apart.',
      'Flowing liquid is the subject, or how quickly a vessel fills. The three fill at different rates only so that they arrive at different moments; nothing is claimed about the filling itself.',
      'The fluid in the article is air, or the vessel is closed and under pressure from something other than the liquid’s own weight.',
    ],

    contrastWith: [
      {
        concept: 'hydrostatic-pressure',
        note: 'One is the positive half — depth settles the pressure; the other is the negative half — nothing else does, neither shape nor quantity.',
      },
      {
        concept: 'pressure-isotropy',
        note: 'Both rule something out as irrelevant, but one rules out the orientation of the surface being pressed and the other the shape of the vessel doing the holding.',
      },
      {
        concept: 'pascals-principle',
        note: 'One has vessels open to the air, where the base pressure follows the height of liquid alone; the other has a closed fluid where a push put in at one piston settles the pressure everywhere.',
      },
    ],
  },
};
