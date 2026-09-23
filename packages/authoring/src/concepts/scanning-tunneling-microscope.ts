/**
 * scanning-tunneling-microscope 개념 선언.
 *
 * 꿰뚫기 둘 가운데 **도구** 쪽이다.
 *   quantum-tunneling              벽 너머에 일부가 나타난다 · 두께에 지수적이다 (현상)
 *   scanning-tunneling-microscope  그 지수 민감함으로 표면을 그린다 (쓰임)
 * 이쪽만 「탐침 · 틈 · 전류를 일정하게 유지 · 높이 기록 · 원자 하나하나」 어휘를 갖는다.
 * 파동 묶음 · 확률 · 되튐 어휘는 두지 않는다 — 저쪽의 것이다.
 * 빛의 현미경(`microscope` · `resolving-power`)과도 갈린다 — 렌즈도 빛도 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const scanningTunnelingMicroscopeConcept: Aperi21ConceptSource = {
  id: 'scanning-tunneling-microscope',
  label: 'Scanning Tunnelling Microscope',
  canonicalSim: 'aperi21:scanning-tunneling-microscope',

  surface: {
    definition:
      'Imaging a surface atom by atom with a sharp tip: the current crossing the gap changes about tenfold for each tenth of a nanometre, so holding it steady makes the tip height trace the surface.',
    exemplarKeywords: [
      'scanning tunnelling microscope',
      'STM',
      'seeing individual atoms',
      'tunnelling current between tip and surface',
      'constant current mode',
      'atomic resolution imaging',
      'how do we get pictures of single atoms',
      'sharp tip scanning across a surface',
      'feedback keeping the tip at a fixed height above the surface',
      'imaging without light',
      'surface topography from current',
    ],
  },

  briefing: {
    observable: [
      'Along the bottom sit two rows of circles standing for atoms — a front row evenly spaced and a fainter back row offset by half a spacing. One circle in the front row is noticeably smaller than the rest.',
      'A wedge hangs above them, ending in a single circle of its own: the tip.',
      'Above everything is an empty pale strip waiting to be written on, with a coloured name above it saying what it will hold and that its height is exaggerated fourfold.',
      'The gap between the tip and the atom below it is marked with a measure and a figure in nanometres.',
      'The tip comes down in three steps, the figure changing each time by a tenth of a nanometre, and the measure shrinking with it.',
      'Dots cross the gap between tip and atom. At the widest gap almost none appear; one step closer they come now and then; at the closest they run steadily, a line of them at a time, and a marking beside the tip names them as electrons.',
      'The tip then moves sideways at a steady pace across the row. It rides up over each atom and dips between them, and it drops much further over the small atom.',
      'A dotted link runs from the tip up to a pen resting on the strip, and the pen leaves a coloured curve behind it as the tip goes.',
      'While the tip scans, the gap figure does not change and the dots keep crossing at the same rate.',
      'By the end the curve has one crest above each atom it passed, standing at the same left-to-right position as that atom, and one dip where the small atom is.',
      'Tip and curve then fade, the tip returns to its starting place, and the round begins again.',
      'No current value is given, and the tip\'s height is never written as a number.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The approach and the scan run on a fixed round and repeat.',
        'The approach in three equal steps comes before the scan, so the reason the picture is possible — how violently the crossing responds to the gap — is established before it is used.',
        'The current is shown only as how often dots cross rather than as a reading, so tenfold is seen as a change in busyness instead of read off a figure.',
        'The steadiness of the current during the scan is what makes the tip\'s height mean something: the figure for the gap and the rate of the dots both stay put while the tip rides up and down.',
        'The pen is tied to the tip by a visible link, so the curve is read as the tip\'s own height and not as a separate graph put beside it.',
        'The record is drawn with its height exaggerated, and the amount is stated above the strip, because the true dip between atoms would be a few specks on screen.',
        'One atom is made smaller than its neighbours so that one crest of the record stands apart from the others, which is what ties a single crest to a single atom rather than leaving a plain ripple.',
        'The atoms are distinguished by size alone and not by colour; what links a crest to its atom is that they share the same left-to-right position.',
        'The colour set aside for the record is used for the curve, the pen and the strip\'s name, and for nothing else.',
        'It opens with the tip already hovering over the second atom at the widest gap.',
      ],
    },

    useWhen: [
      'The article has shown pictures of individual atoms and the reader wants to know how such a picture is made. The tip crosses the surface and the record it leaves is the picture.',
      'The point is that an effect too small to notice at everyday scales becomes an instrument precisely because it is so steep. The three approach steps make the steepness visible before the scan uses it.',
      'The article needs the idea of holding a quantity fixed and reading the adjustment instead of the quantity. The gap figure and the rate of crossing stay put all through the scan while the height varies.',
      'The reader should see that each feature of the record answers to one atom rather than to the surface in general. The one small atom leaves its own dip at its own position.',
    ],

    avoidWhen: [
      'The article is establishing that crossing a barrier is possible at all, or is about the share that reflects and the share that passes. Here the crossing is taken for granted and put to work.',
      'The subject is a microscope with lenses, the wavelength of the light used, or what sets the finest detail an optical instrument can separate. Nothing here is illuminated.',
      'The point is a real image of a real surface, a named material, or a published measurement. The atoms here are a row of circles with one made small on purpose.',
      'The article needs the current in picoamps, a bias voltage, or the electronics of the feedback. The current shows only as how often dots cross, and the loop is assumed perfect.',
      'The subject is a missing atom, a step edge, a defect, or how electron states rather than shapes make the contrast. Only a row of whole atoms with one smaller one is drawn.',
      'The article is about electrons behaving as waves, being diffracted, or forming a pattern. They appear here only as things that cross a gap.',
    ],

    contrastWith: [
      {
        concept: 'quantum-tunneling',
        note: 'One argues that passing a barrier happens and that the amount collapses with thickness; the other takes that collapse for granted and uses it to read a surface off a tip\'s height.',
      },
      {
        concept: 'microscope',
        note: 'One magnifies by carrying light through lenses to build an image; the other never forms an image at all — it drags a point across the surface and plots what it had to do.',
      },
      {
        concept: 'resolving-power',
        note: 'One says how close two things may be before light can no longer separate them; the other sidesteps that limit entirely by not using light, and its detail is set by the sharpness of the tip and the steepness of the response.',
      },
      {
        concept: 'electron-diffraction',
        note: 'Both use electrons to learn about a solid, but one reads a pattern made by electrons going through a sample, while the other counts electrons crossing a gap at one spot at a time.',
      },
    ],
  },
};
