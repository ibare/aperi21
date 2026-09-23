/**
 * inertial-vs-gravitational-mass 개념 선언.
 *
 * 이 묶음에서 「관성」을 말하는 형제는 `newtons-first-law` 다. **주어를 갈랐다.**
 *   inertial-vs-gravitational-mass  관성을 **재는 두 방법** — 두 절차가 같은 개수에서 맞는다
 *   newtons-first-law               밀린 적 없는 **한 물체** — 제 속도를 지킨다
 * 이미 선언된 `free-fall` 과도 갈린다 — 저쪽은 무게가 달라도 같이 떨어진다는 **결과**이고,
 * 이쪽은 두 **재는 절차**가 같은 값을 준다는 것이다. 화면에 떨어지는 장면은 없다(장부 참조).
 * 이쪽만 저울 · 밀리기 어려움 · 추 개수 · "두 정의" 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const inertialVsGravitationalMassConcept: Aperi21ConceptSource = {
  id: 'inertial-vs-gravitational-mass',
  label: 'Inertial and Gravitational Mass',
  canonicalSim: 'aperi21:inertial-vs-gravitational-mass',

  surface: {
    definition:
      'Two unrelated ways of measuring how much matter a body holds — how hard gravity pulls it and how hard it is to push — which turn out to rank and match bodies identically.',
    exemplarKeywords: [
      'inertial mass and gravitational mass',
      'two definitions of mass',
      'equivalence principle',
      'mass measured by weighing versus by pushing',
      'resistance to being pushed',
      'why are the two masses the same number',
      'balance scale against a push on ice',
      'how hard gravity pulls it',
      'is mass one quantity or two',
      'measuring mass without weighing',
    ],
  },

  briefing: {
    observable: [
      'The screen is split into two tests of the same object, each with a written name — a balance beam compared by how hard gravity pulls, and a sheet of ice compared by how hard it is to push.',
      'On the balance the object hangs from one pan and a stack of weights from the other; on the ice the same object and the same stack sit either side of a compressed spring.',
      'Both tests are let go at the same moment: the props under the balance are removed and the spring on the ice is released.',
      'With too few weights the beam tips towards the object, and on the ice the weights are driven further from the release tick than the object is — the two tests fail in the same way and in the same test.',
      'A weight is added and the run repeats; the beam tips less than it did before, so the shrinking of the shortfall is visible on the balance and not only at the end.',
      'At one particular number of weights the beam comes level and the two bodies on the ice end the same distance from the tick, and both happen in that same run.',
      'Ticks are left on the ice where the push began, which is what turns the two distances into a comparison rather than an impression.',
      'The caption names the count each time and says what the two panels are doing — tips towards the object and the weights go further, or the balance holds level and the two on the ice move alike.',
    ],

    screen: {
      affordances: [
        'A row of chips picks which body to test — stone, iron ball or wood block.',
        'The three bodies are made so size and heaviness disagree: the large wood block is light and the small iron ball is heavy, so agreement between the two tests cannot be put down to the bodies looking alike.',
        'Picking a body starts the count of weights again from one, and the weights are then added one at a time on their own until the match is reached.',
        'The two panels always run the same trial at the same moment, so the match is read as one event rather than as two results remembered apart.',
      ],
    },

    useWhen: [
      'The article has stated that inertial and gravitational mass are equal and the reader cannot see why that is a claim at all. Two procedures with nothing in common, reaching their verdict at the same count, makes the coincidence something to be surprised by.',
      'The subject is what mass is, and the writing needs both of its operational meanings on the screen at once rather than one after the other.',
    ],

    avoidWhen: [
      'The argument is about falling, or about bodies of different weight reaching the ground together. Nothing on this screen falls; the tests are a beam and a push along ice.',
      'The point is that mass and weight are different quantities, or that weight varies from place to place. Both panels stay in one unchanging gravity and no weight in newtons is named.',
      'What is wanted is a definite force producing a definite acceleration. The push on the ice is a comparison of how far each body gets, and no force or acceleration is shown.',
      'The article turns on what an unpushed body does. Everything here is pushed or pulled deliberately, and the resting state is the thing being set up rather than the thing being shown.',
      'Numbers for the masses are wanted. The count of weights is the only measure on the screen and the bodies carry no values.',
    ],

    contrastWith: [
      {
        concept: 'free-fall',
        note: 'One is why the two masses being equal matters — it is what makes the rate of fall the same for every body; the other is that sameness of fall shown happening.',
      },
      {
        concept: 'newtons-first-law',
        note: 'One asks how much a particular body resists being pushed and whether gravity agrees about the answer; the other asks what a body does when nothing pushes it at all.',
      },
      {
        concept: 'newtons-second-law',
        note: 'One varies the body and keeps the procedure; the other keeps the body and varies the force.',
      },
      {
        concept: 'gravitational-acceleration',
        note: 'One says the pull of gravity on a body and its resistance to being pushed are the same quantity; the other says what follows for the velocity when they are.',
      },
    ],
  },
};
