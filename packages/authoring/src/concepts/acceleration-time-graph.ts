/**
 * acceleration-time-graph 개념 선언.
 *
 * 형제는 `velocity-time-graph`. 둘 다 "넓이" 를 주장하므로 **넓이가 무엇으로 바뀌는가**로
 * 갈랐다.
 *   velocity-time-graph      넓이 → 간 거리. 기둥이 길 위 말뚝 사이를 채운다
 *   acceleration-time-graph  넓이 → 속도 변화. 칸이 막대에 쌓이고, 축 아래 칸은 **깎아 낸다**
 * 이쪽만 부호(축 아래) · 상쇄 · 누적 총합 어휘를 갖는다. 저쪽 곡선은 축 아래로 내려가지
 * 않으므로 상쇄는 이쪽의 고유한 주장이다.
 *
 * `average-acceleration` 과도 갈린다 — 저쪽은 누적을 건너뛰고 두 끝 속도만 본다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const accelerationTimeGraphConcept: Aperi21ConceptSource = {
  id: 'acceleration-time-graph',
  label: 'Acceleration-Time Graph',
  canonicalSim: 'aperi21:acceleration-time-graph',

  surface: {
    definition:
      'A record of acceleration against elapsed time, where each band of area adds to or takes from a running total of velocity change, portions below the axis cancelling earlier ones.',
    exemplarKeywords: [
      'acceleration-time graph',
      'area under an acceleration-time graph',
      'the area gives the change in velocity',
      'a-t graph',
      'negative area subtracts from the speed',
      'how much velocity was gained according to the graph',
      'acceleration held constant over each interval',
      'below the axis means slowing down',
      'finding the velocity change from a graph',
      'integrating the acceleration',
    ],
  },

  briefing: {
    observable: [
      'A stepped acceleration line runs across a time axis, holding one height for a stretch and then stepping to another, with its value written beside each stretch.',
      'Second by second, the space between that line and the axis fills in as the clock passes over it.',
      'When a filled cell is complete it lifts off, flies to a bar at the right named for change in velocity, and settles onto whatever is already stacked there without its shape altering.',
      'Where a cell has gone, a dashed outline is left behind in its place.',
      'Cells lying below the axis are drawn hatched and edged with a dashed border, and instead of landing they cut their own height off the top of the stack.',
      'Each cell carries its own value in writing, and the bar carries the running total.',
      'For one stretch the line lies flat on the axis, there is no area to lift, and the bar stands untouched.',
      'The written line follows each turn — filling, landing, nothing to add, cutting away — and closes by naming the height that is left.',
    ],

    screen: {
      affordances: [
        'The filling, the flights and the cutting run in order and then start over, so both the adding and the taking away come round without being set off.',
        'A cell and the bar are drawn to one scale, so a cell keeps its exact shape as it lands and the stack can be read back against the cells it was built from.',
        'Values are written on the cells and on the bar, so the arithmetic of adding and subtracting can be followed alongside the shapes.',
        'Each stretch holds one value of acceleration, which makes a cell an exact amount rather than an estimate of one.',
      ],
    },

    useWhen: [
      'The reader will grant that an area can stand for a distance but stumbles when the thing being piled up is velocity itself. Cells landing on a bar, and hatched ones cutting it down, is the case for that second kind of accumulation.',
      'A negative area has to mean something definite rather than be a convention about signs, and here it visibly takes height off a stack that was already built.',
    ],

    avoidWhen: [
      'The subject is the ground covered. The bar counts velocity, and no road, distance or displacement appears.',
      'The graph wanted is one whose tilt is read. The line is flat within each stretch and its steps are never measured.',
      'The point is that acceleration varies smoothly and the area has to be approximated by strips. Every stretch here holds one value, so each cell is exact by construction.',
      'The reader is not yet at home with an area standing for an accumulated quantity. This one takes that idea as given and applies it a second time.',
    ],

    contrastWith: [
      {
        concept: 'velocity-time-graph',
        note: 'Both claim an area is what matters, but of different things — here it buys velocity gained and can be taken away again below the axis, there it buys ground covered and only ever adds.',
      },
      {
        concept: 'average-acceleration',
        note: 'One builds the velocity change by piling up every band of area in turn; the other skips the piling altogether and takes only the first and last velocities.',
      },
    ],
  },
};
