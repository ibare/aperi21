/**
 * second-law-of-thermodynamics 개념 선언.
 *
 * 방향 · 기관 다섯 중 하나. 다섯이 전부 「되돌릴 수 없다」 둘레라 definition 이 붙기 쉽다.
 * **무엇을 주장하는가**로 갈랐다.
 *   second-law-of-thermodynamics **규칙** — 퍼진 것은 저절로 안 모인다 (기다려 보인다)
 *   irreversibility  **거꾸로 돌려 본다** — 되감은 장면의 어색함이 곧 뜻이다
 *   heat-engine                  **값** — 받은 열의 일부만 일, 버릴 곳이 없으면 선다
 *   carnot-cycle                 **한계** — 버려야 할 몫의 크기는 두 온도가 정한다
 *   refrigerator-heat-pump       **거꾸로 사기** — 일을 넣으면 찬 곳에서 더운 곳으로 간다
 * 이쪽만 상자 · 칸막이 · 왼쪽 칸 수 곡선 · 비어 있는 N 줄 아래 어휘를 갖는다.
 * 되감기 · 열 · 일 · 기관은 형제 몫이라 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const secondLawOfThermodynamicsConcept: Aperi21ConceptSource = {
  id: 'second-law-of-thermodynamics',
  label: 'Why Spreading Runs One Way',
  canonicalSim: 'aperi21:second-law-of-thermodynamics',

  surface: {
    definition:
      'The rule that a gas let loose spreads to fill what it is given and never gathers itself back, so a count that falls to its even share stays there.',
    exemplarKeywords: [
      'second law of thermodynamics',
      'why does gas spread out and never come back',
      'free expansion into an empty half',
      'irreversible spreading',
      'the molecules never all return to one side',
      'things only run one way',
      'why smoke does not go back into the cigarette',
      'the arrow of time in thermodynamics',
      'what are the odds they are all on the left',
      'a gas fills whatever container it is given',
    ],
  },

  briefing: {
    observable: [
      'A box divided in two by a partition, with fifty molecules bouncing about in the left half only.',
      'To the right of the box a graph counts how many molecules are in the left half against time. Its top line sits level with the top of the box and is marked with a single letter for that total; a dashed line halfway down is marked as half of it.',
      'While the partition is in place the curve lies flat along the top line, growing rightward.',
      'The partition is lifted and molecules begin crossing; the curve bends off the top line and comes down.',
      'The molecules spread until both halves look alike, and the curve settles around the half line, wobbling a little either side of it.',
      'Then, for a long stretch, nothing else happens: the curve keeps wobbling around the half line all the way to the right-hand edge, and the whole space between it and the top line stays empty.',
      'That empty space, rather than any number, is what "it does not come back" looks like.',
      'The dashed centre line remains after the partition is gone, so the half being counted is still marked out on the box.',
      'The molecules are never gathered back at the end of a round — they simply fade out, and a fresh set fades in on the left.',
      'Every molecule is the same colour whichever side it started on; the only accent is the moving point at the leading end of the curve.',
      'The upright scale carries just the two symbols and no numbers, and the running count is never written out.',
    ],

    screen: {
      affordances: [
        'The round plays through by itself, and its long tail is the argument — the waiting is not dead time but the evidence.',
        'The molecules bounce off the walls only and never off one another, so nothing drives the spreading except the room they have been given.',
        'The same sequence happens every round, so what is watched is not a lucky run that happened to behave.',
        'The number of molecules is fixed rather than adjustable, because with only a handful the curve really could climb back and the claim would stop being true.',
        'Nothing reaches into the box to move a molecule; the spreading is left entirely to itself.',
      ],
    },

    useWhen: [
      'The article has stated the second law in words about disorder or direction, and the reader wants a case where that direction is something to watch. A count falling to its even share and then simply staying there, with the top of the graph left empty, is that case.',
      'The reader is asking why nothing forbids the molecules from all returning at once and yet they never do, and what the picture supplies is the long stretch of not returning.',
    ],

    avoidWhen: [
      'The article is about heat moving between a hot body and a cold one, or about engines and what they must pass on. Nothing here is hot, cold, or doing work.',
      'The point is a process played backwards and the absurdity of the reversed film. Nothing is reversed here; the round simply ends and begins again.',
      'A quantity that measures the spreading is wanted — a value, a formula, a logarithm. The graph counts molecules on one side and does nothing else.',
      'The subject is a being or a device that sorts molecules to beat the rule. Nothing reaches into this box at all.',
      'The chance of them all returning at once is to be evaluated. No probability appears and no number is ever put on the count.',
    ],

    contrastWith: [
      {
        concept: 'irreversibility',
        note: 'Both say a change has a direction — one lets the forward run go on long enough that the return is plainly not coming, the other plays the return itself so its absurdity can be judged.',
      },
      {
        concept: 'heat-engine',
        note: 'One is the rule that change runs one way; the other is what that rule costs a machine obliged to come back to its start every turn.',
      },
      {
        concept: 'refrigerator-heat-pump',
        note: 'One shows the direction things take when nothing is done to them; the other shows what has to be bought to send them the other way.',
      },
      {
        concept: 'carnot-cycle',
        note: 'One says the direction cannot simply be undone; the other prices the undoing, fixing the largest share of heat any engine between two temperatures could keep.',
      },
    ],
  },
};
