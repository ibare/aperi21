/**
 * malus-law 개념 선언.
 *
 * 편광 넷 가운데 **양**을 묻는 쪽이다.
 *   malus-law     주장 = 검광판을 기울이면 세기가 **축 방향 성분보다 빨리** 준다 —
 *                 1 · 0.75 · 0.5 · 0.25 · 0
 *   polarization  주장 = 판을 하나 더 끼우면 빛이 되살아난다 (양이 아니라 있고 없음)
 * 이쪽만 「세기 · 성분 · 얼마나 · 막대 · 곡선 · 정면에서 본 판 하나」 어휘를 갖고, 세 판 · 엇갈림 ·
 * 끼운다 · 되살아난다는 쓰지 않는다.
 *
 * 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const malusLawConcept: Aperi21ConceptSource = {
  id: 'malus-law',
  label: 'How Fast the Intensity Falls with the Analyser Angle',
  canonicalSim: 'aperi21:malus-law',

  surface: {
    definition:
      'How far the intensity of polarised light drops as an analyser is turned away from the vibration: faster than the passed component itself, to three quarters at thirty degrees, a half at forty-five and a quarter at sixty.',
    exemplarKeywords: [
      'Malus’s law',
      'intensity of light through an analyser',
      'cosine squared of the angle between the axes',
      'I equals I nought cos squared theta',
      'half the light gets through at forty-five degrees',
      'intensity falls faster than the amplitude does',
      'analyser angle against brightness',
      'projecting the vibration onto the transmission axis',
      'only a quarter left at sixty degrees',
      'amplitude squared gives intensity',
      'turning the second filter and measuring what comes out',
    ],
  },

  briefing: {
    observable: [
      'On the left an analyser is seen face on, with lines ruled across it along the direction it passes and an axis through it. It turns in steps and rests at nought, thirty, forty-five, sixty and ninety degrees.',
      'An upright arrow on the analyser stands for the arriving vibration. From its tip a perpendicular drops onto the analyser’s axis, and the piece of the axis up to that foot is drawn as a second arrow — the part that gets through.',
      'As the analyser turns, that second arrow shortens; at sixty degrees it is half the upright one, and at ninety it is gone altogether.',
      'In the middle a screen glows with the light that got through, dimming step by step from full at nought to black at ninety.',
      'On the right, intensity is plotted against the analyser angle. A dashed curve tracks the length of the passed part and a solid curve tracks the intensity, with a moving point riding on each as the analyser turns.',
      'Whenever the analyser rests, a bar rises at that angle to the height of the intensity, and the figure is written on the row beneath the angle scale: one, three quarters, a half, a quarter, nought.',
      'Beside the moving point the length of the passed part is written at the resting angles where it differs from the intensity: nought point eight seven, nought point seven one, nought point five.',
      'A vertical guide joins the top of each bar up to the dashed curve, and that gap is plainly widest at sixty degrees, where the passed part reads a half while the intensity reads a quarter.',
      'Bars already raised stay behind in a faint form, so by ninety degrees five of them stand in a descending staircase beneath the solid curve.',
      'While the analyser is turning no figure is shown at all — only the opening angle between the two axes.',
    ],

    screen: {
      affordances: [
        'The round turns the analyser, rests, turns again through the five settings and then returns, over and over, with nothing to press.',
        'The three parts of the picture run on one clock, so the length of the passed arrow, the brightness of the screen and the height of the bar are three readings of the same moment.',
        'The passed part and the intensity are each given one colour of their own and carried in it through arrow, curve, point and bar, so the two quantities can be followed across all three of them.',
        'The two curves are also told apart by being dashed and solid and by names written beside them, so nothing rests on colour alone.',
        'The figures are shown only while the analyser is at rest, which keeps every number on screen an exact value of a chosen setting.',
        'Bars from earlier settings are kept in a faint form so the five values end up standing together as a staircase.',
        'The screen is painted with light itself, so its darkening is the quantity rather than a change of shade.',
        'The arriving light is already vibrating one way, shown by the single upright arrow, with no first filter drawn.',
      ],
    },

    useWhen: [
      'The article has given the intensity rule and the reader keeps expecting the light to fall off in proportion to the projected vibration. The gap between the bar and the dashed curve, widest at sixty degrees, is that mistake made visible.',
      'The point being made is that half the light survives at forty-five degrees and only a quarter at sixty — figures the reader is meant to carry away. The five bars and their written values leave them standing as a staircase.',
      'The reader needs the step from amplitude to intensity, from a length on a diagram to a brightness. The arrow, the screen and the bar are three renderings of the same setting, so that step can be taken by looking.',
    ],

    avoidWhen: [
      'The subject is a third filter added between two crossed ones, or light coming back where there was none. One analyser is shown here and the question is how much light it passes.',
      'The article needs the formula written out, or the vertical scale read off in absolute units. No formula appears and the only figures are the values at the five settings.',
      'The subject is light polarised by reflection from a surface, or the angle at which that happens. The light arrives already polarised here, with nothing said about where it came from.',
      'The point is a crystal splitting a beam, or a doubled image. There is one beam and one analyser here.',
      'The reader is to explore angles of their own choosing, or to find where the light is brightest by hand. The analyser rests at five settings and nothing else can be selected.',
      'The article is about colour, or about how the passed fraction depends on wavelength. One colour of light is used throughout.',
    ],

    contrastWith: [
      {
        concept: 'polarization',
        note: 'One asks how much light survives at each angle and answers with figures; the other asks whether any survives at all once a filter is added, and answers with a vibration that reappears.',
      },
      {
        concept: 'brewster-angle',
        note: 'Both put an angle against how much of a vibration survives, of different things — one turns a filter against light already polarised, the other turns the whole arrangement and lets a surface do the selecting.',
      },
      {
        concept: 'birefringence',
        note: 'One measures how much of one vibration direction gets through; the other keeps two perpendicular directions and separates them in space instead of weighing them.',
      },
      {
        concept: 'vector-decomposition',
        note: 'One takes a component along a chosen axis and then squares it, which is why the light falls off faster than the component; the other stops at the components themselves.',
      },
    ],
  },
};
