/**
 * de-broglie-wavelength 개념 선언.
 *
 * 물질파 셋 가운데 **재는 쪽**이다. 셋은 주장으로 갈랐다.
 *   de-broglie-wavelength      물결 간격이 **속력에 달렸다** — 두 배 빠르면 절반
 *   electron-diffraction       그 물결이 **고리로 보인다** — 빠르게 하면 고리가 좁아진다
 *   double-slit-with-electrons 알갱이가 **하나씩 도착해 무늬로 쌓인다**
 * 이쪽만 λ 치수선 · 속도 · 비(두 배 → 절반) 어휘를 갖는다. 슬릿 · 스크린 · 도착 점이 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const deBroglieWavelengthConcept: Aperi21ConceptSource = {
  id: 'de-broglie-wavelength',
  label: 'de Broglie Wavelength',
  canonicalSim: 'aperi21:de-broglie-wavelength',

  surface: {
    definition:
      'The wave spacing that belongs to a moving particle and what sets it: the same electron sent twice as fast carries waves packed half as far apart.',
    exemplarKeywords: [
      'de Broglie wavelength',
      'matter waves',
      'lambda equals h over p',
      'does an electron have a wavelength',
      'the wavelength of a moving particle',
      'faster particles have shorter wavelengths',
      'momentum sets the wavelength',
      'de Broglie relation',
      'every moving thing has a wave associated with it',
      'a wave packet travelling along with an electron',
    ],
  },

  briefing: {
    observable: [
      'Two identical electrons fly along two lanes, one above the other, each carrying a train of waves centred on itself. Everything about the two is the same — size, mark, wave height, the spread of the train — except how fast they go.',
      'At the start the two trains are identical. Dashed guides dropped from each crest of the upper train land on a crest of the lower one too, one for one.',
      'A bar marked with the wavelength symbol is drawn across one span of the upper train, and another across the lower one.',
      'The lower electron alone is then pushed steadily faster. An arrow beside it lengthens, the ruling of its lane streams past more quickly, and in the same moment its waves crowd together — its crests pull away from the guides and gather toward the middle.',
      'When the pushing is done, the lower arrow is marked as twice the upper one, and the lower train now has a crest on every guide and one more between each pair.',
      'Directly beneath the single upper span, two shorter spans are laid end to end and marked as half the wavelength, so the halving is counted in spans rather than read from a number.',
      'The electrons stay at the middle of the picture while the lane rulings stream backwards past them, so the waves hold still long enough to be measured and the speed is read from the streaming and the arrow.',
      'No distance is given anywhere — nothing on screen says how long a span is in metres or nanometres, only how one compares with the other.',
      'The picture then fades back to the two electrons flying alike and the whole thing happens again.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The two fly alike, one is sped up, the result is measured, and the round repeats.',
        'The upper electron is never touched, so it stands as a fixed reference and "shorter than before" is a comparison between two things on screen rather than between now and a moment ago.',
        'The change is made at one fixed ratio rather than being adjustable, which is what keeps the crests landing exactly on the guides at the end and lets the result be counted instead of estimated.',
        'The dashed guides are pinned to the crests of the untouched train, so they serve as the ruler; no distance grid is drawn, because what is being counted is waves and not length.',
        'The marked spans and the speed labels appear only while the speeds are at their settled values, and are taken away while the speeding-up is under way.',
        'The waves ride along with the electron rather than travelling through it, so a crest stays a crest and the guides stay meaningful.',
        'The view travels with the electrons, which is why they hold the middle of the picture while the lane markings move.',
        'It opens with both already in flight.',
      ],
    },

    useWhen: [
      'The article has written down that a particle has a wavelength and the reader needs the one thing that fixes it. Speed is varied by a clean factor and the spacing answers by exactly the reciprocal factor, counted in spans.',
      'The point is that the relation is an inverse one rather than merely "it changes". The finished picture shows two lower waves fitting into one upper wave, which is a claim the prose can state as a ratio.',
    ],

    avoidWhen: [
      'The article needs evidence that matter really does behave as a wave. Nothing here is diffracted or interferes — the wave is drawn on the electron as a given and only its spacing is at issue.',
      'The subject is why everyday objects show no wave behaviour, or a comparison between an electron and a thrown ball. Mass is never varied here; both particles are the same and only the speed differs.',
      'The figures wanted are the actual wavelength of an electron at a given voltage, or how that compares with atomic spacing. No scale is given and no number is written.',
      'The subject is the wavelength of light, of a photon, or of a wave running through a medium.',
      'The point turns on a packet spreading as it travels, on how fast the waves themselves move, or on the several wavelengths mixed into a short packet. The train here rides with the electron unchanged.',
    ],

    contrastWith: [
      {
        concept: 'electron-diffraction',
        note: 'One assigns the wavelength and measures how speed sets it; the other never measures a wavelength and instead shows the pattern it produces, which is what makes the assignment believable.',
      },
      {
        concept: 'double-slit-with-electrons',
        note: 'One treats the electron as a wave throughout and asks what fixes its spacing; the other keeps the electron arriving as a whole particle and asks where the wave shows up at all.',
      },
      {
        concept: 'uncertainty-principle',
        note: 'One gives a single sharp wavelength to a particle of a definite speed; the other is about what happens when position is pinned down instead, so that no single wavelength is left.',
      },
      {
        concept: 'wave-speed-in-medium',
        note: 'One is about a wave belonging to a particle, where going faster shortens the spacing; the other is about a wave carried by a substance, where what the substance is fixes the speed.',
      },
    ],
  },
};
