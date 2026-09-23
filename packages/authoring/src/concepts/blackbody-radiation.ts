/**
 * blackbody-radiation 개념 선언.
 *
 * 복사 넷(둘은 이미 선언)의 갈림 — **무엇을 주장하는가**.
 *   blackbody-radiation     두 **곡선이 어긋난다** — 고전 이론이 짧은 파장에서 파탄한다. 온도는 하나로 묶어 둔다
 *   wien-displacement-law   온도를 올리면 봉우리가 **얼마나** 옮겨 가는가 — 두 배면 절반
 *   star-color-temperature  봉우리 자리가 만드는 **색**
 *   stefan-boltzmann-law    내보내는 **총량**이 온도의 네제곱
 * 이쪽만 「고전 이론 · 자외선 파탄 · 두 곡선의 어긋남 · 천장을 뚫음 · 무한」 어휘를 갖는다.
 * 봉우리가 옮겨 감 · 색 · 총량 · 네제곱은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const blackbodyRadiationConcept: Aperi21ConceptSource = {
  id: 'blackbody-radiation',
  label: 'Where Classical Theory Fails for a Glowing Body',
  canonicalSim: 'aperi21:blackbody-radiation',

  surface: {
    definition:
      'The breakdown of classical theory for a glowing body: its predicted curve rises without limit toward short wavelengths, while the measured one turns over at a peak and comes back down to nothing.',
    exemplarKeywords: [
      'blackbody radiation',
      'the ultraviolet catastrophe',
      'the Rayleigh-Jeans law breaks down',
      'Planck curve against the classical prediction',
      'why classical physics failed for hot glowing objects',
      'the problem that started quantum theory',
      'a prediction of infinite output at short wavelengths',
      'theory and measurement agree only at long wavelengths',
      'emission from a hot cavity against wavelength',
      'the curve nineteenth century physics could not account for',
    ],
  },

  briefing: {
    observable: [
      'One plate carries wavelength across the bottom and strength up the side, and two curves are drawn on it together at the same scale, one for what was measured and one for what the older theory predicts.',
      'The drawing starts at the long-wavelength end on the right and sweeps leftward; a head point runs along each curve at the wavelength being reached, with a dotted upright standing between the two heads so that the gap of the moment has a length.',
      'Out at the long wavelengths the two run close together near the floor, and the caption says only that they keep close company there rather than that they agree.',
      'Coming inward through the infrared the classical curve alone climbs steeply and is cut off where it meets a dotted ceiling line, and its name is left standing at the place it was cut.',
      'Past that, an arrow and an infinity sign rise above the ceiling at whatever wavelength is being swept, and the arrow grows longer the shorter the wavelength gets.',
      'In the same stretch the measured curve rises to a peak inside the band the eye can see and then comes down again to nothing at the short-wavelength end, and its own name appears beside it.',
      'The finished picture has one vertical line at the far left holding all three things at once: the measured curve down at the floor, the dotted gap running all the way up to the ceiling, and the longest arrow with its infinity sign above.',
      'A thin band of the visible colours runs under the wavelength axis with dashed edges, and the regions on either side are named but left uncoloured.',
      'A single temperature is written on the plate and never changes; the strength axis carries a name but no scale, and no figure is printed for either curve at any wavelength.',
    ],

    screen: {
      affordances: [
        'The sweep runs from the long wavelengths to the short ones, the finished plate is held, the drawing fades back to the start and it begins again; nothing has to be pressed.',
        'Both curves are drawn on one and the same scale, which is what makes the growing gap between them mean anything.',
        'The strength axis is kept linear rather than logarithmic, because a logarithm would keep the runaway curve on the plate at the cost of turning the measured peak into an endless slope, and the peak is half of what is being claimed.',
        'The ceiling is placed just above the measured peak, since the classical curve is already dozens of times higher there and no ceiling could contain it; what the height buys is room to read the measured curve.',
        'Above the ceiling the arrow is scaled down enormously so that its growth can still be watched, and no number or tick is attached to it — it asserts a direction, not a size.',
        'Only one colour is used, and only for the classical side — its curve, its head, its arrow, its infinity sign and its name — so the two curves are identified by the names written on them rather than by a key.',
        'The picture opens with the drawing already under way at the right-hand end.',
      ],
    },

    useWhen: [
      'The article is introducing why a new physics was needed at all, and the reader has to see that the older account did not merely give slightly wrong numbers but ran off the plate entirely at short wavelengths.',
      'The reader needs both halves of the failure at once — that the two accounts are close where the wavelength is long, so the older one is not simply discarded, and that they part company catastrophically where it is short.',
    ],

    avoidWhen: [
      'The subject is how the curve changes with temperature, or how far the peak moves when a body is heated. Only one temperature appears here and it never changes.',
      'The article is about the colour a hot body glows, or reading a temperature off a colour. Neither curve is filled with colour, and the visible band is marked only so the reader knows where it lies.',
      'The point is how much a surface radiates in total, or how steeply that total rises with temperature. Nothing is added up here and the strength axis carries no scale.',
      'The article explains why the correct curve is correct — energy coming in whole pieces, or a constant named after Planck. Neither is drawn; only the shapes of two curves and the gap between them.',
      'The subject is a spectrum with lines in it, absorption features, or the composition of a source. Both curves here are smooth from end to end.',
      'The reader is to take values off the plate. There is no scale on the strength axis and nothing is printed but the temperature and the wavelength marks.',
    ],

    contrastWith: [
      {
        concept: 'wien-displacement-law',
        note: 'One holds the temperature fixed and asks what the old theory gets wrong about the shape; the other takes the measured shape as settled and asks how far its peak travels when the temperature is changed.',
      },
      {
        concept: 'stefan-boltzmann-law',
        note: 'One is about the shape of the output across wavelengths and where a prediction of it goes astray; the other says nothing about shape and only how the total rises with temperature.',
      },
      {
        concept: 'star-color-temperature',
        note: 'One is a disagreement between two curves and so cannot be stated as a colour at all; the other reads a colour off one measured curve and has no disagreement in it.',
      },
      {
        concept: 'photoelectric-effect',
        note: 'Both are places where treating light as a spread-out wave gives the wrong answer; one finds it in the shape of what a hot body emits, the other in whether a metal gives up an electron at all.',
      },
    ],
  },
};
