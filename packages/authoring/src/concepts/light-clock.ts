/**
 * light-clock 개념 선언.
 *
 * 시간 넷 중 「**왜**」 를 맡는다 (`time-dilation` = 얼마나 · `muon-decay-evidence` =
 * 정말인가 · `twin-paradox` = 누가). 이 조각만 **작도**다 — 빗변 · 직각삼각형 · 컴퍼스
 * 호로 한 째깍이 왜 길어지는지를 기하로 보인다. 바늘 시계도 째깍 세기도 없다.
 * `michelson-morley` 와도 갈린다 — 저쪽은 빛의 빠르기가 같다는 것을 **찾아낸** 실험이고
 * 이쪽은 그것을 **전제로 놓고** 결과를 잰다.
 *
 * 조각에 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const lightClockConcept: Aperi21ConceptSource = {
  id: 'light-clock',
  label: 'Why a Moving Clock Runs Slow — the Diagonal Path',
  canonicalSim: 'aperi21:light-clock',

  surface: {
    definition:
      'Why a clock kept by light bouncing between two mirrors must run slow when it moves sideways: its light has a longer slanted path to cover at the same speed.',
    exemplarKeywords: [
      'light clock',
      'why does a moving clock run slow',
      'light bouncing between two mirrors',
      'the light has to travel diagonally',
      'a longer path at the same speed of light',
      'thought experiment with mirrors on a moving vehicle',
      'hypotenuse against the gap between the mirrors',
      'the right-angled triangle behind the time factor',
      'the speed of light is the same in every frame',
      'three four five triangle for the stretching of time',
    ],
  },

  briefing: {
    observable: [
      'Two clocks of the same make stand side by side, each one being nothing but a pair of mirrors facing each other; the left one holds still and the right one slides sideways at four fifths of light speed.',
      'A tick is one crossing of the gap, not a round trip, so what is drawn is one journey of light from the lower mirror to the upper one.',
      'Both clocks release their light at the same moment; the left one\'s light goes straight up while the right one\'s light slants, carried sideways with the clock while it climbs.',
      'The two grains of light move at the same rate along their own paths, and the lower mirrors they left are marked faintly where they were.',
      'When the still clock\'s light reaches its upper mirror it ticks, and at that same instant a ring is left where the moving light has got to — still short of its own upper mirror, with a dotted line joining the two to show the instants are the same.',
      'The moving light then arrives at its own upper mirror and ticks, later, leaving its slanted path drawn as a line.',
      'A right-angled triangle is then built on what is left: the slanted path as its longest side, the distance the clock travelled sideways along the bottom, and the mirror gap standing upright with a right-angle mark.',
      'A compass arc swings the upright mirror gap around onto the slanted side and lands exactly on the ring left at the earlier instant, so the slant is plainly longer than the gap by a visible amount.',
      'Beside the still clock a measured span marks the same mirror gap, making the upright side of the triangle and that gap one and the same length.',
      'A single written ratio finishes it, naming the long side against the upright as five thirds.',
      'The only figures written are that ratio and the speed of the moving clock; no side lengths, times, or formulae appear.',
    ],

    screen: {
      affordances: [
        'The release, the two arrivals, the building of the triangle and the fading go round by themselves; nothing has to be pressed.',
        'Both clocks fire at the same moment and are drawn identically, so what the light does can be put down only to the sideways motion.',
        'The arc and the ring land on the same point by two different routes — one from length, one from time — which is where the constancy of the speed of light shows itself without being written down.',
        'What is offered for comparison is two lengths rather than two numbers; the figures kept on screen are a stated speed and a stated ratio.',
      ],
    },

    useWhen: [
      'The reader has accepted that moving clocks run slow and now wants to see that it follows from something rather than being decreed. A triangle whose long side is plainly longer than its upright, built from the paths actually drawn, is the whole argument in one figure.',
      'An article is about to introduce the factor by which time stretches and needs the geometry it comes out of established before any algebra appears.',
    ],

    avoidWhen: [
      'The question is how large the effect is or how many ticks each clock got through. Only one crossing is followed here and nothing is counted.',
      'The article needs evidence that this happens in the world. The clocks here are a construction for an argument, and no measurement is shown.',
      'The subject is a traveller who leaves and returns, or who ends up younger. Both clocks here go one way and never meet again.',
      'What is wanted is the algebra — squaring the sides, or the expression for the factor in terms of speed. The relation is shown as a shape and a ratio and never written as an equation.',
      'The article is about light being deflected, refracted or reflected off a surface at an angle. The slant here comes from the clock moving, not from anything done to the light.',
    ],

    contrastWith: [
      {
        concept: 'time-dilation',
        note: 'One accounts for why a single tick takes longer when the thing keeping time moves; the other leaves the cause alone and establishes the size of the effect by counting ticks against ticks.',
      },
      {
        concept: 'michelson-morley',
        note: 'One assumes from the outset that light travels at the same rate for every observer and draws out the consequence; the other is the measurement that made that assumption unavoidable.',
      },
      {
        concept: 'length-contraction',
        note: 'Both follow from the same assumption about light, one arriving at what happens to the duration of a tick and the other at what happens to the extent of a body along its motion.',
      },
      {
        concept: 'muon-decay-evidence',
        note: 'One is the reasoning that says a moving clock must fall behind; the other is the count in nature that shows something really does.',
      },
    ],
  },
};
