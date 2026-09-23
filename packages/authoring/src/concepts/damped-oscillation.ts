/**
 * damped-oscillation 개념 선언.
 *
 * 형제는 `damping-regimes`. 둘 다 「저항이 있는 진동」이라 definition 이 붙기 쉽다.
 * **감쇠가 하나냐 여럿이냐**로 갈랐다.
 *   damped-oscillation  감쇠 **하나** 안에서의 법칙 — 마루가 회마다 같은 비로 줄고, 간격은 그대로다
 *   damping-regimes     감쇠 **셋의 견줌** — 넘실거림 · 넘치지 않음 · 늦어짐, 가장 먼저 멎는 것은 가운데
 * 이쪽만 같은 비율 · 포락선 · 잦아듦 어휘를 갖는다. 부족 · 임계 · 과도 · 정착 시각이라는
 * 말은 쓰지 않는다 (그쪽 어휘다).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const dampedOscillationConcept: Aperi21ConceptSource = {
  id: 'damped-oscillation',
  label: 'Damped Oscillation',
  canonicalSim: 'aperi21:damped-oscillation',

  surface: {
    definition:
      'An oscillation bleeding energy to its surroundings, in which every peak comes out the same fraction of the one before it while the spacing between peaks is left alone.',
    exemplarKeywords: [
      'damped oscillation',
      'why does a swinging thing die down',
      'the amplitude decays exponentially',
      'logarithmic decrement',
      'each swing is a fixed fraction of the last',
      'decay envelope of a vibration',
      'damping barely changes the period',
      'a weight oscillating in water or oil',
      'a ringing that fades away',
      'successive peaks getting smaller in the same proportion',
    ],
  },

  briefing: {
    observable: [
      'A block hangs from a spring inside a tank of liquid and rides up and down, the liquid drawn over it so the block shows through as it moves.',
      'To the right a pen crosses a chart at a steady pace, writing the height of the block, joined to it by a dotted tie-line; the wave that comes out grows shallower toward the right.',
      'Each time the pen reaches a crest it leaves an upright stroke running from the axis up to that crest.',
      'The strokes stand at even intervals all the way along, so the crests are not only lower but evenly spaced.',
      'Between each pair of neighbouring strokes, just above their tips, a small chip appears giving the later crest as a multiple of the earlier one.',
      'A new chip appears with each new crest, and all five read the same number — the drop from stroke to stroke shrinks while the figure written between them does not change.',
      'Once five waves are down, a dotted curve is drawn from left to right joining the tips of the strokes, and every tip sits on it.',
      'The record then fades and the block is drawn back up to where it began, ready to be released again.',
      'The line the block rests on and the axis the wave is drawn about are the same line, marked with a t at the right-hand end.',
    ],

    screen: {
      affordances: [
        'The swinging, the writing, the strokes, the chips and the joining curve run in order on their own and begin again, so the whole argument completes without anything being asked for.',
        'The ratio is written as a multiplier rather than as a subtraction, so the thing that stays the same is what is printed and the thing that changes is left to the shrinking strokes.',
        'One colour is kept for the crest heights and the figures between them, so the strokes, the chips and the joining curve read as one claim.',
        'The tank is part of the picture rather than an annotation, so the reason the motion fades is established before the record is read.',
        'The block, the spring and the chart are arranged exactly as they are in the undamped case, so what has been added is visible as the liquid and the falling crests and nothing else.',
        'The page opens partway through the record, with a crest already marked.',
        'No decay constant, period or amplitude is written; the only figures are the repeated ratios.',
      ],
    },

    useWhen: [
      'The article has said that a damped amplitude decays exponentially and the reader has no picture for what makes it exponential rather than merely decreasing. Five identical multipliers standing between five unequal drops is what supplies that.',
      'The writing needs the point that the rhythm survives the fading — the swings get smaller but not slower — and a case is wanted where the even spacing of the crests carries it.',
    ],

    avoidWhen: [
      'The subject is how much damping to use, or the difference between too little and too much. One damping runs here and it is never varied or compared.',
      'The oscillation in question is being driven from outside, or the question is what happens near a resonant frequency. Nothing pushes this one after the release.',
      'The point is where the lost energy goes or what it turns into. The liquid is what takes it away and the screen does not follow it.',
      'The article is about the undiminished case, with cycles that repeat unchanged. Every cycle here is smaller than the last.',
      'The reader needs the shape of an ordinary oscillation against time and the fading would be a distraction.',
      'Values are wanted — a damping coefficient, a decay time, a period. Only the ratio between neighbouring crests is written.',
    ],

    contrastWith: [
      {
        concept: 'damping-regimes',
        note: 'One stays inside a single amount of damping and states the law the successive peaks obey; the other varies the amount and compares the outcomes, including ones where there are no peaks at all.',
      },
      {
        concept: 'simple-harmonic-motion',
        note: 'One is the case where nothing is taken away and every cycle repeats the last; the other keeps the same rhythm but lets each cycle come out a fixed fraction smaller.',
      },
      {
        concept: 'shm-energy',
        note: 'One is about energy being divided and returned intact within a cycle; the other is about energy leaving, which shows up between cycles rather than within one.',
      },
      {
        concept: 'terminal-velocity',
        note: 'Both involve a resistance that grows with speed, but one has it settling a motion into a steady state and the other has it eating away at something that keeps reversing.',
      },
      {
        concept: 'drag-force',
        note: 'One is about what a speed-dependent resistance does to a repeating motion over many cycles; the other is about that resistance itself.',
      },
    ],
  },
};
