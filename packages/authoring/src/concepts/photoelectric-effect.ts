/**
 * photoelectric-effect 개념 선언.
 *
 * 광전 둘의 갈림 — **무엇을 주장하는가**.
 *   photoelectric-effect         **나오느냐** — 빨강은 아무리 세게 해도 안 나오고 보라는 약해도 나온다.
 *                                광자 하나가 전자 하나에, 몫이 쌓이지 않는다
 *   work-function-and-threshold  **어디서부터 · 얼마나** — 문턱 f0 = φ/h 와 기울기 h, 금속을 바꾸면 문턱만 옮겨 간다
 * 이쪽만 「금속판 · 램프 · 광자 하나 · 세기 · 밝기 · 곧바로 · 전자 수」 어휘를 갖는다.
 * 문턱 진동수 · 일함수의 값 · 저지 전압 · 기울기 · 금속 이름은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const photoelectricEffectConcept: Aperi21ConceptSource = {
  id: 'photoelectric-effect',
  label: 'Colour Rather Than Brightness Freeing Electrons',
  canonicalSim: 'aperi21:photoelectric-effect',

  surface: {
    definition:
      'Red light freeing no electrons from a metal however bright it is made, while faint violet light frees them at once: brightness settles how many come out and colour settles the energy of each.',
    exemplarKeywords: [
      'photoelectric effect',
      'light behaving as particles rather than waves',
      'why does turning the lamp up not help',
      'Einstein’s 1905 explanation with light quanta',
      'one photon to one electron',
      'evidence that light arrives in whole pieces',
      'electrons come out instantly with no waiting time',
      'a wave picture predicts the energy building up',
      'a bright red lamp against a dim violet one on metal',
      'knocking electrons out of a metal with light',
    ],
  },

  briefing: {
    observable: [
      'A lamp shines a beam down onto a sheet of metal holding a row of electrons, and the light crosses the gap not as a smear but as separate short packets of waves, each one aimed at a single electron.',
      'The packets carry the colour of the beam and their wave count says the colour a second way — the red ones hold under three waves in the same length in which the violet ones hold over four.',
      'With red light an electron that is struck rises to just under the surface and falls back; two figures stand beside the picture, the energy one packet carries and the energy it takes to get out, and the first is the smaller.',
      'The lamp is then turned up and red packets pour down four times as thickly, so that several electrons are rising at the same moment — and not one of them crosses the surface.',
      'The lamp changes to violet and the packets become scarce, only a couple a second, yet the electron each one reaches goes straight over the surface and away to the upper right.',
      'The violet lamp is then turned up as well, and many electrons leave at once with tails of identical length, so that what the extra brightness has bought is their number and not their speed.',
      'Where an electron has left, the place in the row stands empty for a moment and is then filled again.',
      'The only figures on screen are the energy of one packet, which changes when the colour changes, and the energy needed to escape, which does not.',
    ],

    screen: {
      affordances: [
        'One lamp runs through dim red, bright red, dim violet and bright violet in that order and then starts over; nothing has to be pressed.',
        'A single lamp is changed rather than two panels set side by side, because turning the brightness up and changing the colour are both things done to one lamp.',
        'Each packet is aimed at one particular electron and reaches it alone, which is what makes the failure under a bright red lamp readable: many electrons rise together and none is helped by its neighbours’ packets.',
        'The heights the struck electrons reach are in the same ratio as the two energies written on screen, so the picture and its figures cannot disagree.',
        'The light is painted in its own colours, the same colour for the lamp aperture, the beam and the packets, and both colours are kept inside the range the eye can see so that neither has to be invented.',
        'The picture opens with a packet already arriving rather than with an empty beam.',
      ],
    },

    useWhen: [
      'The article has claimed that light comes in whole pieces and the reader wants the observation that forced it. The bright red lamp achieving nothing while the faint violet one succeeds immediately is that observation, and both halves are in one run.',
      'The reader’s objection is that a strong enough beam must eventually pile up enough energy. The moment to write against is the bright red stretch, where several electrons rise at once and every one of them falls back.',
    ],

    avoidWhen: [
      'The subject is where the cut-off colour lies for a given metal, what sets it, or how the energy grows once it is passed. Two colours are shown here, one below and one above, and nothing is swept between them.',
      'The article turns on comparing metals, on a work function as a quantity to be looked up, or on a gradient read from a graph. One metal is used and no graph is drawn.',
      'The point is light being given off by atoms dropping between levels, or a spectrum of lines. Everything here runs the other way: light arrives and an electron leaves.',
      'The article needs the energy or speed of the escaping electrons as a number. Their tails are drawn the same length as each other and no value is written for them.',
      'The subject is electric current, a circuit, a collecting electrode or a stopping voltage. Nothing here is wired to anything; electrons simply leave the sheet and fly off.',
      'The reader is being shown light as a wave — interference, diffraction, or a wavelength measured. The packets carry waves inside them only so that the two colours can be told apart.',
    ],

    contrastWith: [
      {
        concept: 'work-function-and-threshold',
        note: 'One shows that a brighter lamp of the wrong colour achieves nothing while a fainter one of the right colour succeeds at once; the other grants that and goes on to say where the right colour begins, what decides it, and how the energy grows beyond it.',
      },
      {
        concept: 'wave-vs-particle-transport',
        note: 'One is a wave carrying energy to a far place without carrying the medium; the other is the case where treating the arriving energy as spread along a wave gives the wrong answer, and it has to arrive in whole pieces aimed one at a time.',
      },
      {
        concept: 'blackbody-radiation',
        note: 'Both are places where the older, continuous account of light fails; one fails in the shape of what a hot body gives off, the other in whether a metal surrenders a single electron.',
      },
    ],
  },
};
