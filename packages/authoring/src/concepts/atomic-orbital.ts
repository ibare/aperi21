/**
 * atomic-orbital 개념 선언.
 *
 * 원자 다섯 가운데 **구름이 무엇인가** 다.
 *   hydrogen-spectrum       낙차가 띠의 몇 자리에만 쌓인다
 *   bohr-model              허용된 궤도와 건너뜀 — 전자가 길을 돈다
 *   atomic-orbital          **길이 아니다** — 잴 때마다 한 자리, 그 자리들이 쌓인 것이 구름이다
 *   pauli-exclusion         자리 나눠 갖기의 규칙
 *   electron-configuration  채우는 순서가 표의 모양이 된다
 * 이쪽만 「한 번의 측정 = 점 하나 · 쌓임이 곧 진하기 · 궤도마다 다른 모양」 어휘를 갖는다.
 * `wave-function` 과도 갈린다 — 저쪽은 부호와 제곱, 이쪽은 삼차원 구름의 모양이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const atomicOrbitalConcept: Aperi21ConceptSource = {
  id: 'atomic-orbital',
  label: 'Atomic Orbital as a Probability Cloud',
  canonicalSim: 'aperi21:atomic-orbital',

  surface: {
    definition:
      'What the cloud drawn around a nucleus stands for: each measurement finds the electron at one single place, and the cloud is the pile of many such places, its shape set by the state the electron is in.',
    exemplarKeywords: [
      'atomic orbital',
      'electron cloud',
      'probability density of an electron in an atom',
      'is the electron orbiting the nucleus',
      'dumbbell shaped p orbital',
      's p d orbital shapes',
      'where is the electron in an atom',
      'what does the orbital picture actually show',
      'the electron is not a tiny planet',
      'node plane through the nucleus',
      'shape of the electron distribution',
    ],
  },

  briefing: {
    observable: [
      'A nucleus sits at the centre and the rest of the picture starts out empty.',
      'Places begin to be found, one at a time and slowly at first. Each new one comes up marked out with a spreading ring and then settles into an ordinary mark like the rest.',
      'Each mark, once made, never moves again. Nothing travels between one and the next, and the places found in succession are nowhere near each other.',
      'The finding then gets faster and faster until marks are pouring in, and what was a scatter thickens into a definite form.',
      'The marks are see-through, so places hit often go dark simply by being piled on, and the shape is made of that piling rather than being outlined or shaded in.',
      'In the starting state two lobes build up on either side of the nucleus with a plane through the middle that stays all but bare, however long the piling goes on.',
      'The whole cloud rocks gently to and fro about an upright axis and is viewed slightly from above, and marks toward the front are drawn a little larger and darker than those behind, so the form reads as solid rather than flat.',
      'A sentence below changes as the pile grows — one wording while only a few places have been found, another while the form is still coming out, a third once it stands.',
      'Picking a different state empties everything and starts again from a single mark, and what builds up this time has a different form: one with no bare plane at all, or one with a ring around its middle.',
      'The finding eventually stops adding to the pile, and the form then simply stands.',
      'No count of measurements is given, no axes are drawn, and no outline is put around the cloud.',
    ],

    screen: {
      affordances: [
        'A row of three chips names the states that can be built up; it opens on the middle one, and the claim is complete without touching them.',
        'Pressing one empties the picture and starts the piling over from the beginning, so the reader can watch the one-at-a-time stage again and see that a different state piles into a different form.',
        'The first few seconds are deliberately slow, so that a measurement being one place — and the next one being somewhere else entirely — is seen before the flood makes it impossible to follow.',
        'A mark once made is never moved or removed, which is what says that the electron is not going anywhere between measurements.',
        'The colour set aside for a place just found is used for its ring and its mark and for nothing else, and how long it keeps that colour shortens as the finding speeds up, so the highlight never takes over the picture.',
        'Denseness is carried by overlap alone rather than by a scale of colours, so the piling and the darkness are the same fact.',
        'The rocking is a small sway about the upright rather than a full turn, because at some angles a full turn would bring the two lobes in line and hide the bare plane between them.',
        'Marks nearer the viewer are drawn slightly bigger and darker, which is the only depth cue; there is no perspective and there are no axes.',
        'Each state is scaled to fill the picture on its own, so their forms can be compared without their sizes getting in the way.',
        'It arrives with a few places already found rather than perfectly empty.',
      ],
    },

    useWhen: [
      'The article has shown a textbook orbital picture and the reader is taking it for the electron\'s path. Places appear one at a time, scattered, and never move; the familiar form only emerges after many of them.',
      'The point is that a distribution is a statement about many measurements and not about one electron at one moment. The first few findings are watched singly before the flood begins.',
      'The article needs the bare plane through the nucleus to be a real prediction rather than an artist\'s line. It stays empty while everything around it fills in, no matter how long the piling runs.',
      'The reader should see that the form belongs to the state and not to the atom in general. Choosing another state empties the picture and a different form builds up in its place.',
    ],

    avoidWhen: [
      'The subject is the electron on a definite orbit of a definite size, or moving from one such orbit to another. Nothing here travels and no path is drawn.',
      'The article is about the sign of an amplitude, about squaring one shape into another, or about lobes of opposite sign. Only the pile of found places is drawn, with no sign anywhere.',
      'The point is what a measurement leaves the state in, or that an immediate second reading repeats the first. Each finding here starts from the same prepared state and leaves it untouched.',
      'The subject is how the electrons of a many-electron atom share out the available states, or the order in which subshells are filled.',
      'The article needs the energy of a state, a radius in nanometres, a count of measurements, or the relative sizes of different orbitals. None of that is on screen and each form is scaled on its own.',
      'The point is light given out or taken in by the atom. Nothing is emitted here and nothing arrives.',
    ],

    contrastWith: [
      {
        concept: 'bohr-model',
        note: 'One keeps the electron on a ring of a definite radius and follows it around; the other exists to deny that there is any such path, replacing it with places found one measurement at a time.',
      },
      {
        concept: 'wave-function',
        note: 'One is about the step from a signed amplitude to a distribution and the squaring in between; the other never shows an amplitude at all and is only about the three-dimensional form that repeated findings pile into.',
      },
      {
        concept: 'measurement-collapse',
        note: 'One takes many independent readings on the same prepared state and cares about the collection; the other takes two readings on one particle and cares about what the first did to it.',
      },
      {
        concept: 'pauli-exclusion',
        note: 'One asks what a single occupied state looks like when you keep measuring it; the other takes such states as given and asks how many electrons may share one and what happens to the rest.',
      },
      {
        concept: 'electron-configuration',
        note: 'One shows the shape belonging to a single state; the other never draws a shape and instead follows the order in which such states are occupied as atoms get heavier.',
      },
      {
        concept: 'uncertainty-principle',
        note: 'One is a picture of how spread out an electron\'s place is in a particular state; the other is about the trade between that spread and the spread in its motion.',
      },
    ],
  },
};
