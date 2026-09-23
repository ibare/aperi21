/**
 * chain-reaction 개념 선언.
 *
 * 연쇄 둘 가운데 **분열과 분열 사이** 쪽이다.
 *   nuclear-fission  한 번의 분열 — 흔들림 · 아령 · 알갱이 장부 · 조각의 반발
 *   chain-reaction   분열 하나는 점이 갈라지는 짧은 사건일 뿐이고, 말하는 것은 나온 중성자가
 *                    **다음** 분열을 부르는 것 — 세대마다 k 배, 같은 연료에서 폭주 · 임계 · 꺼짐
 * 이쪽만 세대 · 배수 k · 세 판 비교 · 번지는 넓이 어휘를 갖는다. 에너지 · 조각의 이름 · 알갱이
 * 장부는 여기 없고, k 를 무엇이 정하는가(감속재 · 제어봉 · 임계 질량)도 두지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const chainReactionConcept: Aperi21ConceptSource = {
  id: 'chain-reaction',
  label: 'Multiplication per Generation and Whether a Chain Keeps Going',
  canonicalSim: 'aperi21:chain-reaction',

  surface: {
    definition:
      'Why the same fuel can run away, hold steady or die out: the neutrons from each fission set off a certain number of further ones, so the count per generation multiplies by that number.',
    exemplarKeywords: [
      'a nuclear chain reaction',
      'the multiplication factor k',
      'critical, supercritical and subcritical',
      'why is a reactor not a bomb',
      'each fission setting off the next',
      'neutrons keeping the reaction going',
      'the number of fissions doubling each generation',
      'a self-sustaining reaction',
      'neutrons escaping instead of causing fission',
      'what criticality means',
      'the reaction dying out',
    ],
  },

  briefing: {
    observable: [
      'Three panels stand side by side, each holding the same grid of sixty-four dark dots and each labelled at the top with a different multiplying number: one above two, one exactly two halves, one below.',
      'In every panel two grey particles fly into two of the central dots, and the grids are identical down to the last dot, so the panels differ in nothing but their labels.',
      'Those two dots each break into a pair of pale fragments, a highlighted ring spreads from each, and two grey particles shoot out of each. A bar rises under every panel.',
      'The particles then travel. Some head for the nearest dot still whole and split it; the rest drift outward and fade away before reaching anything.',
      'A further bar is added under each panel at every generation. Under the left panel they run two, four, eight, sixteen, each visibly double the last. Under the middle they are all the same height. Under the right they go two, then one, then nothing at all.',
      'In the left panel the splitting spreads outward from the centre until a broad patch of the grid is pale fragments. In the middle panel it creeps along as a thin thread. In the right panel it stops after three fragments and nothing is left travelling.',
      'At the end a word appears beside each label saying how that panel turned out, and the finished grids and bars are held still together.',
      'Then everything clears, fresh dark dots stand where the split ones were, and two particles wait at the starting places for the next round.',
      'Nothing is written on the bars. The only figures on screen are the three multiplying numbers.',
      'The particles are grey, the whole nuclei dark, the fragments a faded grey, and the rings are the one highlighted thing.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The generations follow one another on their own and the round repeats.',
        'Three panels are shown at once rather than one panel run three times, so the three outcomes can be held against each other at a single moment instead of remembered in turn.',
        'The grid and the two starting nuclei are identical across the panels, so the multiplying number is visibly the only thing that differs.',
        'The count in each generation is the whole-number part of the multiplying number times the previous count, since what is being counted are particles.',
        'The heights of the bars are left to carry the counts, with nothing written on them, and the area of grid taken over says the same thing a second way.',
        'The highlight is kept for the fissions of the current generation, so the ring pattern is also where the chain has reached.',
        'A particle that leads nowhere is drawn drifting outward and fading, without distinguishing one reason for failing from another, since both amount to the same thing here.',
        'Each particle that does lead somewhere goes to the nearest whole nucleus, which is what makes the spreading read as an area rather than as scattered hits.',
        'The words saying how each panel turned out are held back until the last generation, so the answer is not given before the picture makes it.',
        'The round ends on a generation that sends nothing further out, rather than leaving particles in mid-flight.',
        'It opens with the first particles already on their way in.',
      ],
    },

    useWhen: [
      'The article uses the words critical, supercritical and subcritical, and the reader needs each of them to be an outcome they can see happen on the same fuel.',
      'The point is that a reactor and a bomb are not different reactions but the same one at different multiplying numbers, and the reader should see how narrow that difference is.',
      'The article needs the growth to be counted by generation rather than by time. A bar is added per generation and the left panel\'s bars double each time.',
      'The reader should see why some neutrons matter and others do not: in the panels that do not run away, most of what comes out drifts off without reaching anything.',
    ],

    avoidWhen: [
      'The subject is what one fission event looks like, what it produces, or how it is triggered. A splitting here is only a dot becoming two fragments.',
      'The point is what sets the multiplying number — moderators, control rods, the shape or size of the fuel, critical mass. It is given here, not explained.',
      'The article is about the energy released, the heat produced, or the power of a reactor.',
      'The subject is a population of nuclei thinning out on its own, which only ever falls.',
      'The figures wanted are generation times, neutron counts, reactor power, or how many neutrons a fission gives on average.',
      'The article is about what happens after shutdown, about waste, or about accidents.',
    ],

    contrastWith: [
      {
        concept: 'nuclear-fission',
        note: 'One treats each event as a point and asks how many further events follow from one; the other opens a single event up and follows it from the trigger to the pieces flying apart.',
      },
      {
        concept: 'binding-energy-curve',
        note: 'One asks how many rearrangements one rearrangement brings about; the other asks what a single one is worth in energy.',
      },
      {
        concept: 'radioactive-decay',
        note: 'One is a count that can rise, hold or fall according to how many each event sets off; the other a population whose members only ever leave, at moments nothing sets.',
      },
      {
        concept: 'random-walk',
        note: 'Both are about what many individually decided steps add up to, but one is about a spread that grows while the number stays put, the other about a number that multiplies generation by generation.',
      },
      {
        concept: 'laser-and-stimulated-emission',
        note: 'Both are about one event bringing about others until a supply runs low, but what is passed on is neutrons in one case and light in the other, and only one of them asks whether the count grows or shrinks.',
      },
    ],
  },
};
