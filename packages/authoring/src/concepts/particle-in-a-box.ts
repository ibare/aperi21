/**
 * particle-in-a-box 개념 선언.
 *
 * 양자 상태 넷 가운데 **에너지 쪽**이다.
 *   wave-function          부호 있는 진폭과 제곱 — 있을 곳의 분포
 *   superposition-quantum  둘을 겹치면 출렁인다
 *   measurement-collapse   재면 한 자리가 나온다
 *   particle-in-a-box      벽이 **허용되는 모양**을 정하고, 그 에너지가 1·4·9·16 이라 위로 갈수록 벌어진다
 * 이쪽만 준위 사다리 · 에너지 눈금 · 벌어지는 간격 어휘를 갖는다. 확률 분포(|ψ|²)를 두지
 * 않고 부호 있는 모양만 얹는다 — 반파장 수를 세는 것이 주장이기 때문이다.
 * 이미 선언된 `harmonics` 는 진동수를 훑어 **걸러지는** 장면이고, 이쪽은 허용된 모양마다
 * 에너지가 어디 놓이는가다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const particleInABoxConcept: Aperi21ConceptSource = {
  id: 'particle-in-a-box',
  label: 'Energy Levels of a Particle Between Walls',
  canonicalSim: 'aperi21:particle-in-a-box',

  surface: {
    definition:
      'Why a particle penned between two hard walls can have only certain energies: the shapes that fit must vanish at both walls, and their energies run as one, four, nine, sixteen.',
    exemplarKeywords: [
      'particle in a box',
      'infinite square well',
      'energy quantization',
      'discrete energy levels',
      'why are energy levels not continuous',
      'levels going as n squared',
      'the gaps grow wider higher up',
      'confinement forces the energy to come in steps',
      'half wavelengths fitting between two walls',
      'a bound particle cannot have zero energy',
      'the simplest model of a bound state',
    ],
  },

  briefing: {
    observable: [
      'Two walls and a floor make the well, with the walls drawn as solid barriers running up the sides.',
      'A ruler of energy stands at the right, ticked off one lowest-level unit at a time all the way up.',
      'The lowest level is drawn as a line across the well with a single half-wave sitting on it, touching zero at both walls.',
      'A dashed crossbar then climbs from that line upward at a steady pace, and a bar beside the ruler grows with it as it goes.',
      'The crossbar passes three ticks and stops. A level line is left where it stopped, and along that line a shape grows out of flatness with two half-waves in it — one above the line and one below — still zero at both walls.',
      'The number of the new level appears at the left, its energy beside the ruler, and the size of the climb just made beside its bar.',
      'The next climb takes five ticks and the one after seven, all at the same pace, so each climb plainly takes longer than the one before it.',
      'When four levels stand, three bars are stacked in one column beside the ruler, each visibly longer than the one below, and the numbers beside the ruler read as one, four, nine and sixteen units.',
      'The shapes never move once they have settled, and each is already the right shape when it arrives on its level — nothing is tried and rejected.',
      'The upper levels then fade away and the round begins again from the lowest one.',
      'The only figures on screen are the level numbers, the level energies and the sizes of the gaps, all in units of the lowest level; no real energy and no length is given.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The climbing and the settling run on a fixed round and repeat.',
        'The climbs are made at one steady pace, so the widening of the gaps happens as duration — each climb takes longer — and not only as a fact about a finished picture.',
        'The shapes are drawn sitting on their own level lines, so that a level line doubles as the axis of the shape on it and "this shape has this energy" is one thing to look at rather than two.',
        'The gap bars are left in place as the levels accumulate, so at the end three of them stand in one column and their lengths can be compared directly.',
        'The energy ruler is the only thing ruled; no distance grid is drawn, because what is being counted is steps of the lowest energy rather than any length.',
        'The shapes carry their sign, dipping below the line as well as rising above it, which is what lets the half-waves be counted.',
        'Four levels are shown — enough for three gaps, so the widening happens more than once, and few enough that the lowest levels are not crushed together.',
        'The colour set aside for the gap is used for the climbing crossbar, the bars and the gap figures, and for nothing else.',
        'It opens with the lowest level already settled and the first climb about to begin.',
      ],
    },

    useWhen: [
      'The article has said that a bound particle has discrete energies and the reader needs to see where the discreteness comes from. Only shapes that die at both walls are put on the ladder, and each of those has its own place on the energy ruler.',
      'The point is that the gaps widen as one goes up rather than staying even. Each climb is made at the same pace and takes longer than the last, and the bars are left stacked to be compared.',
      'The article needs the energies to be in a definite ratio rather than merely ordered. The ruler is marked in steps of the lowest level and the four levels sit at one, four, nine and sixteen of them.',
    ],

    avoidWhen: [
      'The subject is where the particle is likely to be found, or the squaring of the shape into a distribution. The shapes here carry their sign and dip below their level lines.',
      'The point turns on shapes being tried and rejected, on sweeping a rate until one shape takes hold, or on a string ringing at its own set of rates.',
      'The article is about a particle leaking through a wall, about a well of finite depth, or about what happens outside the well. These walls hold absolutely and nothing is drawn beyond them.',
      'The subject is an atom\'s spectrum, light given off when a particle drops from one level to another, or the actual energies of a real system in electronvolts. Nothing is emitted here and no real unit is given.',
      'The article is about a state made of more than one level at a time, or about a state changing as time passes. Each shape here sits alone on its own level and does not move.',
      'The point is how the width of the well or the mass of the particle sets the size of the energies. Neither is varied and neither is given a value.',
    ],

    contrastWith: [
      {
        concept: 'harmonics',
        note: 'Both come down to which shapes fit between two fixed ends, but one is about the rates a string will ring at and how it selects them, while the other is about what energy each surviving shape costs and how those costs space out.',
      },
      {
        concept: 'standing-wave',
        note: 'One is a pattern in a medium that no longer travels, with points held still while the rest swings; the other borrows that shape but has nothing swinging — what is being read off it is an energy.',
      },
      {
        concept: 'wave-function',
        note: 'One is about which shapes a pair of walls allows and what each is worth in energy; the other takes a shape as given and asks how it says where the particle may be found.',
      },
      {
        concept: 'superposition-quantum',
        note: 'One puts the levels of a confined particle in order and spaces them; the other takes two of those levels for granted and asks what a state made of both does.',
      },
      {
        concept: 'potential-energy-curve',
        note: 'One reads a stored-energy shape against a level line for the total and finds where a body must turn back, any total being allowed; the other has a shape so severe that only particular totals are possible at all.',
      },
    ],
  },
};
