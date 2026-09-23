/**
 * quantum-tunneling 개념 선언.
 *
 * 꿰뚫기 둘을 **주장의 방향** 으로 갈랐다.
 *   quantum-tunneling                 그런 일이 일어난다는 것 — 넘지 못할 벽 너머에 일부가 나타나고,
 *                                     두께에 지수적이라 두 배면 몇 분의 일이 된다
 *   scanning-tunneling-microscope     그 지수 민감함을 **도구로 쓴다** — 전류를 일정하게 두고 높이를 기록한다
 * 이쪽만 「되튐과 통과의 몫 · 장벽 안에서 줄어드는 확률 · 두께 두 배」 어휘를 갖는다.
 * `finite-well` 과도 갈린다 — 저쪽은 머무는 상태의 꼬리, 이쪽은 지나가는 묶음이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const quantumTunnelingConcept: Aperi21ConceptSource = {
  id: 'quantum-tunneling',
  label: 'Tunnelling Through a Barrier',
  canonicalSim: 'aperi21:quantum-tunneling',

  surface: {
    definition:
      'A particle meeting a barrier higher than its own energy: most of it turns back, yet part of it appears on the far side, and that part shrinks steeply as the barrier is made thicker.',
    exemplarKeywords: [
      'quantum tunnelling',
      'tunnel effect',
      'passing through a barrier you cannot climb',
      'transmission through a potential barrier',
      'barrier penetration',
      'how can a particle get past a wall it has too little energy for',
      'doubling the barrier width',
      'exponential dependence on barrier thickness',
      'alpha decay escaping the nucleus',
      'part reflects and part goes through',
      'classically forbidden crossing',
    ],
  },

  briefing: {
    observable: [
      'Two lanes run one above the other. Each holds a rectangular barrier, and the only difference between them is the barrier\'s thickness — the lower one is twice the upper.',
      'A coloured measure across each barrier, with its name beside it, is the one thing marked in colour.',
      'In each lane a faint dotted line runs left from the top of the barrier, and a second line, lower, carries the energy of the thing coming in. The energy line lies below the top of the barrier, so climbing over is out.',
      'A single filled hump rides along on the energy line in each lane. The two humps are identical, start together, and reach their barrier\'s left face at the same moment.',
      'As a hump arrives, what is coming in and what has already turned back overlap in front of the barrier and the curve breaks into a tall peak and smaller ones.',
      'At the same time the curve runs on into the barrier and falls away steadily from left to right. In the thin barrier some height is still left at the far face and the curve carries on beyond it; in the thick barrier the curve has nearly reached the line before the far face.',
      'The hump then separates into two: one travelling back to the left and one going on to the right beyond the barrier.',
      'In the upper lane the part beyond the barrier is a clear hump. In the lower lane it is a low swelling of the line, several times smaller, although the only thing changed is the thickness.',
      'Both lanes fade and a fresh hump enters at the left, and the whole thing happens again.',
      'A sentence below names the thickness ratio between the two lanes. No number for how much gets through is given anywhere — only the sizes of the humps.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The approach, the crossing and the separating run on a fixed round and repeat.',
        'The two thicknesses are put side by side and struck at the same instant, so the comparison is made by looking across rather than by remembering what happened a moment ago.',
        'Everything except the thickness is the same in both lanes — same incoming hump, same barrier height, same energy — so the difference in what comes out has only one thing it can be attributed to.',
        'The humps are drawn as filled area rather than as a wave with a sign, because what is being compared is how much is in each part.',
        'They ride on the energy line, and that line sits below the dotted line for the top of the barrier, which is how "not enough energy to climb over" is said without words.',
        'The overlap pattern in front of the barrier is left in rather than cleaned away, so the curve inside the barrier joins continuously onto what is outside it.',
        'Only the part of the curve worth seeing is outlined, so the low swelling beyond the thick barrier is genuine and not just the line itself.',
        'The colour set aside for the one thing that differs between the lanes is used for the thickness measures and their names and for nothing else; everything belonging to the particle is drawn in one colour, as one thing.',
        'It opens with the humps already on their way toward the barriers.',
      ],
    },

    useWhen: [
      'The article has stated that a particle can cross a barrier it has too little energy for and the reader needs to see it happen rather than be assured of it. Part of the hump comes out the far side while the energy line stays below the top of the barrier.',
      'The point is that tunnelling is not all-or-nothing. The arriving hump splits, most of it going back and a part going on, and both are on screen at once.',
      'The article turns on how fiercely the chance of getting through depends on the thickness, and needs more than a statement that it is exponential. Twice the thickness leaves a swelling several times smaller, side by side.',
      'The reader needs to see that something goes on inside the barrier rather than the particle simply appearing on the other side. The curve runs into the barrier and dies away across it.',
    ],

    avoidWhen: [
      'The subject is a settled, standing state held inside a well, or a tail that merely dies away in the wall without anything coming out. Here a thing arrives, splits, and leaves.',
      'The article is about using the steepness of tunnelling to measure something, to image a surface, or to build an instrument. Nothing here is being measured with it.',
      'The point is how the chance of getting through depends on the particle\'s energy or on the height of the barrier. Both are held fixed; only the thickness differs.',
      'The subject is which energies a bound particle may have, or a ladder of levels. There are no levels here, only one energy coming in.',
      'The article needs a transmission probability as a figure, a decay rate, or a half-life. Nothing is numbered but the ratio of the two thicknesses.',
      'The point is a wave reflecting at a boundary between two media, or two paths interfering with each other. There is one barrier and one incoming thing.',
    ],

    contrastWith: [
      {
        concept: 'finite-well',
        note: 'Both have something present where it has too little energy to be, but one is a state that stays and merely fades away inside the wall, while the other is in transit and a share of it comes out the far side.',
      },
      {
        concept: 'scanning-tunneling-microscope',
        note: 'One establishes that crossing happens and that its size collapses with thickness; the other takes that collapse as given and turns it into an instrument for reading a surface.',
      },
      {
        concept: 'particle-in-a-box',
        note: 'One is about walls that hold absolutely and the energies they permit; the other is about a wall that is passed, with the energy fixed and the question being how much gets through.',
      },
      {
        concept: 'potential-energy-curve',
        note: 'One says a body must turn back where its total would fall short of what is stored; the other says it turns back only mostly, and part of it is found where that rule forbids.',
      },
      {
        concept: 'wave-function',
        note: 'One is about reading a fixed shape as a distribution of where a particle may be found; the other follows a moving shape and cares about the share of it on each side of a wall.',
      },
    ],
  },
};
