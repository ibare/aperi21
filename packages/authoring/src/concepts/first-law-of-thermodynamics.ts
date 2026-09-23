/**
 * first-law-of-thermodynamics 개념 선언.
 *
 * 이 묶음에서 혼자 **에너지 장부** 를 다룬다. PVT 셋과 갈리는 자리는 주어다 —
 * 저쪽은 기체가 **어떤 상태로 가는가**, 이쪽은 거기 가는 데 넣은 열이 **무엇에 쓰였는가**.
 *   ideal-gas-law  붙들고 바꾸면 남은 하나가 따라간다 (배수)
 *   first-law      넣은 열이 데우는 몫과 미는 몫으로 **갈린다**, 고정하면 다 남는다
 * 이쪽만 알갱이 · 더미 · 갈림 · 핀으로 고정 · 잔상 눈금 어휘를 갖는다.
 * 자물쇠 · 배수 막대 · 곡선 · 넓이 · 직선은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const firstLawOfThermodynamicsConcept: Aperi21ConceptSource = {
  id: 'first-law-of-thermodynamics',
  label: 'Where the Heat Put In Goes',
  canonicalSim: 'aperi21:first-law-of-thermodynamics',

  surface: {
    definition:
      'Heat delivered to a gas divides between warming it and shoving the piston outward, and pinning the piston leaves the whole of it inside the gas.',
    exemplarKeywords: [
      'first law of thermodynamics',
      'where does the heat go when you heat a gas',
      'the heat splits between warming and pushing',
      'why does a gas heat up less if it is allowed to expand',
      'internal energy work and heat',
      'pinning the piston so nothing can move',
      'energy put in has to be accounted for',
      'the gas does work on its surroundings as it expands',
      'the same heat gives a bigger temperature rise in a rigid container',
      'keeping books on the energy of a gas',
    ],
  },

  briefing: {
    observable: [
      'A cylinder of helium stands at the left with a weighted piston on top and a heating plate beneath; at the right are three piles, one holding five identical grains of heat about to be delivered and two standing empty beneath labels for warming the gas and for shoving the piston.',
      'The grains leave the full pile one at a time, arc across and land in one of the two empty piles, so the splitting is something watched rather than announced.',
      'While the grains travel the plate under the cylinder glows, the molecular trails inside lengthen, a temperature bar fills upward, and the piston rises above a dotted line marking where it started.',
      'With the piston free, three of the five grains land in the warming pile and two in the shoving pile.',
      'A second run then begins with two pins driven through the cylinder wall just above the piston, so it cannot move.',
      'The same five grains are delivered and every one of them lands in the warming pile, while the piston stays on the dotted line and the shoving pile stays empty.',
      'The heights the first run reached are left in the picture as dotted outlines on the piles and as a faint mark on the temperature bar, so the warming pile visibly rises above its earlier outline and the bar climbs past its earlier mark.',
      'The temperature bar is one filled height with the starting temperature marked and the rise written beside it; heat is not given a colour of its own beyond the grains.',
      'All the grains are the same colour whichever pile they land in, since they are all the same heat that was put in — which pile they land in is the only thing that differs.',
      'The amount of heat and the amount of gas are each written once, on their own labels; nothing else is given a value in joules.',
    ],

    screen: {
      affordances: [
        'The two runs follow one another and then begin again; nothing has to be pressed.',
        'The comparison is carried by what the first run left behind — dotted pile outlines and a faint temperature mark — rather than by two cylinders side by side, so both runs get the full width of the picture.',
        'The split is shown as a count of grains rather than as a ratio written out, so the reader arrives at three against two by looking.',
        'The pins are drawn through the cylinder wall and sit directly on the piston, which is what makes the second run a condition imposed rather than a different gas.',
        'The piston rising is measured against a dotted line at its starting place, so the shoving is a visible distance and not merely a claim in the accounting.',
      ],
    },

    useWhen: [
      'The article has given the energy relation for a gas as a formula with three terms and the reader cannot tell which way round the terms go. Grains leaving one pile and landing in one of two is what makes the bookkeeping something to follow.',
      'The reader is puzzled that the same heat gives different temperature rises, and the moment wanted is the second run, where pinning the piston sends every grain into the warming pile and carries the bar past where the first run stopped.',
      'The article says a gas does work as it expands and the reader hears it as a figure of speech; the piston lifting a weight above its starting line while two grains are diverted is where the work becomes a payment.',
    ],

    avoidWhen: [
      'The point is what state the gas ends in — which of pressure, volume and temperature followed which. This picture is about what the heat was spent on, and the state only comes in as the bill.',
      'The article follows a full cycle, or asks how much of the heat could be turned into work, or why some of it cannot be. One heating is shown here, twice, and nothing ever returns to where it began.',
      'The subject is heat travelling — conduction along a bar, or warming by contact. The heat here arrives already counted, as grains.',
      'The claim is about molecules striking a wall, or about the spread of their speeds. Molecules drift in this cylinder as a sign that it is warming and nothing counts or sorts them.',
      'Values in joules for each share are wanted, or a heat capacity is to be quoted. Only the heat put in and the amount of gas are written; the shares are counts of grains.',
      'The article needs a gas warming without heat being supplied at all, as in a quick compression. Every run here begins with heat being delivered.',
    ],

    contrastWith: [
      {
        concept: 'ideal-gas-law',
        note: 'One asks what the gas was brought to; the other asks what was spent bringing it there, and finds that the same spending buys different amounts depending on whether the piston could move.',
      },
      {
        concept: 'energy-flow-diagram',
        note: 'Both follow a quantity of energy as it divides among destinations; one does it for heat entering a gas, where one branch is a temperature and the other a moved piston, and the other for a machine, where the branches are what it delivers and what it wastes.',
      },
      {
        concept: 'conservation-of-mechanical-energy',
        note: 'One keeps books that balance only once heat is admitted as an entry; the other is the special case in which no such entry is needed because nothing is lost to warming.',
      },
      {
        concept: 'work-energy-theorem',
        note: 'One has work as one of two places the heat can go; the other has work as the whole account, changing a body’s motion and nothing else.',
      },
      {
        concept: 'energy-dissipation',
        note: 'One shows heat arriving and being divided deliberately; the other shows ordered motion leaking into warmth that is not divided but lost.',
      },
      {
        concept: 'isothermal-process',
        note: 'One divides the heat between what stays in the gas and what leaves as work, with a pinned piston as the case where none leaves; the other is the opposite extreme, where the temperature is held so that none can stay and the whole of it goes out as work.',
      },
    ],
  },
};
