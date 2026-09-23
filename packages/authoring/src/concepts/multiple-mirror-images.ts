/**
 * multiple-mirror-images 개념 선언.
 *
 * 거울 무리 가운데 하나. **상을 두고 무엇을 묻는지로 갈랐다.**
 *   plane-mirror-image      거울 하나 · 상 하나 — **거리**를 잰다
 *   multiple-mirror-images  거울 둘 · 상 여럿 — **개수**를 센다. 거리를 재지 않는다
 *   concave-mirror          상의 종류가 뒤바뀐다
 *   convex-mirror           상이 한결같다 + 담기는 넓이
 * 이쪽만 두 거울 사이 각 · 상의 개수(3 · 5 · 7) · 한 원 위 · 거듭 꺾인 빛 어휘를 갖는다.
 * 허상 · 거리 · 초점은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const multipleMirrorImagesConcept: Aperi21ConceptSource = {
  id: 'multiple-mirror-images',
  label: 'How the Angle Between Two Mirrors Sets the Number of Images',
  canonicalSim: 'aperi21:multiple-mirror-images',

  surface: {
    definition:
      'How many reflections one object shows between two mirrors joined along an edge: closing the angle from ninety through sixty to forty-five raises the count from three to five to seven, all on one circle.',
    exemplarKeywords: [
      'two mirrors at an angle',
      'how many images do two hinged mirrors give',
      'kaleidoscope',
      'mirrors in a fitting room',
      'closing the hinge adds more reflections',
      'three hundred and sixty divided by the angle',
      'reflections arranged around a circle',
      'a reflection of a reflection',
      'hinged mirror experiment with a coin',
      'three images when the mirrors meet square',
      'light bouncing off one mirror and then the other',
    ],
  },

  briefing: {
    observable: [
      'Seen from above, two mirrors meet at a corner and open upward like a V; a filled flag stands on the line that halves the opening between them.',
      'A dashed circle runs around the corner through the flag, and it stays there the whole time.',
      'At a settled angle, unfilled flags appear on that circle, evenly spaced. A wedge at the corner carries the angle, and a line near the circle says how many images there are.',
      'At ninety degrees there are three of them; at sixty, five; at forty-five, seven crowding the circle.',
      'Some of the unfilled flags have their flag part reaching the opposite way from the object’s, and some the same way — the ones that reach the same way are the ones reached by two bounces.',
      'At the widest setting one image is singled out, the one across the corner. An eye appears, and a beam grows from the flag to one mirror, across to the other, and into the eye, with arrowheads along each leg.',
      'Once that beam is complete a dashed line runs from the second mirror back to the singled-out image, while the other images dim so that the traced one stands alone.',
      'The mirrors then close. While they are moving there are no images, no angle and no count on screen — only the narrowing wedge, the circle and the flag.',
      'When they settle again the images reappear, more of them and closer together, and the round eventually opens back to the widest setting.',
    ],

    screen: {
      affordances: [
        'The mirrors close in two steps, hold at each, and open back, over and over, with nothing to press.',
        'The object stays on the line halving the opening, which is what spaces the images evenly around the circle and makes them countable at a glance.',
        'The images are not placed by hand: each is the object carried over by reflecting in one mirror and then the other, which is why they land on the circle and why some have their flag part reaching the other way.',
        'The beam’s path is worked out by bouncing it off each mirror in turn, so the traced line really does arrive at the image it is drawn to.',
        'One path is traced and only one; drawing every path at the narrower settings would pack the corner solid.',
        'The object and its images are drawn in one colour as showings of the same thing, told apart by one being filled and the rest outlines.',
        'The screen opens at the widest setting with the mirrors, the flag and its three images already standing.',
      ],
    },

    useWhen: [
      'The article has given the reader a count that comes out of dividing three hundred and sixty by the angle, and it arrives as arithmetic with nothing behind it. Watching three become five become seven on the same circle as the hinge closes is what puts the count in front of the eye.',
      'The point being made is that some of the reflections are reflections of reflections, and the reader would want to know which. Following one beam across both mirrors, and the dashed line back from it, singles out an image that no single bounce could have made.',
    ],

    avoidWhen: [
      'The question is how far behind the glass a reflection stands, or that it matches the object’s distance. Nothing is measured here; there are no brackets and no distances written.',
      'There is one mirror in the article. Everything here depends on there being two, joined at a corner.',
      'The mirrors in the article are parallel and facing, and the point is a row of reflections running away to nothing. These two meet at a corner and open at a definite angle.',
      'The angle in the article does not divide three hundred and sixty. Only ninety, sixty and forty-five are shown, and the tidy ring of images belongs to angles of that kind.',
      'The mirror is curved, or the point is that a reflection can be larger, smaller or upside down. All the images here are the same size as the object.',
      'The claim rests on the angle a beam leaves at, or on measuring it. No line square to either mirror is drawn and no angle but the hinge’s is marked.',
    ],

    contrastWith: [
      {
        concept: 'plane-mirror-image',
        note: 'One counts reflections and asks what fixes the number; the other measures one reflection and asks what fixes where it stands.',
      },
      {
        concept: 'law-of-reflection',
        note: 'One follows a beam through two bounces to account for an image that neither mirror could make alone; the other stays with a single bounce and names the angle it happens at.',
      },
      {
        concept: 'specular-diffuse-reflection',
        note: 'One has two flat surfaces set at an angle, each keeping light orderly enough to build an image; the other has a single surface whose tilts are irregular, so no image forms at all.',
      },
    ],
  },
};
