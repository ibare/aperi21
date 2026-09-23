/**
 * thin-lens 개념 선언.
 *
 * 렌즈 셋 가운데 **작도로 상의 자리를 찾는** 쪽이다. 셋은 주어가 다르다.
 *   thin-lens                  점 하나에서 나온 **세 광선**으로 상의 자리를 찾는다 — 값 셋을 독자가 정한다
 *   converging-diverging-lens  **평행광**이 두 렌즈 모양에서 어디로 가는가 — 초점이 뒤냐 앞이냐
 *   magnification              물체를 옮길 때 **상의 크기**가 어떻게 바뀌는가
 * 이쪽만 물체 거리 · 물체 높이 · 초점 거리를 값으로 다루는 어휘를 갖는다. 시간이 흐르지 않고
 * 값을 바꿀 때만 다시 그려지는 것도 이 조각뿐이라 affordances 에 그대로 적는다.
 *
 * canonicalSim 은 topics.yaml 의 `sim` 값 그대로다 (개념 id 와 다르다).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const thinLensConcept: Aperi21ConceptSource = {
  id: 'thin-lens',
  label: 'Locating an Image with the Three Standard Rays',
  canonicalSim: 'aperi21:ray-tracing',

  surface: {
    definition:
      'Finding where a thin lens puts the image of a point object by drawing its three standard rays, with the object’s distance, its height and the focal length all adjustable.',
    exemplarKeywords: [
      'thin lens',
      'ray diagram for a lens',
      'the three principal rays',
      'thin lens equation',
      'one over f equals one over the object distance plus one over the image distance',
      'where does the image form',
      'object distance and image distance',
      'the ray through the centre goes straight on',
      'a ray parallel to the axis leaves through the focal point',
      'a negative focal length stands for a spreading lens',
    ],
  },

  briefing: {
    observable: [
      'An optical element is drawn upright in the middle of the picture: a lens with two curved faces, or a flat mirror with hatching on its back, according to which has been chosen.',
      'A single marked point stands off to one side of it. That point is the object, placed by the two values given for its distance from the element and its height.',
      'Three rays set off from that point with arrowheads on them: one running parallel to the line through the centre of the element, one aimed at the centre itself, and one aimed at the focal point on the near side.',
      'Each ray is carried through the element and drawn onward in the direction it leaves in, so where they end up is the outcome of the element rather than something drawn by hand.',
      'Where the three converge is where the image of that point lies, and in the second of the two pictures a pin is planted there and named as the image.',
      'Raising or lowering the object height swings all three rays together, and the meeting point moves across to the other side of the centre line.',
      'Pulling the object further away brings the meeting point in toward the element; bringing the object closer pushes the meeting point away.',
      'Giving the focal length a negative value turns the element into one that spreads, and the three rays then leave running apart instead of converging.',
      'Nothing moves of its own accord: each picture stands still until one of the three values, or the choice of element, is changed, and then the whole drawing is laid out again.',
    ],

    screen: {
      affordances: [
        'Three numbers can be set: how far the object stands from the element, how high it stands above or below the centre line, and the focal length.',
        'The height runs through zero to negative values, so an object below the line can be put in and the rays followed from there.',
        'The focal length runs through zero to negative values as well, which is how a lens that spreads light is asked for rather than a separate choice being offered.',
        'A row of buttons chooses what the light meets: a lens with bulging faces, a lens with hollowed faces, or a flat mirror.',
        'Another row switches between showing the rays alone and showing them with a pin planted at the image point, so the construction can be looked at before the answer is given.',
        'The element stays where it is and the object is what moves, so every drawing is comparable with the last.',
        'The picture has no clock: it redraws on a change and then holds, which lets one arrangement be studied for as long as is wanted.',
      ],
    },

    useWhen: [
      'The article has taught the ray construction as a recipe and the reader has copied it once on paper. Here the same three rays are redrawn for any distance they care to name, so the recipe can be tried against a dozen arrangements in a minute.',
      'The reader is working with the lens formula and cannot picture what makes the image distance blow up as the object nears the focal length. Winding the distance down toward that value pushes the meeting point off across the picture.',
      'The article treats a spreading lens as a separate rule to learn. Typing a negative focal length here keeps the very same three rays and lets the difference show up as their behaviour rather than as a second recipe.',
    ],

    avoidWhen: [
      'The point is how large the image is compared with the object, or a magnification quoted as a number. The object here is a single point, so it has no size to compare.',
      'The subject is what parallel light does and where the focal point of each lens shape lies. The light here starts from one nearby point, not from far away.',
      'The article is about a curved mirror and how its image changes as the object crosses the focus. The mirror offered here is flat.',
      'The subject is a real lens: its thickness, the colours it fails to bring together, or the blur at its edges. Everything here is drawn for an ideally thin element.',
      'The article needs a picture that plays by itself and makes its point without the reader doing anything. This one stands still until a value is changed.',
      'An upright object with an arrow, a labelled focal point, or a drawn axis is what the article refers to. The picture gives the element, a point and three rays, and marks the image only when asked.',
    ],

    contrastWith: [
      {
        concept: 'converging-diverging-lens',
        note: 'One takes light from a point close by and hunts for where it gathers again; the other takes light arriving parallel and asks only which side of the lens the gathering point falls on.',
      },
      {
        concept: 'magnification',
        note: 'One answers where the image is for a point that has no size; the other gives the object a height and asks by what factor that height is reproduced as the object is moved.',
      },
      {
        concept: 'concave-mirror',
        note: 'Both build an image from rays that obey one element, but one bends them through a lens whose focal length is a number to be set, and the other throws them back from a curved surface.',
      },
      {
        concept: 'plane-mirror-image',
        note: 'Both end by locating an image from where rays meet, though one can put that meeting in front of the element, where light really arrives, while the other always puts it behind, where none does.',
      },
    ],
  },
};
