/**
 * relativity-of-simultaneity 개념 선언.
 *
 * 동시성 둘 중 하나. 형제 `relativistic-velocity-addition` 과 갈랐다 — 둘 다 「빛의
 * 빠르기가 모든 틀에서 같다」 를 쓰지만 결론이 다르다.
 *   relativity-of-simultaneity      두 사건의 **순서**가 틀마다 다르다
 *   relativistic-velocity-addition  더한 **빠르기**가 c 를 못 넘는다
 * `spacetime-diagram` 과도 갈랐다 — 저쪽은 축·세계선이 있는 **도표를 읽는 법**이고,
 * 이쪽은 기차와 빛이 있는 **장면**에서 감지기가 켜지는 차례다.
 * 이미 선언된 `reference-frame` 은 같은 낙하의 **경로 모양**이 달라지는 것이라, 빛도
 * 시간도 순서도 끼지 않는다.
 *
 * 조각에 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const relativityOfSimultaneityConcept: Aperi21ConceptSource = {
  id: 'relativity-of-simultaneity',
  label: 'Simultaneity Depends on the Observer',
  canonicalSim: 'aperi21:relativity-of-simultaneity',

  surface: {
    definition:
      'Two events that a rider inside a moving carriage records as happening together are recorded by someone beside the track as happening one after the other.',
    exemplarKeywords: [
      'relativity of simultaneity',
      'did the two things happen at the same time',
      'a flash struck in the middle of a moving train',
      'lightning at both ends of the carriage',
      'the rear detector lights up first',
      'together for one observer but not for another',
      'is "at the same time" the same for everyone',
      'Einstein train thought experiment',
      'the far end runs away from the light while the near end meets it',
      'two lamps that come on together only for the passenger',
    ],
  },

  briefing: {
    observable: [
      'Two panels are stacked one above the other, each carrying written words saying whose account it is — one seen from inside the carriage, one seen from beside the track.',
      'In the upper panel the carriage stands still while the sleepers slide past beneath it; in the lower panel the carriage runs to the right over sleepers that stay put.',
      'Each panel has a detector drawn as an empty outline at each end of the same carriage, and a lamp hanging at its middle.',
      'The lamp flashes once, and in both panels a dotted upright line is planted at the exact place the flash happened, with the two lines standing in the same column of the screen.',
      'Two strokes of light leave that planted line and travel outward at the same rate in both panels; they never ride along with the carriage.',
      'In the upper panel the carriage has not left the planted line, so both strokes arrive at the two ends at once and the word for "together" is written at each end.',
      'In the lower panel the carriage has moved on, so the rear end closes on its stroke and fills in first while the front end runs from its stroke and fills in much later; the words written are "first" at one end and "later" at the other.',
      'A detector that is reached fills with colour and sends out a spreading ring, so arriving is something that happens rather than something announced.',
      'Both panels then freeze on the moment the last arrival is over, holding two together against one-then-the-other side by side before the whole thing fades and begins again.',
      'The only figure written anywhere is the speed of the carriage, and no arrival times or clock readings appear.',
    ],

    screen: {
      affordances: [
        'The flash, the two journeys of light and the freeze run through by themselves on a loop; nothing has to be pressed.',
        'Both accounts are on screen at the same time and share one column for the place of the flash, so the comparison is made by looking from one panel to the other.',
        'Order is written in words rather than in numbers, so what is on offer is which came first and not how much later.',
        'Nothing on screen distinguishes the two panels by colour — same carriage, same light — so only position and motion separate them.',
      ],
    },

    useWhen: [
      'The article has said that observers disagree about whether two things happened together, and the reader is treating that as a trick of signal delay rather than a real disagreement. Watching one flash reach two detectors, with both accounts drawn from that single flash, is what makes the disagreement legitimate.',
      'A piece is about to build on simultaneity — a paradox, a diagram, an ordering argument — and needs the underlying picture established first in ordinary objects before any axes are drawn.',
    ],

    avoidWhen: [
      'The subject is how slowly a moving clock runs, or by what factor. No clock face, no tick and no count appears anywhere here.',
      'The point is how short a moving object becomes. The carriage is drawn at its contracted length only so that the picture is not wrong, and nothing on screen measures or names it.',
      'What is wanted is a diagram with a time axis, worldlines or a tilted line of now. Everything here is a carriage, a lamp and two detectors.',
      'The article is combining two speeds, or asking what the closing rate between two things is. No speeds are added and only one figure is written.',
      'The reader needs how much later the second event was. Only the words for first, later and together are given.',
    ],

    contrastWith: [
      {
        concept: 'spacetime-diagram',
        note: 'One shows the disagreement happening among physical objects, as two detectors coming on in a definite order; the other is the drawing convention in which that disagreement appears as a tilt in the line an observer calls now.',
      },
      {
        concept: 'twin-paradox',
        note: 'One says two observers disagree about the order of two events; the other follows what happens when one observer changes which of those accounts is theirs partway through, and so comes back younger.',
      },
      {
        concept: 'reference-frame',
        note: 'One has two observers disagreeing about the shape of a path while agreeing on every ordering; the other has them agreeing on what happened and disagreeing on when.',
      },
      {
        concept: 'light-cone',
        note: 'One shows that the order of two events can be read differently by different observers; the other marks out exactly which pairs that is allowed for and which pairs every observer must order the same way.',
      },
    ],
  },
};
