/**
 * balance-scale 개념 선언.
 *
 * 균형 셋 가운데 **받침점**을 가진 쪽이다. `equilibrium-of-forces` 는 한 점에 걸린
 * 화살표가 닫히는가를 묻고, 이쪽은 **받침점에서 얼마나 멀리 걸렸는가**가 무게와 함께
 * 정하는 것을 묻는다. `atwood-machine` 과는 멈춰 있는지 움직이는지가 갈린다.
 *
 * `mechanical-advantage` 와도 지레를 함께 쓰지만 주장이 다르다 — 이쪽은 **수평이 되는
 * 조건**, 저쪽은 **드는 힘과 민 거리의 맞바꿈**이다. contrastWith 가 그 선을 긋는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const balanceScaleConcept: Aperi21ConceptSource = {
  id: 'balance-scale',
  label: 'Balancing a Scale',
  canonicalSim: 'aperi21:balance-scale',

  surface: {
    definition:
      'A beam turning on a pivot, level only when the weight hung on each side and its distance out from the pivot make matching products, so half the weight balances at twice the distance.',
    exemplarKeywords: [
      'balance scale',
      'seesaw balancing',
      'law of the lever',
      'why does a lighter child sit further out on the seesaw',
      'weight times distance from the pivot',
      'balancing a beam on a support',
      'moment about a pivot',
      'twice as far out with half the weight',
      'tipping toward the heavier side',
      'arm length and weight together',
    ],
  },

  briefing: {
    observable: [
      'A beam rests on a triangular support, with tick marks counting distance outward along each arm from the pivot.',
      'A heavy block sits two marks out on one side; a light block of half its weight slides along the other.',
      'With the light block close in, the beam tips over toward the heavy side and comes to rest against the support.',
      'As the light block slides outward the beam lifts, and at four marks — twice the heavy block’s distance — it settles level against a dashed level line.',
      'Pushed one mark further out, the beam tips the other way, toward the lighter block.',
      'Brought back to four marks it comes level again, and pulled in close it tips toward the heavy side once more.',
      'The beam swings and settles into each new angle rather than snapping to it, so level has to be arrived at.',
      'Captions name each stage as it happens, including that at twice the distance half the weight is enough.',
    ],

    screen: {
      affordances: [
        'The light block can be taken by a ring handle and dragged along the beam, anywhere from half a mark to five marks out from the pivot.',
        'Once it has been dragged, the automatic sequence gives way and the caption reports only which way the beam now sits, or that the two sides balance.',
        'Left alone, a round of twenty seconds runs through close in, level, too far out, level again and close in again.',
        'The angle of the beam is worked out at every instant from the two sides rather than scripted, so a place found by hand is judged on the same footing as the ones the sequence visits.',
      ],
    },

    useWhen: [
      'The reader takes balance to mean equal weights and is stuck on how unequal ones could ever balance. Sliding the light block out to twice the distance, and the beam coming level, is what puts distance into the account.',
      'The article is about a lever, a seesaw or a steelyard and needs the going-too-far case as well as the balanced one — the beam tipping toward the lighter side is on screen for that.',
    ],

    avoidWhen: [
      'The forces in question all act at one point and nothing turns. Everything here is about turning around a pivot.',
      'The article is about a tool cutting the effort needed to raise a load. Nothing is lifted here; the beam is only balanced or tipped.',
      'The subject is where a body balances on its own — its centre of mass, or the point to support it at.',
      'Numbers are wanted: a weight in newtons, a moment in newton-metres. The distances are counted in marks and no figure is written.',
    ],

    contrastWith: [
      {
        concept: 'equilibrium-of-forces',
        note: 'One weighs pulls against each other at a single point, where only their directions and sizes matter; the other weighs them about a pivot, where where they are applied matters as much as how hard.',
      },
      {
        concept: 'mechanical-advantage',
        note: 'One asks what makes a beam sit level and stay there; the other takes the same ratio of arm lengths and asks what it buys when something is actually lifted with it — less force, more distance moved.',
      },
      {
        concept: 'atwood-machine',
        note: 'One keeps an unequal pair at rest and asks what placing would make them balance; the other releases an unequal pair and asks how quickly the difference carries them.',
      },
    ],
  },
};
