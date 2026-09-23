/**
 * nonlinear-oscillation 개념 선언.
 *
 * 이 묶음에서 주어가 **되미는 힘의 법칙**인 유일한 개념이다. 형제와의 갈림은 「무엇이
 * 달라지면 무엇이 달라지는가」 로 선다.
 *   nonlinear-oscillation 힘이 변위에 비례하지 않으면 **진폭이 주기를 바꾸고** 모양이 일그러진다
 *   driven-oscillation    바깥 박자가 **응답의 박자와 방향**을 정한다
 *   quality-factor        저항이 **봉우리의 폭과 울림 길이**를 정한다
 *
 * 이쪽만 「비례를 벗어난다 · 단단해진다 · 앞질러 간다 · 봉우리가 뾰족하다」 어휘를 갖는다.
 * 구동 · 공명 · 감쇠 어휘는 쓰지 않는다 — 화면에도 흔드는 손도 저항도 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const nonlinearOscillationConcept: Aperi21ConceptSource = {
  id: 'nonlinear-oscillation',
  label: 'Nonlinear Oscillation',
  canonicalSim: 'aperi21:nonlinear-oscillation',

  surface: {
    definition:
      'Swinging under a restoring force that is not proportional to how far the body has been displaced, so that how far it was pulled decides how long a cycle takes and the motion stops being a plain sine.',
    exemplarKeywords: [
      'nonlinear oscillation',
      'anharmonic oscillation',
      'the period depends on the amplitude',
      'a spring that stiffens the further you stretch it',
      'restoring force not proportional to displacement',
      'when Hooke’s law stops holding',
      'large-amplitude swings run faster than small ones',
      'the motion is no longer a sine curve',
      'hardening spring',
      'beyond the small-angle approximation',
      'pointed peaks instead of rounded ones',
    ],
  },

  briefing: {
    observable: [
      'Two identical springs hang from ceilings set at the same height, each with a mass on its end. The only difference between the two is how far the mass was pulled down before it was let go — the upper a little, the lower a great deal.',
      'To the right of each a chart is written on as time passes, with a pen marking the present end of the trace.',
      'On each chart a dashed curve is already laid down before the pen arrives, showing the trace that a force strictly proportional to the displacement would have produced. The dashed curve covers exactly two of its own cycles across the width of the chart.',
      'The upper trace runs along its dashed curve and stays on it, ending only a shade ahead of it by the far edge.',
      'The lower trace reaches its first low point before the dashed curve does, and keeps gaining: by the far edge it has been up and down three times or so while the dashed curve has managed two.',
      'The peaks of the lower trace are pointed where the dashed curve is rounded — it turns around sharply instead of easing round.',
      'Beside the lower mass, when it is far from its resting place, two arrows are drawn from the same spot: a solid one in the accent colour for the force the spring is actually giving, and a dashed one for what a proportional force would have been. The solid one is several times the longer.',
      'Beside the upper mass no such arrows appear, because at the small distances it travels the two would be the same short length — the two lanes use one and the same scale for their arrows.',
      'Between rounds each mass is drawn back up to where it started and held, and during that holding no force arrows are drawn.',
      'A line of text below names what is happening — the two being released, the stiffening far out, and the result.',
    ],

    screen: {
      affordances: [
        'Both lanes are written on at once against one shared time axis, so the comparison sits in a single frame rather than in a memory of how the picture looked a moment ago.',
        'Nothing is offered to set — the two pull-downs are fixed, which keeps the dashed reference curve and the framing the same on every round.',
        'The reader arrives partway through a round, with both masses moving and the traces already half a cycle along.',
        'Dashes carry one meaning throughout, both on the charts and beside the masses: what a proportional force would have given. For that reason the time axis is drawn as a thin solid line rather than a dashed one.',
        'The accent colour is kept for one meaning only, the force the spring is actually giving.',
        'The dashed reference is drawn underneath the trace so that it can be seen whether the trace covers it or leaves it behind.',
        'The writing is slowed below real speed so the shape of each turnaround can be followed.',
        'No figures appear — not the periods, not the amounts pulled, not the ratio between them.',
      ],
    },

    useWhen: [
      'The article has said that a swing’s timing stops being independent of its size once the force is no longer proportional, and the reader needs that as something seen. Two traces on one time axis, one keeping to its dashed reference and the other pulling ahead of it, is what shows it.',
      'The point is that the departure has a cause in the force law rather than in the motion, and a case is wanted where the actual pull and the proportional one are drawn side by side at the moment they differ most.',
      'The article needs the shape of the motion itself to be the evidence — a turnaround that comes to a point rather than easing round.',
    ],

    avoidWhen: [
      'The article is about a swing that is kept going or set going from outside. Both masses here are pulled once and released, and nothing shakes them.',
      'The subject is a swing dying away. Neither of these loses anything; both keep going at the size they were given.',
      'What is wanted is a curve of period against amplitude, or the force plotted against displacement. Neither is drawn; the departure is read off the traces.',
      'The point is a pendulum at large angles in particular. What hangs here is a mass on a spring, and the spring is made to stiffen rather than to soften.',
      'Values are needed — how much the period changed, how much stiffer the force got. Nothing is written as a figure.',
    ],

    contrastWith: [
      {
        concept: 'spring-force',
        note: 'One is about what happens once the pull stops growing in proportion to the stretch; the other is about that proportion itself, which is the case this one departs from.',
      },
      {
        concept: 'stress-strain-curve',
        note: 'Both are about a material’s answer ceasing to be proportional, but one reads that departure in the timing and shape of a repeated motion, while the other reads it as a bend in a curve of load against stretch.',
      },
      {
        concept: 'phase-space',
        note: 'Both show a swing departing from the plain repeating case, but one draws the departure as a trace against time running ahead of its reference, while the other drops time and reads the departure as the shape of a loop.',
      },
    ],
  },
};
