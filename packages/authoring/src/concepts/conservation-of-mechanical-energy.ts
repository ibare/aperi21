/**
 * conservation-of-mechanical-energy 개념 선언.
 *
 * 주제 id 는 `conservation-of-mechanical-energy`, 조각 등록 키는
 * `aperi21:conservation-of-mechanical-energy` 다 (`docs/topics/topics.yaml` 의 `sim` 값 그대로).
 *
 * 옛 화면(`ramp-energy` — 경사면 셋을 내려와 끝 속력이 같다)을 기준으로 쓰였던 것을
 * 새 화면 기준으로 전면 재작성했다. 지금 화면은 골짜기를 공 하나가 **왕복**하며 두 몫이
 * 서로 자리를 내주는 동안 합이 그대로임을 보인다.
 *
 * 에너지 이웃과 갈린 자리 — **무엇을 묻는가**로 갈랐다.
 *   conservation-of-mechanical-energy  두 몫이 **서로 오가는 내내 합이 그대로인가** —
 *                                      그래서 떠난 높이로 정확히 되돌아온다
 *   gravitational-potential-energy     높이에 **얼마나** 담기고 그만큼 일로 돌려주는가 (한 방향)
 *   potential-energy-curve             곡선과 에너지 선이 만나는 자리가 **어디까지 갈 수 있는가**
 *                                      를 가둔다 (추상 도표, 총량을 바꿔 가며 읽는다)
 *   kinetic-energy                     주어진 속력에 **얼마나** 담기는가 (제곱)
 * 이쪽만 「서로 자리를 바꾼다 · 합이 그대로다 · 같은 높이로 되돌아온다」 어휘를 갖고,
 * 양이 무엇에 비례하는지는 말하지 않는다.
 *
 * 화면에 조작기가 없다. affordances 에 「조작이 없다」 를 적지 않고 **무엇이 저절로
 * 일어나는지**를 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const conservationOfMechanicalEnergyConcept: Aperi21ConceptSource = {
  id: 'conservation-of-mechanical-energy',
  label: 'Conservation of Mechanical Energy',
  canonicalSim: 'aperi21:conservation-of-mechanical-energy',

  surface: {
    definition:
      'The rule that with no friction a body’s potential and kinetic energy pass continually into one another while their total stays unchanged, so it returns to every height it left.',
    exemplarKeywords: [
      'conservation of mechanical energy',
      'potential energy turning into kinetic energy and back',
      'the total of potential and kinetic energy stays the same',
      'why a pendulum comes back to the same height',
      'a ball rolling in a frictionless bowl',
      'height turning into speed and speed turning back into height',
      'energy is not created or destroyed only converted',
      'swinging back and forth without losing height',
      'a skateboarder in a half pipe',
      'why it stops at the same level on the other side',
      'mechanical energy is conserved',
      'trading height for speed',
    ],
  },

  briefing: {
    observable: [
      'A single ball travels back and forth along a smooth valley track, gathering speed as it comes down and losing it as it climbs the far side.',
      'A column travels with the ball, standing from the ground line up to a horizontal dashed line that sits at the height the ball started from, and the ball itself is the place where that column is divided.',
      'The part of the column below the ball is drawn as solid fill and the part above it as diagonal hatching — the same colour throughout, because the two are shares of one quantity rather than two different things.',
      'Coming down, the filled part shrinks and the hatched part grows by the same amount; going up, the exchange runs the other way, and at no moment does the top of the column leave the dashed line.',
      'At the bottom of the valley the filled part is gone altogether and the column is hatched from end to end, while the ball is moving at its fastest and horizontally.',
      'At each end of the swing the hatching is gone and the column is filled from end to end, with the ball standing still on the dashed line before it comes back.',
      'A velocity arrow on the ball is longest at the bottom and disappears where the ball turns round, so the hatched share is witnessed by something outside the column.',
      'The track carries on past the point where the ball turns back, so what stops the ball is visibly the height it has reached and not the end of the track.',
      'The ball returns to the very place it was released from and the column there is full again, which closes the round trip.',
      'A name is written inside each share and vanishes when that share becomes too small to carry it, so nothing is labelled once it is no longer there.',
      'No speeds, heights or energies appear as numbers anywhere, and no grid or axes are drawn — the only thing being read is whether the top of the column moved.',
    ],

    screen: {
      affordances: [
        'The round trip runs and repeats on its own — down one side, up the other, and back again — so the whole exchange and its return come round without anything being asked for.',
        'All four quarters are played at a little under half speed, because at ordinary pace a quarter swing is too short for the two shares to be watched changing places.',
        'The run opens part way down the first descent, at the moment the column happens to be divided into two equal shares, rather than with a ball waiting at the top.',
        'The dashed line does two jobs at once: it is where the top of the column rests and it is the height the ball climbs back to, and the two places where it crosses the track are where the ball turns.',
        'The accent colour is kept for the mechanical energy alone — the two shares of the column and the line their sum reaches — while the ball, its arrow and the track are left in plainer colours.',
        'The caption changes as the ball falls and as it rises, then holds one line through the second half where the same exchange repeats.',
      ],
    },

    useWhen: [
      'The article has stated that energy is conserved and the reader has no way to see a total, because what is actually on view is a height falling and a speed rising. A column whose dividing point runs up and down while its top never moves is what makes the total something to look at.',
      'The reader is to be shown that the conversion runs both ways — that motion becomes height again and not only the reverse — and a screen is wanted in which the body comes back rather than arriving somewhere and stopping.',
      'A passage needs the fact that a body released from rest climbs to exactly the height it started from, and the argument turns on that equality being visible rather than calculated.',
    ],

    avoidWhen: [
      'Friction, air resistance or a collision that takes a share is part of the article. This track is frictionless by construction and the return to the starting height is exact.',
      'The energy comes from outside — a push, a motor, a hand doing work on the body. Nothing acts on the ball here but gravity and the track it is threaded on.',
      'The subject is how much is stored at a given height, or that the store grows in proportion to height. The column is divided here, never measured, and no ratio of heights is put on screen.',
      'The point is how much energy a body at a stated speed holds, or the square in that quantity. Two different speeds are never set against each other.',
      'The article works from a potential energy diagram — a curve against position with an energy line laid across it. Nothing abstract is plotted here; the ball rides on the physical track itself.',
      'Values are wanted — a speed, a height, an energy, or a check that two numbers agree. Nothing numeric is written anywhere.',
      'The theme is the period of the swing, or how the time depends on the amplitude. The timing is not marked or compared, and the screen makes no claim about it.',
      'Rolling, spin, or a body whose own rotation holds part of the energy is the subject. The ball is drawn as a bead sliding along the track.',
    ],

    contrastWith: [
      {
        concept: 'gravitational-potential-energy',
        note: 'One is about a store being filled by lifting and handed back on the way down, which is a one-way trade with an amount attached to it; the other takes the store as given and asserts only that the running total holds while the two forms exchange in both directions.',
      },
      {
        concept: 'kinetic-energy',
        note: 'One says how much a body holds at a given speed and answers with a square; the other says nothing about how much, only that whatever is held passes whole from one form to the other.',
      },
      {
        concept: 'potential-energy-curve',
        note: 'One keeps a single total fixed and follows a body through the exchange; the other varies the total on purpose and reads off, from where the curve and the energy line meet, how far the body is allowed to go.',
      },
      {
        concept: 'work-energy-theorem',
        note: 'One is about work delivered from outside setting the speed a body ends with; the other is about a body nothing acts on from outside, where nothing is added to the total and nothing is taken from it.',
      },
      {
        concept: 'energy-dissipation',
        note: 'One is the case where the mechanical total drains away into warming while a wider total stays whole; the other is the case where the mechanical total alone already holds and nothing wider is needed.',
      },
      {
        concept: 'conservative-force',
        note: 'One is a claim about a single force, that the work it does between two places does not depend on the route taken; the other is the claim about a total energy that follows once every force acting is of that kind.',
      },
      {
        concept: 'non-conservative-force',
        note: 'One is why the total fails to hold whenever such a force acts; the other is the case in which none is present and the total holds exactly.',
      },
    ],
  },
};
