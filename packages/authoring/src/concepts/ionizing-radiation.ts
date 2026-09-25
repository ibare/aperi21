/**
 * ionizing-radiation 개념 선언.
 *
 * 광자 · 전자 셋의 갈림 — **무엇을 주장하는가**.
 *   photon-bond-threshold  광자 하나가 결합 **하나**를 끊기 시작하는 자리 — 스펙트럼을 훑는다
 *   photoelectric-effect   금속 표면에서 전자가 **나오느냐** — 세기 대 진동수
 *   ionizing-radiation     광자 하나가 떼어 낸 전자가 이온을 **수십 개** 남긴다 — 왜 따로 해로운가
 * 이쪽만 「이온 · 이온화 · 물 · 전자의 길 · 수십 개」 어휘를 갖는다. 스펙트럼 축 · 결합 · 금속판은 쓰지 않는다.
 *
 * 이웃 `decay-types` 와도 갈랐다 — 그쪽은 핵에서 나오는 셋이 무엇에 막히는지이고, 이쪽은 들어온
 * 광자 하나가 물속에 무엇을 남기는지다. 알파 · 베타 · 감마 · 차폐 어휘를 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const ionizingRadiationConcept: Aperi21ConceptSource = {
  id: 'ionizing-radiation',
  label: 'One Photon, Dozens of Ions',
  canonicalSim: 'aperi21:ionizing-radiation',

  surface: {
    definition:
      'Radiation whose photons carry enough energy to strip electrons from atoms and molecules: a photon below that threshold leaves no ion at all, while an X-ray photon frees one electron that goes on to ionize dozens of molecules along its path.',
    exemplarKeywords: [
      'ionizing radiation',
      'why are X-rays more harmful than ultraviolet',
      'what does ionizing mean',
      'one X-ray photon makes many ions',
      'the electron knocked out goes on to ionize more molecules',
      'ionization energy of water',
      'why a single high-energy photon can do so much damage',
      'ionizing versus non-ionizing radiation',
      'a trail of ions left by a fast electron',
      'energy needed to make one ion in water',
    ],
  },

  briefing: {
    observable: [
      'Small faint dots, water molecules, are scattered evenly over a wide panel, and a label in the upper left gives the energy needed to ionize one water molecule in electronvolts.',
      'First an ultraviolet photon comes in from the left as a loose packet of ripples labelled with its energy, a few electronvolts below that threshold; it reaches one molecule and is gone, and nothing on the panel changes — not a single plus sign appears.',
      'Then an X-ray photon comes in, its ripples packed far tighter, labelled one kilo-electronvolt; where it reaches a molecule the photon vanishes, that molecule gets a plus sign, and a solid dot marked e⁻ sits beside it.',
      'The electron sets off in a zigzag, drawing a line behind it, and every so often a molecule on its path gets a plus sign of its own, one after another.',
      'Its steps grow shorter and its turns sharper as it goes, so the plus signs crowd closer together towards the end of the trail.',
      'When the electron stops, the whole trail is lined with plus signs — as many as the caption states — all from the one X-ray photon.',
      'The ions stay the same faint dots as every other molecule; only the plus sign says which have lost an electron.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. Each round sends the ultraviolet photon first, briefly, as the contrast, and then spends most of its time on the X-ray photon and the electron it frees.',
        'It opens with the molecules already in place and the ultraviolet photon just starting in.',
        'The number of ions is set so that the first one, where the photon struck, is counted along with those on the trail, and the caption reads the same number the picture draws.',
        'The trail is fixed by a seed and is the same every round, so the count never changes from one showing to the next.',
        'The ripple spacing is squeezed, since the true wavelengths differ a thousandfold; it says only which photon is the more energetic, and the energy is read off the labels.',
        'No length scale is shown; the real trail of such an electron in water is a few tens of nanometres long.',
      ],
    },

    useWhen: [
      'The article has defined ionizing radiation as radiation energetic enough to strip electrons, and the reader needs to see what that looks like and why it is worse than merely being above a threshold.',
      'The reader asks why an X-ray is dangerous when ultraviolet from the same kind of lamp is not ionizing; one photon leaving no ions beside one photon leaving dozens is the answer.',
      'The article explains that radiation damage comes from ions and the chemistry they start, and needs a picture of how many ions a single photon can leave.',
      'The reader imagines one photon doing one thing; the trail shows the energy being spent again and again by the electron it frees.',
    ],

    avoidWhen: [
      'The subject is where on the spectrum photons begin to break chemical bonds, or why sunlight burns; that is the bond threshold, not ionization.',
      'The subject is what comes out of unstable nuclei, how alpha, beta and gamma are stopped, or how quickly a source runs down.',
      'The article is about dose, exposure limits, the units these are measured in, or how living tissue repairs itself.',
      'The point is electrons being freed from a metal surface by light, or how intensity and frequency each affect that.',
      'The article needs the true scale of an electron track, or the separate part played by the slower electrons each ionization frees; the picture puts every ion on the one trail.',
    ],

    contrastWith: [
      {
        concept: 'photon-bond-threshold',
        note: 'Both set a photon’s energy against a threshold; one sweeps the whole spectrum to find where a single photon starts to break a single bond, the other follows one far larger photon into water and counts the ions it leaves.',
      },
      {
        concept: 'photoelectric-effect',
        note: 'Both have a photon freeing an electron; one asks whether electrons leave a metal and what decides it, the other what that freed electron goes on to do inside matter.',
      },
      {
        concept: 'decay-types',
        note: 'Both concern radiation passing through matter, but one sorts the three kinds from a nucleus by what stops them, while the other shows what a single photon leaves behind in water.',
      },
      {
        concept: 'compton-scattering',
        note: 'Both follow a high-energy photon meeting an electron; one tracks the photon that bounces away, the other the electron that is freed and the ions it makes.',
      },
    ],
  },
};
