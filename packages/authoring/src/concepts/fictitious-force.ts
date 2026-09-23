/**
 * fictitious-force 개념 선언.
 *
 * 가속 기준틀 셋 가운데 가운데 자리다. `non-inertial-frame` 은 **아무것도 밀지 않았다**,
 * `coriolis-effect` 는 **경로의 모양**, 이쪽은 **도입한 그 힘이 무엇에 비례하는가**다.
 * 이쪽만 질량 · 비례 · 같은 각도 어휘를 갖고, 두 판 대조나 휜 경로 어휘는 쓰지 않는다.
 *
 * 화면이 회전하는 틀 하나뿐이라 「바깥에서 보면」 을 말하지 않는다. 그 대비는
 * `contrastWith` 가 개념 층위에서 맡는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const fictitiousForceConcept: Aperi21ConceptSource = {
  id: 'fictitious-force',
  label: 'Fictitious Force',
  canonicalSim: 'aperi21:fictitious-force',

  surface: {
    definition:
      'The force brought in inside an accelerating frame to account for motion nothing touched, which is proportional to mass as gravity is and so tilts a heavy body and a light one by the same angle.',
    exemplarKeywords: [
      'fictitious force',
      'inertial force',
      'pseudo-force',
      'is centrifugal force a real force',
      'apparent force introduced in a rotating frame',
      'does the fake force pull harder on heavier things',
      'swing carousel leaning outward',
      'why the lean angle does not depend on the mass',
      'proportional to mass like gravity',
      'chain swing ride at an angle',
    ],
  },

  briefing: {
    observable: [
      'A swing carousel is seen side on from a frame that turns with it: a post, an arm across the top, and two bobs hanging on strings at either end.',
      'The two strings lean out at the same angle at every instant, and they swing across to a new angle together as the turning quickens and slackens over a round of fourteen seconds.',
      'Two arrows leave each bob — gravity downward and the introduced force outward — drawn to one and the same scale on both bobs, so the heavier bob carries plainly the longer pair.',
      'A dashed diagonal at each bob runs along the line of its own string, so where the two arrows come out to can be read against the string itself.',
      'The mass of each bob is written beside it, and a heavier bob is drawn larger.',
      'Trees drift past in the background, which is how the turning of the whole frame shows.',
      'The caption says that the introduced force, like gravity, goes with mass, and that this is why the two bobs lean alike.',
    ],

    screen: {
      affordances: [
        'A slider sets the mass of the right-hand bob, from 1 to 3 kg in whole kilograms; the left-hand bob stays at 1 kg.',
        'Setting the right bob to 1 kg makes both bobs equal, and the caption changes to a wording that fits two equal masses.',
        'The turning rate rises and falls of its own accord, so the lean keeps moving and can be watched arriving at a new angle rather than jumping to it.',
        'Dragging the mass while watching one string is what the slider is for: both arrows on that bob grow together and the string stays where it was.',
      ],
    },

    useWhen: [
      'The article has called the force "not real" and the reader is likely to take that as "it does not behave like a force". Two strings leaning identically while one pair of arrows is three times the other is what puts the proportionality to mass in front of him.',
      'The reasoning needs the introduced force and gravity to be seen as the same kind of thing on one body, added on the spot, before anything is said about why one of them is called apparent.',
    ],

    avoidWhen: [
      'The question is whether any force is acting at all, or what an observer outside would say. Only the turning frame is drawn and there is no outside account beside it.',
      'The subject is a body travelling across a turning frame and the path it comes to take. Both bobs hang at fixed places on the arm and go nowhere.',
      'The article is about a vehicle starting, stopping or braking along a straight line.',
      'The point is circular motion as told from outside — what keeps the bob going round, or the pull along the string. No such account is given here.',
      'Numbers are wanted: an angle in degrees, a turning rate, a force in newtons. None is written.',
    ],

    contrastWith: [
      {
        concept: 'non-inertial-frame',
        note: 'One introduces a force for the motion and asks how big it is on a given body; the other declines to introduce anything and says the motion belongs to the frame drawing away.',
      },
      {
        concept: 'coriolis-effect',
        note: 'One is about the size of the force that gets brought in and what it goes with; the other is about the shape a straight throw takes once the frame turns, with no force named at all.',
      },
      {
        concept: 'free-fall',
        note: 'Both turn on a quantity being proportional to mass and so dropping back out of the motion — there for weight in a fall, here for the force a speeding frame brings in.',
      },
    ],
  },
};
