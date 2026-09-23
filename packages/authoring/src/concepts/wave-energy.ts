/**
 * wave-energy 개념 선언.
 *
 * 「세기가 줄거나 전달되는」 넷 가운데 하나. 넷을 **무엇이 세기를 정하느냐**로 갈랐다.
 *   wave-energy              주어 = **진폭**. 주장 = 같은 시간에 실어 나른 양이 **제곱**을 따른다
 *   wave-attenuation         주어 = **거리**. 주장 = 같은 거리마다 같은 **비율**로 낮아진다
 *   impedance-mismatch       주어 = **경계**. 주장 = 다를수록 더 많이 **되돌아온다**
 *   sound-through-materials  주어 = **매질 종류**. 주장 = 먼저 닿거나 아예 **건너가지 못한다**
 * 이쪽만 「두 배 · 네 배 · 칸 · 쌓인다」 어휘를 갖는다. 줄어듦 · 경계 · 물질은 쓰지 않는다 —
 * 이 줄은 퍼지지도 줄지도 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const waveEnergyConcept: Aperi21ConceptSource = {
  id: 'wave-energy',
  label: 'Energy Delivered as the Square of Amplitude',
  canonicalSim: 'aperi21:wave-energy',

  surface: {
    definition:
      'The energy a wave delivers over a given time at a fixed frequency, which follows the square of the amplitude, so twice the swing hands over four times as much.',
    exemplarKeywords: [
      'energy of a wave',
      'energy is proportional to amplitude squared',
      'twice the amplitude, four times the energy',
      'E ∝ A²',
      'why is it squared and not doubled',
      'a taller wave hits harder',
      'louder sound carries more energy',
      'how much energy does a wave carry',
      'amplitude and energy of a wave',
      'big swell does far more damage than a small one',
    ],
  },

  briefing: {
    observable: [
      'Two ropes lie one above the other, shaken at the same rate and with the same wavelength, so their crests stand in vertical line with each other the whole time.',
      'At the left edge a mark on each rope gives its amplitude: A on the upper rope, 2A on the lower one. Nothing else differs between them.',
      'Each rope ends in a ring threaded on an upright post, which takes the wave in without sending anything back, and above each ring rides an arrow whose length is how fast that ring is moving.',
      'The two rings move in step, and whenever the upper arrow is at its longest the lower arrow beside it is exactly twice as long.',
      'Beside each ring stands a bar that fills as the ring receives energy: both bars grow on the same beat, faster while the rings are sweeping through the middle and barely at all while the rings are at the top or bottom of a swing.',
      'Tick marks labelled E, 2E, 3E and 4E run across both bars on one scale, so the two can be counted against each other cell by cell.',
      'When the filling ends the upper bar stands at exactly one cell and the lower bar at four, and that picture is held still to be read.',
      'The bars then fade and start again from empty while the ropes go on waving without a break.',
      'No joule, no watt and no formula appears; the only writing is A, 2A and the tick labels.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; one round runs about ten seconds and repeats.',
        'The screen opens partway through the filling, with the ropes already waving and both bars partly full.',
        'One cell is defined as what the upper rope delivers in the filling stretch, which is why the upper bar always ends on a tick and the lower one always ends on the fourth.',
        'Both ropes are drawn in the same colour and the same thickness; the only things separating them are their position and the amplitude marks.',
        'The comparison is a count of cells rather than a reading of a value, so no scale or axis is offered.',
      ],
    },

    useWhen: [
      'The article has written that a wave’s energy goes as the square of its amplitude and the reader has taken it as an algebraic fact with no picture behind it. Watching the ring move twice as fast and the bar beside it fill four times as far puts the squaring where it comes from.',
      'The point is that the square comes from two things doubling at once — how fast the end is dragged and how hard it is dragged — and the velocity arrow is the one of the two that is drawn, with the bar carrying the product.',
    ],

    avoidWhen: [
      'The article is about a wave getting weaker as it travels, through absorption or through spreading out. Neither rope loses anything along its length here; both deliver at full amplitude right to the end.',
      'Frequency is the quantity being varied. Both ropes are shaken at the same rate on purpose, and nothing here separates the part frequency plays.',
      'The subject is energy stored in an oscillator and traded back and forth between two forms. What is counted here is energy handed over at the far end and never given back.',
      'The article needs energies in joules, or a power in watts. The bars are counted in cells whose size is set by the upper rope, and nothing states what a cell is worth.',
      'The point is what happens when a wave reaches the end of its medium and comes back. The rings here swallow everything that arrives.',
    ],

    contrastWith: [
      {
        concept: 'kinetic-energy',
        note: 'The same square appears in both, once for a body carrying its own speed and once for a wave handing energy to something else; the wave case is the square of how far the medium swings, not of how fast the wave itself travels.',
      },
      {
        concept: 'wave-attenuation',
        note: 'One asks how much a wave delivers for a given amplitude; the other asks what becomes of that amplitude as the wave goes on, and so the two multiply rather than compete.',
      },
      {
        concept: 'shm-energy',
        note: 'One counts energy that leaves the system and piles up somewhere else; the other counts energy that stays inside an oscillator and only changes which form it is in.',
      },
    ],
  },
};
