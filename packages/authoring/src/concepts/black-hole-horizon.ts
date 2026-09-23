/**
 * black-hole-horizon 개념 선언.
 *
 * 이 묶음에서 유일하게 지구 · 달 · 계절과 무관하다. 형제는 중력 일반의 선언된 둘이고,
 * **무엇을 고정하고 무엇을 움직이는지로 갈랐다.**
 *   black-hole-horizon              질량을 고정하고 **반지름을 줄인다** — 표면의 탈출 속도가 광속에 닿는 반지름
 *   gravitational-potential-energy  높이를 들어 올려 **저장한 에너지** — 내려오며 돌려받는다
 *   gravitational-acceleration      중력의 세기를 고정하고 **속도의 변화**를 본다
 * 이쪽만 짜부라뜨림 · 지평선 · 되돌아오는 빛 어휘를 갖는다. 화면의 논증은 뉴턴식 탈출 속도라
 * 일반 상대론 어휘(시공간 곡률 · 빛원뿔 · 시간 지연)는 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const blackHoleHorizonConcept: Aperi21ConceptSource = {
  id: 'black-hole-horizon',
  label: 'Event Horizon of a Star Squeezed Small',
  canonicalSim: 'aperi21:black-hole-horizon',

  surface: {
    definition:
      'The radius at which shrinking a fixed mass raises its surface escape speed to the speed of light, so that light fired outward can no longer cross it.',
    exemplarKeywords: [
      'event horizon',
      'Schwarzschild radius',
      'escape speed equal to the speed of light',
      'why can nothing escape a black hole',
      'squeezing the Sun down to a few kilometres',
      'the dark star of Michell and Laplace',
      'point of no return around a black hole',
      'the radius from which light cannot get out',
      'collapsing a star until light is trapped',
      'how small a mass has to be to become a black hole',
    ],
  },

  briefing: {
    observable: [
      'A dark disc of a star fills the left of the frame with its radius written beside it in kilometres, while a bar named as the escape speed at the surface sits at the lower right beside a line marked as the speed of light.',
      'Light fired from the surface is drawn as a bright point with a trail behind it; at the largest radius it crosses the frame and leaves, and the bar is barely a hairline against the light-speed line.',
      'The star is squeezed in steps, stopping three times — the written radius falls from 696000 to 7000 to 12 kilometres — and at each stop another pulse is fired and again gets away.',
      'The bar grows at each squeeze; by twelve kilometres it stands at about half the light-speed line.',
      'As the star shrinks further a dashed circle appears inside it, already at its final size the moment it appears, and the surface settles down onto it.',
      'At the instant the surface meets that circle the end of the bar touches the light-speed line, and the circle is named as the event horizon at about three kilometres.',
      'Squeezed to half that radius the star sits wholly inside the dashed circle, and the bar now runs past the light-speed line.',
      'Light is then fired in eight directions at once; every pulse slows, comes to a stop exactly on the dashed circle, and falls back to the surface.',
      'The dashed circle keeps the same size from first appearance to last while the star shrinks past it, which is what says the mass has not changed.',
      'The three earlier pulses had all crossed the frame and left; the only thing that has changed between those and these is the radius.',
    ],

    screen: {
      affordances: [
        'The whole sequence runs by itself and repeats — three stops with light escaping, the squeeze onto the horizon, and the squeeze inside it; on arrival the largest star is already there with a pulse on its way out.',
        'Radii are drawn true to size only near the horizon and compressed beyond it, so a hundredfold shrink from the largest star shows as a small change and the written radius carries the size instead.',
        'The dashed circle is withheld until the star has come into the part of the picture drawn true to size, since drawn in the compressed part it would give a false ratio.',
        'The bar is drawn without compression and the accent colour is kept for light alone, so a pulse halting is read as light halting.',
      ],
    },

    useWhen: [
      'The article has defined the horizon as the radius where escape speed reaches light speed, and the reader has an equation rather than an event. The bar arriving at the line at the same instant the surface lands on the circle is what makes the two statements one thing.',
      'The prose needs the mass held constant while everything else changes, and a dashed circle that is the same size before, during and after the collapse is what holds that in view.',
    ],

    avoidWhen: [
      'The article treats the horizon relativistically — curved spacetime, light cones tipping inward, time running slow at the surface. What is drawn here is the older escape-speed argument, and light rises and falls back like a thrown stone.',
      'The subject is a black hole’s interior, its singularity, tidal stretching, or matter falling in and heating up. Nothing is drawn inside the dashed circle but the shrunken star.',
      'The point is what a distant observer sees — bent light, a bright ring, redshift, a photographed shadow.',
      'The article is about the launch speed needed to leave a planet, or a body thrown up and falling back. Here the launch speed is always the speed of light and what changes is the radius.',
      'Figures are wanted for escape speeds, or the horizon of some stated mass is to be worked out. Only the three stop radii and about three kilometres are written.',
      'How a star actually collapses — fuel running out, degeneracy pressure, a supernova — is the subject. The squeezing here has no cause attached to it.',
    ],

    contrastWith: [
      {
        concept: 'gravitational-potential-energy',
        note: 'One is energy banked by raising a body a little way above the ground; the other asks what speed would be needed to leave a body altogether, and what radius puts that speed out of reach.',
      },
      {
        concept: 'gravitational-acceleration',
        note: 'One holds gravity fixed and watches what it does to a velocity; the other holds the mass fixed and shrinks the body until the pull at its surface has no ceiling left.',
      },
    ],
  },
};
