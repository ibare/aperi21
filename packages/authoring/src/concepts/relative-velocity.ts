/**
 * relative-velocity 개념 선언.
 *
 * 붙기 쉬운 둘과 갈랐다. 주어가 각각 다르다 —
 *   relative-velocity  **보는 사람**의 속도를 연속으로 훑는다. 기울기가 한 곳에서만 0 이고 지나치면 뒤집힌다
 *   river-crossing     **뱃머리**의 각도를 바꾼다. 보는 사람은 강둑에 붙박이다
 *   reference-frame    관측자 **둘**이 같은 사건을 달리 그린다는 것 (연속 가족이 아니다)
 * 이쪽만 「두 속도의 차」·「기울기가 0 이 되는 기준틀」 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const relativeVelocityConcept: Aperi21ConceptSource = {
  id: 'relative-velocity',
  label: 'Relative Velocity',
  canonicalSim: 'aperi21:relative-velocity',

  surface: {
    definition:
      'A velocity read as the difference between a body’s own and the watcher’s, so that moving the watcher through a range of steady speeds tilts the recorded path one way, straightens it, then tilts it the other.',
    exemplarKeywords: [
      'relative velocity',
      'velocity relative to the water',
      'subtracting the observer’s velocity',
      'how fast is it moving relative to me',
      'watching from a moving boat or car',
      'relative motion between two observers',
      'speed measured with respect to the ground',
      'velocity of A with respect to B',
      'the path looks different if you move along with it',
      'closing speed between two moving things',
    ],
  },

  briefing: {
    observable: [
      'A boat crosses a river between two banks, with foam streaks on the water, gravel on the banks and a mooring post standing on the far bank.',
      'Behind the boat a path builds up, the line it has covered so far, together with a row of dots laid at even intervals of time along it.',
      'Watched from the bank, that path leans over to one side; the boat is carried along by the water while it crosses.',
      'The whole scene then begins to drift: the banks, the gravel and the posts slide past while the water’s foam slows and stops, and the path the boat leaves straightens up.',
      'Held there, the path is upright and the dots are strung in a straight line, while the banks keep sliding — the same crossing that leaned a moment ago.',
      'The scene drifts back and the path leans over again, and the cycle repeats.',
      'A line of text names the current viewpoint as it changes — watching from the bank, drifting with the water, moving upstream, drifting slower than the water, drifting faster than the water — and says which way the path tilts in each.',
      'Pushed past the water’s own speed, the path tilts the opposite way from the way it tilted on the bank, having passed through upright exactly once.',
    ],

    screen: {
      affordances: [
        'A slider on the lower right sets the speed of the watcher, naming the water’s speed beside it so that the reader knows which setting the automatic tour keeps passing through.',
        'Its range reaches beyond the water’s speed and back past zero into moving upstream, so the tilt can be pushed both ways and the single upright setting hunted for rather than announced.',
        'While the tour is running the slider tracks the speed it is using, so taking hold of it continues from what is on screen rather than jumping.',
        'After the reader lets go the scene waits, then carries on touring from wherever it was left.',
        'Left alone it tours from the bank to drifting with the water and back on a loop, so the argument is made without touching the slider.',
      ],
    },

    useWhen: [
      'The reader accepts that descriptions differ between observers but treats it as a matter of appearance. Watching the very same crossing leave a leaning path and then an upright one, with nothing about the boat altered, is what makes the difference substantive.',
      'The article argues that there is no privileged velocity — that "really moving" has no answer — and needs a case where a whole family of watchers is passed through rather than two picked out.',
      'The claim is that a relative velocity can be made zero by choosing the right watcher, and a case is wanted where the reader can hunt for that single setting and overshoot it.',
    ],

    avoidWhen: [
      'The point is that the boat’s aim, not the watcher, decides where it lands. Nothing about the boat is adjustable here and it always makes the same crossing.',
      'The article is about an observer who is accelerating, rotating or in any way not moving steadily. Every watcher here drifts at a fixed speed along one line.',
      'Values are wanted — the boat’s speed, the current, the drift downstream, the crossing time. Only the watcher’s setting is shown as a number.',
      'The subject is a body released inside a moving vehicle and the two paths a fall can be said to have. There is no falling here and no vehicle carrying anything inside it.',
      'Velocity arrows or a vector subtraction drawn as arrows are needed for the argument. The case is made with the path the boat leaves, not with arrows.',
    ],

    contrastWith: [
      {
        concept: 'reference-frame',
        note: 'One sets two named observers against each other over a single event; the other sweeps continuously through a whole family of them and finds that exactly one makes the relative velocity vanish.',
      },
      {
        concept: 'river-crossing',
        note: 'One holds the crossing fixed and moves the watcher; the other holds the watcher on the bank and changes how the boat is aimed. One is about description, the other about where the boat actually lands.',
      },
      {
        concept: 'uniform-motion',
        note: 'One is the motion whose marks stay evenly spaced; the other points out that whether the marks lie on a straight line at all depends on who is laying them down.',
      },
      {
        concept: 'vector-addition',
        note: 'One is the bare rule for combining two arrows; the other is what happens when one of the two is the watcher’s own motion, so that combining them changes the description rather than the thing described.',
      },
    ],
  },
};
