/**
 * semiconductor-doping 개념 선언.
 *
 * 반도체 여섯 가운데 이쪽은 **불순물이 운반자를 만든다** 하나만 주장한다.
 *   semiconductor-doping  순수한 격자에는 움직일 것이 없고, 원자 하나를 바꾸면
 *                         남는 전자(n형) · 결합의 빈자리(p형)가 생긴다
 *   band-theory           틈의 너비가 세 갈래를 가른다 — 넘어야 운반자가 생긴다
 *   pn-junction           그렇게 만든 두 쪽을 **맞붙였을 때** 경계에서 일어나는 일
 * 이쪽만 격자 · 결합 · 원자가 전자 다섯/셋 · 도너/억셉터 준위 · n형과 p형 어휘를 갖는다.
 * 고정 이온 전하(`P⁺` · `B⁻`)와 페르미 준위는 화면에 없으므로 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const semiconductorDopingConcept: Aperi21ConceptSource = {
  id: 'semiconductor-doping',
  label: 'An Impurity Supplying the Carrier',
  canonicalSim: 'aperi21:semiconductor-doping',

  surface: {
    definition:
      'How a trace of foreign atoms makes an otherwise idle crystal carry current: one with five outer electrons leaves a spare, one with three leaves a bond short, and the two kinds of material follow from that.',
    exemplarKeywords: [
      'doping a semiconductor',
      'n-type and p-type material',
      'phosphorus and boron put into silicon',
      'donor and acceptor atoms',
      'why does a trace of impurity make silicon conduct',
      'a spare electron from an atom with five outer electrons',
      'a missing bond behaving as a positive carrier',
      'extrinsic semiconductor',
      'a level just under the upper band',
      'the vacancy moving from bond to bond',
      'what adding an impurity does to a crystal',
      'two kinds of carrier going opposite ways',
    ],
  },

  briefing: {
    observable: [
      'Two square lattices of identical build stand side by side, every atom named and joined to its neighbours by bonds carrying two electrons apiece, with short stubs reaching out of the picture at the edges.',
      'One field arrow of the same direction stands over both from the very start, and while the lattices are pure nothing at all moves under it.',
      'Then one atom in the middle row of each lattice changes to a foreign one and turns the accent colour — a different element on each side.',
      'Beside the one on the left an extra electron appears that is in no bond at all; on the right, one electron of a neighbouring bond fades out and a hollow ring fills its place.',
      'Small energy pictures beside each lattice gain a dashed accent level of their own — close under the upper band on one side, close over the filled band on the other — with a figure in electronvolts set against the much larger figure for the gap itself.',
      'The spare electron then leaves into the open space between bonds and drifts against the field arrow, trailing a short tail behind it.',
      'On the other side an electron from the next bond arcs over an atom and drops into the vacancy, so the hollow ring steps one bond along, with the field arrow, and it goes on stepping like that.',
      'The electron moves continuously wherever there is room, while the vacancy only ever moves from one bond to the next, with a pause between steps.',
      'The two panels are named as the two kinds of material once the foreign atoms have arrived.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The lattices begin pure, the foreign atoms arrive, the carriers are freed and set off, and the round repeats.',
        'It opens with pure material under the field, because "the impurity makes the carrier" needs "there was nothing to move" to be seen first, not stated.',
        'The two kinds are set side by side under one field arrow rather than offered as a choice, since the point is that they go opposite ways.',
        'The vacancy is never slid along as an object; a neighbouring electron crosses into it and the empty place is left behind, which is what makes it a vacancy rather than a positive particle.',
        'The crossing electron arcs over the atom rather than through it, passing between the electrons of the upright bond.',
        'Only the freely moving electron is given a tail, so a still frame says which of the two is running and which is stepping.',
        'Carriers are drawn in one ink and told apart by a filled dot against a hollow ring and by their marks, so nothing is explained by colour.',
        'The accent colour is kept for the foreign atom and its level, because that is the one thing that was changed.',
        'The added level is drawn several times deeper than it truly is, or it would lie on top of the band edge, while the figure written beside it is the true one.',
        'No charge sign is put on the foreign atoms themselves, so the only plus and minus marks on screen belong to the carriers.',
        'No count of impurities, carriers or conductivity is given; one foreign atom and one carrier carry the claim.',
      ],
    },

    useWhen: [
      'The article has said that doping makes a semiconductor useful and the reader has no picture of what is added or what appears. One atom changing in a lattice, and a carrier appearing beside it, is that picture.',
      'The prose needs the two kinds of material to be two different carriers rather than two labels. Two lattices under one field arrow, one carrier running each way, is the comparison.',
      'The reader is stuck on what a positive carrier could be. A vacancy advancing because its neighbours keep crossing into it is the answer without a positive object being drawn.',
      'The point is that the carrier arrives far more cheaply than by crossing the gap. The small added level set against the much larger gap figure is where to look.',
    ],

    avoidWhen: [
      'The article is about two doped pieces brought together, a layer at their boundary, or a device made from them. Two separate lattices are shown and nothing is joined.',
      'The subject is how solids are sorted into conductors, insulators and semiconductors, or how wide a gap must be. One material is shown and no comparison of kinds is made.',
      'The point is where the filling boundary lies, or how doping moves it. Nothing on screen is drawn as an occupancy boundary.',
      'The article turns on the fixed charge an impurity is left holding once its carrier has gone. No charge sign is put on any atom here.',
      'The subject is heat freeing carriers, or how conduction changes with temperature. Nothing here is heated; the carriers come from the impurities.',
      'A doping concentration, a carrier count or a conductivity figure is wanted. One impurity and one carrier stand for the whole effect.',
    ],

    contrastWith: [
      {
        concept: 'band-theory',
        note: 'One says a semiconductor conducts when something lifts an electron across the gap; the other says an added atom provides the carrier outright, so the gap never has to be crossed.',
      },
      {
        concept: 'pn-junction',
        note: 'One makes the two kinds of material and shows what each carries; the other puts them face to face and is about what happens in the strip where they meet.',
      },
      {
        concept: 'fermi-level',
        note: 'One is about an added atom creating a carrier in an otherwise idle crystal; the other is about how far up the levels are filled in the first place and how sharp that edge is.',
      },
      {
        concept: 'temperature-and-resistance',
        note: 'Both end with carriers that were not there before, but one gets them from a foreign atom and can make either kind at will, and the other gets them from heat and gets both kinds together.',
      },
      {
        concept: 'drift-velocity',
        note: 'One is about whether there is anything at all to be moved by a field; the other takes the carriers for granted and asks how slowly the whole population edges along.',
      },
    ],
  },
};
