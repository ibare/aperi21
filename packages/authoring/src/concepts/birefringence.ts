/**
 * birefringence 개념 선언.
 *
 * 편광 넷 가운데 **빛이 둘로 늘어나는** 쪽이다. 나머지 셋은 빛을 고르거나 줄인다.
 *   birefringence   주장 = 결정 속에서 한 줄기가 떨림이 서로 직각인 **두 줄기로 갈라져**
 *                   밑의 글자가 두 겹으로 보인다
 *   polarization    판 셋 · 되살아난다        malus-law  판 하나의 각과 세기
 *   brewster-angle  반사광의 떨림 종류
 * 이쪽만 「방해석 · 두 겹 · 정상광과 이상광 · 결정을 돌린다 · 번갈아 사라진다」 어휘를 갖는다.
 * 이미 선언된 `snells-law` 와는 **줄기가 하나냐 둘이냐**로 갈린다.
 *
 * 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const birefringenceConcept: Aperi21ConceptSource = {
  id: 'birefringence',
  label: 'One Beam Becoming Two Inside a Crystal',
  canonicalSim: 'aperi21:birefringence',

  surface: {
    definition:
      'What a crystal such as calcite does to a single beam: it divides into two that travel by different routes and vibrate at right angles to one another, so whatever lies under the crystal is seen doubled.',
    exemplarKeywords: [
      'birefringence',
      'double refraction',
      'calcite doubles the writing underneath it',
      'ordinary and extraordinary ray',
      'two images seen through a crystal',
      'Iceland spar',
      'turning the crystal sends one image around the other',
      'a filter blots out one of the two images',
      'a material with two refractive indices',
      'the two rays vibrate at right angles to each other',
      'why a crystal shows everything twice',
    ],
  },

  briefing: {
    observable: [
      'The left of the screen is a slice through the arrangement seen from the side: a page with a letter on it, a gap, and a crystal block above, with light going upward from the page toward the eye.',
      'Below the crystal there is one beam, and it carries both kinds of vibration mark — a ringed dot for the direction square to the picture and a short stroke across the beam for the direction in it.',
      'At the underside of the crystal that beam divides. One part goes straight up and carries ringed dots only; the other leans off to the side and carries the cross strokes only.',
      'The two leave the top of the crystal side by side, travelling parallel again but no longer in the same place, and each is named — one as the ordinary, the other as the extraordinary.',
      'Two refractive indices are written beside the two paths inside the crystal, one about one point six six and the other about one point four nine.',
      'The right of the screen is the view from above: the crystal face as a rhombus with the letter showing through it twice, partly overlapping, one image from each of the two beams.',
      'The crystal then turns through a full revolution. The one image stays where it is while the other travels around it, tracing a dashed arc behind as it goes.',
      'A filter is then laid over the view from above, drawn as a ring with lines ruled across it in the direction it passes. With the ruling across the line joining the two images, one image disappears and only the other is left.',
      'The ruling turns a quarter turn and the images swap: the one that had gone comes back and the other disappears.',
      'The filter is lifted, both images return, and the round begins again. The separation of the two paths is drawn larger than life, and no distance and no angle is given a figure.',
    ],

    screen: {
      affordances: [
        'The round runs by itself — the splitting, a full turn of the crystal, the filter laid on and turned, then lifted — and repeats, with nothing to press.',
        'The side view is taken along the line joining the two images and stays fixed while the crystal turns, so the separation it shows stays true throughout the revolution.',
        'The gap between the page and the crystal is there so that the one beam can be seen before it divides; in life the crystal would sit on the page.',
        'The two beams are told apart by the shape of their path, by their vibration marks, and by their names, rather than by colour — everything drawn as light here is in one colour.',
        'The ruling on the filter lies along the direction it passes, and it is ruled in the same direction as the cross strokes on the leaning beam, so the two sides of the screen can be read against each other.',
        'The filter is ruled on a ring only, leaving the middle clear, so the images are not lost among the lines when one of them goes.',
        'The travelling image leaves a dashed arc only as far as the crystal has actually turned.',
        'The angle between the two paths is enlarged, since at its true size the two images would sit on top of one another; the written figures are the two refractive indices.',
      ],
    },

    useWhen: [
      'The article has said that a crystal can show two refractive indices at once and the reader cannot picture what that would mean for a beam. One beam dividing at the underside, with two indices written along the two routes, gives it a shape.',
      'The point being made is that the two beams carry perpendicular vibrations — a claim usually asserted. Laying the filter on and watching the images vanish one after the other is the test of it, done on screen.',
      'The reader has seen the doubled writing under a piece of calcite and takes it for a trick of the surfaces. Following the split in the side view up to the two images in the view from above connects the trick to the path.',
      'The article is heading toward crystal optics or polarising devices and needs a beam physically separated by vibration direction rather than filtered down to one.',
    ],

    avoidWhen: [
      'The subject is filters being crossed, stacked or inserted into a beam to control how much light gets through. The filter here is laid on only to tell which image is which.',
      'The article works out how much light survives at a given angle. Nothing here is measured; an image is either there or it is gone.',
      'The subject is how far a beam bends entering a single material, or how the bending depends on that material. Two beams leave one here, and their angle is deliberately drawn larger than it is.',
      'The point is light polarised by reflection, or the angle at which a surface does it. Everything here happens inside a transparent block.',
      'The article needs the splitting angle, the optic axis, the index ellipsoid, or colours between crossed filters. No axis and no angle is drawn, and one colour is used throughout.',
      'The subject is an object under water looking shallower than it is, or an image displaced by a slab. What is doubled here is the image, and its apparent depth is not shown.',
    ],

    contrastWith: [
      {
        concept: 'polarization',
        note: 'One keeps both directions of vibration and sends them along different paths; the other discards all but one direction and asks what is left.',
      },
      {
        concept: 'snells-law',
        note: 'One has a single beam cross a boundary and turn by an amount the material fixes; the other has the same boundary produce two beams at once, because the material offers the two vibrations different indices.',
      },
      {
        concept: 'malus-law',
        note: 'One separates two perpendicular vibrations in space and shows them as two images; the other keeps one vibration and weighs how much of it survives an angle.',
      },
      {
        concept: 'multiple-mirror-images',
        note: 'Both end with more images than objects, for unrelated reasons — one from a beam dividing inside a material, the other from light bouncing repeatedly between surfaces.',
      },
    ],
  },
};
