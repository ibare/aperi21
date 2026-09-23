/**
 * focal-length 개념 선언.
 *
 * 형제는 `thin-lens`. 갈림은 묻는 것이다 — 이쪽은 **무엇이 상의 자리를 정하는가**,
 * 저쪽은 **상을 어떻게 찾는가** 다. 이쪽만 초점 거리가 움직이는 양이고, 상이 축을 따라
 * 여행하며, 재는 괄호와 cm 값 어휘를 갖는다. 저쪽만 표준 광선 셋 · 작도 어휘를 갖는다.
 *
 * 이웃 `magnification` 과의 갈림은 **무엇이 움직이는가**다. 그쪽은 물체를 초점 쪽으로
 * 옮겨 상이 멀어지며 커지는 것을 말하고, 이쪽은 **물체를 못박은 채 초점 거리만** 바꾼다.
 * 화면에서 그 전제를 보증하는 것이 길이가 한 번도 바뀌지 않는 물체 거리 괄호다. 그래서
 * 이쪽 어휘에 「물체를 옮긴다」 가 한 번도 나오지 않는다.
 *
 * 화면에 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const focalLengthConcept: Aperi21ConceptSource = {
  id: 'focal-length',
  label: 'Focal Length as What Sets the Place of the Image',
  canonicalSim: 'aperi21:focal-length',

  surface: {
    definition:
      'The distance from a lens to its focus taken as the quantity that places the image: with the object left where it stands, shortening it draws the image in and lengthening it carries the image away.',
    exemplarKeywords: [
      'focal length',
      'what does focal length mean',
      'a short focal length lens against a long one',
      'a strong lens and a weak lens',
      'why does a shorter focal length focus closer',
      'the image moves when you change the lens',
      'focal length sets where the image forms',
      'object distance stays the same but the image moves',
      'image distance for a given focal length',
      'a 50 mm lens and a 200 mm lens',
      'lens power in dioptres',
      'the focal point is closer to the lens',
    ],
  },

  briefing: {
    observable: [
      'A converging lens stands on a horizontal axis. An upright arrow to its left is the object; an inverted arrow to its right is the image.',
      'A dot marked F sits the same distance out on each side of the lens, and a bracket below the axis spans from the lens to the far one, named as the focal length.',
      'Two more brackets stand above the axis: one from the object to the lens, named the object distance, and one from the lens to the image, named the image distance.',
      'Two rays come from the tip of the object — one arriving level and bending through the far F, one going straight through the middle — and they cross at the tip of the image before running on a short way.',
      'At the first resting place a figure below the lower bracket reads twelve centimetres, and the two upper brackets happen to be exactly the same length.',
      'Then the focal length alone changes: both F dots slide in toward the lens, the lower bracket shortens with them, and the image arrow travels in toward the lens as the image-distance bracket shrinks behind it.',
      'Through all of that the object arrow and the object-distance bracket do not move by a pixel — the bracket that never changes length is what makes "the object was left alone" something to look at rather than to take on trust.',
      'The bend of the level ray grows steeper as the focus comes in, so the two rays cross nearer the lens, which is the same fact told a second way.',
      'At the second resting place the figure reads six centimetres: the object-distance bracket is as it was, the image-distance bracket is about a third of its first length, and the image arrow stands small and close to the lens.',
      'The focal length then grows back to where it began, the F dots retreat, and the image travels back out to its first place.',
      'A figure is written only at the two resting places; while the focal length is on the move no number is shown at all.',
      'The lens itself is drawn exactly the same at every focal length — what carries the change is the position of the F marks and the length of the bracket below the axis.',
      'The brackets share one neutral ink because all three measure something; what tells them apart is their names and whether they stand above the axis or below it.',
    ],

    screen: {
      affordances: [
        'The round runs by itself with nothing to press: rest, shrink, rest, grow, and again from the start.',
        'The focal length holds only at its two declared values, and in between it passes through every value continuously while the figure is withheld, so no number on screen is ever a rounded in-between.',
        'The screen opens at the long-focal-length rest, with object, lens, focal marks, image and all three brackets standing and the figure showing.',
        'The framing never changes, so the image coming in toward the lens and going back out is travel across a fixed picture rather than the picture being rescaled around it.',
        'Object and image are drawn in one ink as two showings of one thing; the image is told apart by standing the other way up and by lying on the far side of the lens.',
        'Both the shortening and the lengthening happen within a single round, so the claim is made in both directions without anything being asked of the reader.',
      ],
    },

    useWhen: [
      'The article has given the lens equation and the reader can solve it but has no feel for which of its terms belongs to the lens itself. Here every other quantity is nailed down and the focal length is the only thing that moves, so what depends on it can be read off directly.',
      'The article compares lenses of different strength — a short-focus one against a long-focus one — and needs them set against each other in one unchanged arrangement rather than as two separate pictures whose object distances the reader has to trust are equal.',
      'The reader has been told that a shorter focal length is a stronger lens and pictures strength as something that happens inside the glass. Here the whole of the change shows up outside it, as how far out the focal marks sit and where the image ends up.',
    ],

    avoidWhen: [
      'The moving thing in the article is the object — bringing it toward the focus, what the image does as it comes in. The object is nailed here for the length of the round; only the focal length changes.',
      'The subject is how the image is located in the first place, or the ray construction as a method to be learned. Two rays are drawn and where the image goes is treated as already known.',
      'The article is about how a lens is made to change its own focal length — an eye lens thickening, a second lens laid against the first, a bulge chosen by grinding. The drawing of the lens never changes here; the focal length is carried by the marks and the bracket.',
      'The point is how large the image comes out, or a magnification quoted as a ratio. The image does change size as it travels, but nothing measures that and no ratio is written.',
      'The article is about a virtual image, a magnifier, an object inside the focal length, or a spreading lens. The object stands outside the focus at both focal lengths and the image is always real and on the far side.',
      'Figures for the object distance or the image distance are wanted. Only the focal length is ever written as a number; the two distances are compared as bracket lengths.',
    ],

    contrastWith: [
      {
        concept: 'thin-lens',
        note: 'One takes the locating of the image as settled and asks which property of the lens decides where it lands; the other asks how it is found at all, and answers with three paths settled before anything is drawn.',
      },
      {
        concept: 'magnification',
        note: 'One holds the object still and varies the lens, so what governs the image is a property of the glass; the other holds the lens fixed and carries the object in, so what governs the image is where the thing being looked at stands.',
      },
      {
        concept: 'human-eye-accommodation',
        note: 'One lets the focal length vary and watches the image travel as a result; the other varies it for the opposite purpose, to keep the image from travelling at all when the screen it must land on cannot be moved.',
      },
      {
        concept: 'lens-combination',
        note: 'One treats the focal length as a given of the lens and asks what follows from it; the other asks where the focal length itself comes from when two lenses are laid together.',
      },
      {
        concept: 'converging-diverging-lens',
        note: 'One takes a gathering lens for granted and asks how far out its gathering point sits; the other asks the prior question of which side of the lens that point falls on at all.',
      },
    ],
  },
};
