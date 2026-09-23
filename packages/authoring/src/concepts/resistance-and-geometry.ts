/**
 * resistance-and-geometry 개념 선언.
 *
 * 저항 넷 가운데 이쪽은 **형태**다 — 같은 재료·같은 전압에서 길이와 단면적이 저항을 정한다.
 *   resistance-and-geometry    길게 하면 절반, 굵게 하면 두 배가 **빠져나간다**
 *   ohms-law                   저항은 주어진 수이고 **전압**을 올린다
 *   temperature-and-resistance 모양은 그대로이고 **온도**가 바꾼다
 *   series-parallel-resistors  낱개 저항 둘을 **이어 붙이는 방식**을 바꾼다
 * 길이·단면적·굵기·비저항·형태 어휘는 이쪽에만 둔다. 화면의 이음매 점선이 직렬·병렬을
 * 암시하지만 낱개 소자를 잇는 것은 아니므로 series-parallel-resistors 와 갈라 둔다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const resistanceAndGeometryConcept: Aperi21ConceptSource = {
  id: 'resistance-and-geometry',
  label: 'Resistance Set by Length and Cross-Section',
  canonicalSim: 'aperi21:resistance-and-geometry',

  surface: {
    definition:
      'That the shape of a conductor decides its resistance as much as its material does: at one and the same voltage, twice the length lets half as much charge through in a given time, and twice the cross-section lets twice as much.',
    exemplarKeywords: [
      'resistivity',
      'why a thin wire has more resistance',
      'R equals rho L over A',
      'a longer wire resists more',
      'a thicker wire resists less',
      'cross-sectional area and how much current gets through',
      'does the length of a wire matter',
      'resistance depends on length and thickness',
      'same material cut to different shapes',
      'comparing conductors that differ only in dimensions',
    ],
  },

  briefing: {
    observable: [
      'A battery at the top sends two rails down the picture, and three bars of the same material are slung between them side by side, so that all three receiving the same voltage is a matter of the wiring rather than of assertion.',
      'The bars are named by their shape: one as the reference, one twice as long, one twice as thick, and their right-hand ends line up in one column.',
      'Grains fill every bar at the same spacing and in lanes the same distance apart, running left to right, with a mark naming them once.',
      'The grains in the long bar move at half the reference speed and their tails are correspondingly shorter; the grains in the thick bar move at the reference speed but in twice as many lanes.',
      'Gates in the accent colour then stand at the three exits, and every grain that passes a gate adds one to a heap built beyond the right-hand rail.',
      'The thick bar’s heap grows the fastest and the long bar’s the slowest.',
      'When the counting stops the heaps stand at twelve, six and twenty-four, every heap built two deep, so their widths read directly as one, a half and two.',
      'A dotted line crosses the middle of the long bar and runs along the middle of the thick one, marking the first as two reference bars set end to end and the second as two set alongside each other.',
      'The bars carry only their shape labels; no resistance and no current is written anywhere.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the three bars run, the gates stand, the heaps build, the finished heaps are held for comparison, and the run begins again.',
        'Only one thing at a time is altered from the reference bar, so which of the two shapes is responsible is never in question.',
        'Cross-section is shown as the thickness of the bar and read as the number of lanes the grains flow in, the drawing being flat and having no end-on view to give.',
        'The grain spacing is identical in all three bars, so that the material being the same is seen rather than stated, and any difference in what gets through comes from speed or from lanes.',
        'The heaps are always two deep, so the count is read straight off as the width of the heap instead of as a number.',
        'The grains in the heaps are drawn exactly like the grains in the bars, because they are the same grains, and the accent colour is kept for the gate that is doing the counting.',
        'Both causes end up on one scale: the slow bar and the wide bar are told apart while they run, and then settled by a single count at the exit.',
      ],
    },

    useWhen: [
      'The article has given the resistivity relation and the reader cannot see why length and area pull opposite ways. Heaps of six and twenty-four beside a reference twelve separate the two causes without a calculation being made.',
      'The prose needs the point that the thick conductor carries more without the carriers going any faster, so that "more current" is not read as "faster electrons".',
    ],

    avoidWhen: [
      'The article is about separate resistors wired together. All three bars here are single pieces of one material fed from one pair of rails.',
      'The subject is how resistance changes when the conductor is heated or cooled. Nothing changes during the run; the three shapes are fixed from the start.',
      'A resistance or a current is wanted in ohms or amperes, or the resistivity of a named metal is being quoted. Only ratios of shape appear on screen.',
      'The reader is to choose the length or the thickness. The three bars are set and are watched side by side.',
      'The article is about heat given off in a conductor, or about a thin wire glowing or failing. Nothing here warms.',
      'The point is how the current answers to the voltage. One voltage is used throughout and is never raised.',
      'The conductor is a fluid channel, a pipe or a duct, and the drag of the walls is the subject. What moves here is charge in a solid bar.',
    ],

    contrastWith: [
      {
        concept: 'ohms-law',
        note: 'One holds the voltage at one value and asks what the shape of the conductor does to the resistance; the other takes the resistance as given and asks what raising the voltage does to the current.',
      },
      {
        concept: 'series-parallel-resistors',
        note: 'One reads a long bar as two reference bars end to end and a thick bar as two set alongside, but only as a way of seeing shape; the other actually wires separate resistors into those two arrangements and asks what the supply then delivers.',
      },
      {
        concept: 'temperature-and-resistance',
        note: 'One changes the resistance by cutting the conductor to a different shape; the other leaves the shape alone and changes the resistance by heating it, which can go either way depending on the material.',
      },
      {
        concept: 'poiseuille-flow',
        note: 'Both find that a longer, narrower channel passes less for the same push, but one counts charge leaving a solid conductor, and the other follows a viscous fluid in a pipe, where narrowing costs far more steeply.',
      },
      {
        concept: 'drift-velocity',
        note: 'One shows carriers in the thick bar going no faster than in the reference while twice as much gets through; the other is about how slowly the carriers move at all and why that delays nothing.',
      },
    ],
  },
};
