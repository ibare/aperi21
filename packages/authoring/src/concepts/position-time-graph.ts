/**
 * position-time-graph 개념 선언.
 *
 * 그래프 셋이 전부 "기울기와 넓이" 로 수렴할 위험이 있어 **무엇을 읽어 내는가**로 갈랐다.
 *   position-time-graph      선의 **기울기**가 빠르기다 — 가파를수록 빠르다
 *   velocity-time-graph      선 아래 **넓이**가 간 거리다
 *   acceleration-time-graph  넓이가 **속도 변화**이고, 축 아래 넓이는 쌓인 것을 깎는다
 * definition 에서 낱말이 겹치지 않도록 이쪽은 기울기·가파름 어휘만, 저 둘은 넓이 어휘만
 * 갖게 썼다.
 *
 * `average-velocity` 와도 갈린다 — 저쪽은 두 끝을 골라 그은 선이고, 이쪽은 물체가 스스로
 * 남긴 선이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const positionTimeGraphConcept: Aperi21ConceptSource = {
  id: 'position-time-graph',
  label: 'Position-Time Graph',
  canonicalSim: 'aperi21:position-time-graph',

  surface: {
    definition:
      'A drawing of a body’s place against the clock, on which the tilt of the line stands for how fast it goes, and a steeper line marks a quicker body.',
    exemplarKeywords: [
      'position-time graph',
      'distance-time graph',
      'x against t graph',
      'the gradient of a position-time graph is the velocity',
      'steeper line means faster',
      'a flat line means standing still',
      'reading speed off a graph',
      'two lines on the same axes',
      'what does the steepness of the line mean',
      'displacement-time graph',
    ],
  },

  briefing: {
    observable: [
      'Two beads climb two upright lanes on the left, and on the right a pair of axes carries the line each of them is drawing.',
      'The height up the lanes and the height up the graph are the same ruling, so a bead and the tip of its pen always sit on one horizontal row, joined by a dashed guide.',
      'The quicker bead’s line stands up steeper; the slower bead’s line lies nearer the horizontal.',
      'A stroke crosses each lane at every second and a matching dot sits on each line, so how far apart the dots fall along a line is how far apart the strokes fall up the lane.',
      'A dot rides the end of each line as the point of the pen.',
      'After a run the finished drawing stands a moment, clears, and the run repeats with the two speeds exchanged — the colours stay where they were and the steep line moves to the other bead.',
      'Raising a bead’s speed by hand bends its line upward from wherever it had got to and it carries on steeper.',
    ],

    screen: {
      affordances: [
        'Two sliders set the speed of each bead and take over from the automatic run while they are held; until they are touched they follow the speeds the run is using, and each shows a numeric value.',
        'The axes carry a name for height and a name for time but no numbered ticks and no grid, so the two lines are judged against each other rather than read off.',
        'Swapping the two speeds between runs is done for the reader, which separates the steepness from the colour it happens to be drawn in.',
      ],
    },

    useWhen: [
      'The reader can recite that the gradient is the velocity but does not believe it, or reads a rising line as a hill being climbed. Lanes and graph sharing one ruling let the prose point at a bead and its pen on the same row.',
      'The reader ought to change a speed and watch the line answer for itself, which is what the two sliders are there for.',
    ],

    avoidWhen: [
      'The subject is the area under a curve, or a quantity adding up as time goes. Nothing is shaded here and the lines are read by their tilt alone.',
      'The text is about acceleration — a bending line, a tilt that changes. Both beads climb at a fixed rate and their lines are straight.',
      'Values have to be taken off the graph. The axes carry no numbers and there is no grid.',
      'The motion to be described goes back and forth or turns around. Both beads only ever rise.',
    ],

    contrastWith: [
      {
        concept: 'velocity-time-graph',
        note: 'One says the tilt of the drawn line is the speed; the other says the area shut in beneath the drawn line is the ground covered.',
      },
      {
        concept: 'average-velocity',
        note: 'One is about the line a body draws for itself at whatever pace it holds; the other is about a line drawn deliberately between two chosen moments, and what that figure conceals.',
      },
      {
        concept: 'uniform-motion',
        note: 'One argues on axes, where the claim is carried by how the line tilts; the other argues on the track itself, where the claim is carried by marks and the spaces between them.',
      },
    ],
  },
};
