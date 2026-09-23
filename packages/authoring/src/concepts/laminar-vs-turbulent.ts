/**
 * laminar-vs-turbulent 개념 선언.
 *
 * 점성 셋과 나뉘는 자리는 **질서가 유지되는가** 다. 셋은 층이 순서를 지킨다고 놓고
 * 힘 · 유량 · 가라앉는 빠르기를 말하고, 이쪽은 그 순서가 **언제 무너지는가**를 묻는다.
 * 그리고 무너짐을 상태 전환이 아니라 **증폭**으로 옮겼다 — 늘 같은 크기로 넣어 주는 작은
 * 흔들림이 하류로 가며 잦아들거나 스스로 커진다.
 *
 * 다음 묶음의 `reynolds-number` 와 겹치지 않게, definition 의 주어는 **갑작스러움**이고
 * 무차원 수의 구성(속력 · 지름 · 점성의 조합)은 말하지 않는다. 그쪽 개념은 아직 선언되지
 * 않아 contrastWith 로 가리킬 수 없다(로드 시점에 throw 한다).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const laminarVsTurbulentConcept: Aperi21ConceptSource = {
  id: 'laminar-vs-turbulent',
  label: 'Why Smooth Flow Breaks Up All at Once',
  canonicalSim: 'aperi21:laminar-vs-turbulent',

  surface: {
    definition:
      'Why flow does not roughen by degrees but changes character abruptly: an ever-identical small disturbance either dies away downstream or grows of itself, and which it does turns at one threshold.',
    exemplarKeywords: [
      'laminar and turbulent flow',
      'transition to turbulence',
      'when does flow become turbulent',
      'a dye thread in a pipe suddenly breaks up',
      'Reynolds’ dye experiment',
      'why is the change sudden rather than gradual',
      'smooth flow turning chaotic',
      'a disturbance that grows as it travels downstream',
      'smoke that rises straight and then curls',
      'the threshold at which flow changes character',
    ],
  },

  briefing: {
    observable: [
      'A long pipe runs across the picture, seen from the side, with a thread of dye injected along its centre near the inlet and carried downstream; a label names the dye as colour put in to make the flow visible.',
      'A needle keeps feeding in the same tiny wobble at the same place, unchanged for the whole of the picture — what differs downstream is never what was put in.',
      'Below the pipe runs a scale of flow numbers, ticked and numbered at a thousand, two thousand, two thousand three hundred, three thousand, four thousand and five thousand, and named as growing with speed and with the width of the pipe.',
      'The tick at two thousand three hundred is named underneath as the critical value.',
      'A dark round handle sits on that scale with the present number written just above it, so the setting is always readable where the change is happening.',
      'Below the critical value the wobble in the thread shrinks as it travels and the thread is straight again by the far end.',
      'At the critical value it neither shrinks nor grows, holding its size the whole length of the pipe.',
      'Above it the thread curls up on its own, and the further above, the nearer the inlet the curling begins — the place it breaks up creeps back upstream.',
      'Left alone, the handle steps through six settings and then comes back down to the first, so that the same numbers are met on the way down as on the way up.',
      'A caption line names which of the four things is happening — fading, holding, growing, or the break-up creeping upstream.',
    ],

    screen: {
      affordances: [
        'The scale is the control: the handle drawn on it is the thing to press and drag, so the number being set and the flow it governs are in one picture.',
        'While the handle is held, the automatic stepping stops and the flow answers the handle directly, which is what lets a reader sit just below and just above the critical tick and go back and forth.',
        'A few seconds after it is let go the value stays put, then moves to the nearest of the six settings and the automatic stepping picks up again.',
        'The sweep ends by coming back down through the same values it climbed, which is the picture’s way of saying the break-up is a matter of the number and not of what has happened before.',
        'The pipe is drawn long on purpose: whether a disturbance is growing or dying only shows as a comparison between its size at the inlet and further along.',
        'The disturbance put in is held fixed throughout, so any difference downstream belongs to the flow rather than to the injection.',
      ],
    },

    useWhen: [
      'The article has named two regimes of flow and the reader takes them as two separate things rather than two outcomes of one mechanism. Watching the same wobble die at one setting and grow at another makes the break-up a matter of degree that shows up all at once.',
      'The reader wants to know why there should be a sharp threshold at all rather than a gradual roughening, and the part to point at is the setting where the disturbance neither shrinks nor grows.',
    ],

    avoidWhen: [
      'The article needs the flow number built up out of speed, width, density and thickness, or its formula given. Here it is a scale to be set, and nothing in the picture says what it is made of.',
      'The subject is how much a pipe delivers, or how the speed varies from axis to wall in smooth flow. Only the thread down the centre is drawn.',
      'The point is the friction between layers as a force, or what it takes to shear a fluid.',
      'The article is about drag on a body, or how a wake behind an obstacle behaves. There is nothing in this pipe but the flow and the dye.',
      'The subject is a boundary layer, or how the flow behaves close to the wall. What is watched is the centre of the pipe.',
      'Values are wanted for the speed or the width of the pipe. The only numbers written are on the scale.',
    ],

    contrastWith: [
      {
        concept: 'poiseuille-flow',
        note: 'One is the smooth regime relied on and asks what a pipe delivers within it; the other asks how far that regime reaches before it stops holding.',
      },
      {
        concept: 'viscosity',
        note: 'One has the layers keeping their order and asks what it costs to make them slide over one another; the other asks when they cease to keep their order at all.',
      },
      {
        concept: 'drag-force',
        note: 'Both turn on a change of regime with speed: one in how the resistance on a body grows, the other in whether the flow itself stays orderly.',
      },
      {
        concept: 'energy-dissipation',
        note: 'One is where the orderly motion starts breaking into eddies; the other is where what becomes of the motion once it is lost is the claim.',
      },
    ],
  },
};
