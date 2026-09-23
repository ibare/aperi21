/**
 * light-bending-by-gravity 개념 선언.
 *
 * 중력 넷 중 하나. **무엇으로 재는가**로 갈랐다.
 *   equivalence-principle       가릴 수 없다
 *   gravitational-time-dilation 시계 둘 — 바늘이 앞선다
 *   gravitational-redshift      빛의 파장 — 올라온 빛이 붉다
 *   light-bending-by-gravity    빛의 **경로** — 휘고, 그래서 별이 **비껴 보인다**
 * 이쪽만 「각초 · 태양 가장자리 · 1919 · 실제 자리와 보이는 자리 · 거슬러 본다」 어휘를 갖는다.
 * 파장 · 색 · 시계 · 상자는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const lightBendingByGravityConcept: Aperi21ConceptSource = {
  id: 'light-bending-by-gravity',
  label: 'Starlight Deflected Past the Edge of the Sun',
  canonicalSim: 'aperi21:light-bending-by-gravity',

  surface: {
    definition:
      'A ray grazing the edge of the Sun turned through a small angle toward it, so that the star it came from is seen shifted outward from the place it actually occupies.',
    exemplarKeywords: [
      'gravitational deflection of light',
      'bending of starlight passing the Sun',
      'the 1919 eclipse expedition',
      'Eddington measured one point seven five arcseconds',
      'how can gravity pull on light that has no mass',
      'a star appears displaced away from the Sun',
      'light follows a curved path near a large mass',
      'tracing the arriving ray straight back gives the wrong place',
      'a ray grazing the solar limb',
      'the test that made general relativity famous',
    ],
  },

  briefing: {
    observable: [
      'A star sits at the left, the Sun in the middle and the Earth at the right; a bright point leaves the star and travels toward the Sun along a straight line, leaving its path drawn behind it.',
      'As the point grazes the edge of the Sun the path curves toward the Sun, most sharply where it passes closest and hardly at all far away, so that it reads as a gradual turning rather than a bounce off a surface.',
      'From the corner where the incoming and outgoing straight portions would have met, a faint dotted line grows alongside the point in the direction it had been going, and it passes above the Earth while the curved path arrives at it — the widening gap between the two is the whole event.',
      'Once the light has reached the Earth, a dashed line is run back out from there in the direction the light came in, straight, past the Sun and away to the left.',
      'A hollow circle appears where that dashed line ends and is named the apparent position, while the filled circle it started from is renamed the true position; an arrow joins them, pointing away from the Sun.',
      'A wedge opens at the corner where the two straight portions meet, with the true angle written beside it in arcseconds.',
      'A line of text stands in the upper left the whole time saying that the angle has been drawn many thousands of times larger than it is.',
      'The true star and the apparent star are drawn in the same colour and are told apart only by one being filled and the other hollow, since they are the same star.',
      'No straight line is ever drawn from the true star to the Earth, and no figures other than the arcsecond value and the enlargement factor appear anywhere.',
    ],

    screen: {
      affordances: [
        'The approach, the bending, the tracing back and the comparison run through in order and start over; nothing has to be pressed.',
        'The angle is drawn enlarged because the true one is far too small to see, and the enlargement is declared on screen while the figure written beside the wedge remains the real one — the picture never passes its own exaggeration off as a measurement.',
        'The line from the true star to the Earth is deliberately left undrawn: the enlargement would send it through the Sun, and drawing it would have the picture assert something false, that the star had been hidden behind the Sun.',
        'The apparent star is held back until the dashed line has actually reached the place it belongs, so that the conclusion does not appear before the reasoning that produces it.',
        'The bending is spread smoothly along the passage rather than concentrated at a point, since a single kink would read as light striking a surface and being refracted.',
        'One colour is kept for the light and its path alone, and the tracing back, the wedge and the displacement arrow share a second, so that what the light did and what the observer infers stay separate.',
      ],
    },

    useWhen: [
      'The article has said that gravity acts on light and the reader wants to know what was actually observed. The two steps here — the ray turns, and therefore the star is seen in the wrong place — are exactly the chain the eclipse measurement ran along.',
      'The reader needs to see why a bent path shows up as a displaced image: the observer has only the direction the light arrived from, and running that direction straight back is what puts the star somewhere it is not.',
    ],

    avoidWhen: [
      'The subject is the colour or wavelength of light affected by gravity. The light here is drawn as a single bright point and nothing about its colour is at issue.',
      'The article is about a lens producing rings, arcs or multiple images of one source, with several paths converging on one observer. Only one ray is followed here, and only one apparent position results.',
      'The point is an eclipse itself, or why stars can be photographed in daylight. No Moon is drawn and nothing covers the Sun.',
      'The article turns on light being captured rather than turned — a horizon, a trapped ray, a black hole. This ray passes and carries on to the Earth.',
      'The reader is to take measurements off the picture. The angle shown is enlarged by a large factor that the picture itself announces, and no distance or scale is given.',
    ],

    contrastWith: [
      {
        concept: 'gravitational-redshift',
        note: 'One asks where a ray goes near a mass and answers with a path and an angle; the other asks what a ray becomes and answers with a wavelength.',
      },
      {
        concept: 'equivalence-principle',
        note: 'One is the premise that a sealed box cannot tell gravity from acceleration; the other is a thing that premise obliges, since a ray crossing an accelerating box lands low and must therefore do the same in gravity.',
      },
      {
        concept: 'apparent-depth',
        note: 'Both end with something seen where it is not, because the eye runs the arriving ray straight back; in one the ray is turned at a boundary between two materials, in the other by a mass with nothing in the way at all.',
      },
      {
        concept: 'gravitational-field',
        note: 'One assigns a pull at every place around a mass, meant for bodies set down in it; the other is the case of something with no weight to be pulled, which is turned all the same.',
      },
    ],
  },
};
