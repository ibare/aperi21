/**
 * newtons-third-law 개념 선언.
 *
 * 힘을 말하는 형제 가운데 이쪽만 **힘이 둘이고 받는 쪽이 둘**이다. 다른 셋과의 갈림:
 *   newtons-third-law   한 번의 밂이 낳는 **두 힘** — 받는 물체가 달라서 지워지지 않는다
 *   net-force           **한 물체**에 걸린 여러 힘을 하나로 줄인다
 *   free-body-diagram   같은 접촉의 맞은편 힘이 **어느 쪽에 남는가**
 * 셋째와 특히 가깝다 — 그쪽은 목록을 가르는 일이고 이쪽은 쌍이 똑같다는 것과 둘 다
 * 움직인다는 결과다. 이쪽만 "쌍" · "서로" · "지워지지 않는다" 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const newtonsThirdLawConcept: Aperi21ConceptSource = {
  id: 'newtons-third-law',
  label: "Newton's Third Law",
  canonicalSim: 'aperi21:newtons-third-law',

  surface: {
    definition:
      'The rule that one push produces two forces of equal size and opposite direction which land on two different bodies, so that neither cancels the other and both bodies are set moving.',
    exemplarKeywords: [
      "Newton's third law",
      'action and reaction',
      'equal and opposite forces',
      'why do the two forces not cancel out',
      'they act on different bodies',
      'two skaters pushing each other apart',
      'recoil when you push off something',
      'reaction force pair',
      'if I push the wall does the wall push me',
      'both of them move apart',
    ],
  },

  briefing: {
    observable: [
      'Two skaters of the same size stand on ice with their palms together, and small triangles mark the spots where each of them was standing at the start.',
      'They push, and two arrows appear, one on each skater, each starting from a dot drawn at the middle of the body it acts on.',
      'The two arrows are the same length and point in opposite directions, and each carries a written name saying which skater the force is on rather than which skater is doing the pushing.',
      'Both skaters leave the marked starting spots and glide apart, each leaving scratch marks on the ice behind them.',
      'The arrows are the only thing drawn in the accent colour, so the pair is what the eye is sent to.',
      'The caption follows the run: palms together, then two equal and opposite forces each on a different person, then the forces did not cancel and both are pushed apart.',
      'The arms are drawn back in over a short interval after the push ends, and the two go on gliding with no arrows at all.',
      'The whole push arrives already under way and repeats, so the paired appearance of the two arrows comes round again.',
    ],

    screen: {
      affordances: [
        'The push, the release and the glide run in order on their own, so the two arrows are always shown together and never one without the other.',
        'The two skaters are made alike, which leaves the equal lengths of the two arrows and the equal retreat from the marked spots as the only things to compare.',
        'The starting spots stay drawn after the skaters have left them, so how far each has gone can be read off the ice.',
      ],
    },

    useWhen: [
      'The reader has met "equal and opposite" and concluded that nothing can ever move. Two arrows seated on two different bodies, with both bodies leaving their marks, is the answer to that objection.',
      'The article claims that a force is always an exchange between two bodies rather than something one body has, and needs a screen where the same push is drawn twice, once on each party.',
    ],

    avoidWhen: [
      'The forces in question all act on one body and the argument is about what they come to together. The two arrows here never share a body and are never added.',
      'The bodies have different masses and the point is that the lighter one flies off faster. Both skaters are alike here and retreat alike.',
      'The subject is a body held still because its forces balance. Nothing is in balance here — both bodies are set moving.',
      'The article is about how large the resulting motion is for a given force. No speeds, forces or distances are written down.',
      'The question is which forces to put in a diagram of a single chosen body, or what is left behind when one body is isolated. Nothing is lifted out of anything here.',
    ],

    contrastWith: [
      {
        concept: 'net-force',
        note: 'One is two forces that can never be added because they sit on different bodies; the other is several forces that must be added because they sit on one.',
      },
      {
        concept: 'free-body-diagram',
        note: 'One shows the two halves of a contact side by side and says they are equal; the other separates them and says which half goes on which body’s list.',
      },
      {
        concept: 'newtons-second-law',
        note: 'One says a force never comes alone; the other says how much motion one of them produces.',
      },
      {
        concept: 'normal-force',
        note: 'One says the two halves of a contact are always equal in size; the other says what fixes that size when the contact is a surface being leaned on.',
      },
    ],
  },
};
