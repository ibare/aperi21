/**
 * drag-in-fluid 개념 선언.
 *
 * 저항 형제 셋과 **무엇을 바꾸어 견주는가**로 갈랐다. 이미 선언된 둘과 definition 이
 * 붙기 가장 쉬운 자리라 좁게 썼다.
 *   drag-in-fluid     빠르기 · 두께를 묶어 두고 **뒤 모양**만 바꾼다 — 자국의 넓이와 열 배 차이
 *   drag-force        몸을 묶어 두고 **빠르기**를 올린다 — 1차 몫과 2차 몫이 갈린다
 *   terminal-velocity 저항이 자라 **무게와 같아진다** — 더는 빨라지지 않는다
 * 이쪽만 유선형 · 후류 · 소용돌이 줄 · 같은 두께 어휘를 갖는다. 속력 의존 · 낙하 · 균형은 쓰지 않고
 * exemplarKeywords 도 구어까지 겹치지 않게 두었다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const dragInFluidConcept: Aperi21ConceptSource = {
  id: 'drag-in-fluid',
  label: 'Shape and the Trail It Leaves in a Fast Flow',
  canonicalSim: 'aperi21:drag-in-fluid',

  surface: {
    definition:
      'How the shape of a body’s rear settles its resistance in a fast flow, a blunt body trailing a wide churning wake while a streamlined one of equal thickness trails almost none.',
    exemplarKeywords: [
      'streamlining',
      'why are cars and aircraft shaped like teardrops',
      'the wake behind a blunt body',
      'vortex shedding from a cylinder',
      'same frontal area but ten times the resistance',
      'a rounded nose is not enough, the tail is what matters',
      'a cylinder against an aerofoil section in the same stream',
      'resistance made by the flow coming away behind',
      'what a wide trail costs a body',
      'a flat plate is worse than a teardrop',
    ],
  },

  briefing: {
    observable: [
      'Two lanes lie one above the other, each carrying the same flow at the same speed, shown by grey lines of smoke running left to right.',
      'A round section stands in the upper lane and a streamlined section in the lower one. They are the same thickness and their fronts are in the same place, so the only difference between them is the shape behind.',
      'Dye is released from the rear of each body so that what each leaves behind can be seen.',
      'Behind the round body the dye rolls into a train of curls, first on one side and then on the other, and spreads across the full width of the lane; the smoke lines there are thrown about.',
      'Behind the streamlined body the dye stays a single thread, narrower than the body itself, and the smoke lines beside it run straight.',
      'An arrow in the accent colour then grows from the rear of each body, both drawn to one scale. The one behind the round body ends about ten times the length of the other.',
      'The arrows are held long enough to be read against one another, and are then taken away while the flow and the two trails carry on.',
      'The two bodies are drawn in the same colour, and the dye is the same colour in both lanes, so the trails are told apart by how wide they spread and not by hue.',
      'The flow speed never changes, no body is ever tilted, and nothing falls.',
      'No speed, no force and no coefficient is written; the only quantity stated is the ratio between the two arrow lengths.',
    ],

    screen: {
      affordances: [
        'The picture opens with the flow already filled in and both trails already formed, so the contrast is there from the first moment and the arrows grow within a second of arriving.',
        'Each arrow starts from its own body’s rear rather than from a shared line, because what has to be compared is their lengths; started from the centres, the short one would be lost inside the streamlined body.',
        'The accent colour is spent on the resistance alone — the two arrows and the one word naming them.',
        'The two bodies are matched in thickness on purpose, so that a reader cannot put the difference down to one being smaller.',
        'The round body’s curls are cut off where they reach the top of its lane, and the two flows never touch, so each trail belongs to one body only.',
        'Nothing is offered to press. Changing the flow’s speed would lengthen both arrows together and leave the ratio exactly as it was.',
      ],
    },

    useWhen: [
      'The article has said that streamlining cuts resistance and the reader pictures that as sharpening the front. Two bodies that share a front and differ only behind is the correction, and the ten-to-one arrows are what it costs.',
      'The article has stated that in a fast flow most of the resistance comes from what the body leaves behind it. The train of curls set against a single thread is that sentence made into something to look at.',
      'The reader has the idea that resistance is about pushing the fluid out of the way in front. Both bodies here push aside exactly as much and are held back quite differently.',
    ],

    avoidWhen: [
      'The point is how resistance depends on speed, or that it climbs faster than in proportion as a body goes quicker. Both lanes here run at one fixed speed from beginning to end.',
      'The article is about a small body creeping through a thick, syrupy liquid, where resistance rises simply with its size and its speed. The flow here is fast enough to shed curls behind a body.',
      'The subject is a body falling until what resists it matches its weight, or settling into a steady descent. Nothing falls in this picture and no weight is drawn.',
      'The claim concerns lift, an angle of attack, or the pressure around a wing. Both bodies are symmetrical, both face the flow head-on, and no pressure is painted anywhere.',
      'The subject is the thin slowed sheet of fluid on a body’s surface. Nothing here is drawn against the wall of either body.',
      'Values are wanted — a force in newtons, a coefficient, a speed. Only the ratio between two arrows is claimed, and it is claimed roughly.',
    ],

    contrastWith: [
      {
        concept: 'drag-force',
        note: 'One holds the speed fixed and changes the body to ask what shape is worth; the other holds the body fixed and lets it speed up, to ask how the resistance is built out of a part that follows speed and a part that follows its square.',
      },
      {
        concept: 'terminal-velocity',
        note: 'One sets the resistance on two bodies against each other in the same stream; the other sets the resistance on one body against its own weight and asks when they come level.',
      },
      {
        concept: 'boundary-layer',
        note: 'One is about what the slowed fluid costs once it has come away and spread out behind; the other is about that fluid while it still lies against the surface.',
      },
      {
        concept: 'reynolds-number',
        note: 'One changes the body and keeps everything about the stream the same; the other leaves the body aside and changes the stream, asking when two of them count as the same flow.',
      },
    ],
  },
};
