/**
 * magnification 개념 선언.
 *
 * 렌즈 셋 가운데 **크기의 견줌**을 다루는 쪽이다.
 *   magnification              물체를 초점 쪽으로 옮기면 상이 멀어지며 커진다 — ×0.5 → ×1 → ×2
 *   thin-lens                  점 하나의 상이 **어디에** 맺히는가 (형제, 크기가 없다)
 *   converging-diverging-lens  평행광 · 초점이 **어느 쪽**인가 (형제, 물체가 없다)
 * 이쪽만 물체 거리 ↔ 상 거리 괄호 · 배 수 · 거꾸로 선 상 어휘를 갖는다. 초점 안쪽(허상) ·
 * 돋보기는 화면에 없으므로 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const magnificationConcept: Aperi21ConceptSource = {
  id: 'magnification',
  label: 'How the Image Grows as the Object Nears the Focus',
  canonicalSim: 'aperi21:magnification',

  surface: {
    definition:
      'The size of an image set against the size of the object: as the object is brought toward the focal point of a gathering lens, the image retreats further and grows from half size to double.',
    exemplarKeywords: [
      'magnification',
      'how many times bigger is the image',
      'image height over object height',
      'moving an object nearer the lens',
      'magnification is the image distance over the object distance',
      'why the picture gets bigger as you approach the focus',
      'a projector and how far back the screen goes',
      'image distance grows as object distance shrinks',
      'an image twice the size of the object',
      'an inverted image that changes size as you move',
    ],
  },

  briefing: {
    observable: [
      'A gathering lens stands on a horizontal line. An arrow on the left is the object; an arrow on the right, pointing the opposite way up, is the image. A marked point on each side of the lens carries the mark F.',
      'Two rays run from the tip of the object: one goes in level and leaves through the F behind the lens, the other goes straight through the middle of the lens without turning. They cross at the tip of the image and run on a little further.',
      'Above the line two brackets are drawn: one spanning from the object to the lens, named as the object distance, and one spanning from the lens to the image, named as the image distance.',
      'At the first resting place the object is well out from the lens, the image-distance bracket is the shorter of the two, and the image arrow is the smaller of the two arrows.',
      'The object then slides in toward the lens. While it travels, the image slides away from the lens on the other side and grows without a break, and the two rays follow it.',
      'At the middle resting place the two brackets are exactly the same length and the two arrows are the same height.',
      'The object slides in once more, closer to the marked focal point, and now the image-distance bracket is much the longer and the image arrow stands twice as tall as the object.',
      'A pair of brackets standing off each end compare the heights themselves, so half, equal and double can be read as lengths rather than believed.',
      'At each resting place a figure appears below the tip of the image reading how many times the object’s size it is; while the object is sliding, that figure is taken away and no in-between value is shown.',
      'The object then goes back out to where it started and the round begins again.',
    ],

    screen: {
      affordances: [
        'The object holds at three places, slides between them and returns, over and over, with nothing to press.',
        'The object never crosses the marked focal point; the nearest resting place stops short of it, so the round stays within the arrangement the picture is about.',
        'Where the image stands is worked out from the lens, and the two rays are then drawn to that result, so the rays crossing at the tip of the arrow is a consequence.',
        'Two rays are drawn and no more, which is the fewest that fix the tip of the image and still let it be followed as it moves.',
        'The four brackets are the whole of the measuring: distances above the line, heights off the ends, and each pair is compared with itself rather than converted into units.',
        'The only figures are the three size ratios, and they are shown only at rest, since a ratio read off a picture still moving would be a number nobody could check.',
        'Object and image are drawn in one ink as two showings of one thing; the image is told apart by standing the other way up and on the far side of the lens.',
        'The screen opens at the far resting place with the object, the image, the rays and the brackets all standing.',
      ],
    },

    useWhen: [
      'The article has given magnification as a ratio of two distances and the reader can compute it without any sense of what it tracks. The two distance brackets and the two height brackets change together here, so the ratio is watched rather than evaluated.',
      'The reader is told that approaching the focus enlarges the image and pictures the image simply swelling in place. Here it also has to travel a long way off, and the two go together at every instant of the slide.',
      'The article is about projecting: a slide, a film, a screen pushed further back to fill it. Here the trade between how far the image sits and how big it comes out is the motion the picture is made of.',
    ],

    avoidWhen: [
      'The object in the article is inside the focal length, or the subject is a magnifier held close to reading matter. The object here always stays beyond the focal point and the image is always on the far side.',
      'The point is the distinction between an image light really reaches and one it only seems to come from. Only the first kind is shown here.',
      'The subject is finding where the image forms for a given arrangement, or the ray construction itself as a method. That is taken as done here and the picture is about size.',
      'The article is about what parallel light does, or about the difference between a gathering and a spreading lens. One gathering lens is used and it never changes.',
      'The subject is a curved mirror, a two-lens instrument such as a telescope or microscope, or the angular size something subtends at the eye. One lens and one object are shown.',
      'Figures for the distances or the heights are wanted. Only the three size ratios are written, and only while the picture is at rest.',
    ],

    contrastWith: [
      {
        concept: 'thin-lens',
        note: 'One tracks how big the image comes out as the object is moved; the other locates the image of a point, which has no size for a ratio to be taken of.',
      },
      {
        concept: 'converging-diverging-lens',
        note: 'One uses the focal point only as the mark an object is carried toward, and its claim is about size; the other has no object at all and its claim is about which side of the lens the focal point itself lies.',
      },
      {
        concept: 'concave-mirror',
        note: 'Both enlarge as the object approaches the focus, but one keeps the object outside it throughout and stays with a single steadily growing image, while the other crosses the focus and has the kind of image change.',
      },
      {
        concept: 'pinhole-camera',
        note: 'Both put an inverted picture where the light really arrives, and in both its size follows from two distances; one gets there by bending a whole cone of light, the other by admitting a narrow pencil of it.',
      },
    ],
  },
};
