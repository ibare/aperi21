/**
 * mechanical-advantage 개념 선언.
 *
 * `balance-scale` 과 지레를 함께 쓰므로 definition 이 붙기 쉽다. **묻는 것**으로 갈랐다.
 *   balance-scale         수평이 되는 **조건** — 거리와 무게가 맞는가
 *   mechanical-advantage  들 때의 **맞바꿈** — 힘이 줄면 민 거리가 그만큼 는다
 * 이쪽만 세 도구의 견줌 · 민 거리 띠 · 같은 높이 어휘를 갖고, 수평 · 기울기 어휘를
 * 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const mechanicalAdvantageConcept: Aperi21ConceptSource = {
  id: 'mechanical-advantage',
  label: 'Mechanical Advantage',
  canonicalSim: 'aperi21:mechanical-advantage',

  surface: {
    definition:
      'The trade a lever or a ramp makes when a load is raised, cutting the force the hand must supply and lengthening, by that same factor, the distance the hand must travel.',
    exemplarKeywords: [
      'mechanical advantage',
      'levers and ramps',
      'why is pushing up a ramp easier than lifting',
      'does a machine give you something for nothing',
      'less force over a longer distance',
      'simple machines',
      'effort and load',
      'lever with arms one to two',
      'you cannot cheat with a machine',
      'pushing a heavy box up a slope',
    ],
  },

  briefing: {
    observable: [
      'Three panels stand side by side, each with an identical box marked 120 N, and one dashed line crosses all three at the height they are all taken to, with that height written on it.',
      'The leftmost box is lifted straight up on a rope, the middle one on a lever whose arms are one to two, the right one pushed up a ramp four times as long as it is high.',
      'A hand works each one, with a force arrow on it; the three arrows are on one scale and come out at 80, 40 and 20 N.',
      'Beside each hand a band grows along the path the hand has taken, starting from a tick left where the hand began, and the three bands finish at about 0.5, 1.0 and 2.0 m.',
      'On the lever the hand swings through an arc, so its band curves along with it.',
      'Under each panel a written line names the tool and gives the hand’s force and the distance it has pushed so far, changing as the lift goes on.',
      'All three boxes reach the top at the same moment and are held there for a second and a half, with the three bands standing side by side to be read.',
      'The caption speaks in the present while the boxes are rising and in the past once they are held, naming half the force for twice the distance and a quarter for four times.',
    ],

    screen: {
      affordances: [
        'The three lifts, the hold and the setting down run and repeat by themselves; arriving, the boxes are already off the ground.',
        'The three panels share one height line and one force scale, so the comparison across them is a matter of looking rather than of working out.',
        'Each band runs right up to its own hand, so how far that hand has come is read in the same place as how hard it is pushing.',
        'The bands fade out while the boxes are set back down, and the tick where each hand began stays until they do.',
      ],
    },

    useWhen: [
      'The article has said a machine "makes the work easier" and the reader is hearing that as work disappearing. Three bands of visibly different lengths, arriving at one height at one moment, is what puts the price back on the table.',
      'The claim is that the factor by which the force drops is exactly the factor by which the distance grows, and a case is wanted where both numbers are on screen at once for three tools.',
    ],

    avoidWhen: [
      'The subject is a beam sitting level, or what makes two sides balance. Everything here is in motion and nothing is asked to hold still.',
      'Work or energy in joules is what is being traded. No product is formed anywhere; only forces and distances are given.',
      'The article is about friction, efficiency or a real machine losing part of what goes into it. These three lifts are clean.',
      'Pulleys, gears or wheel-and-axle are the machines in question. Only a straight lift, a lever and a ramp are here.',
    ],

    contrastWith: [
      {
        concept: 'balance-scale',
        note: 'One asks what a ratio of arm lengths costs when something is actually raised with it; the other asks what ratio leaves a beam sitting level with nothing moving at all.',
      },
      {
        concept: 'atwood-machine',
        note: 'One uses a tool to cut the force a hand must give while a load goes up; the other has two loads pulling against each other with no hand in it, and asks how fast the pair then moves.',
      },
    ],
  },
};
