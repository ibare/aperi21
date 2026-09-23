/**
 * coupled-oscillators 개념 선언.
 *
 * 「두 진자가 주고받는」 형제 셋 중 **옮겨 감과 합의 보존**을 맡는다.
 *   coupled-oscillators  흔들림이 **옆으로 통째로 옮겨 갔다 되돌아온다**. 두 몫의 합은 그대로
 *   normal-modes         뒤섞인 흔들림은 **정해진 모양 몇 개의 합**이다
 *   beats-in-oscillation 가까운 **두 진동수를 더하면** 합이 부풀었다 잦아든다
 *
 * 이쪽만 「넘어간다 · 주고받는다 · 몫 · 합이 그대로」 어휘를 갖는다. 모양 · 분해 · 모드
 * (normal-modes)와 진동수 차이 · 포락선 · 부풂의 빠르기(beats-in-oscillation)는 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const coupledOscillatorsConcept: Aperi21ConceptSource = {
  id: 'coupled-oscillators',
  label: 'Coupled Oscillators',
  canonicalSim: 'aperi21:coupled-oscillators',

  surface: {
    definition:
      'Two alike swinging bodies held together by a weak link, where a swing started in one of them crosses over completely to the other and comes back, the two shares always adding to the same whole.',
    exemplarKeywords: [
      'coupled oscillators',
      'coupled pendulums',
      'two pendulums joined by a light spring',
      'one pendulum stops while the other swings',
      'the swing passes from one to the other and back',
      'energy trading between two oscillators',
      'weak coupling between two identical oscillators',
      'why does the second one start moving on its own',
      'the shares change but the total stays put',
      'a swing handed over and handed back',
    ],
  },

  briefing: {
    observable: [
      'Two pendulums of the same length hang from one beam, with a slack, faint spring joining the two bobs partway down.',
      'Under each bob a dotted arc is laid out, the same length for both, marking how wide the left one was swinging at the start.',
      'On top of each dotted arc a solid arc shows where that bob has been over its last swing, fading towards the older end, so a still picture still says how widely each is swinging now.',
      'At first the left arc fills its dotted mark end to end while the right bob barely moves and its arc is little more than a dot.',
      'Over the next few seconds the left arc shortens while the right one lengthens, and the right one reaches its own dotted mark exactly — not partway, but the whole of it.',
      'Then it runs the other way: the right arc shrinks and the left one grows back out to its dotted mark, and the whole round begins again.',
      'A single bar below is divided into two shares, one drawn filled and the other hatched, with the boundary between them in the accent colour. The bar keeps a thin outline around its full length at all times.',
      'That bar never changes length. Only the boundary slides — the hatched share grows from one end until it has taken the whole bar, then gives it back.',
      'The boundary slides smoothly rather than trembling with each swing, so what is read from it is the slow handover and not the individual swings.',
      'The two pendulums are drawn identically, and the arcs and the bar share one colour because both are saying the size of a swing.',
    ],

    screen: {
      affordances: [
        'The handover and the return each take one leg of the run and the run repeats, so both directions come round without being asked for.',
        'Nothing is offered to set — the link between the pendulums is fixed at a weakness where one handover takes about five swings, which is what makes the handover visible as a handover rather than as the two moving together.',
        'The two shares of the bar are told apart by fill and hatching rather than by colour, because they are two parts of one thing and a colour change would read as two different things.',
        'The accent colour marks only the boundary between the shares, so the one thing moving in the bar is the one thing to watch.',
        'A line of text below says in words which leg of the round is running.',
        'No numbers appear anywhere — not how long a handover takes, not how strong the link is, not how fast either pendulum swings.',
      ],
    },

    useWhen: [
      'The article has said that joined oscillators pass a motion between them and the reader is likely to picture a partial leak. The right arc arriving exactly at the dotted mark that the left one started from is what makes it complete rather than partial.',
      'The point being made is that nothing is lost in the trading, and a case is wanted where the total is drawn as a single unchanging thing rather than as two amounts the reader has to add up.',
    ],

    avoidWhen: [
      'The article is about breaking a tangled motion into the fixed shapes a system can vibrate in. Only the two pendulums themselves are drawn here, never a decomposition of what they are doing.',
      'The subject is two frequencies added together and how quickly the result swells and fades. No waveform is drawn here and no frequency is set against another.',
      'What is wanted is how long the handover takes, or how the strength of the link changes it. The link is fixed and no time is marked.',
      'The article is about a swing that dies away, or one that is being kept going from outside. Nothing drives these two and the total never shrinks.',
      'Energy has to be split into the moving kind and the stored kind. The bar divides the total between the two pendulums, and never into kinds.',
    ],

    contrastWith: [
      {
        concept: 'normal-modes',
        note: 'One follows the swing as something handed from one body to the other and back; the other says the same tangled motion is really a set of fixed shapes laid on top of each other, each keeping to its own rhythm.',
      },
      {
        concept: 'beats-in-oscillation',
        note: 'Both are slow swellings built out of two close rhythms, but one is about a share moving between two bodies while the other is about two oscillations added into a single record.',
      },
      {
        concept: 'conical-pendulum',
        note: 'Both hang a bob on a string, but one is about a swing crossing between two of them, while the other is about a single bob held in a steady circle and the forces that keep it there.',
      },
      {
        concept: 'shm-energy',
        note: 'Both have a fixed total shared between two parts, each filling as the other empties, but here the two parts are two bodies holding the same kind of energy, and there they are two forms of energy within one body.',
      },
    ],
  },
};
