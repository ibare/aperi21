/**
 * plane-mirror-image 개념 선언.
 *
 * 거울 넷 가운데 하나. **상을 두고 무엇을 묻는지로 갈랐다.**
 *   plane-mirror-image      상의 **자리** — 거울 뒤 같은 거리, 그리고 그쪽으로 건너간 빛은 없다
 *   multiple-mirror-images  상의 **개수** — 거울이 둘일 때. 거리를 재지 않는다
 *   concave-mirror          상의 **종류가 뒤바뀐다** — 실상 ↔ 허상
 *   convex-mirror           상의 종류가 **한결같다** + 담기는 넓이
 *   law-of-reflection       상이 아예 없다 — 각 하나
 * 이쪽만 「거울 뒤 같은 거리」 · 되짚은 점선 · 「건너간 빛이 없다」 어휘를 갖는다. 개수 · 초점 ·
 * 실상은 쓰지 않는다.
 *
 * 주제 설명의 「좌우 반전」 은 화면이 주장으로 삼지 않는다 — 한 단계에서 F 의 가로획 방향으로만
 * 말한다. definition 은 자리 쪽으로 쓰고 뒤집힘은 observable 과 avoidWhen 이 맡는다(간극 장부 참조).
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const planeMirrorImageConcept: Aperi21ConceptSource = {
  id: 'plane-mirror-image',
  label: 'Where a Flat Mirror’s Image Stands, and Why No Light Is There',
  canonicalSim: 'aperi21:plane-mirror-image',

  surface: {
    definition:
      'Where a flat mirror puts a reflection: the light reaching an eye, followed backward, meets at a point as far behind the glass as the object stands in front, though no light ever goes there.',
    exemplarKeywords: [
      'image in a flat mirror',
      'how far behind the mirror is my reflection',
      'virtual image',
      'step back from a mirror and the reflection steps back the same amount',
      'no light actually reaches behind the glass',
      'following the rays back behind a mirror',
      'the reflection looks the same size however far you stand',
      'why a bathroom mirror seems to open a room',
      'object distance and image distance are equal',
      'the reflection appears to be inside the wall',
    ],
  },

  briefing: {
    observable: [
      'A mirror stands upright down the middle. In front of it, on the left, is a filled letter F, and above the F an eye.',
      'Three beams leave one corner of the F, meet the mirror at three different spots, turn there and run into the eye; each carries an arrowhead partway along so the direction is read rather than guessed.',
      'From those same three spots, dashed lines continue on behind the mirror. They are not beams — they carry no arrowheads and they are drawn in ink rather than in the colour of light.',
      'The three dashed lines cross at a single point behind the glass, and an unfilled F stands there with its bars reaching back toward the mirror, where the object’s bars reach away from it.',
      'Two brackets measure across: one from the F to the mirror, one from the mirror to the point where the dashed lines meet. While the picture is still, both read the same — thirty centimetres and thirty centimetres.',
      'The F then slides away from the mirror. The unfilled F backs away on the other side at the same moment and at the same rate, and both brackets lengthen together.',
      'Settled at the far position, both brackets read sixty centimetres, and the dashed fan behind the glass has grown longer while the beams still turn only in front of it.',
      'One stretch of the round changes nothing on screen and says only that no light has crossed behind the mirror — and on that side there is indeed nothing but dashed lines and the unfilled F.',
      'The figures on the brackets are shown only while the F is at rest, and the F slides back toward the mirror to begin the round again.',
    ],

    screen: {
      affordances: [
        'The object slides out, holds, and slides back, over and over, with nothing to press.',
        'The place where the dashed lines cross is worked out from the beams themselves, and the unfilled F and the far bracket are pinned to that crossing — so the two brackets agreeing is a result rather than something drawn in.',
        'Light is drawn one way and the lines followed backward another: the beams are solid, coloured and arrowed, and the traced-back lines are plain dashes, so the picture never suggests light on the far side.',
        'The object and its image are drawn in one colour, as two showings of the same thing, and told apart by one being filled and the other an outline.',
        'The object is an F rather than something symmetrical, so which way its bars reach is visible in the image.',
        'The eye is drawn larger than life, since three beams leaving one corner spread apart and a point-sized eye could not take all three.',
        'The screen opens with the beams, the dashed lines and the image already standing at the near position.',
      ],
    },

    useWhen: [
      'The article has said that a mirror image sits as far behind the glass as the object is in front, and the reader would take it as a rule to be remembered. Watching the crossing point back away in step with the object, with both brackets always equal, is what turns it into something observed.',
      'The point being made is that a virtual image is not a place light gets to, and the reader is likely to picture something waiting behind the glass. Here every beam turns in front of the mirror, and behind it there is nothing but the lines followed backward.',
    ],

    avoidWhen: [
      'The article turns on left and right being swapped, and needs that argued. The bars of the F do reach the other way, but the screen puts its weight on distance and mentions the turn only in passing.',
      'The question is how many reflections appear, or what a second mirror adds. There is one mirror here and one image.',
      'The mirror in the article is curved, or the point is that an image can be caught on a surface. This mirror is flat and the image never leaves the far side of it.',
      'The subject is the angle the light leaves at. No line square to the mirror is drawn and no angle is marked; what is measured here is distance.',
      'The image is supposed to be larger or smaller than the object. The two F shapes are the same size at both positions.',
      'Distances other than thirty and sixty centimetres are wanted, or a reading while the object is sliding. The figures appear only when it has settled.',
    ],

    contrastWith: [
      {
        concept: 'law-of-reflection',
        note: 'One is about where reflected light seems to come from; the other is about the direction it takes, which is the rule the seeming rests on.',
      },
      {
        concept: 'multiple-mirror-images',
        note: 'One asks how far behind a single mirror the one image stands; the other stops measuring and asks how many stand once a second mirror is hinged onto the first.',
      },
      {
        concept: 'concave-mirror',
        note: 'One has an image that is always behind the glass, always the same size, and never anywhere light goes; the other has one that can stand out in front, upside down, where the beams genuinely cross.',
      },
      {
        concept: 'convex-mirror',
        note: 'One puts an eye before a flat mirror to find where one object’s image stands; the other sets a flat and a curved mirror of equal width side by side and compares how much of the surroundings each can show.',
      },
      {
        concept: 'magnification',
        note: 'One fixes an image by a distance alone — as far behind the glass as the object stands in front — and has nothing to compare it against; the other makes the comparison of image to object the whole claim, so moving the object is what decides how much larger or smaller the image comes out.',
      },
    ],
  },
};
