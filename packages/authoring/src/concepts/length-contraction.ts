/**
 * length-contraction 개념 선언.
 *
 * 시간 넷(`time-dilation` · `light-clock` · `muon-decay-evidence` · `twin-paradox`)과
 * 같은 전제에서 나오지만 **재는 것이 다르다** — 저쪽은 째깍, 이쪽은 물체의 뻗은 길이다.
 * 그리고 이 조각의 동사는 「짧아진다」 가 아니라 **「진행 방향으로만」** 이다 — 높이는
 * 그대로이고 옆면의 원이 세로로 긴 타원이 되는 것이 그 말을 한다. 시계 · 빛 · 축이 없다.
 *
 * 조각에 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const lengthContractionConcept: Aperi21ConceptSource = {
  id: 'length-contraction',
  label: 'Shortening Along the Direction of Motion Only',
  canonicalSim: 'aperi21:length-contraction',

  surface: {
    definition:
      'A body measured while it moves past is found shorter than an identical body at rest, but only along the direction it travels, its other dimensions unchanged.',
    exemplarKeywords: [
      'length contraction',
      'does a fast object really get shorter',
      'shrinks only along the direction of travel',
      'Lorentz contraction',
      'a moving box measured from the ground',
      'the height stays the same but the length does not',
      'three fifths of its rest length at four fifths of light speed',
      'rest length against measured length',
      'a circle painted on the side comes out as an ellipse',
      'both ends have to be marked at the same instant',
    ],
  },

  briefing: {
    observable: [
      'Two rails run one above the other. On the upper rail a box stands still, with a circle painted on its side.',
      'Dotted lines dropped from the two ends of the standing box, together with a line at its height, mark out on the lower rail exactly the space that box would take up — its own shape moved down.',
      'An identical box comes along the lower rail from the left at four fifths of light speed. It is drawn narrower than the standing one from the moment it appears, and the circle on its side is already a tall narrow ellipse.',
      'Its top edge slides along the marked height line, so it is the same height as the standing box the whole way.',
      'As it passes through the marked space, both of its ends are stamped in the same instant: a dotted outline is left behind, rings spread from the two ends, and the squashed ellipse is left in the outline too.',
      'The outline sits inside the marked space with its top edge touching and a gap left at each end — a tight fit upward and a shortfall along the rail.',
      'The box carries on out of the picture and fades, and the stamped record stays.',
      'A measured span above the standing box names its rest length, and another beneath the stamped outline names three fifths of that.',
      'The written speed and that fraction are the only figures; no gamma, no lengths in units and no formula appear.',
    ],

    screen: {
      affordances: [
        'The approach, the stamping of the two ends, the comparison and the fade go round by themselves; nothing has to be pressed.',
        'Both boxes are drawn identically and the marked space is the standing box\'s own shape carried down, so the comparison is between a body and a copy of itself rather than between two different things.',
        'The two ends are stamped at one instant, which is the measuring procedure the claim depends on, and the record that stamping leaves is what the spans are then hung from.',
        'The painted circle turned ellipse says "narrower, not smaller" one more time than the two edges alone would.',
        'Everything shown belongs to the observer the box moves past; the box\'s own account is not offered.',
      ],
    },

    useWhen: [
      'The article has stated that a moving body is shortened and the reader has taken that to mean shrunk all over. An outline that fits the height exactly and falls short at both ends settles which way the shortening runs.',
      'A piece needs the spatial half of the consequences of relativity established alongside the temporal half, in a picture that measures extent rather than counting ticks.',
    ],

    avoidWhen: [
      'The subject is how slowly a moving clock runs, or how many ticks it counts. There is no clock and nothing is timed.',
      'The article is giving the moving body\'s own account, in which it is at full length and the world outside is the thing shortened. Only one account is drawn here.',
      'What is wanted is the factor, or the relation between length and speed written out. One speed and one fraction are stated and nothing else.',
      'The point is that an object appears distorted or rotated because light from its parts reaches the eye at different times. Nothing here concerns what light does on its way to an observer.',
      'The article is about material being compressed, squashed or deformed by a force. No force acts on this box and its own account of itself is unchanged.',
    ],

    contrastWith: [
      {
        concept: 'time-dilation',
        note: 'The pair that come together from the same assumption — one is what motion does to the count of a clock, the other what it does to the measured extent of a body.',
      },
      {
        concept: 'relativity-of-simultaneity',
        note: 'One depends on marking both ends at a single instant and asks what length that yields; the other asks what "a single instant" can mean when observers disagree about it.',
      },
      {
        concept: 'muon-decay-evidence',
        note: 'One is the shortening of distance stated as a general claim about bodies; the other is a case where that shortening and a slowed clock are two accounts of the same arrivals.',
      },
      {
        concept: 'light-clock',
        note: 'Both are worked out from the same assumption about the speed of light, one landing on the duration of a tick and the other on the extent of a body.',
      },
    ],
  },
};
