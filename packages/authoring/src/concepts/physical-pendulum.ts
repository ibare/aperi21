/**
 * physical-pendulum 개념 선언.
 *
 * 진자 형제 중 **크기가 있는 물체**를 맡는다. `simple-pendulum` 과의 갈림은 줄 끝의 추냐
 * 핀에 걸린 몸통이냐이고, 그것이 주기를 정하는 변수를 바꾼다.
 *   simple-pendulum    줄 길이 — 길수록 느리다, 한 방향
 *   physical-pendulum  매단 자리 — 옮기면 빨라지다가 **다시 느려진다**, 가장 빠른 자리가 있다
 * 이쪽만 핀 · 매단 자리 · 질량 중심까지의 거리 · 「같은 주기인 두 자리」 어휘를 갖는다.
 * 줄 · 추 무게라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const physicalPendulumConcept: Aperi21ConceptSource = {
  id: 'physical-pendulum',
  label: 'Physical Pendulum',
  canonicalSim: 'aperi21:physical-pendulum',

  surface: {
    definition:
      'The swinging of a rigid body of real extent about a pivot away from its centre of mass, whose round-trip time depends on where along the body that pivot has been placed.',
    exemplarKeywords: [
      'physical pendulum',
      'compound pendulum',
      'swinging a rod from a hole near one end',
      'where should the pivot go to swing fastest',
      'period of a swinging rod',
      'distance from the pivot to the centre of mass',
      'two different pivots giving the same period',
      'swinging a bat or a ruler from a finger',
      'a hinged body oscillating',
      'moving the pivot toward the middle makes it slower again',
    ],
  },

  briefing: {
    observable: [
      'Four identical rods hang in a row from pins set at the same height, each drawn as an outline rather than a filled shape.',
      'Only the place the pin passes through differs: from left to right it sits closer and closer to the middle of the rod, so more and more of each rod stands up above its pin.',
      'On every rod a short bold segment runs from the pin down to a small ring marking the middle of the rod, and it gets shorter from left to right; on the rightmost the pin and the ring nearly touch.',
      'Beneath each rod a label gives that distance as a fraction of the rod length.',
      'All four are held at the same angle, then released together.',
      'The second rod pulls ahead of the first within a few swings and is eventually at the opposite extreme from it.',
      'The fourth falls a long way behind after only a swing or two and is still on the near side while the others have crossed.',
      'The third, whose pin has been moved further in than the second, has slowed down again and swings at the same angle as the first, the two of them side by side for the whole run.',
      'Each completed round trip spreads a ring at the bottom of that rod and adds a dot to a row beneath it, so the rows grow to different lengths — the second longest, the third and first equal, the fourth shortest.',
      'The record fades and the four are lifted back to the same angle to be released again.',
    ],

    screen: {
      affordances: [
        'The holding, the release, the drifting apart and the dots run on their own and repeat, so the whole comparison completes without anything being asked for.',
        'The four rods are held for a moment before they are let go, so it is established that they started together before the slowest one has had time to fall behind.',
        'The rods are drawn hollow and only the pin-to-centre segment is picked out, so the one thing that differs between the four is the one thing the eye is sent to.',
        'The pins are all at one height and evenly spaced, so the row reads as one property changed along it rather than as four unrelated setups.',
        'The rows of dots stay on the screen, so a still moment carries which pivot is quickest and which two are matched.',
        'The page opens shortly after the release, with the four still nearly parallel.',
        'No periods or lengths appear as numbers; the pivot distances are named as fractions of the rod.',
      ],
    },

    useWhen: [
      'The article has said that moving the pivot toward the centre speeds the swing up and the reader expects that to continue all the way in. One rod pulling ahead while a rod pivoted further in has fallen back into step with the end-hung one is what breaks the expectation.',
      'The writing needs the surprising pairing made concrete — two pivots at quite different places that nonetheless keep identical time.',
    ],

    avoidWhen: [
      'The swinging thing is a small weight on a string and the question is the string. Everything here is hinged through its own body.',
      'The subject is how hard a body is to spin about a chosen axis, or how that difficulty grows as the axis moves off centre. What is compared here is timing, not effort.',
      'The point is that a wide swing runs slow. All four start at one angle and the angle never changes.',
      'The article is about the shape of the motion against time or about the energy within it. Nothing is plotted or divided.',
      'A reader needs periods, lengths or a formula read off the screen. The only writing is the pivot distance of each rod.',
    ],

    contrastWith: [
      {
        concept: 'simple-pendulum',
        note: 'One is about a body whose own extent matters, so that where it is hinged changes its timing; the other treats the swinging thing as a weight at the end of a string, leaving only the string length to matter.',
      },
      {
        concept: 'angular-acceleration',
        note: 'One is about how a pivot choice changes the rhythm of a free swing; the other is about how a turning effort changes a spin rate.',
      },
      {
        concept: 'simple-harmonic-motion',
        note: 'One compares how long the swings of differently hinged bodies take; the other is about the form each of those swings has.',
      },
      {
        concept: 'pendulum-amplitude-dependence',
        note: 'Both are about something that shifts the timing, but one shifts it by moving the pivot along the body and the other by opening the swing wider.',
      },
    ],
  },
};
