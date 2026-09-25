/**
 * photon-bond-threshold 개념 선언.
 *
 * 문턱 셋의 갈림 — **무엇을 주장하는가**.
 *   photoelectric-effect         금속에서 전자가 **나오느냐** — 빨강 대 보라, 밝기 대 색
 *   work-function-and-threshold  **어디서부터 · 얼마나** — 그래프 한 판의 문턱과 기울기
 *   photon-bond-threshold        스펙트럼 **전체 어디쯤부터 결합이 끊기는가** — 자외선의 문턱
 * 이쪽만 「스펙트럼 · 전파에서 X선까지 · 결합 · 끊어짐」 어휘를 갖는다.
 * 금속판 · 전자 · 저지 전압 · 일함수 · 기울기는 쓰지 않는다 — 화면에 없다.
 *
 * 옛 이름 ionizing-radiation 에서 옮겼다(2026-09-25). 그 판은 10 eV 를 「결합을 끊는 문턱」 이라
 * 했지만 그것은 이온화의 값이고 결합은 3~5 eV 다. 문턱을 결합 에너지로 바로잡으니 조각이 말하는
 * 것은 이온화가 아니라 **광자 하나가 결합 하나를 끊는 자리**가 되었다. 이온화 · 방사선은
 * `ionizing-radiation` 의 몫이라 여기서 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const photonBondThresholdConcept: Aperi21ConceptSource = {
  id: 'photon-bond-threshold',
  label: 'Where One Photon Carries Enough to Break a Bond',
  canonicalSim: 'aperi21:photon-bond-threshold',

  surface: {
    definition:
      'The place on the spectrum, early in the ultraviolet, where a single photon carries enough energy to break a chemical bond: past it one photon breaks one bond, and below it no quantity of photons ever will.',
    exemplarKeywords: [
      'why ultraviolet light breaks molecules and visible light does not',
      'ultraviolet damages skin but infrared only warms it',
      'sunburn from UV and not from a heat lamp',
      'is the radiation from a phone harmful',
      'a microwave oven cannot break molecules apart',
      'a few electronvolts is enough to break a bond',
      'energy carried by one photon across the whole spectrum',
      'a weak source cannot add up to a strong one',
      'one photon breaks one bond',
      'where on the spectrum photons start to break bonds',
    ],
  },

  briefing: {
    observable: [
      'An energy axis runs across the top, named as the energy of one photon, and it is logarithmic — it covers everything from a billionth of an electronvolt up to a hundred thousand of them in a single line.',
      'The bands are named underneath it in order — radio, microwave, infrared, visible, ultraviolet, X-ray — and three ticks above it are named at a milli-electronvolt, an electronvolt and a kilo-electronvolt.',
      'The visible band is a strikingly narrow slice, and it is the only part of the axis carrying actual colours of light, so the eye has one familiar foothold on a very long scale.',
      'A line in the strike colour stands just inside the ultraviolet band, a little past the violet end of the visible, named as the bond-breaking threshold with its value in electronvolts, and everything beyond it is washed in the same colour.',
      'A marker travels rightward along the axis band by band, and where it stands is the energy of the photons being fired at that moment.',
      'Below the axis a source fires photons at six two-atom molecules, each photon drawn as a short packet of ripples, the ripples closer together the further right the marker has got.',
      'In the radio band the photons pour out nine a second, and they keep landing through the microwave, infrared and visible bands and the first of the ultraviolet; every one of them simply arrives and is gone, and not one molecule changes.',
      'Once the marker crosses the threshold line the photons become scarce, a little more than one a second, and every single one that lands makes a bond line vanish and its two atoms drift apart, leaving a dotted trace where the bond was.',
      'Six photons break six bonds while the marker is still in the ultraviolet; by the time it reaches the X-ray band there is no bond left to break, and the caption says instead how far beyond a bond’s energy those photons lie.',
      'Only one figure is written anywhere on the picture, the threshold itself; the photon currently being fired is read off the marker’s place on the axis.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. One round sweeps the whole spectrum from radio to X-ray, so both sides of the threshold are seen without anything being chosen.',
        'It opens part way into the radio band, with photons already landing on molecules that are not moving.',
        'A photon below the threshold leaves no mark at all. The picture does not show a molecule wobbling in proportion to the energy it was handed — a single absorbed photon does not do that — so every band below the line looks the same: nothing happens.',
        'The spacing of the ripples is squeezed hard, since the true wavelengths span fourteen powers of ten; it says only that the packets tighten as the sweep climbs, and the energy itself is read off the axis.',
        'The axis has to be logarithmic for the same reason, and the band names sit below it while the numbered ticks sit above, because the visible band is too narrow to hold both.',
        'The strike colour is used for the threshold alone — the line, its name and the region past it — so nothing else on the picture competes for that meaning.',
        'Breaking is shown by the bond line going and the atoms parting, never by a change of colour, and a dotted trace is left so that twelve loose atoms still read as six broken molecules.',
        'The molecules are the simplest kind, two atoms and one bond, so that holding and breaking are the only two things that can be seen happening to them.',
      ],
    },

    useWhen: [
      'The reader wants to know whether a great deal of weak radiation can add up to what a little strong radiation does. Nine radio photons a second landing on molecules that never change is the answer.',
      'The article explains why ultraviolet in sunlight damages skin and eyes while visible light and infrared from the same Sun do not, and the dividing line needs to be a place on a scale rather than a matter of brightness.',
      'The relation between a photon’s energy and its frequency has been given, and the article needs the per-photon part of it to have a physical consequence.',
      'The reader thinks of the spectrum as a list of separate things with separate names; seeing it swept as one continuous axis with a single line drawn on it is the point.',
    ],

    avoidWhen: [
      'The subject is ionizing radiation — stripping electrons from atoms, X-rays and gamma rays in medicine, or why such radiation is especially harmful. This picture stops at breaking one bond per photon and says nothing about what a far larger photon does.',
      'The subject is what comes out of unstable nuclei and how those kinds differ, or how quickly a source runs down.',
      'The article is about dose, exposure limits, the units these are measured in, or how living tissue repairs itself.',
      'The point is electrons being freed from a metal by light, or how much energy they carry away when they leave.',
      'The subject is how radiation of a given band is produced or detected — aerials, lamps, tubes, sensors.',
      'The article needs the wavelength or frequency belonging to a band, or a conversion between the ways of writing it.',
      'The reader is meant to pick a band and see what it does. The sweep goes through all of them in one fixed order.',
      'The subject is what happens to a molecule short of breaking — the ways it can hold energy, or heating.',
    ],

    contrastWith: [
      {
        concept: 'photoelectric-effect',
        note: 'Both turn on one photon acting alone rather than many adding up; one asks whether an electron leaves a metal, the other where on the whole spectrum a bond begins to break.',
      },
      {
        concept: 'work-function-and-threshold',
        note: 'Both have a threshold energy that belongs to the material, but one measures how the energy left over grows past it, while the other only asks which side of it a given kind of radiation falls on.',
      },
      {
        concept: 'electromagnetic-wave',
        note: 'One is about what such radiation is and how it gets away from its source; the other takes the whole spectrum as given and sorts it by what one photon of it can do.',
      },
      {
        concept: 'compton-scattering',
        note: 'Both are about a single photon meeting matter, but one follows what the photon keeps after the encounter and the other only whether the thing it struck came apart.',
      },
      {
        concept: 'decay-types',
        note: 'Both sort radiation by what it does on its way through matter, but one sorts three kinds leaving a nucleus by the thickness of material that halts each, while the other sorts the whole spectrum by whether a single photon carries enough to break a bond.',
      },
    ],
  },
};
