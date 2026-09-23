/**
 * work-function-and-threshold 개념 선언.
 *
 * 광전 둘의 갈림 — **무엇을 주장하는가**.
 *   photoelectric-effect         **나오느냐** — 금속판 · 램프 · 광자 하나 · 전자 알갱이
 *   work-function-and-threshold  **어디서부터 · 얼마나** — 그래프 한 판, 문턱과 기울기,
 *                                금속을 바꾸면 문턱만 옮겨 가고 기울기는 겹친다
 * 이쪽만 「문턱 진동수 · 일함수 값 · 직선 · 기울기 · 금속을 바꾸면 · 겹친다」 어휘를 갖는다.
 * 램프 · 밝기 · 세기 · 광자 알갱이 · 튀어나가는 전자는 쓰지 않는다 — 화면에 없다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const workFunctionAndThresholdConcept: Aperi21ConceptSource = {
  id: 'work-function-and-threshold',
  label: 'Threshold Frequency Set by the Metal, Gradient Set by Nature',
  canonicalSim: 'aperi21:work-function-and-threshold',

  surface: {
    definition:
      'The greatest energy of the electrons a metal gives up, plotted against frequency, forming a straight line that begins at a threshold belonging to that metal while its gradient is the same for every metal.',
    exemplarKeywords: [
      'work function',
      'threshold frequency',
      'f nought equals phi over h',
      'stopping voltage plotted against frequency',
      'finding Planck’s constant from the gradient',
      'sodium compared with copper',
      'below the cut-off frequency nothing comes out at all',
      'maximum kinetic energy equals hf minus the work function',
      'why each metal has its own cut-off colour',
      'the gradient comes out the same for every metal',
    ],
  },

  briefing: {
    observable: [
      'One plate carries frequency across the bottom from zero and energy up the side, with a thin band of the visible colours laid under the frequency axis and the region beyond it named.',
      'A dotted upright sweeps rightward across the plate, taking the colour of the light at whatever frequency it stands on while it is inside the visible band and turning plain grey once it passes beyond.',
      'While the sweep is below the first metal’s threshold the reading it carries is a hollow ring sitting on the frequency axis itself — there are no electrons, so there is no energy to plot.',
      'At the threshold a mark is planted on the axis with a ring spreading from it and the frequency written beside it; from there the reading becomes a filled point, lifts off the axis and draws a straight line as the sweep continues.',
      'The sweep then begins again for a second metal, and this time it passes the first metal’s threshold with the reading still a hollow ring on the axis, leaves the visible band altogether still on the axis, and only much later plants its own threshold mark and lifts off.',
      'The second line climbs alongside the first, and each carries a name at its end giving the metal and the energy it takes to get out of it.',
      'A grey dotted copy of the first line then slides rightward along the frequency axis and comes to rest exactly on top of the second: its foot has moved from one threshold to the other and nothing else about it has changed.',
      'Both lines are then labelled with the same gradient, named but not given a value.',
      'The two lines and their readings are drawn in one and the same colour and are told apart only by the names at their ends; the separate colour on the plate is reserved for the threshold marks.',
      'The only figures written anywhere are the two escape energies and the two threshold frequencies.',
    ],

    screen: {
      affordances: [
        'The first metal is swept, then the second, then the copy slides across and the match is held, and the whole round begins again; nothing has to be pressed.',
        'The frequency axis starts at zero, so how far each threshold stands from the origin, and how far apart the two thresholds are, can both be read as distances.',
        'Below its threshold a metal’s reading is drawn hollow on the axis rather than as a point at zero, because a filled point there would say that electrons are emerging with no energy.',
        'The band of visible colours under the axis is what shows that one metal’s threshold falls among the colours the eye can see while the other lies well out beyond them; no colour is invented outside that band, and the sweep goes grey there.',
        'The sliding copy is the whole argument in one movement — if the gradients differed it could not be made to lie on the other line by sliding along the axis alone.',
        'One colour is used for the thresholds only, and the two metals are separated by the names written at the ends of their lines.',
        'Two metals are used rather than three, since two are enough to make a common gradient mean something and a third would crowd the names together.',
      ],
    },

    useWhen: [
      'The article has stated the relation between an electron’s energy and the frequency of the light and the reader needs to see that relation as a measured straight line, with the metal entering only through where that line starts.',
      'The reader is to be shown that a constant of nature can be got out of an experiment on ordinary metals: the two lines have the same gradient and the sliding copy settles that by lying flat on the second line.',
      'The point at issue is that below a cut-off nothing happens at all, and the article needs a picture in which the reading stays pinned to the axis through a long sweep before it ever lifts.',
    ],

    avoidWhen: [
      'The subject is brightness, intensity, or how many electrons come out. Nothing here varies but frequency, and the plate has no quantity on it for a number of electrons.',
      'The article needs light striking a metal, packets of light, or electrons visibly leaving a surface. None of that is drawn here; the emergence of electrons is reported only by a plotted reading lifting off the axis.',
      'The point is that a wave picture would have predicted the energy accumulating over time. Nothing accumulates here and no waiting time is shown.',
      'The reader is to take away the value of the gradient itself. It is named and never given a number, and the escape energies are the only energies written.',
      'The subject is the circuit that performs the measurement — a collecting electrode, a current, or how a stopping voltage is actually applied. Only the plotted result appears.',
      'The article is about light being given off rather than absorbed, or about the spectrum of an element. Both sweeps here are of light arriving at a metal.',
    ],

    contrastWith: [
      {
        concept: 'photoelectric-effect',
        note: 'One establishes that brightness is beside the point and colour is not; the other takes that as settled and puts numbers on it, saying where a metal’s cut-off falls and how the energy grows once it is past.',
      },
      {
        concept: 'blackbody-radiation',
        note: 'One gets a constant of nature out of the gradient of a straight line measured on one metal after another; the other never names such a constant and is about a curve whose disagreement with the older theory is what made one necessary.',
      },
      {
        concept: 'wien-displacement-law',
        note: 'Both are proportionalities read off a plot against wavelength or frequency; one is about where a hot body’s output is concentrated, the other about the frequency below which a metal releases nothing at all.',
      },
    ],
  },
};
