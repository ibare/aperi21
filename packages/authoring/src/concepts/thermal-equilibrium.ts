/**
 * thermal-equilibrium 개념 선언.
 *
 * 위험한 짝 셋 중 하나 — `specific-heat` · `calorimetry` 와 섞으면 셋 다 「열이 오가고
 * 온도가 바뀐다」 로 수렴한다. **주어와 주장을 갈랐다.**
 *   thermal-equilibrium  주어 = 맞붙은 **두 덩이**. 주장 = 다가가는 빠르기가 줄다 **멎는다**
 *   specific-heat        주어 = **물질의 성질**. 주장 = 같은 열에 오르는 폭이 다르다
 *   calorimetry          주어 = **섞은 결과의 온도**. 주장 = 잃은 열 = 얻은 열이 그 자리를 정한다
 * 이쪽만 「멈춘다 · 점점 느리게 · 겹친다」 어휘를 갖는다. 질량 · 비열 · 섞음 · 최종 온도가
 * 어디서 오는가는 쓰지 않는다 — 두 덩이가 같은 물질 · 같은 크기라 화면이 말할 수 없다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const thermalEquilibriumConcept: Aperi21ConceptSource = {
  id: 'thermal-equilibrium',
  label: 'Thermal Equilibrium as the End of a Flow',
  canonicalSim: 'aperi21:thermal-equilibrium',

  surface: {
    definition:
      'The end state two bodies in contact arrive at, their temperatures closing on one another quickly at first and ever more slowly until both hold at a single shared value.',
    exemplarKeywords: [
      'thermal equilibrium',
      'why does heat stop flowing',
      'two things left touching end up at the same temperature',
      'the temperature difference dies away',
      'hot and cold blocks pressed together',
      'cooling gets slower as it gets closer',
      'when does heat transfer stop',
      'no net heat flows once they match',
      'reaching a common temperature',
      'the zeroth law in practice',
    ],
  },

  briefing: {
    observable: [
      'Two blocks of the same size and the same colour move toward one another and meet face to face; inside each stands a temperature bar, one at 80 ℃ and one at 20 ℃.',
      'The moment they touch, grains begin crossing the joined faces one after another toward the cooler block, and a thick arrow above the pair points the same way and is named heat.',
      'The left bar falls as the right one rises, and on a panel beside them two curves — one coming down, one coming up — bend steeply toward each other.',
      'As the two bars close in, the grains come further apart, the arrow shortens and thins, and the curves lie flatter: the slackening is visible in three places at once.',
      'At the end the two bars stand at one height and the two curves run together as a single line; a dashed line crosses the bar tops and that merged curve together, with 50 ℃ written at its end.',
      'Nothing crosses any more, the arrow is gone, and the curve runs on flat — the picture has stopped changing rather than merely slowed.',
      'While the temperatures are still moving, no running value is written anywhere; only the two starting temperatures and the one they meet at appear as text.',
      'The blocks are shown apart first and then pressed together, so the flow plainly begins at the moment of contact.',
    ],

    screen: {
      affordances: [
        'One round carries the pair from apart, through contact and the fast flow, to the stopped picture, and then begins again; nothing has to be pressed.',
        'The bars and the curves are drawn to one and the same temperature scale, which is what lets a single dashed line pass through both and say they met at one value.',
        'The two blocks are drawn identically — same size, same colour — so the only things telling them apart are bar height, curve position and the written temperature.',
        'The screen opens with the blocks already closing on each other, so the contact is watched rather than waited for.',
      ],
    },

    useWhen: [
      'The article has stated that two bodies in contact come to a common temperature, and the reader would take that as arithmetic rather than as something that happens. Watching the flow thin out grain by grain and then genuinely cease is what turns it into an event.',
      'The point being made is that the approach is fast at the start and slow at the end — that a body near its surroundings changes barely at all — and the widening grains, the shrinking arrow and the flattening curves say it together.',
    ],

    avoidWhen: [
      'The article turns on materials differing in how readily they warm. Both blocks here are of the same material and the same size, and the value they meet at is simply halfway between.',
      'The question is what the final temperature works out to and what fixes it. No mass is written, nothing is weighed, and nothing is mixed.',
      'The subject is melting, boiling or any change of state. Both blocks stay solid throughout and only their temperatures move.',
      'The article is about heat making its way along a body, or being carried by a fluid, or crossing a gap. The two blocks meet face to face and the flow is only ever from one to the other.',
      'Running values are wanted — the temperature at some moment along the way. Only the two starting figures and the meeting one are written.',
    ],

    contrastWith: [
      {
        concept: 'calorimetry',
        note: 'One says that the two temperatures converge and cease changing; the other says which value they converge on, and that it sits nearer whichever side has more to it.',
      },
      {
        concept: 'specific-heat',
        note: 'One puts two bodies of one material together and follows them to a common temperature; the other keeps the bodies apart, feeds each the same heat, and finds that what the material is decides the rise.',
      },
      {
        concept: 'thermal-conduction',
        note: 'One is about two bodies arriving at a shared temperature; the other is about how far and how fast heat gets through a body, which never arrives at one temperature at all.',
      },
      {
        concept: 'latent-heat',
        note: 'One has a temperature stop because the flow has run out; the other has a temperature stop while heat keeps arriving in full, because it is going into a change of state.',
      },
    ],
  },
};
