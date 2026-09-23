/**
 * non-conservative-force 개념 선언.
 *
 * 형제 셋과 갈린 자리 —
 *   non-conservative-force  **경로 길이**가 값을 정한다. 되돌아와도 잃은 것은 자란다
 *   conservative-force      경로가 값을 정하지 못한다 — 끝점만 남는다
 *   energy-dissipation      잃은 것이 **어디에** 남는가 (열의 분포)
 *   kinetic-friction        마찰력 자체의 성질 (빠르기와 무관)
 * 이쪽만 「같은 두 점, 다른 길이」 · 「변위는 줄어도 경로는 늘어난다」 어휘를 갖는다.
 * 열 · 온도 · 속력은 말하지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const nonConservativeForceConcept: Aperi21ConceptSource = {
  id: 'non-conservative-force',
  label: 'Non-Conservative Force',
  canonicalSim: 'aperi21:non-conservative-force',

  surface: {
    definition:
      'A force whose total work between the same two points depends on how long a route was taken, adding up over every stretch travelled and never giving any of it back on the return.',
    exemplarKeywords: [
      'non-conservative force',
      'work that depends on the path taken',
      'why friction is not a conservative force',
      'a longer route costs more energy',
      'the loss to friction never comes back',
      'path dependent work',
      'why friction has no potential energy',
      'distance travelled versus displacement',
      'same start and finish but different amounts lost',
      'going there and back still loses energy',
    ],
  },

  briefing: {
    observable: [
      'Two identical blocks are moved at the same steady pace across the same rough floor on two lanes stacked one above the other, both starting at a marked point A and both ending at a marked point B.',
      'The upper block goes straight from A to B; the lower one carries on past B and then comes back to it.',
      'Below the floor in each lane, a coloured bar grows from A and records the energy lost so far; it is laid out at the same scale as the floor, so its length is the route unrolled flat rather than a position on the floor.',
      'While both blocks are between A and B the two bars grow side by side at the same rate.',
      'When the upper block stops at B its bar stops at the line drawn down from B and takes the mark fL; the lower bar carries straight on past that line.',
      'As the lower block travels back leftward its bar still grows rightward, and its friction arrow flips to oppose the new direction — the position is being undone while the loss is not.',
      'Both blocks end at B with the bars marked fL and 2fL, and the stretch of the lower bar beyond the B line is exactly as long as the whole upper bar, so the doubling is read off directly.',
      'A friction arrow is drawn on each block only while it is moving, always against the direction of travel, and the two arrows are the same length in both lanes.',
      'The A and B lines run down past the floor to the bars so the bars can be read against them, and a single measuring line marked L fixes what one span is.',
      'No numbers are written — only A, B, L, f and the two end marks.',
    ],

    screen: {
      affordances: [
        'The outward trip, the overshoot, the return and the two finished bars happen in order and then begin again.',
        'The run opens with both blocks already under way and both bars already growing.',
        'The two lanes are stacked so that the same moment can be compared across them — one bar has finished and been marked while the other is still adding.',
        'The bars are laid out flat at the floor’s own scale, so the lower one runs out beyond the rough stretch itself, which is the point: it measures route travelled and not ground occupied.',
        'The accent colour is kept for the lost energy alone — the bars and their end marks.',
      ],
    },

    useWhen: [
      'The article has said that friction is path-dependent and the reader takes this as a definition rather than a fact. The return trip, where the block comes back while its bar keeps growing, is the moment the two quantities visibly part company.',
      'A passage needs displacement separated from distance travelled, and a case is wanted where both blocks begin and end at the same places so that only the route differs.',
    ],

    avoidWhen: [
      'The question is where the lost energy ends up or what becomes of it. Nothing here says anything about that; the bars only count how much has gone.',
      'The force in question returns what it takes — gravity on a slope, a spring. The floor here is level and nothing is given back.',
      'The subject is what friction itself depends on, how rough a surface is, or the difference between a surface gripping and sliding. The friction is given as fixed from the start.',
      'The point is speed — how fast the blocks go, or that one slows down. Both are moved at the same steady pace and no velocity is drawn.',
      'The route in question changes height, so that lifting and lowering enter the account. The floor here is a single level line on purpose, so that gravity does no work at all.',
      'Values are wanted — a coefficient, an energy in joules, a length in metres. Only ratios are written.',
    ],

    contrastWith: [
      {
        concept: 'conservative-force',
        note: 'One is the case where taking the longer route costs strictly more; the other is the case where the route is irrelevant and only the endpoints count.',
      },
      {
        concept: 'energy-dissipation',
        note: 'One counts how much the route has cost and compares two routes; the other asks what became of what was taken, and answers by showing where it settled.',
      },
      {
        concept: 'kinetic-friction',
        note: 'One treats the friction force as a fixed given and asks what its work amounts to over a route; the other asks what sets the size of that force in the first place.',
      },
      {
        concept: 'conservation-of-mechanical-energy',
        note: 'One is the reason the total does not hold when such a force acts; the other is the case where no such force is present and the total does hold.',
      },
      {
        concept: 'kinetic-energy',
        note: 'One counts the loss as the route lengthens; the other reads a sliding distance backwards to find how much a body held before it started losing.',
      },
    ],
  },
};
