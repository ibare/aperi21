/**
 * geostationary-orbit 개념 선언.
 *
 * 위험한 짝은 `keplers-third-law` — 둘 다 주기와 반지름이다. **주어를 갈랐다.**
 *   geostationary-orbit  주어는 **도는 지표의 한 점** — 기지국 하늘에서 위성이 멈춰 서는가
 *   keplers-third-law    주어는 **두 궤도** — 반지름이 커지면 주기가 얼마나 더 길어지는가
 * 이쪽만 기지국 · 머리 위 · 하늘 · 자전 어휘를 갖고, 바퀴 수 · 긴반지름 · 주기의 비는 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const geostationaryOrbitConcept: Aperi21ConceptSource = {
  id: 'geostationary-orbit',
  label: 'Geostationary Orbit — Hanging Over One Spot',
  canonicalSim: 'aperi21:geostationary-orbit',

  surface: {
    definition:
      'At one height alone a satellite takes as long to go round as the planet takes to turn, so from the rotating surface it hangs motionless in the sky.',
    exemplarKeywords: [
      'geostationary orbit',
      'why satellite dishes never move',
      'a satellite parked over one place',
      'geosynchronous altitude 35786 km',
      '42164 km from the centre of the Earth',
      'television and weather satellites that stay put',
      'matching the rotation period of the Earth',
      'a satellite that appears fixed in the sky',
      'why only one height works for this',
      'satellites rising in the west and setting in the east',
    ],
  },

  briefing: {
    observable: [
      'The Earth is seen from above the pole, turning, with lines across it that make the turning visible, and a single ground station drawn as a tower on the surface turning with it.',
      'A dotted line from that tower reaches outward and sweeps round with it, marking the direction that is overhead for the station at each moment.',
      'Three circular orbits are drawn at different heights, one satellite on each, and a line is drawn from the tower to a satellite only while that satellite is actually above the station’s horizon.',
      'The satellite on the middle orbit is always found on the dotted overhead line, and the line joining it to the tower stays upright through the whole run.',
      'The low satellite goes round faster than the ground does, so its line comes up from behind the station, crosses the overhead mark and tilts away forward.',
      'The high satellite goes round more slowly than the ground does, so the station outruns it and its line tilts back.',
      'A second picture shows the sky as the station sees it — a half-circle with the two horizons at its ends and overhead at its top — and each visible satellite appears in it as a point in the direction it is actually seen.',
      'In that sky the middle satellite’s point never leaves the top, while the low one crosses from one horizon to the other and the high one drifts slowly back the other way and sets.',
      'Three turnings of the planet run in sequence, and by the third both of the others have set, leaving the one satellite still joined to the tower by an upright line.',
      'The Earth and the orbits are drawn to one scale, so the height of the middle orbit is seen to be several times the size of the planet, and only one figure is written anywhere — the radius of that orbit.',
    ],

    screen: {
      affordances: [
        'Three days of turning run in order and then repeat; nothing has to be pressed and no height is chosen.',
        'The periods come from the radii rather than being imposed, so the middle satellite standing still is a consequence of where it was put rather than something drawn in.',
        'The overhead line turning with the ground is what makes standing still readable at all — without a mark that rotates, a satellite that keeps station would simply look like another one going round.',
        'The satellites are drawn in three colours carried through their orbits, their lines and their points in the sky, so which is which needs no legend.',
      ],
    },

    useWhen: [
      'The article has said that a dish on a roof is aimed once and never moved again, and the reader needs the orbital reason. Watching the line to the tower stay upright for three turnings while the other two swing past is that reason.',
      'The prose has to establish that this height is unique rather than merely convenient, and a case is wanted where a faster orbit and a slower one are running alongside to fail at it.',
    ],

    avoidWhen: [
      'The point is the general relation between orbit size and period, or the reader has to see how steeply one grows with the other. Only one of the three heights is named here and the other two exist to fail, not to be measured.',
      'The article depends on the orbit lying over the equator, or on inclined and polar orbits. Everything here is drawn in one plane seen from above the pole, with no tilt anywhere.',
      'Day and night, the seasons or the Sun are the subject. No Sun is drawn and nothing is lit.',
      'Getting to such an orbit is the topic — launches, burns, transfer paths. Every satellite here is already on its circle and nothing manoeuvres.',
      'Periods in hours, heights above the surface or signal delays are wanted. One radius is written and nothing else.',
    ],

    contrastWith: [
      {
        concept: 'keplers-third-law',
        note: 'One is the single height that comes out of demanding a particular period; the other is the general rule that period rises steeply with size, of which this height is one solution.',
      },
      {
        concept: 'orbital-transfer',
        note: 'One is about what a satellite already on a chosen orbit does for an observer below; the other is about the pushes it takes to move from one circular orbit to another.',
      },
      {
        concept: 'reference-frame',
        note: 'One is a case where the same motion reads as going round from outside and as standing still from the turning ground; the other is the general business of choosing an observer and asking what each may say.',
      },
      {
        concept: 'uniform-circular-motion',
        note: 'One asks how one circular motion lines up with another turning underneath it; the other stays with a single circle and what steady travel along it does to the velocity.',
      },
    ],
  },
};
