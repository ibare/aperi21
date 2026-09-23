/**
 * nuclear-structure 개념 선언.
 *
 * 핵 둘 가운데 **이름 쪽**이다.
 *   nuclear-structure     알갱이의 **수**가 무엇을 정하는가 — 양성자 수가 원소를, 중성자 수가
 *                         같은 원소 안의 동위원소를 가른다. 질량수가 같아도 Z 가 다르면 딴 원소다
 *   binding-energy-curve  같은 핵을 놓고 **얼마나 단단히 묶였나**를 묻는다 — 핵자당 결합 에너지가
 *                         철에서 꼭대기라 양쪽에서 그리로 오른다
 * 이쪽만 ᴬ_Z X 표기 · 원소 이름 · 동위원소 어휘를 갖는다. 에너지 · 안정성 · 붕괴는 여기 없고,
 * 저쪽에는 원소의 이름이 걸린 자리가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const nuclearStructureConcept: Aperi21ConceptSource = {
  id: 'nuclear-structure',
  label: 'Protons, Neutrons and What Names a Nuclide',
  canonicalSim: 'aperi21:nuclear-structure',

  surface: {
    definition:
      'What decides which element a nucleus is: adding neutrons leaves the name alone and only raises the mass number, while turning one neutron into a proton makes it a different element.',
    exemplarKeywords: [
      'protons and neutrons in the nucleus',
      'atomic number and mass number',
      'what are isotopes',
      'nuclide notation',
      'why is carbon-14 still carbon',
      'what makes an element that element',
      'same mass number but a different element',
      'reading the superscript and subscript on a symbol',
      'counting nucleons',
      'carbon-12 and carbon-14',
      'the number of protons fixes the name',
    ],
  },

  briefing: {
    observable: [
      'Three places are set out left to right and are filled one after another, so that at the end three nuclei stand together.',
      'The leftmost holds a nucleus of six circles bearing a plus mark and six plain grey ones, with its symbol above it carrying a figure at each shoulder, and its name written below.',
      'A copy of it moves to the middle place, and two grey particles fly in from outside and settle on its rim. At the moment they arrive the writing above changes: the upper figure goes from twelve to fourteen, and the letter stands unchanged.',
      'A bracket is then drawn under the first two with a note saying the proton count is the same, so the element is the same.',
      'A copy moves on to the third place, and there one grey particle already on the rim turns, where it sits, into one bearing a plus mark.',
      'When that change finishes, the writing above it changes too: the lower figure goes from six to seven, the letter changes, and the name below becomes a different element. The upper figure stays at fourteen throughout.',
      'A second bracket is drawn under the last two saying the mass number is the same but the proton count is not, so the element is not.',
      'A ring marks out exactly what changed at each step — the two that arrived in the middle nucleus, the single one that turned in the third.',
      'At the end the plus marks can be counted on each of the three: six, six and seven.',
      'The particles tremble slightly in place, and nothing leaves any of the nuclei.',
      'The only writing is the three symbols with their two figures, the three names, and the two bracket notes.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The three nuclei are built one after another on their own and the round repeats.',
        'All three stay on screen at the end, so the two comparisons — same name, different name — can be read at one moment rather than remembered.',
        'The two kinds of particle are told apart by a plus mark as well as by shade, so the difference does not rest on colour alone.',
        'The ring is used for one thing only: whatever came in or changed at this step, so nothing has to be counted to find what is new.',
        'Particles are added at the rim in an order that leaves the earlier ones where they were, which is what lets "two more places" and "one place changed kind" read as different moves.',
        'The third step is made as a change in place rather than as a removal followed by an addition, so the mass number never dips to thirteen on the way and a third name never briefly stands.',
        'The inner particles are drawn over the outer ones, so every plus mark can be counted on each nucleus.',
        'The writing above a nucleus changes only when its change has finished, not gradually as it happens.',
        'No electrons are drawn, since putting them in would leave open a reading in which their number is what names the element.',
        'It opens with the leftmost nucleus alone in place.',
      ],
    },

    useWhen: [
      'The article has put up the symbol with a figure at each shoulder and the reader needs each figure tied to something that can actually be counted on the page.',
      'The point is that isotopes are the same element. Two particles are added and the name and letter do not move; only the upper figure does.',
      'The point is that the mass number is not what names anything. The third nucleus keeps the same mass number and gets a different name anyway.',
      'The reader is confusing "heavier" with "different substance", and needs the two changes set side by side as different kinds of change.',
    ],

    avoidWhen: [
      'The subject is why a nucleus is unstable, how long it lasts, or what comes out of it. Nothing leaves these nuclei.',
      'The article turns on how tightly a nucleus is bound or where nuclear energy comes from.',
      'The subject is electrons, ions, chemical bonding or the periodic table as a whole.',
      'The article is about a nucleus breaking in two or two nuclei joining.',
      'The figures wanted are masses in atomic mass units, nuclear radii, or the proportions of isotopes in a sample.',
      'The subject is a nucleus that changes into another by a process with a name, rather than the bare fact that changing a proton count changes the element.',
    ],

    contrastWith: [
      {
        concept: 'binding-energy-curve',
        note: 'One asks what the counts of the two kinds of particle make a nucleus called; the other takes the counts as given and asks how tightly that particular nucleus is held together.',
      },
      {
        concept: 'radioactive-decay',
        note: 'One is about what a nucleus is named, for nuclei that stay as they are; the other says nothing about names and everything about how fast a crowd of unstable ones thins out.',
      },
      {
        concept: 'decay-types',
        note: 'One counts what is inside a nucleus; the other follows what has already left one and asks how far it gets through matter.',
      },
      {
        concept: 'nuclear-fission',
        note: 'One changes a nucleus by one particle at a time and watches its name; the other breaks one nucleus into two large pieces and watches the particle count balance.',
      },
      {
        concept: 'stellar-nucleosynthesis',
        note: 'One is about what a given set of particles is called; the other about where in a star heavier sets get assembled in the first place.',
      },
    ],
  },
};
