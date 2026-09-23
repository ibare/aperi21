/**
 * prism 개념 선언.
 *
 * 색 갈라짐 셋 가운데 **두 면이 벌어짐을 키우는 것**을 다루는 쪽이다.
 *   prism       면이 둘이라 벌어짐이 몇 배가 되고 스크린에 띠가 선다 — 두 괄호의 견줌이 주장
 *   dispersion  왜 갈라지는가(굴절률-파장) — 면 하나 · 곡선 (형제)
 *   rainbow     물방울 · 한 각에 몰림 · 하늘의 띠 (형제)
 * 이쪽만 꼭지각 · 첫 면 ↔ 둘째 면 · 스크린의 띠 · 빨강이 위 어휘를 갖는다. 굴절률 값 · 파장(nm) ·
 * 42° 는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const prismConcept: Aperi21ConceptSource = {
  id: 'prism',
  label: 'How the Second Face Widens the Spectrum',
  canonicalSim: 'aperi21:prism',

  surface: {
    definition:
      'What a triangular block adds to colour spreading: the entry face opens the colours a little, the exit face opens them several times further, and a band of colour lands on a screen.',
    exemplarKeywords: [
      'prism',
      'Newton’s experiment with a glass prism',
      'a prism throws a rainbow on the wall',
      'spectrum on a screen',
      'apex angle of a prism',
      'deviation of light through a prism',
      'red is deviated least and violet most',
      'sunlight through the cut edge of a window',
      'two refractions one after the other',
      'splitting white light into a band of colour',
    ],
  },

  briefing: {
    observable: [
      'A triangular block of glass stands point upward on a dark panel, with its apex angle written beside it, and a screen stands off to one side.',
      'A single white beam comes in and meets the first face. Passing it, the white opens into seven coloured beams that cross the inside of the glass in a narrow fan.',
      'A bracket is laid across that narrow fan at the entry point, drawn as an arc with a name beside it saying it belongs after the first face. The arc is short.',
      'The coloured beams then reach the second face and turn again, and this time they open much further, running apart on their way to the screen.',
      'A band of colour builds on the screen, red at the top where the bending was least and violet at the bottom where it was most.',
      'A second bracket is then laid across the beams past the second face, drawn at exactly the same radius as the first so that the two arcs can be set against each other.',
      'The second arc is several times longer than the first, and both are on screen together at the end of the round for that comparison.',
      'A note on the panel says that the difference in index between the colours has been exaggerated, giving the factor, so the width of the fan is not read as life size.',
      'No angle of bending is written anywhere; the two brackets carry the comparison instead, and the only figure on the glass is the apex angle.',
    ],

    screen: {
      affordances: [
        'The beam enters, opens twice and lands on the screen, over and over, with nothing to press.',
        'The two brackets share one radius, which is what makes the length of each arc stand for the angle it covers, so the ratio is read as a length rather than worked out.',
        'The bracket after the first face stays deliberately small, since its smallness is half of what is being claimed.',
        'What has been exaggerated is the index gap between the colours rather than the angles themselves, so both faces still bend exactly as the glass would, and the ratio between the two brackets stays close to the real one.',
        'Each beam is drawn in the colour of its own light, and where the beams still overlap just past the first face, the light adds back toward white.',
        'The names beside the brackets sit on small filled tags so that they stay readable against the dark panel.',
        'The screen opens with the band already on the screen and both brackets drawn.',
      ],
    },

    useWhen: [
      'The article has shown that one surface separates colours only slightly and now has to explain a wide spectrum on a wall. The two brackets are the step between those two facts and they are on screen together.',
      'The reader treats the prism as a device that produces colour. Here the colours are already apart before the second face is reached, and all the second face does is widen the gap it was handed.',
      'The article wants the order of the band accounted for rather than stated. The beam that turned least at both faces is the one that arrives at the top of the band, and the two can be followed from the entry point to the screen.',
    ],

    avoidWhen: [
      'The subject is why the index differs between colours in the first place, or the curve of index against wavelength. That relation is used here and not shown.',
      'The article is about raindrops, about a band standing at a fixed height in the sky, or about light reflected inside a droplet. The glass here is flat-faced and nothing bounces inside it.',
      'The point is that a second prism can put the colours back together into white. Only one block is shown and the colours never recombine.',
      'The article is about a prism used to turn a beam through a corner without any colour, as in binoculars. The claim here is entirely about colours parting.',
      'The subject is a grating, a slit, or colours produced by waves overlapping rather than by bending. Everything here is refraction at two flat faces.',
      'Figures for the deviation of each colour are wanted. The spread has been exaggerated, so nothing but the apex angle is written as a number.',
    ],

    contrastWith: [
      {
        concept: 'dispersion',
        note: 'One shows why the colours differ at all, as a property of the glass; the other assumes that and shows what putting two faces in the light’s way does to the small difference it produces.',
      },
      {
        concept: 'rainbow',
        note: 'Both end with an ordered band of colour, but one gets there by bending twice through a flat-faced block onto a screen, and the other by bending, reflecting and bending inside a sphere and looking at the sky.',
      },
      {
        concept: 'snells-law',
        note: 'One takes a single colourless beam across one boundary and measures the turn; the other applies that same turn twice over, to seven colours at once, and reads the result as a width.',
      },
    ],
  },
};
