/**
 * magnetic-poles 개념 선언.
 *
 * 자석 넷 가운데 이쪽은 자석 ↔ **자석**이다 — 같은 자석을 돌리기만 해서 당김이 밀림으로 뒤바뀐다.
 *   magnetic-poles      **마주 보는 극** — 돌리면 뒤바뀐다(수레가 다가오고 물러난다)
 *   magnet-attraction   자석 ↔ 물건 — 붙는 것과 그대로인 것
 *   magnetic-field-lines  극이 끝인가 — 한 가닥을 자석 속까지 따라간다
 *   magnetic-dipole     고리와 자석의 먼 곳 장 모양
 * 이쪽만 「돌린다 · 같은 극 · 다른 극 · 밀려난다」 어휘를 갖는다. 장 모양 · 힘의 크기는
 * 화면에 없어 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const magneticPolesConcept: Aperi21ConceptSource = {
  id: 'magnetic-poles',
  label: 'Two Magnets Turned to Face Each Other',
  canonicalSim: 'aperi21:magnetic-poles',

  surface: {
    definition:
      'That turning a magnet on a cart so its unlike end faces a fixed magnet draws the cart in until the two meet, and turning it further, so like ends face, drives the cart away again.',
    exemplarKeywords: [
      'like poles repel and unlike poles attract',
      'two magnets pushing each other apart',
      'north and south ends of a magnet',
      'turning a magnet round turns a pull into a push',
      'why do two magnets sometimes stick and sometimes push',
      'magnets repelling along a track',
      'feeling two magnets push apart',
      'holding north against north',
      'attraction and repulsion between magnets',
      'the rule for magnetic poles',
    ],
  },

  briefing: {
    observable: [
      'Seen from above: a fixed magnet at the left, a rail running off to the right with a stop at its far end, and a cart carrying a magnet on a turntable.',
      'The cart is held at the stop while the magnet on it turns until its empty half faces the fixed magnet’s filled half.',
      'Released, the cart creeps at first, gathers pace as it nears, and comes to rest against the fixed magnet.',
      'A dotted outline stays behind where the cart was let go, so which way it travelled can be read even from a still picture.',
      'The magnet on the cart then turns once more in the same sense, bringing the two filled halves face to face.',
      'Released again, the cart shoots away, slows, and comes to rest at the stop, with a dotted outline now left beside the fixed magnet.',
      'Both magnets have their north half lightly filled and their south half empty, and both carry the letters N and S.',
      'Nothing differs between the two trips except which way the cart’s magnet has been turned.',
      'No arrow, no field line and no number appears anywhere.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; turn, release, arrive, turn again, release, return — and round once more.',
        'Only one of the two magnets is ever turned, so the run reads as one pair with a single thing altered rather than as two arrangements put side by side.',
        'The cart is held while the magnet turns and let go only once the turn is finished, and the line of text beneath says that it is being held.',
        'The dotted outline left at the point of release is what makes the direction of a trip readable at any instant.',
        '“Nearer means stronger” is never said; it shows as the cart gathering pace on the way in and losing it on the way out.',
        'The filled half and the empty half tell the two ends apart by shape, so the conventional red and blue are not needed and the two magnets are drawn alike.',
        'The cart slows to a stop instead of bouncing, so each trip ends at a place the next one can be measured from.',
      ],
    },

    useWhen: [
      'The article has given the rule that like poles repel and unlike attract, and the reader holds it as a sentence to be remembered. One magnet turned on a cart, with everything else kept the same, turns the rule back into a result.',
      'The prose needs repulsion in particular to be seen rather than asserted: a push is harder to picture than a pull, and a cart driven back to the stop is the plainest case of one.',
    ],

    avoidWhen: [
      'The article is about which objects a magnet will pick up, or about what materials answer to a magnet at all.',
      'The subject is the shape of the field around a magnet, or the lines running between two of them.',
      'The force is to be put in numbers, or how it grows with nearness is the point. Nothing is measured and no arrow is drawn.',
      'The article is about a compass, about the earth’s magnetism, or about which end of a magnet points north.',
      'The point is that cutting a magnet gives two magnets, or that a single pole cannot be had on its own.',
      'The reader is meant to turn the magnet themselves and feel the change. The turning happens on its own, twice a round.',
    ],

    contrastWith: [
      {
        concept: 'magnet-attraction',
        note: 'One has two magnets, where which end faces which is the whole question; the other has a magnet against ordinary things, which have no ends to be turned.',
      },
      {
        concept: 'magnetic-field-lines',
        note: 'One reads the two ends off what they do to each other; the other asks whether an end is really an end, following one line on through the body of the magnet.',
      },
      {
        concept: 'magnetic-dipole',
        note: 'One has two magnets acting on each other end to end; the other has a current loop and a magnet turning out to share one field once both are seen from far enough away.',
      },
    ],
  },
};
