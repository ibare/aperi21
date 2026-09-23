/**
 * series-parallel-resistors 개념 선언.
 *
 * 저항 넷 가운데 이쪽은 **연결 방식**이다 — 같은 전지와 같은 저항 둘을 어떻게 잇느냐.
 *   series-parallel-resistors  전압도 저항도 그대로 두고 **잇는 방식**만 바꾼다
 *   ohms-law                   저항 하나를 두고 **전압**을 올린다 (비례 · 직선 · 기울기)
 *   resistance-and-geometry    도선 한 개의 **형태**를 바꾼다
 *   temperature-and-resistance 도선 한 개를 **데운다**
 * 직렬·병렬·연결·합성 어휘는 이쪽에만 둔다. ohms-law 와 붙지 않도록 definition 의
 * 주어를 「전압」 이 아니라 「잇는 방식」 으로 두고, 비례·기울기·I–V 어휘를 쓰지 않는다.
 *
 * 화면에 조작기가 없다. affordances 에 「누를 것이 없다」 를 적지 않고 **저절로
 * 일어나는 것**을 적는다.
 *
 * 화면이 주장하는 것은 **전지가 내주는 전류**다 — 합성 저항 값도, 가지마다의 전류 값도
 * 화면에 없다. definition·observable 을 거기에 맞춘다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const seriesParallelResistorsConcept: Aperi21ConceptSource = {
  id: 'series-parallel-resistors',
  label: 'Series and Parallel Connection of Two Resistors',
  canonicalSim: 'aperi21:series-parallel-resistors',

  surface: {
    definition:
      'That how two identical resistors are connected to one fixed supply decides the current it delivers: joined end to end they draw less than either alone, joined side by side more.',
    exemplarKeywords: [
      'resistors in series and in parallel',
      'does it matter how two resistors are connected',
      'why adding a resistor in parallel lets more current flow',
      'putting a resistor in series cuts the current down',
      'combined resistance of two resistors',
      'equivalent resistance of two resistors',
      'total current drawn from the battery',
      'the same two resistors wired two different ways',
      'series resistances add, parallel ones do not',
      'why household appliances are wired in parallel',
      'one branch or two branches across the same battery',
    ],
  },

  briefing: {
    observable: [
      'Three circuits stand side by side, each built from the same battery and the same resistors: one resistor alone across the battery, two in a single loop one after the other, and two on separate branches between the same pair of junctions.',
      'Every one of the five resistor symbols carries the same value and every one of the three batteries carries the same voltage, so what differs between the circuits is the wiring and nothing else.',
      'Electron grains run round all three loops, marked once as electrons and travelling against the conventional direction, with the same spacing in every wire so that how fast they go is what says how much current there is; each drags a tail whose length is that speed.',
      'A gate on the lower wire of each circuit darkens, and from then on the charge that has passed the battery stacks up as a column beneath that circuit.',
      'The three columns rise from one shared floor, and they rise at three different rates — the parallel one fastest, the series one slowest.',
      'The columns are built of separate blocks with gaps between them, so the heights are counted rather than eyeballed: the single resistor comes to two blocks, the series pair to one, the parallel pair to four.',
      'Once the counting stops, a dashed line in the accent colour is laid across all three at the height the single resistor reached; the series column stands below that line and the parallel column above it.',
      'A figure in amperes is then set above each column — two, one and four — and a name below each says which wiring it belongs to.',
      'The columns fade while the electrons keep circulating, and the whole count runs again from empty.',
      'The caption at each stage says what the picture is doing: the same battery and the same two resistors, then the stacking of charge over the same stretch of time, then the comparison against the single-resistor height.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed: the electrons circulate, a gate opens, the three columns grow, the reference line is drawn and the figures are set, and then it all runs again.',
        'The reader arrives partway through the counting, with the three columns already at different heights and visibly growing at different rates.',
        'The three columns are built on one shared floor and counted over one shared stretch of time, so their heights can be read against each other directly.',
        'The reference line waits until the counting has stopped before it is drawn, so that it stands as a fixed mark rather than rising along with the columns.',
        'The accent colour is kept for that one meaning — the height the single resistor reached. The wires, batteries and resistors are all in ink, and the electrons and the columns they stack into share one colour because the column is the charge that passed the gate.',
        'The two branches of the parallel circuit carry grains at half the speed of the trunk that feeds them, and that is left to be seen in the tails rather than said.',
        'The three circuits are all on screen at once, so the comparison is made by looking from one column to the next rather than by remembering a previous picture.',
      ],
    },

    useWhen: [
      'The article has stated the two combination rules and the reader cannot see why one arrangement helps the battery along and the other holds it back. Three columns counted over the same stretch of time, with the single-resistor height marked across them, is where that asymmetry becomes something to look at.',
      'The prose needs current treated as charge per unit time rather than as a value read off an instrument, and needs the three currents compared as a ratio that survives in a still picture.',
    ],

    avoidWhen: [
      'A value for the combined resistance is wanted, or the article is working through the arithmetic of one plus one and the reciprocal sum. No resistance for the pair is written anywhere; the argument is carried entirely by the heights of the columns.',
      'The article is about how the current splits between the two branches, or treats the junction as a rule in its own right with what enters and leaves being counted. The branches carry no figures here and nothing is summed on screen.',
      'The subject is the potential round the loop, or how the supply voltage divides between two resistors in series. Only currents are shown and no potential is marked at any point.',
      'The battery is to be treated as imperfect, its terminal voltage sagging as more is drawn from it. The three batteries here hold the same stated voltage however heavily each circuit draws.',
      'The subject is what makes one resistance larger than another — its length, its thickness, its material or its temperature. All five resistor symbols here are drawn identically and carry one value.',
      'More than two components are needed, or a network that is neither purely end to end nor purely side by side. Exactly three wirings of the same two resistors are shown.',
      'The article turns on which resistor heats more, or on power delivered. Nothing on screen warms and no power is written.',
      'The reader is meant to set the voltage or the resistances themselves and watch the result follow. The values are fixed and the run repeats unchanged.',
    ],

    contrastWith: [
      {
        concept: 'ohms-law',
        note: 'One holds the supply and the two resistances fixed and changes only how they are joined; the other keeps one resistance joined one way and raises the voltage across it, so that what is claimed there is a proportionality and what is claimed here is a difference between two arrangements.',
      },
      {
        concept: 'resistance-and-geometry',
        note: 'One takes two finished resistors as given and asks what joining them one way or the other does to what the supply delivers; the other never joins anything, asking instead what the shape of a single conductor does to its resistance in the first place.',
      },
      {
        concept: 'kirchhoffs-current-law',
        note: 'One asks how much the supply delivers in total under each arrangement; the other asks where that total goes once it reaches a junction, and insists that the branches add back up to it exactly.',
      },
      {
        concept: 'kirchhoffs-voltage-law',
        note: 'One asks what current an arrangement of two resistors draws; the other asks how the potential rises and falls all the way round the loop and returns to where it began.',
      },
      {
        concept: 'emf-and-internal-resistance',
        note: 'One treats the supply as unchanging and puts all the difference into the wiring outside it; the other is about the supply itself failing to hold its voltage as the current drawn from it grows.',
      },
      {
        concept: 'capacitors-in-circuit',
        note: 'Both join two identical components in the same two ways and ask what the pair comes to, but joining end to end raises a resistance and lowers a capacitance, because one counts what gets through and the other what is held.',
      },
      {
        concept: 'joule-heating',
        note: 'One asks what current an arrangement draws from the supply; the other takes the current as settled and asks what the resistance does with it, which of two resistances carrying it warms the faster.',
      },
    ],
  },
};
