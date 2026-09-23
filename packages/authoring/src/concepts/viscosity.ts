/**
 * viscosity 개념 선언.
 *
 * 점성이 나오는 셋 중 **유체 자체의 성질** 쪽. 주어로 갈랐다.
 *   viscosity        **층과 층 사이** — 한쪽 경계를 같은 빠르기로 끄는 데 드는 힘
 *   poiseuille-flow  **관이 내보내는 양** — 반지름 4제곱
 *   stokes-drag      **유체 속을 가는 물체** — 반지름 두 배면 네 배 빠르게 가라앉는다
 * 이쪽만 「두 판 · 층 · 계단 · 끄는 힘 F · 4F」 어휘를 갖는다. 관 · 유량 · 가라앉음은 쓰지 않는다.
 * 고체끼리의 마찰(`kinetic-friction`)과도 갈라 둔다 — 여기서 미끄러지는 것은 한 유체의 층들이다.
 *
 * 화면은 두 유체의 계단이 **같다**고 말한다. 주제 시각 메모(「끈적한 유체일수록 층이 느리게
 * 끌린다」)와 벌어지는 자리라 간극 장부에 올렸다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const viscosityConcept: Aperi21ConceptSource = {
  id: 'viscosity',
  label: 'Friction Between Layers of One Fluid',
  canonicalSim: 'aperi21:viscosity',

  surface: {
    definition:
      'A fluid’s own friction between neighbouring layers sliding over one another, weighed by how much force it takes to draw one boundary along at a given speed.',
    exemplarKeywords: [
      'viscosity',
      'thick and runny liquids',
      'honey against water',
      'internal friction in a fluid',
      'why is syrup so hard to stir',
      'shear between layers of fluid',
      'dragging a plate across a film of liquid',
      'flow between two plates, one fixed and one moving',
      'how much force it takes to shear a fluid',
      'what does it mean for a liquid to be thick',
    ],
  },

  briefing: {
    observable: [
      'Two lanes are stacked one above the other. Each is a body of fluid held between a hatched bottom plate that is fixed and a dark top plate that can be drawn along.',
      'The lanes are named: one holds a runny fluid marked with the viscosity symbol, the other a thick fluid marked with four times it. Both fluids are painted the same colour, so the naming is the only thing telling them apart.',
      'Faint lines across each lane divide the fluid into six layers.',
      'At rest, a row of dye segments stands in each lane as one straight upright line, a segment to each layer.',
      'When the top plate is drawn along — ticks on it streaming past show it moving while the plate itself stays in view — each layer’s segment travels by its own amount and the upright line becomes a staircase, farthest at the top and least at the bottom.',
      'The two lanes build the very same staircase at the very same moment, step for step.',
      'An amber arrow appears at the right of each moving plate: one is marked with the force symbol, the other with four times it, and the long one is barred into four lengths of the short one.',
      'Those arrows are drawn only while the plates are being pulled; a plate standing still carries none.',
      'Faint dots drift along each layer at that layer’s own speed and wrap round to come back, so a layer reads as flowing rather than as one segment travelling.',
      'The only figures written are the multipliers in front of the two symbols; nothing is given in units.',
    ],

    screen: {
      affordances: [
        'One round runs on its own and repeats — the plates standing, the pull beginning, the staircases opening out side by side, and a fade into the next round.',
        'Nothing is offered to press or drag. A chip for viscosity would change the staircases not at all, which reads as nothing happening, and a chip for the plate speed would move both lanes together and spoil the comparison.',
        'One colour is spent on one meaning: amber is the pull on the plate and nothing else.',
        'The check is made between two lengths, the two arrows, one of them barred so the ratio can be counted rather than judged by eye.',
        'The layers are drawn as six discrete steps rather than a smooth slope, so that the sliding of layer over layer — the place the friction lives — is something to look at.',
        'The fluid is caught already flowing steadily, so a layer’s speed depends only on its height and not on how long the pull has been going.',
      ],
    },

    useWhen: [
      'The article calls a fluid thick or thin and the reader has only a feel for the words. Two lanes making identical staircases while one needs four times the pull puts the property somewhere definite: in the force, not in the shape of the motion.',
      'The reader is about to read a law in which a stress is proportional to how fast the layers slide past each other, and needs to see what "layers sliding past each other" looks like before the symbols arrive.',
    ],

    avoidWhen: [
      'The subject is flow through a pipe, or how much a pipe delivers. Nothing here is a pipe and nothing is collected at the end.',
      'The article is about a body moving through a fluid and what the fluid does to it. There is no body in this fluid; the only things touching it are the two plates.',
      'The point is that the speed varies smoothly across the channel, or that the profile is a parabola. The profile here is a straight one, cut into six steps for reading.',
      'The article turns on how long a fluid takes to start following a plate that has just begun to move. What is drawn is the motion already settled, and the starting stretch is left out on purpose.',
      'The subject is flow breaking up into eddies, or the point at which smooth flow stops being smooth. These layers slide past each other in order throughout.',
      'Values are wanted in pascal-seconds or newtons. Only the symbols and their multipliers are written.',
    ],

    contrastWith: [
      {
        concept: 'poiseuille-flow',
        note: 'One is the friction between layers taken on its own, as the force a boundary needs; the other is what that same friction adds up to in a round pipe, which is how much the pipe can deliver.',
      },
      {
        concept: 'stokes-drag',
        note: 'One measures a fluid’s thickness by what it takes to shear it; the other lets the same thickness act on a body passing through and reads it off how fast the body settles.',
      },
      {
        concept: 'kinetic-friction',
        note: 'Both are a resistance to sliding, and they differ in what slides: one has two solid surfaces rubbing, the other has a single substance shearing against itself, where the resistance depends on how fast the sliding is.',
      },
      {
        concept: 'laminar-vs-turbulent',
        note: 'One has the layers keeping their order and asks what it costs to make them slide; the other asks when they stop keeping their order at all.',
      },
      {
        concept: 'drag-force',
        note: 'One is a property of the fluid, read off a plate drawn through it; the other is the total resistance a body meets, which grows with the body’s speed by two different laws at once.',
      },
    ],
  },
};
