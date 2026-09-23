/**
 * band-theory 개념 선언.
 *
 * 반도체 여섯의 첫 자리다. **무엇을 주장하는가**로 갈랐다.
 *   band-theory           **틈의 너비**가 도체 · 부도체 · 반도체를 가른다 — 같은 빛이
 *                         좁은 틈은 넘고 넓은 틈은 못 넘는다
 *   fermi-level           **어디까지 찼는가**와 그 경계가 데우면 무뎌지는 폭
 *   semiconductor-doping  **불순물**이 운반자를 만든다 — 틈을 넘지 않고도
 *   pn-junction           두 쪽을 맞붙인 **경계**에 공핍층과 내부 전기장이 생긴다
 *   diode-and-led         틈이 **문턱 전압과 빛의 색**을 정한다 — 바깥에서 잰 모양
 *   photovoltaic-effect   빛이 만든 쌍을 접합의 전기장이 갈라 **전압**이 생긴다
 * 이쪽만 도체 · 부도체 · 반도체의 구분 · 띠가 갈라짐 · 반쯤 찬 띠 · eV 로 잰 틈 어휘를
 * 갖는다. 불순물 · 페르미 준위 · 접합 · 문턱 전압은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const bandTheoryConcept: Aperi21ConceptSource = {
  id: 'band-theory',
  label: 'The Gap That Sorts Solids into Three Kinds',
  canonicalSim: 'aperi21:band-theory',

  surface: {
    definition:
      'What separates conductors, insulators and semiconductors: the width of the gap above the filled band, so that one and the same photon crosses the narrow gap and falls short of the wide one.',
    exemplarKeywords: [
      'energy bands in a solid',
      'band gap',
      'why is diamond an insulator and copper a conductor',
      'forbidden gap where no electron can sit',
      'a half filled band carries current',
      'levels splitting into bands as atoms come together',
      'a gap of one electronvolt against one of five',
      'the band above the filled one',
      'what makes a material a semiconductor at all',
      'light lifting an electron over the gap',
      'the empty place left behind in the filled band',
      'why a completely full band conducts nothing',
    ],
  },

  briefing: {
    observable: [
      'Three pictures stand on one baseline, named for the three kinds of solid, and they share a single vertical scale in electronvolts so that heights may be compared straight across.',
      'Each begins as one line of levels that splits apart into a band; the insulator’s upper band settles high above its filled one and the semiconductor’s settles low, and a dimension line with a figure in electronvolts appears in each gap.',
      'The conductor is drawn as a single band filled only halfway, with empty levels drawn as bare lines directly above the occupied ones.',
      'One field arrow of the same length and direction is then set over all three pictures.',
      'Only the conductor answers it — its topmost row of electrons drifts against the arrow — while the filled bands of the other two do not shift by a single dot.',
      'Light arrows of one identical length, in the accent colour, then grow from the top levels of the insulator and the semiconductor.',
      'In the semiconductor the arrow reaches into the upper band, the electron rises to it and then settles to the floor of that band, leaving a hollow ring in the place it left.',
      'In the insulator the arrow of the very same length ends halfway up the gap, thins into a dotted stub and stays there, and the electron has not moved.',
      'No electron is ever drawn standing inside a gap.',
      'Afterwards the semiconductor’s risen electron drifts one way through the upper band while the hollow ring steps the other way, one place at a time, each step made by a neighbouring electron crossing into it; the conductor keeps flowing and the insulator stays still.',
      'The flowing electrons wrap round at the edges of their band and fade as they do, so the crystal reads as continuing rather than ending.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The splitting, the field, the light and the flow run in a fixed order and the round repeats.',
        'The three pictures are held to one vertical scale, because the size of the gap is the claim and a height that meant different things in different pictures could not carry it.',
        'The bands themselves are given the same thickness in all three, so that only one thing differs between them.',
        'The conductor is drawn with one half-filled band and no band above it, since a gap is not what decides anything in its case.',
        'An empty level is shown simply as a line with no dot on it, rather than being marked as empty.',
        'The two light arrows are made identical in length on purpose, and the one that fails is left behind as a faint dotted stub rather than removed, so that the comparison survives the moment.',
        'The electron that fails to cross stays where it is instead of rising and falling back, because a gap is a place where no electron may be even briefly.',
        'The electron that does cross settles to the floor of the upper band, which is why it ends a little below where its arrow pointed.',
        'The hole advances only by a neighbouring electron crossing into its place, with a pause between steps, so that it reads as a vacancy moving rather than as a positive object sliding.',
        'Electrons run against the field arrow and the vacancy runs with it, which lets the vacancy behave as a positive carrier without being described as one.',
        'No scale, no axis and no material names are drawn; the gap figures and the shapes carry the whole account.',
      ],
    },

    useWhen: [
      'The article has named the three kinds of solid and the reader needs one criterion rather than three descriptions. Three pictures on one scale, differing in a single measurement, is that criterion made visible.',
      'The prose has to explain why a completely filled band is useless for conduction. The same field arrow standing over all three, with two of them not moving at all, is the place to point.',
      'The reader is meeting the idea that light can be too weak for a material regardless of how much of it arrives. Two arrows of identical length, one landing inside a band and one stopping in mid-gap, is that idea in one frame.',
    ],

    avoidWhen: [
      'The article is about impurities added to a material, about n-type and p-type, or about carriers that appear without the gap being crossed. Everything here is pure and the only way up is across the gap.',
      'The subject is how far up the levels the electrons reach, the sharpness of that boundary, or what warming does to it. Nothing here is drawn as an occupancy and no temperature is shown.',
      'The article turns on two materials joined together, on a layer at their boundary, or on a voltage applied across a device. Three separate materials are shown and nothing is joined or wired.',
      'The point is the voltage at which a component begins to pass current, or the colour of light it gives out. Light arrives here and nothing leaves.',
      'A conductivity, a drift speed or a resistance is to be worked out. The flowing speed on screen is a drawing convention and carries no figure.',
      'The article needs named materials, or the gap of some particular substance looked up. Only the figures appear, and no substance is named.',
    ],

    contrastWith: [
      {
        concept: 'fermi-level',
        note: 'One asks how wide the forbidden gap is and what that decides about a material; the other takes the levels as given and asks how far up they are filled and how sharp that boundary stays.',
      },
      {
        concept: 'semiconductor-doping',
        note: 'One says a semiconductor needs something to lift an electron over the gap; the other says an added impurity supplies a carrier without anything having to cross it.',
      },
      {
        concept: 'diode-and-led',
        note: 'Both measure a gap in electronvolts, but one uses it to sort materials by whether they conduct, and the other uses it to fix the voltage at which a device turns on and the colour of the light it then gives out.',
      },
      {
        concept: 'particle-in-a-box',
        note: 'One is about what happens to levels when countless atoms are brought together — they smear into bands with forbidden stretches between; the other is about a single confined particle and the discrete rungs that confinement alone produces.',
      },
      {
        concept: 'temperature-and-resistance',
        note: 'One accounts for the difference between materials in terms of a gap and never changes the temperature; the other keeps the material fixed and heats it, and reads the answer as a current getting larger or smaller.',
      },
    ],
  },
};
