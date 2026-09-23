/**
 * converging-diverging-lens 개념 선언.
 *
 * 렌즈 셋 가운데 **평행광과 초점이 어느 쪽에 서는가**만 다루는 쪽이다.
 *   converging-diverging-lens  평행 줄기 → 렌즈 **뒤** 한 점 / 렌즈 **앞** 한 점처럼 — 두 렌즈를 한 화면에 나란히
 *   thin-lens                  가까운 점에서 나온 세 광선으로 상의 자리를 찾는다 (형제)
 *   magnification              상의 크기가 물체 자리에 따라 바뀐다 (형제)
 * 이쪽만 「모으는 / 퍼뜨리는」 · 실초점 ↔ 허초점 · 채운 점 / 빈 점 어휘를 갖는다. 물체 · 상 ·
 * 배율 · 초점 거리의 수는 화면에 없으므로 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const convergingDivergingLensConcept: Aperi21ConceptSource = {
  id: 'converging-diverging-lens',
  label: 'Which Side of Each Lens the Focus Falls On',
  canonicalSim: 'aperi21:converging-diverging-lens',

  surface: {
    definition:
      'Parallel light meeting the two lens shapes: the one thick in the middle brings it to a point behind, while the one thin in the middle spreads it as if from a point in front.',
    exemplarKeywords: [
      'converging lens',
      'diverging lens',
      'convex and concave lens',
      'why a magnifying glass can set paper alight',
      'the principal focus of a lens',
      'real focus and virtual focus',
      'spectacle lenses for short sight and long sight',
      'parallel rays through a lens',
      'the focal point in front of a concave lens',
      'a lens that gathers light and a lens that spreads it',
    ],
  },

  briefing: {
    observable: [
      'Two lenses stand one above the other at the same place across the picture: the upper one bulging in the middle, the lower one waisted in the middle, each named.',
      'Five evenly spaced parallel beams come in from the left toward each lens, identically spaced and identically aimed on both rows, with arrowheads at their fronts.',
      'Past the upper lens every beam turns toward its centre line; past the lower lens every beam turns away from it.',
      'Behind the upper lens the five turned beams all pass through one point on the centre line, where a filled dot appears marked F, and they carry on past it, crossing over.',
      'At the lower lens the spreading beams are then continued backward with dashed lines, drawn forward of the lens, back the way the light came.',
      'Those dashed continuations converge on one point in front of the lower lens, where a hollow dot appears, marked F as well. No solid beam ever reaches that point.',
      'The two marked points sit on opposite sides of the lenses even though the lenses themselves are at the same place, so the whole difference is a side.',
      'The beam along each centre line is not continued backward, since its direction is unchanged and the dashed line would lie on top of it.',
      'The beams then run off to the right, the dashed lines and the marks fade, and the round starts again from the left.',
    ],

    screen: {
      affordances: [
        'The beams arrive, bend, the points are marked and everything clears, over and over, with nothing to press.',
        'The two lenses are stacked rather than swapped in turn, so both marked points are on screen at the same moment and the comparison is a glance rather than a memory.',
        'Where each beam goes is worked out from the lens rather than drawn by hand, and the two marked points are read off the beams, so the dot standing where the beams meet is a consequence.',
        'The light and its backward continuations are drawn in one colour, as one thing, and the dashed style is what says the continuation is not light.',
        'The two points carry the same mark and are told apart by being drawn filled and hollow, since they are the same thing about the lens with only one difference.',
        'Nothing is written as a figure: the focal length is left as a distance on the picture, which the two lenses share.',
        'The screen opens with both rows of beams already through and the point behind the upper lens already marked.',
      ],
    },

    useWhen: [
      'The article has given the two lens shapes as names to be memorised along with what each one does. Here the same parallel light goes into both at once and the behaviours are two halves of one picture rather than two facts.',
      'The reader is being introduced to a focus that light does not actually pass through and treats it as a bookkeeping trick. Watching the solid beams run apart while only the dashed continuations meet makes the distinction visible and keeps it.',
      'The article is about spectacles, or about which lens can gather sunlight to a hot point, and needs the reason rather than the rule. The side the point falls on is the reason and it is the one thing that differs between the rows.',
    ],

    avoidWhen: [
      'The light in the article comes from a nearby object rather than arriving parallel. Every beam here enters level and evenly spaced.',
      'The subject is an image: where it forms, whether it is upright, or how big it is. Nothing stands in front of these lenses and nothing is imaged.',
      'The point turns on the focal length as a number, or on the lens-maker relation between curvature and focal length. No distance is written here and the two lenses share one.',
      'The article is about a curved mirror gathering light by reflection. Every beam here passes through the glass.',
      'The subject is how a real lens departs from the ideal, through thickness, colour, or blur away from the centre. The picture is drawn for ideal thin lenses.',
      'The reader is meant to alter the lens or its strength and watch the point move. The round runs by itself with one arrangement.',
    ],

    contrastWith: [
      {
        concept: 'thin-lens',
        note: 'One asks only which side of a lens parallel light gathers on; the other starts from a point close to the lens and asks where the light from it comes together again.',
      },
      {
        concept: 'magnification',
        note: 'One is about the focus as a place, with nothing being imaged; the other is about size, and uses the focal point only as the mark the object is moved toward.',
      },
      {
        concept: 'concave-mirror',
        note: 'Both gather light to a point on the axis, but one does it by letting light through a shape thick in the middle, and the other by throwing it back off a surface hollowed toward the light.',
      },
      {
        concept: 'convex-mirror',
        note: 'Both spread incoming light so that only its backward continuations meet, one because the glass is thinnest at the middle, the other because the surface bulges toward the light and never lets it in.',
      },
    ],
  },
};
