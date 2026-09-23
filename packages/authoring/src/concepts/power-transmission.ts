/**
 * power-transmission 개념 선언.
 *
 * 열과 변압의 이웃들과 **무엇이 주장인가**로 갈랐다. 이쪽은 **왜 높은 전압으로 보내는가**다.
 *   power-transmission 같은 전력을 열 배 전압으로 보내면 선의 전류가 1/10, 새는 열이 **1/100**
 *   joule-heating      저항이 전류를 **열로 바꾼다** — 같은 전류에서 큰 저항이 더 더워진다
 *   transformer        감은 수의 **비**가 전압을 정한다
 *   ohms-law           전압과 전류의 **비례**
 *   electric-current   전류가 **무엇을 세는가**
 * 이쪽만 송전 · 전력망 · 제곱으로 준다 · 전압을 올려 보낸다 어휘를 갖는다.
 * 변압기는 화면에 있지만 기호 둘일 뿐이라 감은 수 · 코일 · 철심 어휘는 두지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const powerTransmissionConcept: Aperi21ConceptSource = {
  id: 'power-transmission',
  label: 'Why Power Is Sent at High Voltage',
  canonicalSim: 'aperi21:power-transmission',

  surface: {
    definition:
      'That sending the same power down the same line at ten times the voltage needs only a tenth of the current, and so wastes a hundredth of the heat in the line, leaving almost all of it to arrive.',
    exemplarKeywords: [
      'why are power lines at high voltage',
      'national grid transmission',
      'step-up transformer at the power station',
      'energy lost as heat in cables',
      'I squared R losses in transmission lines',
      'pylons and overhead cables',
      'ten times the voltage leaves a tenth of the current in the line',
      'sending the same power a long way down one cable',
      'why is electricity not sent at mains voltage',
      'reducing waste on long distance cables',
      'efficiency of the electricity supply',
      'thick cables against high voltage',
    ],
  },

  briefing: {
    observable: [
      'Two routes run one above the other, each from a station on the left along a long line to a town on the right, and both are sending the same power down lines of the same resistance.',
      'The upper route sends at the lower voltage straight down its line; the lower route has a pair of ring symbols on it, one raising the voltage as it leaves and one lowering it before the town, and each route carries its sending voltage in writing.',
      'Grains run along both lines and are packed close together on the upper one and far apart on the lower, and a mark beside them says what they are and shows them going against the arrow that names the current.',
      'The current arrow on the upper route is long; on the lower it is so short that it reads as a stroke, and a fraction written beside it says how much of the upper it is.',
      'Heat pours off the upper line as several plumes throughout; almost nothing rises from the lower line.',
      'Two columns rise from a common floor on each route, one for the heat lost in the line and one for what reaches the town, both drawn to the same scale, with a dotted line above at the power that was sent.',
      'On the upper route the heat column climbs to half the dotted line, and the arriving column comes up to exactly the same height, so the two together make up what was sent.',
      'On the lower route the heat column stays flat on its floor, with a fraction written in the empty space above it, and the arriving column comes almost up to the dotted line.',
      'The lower heat column is left at its true height rather than raised to be visible, so the floor line under it is what says the place is not empty.',
      'The columns and the fractions are then cleared and the whole comparison is drawn again.',
      'Nothing carries a figure but the two sending voltages, the power sent, and the two fractions; no current, no loss and no arriving power is written out.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the two routes flow side by side, the fractions and the columns come up in turn, and the comparison is drawn again.',
        'Two routes are shown together rather than one route having its voltage raised, so the difference is a comparison held still rather than a change to be remembered.',
        'Everything but the voltage is kept the same on the two routes — the same power sent, the same line, the same distance — so the difference can only be laid to the voltage.',
        'How much current flows is carried by how closely the grains are packed rather than by how fast they run, so it can be read from a still moment; the grains run at the same speed on both routes.',
        'The two columns on each route stand on one floor and to one scale, so the heat lost and the amount arriving can be added up by eye against the dotted line above.',
        'The accent colour is spent entirely on what is lost as heat — the plumes, the heat columns and the fraction beside them; everything that arrives stays in ink.',
        'The plumes say that heat is escaping now and the columns say how much, so the loss is both an event and a quantity.',
        'The raising and lowering of the voltage are shown as two symbols with names, with nothing of their insides drawn.',
      ],
    },

    useWhen: [
      'The article has said that power is sent at high voltage to cut losses, and the reader cannot see why a higher voltage should waste less. Two routes carrying the same power with everything but the voltage held equal is what makes the voltage the only thing left to blame.',
      'The prose needs the squaring to be felt rather than derived — a current cut to a tenth and a heat column cut to a hundredth, standing on the same floor as the one it is being compared with.',
    ],

    avoidWhen: [
      'The subject is how a resistance turns current into heat, or two resistances warming differently on one line. Here both lines are the same resistance and what differs is the current in them.',
      'The article is about what goes on inside a transformer — its windings, its core, or how the turns decide the voltage. Only a symbol and a name appear for each of them here.',
      'The point is the proportion between voltage and current in a component, or a resistance read off a graph. Nothing is plotted here and the line resistance is the same throughout.',
      'The article is about alternating current itself, about frequency, or about why transformers need a changing current. The grains here drift steadily and do not swing back and forth.',
      'Values are to be worked out in amperes, in kilowatts or in ohms. Only the voltages, the power sent and the two fractions are written.',
      'The subject is safety, insulation, or why high voltage lines are dangerous or hung high up. Nothing here is about anything touching the line.',
      'The reader is meant to set the voltage themselves and watch the loss follow. The two routes are fixed and shown together.',
    ],

    contrastWith: [
      {
        concept: 'joule-heating',
        note: 'One takes the heating of a resistance as given and asks what may be arranged so that less of it happens; the other asks what the heating depends on in the first place.',
      },
      {
        concept: 'transformer',
        note: 'One uses the changing of voltage as a means and asks what is gained along the line between; the other asks what decides the change of voltage itself.',
      },
      {
        concept: 'efficiency',
        note: 'One is about a particular way of arranging a supply so that less is wasted on the way; the other is about the accounting by which what is wasted and what is useful are set against each other at all.',
      },
      {
        concept: 'electric-current',
        note: 'One reads a current as something to be made smaller for the sake of what it costs; the other asks what a current is counting.',
      },
      {
        concept: 'ohms-law',
        note: 'One holds the resistance of the line fixed and changes the voltage at which the power is sent; the other holds a resistance fixed and raises the voltage across it to see the current follow in proportion.',
      },
      {
        concept: 'energy-dissipation',
        note: 'One has energy leaving a specific place for a specific reason that can be designed against; the other is about energy leaving an organised form generally.',
      },
    ],
  },
};
