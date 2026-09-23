/**
 * rolling-without-slipping 개념 선언.
 *
 * `rolling-race` 와 **묻는 것을 갈랐다.**
 *   rolling-without-slipping  구른다는 **조건 자체** — v = ωR 일 때 접점이 멈춰 있다
 *   rolling-race              그 조건을 **모두 갖춘 여러 모양** 가운데 누가 먼저 닿나
 * 이쪽만 접점 · v = ωR · 사이클로이드 · 끌린 자국 · 구속 어휘를 갖는다. 모양 견줌 ·
 * 도착 순서 · 비탈은 쓰지 않는다. `rotational-kinetic-energy` 와도 다르다 — 저쪽은
 * 구름을 전제로 **에너지**를 묻고, 이쪽은 구름이 **바닥에서 무엇인가**를 묻는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const rollingWithoutSlippingConcept: Aperi21ConceptSource = {
  id: 'rolling-without-slipping',
  label: 'Rolling Without Slipping',
  canonicalSim: 'aperi21:rolling-without-slipping',

  surface: {
    definition:
      'The condition tying a wheel’s turning to its travel, under which the point touching the ground is momentarily at rest because its forward and backward shares cancel.',
    exemplarKeywords: [
      'rolling without slipping',
      'v equals omega R',
      'the contact point is instantaneously at rest',
      'no-slip condition',
      'cycloid path of a point on the rim',
      'why tyres grip instead of skidding',
      'a locked wheel skids and leaves a mark',
      'relating linear speed to angular speed for a wheel',
      'the bottom of a rolling wheel is not moving',
      'constraint between turning and travelling',
    ],
  },

  briefing: {
    observable: [
      'Two wheels of the same size travel at the same speed along two lanes, one above the other, their centres always at the same place across.',
      'The upper wheel turns just fast enough that its turning matches its travel; the lower one turns half that much, and each lane is marked with the condition it satisfies.',
      'Three horizontal arrows sit on the upright diameter of each wheel — at the top, at the centre and at the ground. On the upper wheel the arrow at the ground is replaced by an accent-coloured zero; on the lower one a forward arrow is still there.',
      'A dotted line joining the three arrow tips passes through the contact point on the upper wheel, and meets the ground ahead of the contact on the lower one.',
      'A marked point on each rim leaves a trail behind it. The upper trail comes straight down to the ground, makes a sharp cusp and goes straight back up; the lower one slides through the ground line in a smooth wave.',
      'At the moment the two marked points touch down, the picture is held still and the ground point’s motion is opened out below the floor into two dotted arrows, one forward and one backward.',
      'In the upper lane those two arrows are exactly the same length and cancel; in the lower lane the backward one is short and something is left over.',
      'The lower wheel drags a scuff along its floor all the way from where it started, while the upper lane’s floor stays clean behind it.',
      'Arrows are marked with expressions rather than numbers, so what they say holds whatever speeds the piece is set to.',
    ],

    screen: {
      affordances: [
        'The rolling, the held frame at the touching moment and the rolling on again run in order by themselves, coming round once a full turn is complete.',
        'The lane that satisfies the condition is put on top so it is read first, and the two wheels keep the same position across, so any moment can be compared straight up and down.',
        'The moments just before and just after the touch are slowed to a quarter speed, which gives the cusp time to be seen as a coming-down and a going-back-up rather than a corner.',
        'The held frame lasts about four seconds, long enough to compare the two opened-out arrows by eye.',
        'The accent colour is kept for the ground point alone — its ring and its zero.',
        'The wheels, the velocity arrows, the marked point and the scuff are each given their own colour, so what belongs to which is said without a legend.',
      ],
    },

    useWhen: [
      'The article has written v = ωR and the reader is using it as a conversion without believing anything about it. Watching the ground point’s forward and backward shares come out equal is what the equation is saying.',
      'The claim being made is that the bottom of a rolling wheel is momentarily still, which readers refuse on sight, and a case is wanted alongside a wheel for which it is untrue.',
    ],

    avoidWhen: [
      'Which of several shapes wins a descent, or what shape has to do with rolling at all, is the subject. One size and one kind of wheel is used here, and the lanes differ in how much it turns.',
      'The energy a rolling body carries is the point. Nothing on this screen stands for energy.',
      'The friction force that makes rolling possible, or how big it has to be, is what has to be explained. The only mark of friction here is the scuff left by the lane that fails the condition.',
      'The case is a wheel spinning faster than it travels — a driven wheel breaking loose. The lane that fails here is turning too little, not too much.',
      'Values in metres per second are wanted. The arrows carry expressions, not numbers.',
    ],

    contrastWith: [
      {
        concept: 'rolling-race',
        note: 'One is about the condition itself and what it does to the point in contact; the other takes that condition for granted in every one of its bodies and asks what their shapes do to the order they finish in.',
      },
      {
        concept: 'rotational-kinetic-energy',
        note: 'One asks what rolling means at the ground; the other asks what rolling is worth in energy once it is under way.',
      },
      {
        concept: 'kinetic-friction',
        note: 'One shows a contact that stays put, so nothing is dragged over anything; the other shows a surface being dragged over and what that costs.',
      },
    ],
  },
};
