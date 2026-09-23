/**
 * convex-mirror 개념 선언.
 *
 * 거울 넷 가운데 하나. 휜 거울 둘의 갈림이 이 묶음에서 가장 조심스러운 자리다.
 *   concave-mirror  물체 자리가 상의 **종류를 뒤바꾼다** — 초점이 문턱
 *   convex-mirror   물체를 어디에 두어도 상이 **한결같다**(작고 · 바로 서고 · F 안쪽).
 *                   그 대신 얻는 것 — 같은 폭의 평면거울보다 **훨씬 넓은 곳**이 한 거울에 담긴다
 * 이쪽만 「어디 있어도」 · 작고 바로 선 상 · 시야의 넓이 · 두 거울 견줌 어휘를 갖는다.
 * 실상 · 뒤집힘 · C · 초점 안팎은 쓰지 않는다 — 이 화면에는 그 뒤바뀜이 없다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const convexMirrorConcept: Aperi21ConceptSource = {
  id: 'convex-mirror',
  label: 'A Small Upright Image Bought with a Wider View',
  canonicalSim: 'aperi21:convex-mirror',

  surface: {
    definition:
      'What a mirror bulging outward gives and what it costs: an image that stays small, upright and tucked just behind the surface wherever the object goes, in return for taking in far more of the surroundings.',
    exemplarKeywords: [
      'convex mirror',
      'why a car wing mirror is curved',
      'objects in the mirror are closer than they appear',
      'security mirror in a shop corner',
      'wide field of view mirror',
      'a reflection that stays small and the right way up',
      'the back of a shiny spoon',
      'blind spot mirror on a van',
      'a mirror that shows the whole aisle',
      'bulging mirror at a road junction',
      'a wider view at the price of a smaller reflection',
    ],
  },

  briefing: {
    observable: [
      'First an axis, with an arrow for the object on the left and a mirror on the right that bulges away from it; a single marked point named F sits behind the glass.',
      'Two beams grow from the tip of the arrow to the mirror and leave it spreading apart: one arrives parallel to the axis and leaves as though it had come from F, the other arrives aimed at F and leaves parallel.',
      'The two reflected beams never meet. Dashed lines continue them backward through the mirror and cross at a point nearer the glass than F, where a small dashed arrow stands the same way up as the object, named as a virtual image.',
      'The object then slides steadily toward the mirror, and the beams, the dashed lines and the image are redrawn all the way. The image grows a little and comes forward a little, but never gets past F and never turns over.',
      'Right up against the mirror the image is still shorter than the object and still upright.',
      'The picture then changes: two mirrors of equal width stand side by side facing downward, one flat and one bulging, with an eye below each.',
      'At each mirror two beams are drawn coming in from outside, bouncing off the two ends of that mirror, and entering the eye.',
      'The space between those two incoming legs — what the eye can see by way of that mirror — is then shaded in. At the flat mirror it is a narrow wedge; at the bulging one it opens out almost sideways, several times as wide.',
      'The pair fades and the first part begins again.',
    ],

    screen: {
      affordances: [
        'The object travels the whole way in one continuous slide rather than stopping at set places, so the constancy of the image can be watched throughout.',
        'Both parts run in turn and then repeat, with nothing to press.',
        'Where the image stands is worked out from the mirror and the beams are drawn to that result, so the dashed lines meeting just inside F is an outcome rather than a drawing choice.',
        'In the second part the two mirrors are given the same width and the same eye distance, leaving the shape of the surface as the one thing that differs.',
        'The two shaded wedges are drawn in the colour of light and reach the same distance from each mirror, so their opening can be compared directly.',
        'Object and image share one ink as two showings of one thing, and the dashed outline marks the one no light reaches.',
        'The screen opens with the object at its far position, its beams drawn and the small upright image already standing.',
      ],
    },

    useWhen: [
      'The article has said that a convex mirror always gives a small upright image, and the reader would want to know how that can hold for every distance. Here the object crosses the whole range without a break and the image never leaves its small upright corner behind the glass.',
      'The point being made is the bargain — that the wide view on a wing mirror or a shop mirror is paid for in how small everything looks. The two parts put the price and the purchase in one screen.',
      'The reader is being told why a driver’s mirror carries a warning about distance, and the article wants the optical reason rather than the regulation.',
    ],

    avoidWhen: [
      'The mirror in the article curves inward, or the point is that the image flips at some position. Nothing flips here; that absence is what the screen is for.',
      'The article needs a real image, one that light actually reaches or that could be caught on a surface. Every image here is behind the glass and reached only by lines followed backward.',
      'The claim is that the reflection matches the object in size, as it would in a flat mirror. The image here is smaller at every position.',
      'The magnification, the focal length, the field of view in degrees, or any distance is wanted as a number. Only the mark F and the names appear in writing.',
      'The subject is a lens or light bending as it enters a material. Every beam here is thrown back from a surface.',
      'The point is how many reflections appear, or what a second mirror adds. The two mirrors in the second part are compared, not combined.',
    ],

    contrastWith: [
      {
        concept: 'concave-mirror',
        note: 'One is about an image that keeps its character however the object moves; the other is about one whose character turns over as the object crosses the focus.',
      },
      {
        concept: 'plane-mirror-image',
        note: 'One sets a curved mirror against a flat one of the same width and asks how much of the surroundings each can show; the other stays with the flat case and asks where a single object’s reflection stands in it.',
      },
      {
        concept: 'law-of-reflection',
        note: 'One takes the equal angles as settled and asks what follows when the line square to the surface swings from one end of a mirror to the other; the other holds the surface flat, where that line is the same everywhere.',
      },
      {
        concept: 'real-vs-virtual-image',
        note: 'One reports an image that stays on the far side of the surface wherever the object is put, so its kind never turns over and the claim can be made without testing it; the other makes that kind the question itself and settles it by whether light has truly gathered at the place.',
      },
    ],
  },
};
