/**
 * spring-force 개념 선언.
 *
 * 이 묶음에서 가장 가까운 것은 `tension` 이다 — 둘 다 용수철 저울이 화면에 있다.
 * **무엇이 주장인가로 갈랐다.** 이쪽은 **늘인 길이와 되돌리는 힘의 비례**가 주장이고,
 * 저쪽은 용수철이 그저 힘을 읽는 도구다. 이쪽만 늘임·비례·원래 길이 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const springForceConcept: Aperi21ConceptSource = {
  id: 'spring-force',
  label: 'Spring Force',
  canonicalSim: 'aperi21:spring-force',

  surface: {
    definition:
      'The restoring pull of a stretched spring, growing in the same proportion as the stretch, so that drawing it out twice as far doubles the force back.',
    exemplarKeywords: [
      'spring force',
      'Hooke law',
      'force equals spring constant times extension',
      'restoring force of a spring',
      'elastic force proportional to stretch',
      'stretch a spring twice as far',
      'spring constant',
      'why the pull back doubles when the stretch doubles',
      'extension and the force it pulls back with',
      'a rubber band pulls harder the further you draw it',
    ],
  },

  briefing: {
    observable: [
      'A spring runs from a hatched wall to a block, and a dashed line marks where the block sits when nothing is pulling it.',
      'Beyond that line a ruled strip is divided into equal steps, each one named, so the stretch is counted rather than measured in units.',
      'A grip on a short lead draws the block out one step at a time and waits at each step before taking the next.',
      'An arrow in the accent colour points back toward the wall from the block under the words for the restoring force, and it lengthens by the same amount at every step.',
      'Each time the block halts, a faint copy of that arrow floats up and stays behind, so by the fourth step arrows of one, two, three and four lengths stand together in view.',
      'The captions count as they go — one step and the force is one, two steps twice, three steps three times, four steps four times — and then say the stretch and the pull back grew in the same proportion.',
      'The coils, always the same number of them, open out further as the spring is drawn and close up as it comes back.',
      'The block is eased back to the dashed line, the stacked arrows fade, and at the natural length no arrow is drawn at all.',
    ],

    screen: {
      affordances: [
        'The pull happens by itself — four steps out, each one held, then a smooth return to the natural length and a pause there before it begins again.',
        'Every step the block stops at is set against the same ruled strip, so equal steps of stretch are guaranteed by the drawing.',
        'The arrow left behind at each step stays while the later steps are made, which puts the four lengths side by side instead of one after another in time.',
        'At the natural length the arrow is simply absent, marking the place where the pull runs out.',
      ],
    },

    useWhen: [
      'The article has stated a proportionality between stretch and restoring force and the reader has no reason yet to believe it. Four halts, the arrow longer by the same amount at each, with the earlier arrows still standing, is what turns the rule into something counted off.',
      'A spring is about to be used as a way of measuring force and the article needs the step that justifies an evenly spaced scale — the arrows grow evenly, so the marks can be evenly spaced.',
    ],

    avoidWhen: [
      'The spring is meant to be let go and to oscillate. The block is always led by the grip and brought back smoothly; nothing swings and nothing is released.',
      'A spring constant, a force in newtons or a length in centimetres is wanted. The stretch is counted in steps and the force is drawn, not numbered.',
      'The subject is a spring pushed shorter than its natural length, or one drawn so far that it stops coming back. The block only travels outward from the dashed line and always returns to it.',
      'The force the hand exerts is what the article is about. Only the pull back toward the wall is drawn.',
      'Energy stored in a spring is the subject. Nothing on screen accumulates — the arrow gives the pull at each stretch and no more.',
    ],

    contrastWith: [
      {
        concept: 'tension',
        note: 'Here a spring being stretched is the whole claim; there a stretched spring is only the instrument, and the claim is about what a rope carries.',
      },
      {
        concept: 'newtons-second-law',
        note: 'Both are proportions that force takes part in, but here the force is what follows from a stretch, and there the force is what is given and the gain of motion is what follows from it.',
      },
    ],
  },
};
