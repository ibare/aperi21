/**
 * potential-energy-curve 개념 선언.
 *
 * 퍼텐셜 셋 중 이쪽만 **저장을 말하지 않는다.** 갈림은 무엇을 묻는가다.
 *   potential-energy-curve          곡선과 선이 만나는 곳이 **어디서 되돌아오는가**를 정한다
 *   gravitational-potential-energy  높이에 **얼마나** 담기는가 (비례)
 *   elastic-potential-energy        변형에 **얼마나** 담기는가 (제곱)
 * `conservation-of-mechanical-energy` 와도 갈랐다 — 그쪽은 총량이 유지될 때의 도착 속력,
 * 여기는 총량을 **바꿔 가며** 허용 범위를 읽는다. 이쪽만 「갇힘 · 언덕 넘기 · 전환점」
 * 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const potentialEnergyCurveConcept: Aperi21ConceptSource = {
  id: 'potential-energy-curve',
  label: 'Potential Energy Curve',
  canonicalSim: 'aperi21:potential-energy-curve',

  surface: {
    definition:
      'A plot of stored energy against position read together with a level line for the total, where the two meet marking the places a body must turn back and the shape deciding what it can reach.',
    exemplarKeywords: [
      'potential energy curve',
      'reading a potential energy diagram',
      'turning points where the total energy line meets the curve',
      'potential well and being trapped in it',
      'energy barrier and whether it can be crossed',
      'double well potential',
      'how far can the particle go',
      'classically forbidden region',
      'the kinetic energy is the gap between the line and the curve',
      'why raising the total energy lets it escape the valley',
    ],
  },

  briefing: {
    observable: [
      'A curve with two valleys separated by a hill is drawn against position, and a horizontal line for the total energy is laid across it.',
      'The moving object does not ride on the curve — it travels left and right along the level line, because the horizontal direction is position and the vertical one is energy.',
      'A short bar stands at the object between the curve below and the line above, and it is the gap between them; as the object nears a place where the two meet the bar shrinks to nothing and the object turns round there.',
      'Those meeting places are ringed, with a vertical line dropped from each, so the turning points are marked before the object reaches them.',
      'Marks are dropped behind the object at equal intervals of time, and they crowd together near the rings, which shows it slowing without any number being written.',
      'The stretch of the line the object can actually reach is drawn solid and the rest of it faint and dashed, so a valley that lies below the line but cannot be got to is visibly out of reach.',
      'Wherever the curve rises above the line, the space between them is shaded, and that shading reads as a wall.',
      'Over a run the line rises above the middle hill: the two inner rings vanish, the object crosses the hill and travels between both valleys, turning back only at the two outer walls.',
      'The line then comes down again, and the object is left shut in whichever valley it happened to be in, so the same height of line can give two different pairs of rings depending on where the object was.',
      'Three names are written beside the curve, the line and the bar, because without them all three would read as the same thing.',
      'No axes, ticks or values are drawn — the claim is entirely about where two drawn shapes cross.',
    ],

    screen: {
      affordances: [
        'A handle sits on a short vertical track just beyond the right end of the total-energy line and can be dragged up and down to set that line’s height, so the reader can hunt for the height at which the rings jump outward.',
        'Raising the line takes effect at once, while lowering it only happens while the object is moving, which keeps the object from being dragged down a wall as the line falls.',
        'Left alone, the line rises above the hill and falls back again over a run, so the crossing and the trapping both come round without being asked for.',
        'Which valley the object is shut into changes from one run to the next, so the same line height is seen giving two different outcomes.',
        'The accent colour is kept for the turning points alone; the curve and the bar share one colour as two parts of the same energy diagram.',
      ],
    },

    useWhen: [
      'The reader is treating the curve as a hillside with a ball rolling on it, and has to be moved to reading it as a diagram in which height means energy and the object travels along the level line.',
      'The article turns on whether something is trapped or can escape — a bond, a well, a barrier — and a case is wanted where the line can be taken above and below the hill and the turning points watched jumping outward.',
      'A passage needs the kinetic energy shown as a gap rather than as a number, so that running out of it and turning round are the same event.',
    ],

    avoidWhen: [
      'The point is how much energy a particular store holds, or the rule by which it fills — proportional to height, squared in a deformation. The curve here is given from the start and never said to come from anything.',
      'The article is about a body descending a real slope and how fast it arrives. Nothing here descends; the object moves horizontally along the line and the curve is not a ramp.',
      'The subject is that a force is the slope of the curve, or how to get the force back out of the plot. No slope is marked and no force arrow appears.',
      'Energy going missing to friction is the theme. The lowering of the line here is a device for changing the total, not a study of loss.',
      'Quantum tunnelling, or anything passing through a barrier it has not got the energy to cross, is the subject. Here the shaded region is simply never entered.',
      'Values are wanted — an energy, a position, a barrier height. Nothing numeric is drawn, not even axes.',
    ],

    contrastWith: [
      {
        concept: 'gravitational-potential-energy',
        note: 'One reads a whole landscape of stored energy to say where a body may go; the other fills and empties a single store and says how much it holds.',
      },
      {
        concept: 'elastic-potential-energy',
        note: 'One takes the stored energy as a given shape and asks what motion it permits; the other asks how much gets stored for a given deformation.',
      },
      {
        concept: 'conservation-of-mechanical-energy',
        note: 'One holds the total fixed and asks what speed comes out at the bottom; the other moves the total up and down on purpose and asks how far the body is allowed to travel.',
      },
      {
        concept: 'conservative-force',
        note: 'One assumes the energy can be written as a function of position and reads that function; the other is what licenses writing it that way at all.',
      },
      {
        concept: 'energy-dissipation',
        note: 'One uses a falling total only as a way of changing the picture; the other makes the falling total its whole subject and follows where the missing share ends up.',
      },
    ],
  },
};
