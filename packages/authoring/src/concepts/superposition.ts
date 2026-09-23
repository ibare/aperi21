/**
 * superposition 개념 선언.
 *
 * 이 묶음에서 가장 위험한 셋 중 하나 — `constructive-destructive` · `interference` 와 섞으면
 * 셋 다 「파동이 겹치면 더해진다」 로 수렴한다. **주어와 주장을 갈랐다.**
 *   superposition             주어 = 한 번 **만났다 헤어지는 두 펄스**.
 *                             주장 = 겹치는 동안 점마다 더해지고, **지나간 뒤 서로를 바꾸지 않았다**
 *   constructive-destructive  주어 = **위상차**. 주장 = 그것이 합의 **크기**를 정한다 (2A ↔ 0)
 *   interference              주어 = **수면 위 자리**. 주장 = 파원 둘이 **제자리에 머무는 잠잠한 줄**을 만든다
 * 이쪽만 「통과한다 · 처음 모양 그대로 · 점마다」 어휘를 갖는다. 위상차 · 보강 · 상쇄 ·
 * 무늬 · 줄은 쓰지 않는다. 완전 상쇄도 화면에 없어 avoidWhen 으로 되돌린다.
 *
 * 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const superpositionConcept: Aperi21ConceptSource = {
  id: 'superposition',
  label: 'Superposition — Adding Point by Point and Passing Through',
  canonicalSim: 'aperi21:superposition',

  surface: {
    definition:
      'What two waves do where they meet: at every place their displacements add to give the shape the medium takes, and once past each other each carries on with exactly the shape it arrived with.',
    exemplarKeywords: [
      'principle of superposition',
      'two pulses passing through each other',
      'do waves bounce off when they meet',
      'displacements add at every point',
      'the resultant shape of two overlapping waves',
      'pulses come out unchanged after overlapping',
      'an upward pulse meeting a downward one',
      'waves do not collide with each other',
      'adding two wave shapes together',
      'what the rope looks like while two pulses overlap',
    ],
  },

  briefing: {
    observable: [
      'Two strings are drawn one above the other and run on the same clock. On the upper one both pulses stand up; on the lower one the pulse from the right is turned downward instead.',
      'A narrow tall pulse named `A` travels in from the left and a wide low pulse named `B` from the right, each carrying its name along with it.',
      'The two pulses are deliberately unlike — `B` is about twice as wide and lower — so that a pulse continuing past can be told apart from a pulse turning back.',
      'As the overlap begins, time slows to well under half speed, and at the instant the two centres coincide the picture stops for over a second.',
      'While they overlap, a thick line showing the shape the string actually takes separates from each pulse’s own thin dashed shape, which remains drawn where it would have been.',
      'On the upper string the thick line rises higher than either pulse alone; on the lower one the middle is cut down and the flanks are pushed below the flat line into `B`’s trough.',
      'At the meeting place two arrows are stacked: the first runs from the flat line to `A`’s displacement, the second starts where the first ends, and the tip of the second lands on the string itself.',
      'The two dashed shapes pass straight through each other, each keeping its own outline the whole way.',
      'Once the overlap is over, the narrow tall pulse leaves to the right and the wide low one to the left, both with exactly the shapes they had at the start, and their names come back.',
      'The lower string never goes completely flat, because `B` there is smaller than `A` — its middle is flattened rather than erased.',
      'When the round ends the whole picture fades out together rather than the pulses dying down, so nothing suggests the pulses were weakened by the meeting.',
      'No value is written for any displacement; what stands for the sum is the two arrows laid end to end.',
    ],

    screen: {
      affordances: [
        'The round runs by itself — approach, overlap, hold at the moment of coincidence, and departure — and then begins again; nothing has to be pressed.',
        'The two strings are shown at the same instant rather than one after the other, so that a rise on one and a flattening on the other read as one rule with two outcomes instead of two separate rules.',
        'Each pulse’s own shape is laid under the string, so it is hidden while nothing overlaps and comes into view exactly when it is needed.',
        'The flat line is drawn along the whole string and shows only under a pulse, giving the rise and the dip something to be measured against.',
        'The two arrows are given the same colour and told apart by the names `A` and `B`, each name sitting on a small background patch so that it is not lost against the dashed shape crossing behind it.',
        'The overlap is slowed and then held still, so the moment the two shapes coincide can actually be read instead of flashing past.',
      ],
    },

    useWhen: [
      'The article has stated that overlapping waves add, and the reader’s instinct is that they must collide and rebound. A narrow tall pulse coming out of the meeting on the far side, with its shape intact, is what settles that.',
      'The point being made is that the adding happens separately at every place along the medium. A flattened middle with dipped flanks, rather than one height being reduced, is what shows the adding as place-by-place.',
      'The article needs the plain rule established before a case built on it — before anything is said about what size the sum comes to.',
    ],

    avoidWhen: [
      'The claim is that two waves can wipe each other out completely and leave the medium flat. The two pulses here are of different sizes on purpose, and the lower string is only ever flattened.',
      'The subject is how far out of step two waves are and what that does to the size of their sum. Nothing here is out of step by an amount — two pulses meet once, and the only settings are their shapes.',
      'The article is about a pattern that stays in one place, or about places that are permanently quiet. Everything here is travelling, and the overlap is over in a moment.',
      'The waves in the article are endless trains rather than single pulses. One pulse comes from each side and each leaves once.',
      'The subject is a wave meeting the end of its medium and returning. The string ends are never reached in a round.',
      'Values are wanted — how high the combined shape gets, by how much. Only the two stacked arrows say it.',
    ],

    contrastWith: [
      {
        concept: 'constructive-destructive',
        note: 'One establishes that overlapping waves simply add and come through unchanged; the other takes that as given and asks what size the sum comes to, with how far out of step the two are as the only thing varied.',
      },
      {
        concept: 'interference',
        note: 'One follows a meeting that happens once and is over — the waves add and then separate; the other has an arrangement that never ends, with the adding at each place of a surface giving the same result over and over.',
      },
      {
        concept: 'beats-in-oscillation',
        note: 'Both add two disturbances together, in different settings — one adds two travelling shapes at each place along a medium, the other adds two oscillations of one body at each moment in time.',
      },
      {
        concept: 'huygens-principle',
        note: 'One is the rule of adding, set up with two waves whose meeting and parting can be watched; the other puts that rule to work with dozens of sources at once to explain where a front comes from.',
      },
    ],
  },
};
