/**
 * spacetime-diagram 개념 선언.
 *
 * 시공간 둘 중 하나. `light-cone` 과 갈랐다.
 *   spacetime-diagram  도표를 **읽는 법** — 기울기가 속도이고, 속도를 고르면 동시선이
 *                      세계선과 **같은 각만큼** 기운다
 *   light-cone         **인과의 경계** — 무엇이 무엇에 닿을 수 있는가, 틀을 바꿔도 그대로
 * `relativity-of-simultaneity` 와도 갈랐다 — 저쪽은 기차와 빛이 있는 장면이고 이쪽은
 * 축과 세계선이 있는 도표다. `twin-paradox` 와는 동시선이 **기우는** 것 ↔ **도는** 것.
 *
 * 이 묶음에서 유일하게 조작기가 있다(속도 슬라이더).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const spacetimeDiagramConcept: Aperi21ConceptSource = {
  id: 'spacetime-diagram',
  label: 'Reading a Spacetime Diagram — Worldline and Line of Now',
  canonicalSim: 'aperi21:spacetime-diagram',

  surface: {
    definition:
      'A drawing of motion with time upward and space sideways, where an observer\'s speed is the slope of their path and their line of now tilts by as much.',
    exemplarKeywords: [
      'spacetime diagram',
      'worldline',
      'line of simultaneity',
      'the slope of a worldline is its speed',
      'how to read a Minkowski diagram',
      'why is the moving observer\'s now not horizontal',
      'time upward and space sideways',
      'the light line at forty-five degrees',
      'both axes tilt together toward the light line',
      'turning the observer\'s speed up and down on a diagram',
    ],
  },

  briefing: {
    observable: [
      'Two words set the convention — time upward, space sideways — and no gradations are drawn on either direction.',
      'Two dotted lines cross the picture at forty-five degrees through the origin, each named as light, and they serve as the axis everything else folds about.',
      'A single observer is drawn as a line through the origin, solid below the moving point that stands for them and dotted above, so what has been lived is told from what has not.',
      'A second line through that same moving point is the one they would call now, drawn in the one strong colour used on the picture and named as such where it ends.',
      'Two arcs of the same size sit in the same quarter of the picture, one between the upright and the observer\'s line and one between the sideways direction and the line of now, and the two are plainly equal.',
      'Three events sit in a row at the same height — together, for an observer who does not move — and each begins as a hollow circle.',
      'The line of now sweeps up the picture, and each event it crosses fills in solid, throws off a spreading ring, and is written with its place in the order: first, second, third.',
      'When the observer is at rest the line is level and all three fill in at the same moment; when it is tilted, one end of the row fills in first and the rest follow in turn, with the order reversing according to which way the observer goes.',
      'Between rounds the line of now drops back to the origin so that it and the observer\'s line are seen tilting away from level together, from the same point, by the same amount.',
      'A line of writing under the picture names what is happening: the two tilting together, the three arriving at once, or the row filling from one end.',
      'On its own the picture cycles through going one way, going the other, and standing still, and the arcs disappear whenever the observer is at rest.',
      'The order is shown by the sequence of filling and by the written places rather than by any time being read off.',
    ],

    screen: {
      affordances: [
        'A slider sets the observer\'s speed, in hundredths, either way up to eight tenths of light speed, and shows its value.',
        'Taking hold of the slider stops the automatic cycle and keeps the picture sweeping at whatever speed is chosen, which is what lets very small speeds be tried.',
        'Left alone, the slider follows the automatic cycle itself, so the position of the handle always matches the picture.',
        'At speeds small enough that the tilt is barely visible the order still comes out, with only the gaps between the fillings closing up — which is the thing worth reaching for by hand.',
        'The strong colour is used for one meaning only, the observer\'s now, so nothing else on the picture competes with it.',
      ],
    },

    useWhen: [
      'An article is about to argue in spacetime pictures and the reader has never been shown what the lines in one mean. Speed as a slope, and the line of now tilting by the same angle about the light line, is the reading lesson.',
      'The reader accepts that observers disagree about simultaneity but wants to see it as a property of the drawing rather than a story about trains, and to try it at speeds of their own choosing.',
    ],

    avoidWhen: [
      'The reader needs the disagreement shown in physical objects — a vehicle, a flash, detectors coming on. Everything here is lines and marks on a diagram.',
      'The article follows one observer who reverses and returns, or who ends up younger. There is a single unbroken path here and no reunion.',
      'The point is which events can influence which, or a boundary that nothing crosses. No region of reach is marked.',
      'What is wanted is how far a clock falls behind or how short a body measures. Nothing on the picture is a clock or a body.',
      'Values off the axes are wanted — coordinates, elapsed times, a factor. Neither direction carries gradations and the only figure shown is the chosen speed.',
    ],

    contrastWith: [
      {
        concept: 'relativity-of-simultaneity',
        note: 'One is the convention for drawing accounts of motion, in which a change of observer shows up as a tilt; the other is the physical claim that fuels it, stated in objects rather than lines.',
      },
      {
        concept: 'light-cone',
        note: 'One is about reading speed and simultaneity off a diagram, where everything moves when the observer\'s speed changes; the other picks out the one structure on such a diagram that does not move at all.',
      },
      {
        concept: 'twin-paradox',
        note: 'One keeps a single observer and varies their speed to show the line of now tilting; the other keeps a single speed and has the line swing at one instant, which is what leaves a difference in age.',
      },
      {
        concept: 'position-time-graph',
        note: 'Both read a slope as speed, but one puts time on the upright axis and adds a second line for what the mover counts as now, which the other has no counterpart for.',
      },
    ],
  },
};
