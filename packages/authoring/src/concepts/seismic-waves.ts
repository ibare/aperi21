/**
 * seismic-waves 개념 선언.
 *
 * 경계를 다루는 셋 가운데 하나지만 묻는 것이 다르다.
 *   refraction-of-waves  경계에서 **어느 쪽으로** 꺾이는가
 *   impedance-mismatch   경계에서 **얼마나** 되돌아오는가
 *   seismic-waves        지구 속을 지난 끝에 **어느 지표에 닿지 못하는가**
 * 이쪽만 「P파 · S파 · 액체 외핵 · 그림자대 · 103° · 142°」 어휘를 갖는다. 핵 경계의 꺾임은
 * 수단일 뿐 주장이 아니며, 되돌아오는 몫은 화면에 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const seismicWavesConcept: Aperi21ConceptSource = {
  id: 'seismic-waves',
  label: 'Shadow Zones Left by P and S Waves',
  canonicalSim: 'aperi21:seismic-waves',

  surface: {
    definition:
      'How an earthquake’s two waves cross the Earth: the shear wave cannot enter the liquid core, leaving a wide band unreached, while the pressure wave bends through and skips a narrower one.',
    exemplarKeywords: [
      'seismic waves',
      'P waves and S waves',
      'shadow zone',
      'how we know the outer core is liquid',
      'why are no S waves recorded on the far side',
      'shear waves cannot travel through a liquid',
      'earthquake waves through the Earth’s interior',
      '103 degrees from the epicentre',
      'seismograph stations that record nothing',
      'what earthquakes tell us about the core',
      'push-pull wave and side-to-side wave',
    ],
  },

  briefing: {
    observable: [
      'A circular cross-section of the Earth fills the screen with the focus marked at the very top, and the two halves are given to the two waves: pressure waves on the right, shear waves on the left, as mirror images of one another.',
      'Each half is a fan of rays leaving the focus at evenly spread angles, all drawn in the same ink — the pressure rays solid, the shear rays dotted.',
      'What rides along each ray says which wave it is: on the pressure side, cross-ticks that bunch together and loosen again along the ray; on the shear side, a ripple that swings out to the side of the ray. Names at the top corners read push and pull, and side to side.',
      'The pressure heads run ahead of the shear heads throughout, so one wave is visibly the faster.',
      'When a shear ray reaches the core it stops there and is crossed out; every one of them ends at that boundary.',
      'Pressure rays instead bend where they cross into the core, run through it, and come out on the far side.',
      'Every ray that reaches the surface leaves a dot where it lands, and the dots accumulate round the circumference as the round goes on.',
      'Once all the waves have arrived there are stretches of surface carrying no dots at all, and only then does a bright arc rise over each of them with a name: the shear one running from 103° all the way round, the pressure one only from 103° to 142°.',
      'The empty bands are not drawn by anything — they are simply where no dot ever landed, and the arcs arrive afterwards to name them.',
      'Three angle marks and no more: 103° on both sides and 142° on the right; the ray that grazes the core and fixes 103° is drawn a little thicker than the rest.',
      'The words liquid outer core sit inside the core on the shear side, in the space no shear ray ever enters.',
      'No clock, no travel-time curve and no speed appears; thirty minutes of real spreading is compressed into nine seconds.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; one round runs about fifteen seconds and repeats.',
        'The screen opens with both waves already spreading through the mantle.',
        'Giving each wave its own half of the disc is what keeps thirty rays from tangling; the two fans are mirror images, so nothing is lost by splitting them.',
        'The comparison is between two bands of bare surface, wide against narrow, standing at the same moment on one circle.',
        'The result is held still for several seconds with both arcs named before it fades and the round begins again.',
      ],
    },

    useWhen: [
      'The article has stated that the outer core is liquid and the reader wants to know how anyone could tell. A fan of rays that all stop dead at one boundary, and a band of surface that consequently never receives anything, is the whole argument in the order it was actually made.',
      'The point is that the two shadow zones are different in kind — one wave absent because it was stopped, the other merely skipping a band because it was bent — and having the wide band and the narrow band on one circle is what keeps them from being run together.',
      'The reader needs the two body waves told apart by what they do to the ground rather than by a label, and the bunching ticks against the sideways ripple carry that.',
    ],

    avoidWhen: [
      'The subject is surface waves, shaking at the ground, or damage to buildings. Everything here runs through the interior and the surface only receives arrivals.',
      'The article is about measuring the size of an earthquake, or about where earthquakes happen and why.',
      'The point involves the solid inner core, or a further bending inside it. The core is drawn as one liquid shell and nothing inside it is distinguished.',
      'The article needs travel times, a chart of arrival against distance, or the speeds as numbers. The only figures on the screen are the three angles.',
      'The subject is how much of a wave is sent back where the medium changes. Nothing is drawn returning from the core boundary.',
      'The bending at a boundary is itself the thing being taught. It happens here, but it is small on the screen and serves only to get the pressure wave to the far side.',
    ],

    contrastWith: [
      {
        concept: 'refraction-of-waves',
        note: 'One isolates the bending at a boundary and makes it the whole claim; the other uses bending as a step and judges the result by which parts of a distant surface end up receiving nothing.',
      },
      {
        concept: 'sound-through-materials',
        note: 'Both hang on a wave needing the right medium to get through, one because there are no particles at all and one because a liquid cannot be sheared — and both are judged by what arrives at the far end rather than by how strong it is.',
      },
      {
        concept: 'impedance-mismatch',
        note: 'Both happen where two very different media meet. One counts what comes back from the boundary; the other ignores that entirely and follows only what went on and where it landed.',
      },
    ],
  },
};
