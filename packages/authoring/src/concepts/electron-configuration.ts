/**
 * electron-configuration 개념 선언.
 *
 * 원자 다섯 가운데 **채우는 순서와 그 결과인 표의 모양** 이다.
 *   hydrogen-spectrum       낙차가 띠의 몇 자리에만 쌓인다
 *   bohr-model              궤도와 건너뜀
 *   atomic-orbital          한 상태의 모양
 *   pauli-exclusion         한 자리에 하나 — 그래서 위층으로 밀린다 (규칙)
 *   electron-configuration  그 자리들이 **어느 순서로** 차는가 — 줄 길이 · 빈 가운데 · 블록 (결과)
 * 이쪽만 「원소 칸 · 부껍질 · 쌓음 순서 · 주기율표의 모양」 어휘를 갖는다.
 * 준위선 · 상자 · 스핀 화살표 · 구름은 두지 않는다 — 이웃 둘의 것이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const electronConfigurationConcept: Aperi21ConceptSource = {
  id: 'electron-configuration',
  label: 'Electron Configuration and the Shape of the Periodic Table',
  canonicalSim: 'aperi21:electron-configuration',

  surface: {
    definition:
      'The order in which electrons take up subshells as atomic number rises — 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p — and how that order accounts for the row lengths and blocks of the periodic table.',
    exemplarKeywords: [
      'electron configuration',
      'aufbau principle',
      'filling order of subshells',
      'why is 4s filled before 3d',
      'why does the periodic table have that shape',
      'why are the first rows short and the fourth long',
      's block p block d block',
      'transition metals in the middle',
      'periods and groups',
      'building up the elements one proton at a time',
      'shells closing at 2 8 8',
    ],
  },

  briefing: {
    observable: [
      'An empty grid of element places stands ready, eighteen across and four rows deep, with the rows numbered at the left.',
      'Places light up one at a time in order of atomic number, each showing its number and its chemical symbol.',
      'Before a subshell starts to fill, a bracket appears beneath the row spanning exactly the places that subshell will take — two wide, or six wide, or ten wide — with its name beside it.',
      'That name is dark and prominent while the subshell is filling and goes pale once it is done, and the places light up inside the bracket from its left end.',
      'A coloured marker sits on whichever place is being added and slides across to the next one as it lights up.',
      'The marker jumps clear across the empty middle of the grid when the second row moves from its left pair to its right group of six, and the same happens in the third row.',
      'When a row is finished, the marker travels from the far right of that row all the way to the far left of the next one down.',
      'After three rows the whole middle of the grid, ten places wide, is still empty.',
      'The fourth row begins with two places at the far left, and only then does a bracket ten places wide appear beneath the previously empty middle, and those ten fill in — directly below the gap that the row above left open.',
      'The last places of that row fill at the right-hand end, completing the grid.',
      'Brackets and names for the three blocks then rise above the finished grid, the marker withdraws, and after a pause everything clears and the filling starts again.',
      'The first element\'s place is at the far left and the second element\'s at the far right, following the usual table.',
      'No electron is drawn anywhere, no energies are given, and no configuration is written out in symbols.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The filling runs on a fixed round and repeats.',
        'Adding an electron and adding an element are drawn as one event — a place lighting up — rather than as an electron being sent somewhere, so the order of filling and the order of the elements are never two separate things.',
        'The bracket for a subshell appears at its full width before any of its places fill, so how many seats it has is read off the picture rather than counted afterwards.',
        'The width of a bracket is the width that subshell takes in its row, and the brackets stacked down the rows are what the blocks at the end are made of.',
        'The marker\'s journey is what carries the argument in the awkward places: it leaps over the empty middle, and it travels from the end of one row to the start of the next, so the reader sees why a row ends where it does.',
        'The elements shown run only as far as the row in which the middle first fills, because a shorter table would never answer why the middle was empty and a longer one only repeats the same pattern.',
        'Blocks are distinguished by where their places sit and by the brackets above them, never by colouring the places differently.',
        'The colour set aside for the element now being added is used for the marker and for nothing else.',
        'It opens with the first row already closed and the second row\'s six-wide bracket filling.',
      ],
    },

    useWhen: [
      'The article has shown the periodic table and the reader wants to know why it has that outline. The places light up in filling order and the outline is what is left when they are all lit.',
      'The point is the empty middle of the early rows. Three rows close with that middle bare, and only afterwards does a ten-wide bracket appear beneath it and fill.',
      'The article needs the filling order to be seen rather than recited, including the place where it stops being obvious. The fourth row takes two places at its far left before the middle is touched at all.',
      'The reader should see where the lengths two, eight, eight and eighteen come from. Each bracket is drawn at its own width first, and the row is the brackets laid end to end.',
    ],

    avoidWhen: [
      'The subject is the rule limiting how many electrons a state may hold, or the pairing of opposite spins in one level. Here the seat counts are taken as given and no electron or spin is drawn.',
      'The point is the shape or extent of a particular orbital, or where an electron is likely to be found.',
      'The article needs configurations written out, superscripts, or the irregular cases such as chromium and copper. No configuration is written on screen and the places are drawn in their regular order.',
      'The subject is chemical behaviour, valence, bonding, or trends such as size and ionisation energy. Only the order of filling is shown.',
      'The article is about energy levels having values, a ladder drawn to scale, or how close the subshells lie in energy. No energy axis is drawn.',
      'The point is light given out or taken in by an atom, or a spectrum.',
      'The article needs elements beyond the row where the middle first fills, the f block, or the lanthanides and actinides.',
    ],

    contrastWith: [
      {
        concept: 'pauli-exclusion',
        note: 'One is the rule that a state holds one occupant, shown on a bare ladder of levels; the other assumes it and follows which subshells get taken in which order, until the table\'s outline is the answer.',
      },
      {
        concept: 'atomic-orbital',
        note: 'One shows what a single state looks like when it is measured over and over; the other never draws a state at all and is entirely about the sequence in which states are occupied.',
      },
      {
        concept: 'bohr-model',
        note: 'One follows the single electron of the simplest atom between permitted orbits; the other walks up through many-electron atoms and cares only about which seats are taken next.',
      },
      {
        concept: 'hydrogen-spectrum',
        note: 'Both concern what the arrangement of levels in an atom accounts for, but one accounts for the light a single element sends out and the other for the layout of the table of all of them.',
      },
    ],
  },
};
