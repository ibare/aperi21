/**
 * spherical-aberration 개념 선언.
 *
 * 수차 둘 가운데 **줄기의 높이**가 원인인 쪽이다. 짝과는 「무엇이 자리를 가르느냐」 하나로 갈렸다.
 *   spherical-aberration  들어온 **높이**가 건너는 자리를 정한다 — 색은 하나. 조리개로 좁힌다
 *   chromatic-aberration  들어온 **색**이 모이는 자리를 정한다 — 높이는 상관없다. 테두리 색이 뒤집힌다
 * 이쪽만 가장자리 줄기 · 조리개 · 축을 건너는 자리가 퍼진다 어휘를 갖는다. 파장 · 색 · 테두리는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const sphericalAberrationConcept: Aperi21ConceptSource = {
  id: 'spherical-aberration',
  label: 'Outer Rays Crossing Too Soon',
  canonicalSim: 'aperi21:spherical-aberration',

  surface: {
    definition:
      'The failure of a lens with spherical faces to gather parallel light at one place: the further out a beam enters, the nearer the glass it crosses the axis, spreading the crossings along it.',
    exemplarKeywords: [
      'spherical aberration',
      'why a simple lens does not focus perfectly',
      'edge rays and the paraxial focus',
      'rays far from the axis cross earlier',
      'the paraxial approximation breaks down',
      'stopping down a lens makes it sharper',
      'an aperture blocks the outer rays',
      'a spherical surface is not the ideal shape',
      'longitudinal spread of the focus',
      'why cheap lenses give soft images',
      'the focus is a smear along the axis rather than a point',
    ],
  },

  briefing: {
    observable: [
      'A thick lens, bulging on both faces, stands on an axis with four pairs of parallel beams arriving from the left, one pair at each height above and below the axis.',
      'Each beam is turned once where it enters the glass and once where it leaves, and past the lens the four pairs slope down toward the axis and cross it.',
      'They do not cross at the same place. The pair that came in furthest from the axis crosses closest to the glass, and each pair further in crosses further along, with the crossings drawn as points on the axis.',
      'A measured line below the axis runs from the nearest crossing to the furthest, carrying no number, so the spread has a length that can be watched.',
      'Two plates then come down from above and up from below in front of the lens, and are named as the stop.',
      'As each plate reaches the height of a beam that beam ends at the plate and goes no further, and its crossing disappears from the axis; the measured line shrinks each time.',
      'With only the two inner pairs still getting through, the crossings that remain sit together at the far end, and the measured line is short.',
      'The beams then run off to the right, the plates and the crossings fade, and the next round begins with the stop gone and all four pairs arriving again.',
      'No place on the axis is marked as the one the light was meant to reach — what is drawn is only where each pair actually crosses.',
    ],

    screen: {
      affordances: [
        'The stop closes and opens in a fixed round, holding at each setting, with nothing to press.',
        'Every beam is turned at both faces of the glass by the same rule, so the crossings are worked out from the curvature and the thickness rather than placed by hand.',
        'The beams are drawn in one colour at every height, so which one crossed where is followed along the line rather than read off a key, and the crossings themselves are marked in a different ink because they are notes rather than light.',
        'Blocked beams simply stop at the plate with no arrowhead, which is what a plate in the way looks like.',
        'The measured line carries no number, so the spread is compared with itself before and after the stop rather than quoted.',
        'The lens is drawn with real curvature on both faces, since the curvature is the thing that produces the spread.',
        'The screen opens with all four pairs through and their crossings already spread along the axis.',
      ],
    },

    useWhen: [
      'The article has said that a single lens does not bring parallel light to a point, and the reader’s picture of a lens is still the textbook one where every ray meets at F. Watching four pairs cross at four different places replaces that picture.',
      'The point being made is that stopping a lens down improves sharpness at the cost of light. Here the plates come in and the outer beams — the ones crossing earliest — are the first to be cut, and the remaining crossings close up on one another.',
      'The article is explaining why the usual ray rules are an approximation good only near the axis. The beams nearest the axis are the ones that behave, and the departure grows outward, which is what the approximation was hiding.',
    ],

    avoidWhen: [
      'The light in the article is white, or the defect is that different colours land in different places. There is one kind of light here and the crossings are spread by height alone.',
      'The article wants the paraxial focal length, the size of the longitudinal spread, or any figure for the defect. Nothing numeric is written on screen.',
      'The subject is a picture going soft on a screen or a blurred disc of light. Nothing is projected here; the spread is shown along the axis, not as a patch.',
      'The point is how to cure the defect — by an aspheric surface, by pairing lenses, or by using a mirror instead. Only the plain lens is drawn, with and without the stop.',
      'The article is about an object and the image made of it. Only parallel light arrives, and nothing stands for a thing being imaged.',
      'The subject is how much light an opening admits, or depth of field. The plates here are there to remove beams, and brightness is never in question.',
    ],

    contrastWith: [
      {
        concept: 'chromatic-aberration',
        note: 'Both are ways one lens fails to gather light at a single place; in one the entry height decides where the light crosses, in the other the colour decides, and each is silent about the other’s cause.',
      },
      {
        concept: 'pinhole-camera',
        note: 'Both trade away light at the rim to gain sharpness, but one narrows an opening because a wide one spreads each point into a patch, and the other because a wide one lets in beams that cross too early.',
      },
      {
        concept: 'snells-law',
        note: 'One follows a single beam through one flat face and asks how far it turns; the other applies that same turning at two curved faces to many beams at once and finds that they do not agree on where to meet.',
      },
      {
        concept: 'concave-mirror',
        note: 'One takes it for granted that a curved surface gathers light at a point and asks where the image stands; the other asks whether there is a single point to gather at.',
      },
    ],
  },
};
