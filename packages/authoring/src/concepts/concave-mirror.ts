/**
 * concave-mirror 개념 선언.
 *
 * 거울 넷 가운데 하나. 휜 거울 둘이 가장 위험한 짝이라 **무엇이 바뀌고 무엇이 안 바뀌는지로 갈랐다.**
 *   concave-mirror          물체 자리가 상의 **종류를 뒤바꾼다** — 앞 · 거꾸로 ↔ 뒤 · 바로. 초점이 그 문턱
 *   convex-mirror           물체를 어디에 두어도 상이 **한결같다** — 그 한결같음과 넓은 시야가 주장
 *   plane-mirror-image      상이 늘 뒤에 · 늘 같은 크기 — 거리가 주장
 *   multiple-mirror-images  개수가 주장
 * 이쪽만 F 와 C · 초점 안팎 · 실상 ↔ 허상 뒤바뀜 · 거꾸로 섬 어휘를 갖는다. 시야 · 배율의 수 ·
 * 개수는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const concaveMirrorConcept: Aperi21ConceptSource = {
  id: 'concave-mirror',
  label: 'Where a Hollow Mirror’s Image Turns Over',
  canonicalSim: 'aperi21:concave-mirror',

  surface: {
    definition:
      'What a hollow mirror does as an object is brought in: while the object stays outside the focus the image is inverted and out in front, and once inside it stands upright behind the glass.',
    exemplarKeywords: [
      'concave mirror',
      'shaving mirror and makeup mirror',
      'why your face is upside down in a spoon until you bring it close',
      'a real image formed in front of a curved mirror',
      'object beyond the centre of curvature',
      'focal point and centre of curvature of a mirror',
      'the image flips as the object crosses the focus',
      'when does a curved mirror magnify your face',
      'ray diagram for a curved mirror',
      'inside the focus the reflection turns upright',
    ],
  },

  briefing: {
    observable: [
      'An axis runs across the picture. On it stand an arrow for the object, two marked points named C and F, and on the right a mirror curving toward the object, with a band behind it for its back.',
      'From the tip of the arrow two beams grow out to the mirror and away again: one arrives parallel to the axis and leaves through F, the other arrives through F and leaves parallel.',
      'With the object beyond C, the two reflected beams cross between C and F, and where they cross a short arrow appears pointing the other way up, named as a real image.',
      'The object then slides in to a place between C and F. The two reflected beams now cross out beyond C, and the arrow that appears there is again upside down but much longer.',
      'The object slides in once more, inside F. This time the reflected beams open apart and never meet — they run off in front of the mirror with nothing between them.',
      'Dashed lines then extend those two beams backward through the mirror, and behind the glass they cross. A dashed arrow stands there, pointing the same way up as the object and longer than it, named as a virtual image.',
      'Nothing solid reaches that point: on the far side of the mirror there are only the dashed continuations.',
      'While the object is travelling between its resting places the beams and the image are cleared away, and the object slides back out to start the round again.',
      'Across the three resting places the change can be laid side by side — in front and inverted, in front and inverted but larger, then behind and upright.',
    ],

    screen: {
      affordances: [
        'The object holds at three places along the axis and slides between them, over and over, with nothing to press.',
        'Where the image stands is worked out from the mirror rather than drawn in, and the two beams are then drawn to that result — so the beams crossing where the arrow stands is a consequence.',
        'Object and image are drawn in the same ink as two showings of one thing; a solid outline marks the ones the beams really reach and a dashed one the image behind the glass.',
        'The beams and the lines continued backward through the mirror share the colour of light, and the dashed style is what says the continuation is not light.',
        'Two beams are drawn and no more, since a third would crowd the axis without adding a crossing.',
        'C and F are marked on the axis throughout, so each resting place can be read as beyond C, between C and F, or inside F.',
        'The screen opens at the first resting place with both beams drawn and the inverted image already standing.',
      ],
    },

    useWhen: [
      'The article has laid out the cases of a concave mirror as a table to be learned, and the reader has no picture of what makes them different cases. Watching the reflected beams go from crossing in front to opening apart, as the object passes the focus, is the thing the table is a summary of.',
      'The reader has been told that a shaving mirror magnifies close up but turns the world upside down at arm’s length, and takes these as two unrelated facts. Here one journey along the axis produces both.',
      'The article needs the difference between an image the light actually arrives at and one it only appears to come from, and wants it shown rather than defined. Both stand on the same axis here, minutes apart.',
    ],

    avoidWhen: [
      'The mirror in the article bulges outward, or the point is that the image never changes character however the object moves. Everything here turns on it changing.',
      'The subject is how much of the surroundings a mirror can show. Nothing here is about the width of the view; a single object sits on the axis.',
      'The article wants the magnification as a number, or the object and image distances in figures. Nothing is written on screen but the marks C and F and the names of the two images.',
      'The point is about a lens, or about light crossing into glass and bending. Every beam here is thrown back from the surface.',
      'The mirror in the article is flat, or the image is meant to keep the object’s size. The image here is smaller at one resting place and larger at the others.',
      'The claim is that the image moves smoothly as the object does. The object stops at three places, and the beams and image are cleared while it travels.',
    ],

    contrastWith: [
      {
        concept: 'convex-mirror',
        note: 'One has the kind of image change as the object moves, with the focus as the threshold; the other has it never change at all, and that unchangingness is the whole of its claim.',
      },
      {
        concept: 'plane-mirror-image',
        note: 'One has an image that can stand out in front of the glass, upside down, and larger or smaller than the object; the other has one that is always behind, always upright, always the same size.',
      },
      {
        concept: 'pinhole-camera',
        note: 'Both end with an inverted picture at a place the light really arrives; one gets there by bending a wide cone of light back onto itself, the other by admitting only a narrow pencil.',
      },
      {
        concept: 'law-of-reflection',
        note: 'One takes the equal angles for granted and asks what a surface curved inward therefore does to a whole cone of light; the other establishes those angles on one beam off a flat surface.',
      },
    ],
  },
};
