/**
 * newtons-rings 개념 선언.
 *
 * 두께가 주어인 둘 가운데 **자리마다의 두께가 고리 간격을 정하는** 쪽이다.
 *   newtons-rings           주장 = 공기층이 바깥으로 갈수록 가파르게 두꺼워져
 *                           **같은 반 파장 계단이 좁은 폭에 몰린다** — 고리가 촘촘해진다
 *   thin-film-interference  주장 = 두께마다 지워지는 파장이 달라 색이 옮겨 간다
 * 이쪽만 「고리 · 동심원 · 간격 · 촘촘해진다 · 곡면과 평판 · 공기층」 어휘를 갖고, 색 · 비눗방울 ·
 * 스펙트럼은 쓰지 않는다 — 화면의 빛은 한 파장(노란빛)이다.
 *
 * 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const newtonsRingsConcept: Aperi21ConceptSource = {
  id: 'newtons-rings',
  label: 'Why the Rings Crowd Together Outward',
  canonicalSim: 'aperi21:newtons-rings',

  surface: {
    definition:
      'Why the dark rings seen where a curved surface rests on flat glass crowd closer together further out: the air gap thickens ever faster from the centre, so equal steps of half a wavelength fall in ever narrower bands.',
    exemplarKeywords: [
      'Newton’s rings',
      'a lens resting on a flat glass plate',
      'concentric dark and bright rings',
      'the rings get closer together the further out you go',
      'the air wedge between a curved surface and a flat one',
      'a dark spot at the centre of the rings',
      'checking a lens surface by the rings it makes',
      'ring radii growing as the square root of the order',
      'rings seen where two glass surfaces almost touch',
      'equal thickness fringes',
      'why the outer rings are so thin',
    ],
  },

  briefing: {
    observable: [
      'The upper half shows the arrangement from the side: a curved surface resting on a flat plate, with the air gap between them named and drawn so thin at the centre that the two almost touch.',
      'The gap is stretched vertically by a large factor so that its shape can be seen at all, and that factor is written above the scale as a stated exaggeration; horizontally nothing is stretched.',
      'A scale runs up the right of the side view with evenly spaced marks, one for every half wavelength of thickness, named from half a wavelength up to three wavelengths.',
      'The lower half shows the same arrangement from above as a half-disc: a dark centre with yellow rings around it, which are visibly thinner and closer together the further out they sit.',
      'The two halves share a horizontal axis, so any place in the side view lies directly above the same place in the ring pattern.',
      'One at a time, a guide runs across from a mark on the scale to the curved surface, then straight down from that meeting point to the edge of the ring pattern, where a marker is placed.',
      'Six such guides accumulate. Their vertical spacing is the same for all six, because they come from equally spaced thickness marks, while their horizontal spacing shrinks steadily.',
      'Every marker lands on a dark ring of the pattern, which is worked out from the thickness rather than drawn to fit.',
      'The guides are drawn on the right half only, the left being its mirror image, and after a pause they fade and the round begins again. Only one colour of light is used, and no radius is given a figure.',
    ],

    screen: {
      affordances: [
        'The round runs by itself, laying one guide at a time and then holding the finished set of six, and repeats, with nothing to press.',
        'Stacking the side view over the view from above, on one shared horizontal axis, is what lets a thickness be carried down to a ring without any measurement in between.',
        'The thickness scale is marked at equal steps of half a wavelength, so the crowding shows up as equal steps up the scale arriving at unequal steps across the pattern.',
        'The rings are painted from a calculation on the gap thickness, so the markers meeting dark rings is a result rather than an arrangement.',
        'One colour is used for light throughout, which keeps the dark rings dark and leaves the spacing as the only thing that changes across the pattern.',
        'The strong colour is spent on one meaning only — the chain from a half-wavelength step to the dark ring it belongs to.',
        'The stretching of the gap is announced on screen as a factor, while the horizontal direction is left true, so the side view and the pattern share one scale across.',
      ],
    },

    useWhen: [
      'The article has given the radii of the rings as growing with the square root of the order and the reader can only take it on faith. The six guides make the uneven spacing something to look at, with equal thickness steps arriving unequally spaced.',
      'The point being made is that the pattern is a map of the gap: each ring is a line of equal thickness. Carrying a thickness mark across to the surface and down to a ring is that map being built.',
      'The reader has seen rings where two pieces of glass nearly touch and has no idea why they should be circles at all, still less unevenly spaced ones. The shape of the gap in the side view supplies both at once.',
    ],

    avoidWhen: [
      'The subject is colour — a bubble, an oil film, or why a film shows bands of different colours. One wavelength of light is used here and the pattern is yellow and dark throughout.',
      'The article needs the reason the centre is dark, in terms of what reflection does to the wave. No rays and no phase marks are drawn; the dark centre is simply there in the pattern.',
      'The article works out ring radii, the curvature of the surface, or the wavelength from a measurement. Nothing carries a figure except the stated stretch of the gap and the thickness marks.',
      'The point is what happens when the curvature or the wavelength changes — rings growing or shrinking. One arrangement is shown, and what varies is only where you look within it.',
      'The subject is a pattern made by openings in a wall, by two sources, or by anything spreading out after an obstacle. The two surfaces here are in contact and the gap between them is what does the work.',
      'The article wants the rings in transmitted light, or the effect of a liquid filling the gap. Air fills the gap here and the pattern is the one seen from above.',
    ],

    contrastWith: [
      {
        concept: 'thin-film-interference',
        note: 'Both have a thickness decide what comes back, and they part on the question — one asks how the places of equal thickness are spaced out, the other asks what colour a given thickness leaves in white light.',
      },
      {
        concept: 'interference',
        note: 'One has the arrangement fixed by the shape of a solid gap, so the quiet places are rings set by geometry; the other has it fixed by two sources, so the quiet places are lines fanning out between them.',
      },
      {
        concept: 'radius-of-curvature',
        note: 'One reads the shape of a curved surface off the pattern that its gap with a flat plate produces; the other treats that same curvature directly as the circle a curve is matching.',
      },
      {
        concept: 'single-slit-diffraction',
        note: 'Both locate dark places and say what sets their spacing, from opposite starting points — one from the thickness of a gap that widens across the picture, the other from the width of one opening.',
      },
    ],
  },
};
