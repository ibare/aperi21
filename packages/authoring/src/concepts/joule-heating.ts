/**
 * joule-heating 개념 선언.
 *
 * 이 묶음에서 이쪽만 **흐름이 무엇이 되는가**를 주장한다 — 나머지는 얼마나 흐르는가다.
 *   joule-heating              저항이 흐름을 **열**로 바꾼다. 한 줄로 이으면 큰 쪽이 더 빨리 뜨거워진다
 *   temperature-and-resistance 바깥에서 **데워** 저항이 어떻게 답하는지 본다 (인과가 반대다)
 *   ohms-law                   같은 저항이 얼마나 **흘리는가**
 * 열·온도 오름·전력 소모 어휘는 이쪽에만 둔다. 병렬에서 작은 저항이 더 뜨겁다는 짝 주장은
 * 화면에 없으므로 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const jouleHeatingConcept: Aperi21ConceptSource = {
  id: 'joule-heating',
  label: 'Heat Produced in a Resistance',
  canonicalSim: 'aperi21:joule-heating',

  surface: {
    definition:
      'That a resistance turns the current passing through it into heat, and that of two equally sized resistances carrying the very same current in one line, the larger one warms the faster.',
    exemplarKeywords: [
      'Joule heating',
      'P equals I squared R',
      'why do resistors get hot',
      'which of two resistors in series heats up more',
      'a heating element',
      'electrical energy turning into heat',
      'power dissipated in a resistor',
      'resistance wire getting warm',
      'two resistors in series do not heat equally',
      'the same current through both but not the same warming',
    ],
  },

  briefing: {
    observable: [
      'A square circuit carries a battery on the left, a switch on the bottom edge, and along the top edge two blocks of identical size set in one line, each labelled with its resistance.',
      'Inside each block two rows of atoms sit in line, nearly still, and beneath each block a thermometer stands at room level.',
      'With the switch lifted the grains stand still and nothing has a tail.',
      'The lever comes down; grains run round the loop with tails behind them and pass through both blocks in turn, at the same speed and spacing in each, threading between the rows of atoms.',
      'Both thermometers begin to climb, and the column under the larger resistance rises three times as fast as the other.',
      'The rows of atoms in the larger-resistance block lose their alignment and scatter, while the other block stays nearly in line.',
      'When the lever lifts, the grains stop, the tails go, and both columns fall back to room level while the trembling dies away.',
      'Neither block is drawn glowing or tinted by its temperature: how hot it is is said by the column and by how far the atoms have strayed from their rows.',
      'No temperature, current or power figure appears anywhere; only the two resistances and the supply voltage, which were set.',
      'The two blocks are drawn the same size, so the same rise in either means the same heat taken in.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the switch closes, the two columns climb apart, the switch opens, both cool, and the run begins again.',
        'The two resistances are wired in one line so that the same current passing through both is a matter of the drawing, and a single grain can be watched entering each in turn.',
        'The two blocks are drawn the same size so that they store heat alike, and the difference in how fast they warm belongs to the resistance alone.',
        'Temperature is never shown as colour or as glow; it is the height of a column and how far the atoms have strayed from their rows.',
        'No heat escapes while the current runs, so each column climbs at its own steady rate and the ratio of the two heights holds at every moment.',
        'The run arrives already flowing and already warming, so the difference is on screen from the first instant.',
        'The trembling says what being hot is, and the columns say how fast; neither alone would carry both.',
      ],
    },

    useWhen: [
      'The article has given the power in a resistance as current squared times resistance, and the reader expects two components carrying the same current to warm alike. Two columns climbing at plainly different rates is the evidence.',
      'The prose needs heat made visible as something other than a number, and a lattice losing its order is where the energy can be seen going.',
    ],

    avoidWhen: [
      'The two resistances are side by side across one supply rather than in one line, where it is the smaller that heats more. This arrangement is a single line and the current is common to both.',
      'A temperature, a power or an energy is to be read off. Nothing is written but the two resistances and the supply voltage.',
      'The subject is how heat then spreads — through the block, into the air, along a bar, to a cooler body. Nothing leaves the blocks while the current runs.',
      'The article is about a filament glowing, about colour changing with temperature, or about light given off. Nothing glows and no colour follows the heat.',
      'The subject is the resistance changing because the conductor has grown hot. The two resistances here hold their values from beginning to end.',
      'The reader is to choose the resistances or the supply. The run works through its own cycle.',
      'What is wanted is how much current flows for a given voltage. One voltage is used and no current is written.',
    ],

    contrastWith: [
      {
        concept: 'temperature-and-resistance',
        note: 'The two run the causation opposite ways: one lets the current heat the conductor and asks which resistance warms faster, the other heats from outside and asks what the resistance does in answer.',
      },
      {
        concept: 'energy-dissipation',
        note: 'Both end with ordered energy leaving as heat, but one follows a current through a resistance, and the other a motion dying away against friction or drag.',
      },
      {
        concept: 'series-parallel-resistors',
        note: 'One wires two resistances in a single line so that the current through both is the same and the larger warms faster; the other asks how the arrangement decides what current is drawn in the first place.',
      },
      {
        concept: 'specific-heat',
        note: 'One deliberately gives the two blocks the same capacity so that the difference in warming belongs to the resistance; the other is about that capacity itself, and how much heat a substance needs for one degree.',
      },
      {
        concept: 'ohms-law',
        note: 'One is about what the current leaves behind in a resistance; the other about how much current that resistance lets through for a given voltage.',
      },
    ],
  },
};
