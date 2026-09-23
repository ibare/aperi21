/**
 * angular-momentum 개념 선언.
 *
 * `conservation-of-angular-momentum` 과 **누가 건드리는가**로 갈랐다.
 *   angular-momentum                **밖에서** 친다 — 이미 지닌 양이 클수록 축이 덜 밀린다
 *   conservation-of-angular-momentum **아무도 건드리지 않는다** — 제 모양을 바꿔 빠르기가 바뀐다
 * 이쪽만 팽이 · 자이로 · 친다 · 축을 지킨다 어휘를 갖고, 저쪽만 팔을 오므린다 · 맞바꿈 ·
 * 그대로인 양 어휘를 갖는다. 화면은 L 을 화살표로도 수로도 내놓지 않으므로 벡터 · 오른손
 * 규칙 · Iω 값은 avoidWhen 으로 되돌린다 (간극 장부에 올렸다).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const angularMomentumConcept: Aperi21ConceptSource = {
  id: 'angular-momentum',
  label: 'Angular Momentum',
  canonicalSim: 'aperi21:angular-momentum',

  surface: {
    definition:
      'What a spinning body carries that makes its axis hard to turn aside, so one already spinning fast is shifted less by the same blow than a slow or a still one.',
    exemplarKeywords: [
      'angular momentum',
      'why a spinning top does not fall over',
      'gyroscopic stability',
      'a moving bicycle stays upright',
      'knocking a spinning object sideways',
      'spin keeps the axis pointing where it points',
      'rifling a bullet to keep it steady',
      'the faster it spins the steadier it is',
      'rotational counterpart of momentum',
      'a wheel that resists being tilted',
    ],
  },

  briefing: {
    observable: [
      'Three identical tops stand on their points, seen from slightly above and to one side; they are the same shape and the same weight, and the only thing that differs is how fast each is spinning.',
      'The spin is legible even when the picture is still, because each top’s spokes leave a smeared sector behind them — none at all for the first, a narrow one for the second, a wide one for the third.',
      'Three accent-coloured arrows of the same length come in from the same direction and reach the three heads at the same moment.',
      'The top that was not spinning goes over the way it was struck, until the rim of its disc lies on the floor.',
      'The slowly spinning one leans more than thirty degrees and wanders round in a wide loop, staying up.',
      'The fast one keeps to its line, and its head traces a loop no bigger than a dot.',
      'An upright dotted line stands beside each top, so how far each has left its own starting line is compared without any scale.',
      'The path each head takes stays on the screen, so at the end the three results — an arc down to the floor, a wide loop, a dot — stand side by side.',
      'Pale copies of the three arrows are left where they struck, so it is still visible at the end that the blow was the same for all three.',
    ],

    screen: {
      affordances: [
        'The standing, the blow and everything that follows it run in order by themselves and then come round again.',
        'All three tops are drawn in the same ink on the same floor, which leaves the spin smear and the trace as the only things telling them apart.',
        'The view is taken from above and offset from the direction of the blow, which keeps the lean of the middle top from being hidden by being looked at edge on.',
        'The accent colour is kept for the blow alone, while the traces and the upright reference lines stay in quieter tones.',
        'The whole scene runs at about a third of real speed, at one rate from beginning to end, so no change of pace can be mistaken for a change of spin.',
      ],
    },

    useWhen: [
      'The article has introduced angular momentum as the rotational counterpart of momentum and the reader has no picture of what carrying more of it looks like. Three of the same top under the same blow supplies it.',
      'The claim being made is that spinning is what keeps something upright — a top, a wheel, a thrown ball — and a graded case is wanted rather than a spinning-or-not one.',
    ],

    avoidWhen: [
      'The article is about a spinning body speeding up or slowing down on its own as it changes shape. Nothing about these three changes after the blow except how far each leans.',
      'Why the lean goes sideways rather than the way it was struck, or the slow carrying of the axis round a cone, is what has to be explained. The claim here stops at how far the axis was shifted.',
      'A vector along the axis, its direction by the right-hand rule, or the adding of one to another is needed. Nothing on the screen stands for the quantity itself.',
      'Values are wanted — how much, in what units, or the ratio between the three. The three are told apart by their smear and by a name.',
      'The subject is momentum in a straight line, or a collision in which it is handed between bodies. Each of these keeps its point on the floor throughout.',
    ],

    contrastWith: [
      {
        concept: 'conservation-of-angular-momentum',
        note: 'One asks how far an outside blow can shift a body that already carries this quantity; the other asks what becomes of the quantity when nothing outside touches the body at all.',
      },
      {
        concept: 'rotational-kinetic-energy',
        note: 'Both are carried by a spinning body, but one is spent to buy height and the other is what keeps an axis pointing where it points.',
      },
      {
        concept: 'moment-of-inertia',
        note: 'One is about how much spin a body is carrying; the other about how hard it was to give it that spin in the first place.',
      },
      {
        concept: 'newtons-first-law',
        note: 'One is a body keeping the direction its axis points until something turns it aside; the other a body keeping the velocity it has until something changes it.',
      },
    ],
  },
};
