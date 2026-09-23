/**
 * lift-force 개념 선언.
 *
 * `bernoullis-principle` 과 가까우나 **주어가 다르다.**
 *   bernoullis-principle  **유체 자체** — 두 몫의 합이 일정하다는 규칙이 주장이다
 *   lift-force            **흐름 속에 놓인 물체** — 비스듬한 날개가 흐름을 가르고, 위쪽이
 *                         앞질러 가며 압력이 낮아 날개가 위로 밀린다
 * 이쪽만 「날개 · 받음각 · 갈라진 연기 줄 · 앞지른다」 어휘를 갖는다. 「두 몫 · 물기둥 ·
 * 합이 일정」 은 쓰지 않는다.
 *
 * 화면은 양력의 **크기**(화살표 · 계수)도 실속도 말하지 않는다. 주제 설명의 「어느 순간
 * 무너진다」 와 벌어지는 자리라 avoidWhen 으로 되돌리고 간극 장부에 올렸다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const liftForceConcept: Aperi21ConceptSource = {
  id: 'lift-force',
  label: 'Lift From a Wing Held at an Angle',
  canonicalSim: 'aperi21:lift-force',

  surface: {
    definition:
      'The upward push on a wing held at an angle to oncoming air, which parts the stream so that the share going over the top arrives ahead of the share going under, at lower pressure.',
    exemplarKeywords: [
      'lift',
      'how does a wing fly',
      'angle of attack',
      'aerofoil',
      'airfoil',
      'air over the top of a wing moves faster',
      'why does an aeroplane stay up',
      'smoke tunnel photographs of a wing',
      'low pressure above the wing and higher below',
      'tilting a wing into the wind',
    ],
  },

  briefing: {
    observable: [
      'A wing section is held in a stream running from left to right, drawn solid against the air around it.',
      'The air itself is shaded by its pressure: palest where the flow is slowed and piled up at the nose, and darkest over the forward part of the upper surface, where it is lowest.',
      'Fine smoke lines drift past continuously, following the air around the wing.',
      'One line stands out in amber: it is released straight up and down in a single instant, so everything on it started together.',
      'That line meets the nose and splits. The upper half runs along the top and pulls ahead; the lower half falls behind under the belly, and the gap between them opens wider the further back they go.',
      'Slide the angle down to nought and the two halves pass the wing abreast, the shading above and below matching, and the caption changes to say so.',
      'Raising the angle again lays down a fresh line and the flow rebuilds from the start in a moment.',
      'No arrow, no number and no name is drawn on the wing itself — what is written is the caption under the picture and the slider’s own value.',
    ],

    screen: {
      affordances: [
        'A slider sets the angle at which the wing meets the air, working from nought up to twelve degrees, and it starts partway up that range.',
        'Changing it washes the smoke out and runs the flow forward again, so the picture is always of a settled stream rather than one still filling in.',
        'The amber line is the instrument: one colour spent on one meaning, which is "these started together".',
        'Pressure is shown as shade only, so the eye compares two regions rather than reading a value, and the wing is the only opaque thing in the picture.',
        'No grid and no camera are drawn — what is to be compared is above against below, not any distance.',
      ],
    },

    useWhen: [
      'The article has said that air moves faster over a wing and the reader has met the old story that the two halves must meet up again behind it. Watching the upper half pull clear and never be rejoined is what corrects that, and it is visible in one pass.',
      'The reader suspects that the wing’s curved shape is doing all the work. Taking the angle to nought and seeing the two halves run abreast puts the tilt back at the centre of the argument.',
    ],

    avoidWhen: [
      'The article turns on stalling — on lift growing with angle and then collapsing. This wing is only ever taken to a modest angle and the flow stays attached throughout.',
      'The size of the lift is wanted, or how it grows with speed, wing area or a coefficient. Nothing in the picture is a force, and nothing is measured.',
      'The subject is drag on the wing, or the cost of holding it at an angle.',
      'The claim to be carried is the pressure–speed rule as such, stated for a fluid on its own. That rule is used here, not argued.',
      'The article explains lift through circulation, vortices, or the downward turning of the air as a whole. What is drawn is the split stream and the pressure it leaves.',
    ],

    contrastWith: [
      {
        concept: 'bernoullis-principle',
        note: 'One is the rule about a fluid, stated as a trade between speed and pressure; the other is a body put in the stream, where the trade comes out unequal on its two sides and the body is pushed.',
      },
      {
        concept: 'drag-force',
        note: 'Both are what a fluid does to a body moving through it: one is the push across the stream that holds the body up, the other is the resistance along it that holds the body back.',
      },
      {
        concept: 'venturi-effect',
        note: 'Both put a low pressure to work — one to move the body the stream flows past, the other to move liquid out of a vessel and into the stream.',
      },
    ],
  },
};
