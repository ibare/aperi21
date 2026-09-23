/**
 * kinetic-friction 개념 선언.
 *
 * 위험한 짝은 `static-friction`. **주장을 갈랐다.**
 *   kinetic-friction  미끄러지는 **동안** — 빠르기가 달라도 크기가 하나라 같은 만큼씩 느려진다
 *   static-friction   움직이기 **전** — 당기는 만큼 따라 커지다 한계에서 놓친다
 * 이쪽만 두 줄 견줌 · 빠르기 무관 · 같은 만큼씩 · 눈금 간격 어휘를 갖는다. 저쪽의 문턱 ·
 * 한계 · "따라 커진다" 는 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const kineticFrictionConcept: Aperi21ConceptSource = {
  id: 'kinetic-friction',
  label: 'Kinetic Friction',
  canonicalSim: 'aperi21:kinetic-friction',

  surface: {
    definition:
      'The drag a surface puts on a body already sliding across it, the same size whether the body is going quickly or slowly, so that any two sliders lose speed at one rate.',
    exemplarKeywords: [
      'kinetic friction',
      'sliding friction',
      'does friction depend on speed',
      'friction while something is moving',
      'a fast object and a slow object slowing down',
      'how long until a sliding object stops',
      'drag on a sliding block',
      'friction is the same at any speed',
      'losing the same speed each second',
      'coming to rest on a rough floor',
    ],
  },

  briefing: {
    observable: [
      'Two lanes of the same floor run one above the other, each carrying a written name — one box starts fast, the other starts slow.',
      'Each box has two arrows: its velocity, and the friction from the floor drawn in the accent colour.',
      'At the start the two velocity arrows differ by a factor of two while the two friction arrows are exactly the same length, and they stay the same length as long as either box is moving.',
      'A tick is left on each lane at every whole second and the ticks are never erased, so each lane keeps its own record of the ground it covered second by second.',
      'The gaps between one lane’s ticks narrow by the same amount from one second to the next, and the gaps on the other lane narrow by that same amount, although one lane’s gaps are the wider throughout.',
      'The slow box runs out of speed first; its velocity arrow disappears and its ticks stop while the fast box is still going with the friction arrow on it unchanged.',
      'When the fast box stops too, the two rows of ticks stand finished side by side — different numbers of ticks, the same shrinkage in every gap.',
      'The captions say it in turn: the friction is the same on both and both lose speed by the same amount; the slow one stopped first and the fast one still has the same friction; both have stopped and the tick gaps narrowed by the same width in both lanes.',
      'The run arrives already in progress and repeats, so the boxes are never watched starting from rest.',
    ],

    screen: {
      affordances: [
        'The two lanes run side by side on one clock, which is what lets a length on one lane be laid against a length on the other at the same instant.',
        'The ticks accumulate and stay, so the whole history of both slowings is still on the screen at the moment both have stopped.',
        'The accent colour is kept for the friction arrows alone, so the thing that is claimed to be equal is the thing the eye is sent to.',
      ],
    },

    useWhen: [
      'The reader expects a fast thing to be dragged harder than a slow one. Two friction arrows of exactly equal length on boxes moving at very different speeds is the direct answer.',
      'The article needs a case where a constant force produces a constant loss of speed, and wants that loss read off a record of positions rather than from a formula.',
      'The writing is about why a sliding object stops, and wants the difference in stopping to come only from how fast it set off.',
    ],

    avoidWhen: [
      'The body has not started moving and the question is what it takes to get it going. Both boxes are already sliding when the run is met and neither is ever at rest and pulled.',
      'The subject is a threshold, or friction matching an applied force. Nothing pulls these boxes and no limit is marked.',
      'A coefficient, a mass or a force in newtons is wanted. No values are written and neither the weight nor the floor’s upward push is drawn.',
      'The article wants a velocity-time graph or any plotted axes. The record here is ticks along the floor itself.',
      'What happens after the boxes stop is the point — whether they stay put, or what holds them. The run ends with both at rest and no arrows on them.',
    ],

    contrastWith: [
      {
        concept: 'static-friction',
        note: 'One is friction during a slide, whose size owes nothing to the sliding; the other is friction before a slide, whose size is exactly whatever is being applied.',
      },
      {
        concept: 'uniformly-accelerated-motion',
        note: 'One says what makes a steady loss of speed happen and that it is the same for both bodies; the other says what a steady change of speed looks like as a record of marks.',
      },
      {
        concept: 'newtons-second-law',
        note: 'One keeps the force equal across two bodies and finds their rates of change equal; the other varies the force on identical bodies and finds the rate follow it.',
      },
      {
        concept: 'normal-force',
        note: 'Both are given by a contact surface — one along it and set by nothing the body does, the other across it and set by everything pressing on it.',
      },
    ],
  },
};
