/**
 * gravitational-time-dilation 개념 선언.
 *
 * 중력 넷 중 하나. **무엇으로 재는가**로 갈랐다.
 *   equivalence-principle      가릴 수 없다 — 아무 차이도 안 난다
 *   gravitational-time-dilation **시계 둘**을 견준다 — 위의 시계가 앞선다
 *   gravitational-redshift     **빛의 파장**을 견준다 — 올라온 빛이 붉다
 *   light-bending-by-gravity   **경로**를 견준다 — 휘어서 비껴 보인다
 * 이쪽만 「시계 · 바늘 · 째깍 · 탑 · 높이 · 나노초 · 데려와 견줌」 어휘를 갖는다.
 * 파장 · 색 · 각 · 상자는 쓰지 않는다. 속력 때문에 생기는 지연도 쓰지 않는다 — 여기는 높이 하나다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const gravitationalTimeDilationConcept: Aperi21ConceptSource = {
  id: 'gravitational-time-dilation',
  label: 'Clocks Running Faster Higher Up',
  canonicalSim: 'aperi21:gravitational-time-dilation',

  surface: {
    definition:
      'That a clock carried up a tower and brought back down is found ahead of the one left at the bottom, because time passes more slowly the lower a clock is held in gravity.',
    exemplarKeywords: [
      'gravitational time dilation',
      'clocks run slower nearer the ground',
      'does time pass differently on a mountain top',
      'Hafele-Keating experiment',
      'an atomic clock taken up a tower and brought back',
      'satellite navigation clocks need a correction',
      'nanoseconds gained per day at altitude',
      'time depends on gravitational potential',
      'the twin who lives downstairs ages more slowly',
      'optical lattice clocks a metre apart disagree',
    ],
  },

  briefing: {
    observable: [
      'Two identical clock faces stand on the ground on either side of a tower, named A and B, with their hands together; the tower is marked as a hundred metres tall.',
      'The recording begins the instant both hands come round to the top, and to the right of the picture a band starts filling from the left, with a line for each clock and time running across it.',
      'B is carried up the tower and its line in the band rises with it, so the shape of the line is a record of where B has been.',
      'Each clock lays a tick down on its own line whenever its hand passes the top, and while B is at the summit the ticks on its line come closer together than the ticks on A’s.',
      'A dotted line drops from each of B’s ticks to A’s line, and it falls further and further to the left of A’s tick of the same number: the first two all but coincide, the fifth is clearly ahead.',
      'On B’s face a wedge opens between a dotted mark where A’s hand stands and B’s own hand, and it grows steadily while B is up.',
      'B is brought back down and set beside A again; both now turn at the same rate, and the wedge stops growing but does not close — the lead that was gained stays.',
      'Once B is back, a line of text appears saying what the real size of this is: a clock a hundred metres up gains something under a nanosecond in a day.',
      'The figures on the picture are only the counted tick numbers, the tower’s height and that one real-world quantity; the rate, the lead and the amount by which the effect has been enlarged for the eye are never written.',
    ],

    screen: {
      affordances: [
        'The clocks are set together, one is raised, held up, lowered and compared, and then everything resets and begins again; nothing has to be pressed.',
        'Both clocks are started at the same place and brought back to the same place, which keeps the comparison to two hands side by side and leaves out the question of how two distant clocks could have been compared at all.',
        'The difference is enlarged enormously so that it can be seen, and the picture says so by naming the real size in words once the clock is back down, rather than by printing the factor.',
        'The lead is kept to less than a full turn of the hand, since past a full turn the wedge would wrap around and stop saying how much.',
        'The band is a chart recorder rather than a graph: no axes, no units and no scale are drawn on it, and the dotted droppers do the comparing.',
        'The two clocks are drawn alike in every respect, because they are the same clock; high and low are told apart by position and by the height of the line in the band, never by colour.',
      ],
    },

    useWhen: [
      'The article has claimed that gravity affects the passage of time and the reader wants to know how anyone could possibly check such a thing. Taking one clock up, bringing it back and reading the two hands side by side is the form the real experiments take, and it is the form drawn here.',
      'The reader needs to see that the lead is accumulated only while the clock is up and then kept — the ticks crowd during the stay and the wedge freezes at the reunion rather than unwinding.',
    ],

    avoidWhen: [
      'The difference in question comes from speed — a fast traveller, a moving clock, a twin on a rocket. Only height changes here, and the clock is carried slowly.',
      'The subject is light, colour or wavelength shifted by gravity. No light is exchanged between the two clocks and no wavelength is drawn.',
      'The article is about satellite navigation, where the correction is the sum of a gravitational term and a speed term of opposite sign. Only one of those two is present here.',
      'The point is a black hole, a horizon, or time stopping altogether. The whole picture is a tower on the ground and the effect is described as being tiny in reality.',
      'The article needs the actual size of the effect to be read off the screen. What is drawn is enlarged by a very large factor, and the only true figure given is a single sentence of text.',
    ],

    contrastWith: [
      {
        concept: 'gravitational-redshift',
        note: 'One brings two clocks back together and reads the disagreement off their hands; the other never moves anything, and finds the same disagreement written in the wavelength of light that made the journey between two heights.',
      },
      {
        concept: 'equivalence-principle',
        note: 'One is the premise that inside a sealed box gravity and acceleration are the same in every respect; the other is a consequence drawn out of that premise which is not a sameness at all but a measurable gap between two clocks.',
      },
      {
        concept: 'gravitational-potential-energy-general',
        note: 'One says what changes with depth in a gravity well for a body being moved about; the other says that the rate of time itself is among the things that change with depth.',
      },
      {
        concept: 'time-dilation',
        note: 'Both end with two clocks disagreeing, but one has the disagreement follow from how fast one of them was moving, while the other needs no motion at all and has it follow from how low the clock was held.',
      },
    ],
  },
};
