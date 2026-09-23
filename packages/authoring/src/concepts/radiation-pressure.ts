/**
 * radiation-pressure 개념 선언.
 *
 * 전자기파 다섯 가운데 이쪽은 **닿은 것이 받는 몫**이다 — 빛이 판을 밀고, 되튕기는 판이
 * 삼키는 판의 두 배로 밀린다.
 *   radiation-pressure    **밀기** — 운동량이 넘어가고, 되쏘면 한 번 더
 *   poynting-vector       **길** — 에너지가 어느 쪽으로 지나가는가(닿는 것이 없다)
 *   antenna-radiation     **나감** · electromagnetic-wave  **떨어져 나감**
 * 이쪽만 「거울 판 · 검은 판 · 광자 하나 · 두 번 받는다」 어휘를 갖는다. 나르는 에너지의
 * 양은 `wave-energy` 의 몫이라 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const radiationPressureConcept: Aperi21ConceptSource = {
  id: 'radiation-pressure',
  label: 'The Push Light Gives a Plate',
  canonicalSim: 'aperi21:radiation-pressure',

  surface: {
    definition:
      'That light falling on a plate pushes it along, and that a mirrored plate is driven twice as far as a black one because each photon it turns back gives up twice the momentum.',
    exemplarKeywords: [
      'radiation pressure',
      'does light push things',
      'solar sail',
      'momentum carried by light',
      'a mirror feels twice the force a black surface feels',
      'a photon that bounces gives twice the kick',
      'force of sunlight on a panel',
      'pressure of a beam equals its intensity over c',
      'light exerting a force without touching',
      'absorbing and reflecting surfaces set side by side',
    ],
  },

  briefing: {
    observable: [
      'Two lanes lie one above the other, each with the same source at the left and the same light; the upper plate is black, the lower one mirrored, both the same size and standing on rails.',
      'One photon per lane flies in, drawn as a short packet of waves with a momentum arrow riding above it.',
      'The photon entering the black plate disappears into it and its arrow shrinks away to nothing, while behind that plate one arrow of the same scale grows.',
      'The photon meeting the mirror folds back at its face and its arrow turns right round, while behind that plate two arrows grow joined head to tail.',
      'The turned photon travels back toward the source carrying a reversed arrow.',
      'A steady stream of photons then fills both lanes: behind the black plate one force arrow appears, behind the mirrored plate two of the same length.',
      'Both plates slide to the right of a dotted starting line, and a measuring line under the rails runs twice as far on the mirrored side.',
      'While the plates are moving, a notice in the corner says by how much their travel has been magnified for drawing.',
      'The plates then slide back to their starting places and the round begins again.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; one photon apiece, then a stream, then the plates move, then it starts over.',
        'Both lanes are given identical light, the same photons at the same heights, so the plates are the only thing that differs.',
        '“Twice” is never written as a number: it is two arrows joined head to tail, matching the two occasions on which one photon gives a kick.',
        'The momentum a photon loses and the momentum a plate gains are drawn to one scale, so the two may be laid against each other directly.',
        'The magnification put on the travel is stated in words on the screen while the plates are moving, and the same magnification is used in both lanes so the ratio is untouched.',
        'The black plate is black by carrying no light at all, so it looks the same whatever the surroundings are.',
        'The photon that is turned back is folded at the mirror’s face rather than redrawn, so the same photon is followed in and out.',
      ],
    },

    useWhen: [
      'The article has said that light carries momentum and the reader cannot see how something weightless pushes anything. A photon that visibly hands its arrow over to the plate makes the transfer the same kind of event as a collision.',
      'The prose is explaining a solar sail, or why a mirrored surface is chosen for one, and needs the factor of two to come out of a mechanism rather than out of a formula.',
    ],

    avoidWhen: [
      'The article is about the energy a beam delivers, or how hot a surface gets under it.',
      'The subject is what light is made of, or a photon as a quantum whose energy is set by its frequency.',
      'A pressure or a force is wanted in numbers, or the real size of the effect for sunlight is to be quoted. Nothing is written on the screen except the magnification.',
      'Partly reflecting surfaces are at issue, or any reflectance between the two extremes. Only the two extremes are put on the rails.',
      'The article is about the direction the wave travels, the fields it carries, or its polarization.',
      'The point is light being taken in and given out again, or what the black plate does with what it swallows.',
    ],

    contrastWith: [
      {
        concept: 'antenna-radiation',
        note: 'One waits at a surface and counts what the arriving light hands over; the other follows the radiation outward from what made it and asks which way most of it goes.',
      },
      {
        concept: 'impulse-momentum-theorem',
        note: 'One has a beam that keeps arriving and two surfaces that give different accounts of it; the other has a single push weighed against the time it lasts.',
      },
      {
        concept: 'wave-energy',
        note: 'One is about momentum handed over, and about how the surface changes the count; the other is about how much energy a wave delivers as its swing grows.',
      },
      {
        concept: 'poynting-vector',
        note: 'One asks what light does to whatever it lands on; the other asks by what route energy travels and never has anything struck.',
      },
    ],
  },
};
