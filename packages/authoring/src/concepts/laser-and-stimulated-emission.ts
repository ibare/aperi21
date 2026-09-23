/**
 * laser-and-stimulated-emission 개념 선언.
 *
 * 이 묶음에서 혼자 **빛이 빛을 부르는 연쇄**를 맡는다.
 *   laser-and-stimulated-emission  광자 하나가 똑같은 광자를 하나 더 불러내고, 거울 사이를
 *                                  오가며 되풀이되어 봉우리가 한 줄로 맞은 다발이 된다
 *   chain-reaction                 같은 「하나가 둘을 부른다」 이되 부르는 것이 **중성자**이고
 *                                  세는 것이 세대마다의 배수(k)다
 * 이쪽만 들뜸 ↔ 바닥 · 거울 · 같은 위상 · 결 맞음 어휘를 갖는다. 준위 사다리 · 광자 에너지는
 * 여기 없다. 저쪽은 배수와 판정(폭주 · 임계 · 꺼짐)이 주장이고 위상이라는 말이 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const laserAndStimulatedEmissionConcept: Aperi21ConceptSource = {
  id: 'laser-and-stimulated-emission',
  label: 'Stimulated Emission and the Growth of a Coherent Beam',
  canonicalSim: 'aperi21:laser-and-stimulated-emission',

  surface: {
    definition:
      'How laser light multiplies: a photon passing an excited atom brings out a second photon going the same way, in step with it and at the same wavelength, and mirrors let this happen again and again.',
    exemplarKeywords: [
      'stimulated emission',
      'how a laser works',
      'coherent light',
      'population inversion',
      'an optical cavity between two mirrors',
      'light amplified by passing through a medium',
      'why is laser light all in step',
      'one photon becoming two identical photons',
      'gain on every round trip',
      'what makes laser light different from a lamp',
      'a partially transmitting output mirror',
    ],
  },

  briefing: {
    observable: [
      'Two mirrors face each other with a band of atoms between them, the atoms laid out in seven rows. Most are filled dots, a few are hollow rings.',
      'A red wave grows out of the left mirror and travels along the middle row to the right. This first crossing runs slowly.',
      'The moment the front of that wave draws level with a filled dot, that dot turns into a ring, a short ring spreads from it, and in its row a second red wave grows out of that very spot and travels on alongside the first.',
      'The two waves have their fronts together and the same spacing between crests, so the crests line up in a column across the rows.',
      'At that first event three short labels are pinned by dashed leaders: one on the atom about to drop, one on the wave that arrived and one on the wave that has just appeared. They are taken away once there are three waves.',
      'Waves reaching a mirror fold back and travel the other way, and each time they cross the band more dots turn into rings and more rows take up a wave.',
      'Where more than one wave shares a row they are drawn as a single thicker line.',
      'The crossings are not alike: the first produces a handful of new waves, the second about twice as many, the third more again, so the filling up gets faster as it goes.',
      'After three crossings a sheaf of waves, crests still in one column across all the rows, passes out through the right-hand mirror and travels off, with its wavelength written beside it.',
      'By then most of the band is rings rather than dots. A short stage follows in which the rings that dropped fill back in, and the round begins again.',
      'A label naming the band as having more excited atoms than not is up only while that is still true of what is drawn.',
      'Everything is in one ink colour except the light itself, and every wave is the same colour as every other.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The waves, the drops and the refilling all run on their own and the round repeats.',
        'An excited atom and a dropped one are told apart by being filled or hollow rather than by colour, so colour is left to mean light and nothing else.',
        'Every wave carries the same colour, because they are all at the one wavelength that is written on the light that leaves.',
        'The first crossing is deliberately slowed so the first event can be followed: the arriving wave, the atom going hollow, the new wave growing from that spot.',
        'The first new wave appears in a row next to the one that triggered it rather than in the same row, so that "one more" can be seen as a separate line instead of being hidden underneath.',
        'Waves sharing a row are drawn thicker, since photons in step and in the same place would otherwise be one line; the growing number of rows carries most of the claim and the thickness only helps.',
        'The mirrors are told apart by how solid they are drawn and by their names, and the whole sheaf leaves at one moment at the end rather than a little at each bounce.',
        'The crests are drawn at a spacing chosen so that lining up can be seen; it is not a length to be held against the spacing of the atoms.',
        'The three crossings take the same time as one another, so nothing about the light appears to speed up or slow down.',
        'It opens with the first wave already clear of the mirror.',
      ],
    },

    useWhen: [
      'The article has separated light given out on its own from light called out by other light, and the second kind needs to be a single visible event: the atom goes hollow and a new wave grows from exactly that spot.',
      'The point is what "in step" actually means. The crests of every wave line up in a column right across the sheaf, and that is what leaves through the mirror at the end.',
      'The article needs the growth to be a runaway rather than a steady gain. Each crossing produces more new waves than the one before it, and the band empties of excited atoms as it goes.',
      'The reader wants to know what the mirrors are for. The waves are folded back and sent through the same atoms again, and it takes three passes before anything leaves.',
    ],

    avoidWhen: [
      'The subject is the levels inside one atom, the size of the jump, or the energy of a single photon. No ladder of levels is drawn.',
      'The point is how the atoms are raised in the first place — a discharge, a flash lamp, or the pumping scheme of a particular laser.',
      'The subject is absorption, or how ground-state atoms eat into the gain. What is drawn is the growing.',
      'The article is about the beam after it leaves: how tightly it can be focused, how far it travels without spreading, or how much power it carries.',
      'The subject is a pattern of bright and dark from two beams meeting, or light treated as rays striking a surface.',
      'The figures wanted are the number of photons, the gain per pass, or the threshold condition. Only the wavelength is written.',
    ],

    contrastWith: [
      {
        concept: 'photoelectric-effect',
        note: 'One is about light being made in step with light that is already there; the other about light arriving at a metal and what a single quantum of it can knock loose.',
      },
      {
        concept: 'thermal-radiation',
        note: 'One is light given out because a body is hot, spread over many wavelengths and going every way; the other light called out at one wavelength and one direction by light already travelling that way.',
      },
      {
        concept: 'standing-wave',
        note: 'Both have waves shuttling between two reflecting ends, but one is about a pattern that has stopped travelling, while the other is about the number of travelling waves growing on every pass.',
      },
      {
        concept: 'superposition',
        note: 'One asks what two waves add up to where they overlap; the other asks how a second wave came to exist at all, made to match the first in direction, spacing and timing.',
      },
      {
        concept: 'chain-reaction',
        note: 'Both are about one event bringing about further ones until a population is used up, but what is passed on is light in one case and neutrons in the other, and only the light carries a phase to be kept.',
      },
    ],
  },
};
