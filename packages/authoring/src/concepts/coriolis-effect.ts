/**
 * coriolis-effect 개념 선언.
 *
 * 가속 기준틀 셋의 셋째. 이쪽의 주어는 **경로의 모양**이다 — 곧게 던진 하나가 도는 판
 * 위에서 휜 길로 그려지고 겨눈 과녁을 비껴 간다. 힘 어휘를 쓰지 않는 것이
 * `fictitious-force` 와 갈리는 자리이고, 틀이 **돈다**는 것이 `non-inertial-frame` 과
 * 갈리는 자리다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const coriolisEffectConcept: Aperi21ConceptSource = {
  id: 'coriolis-effect',
  label: 'Coriolis Effect',
  canonicalSim: 'aperi21:coriolis-effect',

  surface: {
    definition:
      'The sideways bending of a straight throw when it is told from a turning frame, the path curling away from a target that was squarely aimed at because the frame came round under it.',
    exemplarKeywords: [
      'Coriolis effect',
      'throwing a ball on a spinning roundabout',
      'why does the path curve on a rotating platform',
      'deflection in a rotating frame',
      'the ball misses the target on a turntable',
      'aimed straight at it and still missed',
      'why do storms spin the way they do',
      'winds deflected on the turning Earth',
      'straight from outside, curved from on board',
      'merry-go-round throw to the far edge',
    ],
  },

  briefing: {
    observable: [
      'Two panels stand side by side, each with a written label saying whose account it is — seen from outside, seen on the disk.',
      'A disk with six spokes turns steadily, a target rides fixed on its rim, and a flag at the edge says how far round it has come.',
      'A thrower at the centre lets the ball go straight at the target.',
      'In the left panel the trail the ball leaves is a straight line from the centre out to the rim.',
      'In the right panel, which is the same throw, the target holds its place while the trail curls away to one side, so the ball arrives past it.',
      'The ball reaches the rim, ball and trail dim away, and another throw begins.',
      'The spokes and the flag come round at the same rate in both panels, so how far the frame has turned during the flight is something to look at.',
      'The caption says that one and the same ball flies straight seen from outside and curves on the spinning disk.',
    ],

    screen: {
      affordances: [
        'The throw, the flight and the dimming run and repeat by themselves in a round of about three and a half seconds; arriving, a throw is already half flown.',
        'Both panels come off one clock, so the two pictures are of one throw and the comparison is made by looking across rather than by switching.',
        'The trail is laid down along the whole flight and stays until the throw is over, so the two shapes can be held side by side rather than remembered.',
      ],
    },

    useWhen: [
      'The reader has heard that something deflects moving air or moving water and is picturing a sideways shove. One throw drawn twice, straight in one panel and bent in the other, is what moves the bending off the ball and onto the frame.',
      'The article needs a case where a body that was let go and went on exactly as it was nevertheless has to be described as having turned aside.',
    ],

    avoidWhen: [
      'The article needs a force with a size — what to call it, how it scales with the body. No arrow is drawn on the ball anywhere.',
      'The frame in question is speeding up along a straight line rather than turning.',
      'The subject is what holds a body in a circle — a pull along a string, a banked road, a rider on a ride. The ball here is let go at the centre and keeps its own line.',
      'Numbers are wanted: a rate of turning, a latitude, a distance missed by. Not one is written.',
      'The point is that two accounts of one motion are equally lawful. Here one of the frames is turning, and the labels say which.',
    ],

    contrastWith: [
      {
        concept: 'non-inertial-frame',
        note: 'One has the frame turning, so a straight flight comes out bent; the other has the frame picking up speed along a line, so a body at rest comes out sliding backwards.',
      },
      {
        concept: 'fictitious-force',
        note: 'One stays with the shape of the path and names no force; the other names the force and asks what it is proportional to.',
      },
      {
        concept: 'reference-frame',
        note: 'One has two observers in steady relative motion, where a curve in one account and a straight line in the other are both simply what each sees; the other has one observer turning, and the bend is the whole of what is claimed.',
      },
    ],
  },
};
