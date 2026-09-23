/**
 * superposition-of-forces 개념 선언.
 *
 * 위험한 형제가 둘이다.
 *   net-force                 이미 정해진 화살표 여럿을 **하나로 줄인다** — 「가장 센 힘 쪽이 아니다」
 *   superposition-of-forces   몫이 **원천마다 따로 있다** — 하나를 옮기면 그 몫만 바뀌고 나머지는 그대로
 *   superposition (파동)      **두 펄스**가 겹쳤다 지나간다
 * 이쪽만 「원천 · 각자 따로 · 하나를 옮겨도 나머지는 그대로」 어휘를 갖는다. 「머리에 꼬리로
 * 이어 붙임 · 합력 · 벡터 합」 이라는 구어는 net-force 에 두고 여기서는 검색어로 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const superpositionOfForcesConcept: Aperi21ConceptSource = {
  id: 'superposition-of-forces',
  label: 'Each Source Charge Presses Independently',
  canonicalSim: 'aperi21:superposition-of-forces',

  surface: {
    definition:
      'That several charges each press on one charge as though the others were not there, so that moving one of them alters only the share belonging to it while the remaining shares stay exactly as they were.',
    exemplarKeywords: [
      'superposition of electric forces',
      'several charges acting on one charge at once',
      'does a third charge change what the first one does',
      'each charge contributes its own force independently',
      'total electric force from a group of charges',
      'three charges surrounding a fourth',
      'working out the force on one charge in an arrangement',
      'moving one charge and reworking the answer',
      'the forces from many charges taken one pair at a time',
      'shielding does not happen between point charges',
    ],
  },

  briefing: {
    observable: [
      'Three source charges — two marked plus, one marked minus — stand around a fourth charge at the middle, and a dotted line runs from each source through that middle charge.',
      'Three arrows leave the middle charge, one lying on each dotted line, the two from the plus sources pointing away from their source and the one from the minus source pointing toward it, each carrying a name that travels with it.',
      'Two of the arrows then slide, keeping their direction and length unchanged, until each has its tail at the head of the one before, so the three form a chain that starts where they all started.',
      'A thicker arrow in the accent colour grows from the middle charge to the far end of the chain.',
      'One of the plus sources afterwards travels to a new place, leaving an empty ring where it stood, and its dotted line swings round with it.',
      'Only that source’s arrow changes direction and length; the arrow that had been chained onto it keeps its own shape exactly and simply rides along to the new head.',
      'The accent arrow finishes pointing somewhere other than before, and the earlier one is kept beside it as a dotted ghost so the change is something to look at.',
      'No sizes are written anywhere; every arrow is recomputed each moment from where the charges actually are and drawn at one common scale.',
      'The four charges are all drawn in the same colour and told apart only by their plus and minus marks.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the sliding, the growing and the move of one source happen in order and then begin again.',
        'The dotted line to each source is kept even after an arrow has slid away from the middle, so a share can always be traced back to the source that owns it.',
        'Exactly one source moves, which is what lets the picture claim that one share changed and the others did not.',
        'The accent colour is kept for the combined arrow and its earlier ghost alone, so which arrow is the outcome needs no legend.',
        'The tails start at the centre of the middle charge rather than at its edge, so that the chain closes where the shares begin.',
      ],
    },

    useWhen: [
      'The article has said that forces from several charges add, and the reader hears it as an instruction for arithmetic rather than as a claim about nature. Seeing one source move while two shares stay untouched is what makes independence the content of the statement.',
      'The prose is building toward working out a force in an arrangement one pair at a time, and needs the licence for that method shown rather than asserted.',
    ],

    avoidWhen: [
      'The article is about how much force one pair exerts, or how that changes with separation. The interest here is which share changed, not by how much.',
      'A force has to be resolved into components along chosen axes. The shares here are only ever combined, never split.',
      'The subject is what the sources do to each other, or the equal push back on them. Only the middle charge carries arrows.',
      'The question is what happens at places where no charge is sitting. Nothing is drawn anywhere except along the lines to the four charges.',
      'Values in newtons, or coordinates for the charges, are needed. Nothing is numbered.',
      'The article is about waves or disturbances overlapping in a medium. What overlaps here is forces on one body.',
    ],

    contrastWith: [
      {
        concept: 'net-force',
        note: 'One is about where each share comes from and what happens to the others when one source is moved; the other takes the shares as given and is about the single arrow they come to.',
      },
      {
        concept: 'superposition',
        note: 'Both say that contributions can be worked out separately and then combined, but one has several sources acting on one body at one place, and the other has two disturbances crossing a medium and coming out unchanged.',
      },
      {
        concept: 'coulombs-law',
        note: 'One is the rule for a single pair and how the separation governs it; the other is the licence to apply that rule pair by pair when more than two charges are present.',
      },
      {
        concept: 'electric-field',
        note: 'One keeps every source named, so the answer belongs to this arrangement and this charge; the other collects what all of it does into one value standing at a place.',
      },
    ],
  },
};
