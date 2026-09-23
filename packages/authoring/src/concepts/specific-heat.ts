/**
 * specific-heat 개념 선언.
 *
 * 위험한 짝 셋 중 하나. 주어로 갈랐다 — 이쪽의 주어는 **물질의 성질**이다.
 *   thermal-equilibrium  맞붙은 두 덩이가 다가가다 멎는다
 *   specific-heat        같은 열을 받아도 **물질마다 오르는 폭이 다르다**
 *   calorimetry          섞은 결과의 온도가 어디서 정해지는가
 * 이쪽만 「세 물질 · 같은 가열기 · 오른 폭의 견줌 · J/(kg·K)」 어휘를 갖는다. 섞음 · 최종
 * 온도 · 다가감 · 멈춤은 쓰지 않는다 — 세 덩이는 서로 닿지 않고 제 가열기만 받는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const specificHeatConcept: Aperi21ConceptSource = {
  id: 'specific-heat',
  label: 'Specific Heat as a Property of the Material',
  canonicalSim: 'aperi21:specific-heat',

  surface: {
    definition:
      'A property of a substance saying how much heat a kilogram of it needs for a one-degree rise, so that equal masses given equal heat finish at unequal temperatures.',
    exemplarKeywords: [
      'specific heat capacity',
      'why does water heat up so slowly',
      'water against copper and aluminium',
      'same heat, different temperature rise',
      'the c in Q = mcΔT',
      'metals warm quickly, water hardly at all',
      'why the sand burns while the sea stays cool',
      'joules per kilogram per kelvin',
      'which material needs more heat to warm',
      'water is good at storing heat',
    ],
  },

  briefing: {
    observable: [
      'Three lanes stand side by side. Each holds a block of the same size and the same colour with 100 g written inside it, an identical heater beneath it, and a temperature bar to its right.',
      'Above each block are its name — water, aluminium, copper — and its specific heat written out: 4180, 900 and 385 J/(kg·K).',
      'All three bars begin on one dashed line at 20 ℃, which is the common floor the rises are measured from.',
      'The three coils light at the same instant, and in every lane grains rise from the heater into the block at the same spacing and in the same places, so the sameness of what is going in is a matter of shape rather than of assertion.',
      'While that identical stream runs, the part of each bar above the dashed line grows by different amounts: copper furthest, aluminium next, water barely clear of the line.',
      'The heaters switch off together and +2000 J is written beneath each of the three blocks — the same figure three times.',
      'The stopped bars stand at three plainly different heights, and nothing separates the three lanes but the names, the specific-heat figures and those heights.',
      'The risen part of each bar is drawn in the darker shade of one colour and the part below the dashed line in the lighter shade, so the rise reads as a portion of the same thing rather than as another quantity.',
    ],

    screen: {
      affordances: [
        'One round carries the three lanes from cold, through the heating, to the stopped bars, and then starts over; nothing has to be pressed.',
        'The three blocks are drawn at equal size on purpose, although equal masses of these materials take very different volumes, because a smaller block would be read as the reason it warms faster.',
        'The three grain streams are generated alike, so any difference on the screen has to come from the material and not from what was fed in.',
        'All three bars share one scale and one starting line, which is what makes the comparison a matter of reading heights side by side.',
        'The figures written are the ones chosen in advance — mass, starting temperature, specific heat, heat delivered — and no finishing temperature appears.',
      ],
    },

    useWhen: [
      'The article has said that materials differ in how much heat it takes to warm them, and the reader has that as a table of numbers. Three identical heaters running into three identical-looking blocks and producing three unequal bars is the same claim as an observation.',
      'The point is that water is the awkward one — that it takes an unusual amount of heat for very little rise — and what is wanted is the water bar sitting almost on the starting line while the copper bar has climbed most of the tube.',
    ],

    avoidWhen: [
      'The article pours one body into another and wants the temperature they settle at. Nothing here is mixed; each block has its own heater and never meets the others.',
      'The subject is two bodies in contact drawing level. The three blocks never touch and never approach a common value — they end further apart than they began.',
      'Melting, boiling or any change of state is at issue. All three blocks stay solid or liquid as they started and only their temperatures move.',
      'A finishing temperature is needed, or the rise in degrees. Those are not written anywhere; the rise is a length above a line.',
      'The article is about heat travelling — along a rod, through a fluid, across a gap. Here the heat simply arrives from below in each lane.',
    ],

    contrastWith: [
      {
        concept: 'calorimetry',
        note: 'One is the property itself, read off by giving different materials the same heat; the other puts that property to work, using it to locate where a mixture of two portions comes to rest.',
      },
      {
        concept: 'thermal-equilibrium',
        note: 'One holds bodies apart and compares what the same heat does to each; the other puts two bodies together and follows them until nothing more flows between them.',
      },
      {
        concept: 'latent-heat',
        note: 'One is about heat that raises a temperature, with the size of the rise depending on the substance; the other is about heat that raises no temperature at all while the substance changes state.',
      },
      {
        concept: 'thermal-conduction',
        note: 'Both name a way materials differ, but at different questions — one is how much heat a material swallows per degree, the other is how readily heat travels through it.',
      },
    ],
  },
};
