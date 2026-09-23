/**
 * brewster-angle 개념 선언.
 *
 * 편광 넷 가운데 **편광판이 없는** 쪽이다 — 빛을 고르는 것이 판이 아니라 **면**이다.
 *   brewster-angle  주장 = 한 입사각에서 반사 줄기에 **한 방향 떨림만 남고**,
 *                   그때 반사 줄기와 굴절 줄기가 직각이다
 *   polarization    판 셋으로 고른다 · 되살아난다
 *   malus-law       판 하나의 각과 세기
 * 이쪽만 「반사 · 눈부심 · 입사각 · 유리면 · 직각을 이룬다」 어휘를 갖고, 판 · 끼운다 · 코사인 제곱은
 * 쓰지 않는다. 이미 선언된 `law-of-reflection`(나간 각 = 들어온 각) · `snells-law`(매질이 꺾는 정도)와는
 * **반사광의 떨림 종류**를 묻는 것으로 갈린다.
 *
 * 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const brewsterAngleConcept: Aperi21ConceptSource = {
  id: 'brewster-angle',
  label: 'The Angle at Which Reflection Leaves One Vibration',
  canonicalSim: 'aperi21:brewster-angle',

  surface: {
    definition:
      'The single angle of arrival at which a surface reflects only one direction of vibration, the part lying in the plane of arrival not being reflected at all, with the reflected and transmitted rays then standing at right angles.',
    exemplarKeywords: [
      'Brewster angle',
      'glare off water and off glass',
      'polarising sunglasses cut the reflection off a road',
      'light fully polarised by reflection',
      'tan of the angle equals the refractive index',
      'about fifty six degrees for glass',
      'the reflected and refracted rays are perpendicular there',
      'a polarising filter on a camera kills a window reflection',
      'why reflected light is partly polarised',
      'reflection off a shop window at a particular angle',
      'the angle where one polarisation vanishes from the reflection',
    ],
  },

  briefing: {
    observable: [
      'A flat glass surface runs across the left of the screen with air above it. A ray arrives from the upper left, part of it bounces away and part carries on into the glass at a shallower angle, with a line square to the surface drawn at the meeting point.',
      'Marks are strung along each ray to show the two directions of vibration: a small ringed dot for the direction square to the picture, and a short double-headed stroke for the direction lying in the picture.',
      'On the arriving ray the two marks alternate and are the same size, so the light comes in with no preference.',
      'On the reflected ray the size of each mark is how much of that vibration is reflected, and the two are plainly unequal from the start.',
      'The arrival angle grows from thirty degrees. On the reflected ray the double-headed stroke shrinks, becomes a short line, and then is not drawn at all, while the ringed dot grows.',
      'At a little over fifty six degrees the reflected ray carries ringed dots only. A strong-coloured right angle opens between the reflected ray and the one going into the glass, labelled ninety degrees.',
      'The transmitted ray keeps both kinds of mark throughout, with the in-picture one slightly the larger at that angle.',
      'The right of the screen plots how much of each vibration is reflected against the arrival angle: a solid curve for the direction square to the picture and a dashed one for the direction in it, each with a point riding along it, filled for the one and hollow for the other.',
      'The hollow point runs down the dashed curve and touches the bottom exactly where a strong-coloured vertical line marks fifty six point three degrees.',
      'The arrival angle then grows on to seventy degrees; the double-headed stroke reappears on the reflected ray, the right angle is gone, and the hollow point has risen off the bottom. The two refractive indices are named beside the surface, and the arrival angle is written only while it is held.',
    ],

    screen: {
      affordances: [
        'The round runs by itself — thirty degrees, a rise to the special angle, a pause there, a rise to seventy — and repeats, with nothing to press.',
        'The two vibration directions are told apart by the shape of their marks, by solid against dashed curves, and by filled against hollow points, so none of it rests on colour.',
        'The strong colour is spent on the special angle alone: the right angle between the two rays and the vertical line where the dashed curve touches bottom.',
        'The two sides of the screen run on one clock, so a mark vanishing from a ray and a point touching the bottom of a curve are the same fact read twice.',
        'The marks on the reflected ray are drawn at a stated enlargement, since the reflected amounts are small; the ratio between the two marks is what they are there to show, and the curves on the right carry the actual amounts.',
        'A mark too small to be meaningful is simply not drawn, so the absence of the in-picture vibration at the special angle reads as absence rather than as a dot.',
        'The angle is written only while it is being held, so every figure on screen is an exact value of a chosen setting.',
        'Brightness is not used for anything here, which leaves the kind of vibration as the only thing the marks can be about.',
      ],
    },

    useWhen: [
      'The article has said that reflected glare is polarised and that sunglasses or a camera filter can cut it. Watching one kind of mark disappear from the reflected ray as the angle rises is what makes that claim mechanical.',
      'The point being made is that the special angle is where the reflected and transmitted rays are perpendicular — a geometric statement the reader is asked to take alongside the algebraic one. The right angle opens at exactly the moment the vibration goes.',
      'The reader needs to see that reflection is partial and unequal in general, not only at one angle. Both marks exist at every other angle, in different sizes, with the curves carrying how much.',
    ],

    avoidWhen: [
      'The subject is filters being turned, stacked or inserted. There is no filter anywhere here; the surface itself does the selecting.',
      'The article needs how much light survives at a given filter angle, or the numbers a half and a quarter. What is plotted here is how much of each vibration a surface reflects at each arrival angle.',
      'The point is how far the transmitted ray is bent, or how the bending depends on the material. The transmitted ray is drawn but its angle carries no figure and no material is varied.',
      'The subject is that the outgoing angle equals the incoming one. That equality holds all the way through here and is never what changes.',
      'The article wants the condition as a formula, the reflected fractions as numbers, or light beyond the special angle where one vibration flips its sign. No formula is written, the vertical scale carries no figures, and the marks cannot show a sign.',
      'The subject is a crystal splitting a beam in two, or a doubled image. One surface and one arriving ray are shown.',
    ],

    contrastWith: [
      {
        concept: 'law-of-reflection',
        note: 'One asks where the reflected ray goes and finds an equality of angles that holds everywhere; the other asks what is left vibrating in it and finds one angle where the answer changes.',
      },
      {
        concept: 'snells-law',
        note: 'Both ask what a boundary does at a chosen angle, of different halves — one follows the part that crosses and how far it turns, the other follows the part that comes back and what remains of its vibration.',
      },
      {
        concept: 'malus-law',
        note: 'Both pair an angle with how much of a vibration survives, with different agents — one turns a filter against light already polarised, the other turns the whole arrangement and lets the surface do the choosing.',
      },
      {
        concept: 'polarization',
        note: 'Both end with light vibrating one way only, reached differently — one gets there by passing light through filters, the other finds it in what a surface has reflected.',
      },
    ],
  },
};
