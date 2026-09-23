/**
 * thermal-expansion 개념 선언.
 *
 * 늘어남 둘 중 하나. 둘 다 「데우면 늘어난다」 라 **무엇이 달라지는가**로 갈랐다.
 *   thermal-expansion  한 금속의 **길이** — 늘어난 끝이 이웃과의 틈을 메운다
 *   bimetal            두 금속의 **늘어남 차** — 띠가 한쪽으로 휜다
 * 이쪽만 틈 · 이음매 · 밀려 나온 끝 · 맞닿음 어휘를 갖는다. 휨 · 방향 · 두 금속은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 * 주제 설명의 「부피 변화」 는 화면에 없어 avoidWhen 으로 되돌린다(간극 장부 참조).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const thermalExpansionConcept: Aperi21ConceptSource = {
  id: 'thermal-expansion',
  label: 'Thermal Expansion Closing a Joint Gap',
  canonicalSim: 'aperi21:thermal-expansion',

  surface: {
    definition:
      'Warming makes a solid longer, so the gap deliberately left between two rails narrows in summer as each rail grows out towards its neighbour.',
    exemplarKeywords: [
      'thermal expansion',
      'why are there gaps between railway rails',
      'expansion joint',
      'metal gets longer when it is hot',
      'the gap almost closes in summer',
      'a bridge left room to grow',
      'linear expansion of a rail',
      'how much does steel grow over a season',
      'rails buckling in a heatwave',
      'leaving room for the heat',
    ],
  },

  briefing: {
    observable: [
      'Two lengths of steel rail are seen from the side, lying on sleepers that never move; the joint between them sits in the middle of the picture.',
      'In winter a measured gap stands open at the joint and is written as eighteen millimetres, while the thermometer at the left is filled to its lower mark.',
      'As the thermometer fills upward, a hatched portion grows at each end of both rails and rides out over the sleepers; the hatch says how much of the rail was not there before.',
      'The two ends that face the joint move toward each other, and the measuring line across the gap shortens with them.',
      'At the top of the thermometer the gap is down to three millimetres, its two end marks nearly touching, and the line beneath the rails says each rail grew fifteen — the two hatched pieces on one rail.',
      'A note under the rails says the gap and the added length are drawn three hundred times larger than they really are; the rails themselves keep their true length.',
      'Cooling runs the same thing backwards: the hatch shrinks, the gap opens, and the winter picture returns of itself.',
    ],

    screen: {
      affordances: [
        'One round carries the rails from the cold mark to the hot one and back, and repeats; nothing has to be pressed.',
        'The magnification is stated on the picture rather than hidden, because without it the rails would read as growing by a tenth of their length.',
        'The gap and the added length are drawn to one and the same enlarged scale, so the claim that the gap loses exactly what the rail gains holds on the screen and not only in the arithmetic.',
        'The sleepers stay put, which is what makes the rail ends visibly ride out over them.',
        'Numbers appear only at the two ends of the round, where the picture is at rest; nothing is rounded off mid-change.',
      ],
    },

    useWhen: [
      'The article has said that solids grow when heated and the reader is wondering what a few millimetres could possibly matter. Watching a designed gap swallowed by the growth of the rails either side of it is what gives the millimetres consequence.',
      'The reader has met an expansion joint on a bridge or a track and takes it for slack workmanship, and the moment wanted is the one where the same joint is nearly shut.',
    ],

    avoidWhen: [
      'The article is about volume growing with heat, about liquid rising in a tube, or about water behaving oddly near freezing. Only a length is drawn here, in one direction.',
      'The subject is two different metals fastened together, or anything that bends as it warms. There is one steel rail either side of the joint and both stay straight.',
      'The point is why atoms should sit further apart when hot. Nothing here is magnified to atoms; the rail is drawn whole.',
      'A coefficient is to be quoted or a formula worked through. No coefficient or expression is written anywhere.',
      'The article needs the true visual proportion of the growth, or a bar that buckles once the gap has run out. The growth is drawn hundreds of times larger and the gap never quite reaches zero.',
    ],

    contrastWith: [
      {
        concept: 'bimetal',
        note: 'One is a single material free to grow along its own length until it meets something; the other is two materials that cannot grow independently because they are joined, so the disagreement turns into a bend.',
      },
      {
        concept: 'youngs-modulus',
        note: 'Both are a solid changing length, but one has temperature as the cause and nothing resisting, while the other has a pull as the cause and the material resisting it.',
      },
    ],
  },
};
