/**
 * pauli-exclusion 개념 선언.
 *
 * 원자 다섯 가운데 **자리 나눠 갖기의 규칙** 이다.
 *   hydrogen-spectrum       낙차가 띠의 몇 자리에만 쌓인다
 *   bohr-model              궤도와 건너뜀
 *   atomic-orbital          한 상태의 모양
 *   pauli-exclusion         상태는 (준위, 스핀) 한 쌍 — **같은 자리에 둘이 못 들어가** 위층으로 밀린다
 *   electron-configuration  그 자리들이 **어느 순서로** 차는가, 그것이 표의 모양
 * 이쪽만 「준위마다 자리 둘 · 아래부터 차고 다음은 위층 · 남은 빈자리」 어휘를 갖는다.
 * 스핀이 두 값이라는 것은 전제로 쓴다 — 그 전제를 다투는 것은 `spin` 의 몫이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const pauliExclusionConcept: Aperi21ConceptSource = {
  id: 'pauli-exclusion',
  label: 'Pauli Exclusion Principle',
  canonicalSim: 'aperi21:pauli-exclusion',

  surface: {
    definition:
      'The rule that no two electrons may occupy one and the same state: a level offers two seats, one per spin direction, so electrons added one by one fill from the bottom and the rest are pushed higher.',
    exemplarKeywords: [
      'Pauli exclusion principle',
      'two electrons per orbital',
      'no two electrons in the same quantum state',
      'why do electrons not all fall to the lowest level',
      'paired spins up and down',
      'filling levels from the bottom up',
      'occupancy of energy levels',
      'why matter takes up space',
      'arrows in boxes diagram',
      'fermions cannot share a state',
      'one seat each',
    ],
  },

  briefing: {
    observable: [
      'Four level lines stand one above the other at even spacings, with an upward axis of energy at the left.',
      'Each level line carries two empty boxes set into it — one on the left of centre, one on the right — so the boxes form two vertical columns, a left column and a right column.',
      'At the right a queue of arrows waits under a heading. The arrows point up and down in turn, and there are more of them than will be needed to fill the bottom levels.',
      'They come in one at a time. Each rises out of the queue, crosses over above the levels, and then comes straight down its own column — up-pointing ones down the left column, down-pointing ones down the right — until it reaches a box.',
      'The first settles into the bottom box of the left column, the second into the bottom box of the right column, so the lowest level is full.',
      'The third points up and so comes down the left column, but it does not reach the bottom: it stops one level higher, directly above the first, and the picture then holds still for a while.',
      'The ones after it fill in the same way, each stopping at the lowest box in its own column that is still empty, and passing straight by the empty boxes higher up on the way.',
      'When the queue is exhausted, the bottom three levels each hold two arrows pointing opposite ways, and the top level holds a single up-pointing arrow with the box beside it left empty.',
      'The queue and its heading are then gone, and the arrangement stands for a while before the seated arrows fade, the queue fills again, and the whole filling starts over.',
      'No energy value, no level numbering and no count of arrows is written anywhere; the arrows are distinguished only by which way they point.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The filling runs on a fixed round and repeats.',
        'The states are laid out as a grid — level upward, spin left or right — so that "the same state" is a single box that either has something in it or does not.',
        'An arrow comes down its own column, which puts same-spin electrons in one vertical line, and the third one stopping directly above the first is what says it could not join the one below.',
        'The path in is a single curve that straightens out near the end, so the arrow is seen descending past the boxes it is not allowed into and stopping at the one it is.',
        'The third arrival is followed by a deliberate pause, because that is the moment the rule does something, and it would otherwise pass in the same rhythm as the rest.',
        'The arrows arrive with their directions already alternating, which is what lets the reader tell where one is headed while it is still on its way.',
        'Spin is carried by which way an arrow points and by nothing else — no colour and no second marker is used for it.',
        'More electrons are sent in than fill the levels evenly, so the final picture has a seat still free at the top while everything below is packed, which rules out the reading that they simply ran out.',
        'The levels are drawn evenly spaced and unnumbered, since what is being shown is how seats are taken and not which atom this is.',
        'It opens with the first arrow already seated and the second on its way down.',
      ],
    },

    useWhen: [
      'The article has stated that no two electrons share a state and the reader needs to see what that forbids. The third one comes down past an occupied level and settles one step higher instead.',
      'The point is why electrons do not all collect at the bottom. They arrive one at a time and each takes the lowest place still open, which is not always the lowest place there is.',
      'The article needs a state to be more than an energy — the pairing of level with spin. Every level here offers exactly two boxes and they are told apart only by which way the arrow in them points.',
      'The reader should see that the filling is not merely a matter of running out of room. The finished arrangement still has a free seat at the top while everything beneath it is full.',
    ],

    avoidWhen: [
      'The subject is the order in which subshells of a real atom are taken, the shape of the periodic table, or names like 1s and 2p. The levels here are a plain evenly spaced set with no labels.',
      'The point is what spin itself is, that measuring one axis unsettles another, or why there are exactly two directions. Two directions are taken here as a starting assumption.',
      'The article is about particles that do crowd into one state together, or about what happens when a great many of them do.',
      'The subject is the shape of a state, where an electron is likely to be found, or a cloud of any sort. Nothing here is drawn but boxes and arrows.',
      'The article needs level energies, a total energy, a count of electrons, or a temperature. Nothing on screen is numbered.',
      'The point is light given out as an electron drops from one level to another, or how an atom is excited. The arrows here only arrive and settle.',
      'The article turns on the reason behind the rule — on antisymmetry, on exchange, or on what makes a particle a fermion. Only the rule\'s consequence is drawn.',
    ],

    contrastWith: [
      {
        concept: 'electron-configuration',
        note: 'One is the rule that a state takes only one occupant, shown on a bare ladder; the other takes that rule for granted and follows the order in which real atoms\' subshells are taken up, to the point where the periodic table\'s shape falls out.',
      },
      {
        concept: 'atomic-orbital',
        note: 'One never draws what a state looks like and only counts how many may occupy it; the other takes a single occupied state and shows the form it has.',
      },
      {
        concept: 'spin',
        note: 'One uses two spin directions as a premise, needing only that there are two; the other interrogates spin itself and shows that it behaves like nothing that spins.',
      },
      {
        concept: 'particle-in-a-box',
        note: 'One asks where the ladder of levels comes from and how its rungs are spaced; the other takes a ladder as given and asks how many may stand on each rung.',
      },
      {
        concept: 'maxwell-boltzmann-distribution',
        note: 'Both describe how many occupy which energy, but one has particles free to share any state and spread by chance, while the other forbids sharing outright and fills strictly from the bottom.',
      },
    ],
  },
};
