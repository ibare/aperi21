/**
 * electron-diffraction 개념 선언.
 *
 * 물질파 셋 가운데 **증거 쪽**이다.
 *   de-broglie-wavelength      물결 간격이 속력에 달렸다 (λ 를 잰다)
 *   electron-diffraction       고리 무늬가 생기고, 빠르게 하면 **고리가 안쪽으로 움직인다**
 *   double-slit-with-electrons 알갱이가 하나씩 도착해 **쌓여** 무늬가 된다
 * 이쪽만 결정 · 고리 · 가속 전압 어휘를 갖는다. 점이 쌓이지 않고 잔광처럼 사라지므로
 * 무늬가 전압에 따라 **움직이는** 것이 이쪽의 동사다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const electronDiffractionConcept: Aperi21ConceptSource = {
  id: 'electron-diffraction',
  label: 'Electron Diffraction Through a Crystal',
  canonicalSim: 'aperi21:electron-diffraction',

  surface: {
    definition:
      'What a beam of electrons does after crossing a thin crystal film: it arrives on the screen beyond in concentric rings, and those rings close inward as the electrons are accelerated harder.',
    exemplarKeywords: [
      'electron diffraction',
      'Davisson and Germer',
      'the electron diffraction tube',
      'rings on a fluorescent screen',
      'electrons fired through a graphite film',
      'proof that electrons behave like waves',
      'crystal planes acting as a grating for electrons',
      'accelerating voltage changes the ring size',
      'how do we know matter has a wavelength',
      'a diffraction pattern made by particles rather than light',
    ],
  },

  briefing: {
    observable: [
      'The left half is a side view: an electron gun with its accelerating voltage written above it, dots streaming away from it through the beam, and a thin film standing in their path.',
      'From the film, four spreading lines and the straight-ahead beam run out to a screen seen edge-on.',
      'The right half is that same screen seen face-on, joined to the edge-on one by dotted lines at top and bottom so the two heights match.',
      'On the dark disc of the screen, electrons land one at a time as small points that glow briefly and then fade. Taken together they draw a spot at the centre and two rings around it.',
      'Where the arrivals crowd, their glows add and the ring is brighter; between the rings the disc is nearly dark.',
      'The voltage then climbs steadily. The dots in the beam travel faster, the spreading lines from the film close in, and new arrivals land further inward while the outer ones fade away — the rings themselves move inward.',
      'Dotted circles are left standing where the rings had been, so the movement is measured against where they started.',
      'At the top voltage both rings stand well inside the inner dotted circle, and the outer dotted circle has nothing on it.',
      'The voltage then comes back down, the rings widen out again, and the round runs on into the next without a break.',
      'The arrivals never pile up — what is on the screen at any moment is only the most recent ones, which is why the pattern can move rather than only grow.',
      'A line of writing below names what is happening as the voltage goes up and comes down.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The voltage rises and falls on a fixed round and the rings answer.',
        'Each arrival fades after a moment instead of being kept, so the pattern always shows the present voltage and can travel inward rather than smearing.',
        'The dotted circles are left at the starting positions as a standing ruler, so "further in than before" is read off the picture instead of remembered.',
        'The side view and the face-on view are drawn to the same vertical scale and joined by lines, so where a spreading line meets the screen is the radius of a ring.',
        'The raised voltage is set well above the starting one, far enough that the outer ring at the high setting is clearly inside the inner ring\'s old position and cannot be mistaken for it.',
        'The voltage is written only while it is steady at one of its two settled values, and is taken away while it is changing.',
        'The glow on the screen is drawn as light that adds where arrivals overlap, so the same picture reads as bright rings on a dark disc whether the page is light or dark.',
        'No wavelength, angle or radius is written anywhere, and no lattice of atoms is drawn — only the beam, the film and what reaches the screen.',
        'It opens with the beam already running and the rings already glowing.',
      ],
    },

    useWhen: [
      'The article has asserted that matter has a wavelength and now needs the observation that forced the claim. Particles are fired at a crystal and come out in rings, which is what waves do and what a hail of pellets does not.',
      'The point is that the pattern answers to how fast the electrons are going. Raising the voltage pulls the rings inward while the reader watches, and the starting positions stay on screen to be measured against.',
      'The article is about crystal planes acting on a beam the way a grating acts on light, and needs the resulting pattern to be circles rather than a row of spots.',
    ],

    avoidWhen: [
      'The subject is a pattern built up one arrival at a time, or the surprise that single particles accumulate into fringes. Arrivals here fade after a moment and never pile up.',
      'The point turns on measuring a wavelength, on the spacing between crystal planes, or on the Bragg angle. No wavelength is drawn, no angle is marked, no lattice of atoms appears.',
      'The article needs the relation between speed and wavelength stated as a ratio. Only its consequence is on screen — the radius of a ring — and no numbers are given for either.',
      'The subject is light through a grating, through two slits or through one, or the colours such gratings produce.',
      'The article is about why the pattern is rings rather than spots, that is, about the crystal being made of many small grains in every orientation.',
      'The subject is how a fluorescent screen or an electron gun works as a piece of apparatus.',
    ],

    contrastWith: [
      {
        concept: 'de-broglie-wavelength',
        note: 'One assigns a wavelength to a moving particle and measures how speed sets it; the other never shows a wavelength and instead shows the pattern that makes the assignment credible.',
      },
      {
        concept: 'double-slit-with-electrons',
        note: 'Both put electrons through matter and look at what lands beyond, but one watches a pattern move as the beam is changed, while the other watches a pattern come into being out of separate arrivals.',
      },
      {
        concept: 'diffraction-grating',
        note: 'One sends light through many ruled openings and reads the orders it splits into; the other sends particles into a crystal whose planes do the same office, and the evidence is that particles do it at all.',
      },
      {
        concept: 'diffraction',
        note: 'One is a wave curling into the shadow past a single gap, which is where the behaviour is defined; the other is that same behaviour turning up where only particles were expected.',
      },
    ],
  },
};
