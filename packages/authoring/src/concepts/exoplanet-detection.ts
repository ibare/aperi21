/**
 * exoplanet-detection 개념 선언.
 *
 * 이 묶음에서 유일하게 **관측자가 받는 기록**을 다룬다. 별이 나오지만 별의 성질이
 * 아니라 **보이지 않는 것의 흔적 둘이 같은 주기로 묶인다**가 주장이다.
 * 밝기 넷(거리 · 등급 · 광도)과 갈리는 자리 — 여기서 밝기는 양이 아니라 **되풀이되는 파임**이다.
 * 분광형 · 색과 갈리는 자리 — 여기서 스펙트럼에서 읽는 것은 무늬가 아니라 **선의 자리**다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const exoplanetDetectionConcept: Aperi21ConceptSource = {
  id: 'exoplanet-detection',
  label: 'Finding an Unseen Planet by Two Traces on One Period',
  canonicalSim: 'aperi21:exoplanet-detection',

  surface: {
    definition:
      'Finding an unseen planet from two marks left on its host’s light — a repeated dip of equal depth and a spectral line sliding to and fro on one cycle.',
    exemplarKeywords: [
      'how exoplanets are detected',
      'transit method',
      'radial velocity method',
      'wobble of a star tells you a planet is there',
      'the light curve dips when the planet crosses',
      'Doppler shift of stellar spectral lines',
      'we never see the planet itself',
      'transit depth gives the size of the planet',
      'both signals share the orbital period',
      'Kepler mission light curves',
    ],
  },

  briefing: {
    observable: [
      'At the upper left an orbit is seen nearly edge on, with a dark planet going round a star; on the near half of the loop the planet is drawn over the star and on the far half behind it.',
      'The star does not sit still — it circles a little on the opposite side of the loop from the planet, offset first one way and then the other.',
      'At the lower left a band of the star’s colours carries a single dark line, and that line slides toward the long-wavelength end and back toward the short-wavelength end as the run goes on, with a dashed mark holding its undisturbed place.',
      'What moves is the position of the line, not the colours of the band, and the two ends of the travel are named in words rather than coloured.',
      'At the right two records are stacked on one shared horizontal span of two full loops — brightness above and the line’s position below — each named.',
      'A marked dot sweeps left to right across both records at once, drawing this lap in firmly while the previous lap stays behind it faintly, so neither record is ever blank.',
      'While the planet is crossing the star the brightness record carves out a dip, and the two dips are of identical depth.',
      'On the very same upright line where a dip bottoms out, the lower record is crossing its undisturbed level, going from one end of its travel to the other.',
      'A measuring line of equal length is drawn between the two crossings on each record and both are named with the same letter, so the spacing of the dips and one full swing of the line are shown to be the same interval.',
      'Beside the dip a symbol for the squared radius ratio stands in for its depth, and the radius ratio itself is written out as a plain ratio elsewhere.',
      'The crossing itself is played slower than the rest of the loop so that a brief event can be watched.',
    ],

    screen: {
      affordances: [
        'Two whole loops play through on their own and then repeat; the picture opens with the planet already swinging round toward the front.',
        'The planet is drawn with no light of its own, so on the star it is a silhouette and away from the star only its outline shows — which is the premise that it is never seen.',
        'The star’s sidestep and the line’s travel are both drawn far larger than they would really be, and the true sizes are kept on record in the declaration rather than the picture pretending to them.',
        'The record curves are left in one neutral ink, with neither end tinted, so that a shift is read as a change of place rather than a change of colour.',
        'The second colour marks the present instant on the two records and nothing else.',
        'The brightness record is cropped to the top tenth of its range, because a dip of one part in sixteen would otherwise be a line’s width.',
        'No axis carries units — no wavelengths, no speeds, no times — and the only written quantity is the radius ratio.',
      ],
    },

    useWhen: [
      'The article names the two ways planets are found and the reader treats them as unrelated techniques. Watching a dip bottom out at the instant the line crosses its undisturbed place is what binds them to one object.',
      'The reader doubts that anything can be claimed about a body nobody has seen, and a picture is wanted where all that reaches the observer is a brightness and a line position, and that turns out to be enough.',
    ],

    avoidWhen: [
      'The point is that starlight can be spread into a band of colours at all, or what the dark lines in such a band are. One line is used here purely as a marker to watch move.',
      'The article is about how bright a star is, how that depends on remoteness, or how much light it truly gives off. Brightness here matters only as something that dips and recovers.',
      'The mass of the planet, or how the two methods together yield a density, is required. Nothing here is weighed and no mass appears.',
      'Orbits that are not circular, tilts that make a crossing miss, or how often a system happens to be aligned for us, is at issue. One circular, well-aligned case is shown.',
      'The colour or type of the host star is involved. The star is a plain source of light and nothing about it is varied.',
      'Figures are needed — a period in days, a speed in metres per second, a planet radius. Only a ratio and two letters are written.',
      'Other ways of finding planets, or a real discovery with its data, are the subject. The system shown is built rather than observed.',
    ],

    contrastWith: [
      {
        concept: 'center-of-mass-motion',
        note: 'Both have a large body answering a small one about a shared point; here that small motion is the only evidence available and is read off a shifted line rather than watched directly.',
      },
      {
        concept: 'stellar-spectral-class',
        note: 'Both watch dark features in a band of starlight — one reads which features are present and how deep, the other ignores all that and reads only where one of them has moved to.',
      },
      {
        concept: 'uniform-circular-motion',
        note: 'One is the steady loop itself; the other is what that loop looks like when the only access to it is a pair of records taken from far away.',
      },
    ],
  },
};
