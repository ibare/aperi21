/**
 * newtons-second-law 개념 선언.
 *
 * 힘의 합을 말하는 셋(`newtons-second-law` · `net-force` · `free-body-diagram`)이 가장
 * 붙기 쉽다. **주장을 갈랐다.**
 *   newtons-second-law  힘과 결과의 **비례** — 힘을 3배로 하면 1초마다 붙는 속도도 3배다
 *   net-force           여러 화살표를 **하나로 줄이는 일** — 남은 하나가 방향을 정한다
 *   free-body-diagram   힘이 **누구 것인가** — 떼어 낸 물체가 받는 것만 따라 나온다
 * 이쪽만 배수 · 비례 · 매초 붙는 양 어휘를 갖는다. 화살표를 잇거나 물체를 떼어 내는 말은
 * 쓰지 않는다.
 *
 * 화면은 질량을 바꾸지 않는다 — 세 수레는 같고 힘만 1 : 2 : 3 이다. definition 을 힘 쪽
 * 비례로 좁히고 질량 자리는 avoidWhen 과 장부(`tasks/topic-gaps/entries/newtonian-mechanics-2.md`)에 남겼다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const newtonsSecondLawConcept: Aperi21ConceptSource = {
  id: 'newtons-second-law',
  label: "Newton's Second Law",
  canonicalSim: 'aperi21:newtons-second-law',

  surface: {
    definition:
      'The proportion between the force pushing a body and the speed it picks up, where doubling or trebling the push doubles or trebles the velocity gained in every second.',
    exemplarKeywords: [
      "Newton's second law",
      'F equals m a',
      'force is proportional to acceleration',
      'push twice as hard and it speeds up twice as fast',
      'what does a bigger force actually do',
      'acceleration doubles when the force doubles',
      'relating force to how quickly it gets going',
      'speed gained each second',
      'stronger push, quicker gain of speed',
      'proportional response to a steady push',
    ],
  },

  briefing: {
    observable: [
      'Three identical carts sit on three parallel tracks, each track carrying a written name saying the push on it is one, two or three times the first.',
      'All three are pushed from the same starting line at the same moment, each with an arrow showing the push it is getting, and the arrows are one, two and three times as long.',
      'A short tick is left on each track at every whole second, so each lane keeps a record of where its cart had reached.',
      'The gaps between the ticks on one lane open out as one, three, five, seven, and the lane pushed three times harder opens out over three times the ground in the same seconds.',
      'Under each lane a bar fills a block at a time, one block per second, and the blocks on the second lane are twice the size of the first and those on the third are three times.',
      'The arrows disappear when the pushing stops, and the caption then points out that every bar holds four blocks — what differs is only the size of a block.',
      'Nothing on the screen carries a number: the proportion is read from lengths and block sizes against a shared starting line and a shared scale.',
    ],

    screen: {
      affordances: [
        'The three carts set off together and the bars build themselves block by block, so the three lanes are always at the same instant of their runs.',
        'The run arrives already in progress and repeats, and the three lanes share one starting line and one scale, which is what makes a length on one lane comparable with a length on another.',
        'The pushing lasts four seconds and is then followed by a pause on the finished bars, so the closing state — same number of blocks, different block size — can be looked at rather than caught.',
      ],
    },

    useWhen: [
      'The article has written the second law as a formula and the reader has no picture of what proportionality does. Three lanes running at once turn "three times the force" into three bars whose blocks are three times as tall.',
      'The claim being argued is that a steady force keeps adding speed rather than fixing a speed, and a case is wanted where the gain per second is drawn as a repeated block.',
    ],

    avoidWhen: [
      'The mass is what varies in the argument — a heavier body under the same push. The three carts are identical and nothing here changes a mass.',
      'Several forces act at once and their combination is the question. Each cart gets exactly one push here.',
      'The point is which forces belong to which body, or that some forces are left out of a diagram. Only the push is drawn; no weight or support appears.',
      'Numbers are wanted — newtons, kilograms, metres per second. Not one value is written anywhere.',
      'The subject is a body already moving that is being slowed or turned. All three start from rest and go straight forward.',
    ],

    contrastWith: [
      {
        concept: 'net-force',
        note: 'One takes the force as given and asks how much motion it buys; the other takes the motion as given and asks which single force the several acting ones amount to.',
      },
      {
        concept: 'free-body-diagram',
        note: 'One is about the size of the response to a push; the other is about whether a given push belongs on this body’s list at all.',
      },
      {
        concept: 'uniformly-accelerated-motion',
        note: 'One says what makes the gain of speed happen and how large it is; the other says what a motion with an unchanging gain leaves behind as a record.',
      },
      {
        concept: 'inertial-vs-gravitational-mass',
        note: 'One holds the body fixed and varies the force; the other holds the procedure fixed and varies the body, asking whether resistance to a push and pull by gravity rank bodies alike.',
      },
    ],
  },
};
