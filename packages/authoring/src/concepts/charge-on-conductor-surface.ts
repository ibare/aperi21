/**
 * charge-on-conductor-surface 개념 선언.
 *
 * 도체 셋 가운데 이쪽은 **전하가 겉면 어디에 앉는가** 가 주장이다.
 *   charge-on-conductor-surface   속을 비우고 겉면으로, 겉면에서도 **뾰족한 곳에 빽빽이**
 *   field-of-charged-sphere       이미 고르게 앉은 뒤 **밖과 안**의 장
 *   electrostatic-shielding       중성 도체가 **바깥 장**을 막는다 (몰림은 바깥 장이 정한다)
 * 이쪽만 「서로 밀어 퍼짐 · 속이 빈다 · 곡률 · 같은 길이 두 호의 빽빽함」 어휘를 갖는다.
 * 대전되는 과정은 charging-methods, 멀리서 본 장은 field-of-charged-sphere 의 몫이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const chargeOnConductorSurfaceConcept: Aperi21ConceptSource = {
  id: 'charge-on-conductor-surface',
  label: 'Where Charge Comes to Rest on a Conductor',
  canonicalSim: 'aperi21:charge-on-conductor-surface',

  surface: {
    definition:
      'That charge put into a conductor pushes itself outward until none is left in the body and all of it lies on the surface, and that along that surface it packs more tightly where the shape curves more sharply.',
    exemplarKeywords: [
      'charge on the surface of a conductor',
      'why does charge crowd at a sharp point',
      'charge density and curvature',
      'lightning rod why pointed',
      'no charge remains inside a conductor',
      'excess charge goes to the outside of a metal',
      'point discharge and corona from a sharp electrode',
      'charge spreads over a conductor until it stops moving',
      'sharp edges and the strongest field',
      'charges repel each other onto the surface',
    ],
  },

  briefing: {
    observable: [
      'A conductor is drawn as a teardrop outline seen in section — one end broadly rounded, the other drawn out to a fine point.',
      'A handful of plus crosses is placed together in the blunt half, all of them well inside the outline.',
      'They push one another apart: the handful opens into a ring, the ring reaches the outline, and the crosses then slide along it toward the fine point.',
      'They come to rest with every cross on the outline and not one anywhere inside it.',
      'Along the outline they are unevenly placed — nearly touching at the fine point, clearly separated round the blunt end, and furthest apart along the flatter sides between.',
      'Two arcs of the same length are then drawn in the accent colour, one on the blunt end and one at the point, each with its name set beside it clear of the outline.',
      'Within the arc at the point the crosses are packed so closely that their strokes almost merge into one dark patch; within the arc of equal length at the blunt end only a few sit, well spaced.',
      'The arcs withdraw and short arrows grow at evenly spaced places just outside the outline, all pointing straight out: the one at the point is the longest, the blunt end’s the next, and those along the flat sides the shortest.',
      'Every cross is drawn in the same one colour from first to last, so the only thing that differs from one part of the surface to another is how close together they are.',
      'Nothing is counted on screen — the arcs bear names but no numbers, and no length or strength is written.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the charges are put in, they spread, they settle, the arcs are compared, and the arrows grow.',
        'The resting places are reached by letting the charges repel one another rather than by drawing them where the answer says, so the empty interior comes out as a result.',
        'One body carries both a blunt end and a sharp one, so the comparison is made within a single conductor rather than between two separate drawings.',
        'The two arcs are cut to the same length, so what is being compared is plainly how many fall inside them.',
        'The accent colour is kept for the pair of arcs being compared; the outward arrows are in a quieter tone and the crosses in plain ink.',
        'The arrows are measured a short way out from the surface — close enough for the crowding at the point to tell, far enough not to be thrown by any single cross.',
        'There is no grid, since what is read here is how closely things sit rather than any distance.',
      ],
    },

    useWhen: [
      'The article has stated that charge resides on the surface and crowds at points, and the reader has no picture of how it gets there. Crosses that visibly push each other out of the interior and then slide toward the point make both halves of the statement one single motion.',
      'The prose has a lightning rod, a pointed electrode or a sharp edge to account for, and needs the crowding itself shown before the strong field just outside it is claimed.',
    ],

    avoidWhen: [
      'The article is about how the body came to be charged — rubbing, touching, earthing. Here the charge is simply put in and the account starts from there.',
      'The field at a distance from the conductor, or how it thins out as one goes away, is the subject. The arrows here are drawn only just outside the surface.',
      'The conductor is neutral and the interest is in an outside field being kept out of it. This one carries charge of one sign and nothing comes at it from outside.',
      'An exact proportion is wanted — density against radius of curvature, a factor, a formula. Nothing is counted or measured; the claim is carried by spacing and by arrow length.',
      'The body in question is a sphere, where the surface curves the same everywhere. The shape here is chosen precisely so that it does not.',
      'The charge is in an insulator, or spread through a volume and meant to stay there. Everything here ends up on the boundary.',
    ],

    contrastWith: [
      {
        concept: 'field-of-charged-sphere',
        note: 'One asks where on the metal the charge comes to rest, and finds the answer depends on the shape; the other takes it as already at rest on a round surface and asks what field that leaves.',
      },
      {
        concept: 'electrostatic-shielding',
        note: 'One lets the charges alone decide where to sit, on a body that has a point; the other has an outside field push the charge of a neutral body to two opposite faces.',
      },
      {
        concept: 'charging-methods',
        note: 'One begins after the body is charged and follows where the charge goes; the other ends at the moment the body is charged and never asks.',
      },
      {
        concept: 'field-lines',
        note: 'One reads crowding of charges along a surface as the claim; the other reads crowding of lines through a region, and has to earn that the crowding means anything.',
      },
      {
        concept: 'electric-field',
        note: 'One draws arrows only at one fixed small distance out, so that one part of a surface can be set against another; the other fills a region with arrows to say what a value belonging to a place means.',
      },
    ],
  },
};
