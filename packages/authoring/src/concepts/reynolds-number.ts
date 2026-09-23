/**
 * reynolds-number 개념 선언.
 *
 * 흐름의 결을 다루는 이웃들과 **무엇을 주장하는가**로 갈랐다.
 *   reynolds-number  한 수가 **무차원**이다 — 굵기도 빠르기도 다른 둘이 같은 값이면 같이 흐트러진다
 *   boundary-layer   그 점성의 영향이 **벽 곁 얇은 띠**에 갇힌다
 *   drag-in-fluid    빠르기·두께를 묶어 두고 **뒤 모양**만 바꿔 저항을 견준다
 * 이쪽만 관 셋 · 같은 값 · 닮음 어휘를 갖는다. 문턱값 · 눈금은 화면에 없어 avoidWhen 으로 되돌린다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const reynoldsNumberConcept: Aperi21ConceptSource = {
  id: 'reynolds-number',
  label: 'The Reynolds Number as the One Number That Settles the Flow',
  canonicalSim: 'aperi21:reynolds-number',

  surface: {
    definition:
      'The dimensionless combination of speed, width and fluid that settles a flow’s character, so that two streams of quite different width and speed behave alike when it matches.',
    exemplarKeywords: [
      'Reynolds number',
      'dynamic similarity',
      'why a scale model in a wind tunnel behaves like the full-size thing',
      'same Reynolds number, same flow',
      'a dimensionless group of speed, diameter and viscosity',
      'a narrow pipe run at twice the speed',
      'scaling a flow up or down',
      'neither speed nor width decides the flow on its own',
      'Re equals rho v D over eta',
      'what makes two flows count as the same flow',
    ],
  },

  briefing: {
    observable: [
      'Three pipes carrying the same fluid are stacked one above another, drawn at their true widths: the top one wide, the middle one half as wide, the bottom one half as wide as the top.',
      'Each pipe carries a short symbol label saying its width and its speed — full width at one speed, half width at twice that speed, half width at the first speed again.',
      'A thread of dye is injected into each pipe, and all three threads are the same colour, so the difference between them is only in what they do.',
      'Pale specks drift along inside each pipe and show how fast the fluid is moving there; the middle pipe’s specks draw the longest, quickest strokes.',
      'While the speeds are holding steady, a chip on the right of each pipe carries a number. The top and middle chips carry the same number; the bottom chip carries half of it.',
      'The three pipes then speed up together by the same factor, and during that stretch the chips are blank rather than showing a passing value.',
      'At the faster steady speed, the top and middle threads break up at the same fraction along their pipes and spread into a cloud, while the bottom thread stays a single straight line. The chips read the same number for the top and middle, half for the bottom.',
      'The three then slow back down together and the two spreading threads settle again, so the break-up follows the number rather than anything the flow has been through.',
      'The bottom pipe runs at the same speed as the top one and is the same width as the middle one, and it is the only one that never breaks up.',
      'No equation, no diameter, no flow rate and no viscosity is written anywhere, and the pipes carry no scale.',
    ],

    screen: {
      affordances: [
        'One round runs by itself — steady slow, speeding up, steady fast, slowing down — and then begins again.',
        'The bottom pipe is half of the argument: it makes “faster means broken up” and “narrower means smooth” both come out false on this one screen.',
        'The chips appear only while a speed is being held, so every number on screen belongs to a flow that is actually settled.',
        'Widths are drawn in the true ratio rather than named in a label, because two flows being unlike is something that has to be seen before their behaving alike means anything.',
        'The accent colour is spent on the chips alone — the number that settles the flow — while every thread stays the same colour as the others.',
      ],
    },

    useWhen: [
      'The article has written the number as a formula and the reader treats it as something to compute. Two streams that look nothing alike breaking up at the same place, on the same beat, is what turns it into a statement about flows.',
      'The reader has come away with “fast flows go turbulent” or “thin pipes stay smooth”, and what is needed is the single counterexample that holds speed fixed against one pipe and width fixed against the other.',
      'The article is about testing a small model and trusting the answer at full size, and the claim to be carried is that matching the number is what licenses that.',
    ],

    avoidWhen: [
      'The subject is the critical value itself, or the moment one flow tips from smooth to broken. Nothing here is marked with a crossing point, no scale of the number is drawn, and all three pipes move together.',
      'The article turns on the fluid — honey against water, how sticky a liquid is, or the friction between neighbouring layers. The same fluid runs in all three pipes and only width and speed are ever different.',
      'Values are wanted: a pipe diameter, a speed in metres per second, a viscosity. Only bare numbers for the combination appear, and only while a speed is held.',
      'The point is what happens right against the pipe wall, or how the slowed fluid there grows along the flow. Nothing here is measured from the wall.',
      'The article is about what drives the flow along the pipe, or the pressure lost down its length. Nothing pushes in this picture.',
      'The distance at which a disturbance grows is at stake. The two matching pipes are drawn breaking up at the same fraction of their length, which is a choice made so that their sameness reads, not a claim about where break-up happens.',
    ],

    contrastWith: [
      {
        concept: 'boundary-layer',
        note: 'One asks whether two whole flows count as the same kind of flow; the other asks, within one flow, how far out from a surface the fluid’s stickiness still reaches.',
      },
      {
        concept: 'drag-in-fluid',
        note: 'One holds the body out of it and changes width and speed to ask when two flows match; the other holds speed and thickness fixed and changes the body’s shape to ask what that costs it.',
      },
    ],
  },
};
