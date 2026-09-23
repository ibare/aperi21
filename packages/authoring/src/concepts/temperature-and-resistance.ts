/**
 * temperature-and-resistance 개념 선언.
 *
 * 저항 넷 가운데 이쪽은 **온도**다 — 모양도 전압도 그대로인 채 데우기만 한다.
 *   temperature-and-resistance 데우면 금속은 저항이 **오르고** 반도체는 **내린다** — 원인이 다르다
 *   ohms-law                   저항은 고정, **전압**을 올린다
 *   resistance-and-geometry    온도는 고정, **형태**를 바꾼다
 *   series-parallel-resistors  낱개 저항의 **연결**을 바꾼다
 * 온도·가열·금속 대 반도체·나르개 수 어휘는 이쪽에만 둔다. 띠 그림(가전자띠·전도띠)과
 * 스스로 달아오르는 줄 열은 화면에 없으므로 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const temperatureAndResistanceConcept: Aperi21ConceptSource = {
  id: 'temperature-and-resistance',
  label: 'Opposite Temperature Trends in Metal and Semiconductor',
  canonicalSim: 'aperi21:temperature-and-resistance',

  surface: {
    definition:
      'That heating a conductor changes its resistance, and in opposite directions for the two kinds: a metal passes less because a harder-trembling lattice obstructs a fixed population of carriers, a semiconductor passes more because the heat frees new ones.',
    exemplarKeywords: [
      'temperature coefficient of resistance',
      'why does resistance rise with temperature in metals',
      'a semiconductor conducts better when heated',
      'thermistor',
      'a hot filament resists more than a cold one',
      'negative and positive temperature coefficient',
      'lattice vibration getting in the way of electrons',
      'heat freeing electron and hole pairs',
      'does heating a conductor help or hinder the current',
      'metals and semiconductors go opposite ways',
    ],
  },

  briefing: {
    observable: [
      'A battery at the top runs two rails down the picture, and two bars of identical shape hang between them, one named metal and the other semiconductor, so that equal voltage across the two is seen in the wiring.',
      'A single thermometer stands outside on the left, marked at two temperatures only, so that the two bars being at the same temperature is likewise seen rather than stated.',
      'Beyond the right rail each bar has a flow bar of its own with a dotted outline drawn at the length it had when cold.',
      'Inside each bar three rows of lattice atoms tremble in place.',
      'The metal’s lanes are packed with electrons flowing steadily; the semiconductor holds only three electrons and three hollow circles, travelling opposite ways and each named.',
      'As the thermometer climbs, the trembling grows in both bars together.',
      'The metal’s electrons stay the same in number but slow down, their tails shortening, and are shaken up and down as they pass the trembling rows.',
      'In the semiconductor a pair springs into being at a lattice site and its two halves separate into opposite lanes, and each new pair adds a step to that bar’s flow.',
      'At the top temperature the metal’s flow bar stands well short of its dotted outline while the semiconductor’s stands several times beyond its own.',
      'Cooling runs the whole thing back: the pairs vanish in the order they appeared and both flow bars return to their dotted outlines.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the two bars are heated together, held at the top temperature, cooled together, and the run begins again.',
        'Each flow bar is measured against its own cold length, shown as a dotted outline, because the actual currents in a metal and in a semiconductor are orders of magnitude apart and would not share a scale.',
        'The two flow bars are therefore never set against each other; what each one says is only whether it has grown or shrunk from where it started.',
        'The trembling of the lattice is drawn far larger than it really is, so that a change of a few per cent reads as a change at all.',
        'Electrons and holes are told apart by filled against hollow, by their marks and by which way they travel, rather than by colour.',
        'The number of pairs in the hot semiconductor is a token figure chosen so that the bar does not fill up with carriers, not a count taken from the real rise.',
        'The metal’s electrons are shown shaken sideways as well as slowed, so that the slowing has a visible cause and not only a visible effect.',
      ],
    },

    useWhen: [
      'The article has said that resistance depends on temperature and the reader has fixed on one direction as the rule. Two bars under one thermometer with their flow bars going opposite ways is what stops the rule being remembered backwards for one of them.',
      'The prose needs the reason behind each direction, and a fixed number of carriers being obstructed set beside new carriers appearing are two pictures that can be pointed at separately.',
    ],

    avoidWhen: [
      'The article works in energy bands, a valence band and a conduction band or a gap between them. Nothing here is drawn in energy; pairs simply appear at lattice sites.',
      'A coefficient, a resistance in ohms, or a value at some temperature between the two marked ones is to be read off. Only two temperatures are marked and no resistance is written.',
      'The subject is a conductor heating itself because current is passing through it. The heat here comes from outside and is applied to both bars equally.',
      'The subject is doping, n-type and p-type material, or a junction between them. The semiconductor here is a plain bar and its carriers come only from heat.',
      'The article is about the shape or the material choice deciding the resistance. The two bars keep one shape throughout and are never recut.',
      'A thermometer or a temperature-sensitive component is to be used to measure something. Here the temperature is the cause and the flow is what answers.',
      'The subject is superconduction, or resistance vanishing at low temperature. The cooling here only returns both bars to where they started.',
    ],

    contrastWith: [
      {
        concept: 'ohms-law',
        note: 'One keeps the voltage fixed and lets the resistance itself change; the other keeps the resistance fixed and raises the voltage, which is what makes its points lie on a straight line at all.',
      },
      {
        concept: 'resistance-and-geometry',
        note: 'One changes the resistance without touching the conductor, by heating it; the other changes it by cutting the conductor longer or thicker, and the direction there never depends on the material.',
      },
      {
        concept: 'bimetal',
        note: 'Both make a temperature change visible through something else entirely, but one reads it as more or less charge getting through and uses the direction to tell metal from semiconductor, and the other reads it as a strip bending because two metals lengthen unequally.',
      },
      {
        concept: 'mean-free-path',
        note: 'One shows a fixed set of carriers held up by a lattice trembling harder; the other is about the average run between collisions itself, and what makes that distance long or short.',
      },
      {
        concept: 'joule-heating',
        note: 'One heats the conductor from outside and watches the resistance answer; the other lets the current do the heating and asks which of two resistances gets hot first.',
      },
    ],
  },
};
