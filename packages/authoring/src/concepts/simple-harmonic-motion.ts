/**
 * simple-harmonic-motion 개념 선언.
 *
 * 이 묶음에서 가장 넓은 자리라 형제 넷이 모두 여기에 붙을 수 있다. **무엇을 주장하는가**로
 * 갈랐다.
 *   simple-harmonic-motion  운동의 **모양** — 변위에 비례하는 되미는 힘이 사인 곡선을 그린다
 *   shm-energy              같은 운동 안의 **에너지 몫** — 합은 그대로, 둘이 서로를 채운다
 *   mass-spring-system      한 번 오가는 **시간** — 질량이 정하고 진폭은 상관없다
 *   simple-pendulum         같은 시간을 **줄 길이**가 정한다
 * 이쪽만 「사인 곡선」 · 「왜 사인인가」 · 「되미는 힘이 변위에 비례」 어휘를 갖는다.
 * 주기 · 질량 · 에너지 · 진폭이라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const simpleHarmonicMotionConcept: Aperi21ConceptSource = {
  id: 'simple-harmonic-motion',
  label: 'Simple Harmonic Motion',
  canonicalSim: 'aperi21:simple-harmonic-motion',

  surface: {
    definition:
      'Motion produced when the force pushing a body back grows in proportion to how far it has been displaced, giving a displacement that traces a sine curve through time.',
    exemplarKeywords: [
      'simple harmonic motion',
      'why is an oscillation a sine wave',
      'restoring force proportional to displacement',
      'SHM',
      'F = -kx',
      'sinusoidal oscillation',
      'x = A cos omega t',
      'no force at the middle, largest force at the ends',
      'what makes a vibration harmonic rather than just repeating',
      'the shape of an oscillation drawn against time',
    ],
  },

  briefing: {
    observable: [
      'A block hangs from a spring fixed to a hatched ceiling and rides up and down along one vertical line.',
      'An arrow beside the block always points back toward the middle of its travel, and its length tracks how far the block has gone: longest at the turning points, gone altogether in the instant the block crosses the middle.',
      'To the right a pen crawls across a chart at a steady pace, writing down the height of the block; a dotted tie-line runs from the block across to the pen, so the two sit at the same height at every moment.',
      'Because the pen moves sideways at a constant rate, the up-and-down travel opens out into a wave, and three full waves are laid down before the pen stops.',
      'Eight times in each wave the pen leaves behind a copy of the arrow the block was carrying at that instant, drawn at the same scale, standing on the curve where it happened.',
      'Those stamped arrows are long at the crests and troughs, noticeably shorter at the places halfway up, and absent where the curve meets the axis.',
      'The line the block rests on and the axis the curve is drawn about are the same dotted line, marked only with a t at its right-hand end.',
      'When the three waves are complete the pen and the tie-line disappear, the finished curve is held for a moment, and the block goes on riding up and down behind it.',
      'The record then fades and a fresh sheet begins, without the block breaking stride.',
    ],

    screen: {
      affordances: [
        'The swinging, the writing of the curve and the stamping of the arrows run on their own and start over, so the whole record is laid down without anything being asked for.',
        'The arrow beside the block and the arrows stamped on the curve are drawn in one colour and at one scale, which is what makes them readable as the same quantity at two moments.',
        'The arrows on the curve are left behind lighter than the live one, so what is happening now and what happened earlier can be told apart at a glance.',
        'The page opens partway through a wave rather than on a blank sheet, so the writing is already under way.',
        'No numbers appear anywhere — not for displacement, not for force, not for how long a wave takes.',
      ],
    },

    useWhen: [
      'The article has stated that the restoring force is proportional to displacement and then asserted, without showing it, that the result is a sine curve. Watching the arrows grow toward the ends and vanish in the middle, and seeing the same arrows standing along the finished curve where it bends hardest, is what joins the two halves of that sentence.',
      'The reader has met the sine as a formula to be accepted and a picture is wanted in which the curve is something the motion drew rather than something imposed on it.',
    ],

    avoidWhen: [
      'The point is how long one round trip takes, or what makes it longer or shorter. Nothing here is timed, compared or labelled with a period, and only one oscillator is on the page.',
      'The subject is where the energy sits during the swing. Nothing on this screen is divided into shares or totalled up.',
      'The article is about an oscillation that dies away, or about a resistance that drains it. This one keeps the same height wave for wave.',
      'The velocity or the acceleration is what needs to be drawn. There is one arrow and it stands for the push back, not for how fast the block is going.',
      'Values are wanted — how stiff the spring is, how heavy the block is, how many seconds a wave takes. Not one number is written.',
    ],

    contrastWith: [
      {
        concept: 'shm-energy',
        note: 'One says what shape the motion takes when the push back is proportional to the displacement; the other takes that same motion as given and says how the energy inside it is divided at each moment.',
      },
      {
        concept: 'mass-spring-system',
        note: 'One is about the form of the motion, which is the same whatever the numbers are; the other is about its timing, which those numbers set.',
      },
      {
        concept: 'spring-force',
        note: 'One starts from a push back proportional to displacement and asks what motion follows; the other is about that proportionality itself, between stretch and pull.',
      },
      {
        concept: 'velocity-time-graph',
        note: 'Both put a quantity against time, but one is claiming what curve the motion produces while the other is claiming how an already-drawn curve should be read.',
      },
      {
        concept: 'damped-oscillation',
        note: 'One is the undiminished case, where every cycle repeats the last; the other keeps the same rhythm but lets each cycle come out smaller than the one before.',
      },
    ],
  },
};
