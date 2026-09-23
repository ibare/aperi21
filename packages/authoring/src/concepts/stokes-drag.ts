/**
 * stokes-drag 개념 선언.
 *
 * 점성 셋 중 **유체 속을 가는 물체** 쪽.
 *   viscosity        층과 층 사이의 힘
 *   poiseuille-flow  관이 내보내는 양
 *   stokes-drag      **작은 구가 가라앉는 빠르기** — 반지름 두 배면 네 배
 * 이미 선언된 저항 둘과도 갈린다.
 *   drag-force        저항의 **꼴** — 속력의 1차 몫과 2차 몫이 갈린다
 *   terminal-velocity 저항이 무게를 **따라잡는** 순간 — 두 힘의 균형
 *   stokes-drag       저항이 **반지름과 속력에만** 비례한다는 것의 지문 — 두 배 → 네 배
 * 이쪽만 「자국 사다리 · 자국 간격 = 속력 · d · 4d · 반지름 비」 어휘를 갖는다.
 * 힘 화살표가 화면에 없다 — 균형은 `terminal-velocity` 의 몫이라 avoidWhen 으로 되돌린다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const stokesDragConcept: Aperi21ConceptSource = {
  id: 'stokes-drag',
  label: 'Settling Speed of a Small Sphere',
  canonicalSim: 'aperi21:stokes-drag',

  surface: {
    definition:
      'The resistance on a small sphere creeping through a thick liquid, rising with its radius and its speed and with nothing else, so that twice the radius settles four times as fast.',
    exemplarKeywords: [
      'Stokes drag',
      'Stokes’ law',
      'six pi eta r v',
      'a ball bearing sinking through glycerine',
      'settling speed of a small sphere',
      'sedimentation of fine particles',
      'why do larger grains settle faster',
      'creeping flow around a sphere',
      'falling-ball viscometer',
      'resistance proportional to radius and to speed',
    ],
  },

  briefing: {
    observable: [
      'Two tall tubes of the same thick liquid stand side by side. A sphere is let go in each from the same height at the same instant; one has twice the radius of the other, and they are marked `r` and `2r`.',
      'Both spheres are drawn in the same colour and at the same shade, so the only difference between them is size.',
      'Every half second a short horizontal mark is left behind at each sphere’s centre, building a ladder down each tube — the spacing between rungs is what the sphere’s speed looks like.',
      'The large sphere’s first gap is shorter than the ones after it, and then the gaps become even: it settles into a steady speed almost at once.',
      'Once both are steady, the large sphere’s rungs are four times as far apart as the small one’s, and the small sphere’s ladder is a close-packed stack near the top of its tube.',
      'The marks are never cleared; every rung from the release onward stays in the picture, because the spacing is the whole of the evidence.',
      'When the large sphere reaches the bottom, an amber dimension is drawn outside each tube measuring how far each sphere has come — `d` at the small tube and `4d` at the large.',
      'Those dimensions stay pinned at that instant while the small sphere goes on sinking past its own mark, rather than being stopped to keep the picture tidy.',
      'The whole of the writing is four symbols; nothing is given in units and there is no graph.',
    ],

    screen: {
      affordances: [
        'One round runs on its own and repeats — the release, the steady sinking, the arrival of the large sphere with the two distances measured, then a fade and a fresh release.',
        'Arriving readers land partway down, with a few rungs already laid.',
        'Nothing is offered to press or drag. A ratio of three would be a stronger test of the square, but the small sphere’s rungs would then be no further apart than a stroke is thick, so one clear ratio was chosen over several unreadable ones.',
        'One colour is spent on one meaning: amber is "how far, in the same time" and nothing else.',
        'The two spheres are released together into the same liquid from the same height, so a reader can hold the first instant against the last without allowing for anything.',
        'The check is a ratio between two lengths — rung spacing against rung spacing, dimension against dimension — which is why no grid, no speed and no scale is drawn.',
      ],
    },

    useWhen: [
      'The article has given a resistance proportional to the radius and to the speed and the reader cannot tell it apart from any other resistance law. Two spheres differing by a factor of two and settling by a factor of four is the fingerprint that particular law leaves.',
      'The reader is being led toward why fine particles stay suspended while coarse ones fall out, and needs the size dependence made sharp before the sorting argument arrives.',
    ],

    avoidWhen: [
      'The motion in the article is fast, or the resistance in question grows with the square of the speed. What is drawn holds only for slow, creeping motion, and the four-to-one ratio would be wrong under the other law.',
      'The claim is how a steady speed comes about at all — resistance building until it matches the weight. No force is drawn in this picture, and the balance is left to the prose.',
      'The subject is the fluid’s thickness itself, or how one fluid compares with another. Both tubes hold the same liquid and it is never changed.',
      'The article turns on shape or streamlining. Both bodies here are spheres and only their size differs.',
      'The point is a body falling through air, or a parachute. The liquid here is thick enough that the spheres are steady almost from the moment they are let go.',
      'Values are wanted — a speed, a viscosity, a density. Only the symbols are written.',
    ],

    contrastWith: [
      {
        concept: 'terminal-velocity',
        note: 'One asks why a body settles at a steady speed at all, which is resistance catching up with weight; the other takes the steadiness for granted and asks what size the settled speed is when the body is made bigger.',
      },
      {
        concept: 'drag-force',
        note: 'One sorts a resistance into a share that grows with speed and a share that grows with speed squared; the other is the regime where only the first share is left, and shows the signature that leaves on how bodies of different size move.',
      },
      {
        concept: 'viscosity',
        note: 'One reads a fluid’s thickness off the force needed to shear it between two plates; the other lets that same thickness act on a body passing through and reads it off how fast the body settles.',
      },
      {
        concept: 'poiseuille-flow',
        note: 'Both are the slow, sticky regime answering in powers of a radius: one for how much a pipe of that radius carries, the other for how fast a sphere of that radius sinks.',
      },
    ],
  },
};
