/**
 * equipotential-surface 개념 선언.
 *
 * 전위 둘 가운데 이쪽은 **두 곡선족이 만나는 각**이 주장이다 — 평면, 수 없음, 「늘」.
 *   equipotential-surface   같은 값 선과 가장 가파른 내리막이 **직각**으로 만난다 (배치를 바꿔도)
 *   potential-vs-field      한 축 위에서 곡선의 **가파름 = 화살표 길이**, 방향은 내려가는 쪽
 * 이쪽만 「지형 · 지도 · 등고선 고리 · 직각 표시 · 원천을 옮겨 본다」 어휘를 갖는다.
 * 「면을 따라가면 일이 들지 않는다」 는 화면이 재거나 세지 않으므로 avoidWhen 으로 되돌리고
 * conservative-force 로 이었다 (간극 장부).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const equipotentialSurfaceConcept: Aperi21ConceptSource = {
  id: 'equipotential-surface',
  label: 'Lines of Equal Potential and the Right Angle They Are Crossed At',
  canonicalSim: 'aperi21:equipotential-surface',

  surface: {
    definition:
      'That the curves joining places of equal potential are met at a right angle by whatever runs down the steepest slope of that potential, and that this holds for any arrangement of the sources rather than only for tidy ones.',
    exemplarKeywords: [
      'equipotential surfaces',
      'equipotential lines',
      'why is the field perpendicular to the equipotentials',
      'contour lines of electric potential',
      'potential hill and potential well',
      'steepest descent down a potential landscape',
      'contour map around a positive and a negative charge',
      'field lines meet equipotentials at right angles',
      'drawing equipotentials for two charges',
      'potential drawn as a height',
    ],
  },

  briefing: {
    observable: [
      'On the left the potential is drawn as a landscape seen at a slant: a peak rises at one source and a hollow sinks at the other, shaded so that slopes facing one way are lighter than slopes facing the other, with the far side of a ridge hidden behind its near side.',
      'Closed rings are drawn on that landscape at a set of evenly spaced heights, and they break wherever the surface in front hides them.',
      'On the right the same potential is seen from directly above as a field of light and dark, brightest where the potential is highest, with the same set of rings drawn on it as closed curves.',
      'Small circles carrying a plus and a minus sit at the source places on both pictures, the two sources being of different sizes and not placed symmetrically.',
      'Six test charges are carried out from a ring around the positive source, each starting at a different moment, and each is moved along the electric field line through its start — the steepest slope available to it.',
      'On the landscape each shows as a dot with a trail that follows the surface and disappears where the surface hides it; on the map each leaves a trail as well.',
      'Wherever a trail crosses one of the rings on the map, a small square corner is left at that crossing, and these accumulate all the way along the trail.',
      'A trail ends where its charge reaches the negative source or runs off the edge of the picture — the positive source is twice as strong, so not every line can end on the negative one — fades after a pause, and another sets off, so that at any moment some are starting and some are arriving.',
      'Either source circle on the map can be taken hold of and dragged; the landscape, the rings and all six trails are rebuilt while it moves, and the square corners go on appearing along the quite different trails that result.',
      'A source dragged too close to the other one simply does not move.',
      'Nothing on either picture bears a number: no potential value, no ring value, no unit, and a single fixed line of text beneath them.',
    ],

    screen: {
      affordances: [
        'Both source charges can be taken hold of on the map and moved, and everything derived from them is rebuilt while the hand is still moving.',
        'The two sources are given unequal sizes and an off-centre arrangement, so the pattern cannot be taken for a special symmetric case.',
        'The same set of heights is used for the rings on both pictures, so a ring on the map is the very same ring as one on the landscape.',
        'The accent colour is kept for the charges that are moving — their dots and their trails — and for nothing else.',
        'The six run on staggered clocks, each lasting as long as its own path takes, so the screen is never empty and never all at one stage.',
        'A charge that comes within a short distance of the negative source is taken to have arrived, so the trails end rather than crowd into the singular point.',
        'The height is compressed by a smooth squashing before being drawn, which leaves the rings and the downhill directions exactly where they were.',
      ],
    },

    useWhen: [
      'The article has asserted that the field is everywhere perpendicular to the equipotentials, and the reader accepts it for the tidy circles around a lone charge but not for a crooked two-source pattern. Being able to move a source and watch square corners keep appearing along a completely different trail is what turns the assertion into "always".',
      'The prose needs the potential pictured as a landscape before a contour map of it can mean anything. The same arrangement stands as height on one side and as light and dark on the other, with one set of rings shared between them.',
    ],

    avoidWhen: [
      'The point is that no work is needed to move along an equipotential, or that work is what the potential difference measures. Nothing here is weighed, counted or added up; only the angle of crossing is shown.',
      'The subject is a single point charge and its circular equipotentials. This arrangement has a peak and a hollow, and its rings are nowhere circular.',
      'Potential values, voltages, or the spacing of the rings read as a measure of strength are wanted. Nothing bears a number, and the heights are squashed before drawing.',
      'The article works along a single line and wants a strength read off as a slope. What is drawn here is a two-dimensional pattern with no axis to read a slope against.',
      'The subject is conductors and the fact that their surfaces are equipotentials. Only two point-like sources appear here; there is no conductor.',
      'Field lines themselves are wanted, drawn as a family from one source to the other. Only six paths are drawn, each following the steepest slope from the positive source, and each stops where it arrives. They are field lines followed at an even pace, not the paths a released charge with inertia would take — such a charge would swing wide of a curving line.',
    ],

    contrastWith: [
      {
        concept: 'potential-vs-field',
        note: 'One is about the angle at which two families of curves meet across a plane; the other is about a size — how steep set against how strong — at places along a single line.',
      },
      {
        concept: 'conservative-force',
        note: 'One shows only that the descent meets the level curves squarely; the other is about the bookkeeping that closes whatever route is taken, which is what makes level curves worth drawing in the first place.',
      },
      {
        concept: 'field-lines',
        note: 'One brings in a second family of curves that the field must meet at a right angle; the other draws the field’s own curves alone and rests everything on how closely they crowd.',
      },
      {
        concept: 'potential-energy-curve',
        note: 'One spreads the potential over a plane, which is what lets a level curve exist at all; the other keeps it over one coordinate, where there is nothing for a path to cross.',
      },
      {
        concept: 'electric-field',
        note: 'One never draws an arrow anywhere and lets a path of steepest descent stand for the direction; the other gives every place its own arrow and moves nothing.',
      },
    ],
  },
};
