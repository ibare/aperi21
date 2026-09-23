/**
 * newtons-first-law 개념 선언.
 *
 * 이 묶음에서 「관성」을 말하는 형제는 `inertial-vs-gravitational-mass` 다. **주어를 갈랐다.**
 *   newtons-first-law               아무것도 밀지 않은 **한 물체** — 둘레가 변해도 제 속도를 지킨다
 *   inertial-vs-gravitational-mass  관성을 **재는 두 방법** — 두 값이 같은 개수에서 맞는다
 * 이쪽만 "밀린 적이 없다" · "무엇이 처음으로 힘을 준 순간" 어휘를 갖는다.
 *
 * 이미 선언된 `uniform-motion` 과도 갈린다 — 저쪽은 등속이 **어떻게 보이는가**(자국 간격이
 * 같다)이고, 이쪽은 등속이 **왜 이어지는가**(민 것이 없다)이다. `reference-frame` 과도
 * 갈린다 — 저쪽은 관찰자를 바꾸는 일이 주장이고, 이쪽은 관찰자가 땅에 고정된 채 두 물체의
 * 자취를 견준다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const newtonsFirstLawConcept: Aperi21ConceptSource = {
  id: 'newtons-first-law',
  label: "Newton's First Law",
  canonicalSim: 'aperi21:newtons-first-law',

  surface: {
    definition:
      'The rule that a body nothing pushes carries on at the speed it already had, so that when its surroundings slow down it is the surroundings that changed and not the body.',
    exemplarKeywords: [
      "Newton's first law",
      'law of inertia',
      'why do passengers lurch forward when a bus brakes',
      'nothing pushed you, the vehicle stopped',
      'why seat belts are needed',
      'a body keeps doing what it was doing',
      'no force means no change of motion',
      'thrown forward when the car stops suddenly',
      'inertia of a rider in a braking vehicle',
      'standing passenger on a bus',
    ],
  },

  briefing: {
    observable: [
      'A bus runs along a road with lane dashes and turning wheels, and a standing passenger is drawn inside it with a partition ahead.',
      'Two rows of strobe marks are laid down as they go, one belonging to the bus and one to the passenger, each row carrying a written name and a filled dot for where its owner is now.',
      'The bus brakes. Its row of marks crowds together mark by mark until the marks touch and stop, while the passenger’s row goes on being laid down at the spacing it always had.',
      'Because the two rows are side by side, the crowding of one against the evenness of the other is read off the picture rather than taken on trust.',
      'The passenger drifts forward relative to the bus and eventually meets the partition, where short strokes mark the contact and the caption says this is the first moment a force acts on the passenger.',
      'Before that meeting the caption states plainly that nothing pushed the passenger — the spacing of the passenger’s trail is unchanged.',
      'The whole run fades out and begins again with the trail already laid, so the vehicle is never watched starting from rest.',
    ],

    screen: {
      affordances: [
        'One slider sets how much the passenger’s shoes grip the floor, starting at none.',
        'Raising the grip gives the passenger a real horizontal force, and the passenger’s own strobe marks then crowd together as well — at the top of the range the passenger never reaches the partition and comes to rest together with the bus.',
        'The caption follows the grip: at zero it says nothing pushed the passenger, part way up it says the passenger slows only as much as the feet grip, and at rest it says the two stopped together.',
        'The run repeats on its own; the grip that was set carries into the next run.',
      ],
    },

    useWhen: [
      'The article has to undo "the brake threw me forward". Watching one trail crowd while the other keeps its spacing puts the change on the vehicle, and the slider lets the reader put the force back in and see the trail respond.',
      'The claim being made is that the absence of a force is a cause of something — of motion continuing — and a case is wanted where the unforced body is the one that visibly does nothing new.',
    ],

    avoidWhen: [
      'The point is how a constant velocity is recognised or measured. The passenger’s even trail is evidence for a cause here, not a definition of steady motion.',
      'The article is about two observers disagreeing about a motion. The camera stays on the ground for the whole run and there is no view from inside the bus.',
      'The subject is how much a body resists being pushed, or how that resistance is measured. Nothing here is weighed or compared against another body.',
      'The argument needs a second law statement — a force producing a definite acceleration. The grip slider makes the passenger slow down but no size of force or of the slowing is given.',
      'The concern is vertical motion or gravity. Everything here happens along a level road.',
    ],

    contrastWith: [
      {
        concept: 'uniform-motion',
        note: 'One says why an unpushed body goes on at the speed it had; the other says what going on at one speed looks like when it is recorded.',
      },
      {
        concept: 'reference-frame',
        note: 'One keeps a single observer and asks which of two bodies had something done to it; the other keeps a single event and asks how two observers describe it.',
      },
      {
        concept: 'net-force',
        note: 'One is the case where the forces add to nothing and the motion is left alone; the other is the case where they do not, and what the remainder then decides.',
      },
      {
        concept: 'inertial-vs-gravitational-mass',
        note: 'One says an unpushed body keeps its motion; the other asks how much pushing a particular body takes, and whether that quantity is the same one gravity acts on.',
      },
    ],
  },
};
