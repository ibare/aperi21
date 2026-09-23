/**
 * gyroscopic-precession 개념 선언.
 *
 * 형제는 `angular-momentum-vector`. **규칙이냐 원인이냐**로 갈랐다.
 *   angular-momentum-vector  화살표를 **세우는 규칙** — 축 위, 오른손이 고른 끝
 *   gyroscopic-precession    그 화살표를 **돌리는 원인** — 무게가 만든 돌림힘이 옆으로만 더해진다
 * 이쪽만 무게 · 돌림힘 · 「왜 떨어지지 않는가」 · 옆으로 돎 · 세차 어휘를 갖는다.
 * 오른손 규칙 · 엄지 · 감는 방향이라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const gyroscopicPrecessionConcept: Aperi21ConceptSource = {
  id: 'gyroscopic-precession',
  label: 'Gyroscopic Precession',
  canonicalSim: 'aperi21:gyroscopic-precession',

  surface: {
    definition:
      'The slow sideways circling of a spinning body’s axle under the torque of its own weight, which turns the direction of its angular momentum instead of tipping the body over.',
    exemplarKeywords: [
      'precession',
      'gyroscope',
      'why doesn’t a spinning top fall over',
      'a torque turns the spin axis instead of toppling it',
      'a bicycle wheel spinning on the end of a rope',
      'the axle moves sideways instead of downward',
      'gyroscopic effect',
      'a top tracing a slow circle while it spins',
      'how fast the axis goes round versus how fast it spins',
      'the weight pulls down but the thing goes around',
    ],
  },

  briefing: {
    observable: [
      'A disc on an axle balances on a single point atop a post, seen from above and to one side; the whole thing leans rather than standing upright, and a shadow of the axle lies on the ground beneath.',
      'Three arrows leave the pivot area: one hanging straight down from the disc for its weight, one lying along the axle, and a third, in its own colour, sticking out to the side.',
      'The sideways arrow is at right angles to the axle rather than along the direction the weight pulls.',
      'A faint dotted circle marks the horizontal path the far end of the axle arrow travels; the tip stays on it and never drops below it.',
      'A train of short segments, all in the colour of the sideways arrow, is laid end to end around that circle behind the axle tip, each joined at a right angle to the one before, and together they curve into the ring.',
      'A new segment is added at the tip in every second of running, and the oldest ones fade away, so at most about one turn’s worth is ever in view.',
      'The axle arrow keeps its length exactly while its direction works around the circle, and the shadow on the ground sweeps round with it at unchanging length.',
      'The disc goes on spinning about its own axle the whole time, its spokes turning, while the axle itself makes its much slower circuit.',
      'A figure to the side gives how long one circuit of the axle takes, and it changes when the spin is changed.',
      'With a faster spin the train of segments wraps a wider, slower ring; with a slower spin the circuit tightens and quickens.',
    ],

    screen: {
      affordances: [
        'A slider at the bottom right sets how fast the disc spins, and the figure beside it reports how long one circuit of the axle then takes, so the relation between the two rates can be worked through by hand.',
        'Changing the spin clears the train of segments and starts a fresh one from the current position, so the segments on screen always belong to the rate now running.',
        'The turning runs by itself and keeps going; there are no stages to wait for and no play or pause, and a few segments are already laid down at the moment the picture arrives.',
        'One colour is kept for the sideways arrow and the segments it has laid down, which is what makes the train readable as an accumulation of that one thing.',
        'The viewpoint is fixed, so the circling of the axle cannot be confused with a camera moving round the scene.',
        'The dotted circle and the ground shadow are drawn to the same scale as the axle arrow, so that the tip is staying level and the length is unchanged can be checked rather than taken on trust.',
      ],
    },

    useWhen: [
      'The article has stated that a torque changes angular momentum and the reader cannot connect that to a top refusing to fall. A train of sideways segments laid end to end at the tip of the axle arrow, curving it into a circle at fixed length, is what joins the statement to the behaviour.',
      'The writing needs the counterintuitive direction made explicit — the weight pulls down, the response is at right angles — and a case is wanted where the right angle between them is there to be looked at.',
      'The reader is to be given the relation between spin rate and circuit rate as something to discover, by turning the spin up and watching the reported circuit time move the other way.',
    ],

    avoidWhen: [
      'The point is how the direction of a spin arrow is decided in the first place. That the arrow lies along the axle is assumed here, not argued.',
      'The subject is a quantity being conserved as a body draws in or spreads out its mass. Nothing here changes shape.',
      'The article is about a body swinging back and forth or coming to rest. This one turns steadily and does not oscillate or settle.',
      'The nodding or wobbling that a real top shows on top of its circling is what the reader is asking about. The axle here circles smoothly and level.',
      'The subject is a body travelling around a circular path rather than a direction working its way around one. Nothing here is carried anywhere.',
    ],

    contrastWith: [
      {
        concept: 'angular-momentum-vector',
        note: 'One is about what makes the spin arrow turn and why that leaves the body standing; the other is about how the arrow was given its direction to begin with.',
      },
      {
        concept: 'centripetal-force',
        note: 'Both turn something without changing its size — one turns the direction of a spin, the other the direction of a travelling body — and in both the cause acts at right angles to what it changes.',
      },
      {
        concept: 'net-force',
        note: 'One is a case where the response is at right angles to the pull rather than along it; the other is the ordinary case where the direction of the remainder is the direction taken.',
      },
      {
        concept: 'conical-pendulum',
        note: 'Both have something tracing a slow horizontal circle at a fixed tilt, but one is an axis turning while the body stays put and the other is a body actually being carried round.',
      },
      {
        concept: 'angular-acceleration',
        note: 'One is a turning effort that changes the direction of a rotation without changing its rate; the other is a turning effort that changes the rate.',
      },
    ],
  },
};
