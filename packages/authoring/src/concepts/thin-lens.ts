/**
 * thin-lens 개념 선언.
 *
 * 이 묶음의 형제는 `focal-length` 다. 둘 다 볼록 렌즈 하나 · 물체 하나 · 실상 하나를
 * 한 광축 위에 늘어놓으므로 definition 이 겹칠 위험이 크다. **묻는 것을 갈랐다.**
 *   thin-lens      상을 **어떻게 찾는가** — 가는 길이 미리 정해진 세 광선이 한 점에서 만난다
 *   focal-length   상의 자리를 **무엇이 정하는가** — 물체를 둔 채 초점 거리를 바꾸면 상이 옮겨간다
 * 이쪽만 작도 · 표준 광선 · 한 점에서 만남 어휘를 갖고, 초점 거리는 고정이라 값으로 다루지
 * 않는다. 저쪽만 초점 거리가 움직이는 양이고 상이 축을 따라 여행한다.
 *
 * 이웃 `magnification` 은 **물체**를 옮겨 상의 크기를 견주므로 셋이 서로 다른 것을 움직인다 —
 * 아무것도(thin-lens) · 초점 거리(focal-length) · 물체(magnification).
 *
 * 옛 선언(`aperi21:ray-tracing`, 스테이지 탭으로 렌즈 · 거울을 오가고 값 셋을 슬라이더로
 * 바꾸던 조각)을 통째로 버리고 새 조각 기준으로 다시 썼다. 그 조각은 지워졌고, 새 화면은
 * 볼록 렌즈 하나 · 조작기 없음 · 광축과 두 초점이 그려진다.
 *
 * 화면에 조작기가 없다. affordances 에 "조작이 없다" 를 적지 않고 **무엇이 저절로
 * 일어나는지**를 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const thinLensConcept: Aperi21ConceptSource = {
  id: 'thin-lens',
  label: 'Locating an Image with the Three Standard Rays',
  canonicalSim: 'aperi21:thin-lens',

  surface: {
    definition:
      'Finding where a converging lens forms the image of an object by drawing the three rays whose paths are settled in advance, which all meet at one point behind the lens.',
    exemplarKeywords: [
      'thin lens',
      'ray diagram for a converging lens',
      'the three principal rays',
      'how do you find where the image forms',
      'ray construction for a lens',
      'a ray parallel to the axis leaves through the far focal point',
      'the ray through the centre of the lens is not bent',
      'a ray through the near focus leaves parallel to the axis',
      'where the rays cross is the image',
      'why is the image upside down',
      'real image behind a convex lens',
      'drawing a lens diagram step by step',
    ],
  },

  briefing: {
    observable: [
      'A converging lens stands upright on a horizontal optical axis. A small dot sits the same distance out on either side of it, the near one marked F and the far one marked F′.',
      'An upright arrow to the left of the lens is the object, named as such, and it stands well outside the near focus.',
      'The rays are drawn one at a time rather than all at once, each growing from the tip of the object with an arrowhead riding at its head so the direction the light travels can be followed.',
      'The first ray runs level with the axis to the lens, bends there, and goes on passing over the far dot F′ — the dot is on screen, so what the bend is aimed at is part of the drawing rather than a rule quoted from outside it.',
      'The second ray enters the middle of the lens and carries straight on without bending, crossing the first one somewhere behind the lens.',
      'The third ray leaves the object tip on a line that passes over the near dot F, reaches the lens, and comes out running level with the axis — and it arrives exactly at the crossing the first two had already made.',
      'A dot is then planted where the three pass together, larger than the two focal dots, and an arrow grows from the axis down to it: the image, standing the opposite way up from the object.',
      'All three rays run on past the image tip and spread apart again, so the meeting reads as a crossing rather than as three lines stopping at a wall.',
      'Object, image and the meeting point are drawn in one ink; the three rays share a single colour between them, since what tells them apart is the place each one passes through.',
      'The drawing is cleared and built again from the empty axis, over and over.',
      'The screen opens with the finished construction already standing — three rays, the meeting point, and the image arrow.',
    ],

    screen: {
      affordances: [
        'The construction lays itself out: the stage first, then one ray, then the second, then the third, then the meeting point, then the image, and a long pause on the completed drawing before it is wound back and begun again.',
        'The caption changes with each ray and names the path that ray is bound to follow, so each line is announced before it is believed.',
        'The rays grow along their length, so a ray that bends at the lens is watched arriving at the lens and then leaving it, rather than appearing whole.',
        'The lens, the two focal dots and the object stand in the same places every round, which makes every round the same drawing and the third ray’s arrival the only thing to wait for.',
        'The focal dots are drawn in a lighter ink than the object and the image, marking them as the framework the construction is built on rather than as its result.',
      ],
    },

    useWhen: [
      'The article has given the ray construction as three rules to be memorised and the reader has never seen the third rule pay off. Here the third ray is drawn last and lands on a crossing the first two already made, which is the whole argument that the construction is not arbitrary.',
      'The article asserts that the image sits where the light actually converges, and needs a picture in which that is a consequence of three independently determined paths rather than a claim. The meeting point is planted only after all three lines are through it.',
      'The reader has to be shown why the image comes out upside down. The arrow grows downward from the axis to a meeting point that lies below it, and no separate rule about inversion has to be introduced.',
    ],

    avoidWhen: [
      'The subject is what moves the image — a different focal length, an object brought nearer or further. Both are fixed here and every round draws the same arrangement.',
      'The point is how big the image is, or magnification as a ratio. Nothing here is measured against anything; the drawing answers where, not how much.',
      'The object in the article is inside the focal length, or the subject is a magnifier, a virtual image, or a spreading lens. The object stands well beyond the near focus and the image forms behind the lens where light really arrives.',
      'The subject is a mirror of any shape. One converging lens is drawn and nothing is reflected.',
      'The article is about a real lens and its failings — thickness, colours that will not gather together, blur toward the rim. Everything is drawn for an ideal thin element and the construction comes out exact.',
      'Figures are wanted — a focal length, an image distance, a number to check against the lens equation. Not one number appears on the screen; the claim is carried entirely by where the lines cross.',
    ],

    contrastWith: [
      {
        concept: 'focal-length',
        note: 'One asks how the image is found at all and answers with three paths settled before anything is drawn; the other takes the finding as done and asks which property of the lens decides where that answer lands.',
      },
      {
        concept: 'magnification',
        note: 'One settles where the image of an arrangement lies; the other keeps the locating as given and reports how the size of the image compares with the object as the object is carried in.',
      },
      {
        concept: 'converging-diverging-lens',
        note: 'One starts from a nearby object and hunts for the place its light gathers again; the other starts from light already parallel and asks only which side of the lens the gathering point falls on.',
      },
      {
        concept: 'concave-mirror',
        note: 'Both locate an image from rays obeying a single element, but one bends them through glass in an arrangement that always yields a real inverted image, while the other throws them back and changes the kind of image as the object crosses the focus.',
      },
      {
        concept: 'real-vs-virtual-image',
        note: 'One shows rays genuinely arriving at the same point and calls that point the image; the other asks how one would tell that case from the one where only the backward continuations meet.',
      },
    ],
  },
};
