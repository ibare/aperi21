/**
 * stefan-boltzmann-law 개념 선언.
 *
 * 열 이동 넷 중 하나. 이쪽만 **가는 이야기가 아니다.**
 *   thermal-conduction   닿은 물질을 타고 간다
 *   thermal-convection   흐름에 실려 간다
 *   thermal-radiation    빈 곳을 건너가 **닿는다** — 받는 쪽이 있다
 *   stefan-boltzmann-law **내보내는 양**이 온도로 정해진다 — 받는 쪽이 없다
 * 이쪽만 「배수 · 두 배면 열여섯 배 · 가파르다 · 절대 온도」 어휘를 갖는다. 건너감 · 진공 ·
 * 가리개 · 데워지는 판은 쓰지 않는다 — 화면에 받는 것이 없다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const stefanBoltzmannLawConcept: Aperi21ConceptSource = {
  id: 'stefan-boltzmann-law',
  label: 'Radiated Output Against the Fourth Power of Temperature',
  canonicalSim: 'aperi21:stefan-boltzmann-law',

  surface: {
    definition:
      'How much radiation a surface pours out, set by its absolute temperature raised to the fourth power, so that doubling that temperature multiplies the output sixteen times over.',
    exemplarKeywords: [
      'Stefan-Boltzmann law',
      'radiation goes as the fourth power of temperature',
      'sigma T to the fourth',
      'double the temperature, sixteen times the radiation',
      'why does a small rise in temperature matter so much',
      'blackbody emission rate',
      'power radiated per unit area',
      'how much a hot surface gives off',
      'emitted power against temperature',
      'radiated flux from a surface',
    ],
  },

  briefing: {
    observable: [
      'Three plates of equal area stand side by side, drawn the same size and the same colour, with 300 K, 450 K and 600 K written beneath them — the temperature is the only thing distinguishing them.',
      'A bar grows to the left of each plate for its temperature, stopping at heights in the ratio one, one and a half, and two, with those multiples written above them.',
      'Those bars are held and read on their own before anything else happens, so the even spacing of the three temperatures is settled first.',
      'Then a second bar grows to the right of each plate for what it radiates, stopping at one, a little over five, and sixteen times the first plate’s.',
      'On the hottest plate that second bar reaches eight times the height of the temperature bar standing beside it, and the two are drawn to one and the same scale so the disparity is a matter of looking.',
      'On the coolest plate the two bars come out the same height, which is where the comparison begins and what makes the other two pairs mean something.',
      'Each bar is named beneath it, one for temperature and one for what is radiated, and the radiated side is the one picked out in a distinct colour.',
      'No plate is drawn glowing or tinted, and no figure in watts, no area and no constant appears anywhere — only temperatures and multiples.',
    ],

    screen: {
      affordances: [
        'One round builds the temperature row, holds it, then builds the radiated row beside it, and starts over; nothing has to be pressed.',
        'Both rows are drawn to a single scale, which leaves the temperature bars short but preserves the one thing the comparison rests on — that the first plate’s two bars are equal.',
        'The two bars for one plate are set as a pair on either side of it, so there is never any doubt which plate a bar belongs to, while the rows can still be read across.',
        'The middle plate is there so the pattern cannot be read as a rule about doubling: half again as hot is already over five times as much.',
        'The multiples are written out and the absolute output is not, because what is being shown is a ratio and nothing else.',
      ],
    },

    useWhen: [
      'The article has given the fourth-power dependence as a formula and the reader has no feeling for how sharp it is. A bar at twice standing next to one at sixteen times, on one scale, is what makes sharp something seen.',
      'The reader is likely to remember it as a doubling rule, and what is wanted is the intermediate case — a temperature only half again as high already giving over five times the output.',
    ],

    avoidWhen: [
      'The article is about radiation crossing a gap and warming something. Nothing receives anything here; there is no second body and no space between.',
      'The subject is the colour or the wavelength of what a hot body gives off. The three plates are drawn identically and nothing glows.',
      'The point is the whole output of a body of a given size, where its area matters as much as its temperature. All three plates here are equal in area on purpose.',
      'The claim concerns how bright a source looks from a distance. Nothing here is viewed from anywhere.',
      'The net exchange with cooler surroundings is at issue — a body giving off and taking in at once. Only what goes out is drawn.',
      'Values are wanted in watts per square metre, or the constant itself. Only temperatures and multiples of the coolest plate are written.',
    ],

    contrastWith: [
      {
        concept: 'thermal-radiation',
        note: 'One is about what a surface sends out and how steeply that depends on how hot it is; the other is about that output getting somewhere across nothing at all and warming what it lands on.',
      },
      {
        concept: 'stellar-luminosity',
        note: 'One is what a square of surface gives off at a temperature; the other is the whole of a star’s output, where its size counts alongside its temperature.',
      },
      {
        concept: 'star-color-temperature',
        note: 'Two things a temperature settles about radiation that are easy to conflate — one is how much comes out, the other is what colour it comes out.',
      },
      {
        concept: 'apparent-brightness',
        note: 'One is a property of the surface itself, independent of any observer; the other is how much of that output happens to reach somebody standing at a distance.',
      },
    ],
  },
};
