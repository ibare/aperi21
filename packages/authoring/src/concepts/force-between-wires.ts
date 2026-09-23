/**
 * force-between-wires 개념 선언.
 *
 * 자기장 만들기 셋 가운데 이쪽은 **서로에게 하는 일**이다 — 같은 방향이면 당기고
 * 한쪽을 뒤집으면 민다.
 *   force-between-wires         두 전류의 **당김과 밀어냄** · 한쪽만 뒤집으면 힘이 뒤집힌다
 *   field-of-loop-and-solenoid  고리를 겹치면 안이 고르고 세진다 (장의 모양)
 *   amperes-law                 닫힌 길 한 바퀴의 합 (세는 일)
 * 이쪽만 「나란한 두 도선 · 당긴다 · 민다 · 휜다 · 한쪽만 뒤집는다」 어휘를 갖는다.
 * 힘의 짝과 반작용 어휘는 이미 선언된 `newtons-third-law` 와 겹치므로, 이쪽은
 * 「장을 만드는 것도 밀리는 것도 전류다」 한 주장에 머물고 contrastWith 로 잇는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const forceBetweenWiresConcept: Aperi21ConceptSource = {
  id: 'force-between-wires',
  label: 'Attraction and Repulsion of Parallel Currents',
  canonicalSim: 'aperi21:force-between-wires',

  surface: {
    definition:
      'That two parallel wires draw together when their currents run the same way and push apart when one current alone is reversed, since each wire sits in the field the other makes.',
    exemplarKeywords: [
      'force between two parallel wires',
      'do two current-carrying wires attract or repel',
      'currents in the same direction attract',
      'opposite currents push apart',
      'one wire lies in the field of the other',
      'reversing one current flips the force',
      'two metal strips bending toward each other',
      'why cables jump apart under a fault current',
      'the ampere defined by a force between wires',
      'parallel currents pulling together',
    ],
  },

  briefing: {
    observable: [
      'Two wires stand upright side by side, each clamped at top and bottom to a short block, seen from the side rather than end-on.',
      'While no current flows both wires are perfectly straight; an arrow drawn outside each wire, when it appears, says which way the current in that wire runs.',
      'With both currents running upward, marks for the field of the left wire alone appear — ringed dots to its left, crossed circles to its right — so the right-hand wire is seen to be standing between two columns of crossed circles.',
      'Two arrows in the accent colour spring up in the gap between the wires pointing towards one another, and both wires bow inward at their middles, overshoot, and wobble to rest.',
      'Only the current in the right-hand wire is then reversed: its arrow turns to point down while the left one still points up.',
      'The ringed dots and crossed circles do not change at all, because the wire that made them has not changed, yet the two accent arrows now point outward and both wires bow away from each other.',
      'The field marks are drawn all at one size, near the wires and far from them alike, so what they carry is which way the field goes and not how strong it is.',
      'The middle height of each column of marks is left clear, and the force arrows and their single-letter names stand in that gap.',
      'The bowing is a half-wave along each wire, largest at the middle where the clamps are furthest away, and it settles rather than snapping to its new shape.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the wires stand straight, are made to attract, are made to repel, and the sequence returns.',
        'Seen from the side with both ends clamped, the wires can bow, which turns attraction and repulsion into a shape rather than into two dots creeping closer together.',
        'The field of only one of the two wires is drawn, which keeps the other wire visibly sitting inside a field that belongs to its neighbour.',
        'It is the right-hand current that is reversed, so the drawn field is the same before and after, and the flip of the force cannot be put down to the field having changed.',
        'The bowing is magnified far beyond what real wires would show, and since no distance, current or force is ever given a number, nothing on view invites the amount to be read off.',
        'The accent colour is kept for the force alone; the field marks are quiet grey and the wires, clamps and current arrows are plain ink.',
        'The straight, currentless state comes at the head of the cycle rather than between the two cases, so attraction passes directly into repulsion and the reversal is seen at full size.',
      ],
    },

    useWhen: [
      'The article has stated the rule that like currents attract and unlike repel, and the reader has taken it as a bare fact to memorise. Seeing the field marks stay put while only one current turns over, and the wires bow the other way in consequence, makes it a consequence rather than a rule.',
      'The prose needs a force between currents that is visible as motion, so that the magnetic force on a current stops being an arrow in a diagram and becomes something that bends metal.',
    ],

    avoidWhen: [
      'The article gives the force per length as an expression in the two currents and the separation, or wants it worked out for given values. No current, separation or force is written anywhere.',
      'The point is how the force falls off as the wires are moved apart, or what happens when one current is made larger than the other. Both currents are equal in size throughout and the separation is fixed.',
      'The subject is the field a single straight wire makes, and its circles growing weaker with distance. Here the field marks are all drawn the same size and serve only to say which way the field points.',
      'A magnet is supplying the field and a current in it is pushed. Here both the field and the thing pushed come from currents.',
      'The reader is to be shown the rule that gives the direction from the current and the field with a hand. No hand, and no turning rule, is drawn.',
      'The article is about wires as circuit elements — sources, resistance, what the current is doing electrically. Nothing of the circuit around these two wires is shown.',
    ],

    contrastWith: [
      {
        concept: 'newtons-third-law',
        note: 'One is the particular case in which the pair of equal and opposite forces is delivered by magnetism, so that each body is both the source and the target; the other is the general statement that such pairs always come together.',
      },
      {
        concept: 'field-of-loop-and-solenoid',
        note: 'One asks what currents do to each other; the other asks what currents make together, and never places anything in the field it builds.',
      },
      {
        concept: 'amperes-law',
        note: 'One is about a force and its direction; the other is about a total over a closed path, which has a size but no direction to push anything.',
      },
    ],
  },
};
