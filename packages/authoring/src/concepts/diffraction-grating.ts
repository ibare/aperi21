/**
 * diffraction-grating 개념 선언.
 *
 * 회절 넷 가운데 **틈이 여럿**인 쪽이다. 바뀌는 것으로 형제와 갈랐다.
 *   diffraction-grating      바뀌는 것 = 틈의 **수**(간격은 그대로). 주장 = 밝은 줄이
 *                            **자리는 그대로 둔 채** 가늘고 날카로워진다
 *   single-slit-diffraction  바뀌는 것 = 틈 하나의 폭. 주장 = 가운데 띠가 어디서 끝나는가
 * 이쪽만 「여러 틈 · 날카로워진다 · 자리는 그대로 · 차수 · 흰빛이 색으로 갈린다」 어휘를 갖는다.
 * 「밝아진다」 는 쓰지 않는다 — 화면이 틈 수마다 가장 밝은 곳을 1 로 맞춰 밝기 자체를 주장하지 않는다.
 *
 * 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const diffractionGratingConcept: Aperi21ConceptSource = {
  id: 'diffraction-grating',
  label: 'What More Openings Do to the Bright Lines',
  canonicalSim: 'aperi21:diffraction-grating',

  surface: {
    definition:
      'What adding more equally spaced openings does to a pattern: the bright lines keep the very same positions but narrow into sharp needles with darkness spreading between them, and white light then parts into ordered spectra.',
    exemplarKeywords: [
      'diffraction grating',
      'many slits side by side',
      'sharp bright lines instead of broad fringes',
      'orders of a grating',
      'd sin theta equals m lambda',
      'grating spectrum',
      'a spectrometer with a ruled grating',
      'more lines per millimetre gives finer lines',
      'the maxima stay put but get narrower',
      'rainbow orders from ruled glass',
      'why a grating separates wavelengths better than two slits',
    ],
  },

  briefing: {
    observable: [
      'Green light arrives from the left as straight fronts and meets a wall with two openings in it; on the screen beyond are five thick green lines, and a curve beside the screen shows five broad humps.',
      'A faint horizontal guide line passes through the top of each hump, marking where the bright places sit.',
      'Three further openings then open up, growing from nothing at the same spacing as the first two, so the spacing stays put while the count rises to five.',
      'As they open, the humps narrow, and the curve for two openings stays on as a dashed line so the narrowing can be compared rather than remembered. Small humps appear between the main ones.',
      'The tops of the narrowed humps still sit on the very same guide lines they sat on with two openings.',
      'More openings open until there are twenty. The humps become thin needles standing on the same guide lines, what lies between them is very nearly nothing, and the screen is left with thin green lines.',
      'The curve for five openings remains as a dashed line beside the twenty-opening one, so the sharpening is seen twice over.',
      'The arriving light then turns white and the curve and guide lines are cleared away. The middle line on the screen stays white, while the lines either side of it are drawn out into bands running from violet on the inside to red on the outside.',
      'The openings and the colour return to their starting state and the round begins again. No order number, angle or intensity figure appears anywhere.',
    ],

    screen: {
      affordances: [
        'The round runs by itself — two openings, five, twenty, then white light — and repeats, with nothing to press.',
        'The openings are opened out of a row of places already spaced along the wall, so the spacing visibly stays fixed while only the count changes.',
        'Each earlier count keeps its curve on screen as a dashed line beside the current one, so the narrowing is a comparison of two shapes at the same instant.',
        'The curve and the screen are scaled so that the brightest place is full for every count, which makes the comparison one of shape — width and the darkness between — rather than of brightness.',
        'The faint guide lines are what carry the claim that the positions do not move: the tops of the humps stay on them at every count.',
        'The white-light stretch comes last, once the lines are sharp enough for each wavelength to land in a visibly separate place, and the curve is withdrawn there because it belongs to one wavelength only.',
      ],
    },

    useWhen: [
      'The article has given the grating condition and the reader takes it to mean that more openings put the bright places somewhere new. Watching the count rise while the tops stay on the same guide lines settles what the count does and does not change.',
      'The point being made is that a grating is what makes a spectrum usable — that a wavelength can be pinned down because the line is thin. The needles standing where broad humps used to be are that argument.',
      'The reader has met the pattern from a couple of openings and needs to know what is gained by ruling thousands of them. The three counts in one running picture answer it as a trend rather than as two separate cases.',
    ],

    avoidWhen: [
      'The subject is one opening and the width of the band it leaves. The count of openings is what changes here, and the openings are treated as very narrow throughout, so no envelope dims the outer lines.',
      'The article says the lines also get brighter as more openings are used. Each count is drawn at its own full scale, so what can be compared here is the width and the darkness between, not the brightness.',
      'The subject is the spacing of the openings, the grating constant, or what a finer ruling does. The spacing never changes here — only how many of the places are open.',
      'The article works out an order number or an angle for a given wavelength. Nothing on the screen is numbered and no angle is drawn.',
      'The colours in question come from a film, a wedge or a coating, where thickness decides the colour. The colours here appear only when white light meets the openings, spread out along the screen by order.',
      'The point is whether waves get into the shadow at all, or how a single wave bends past an edge. Every count here already gives a pattern; the question is its shape.',
    ],

    contrastWith: [
      {
        concept: 'single-slit-diffraction',
        note: 'One holds the spacing fixed and adds openings to find the bright lines unmoved but sharpened; the other has one opening whose width sets how wide the bright band is in the first place.',
      },
      {
        concept: 'interference',
        note: 'One asks what many sources gain over two — sharper bright places at the same positions; the other asks what two sources establish at all, namely an arrangement that stays put on a surface.',
      },
      {
        concept: 'thin-film-interference',
        note: 'Both take white light apart, by different means — one sorts wavelengths into separate directions by the spacing of many openings, the other subtracts one wavelength at a time according to a thickness.',
      },
      {
        concept: 'huygens-principle',
        note: 'One counts the sources and finds the sum growing sharper; the other asks how sources spread along a front conspire into the front itself.',
      },
      {
        concept: 'youngs-double-slit',
        note: 'One starts from a single opening and claims that adding a second takes light away from places it had been falling on; the other starts from a pattern already standing and claims that adding many more openings leaves every bright place exactly where it was while narrowing it.',
      },
    ],
  },
};
