/**
 * impulse-force-relation 개념 선언.
 *
 * 이 묶음에서 형제가 가장 멀다. 그래도 `equilibrium-of-forces` 와 「멈춰 있다」 가
 * 겹치므로 definition 의 주어를 **멈추는 데 걸린 시간과 그동안 받는 힘의 맞바꿈**으로
 * 좁혔다 — 저쪽은 이미 멈춰 있는 물체의 힘들이 상쇄되는 조건이다.
 *
 * 화면은 두 곡선의 넓이가 같다는 것을 표시하지 않는다(장부 참조). observable 은
 * 실제로 보이는 것 — 높고 좁은 언덕과 낮고 넓은 언덕 — 만 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const impulseForceRelationConcept: Aperi21ConceptSource = {
  id: 'impulse-force-relation',
  label: 'Force and Impulse',
  canonicalSim: 'aperi21:impulse-force-relation',

  surface: {
    definition:
      'The trade between the force a body feels and the time it is given to come to rest, where drawing the same stop out over longer buys it at a much lower force.',
    exemplarKeywords: [
      'impulse and force',
      'force times time',
      'why do airbags and crumple zones help',
      'bending your knees when you land',
      'catching a ball with your hands giving way',
      'same stop taken over a longer time',
      'a short large force and a long small one',
      'hitting a wall versus landing on a mat',
      'stopping gradually hurts less',
      'impulse momentum theorem in practice',
    ],
  },

  briefing: {
    observable: [
      'Two lanes run side by side, each with a written name — hard wall, soft cushion — and each with its own ball coming in at the same speed under a velocity arrow.',
      'The ball at the wall is brought to a stop in a quarter of a second, flattening against it, and a long force arrow appears inside it while it happens.',
      'The ball at the cushion presses a dent into the cushion and takes as long to stop as the slider says, and its force arrow stays short the whole time.',
      'Both force arrows are drawn to one scale, so which of the two is the longer is a matter of looking.',
      'Below each lane a curve of force against time is drawn as the contact goes on, filled in beneath, on axes named for force and for time.',
      'The wall gives a tall narrow hump and the cushion a low broad one, and both stay on screen after the two balls have finished stopping.',
      'The caption follows what is happening — the approach, the wall stopping its ball in an instant, the cushion still stopping its own, and at the end that the slower stop came at a much lower force.',
    ],

    screen: {
      affordances: [
        'A slider sets how long the cushion takes to stop its ball, from a quarter of a second up to two seconds in quarter-second steps, starting at one and a half.',
        'Changing it puts both balls back at the start, so the two stops are always compared from one clock.',
        'Turned down to the shortest setting, the cushion gives the same sharp hump as the wall and the caption says both feel the same large force — the two lanes coincide when the times do.',
        'A round of six and a half seconds runs and repeats on its own, with several seconds at the end where the two finished curves stand together.',
      ],
    },

    useWhen: [
      'The reader has been handed force times time and is carrying it as an equation. Two balls arriving alike and leaving alike, with one hump tall and narrow and the other low and broad, is what turns it into a trade that was made.',
      'The article is about padding, crumple zones or landing softly, and the claim needed is that nothing about the stop itself was changed — only how long it was allowed to take.',
    ],

    avoidWhen: [
      'The subject is two bodies colliding with each other — recoil, sharing out momentum, one pushing the other away. Each ball meets a fixed wall or cushion and nothing comes back.',
      'The article turns on bouncing, springiness or how much is given back. Both balls simply stop and stay stopped.',
      'Energy is the quantity being traded — work done, kinetic energy absorbed, heat. The curves here are of force against time.',
      'Values are wanted: a momentum, a force in newtons, an impulse. Not one number is written, and the slider reading is the only figure on screen.',
    ],

    contrastWith: [
      {
        concept: 'average-acceleration',
        note: 'Both weigh a change against the time it took, one as the rate at which a velocity moved between two moments, the other as the force a body actually had to take while that was going on.',
      },
      {
        concept: 'equilibrium-of-forces',
        note: 'One has a body brought to rest by a force that does not cancel and asks what that cost; the other has a body already at rest because the forces on it do cancel.',
      },
    ],
  },
};
