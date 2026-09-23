/**
 * antimatter 개념 선언.
 *
 * 형제 둘과 갈랐다 — **무엇이 사라지고 무엇이 생기는가**.
 *   antimatter       입자 둘이 **통째로** 사라지고 광자 둘이 **정반대로** 나간다 —
 *                    그래서 두 검출 자리를 이은 선이 소멸 자리를 지난다(PET)
 *   pair-production  광자가 사라지고 **입자 둘이 생긴다** — 반대 방향이고, 주장은 문턱이다
 *   nuclear-fusion   알갱이는 남고 **질량의 일부**만 사라진다
 * 이쪽만 소멸 · 511 keV · 정반대 · 검출기 고리 · PET 어휘를 갖는다. 양전자가 어디서
 * 오는지(β⁺ 붕괴) · 자기장에 휘는 궤적 · 포지트로늄은 화면에 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const antimatterConcept: Aperi21ConceptSource = {
  id: 'antimatter',
  label: 'A Particle Meeting Its Opposite',
  canonicalSim: 'aperi21:antimatter',

  surface: {
    definition:
      'What is left when a particle meets its opposite: an electron and a positron both cease to exist and two gamma photons of equal energy leave the spot in exactly opposite directions.',
    exemplarKeywords: [
      'antimatter',
      'positron meeting an electron',
      'annihilation',
      'five hundred and eleven keV gamma rays',
      'PET scan',
      'two photons flying back to back',
      'why does a PET image start as straight lines',
      'rest mass turning wholly into radiation',
      'a particle and its opposite cancelling out',
      'positron emitting tracer in the body',
      'what happens to matter and antimatter when they touch',
    ],
  },

  briefing: {
    observable: [
      'A ring of small detector cells encloses the picture, and the place where the event happens is set off to one side of its centre rather than at it.',
      'An electron waits there and a positron drifts in from the left; the two are drawn in the same ink and told apart only by the marks beside them and by which one is moving.',
      'Each carries the same rest energy written outside it, and that figure is the one that will turn up again on the radiation.',
      'The two overlap at a single point, fade out together, and a flash ring spreads from that point; where they were, a hollow circle is left to mark the spot.',
      'Two trains of ripples then leave that spot along one straight line in opposite senses, each labelled with the same energy the particles carried.',
      'Because the spot is off centre, one of them reaches the ring well before the other — the cell it strikes lights up in the accent colour while the far photon is still in flight.',
      'When the second arrives and lights its own cell, a straight line is drawn between the two lit cells, and it passes through the hollow circle.',
      'Seven more events then follow in quick succession, each in a different direction, and every one of them leaves a line that passes through the same hollow circle.',
      'At the end eight lines cross one another at a single point, and that point is not the centre of the ring.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. One slow event is followed by a run of quick ones and the round repeats.',
        'The event is deliberately placed away from the centre of the ring, so that the lines meeting at it cannot be put down to the symmetry of the ring.',
        'That same offset makes the unequal arrival times visible without anything being said about them.',
        'The two particles are drawn in one ink and separated by their marks alone, because colouring them apart would explain the difference rather than show it.',
        'The accent colour means one thing only: a cell that has received a photon.',
        'The ripple spacing of the radiation is a token, since its real wavelength is far too short to be drawn, and no scale is claimed for it.',
        'Energy labels ride on the first pair of photons only, and only while they are still in flight, so the ring does not fill up with writing once the quick events begin.',
        'The directions of the later events are spread evenly around a half turn before being jittered, so that the crossing point reads as a point rather than as a crowd on one side.',
        'The radiation is drawn without any colour of light, since it lies far outside what the eye can see.',
      ],
    },

    useWhen: [
      'The article has introduced antimatter as a name and the reader has no picture of what an encounter actually produces. Two particles fading out and two photons leaving along one line is that picture in a single event.',
      'The point is that "exactly opposite" is a testable consequence rather than a flourish. Repeating the event in scattered directions and watching every joining line pass through the same spot is what tests it.',
      'The prose needs a reason why this matters outside physics. The lines crossing at one place, off the centre of the ring, is the whole idea behind locating a source from outside the body.',
    ],

    avoidWhen: [
      'The subject runs the other way — radiation turning into matter, or the energy a photon must carry to make a pair. Here the particles are given and the radiation is what results.',
      'The article is about where positrons come from, about a nucleus emitting one, or about types of radioactive decay. The positron simply drifts in, and its origin is named in passing at most.',
      'The point is how a charge behaves in a field, or how oppositely charged particles curve apart. Nothing here bends; the paths are straight and no field is drawn.',
      'The subject is the bound state the two can briefly form, or the cases that end in three photons rather than two. One outcome is shown.',
      'The article needs the medical image itself, the chemistry of a tracer, or how a scanner reconstructs a picture. The screen stops at the lines; nothing is reconstructed from them.',
      'A value in joules, a mass in kilograms or a conversion between the two is wanted. One energy figure appears, and it appears on both the particles and the photons.',
    ],

    contrastWith: [
      {
        concept: 'pair-production',
        note: 'One has matter disappearing and radiation appearing in its place; the other has radiation disappearing and matter appearing, and turns on whether the photon carried enough to manage it.',
      },
      {
        concept: 'nuclear-fusion',
        note: 'Both trade mass for energy, but one loses a small fraction of it while the particles survive and fly apart, and the other loses the particles altogether.',
      },
      {
        concept: 'compton-scattering',
        note: 'One ends with photons that did not exist before; the other has a photon that survives its encounter and leaves with less energy than it arrived with.',
      },
      {
        concept: 'conservation-of-momentum',
        note: 'One is the general statement that the total is unchanged by an interaction; the other is a case where the total was nothing to begin with, so whatever leaves must leave in exactly opposite directions.',
      },
    ],
  },
};
