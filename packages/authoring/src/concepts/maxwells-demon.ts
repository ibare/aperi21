/**
 * maxwells-demon 개념 선언.
 *
 * 위험한 짝 — `statistical-fluctuation` 과 섞으면 둘 다 「확률과 2법칙」 이 된다.
 * 주어를 **문을 지키는 이**로 잡았다. 주장은 「갈라진다」 가 아니라
 * **「갈라지되 하나를 볼 때마다 한 줄이 적힌다」** — 막대와 공책이 같은 시간에 자란다.
 *
 * `second-law-of-thermodynamics` 와도 갈랐다 — 저쪽은 칸막이를 **걷고** 퍼지는 쪽,
 * 이쪽은 칸막이를 **지키는** 쪽이다.
 *
 * 화면에 엔트로피·정보량을 재는 것이 없어 definition 을 「재고 적는 대가」 까지로
 * 좁혔다(간극 장부).
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const maxwellsDemonConcept: Aperi21ConceptSource = {
  id: 'maxwells-demon',
  label: 'Maxwell’s Demon and the Price of Sorting',
  canonicalSim: 'aperi21:maxwells-demon',

  surface: {
    definition:
      'A gatekeeper who lets quick molecules through one way and slow ones the other, splitting a uniform gas into hot and cold by inspecting every molecule that comes to the door.',
    exemplarKeywords: [
      'Maxwell’s demon',
      'the thought experiment about sorting molecules',
      'can you cheat the second law by sorting molecules',
      'a trapdoor between the two halves of a gas',
      'letting only the fast ones through',
      'one side gets hot and the other cold with no work done',
      'information has a thermodynamic price',
      'the demon has to keep records',
      'Landauer and the cost of erasing',
      'sorting molecules by speed at a little door',
      'getting something for nothing out of a gas',
    ],
  },

  briefing: {
    observable: [
      'A box is split down the middle by a partition with a hinged trapdoor in it, and each half holds the same number of molecules drawn from one and the same list of speeds, so the two temperature bars beside the box start exactly level with a dashed line marked as the starting height.',
      'Quick and slow are told apart by size and by the length of the streak each molecule trails, not by colour: every molecule is drawn in the same colour.',
      'A horned head sits above the partition. Every molecule that comes up to the door gets a ring of the highlight colour where it was inspected, and at that same instant a line appears in a notebook drawn beside the box, its newest line in the same highlight colour.',
      'The door swings open only for a large one heading right or a small one heading left; for everything else it stays shut and the molecule bounces back.',
      'The notebook fills far faster than the door opens, because a molecule turned away at the shut door is inspected too and gets its line all the same — the rings, the closed door and the new line are on the screen together.',
      'Large molecules pile up on the right and small ones on the left, and the right-hand bar climbs above the dashed starting line while the left-hand one sinks below it.',
      'Both temperature bars are drawn in the same plain colour, hot and cold not being told apart by red and blue; what says which is hotter is the height against the dashed line.',
      'At the end the door stops, the bars stand far apart, and the notebook keeps every line it wrote; nothing is counted out in figures — not how many inspections, not how many openings, not how far apart the two temperatures now are.',
    ],

    screen: {
      affordances: [
        'One round runs from the shut door and the mixed halves, through the sorting, to the door stopping with the two sides separated; nothing has to be pressed, and the next round begins from mixed halves again rather than by stirring these back together.',
        'The sorting stretch is split so that the wording can wait: it only says the bars are drawing apart once they have drawn apart.',
        'The highlight colour carries a single meaning, just inspected: the ring at the door and the freshest notebook line appear in it at the same instant, which is what ties the looking to the writing.',
        'The door is a hinged flap drawn apart from the partition, so that it reads as a door even while it is shut.',
        'The two halves are given the same list of speeds to divide between them, so that the two bars starting level is exact rather than a near miss.',
      ],
    },

    useWhen: [
      'The article has just put the question of whether an intelligent gatekeeper could sort a gas and beat the second law, and the reader needs to see both halves of the answer at once: the sorting plainly works, and the notebook fills the whole time it is working.',
      'The point being made is that the record-keeping is not incidental — that every molecule turned away has been looked at too, so the tally of what was learned grows far faster than the tally of what was let through.',
    ],

    avoidWhen: [
      'The article is about a gas let loose into an empty space and filling it, or about a barrier being removed. The partition here is never taken away, and the whole point is that it is guarded.',
      'The subject is the range of speeds molecules have, drawn as a distribution. Fast and slow are two sizes of dot here, with no curve and no spread.',
      'The point is that chance alone keeps producing small departures from an even share. Everything that happens here is done on purpose by the gatekeeper.',
      'A figure for entropy or for information is wanted — a count of bits, the cost of erasing, an expression with a logarithm. Nothing at all is counted out on the screen.',
      'The article is about a real machine moving heat by doing work on a fluid, with a compressor and a cycle. There is nothing here but a gas, a door and a watcher.',
    ],

    contrastWith: [
      {
        concept: 'second-law-of-thermodynamics',
        note: 'One takes the barrier away and finds that a gas spreads and never gathers back; the other keeps the barrier and puts someone at the door, asking what it would take to make it gather.',
      },
      {
        concept: 'statistical-fluctuation',
        note: 'One is about departures from the even share arising by chance, and how their size depends on how many particles there are; the other is about a departure produced deliberately, and what has to be done to produce it.',
      },
      {
        concept: 'maxwell-boltzmann-distribution',
        note: 'One is about the fact that molecules at one temperature already have a spread of speeds; the other is about someone exploiting that spread by picking from it at a door.',
      },
      {
        concept: 'entropy-and-irreversibility',
        note: 'One shows what a settled scene would have to do to run backwards; the other shows an agent apparently making it run backwards, and the record that piles up while it does.',
      },
      {
        concept: 'refrigerator-heat-pump',
        note: 'Both end with heat sitting where it would not have gone by itself, one paid for with work driven into a machine and the other paid for with the looking and the writing.',
      },
    ],
  },
};
