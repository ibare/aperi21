/**
 * quantum-harmonic-oscillator 개념 선언.
 *
 * 갇힌 상태 셋 가운데 **포물선 우물** 쪽이다.
 *   particle-in-a-box          곧은 벽 — 간격이 위로 갈수록 벌어진다(1·4·9·16)
 *   finite-well                벽 높이가 유한하면 준위가 가라앉는다
 *   quantum-harmonic-oscillator 포물선 우물 — 간격이 **늘 같고** 바닥이 반 칸 떠 있다
 * 이쪽만 「같은 크기의 덩이가 쌓인다 · 영점 에너지 · 층마다 마디 하나씩」 어휘를 갖는다.
 * 고전 진동(`simple-harmonic-motion` · `mass-spring-system`)과도 갈린다 — 여기서는 아무것도 흔들리지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const quantumHarmonicOscillatorConcept: Aperi21ConceptSource = {
  id: 'quantum-harmonic-oscillator',
  label: 'Energy Levels of a Quantum Harmonic Oscillator',
  canonicalSim: 'aperi21:quantum-harmonic-oscillator',

  surface: {
    definition:
      'Energies open to a particle held by a spring-like parabolic well: they climb in steps of one fixed size that never changes, and the lowest of them sits half a step above the bottom rather than at it.',
    exemplarKeywords: [
      'quantum harmonic oscillator',
      'evenly spaced energy levels',
      'zero point energy',
      'n plus one half h bar omega',
      'why a quantum oscillator cannot be at rest',
      'the lowest state still has energy',
      'ladder of equally spaced states',
      'parabolic potential well levels',
      'vibrational energy levels of a molecule',
      'one more node for each level up',
      'quantised vibration',
    ],
  },

  briefing: {
    observable: [
      'A parabola opens upward in the middle of the picture, and a dotted line runs right from its lowest point to the foot of a column standing at the side.',
      'At the start one level line lies across the parabola with a shape on it that never crosses the line — a single smooth hump.',
      'That level line does not sit on the dotted bottom line but floats above it, and the column holds exactly one block, a short one marked as half a step, filling the gap between them.',
      'A full-size block then descends from above and comes to rest on top of the column. While it is on its way no new level line exists.',
      'The moment it lands, a level line appears at the height of its top face, and on that line a shape grows out of flatness, this one crossing the line once, with a dot marking the crossing.',
      'The next block is the same size as the last, takes the same time to come down, and again the level appears at the height of its top face.',
      'Each new shape crosses its line one more time than the shape below it, and the crossings are marked with dots, so they can be counted: none, one, two, three, four.',
      'When five levels stand, the column reads as one half-size block at the bottom with four identical full blocks above it, and every joint between blocks has a level line touching it.',
      'The level numbering appears beside each shape, and the blocks carry the names of the step and the half step; no energy value is written anywhere.',
      'The shapes reach a little way outside the parabola at their ends rather than stopping where it crosses them.',
      'The upper levels and the blocks then fade and the picture returns to the single lowest level, and the round repeats.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The stacking runs on a fixed round and repeats.',
        'Sameness is shown by repeating one object rather than by measuring: the same block comes down four times and fits every time, and the finished column is itself the ruler.',
        'The block is laid on first and the level appears afterwards at its top face, so the level is read as the consequence of the block rather than as something the block was matched to.',
        'The half-size block at the foot of the column puts the floating of the lowest level on the same ruler as the even spacing, so the two facts are read off one picture.',
        'The dotted line from the bottom of the parabola is what the lowest level is seen to be above; without it the floating would have nothing to be measured from.',
        'Dots are placed at each crossing so that the number of crossings is counted rather than judged by eye.',
        'Every shape is drawn to the same peak height, because what is compared between levels is the number of crossings and not how tall the shape is.',
        'The blocks come down with a settling motion rather than a drop, so they are not read as falling under gravity.',
        'Five levels are shown — enough that the same block is laid four times, and few enough that the shapes do not run into one another.',
        'The colour set aside for a parcel of energy is used for the blocks and their names and for nothing else.',
        'It opens with the lowest level and the half block already in place and the first full block about to come down.',
      ],
    },

    useWhen: [
      'The article has said that a quantum oscillator has evenly spaced energies and the reader needs the evenness to be more than an assertion. The same block is laid on four times and fits each time.',
      'The point is that the lowest state is not rest. The lowest level is visibly held off the bottom of the well by a block half the size of the others, on the same ruler as everything above it.',
      'The reader is coming from a ladder whose rungs grow further apart and needs to see that the shape of the well is what decides the spacing. Here the well is a parabola and the rungs are identical.',
      'The article wants the level number to mean something about the state itself and not only its energy. Each shape crosses its line once more than the one below, and the crossings are marked to be counted.',
    ],

    avoidWhen: [
      'The subject is a mass on a spring swinging back and forth, its period, or how its energy moves between stretch and motion. Nothing here swings; the shapes stand still on their lines.',
      'The article is about levels growing further apart higher up, or about energies in the ratio one, four, nine. The whole point here is that the steps are identical.',
      'The point is how a finite wall lets the state leak and pulls the levels down, or what the depth of a well does.',
      'The subject is where the particle is likely to be found, the square of the shape, or how a quantum oscillator comes to resemble a classical one at high levels.',
      'The article needs a real frequency, a spacing in electronvolts, or the numbers for a particular molecule. Only the step and the half step are named, with no value.',
      'The subject is light given off when the oscillator drops a level, or a spectrum of such light. Nothing is emitted here; levels are only built up.',
    ],

    contrastWith: [
      {
        concept: 'particle-in-a-box',
        note: 'Both put a confined particle\'s energies in order, but one has walls so abrupt that the rungs pull apart as you climb, while the other has a gently curving well whose rungs stay exactly the same distance apart.',
      },
      {
        concept: 'finite-well',
        note: 'One asks how the levels of a spring-like well are spaced and where the lowest lies; the other keeps one level fixed in attention and asks what a wall of merely finite height does to it.',
      },
      {
        concept: 'simple-harmonic-motion',
        note: 'One is the back-and-forth of a body about a balance point and what sets its timing; the other keeps the same restoring pull but asks only what energies are permitted, with nothing in motion.',
      },
      {
        concept: 'shm-energy',
        note: 'One follows a single oscillator\'s energy trading back and forth between two kinds, any total being allowed; the other says which totals may be held at all, and that the smallest of them is not zero.',
      },
      {
        concept: 'potential-energy-curve',
        note: 'One reads a stored-energy curve against a line for the total and finds where a body must turn back; the other takes a curve of that same shape and asks which totals are possible in the first place.',
      },
    ],
  },
};
