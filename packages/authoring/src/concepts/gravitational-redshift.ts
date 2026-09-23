/**
 * gravitational-redshift 개념 선언.
 *
 * 중력 넷 중 하나. **무엇으로 재는가**로 갈랐다.
 *   equivalence-principle       가릴 수 없다
 *   gravitational-time-dilation 시계 둘 — 바늘이 앞선다
 *   gravitational-redshift      **빛 한 줄기** — 올라오며 물결이 벌어지고 붉어진다
 *   light-bending-by-gravity    빛의 **경로** — 휘어서 별이 비껴 보인다
 * 이쪽만 「나노미터 · 물결 간격 · 초록에서 빨강 · 퍼텐셜 우물을 올라온다 · 중성자별」 어휘를 갖는다.
 * 시계 · 바늘 · 탑 · 각 · 별의 자리는 쓰지 않는다. 움직이는 광원도 쓰지 않는다 — 여기서는 아무것도 달리지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const gravitationalRedshiftConcept: Aperi21ConceptSource = {
  id: 'gravitational-redshift',
  label: 'Light Stretched Climbing Out of a Gravity Well',
  canonicalSim: 'aperi21:gravitational-redshift',

  surface: {
    definition:
      'Light leaving the surface of a very compact star reaching a distant receiver stretched toward the red, the same waves spread further apart for having climbed out of a deep gravitational well.',
    exemplarKeywords: [
      'gravitational redshift',
      'why does light lose energy escaping a massive body',
      'Pound-Rebka experiment',
      'wavelength stretched on the way out of gravity',
      'light from a neutron star surface arrives redder',
      'a photon climbing out of a potential well',
      'spectral lines from a white dwarf are shifted',
      'redshift that has nothing to do with motion',
      'the same number of waves spread over a greater length',
      'light emitted green and received orange',
    ],
  },

  briefing: {
    observable: [
      'The upper half of the picture is the road the light travels, from the surface of a neutron star at the left to a bar at the right marked as far away; the lower half is a curve of the gravitational well drawn against the very same horizontal positions.',
      'Six waves of green light, five hundred nanometres, come away from the surface as a single packet, with the figure written beneath the star.',
      'As the packet travels the spacing of its waves widens and the colour walks from green through yellow-green, yellow and orange to red, so the stretching is stated twice over, once by spacing and once by colour.',
      'Within a single packet the leading waves are redder and further apart than the trailing ones, since the front of it is already higher out of the well than the back.',
      'A dotted line hangs from the middle of the packet to a dot riding on the well curve below, and that dot climbs the slope as the packet travels — the climbing is given a height to be seen at.',
      'The packet arrives and stops, and six hundred and fifty nanometres is written under the receiving bar.',
      'A copy of the packet as it left — green, its original spacing intact — is then hung just above the received one with their tail ends lined up, and the green copy runs out well short of the red one: the same six waves have been spread over a greater length.',
      'Everything fades and the star emits again; no figure moves on screen, only the two wavelengths at the two ends are ever written, and the well curve carries no scale of its own.',
    ],

    screen: {
      affordances: [
        'The emission, the climb, the arrival and the side-by-side comparison run through in order and start over; nothing has to be pressed.',
        'A star compact enough for the effect to be a real thirty per cent is chosen, so nothing has to be exaggerated and no sentence is needed saying that it has been.',
        'The waves themselves are drawn far larger than they are, but the same enlargement applies at both ends, so the ratio the argument rests on is untouched.',
        'The horizontal scale is squeezed so that the stretching, most of which really happens within a stellar radius of the surface, is spread across the width of the road instead of finishing the instant the light departs.',
        'The light is painted in its own colours rather than in colours chosen to label it, since here the colour is half of the finding; the star, the receiver and the curve are drawn plainly so as not to compete.',
        'The two packets in the comparison are set one above the other and aligned at their tails, because drawing them over each other would leave two different spacings tangled together.',
      ],
    },

    useWhen: [
      'The article has stated that light loses something on the way out of a gravitational well and the reader wants to know what exactly changes about it. The widening spacing and the colour walking toward red are the change, shown on one and the same packet.',
      'The reader is being told that a shift toward the red need not mean anything is moving. Here nothing moves but the light itself, and the shift is as large as a plain change of colour.',
    ],

    avoidWhen: [
      'The shift in question comes from a moving source or a receding galaxy. Nothing here travels but the light, and the star sits still throughout.',
      'The subject is clocks, ticking rates, or two timepieces compared. No clock appears; the whole reading is taken in wavelength.',
      'The article is about light being unable to escape at all, about a horizon or about a black hole. This light gets out; what it loses is colour, not the journey.',
      'The point is the path light takes near a mass, or an image displaced because a ray was bent. The road here is drawn straight and the light stays on it.',
      'The article needs the amount of energy lost, a redshift figure, or a frequency. Two wavelengths are written at the two ends and nothing else is quantified on screen.',
      'The subject is the ordinary spreading of light with distance or its dimming with range. The packet does not weaken here; it only lengthens.',
    ],

    contrastWith: [
      {
        concept: 'gravitational-time-dilation',
        note: 'One reads the effect of depth in gravity off a pair of clock hands brought back together; the other reads the very same effect off the colour of a beam that made the trip instead.',
      },
      {
        concept: 'relativistic-doppler',
        note: 'One reddens light because the thing that made it was in flight; the other reddens it with nothing whatever in motion, by charging the light for the climb out of a well.',
      },
      {
        concept: 'black-hole-horizon',
        note: 'One is light that gets out and is the poorer for having done so; the other is the radius at which the climb can no longer be completed and nothing gets out at all.',
      },
      {
        concept: 'light-bending-by-gravity',
        note: 'One asks what the light becomes on the way and answers with a wavelength; the other asks where the light goes and answers with a path and an angle.',
      },
    ],
  },
};
