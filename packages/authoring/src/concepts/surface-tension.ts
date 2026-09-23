/**
 * surface-tension 개념 선언.
 *
 * 표면 넷 중 하나. 넷이 전부 「표면」 이라 **무엇을 주장하는가**로 갈랐다.
 *   surface-tension           **당김** — 크기는 그대로이고 방향이 돌아 짐을 받친다
 *   laplace-pressure          **곡률이 정하는 안쪽 압력** — 작은 쪽이 더 세게 눌린다
 *   capillary-action          **높이** — 오목한 면 아래의 부족을 기둥 무게가 메울 때까지 오른다
 *   wetting-and-contact-angle **각** — 가장자리 세 장력이 가로로 맞는 자리
 * 이쪽만 바늘 · 받침 · 같은 길이 · 돌아섬 · 뚫림 어휘를 갖는다. 압력 · 접촉각 · 오름은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const surfaceTensionConcept: Aperi21ConceptSource = {
  id: 'surface-tension',
  label: 'Surface Tension as a Pull That Turns to Carry a Load',
  canonicalSim: 'aperi21:surface-tension',

  surface: {
    definition:
      'The pull a liquid surface exerts along itself, always of one size, which holds up a body denser than the liquid once the surface dips and that pull turns upward.',
    exemplarKeywords: [
      'surface tension',
      'why does a steel needle float on water',
      'a water strider standing on a pond',
      'the surface behaves like a stretched skin',
      'denser than water and still sitting on top',
      'the surface holds a small object up',
      'a pull acting along the surface itself',
      'how much can a liquid surface carry',
      'the moment the surface gives way',
      'a paperclip resting on the water',
    ],
  },

  briefing: {
    observable: [
      'A needle seen end-on, drawn as a dark circle, is lowered onto flat water and the surface dips into a hollow beneath it.',
      'At each of the two places where the surface meets the needle, an arrow is drawn along the surface, pointing outward and upward.',
      'Those two arrows keep exactly the same length from beginning to end. The only thing about them that ever changes is which way they point.',
      'Under the tip of each arrow stands a dotted upright piece, the part of that pull that acts upward.',
      'From the top of the needle a separate arrow points down, standing for what presses the needle in; it and the pulls are drawn to one scale, so the two dotted pieces taken together can be read against it and they match.',
      'As that downward arrow lengthens, the hollow deepens and the two pulls swing upward like a closing fan, and the dotted pieces lengthen with them although the pulls themselves do not.',
      'At the last moment the two pulls stand straight up, parallel to each other, and the downward arrow is exactly twice one of them — there is no further direction for the pulls to turn into.',
      'The surface then flattens, the pulls and the downward arrow disappear, and the needle sinks and is seen faintly through the water below.',
      'The needle is never wetted: the surface leaves it along a tangent, and no line is drawn under the needle where the water is not in contact with the air.',
      'No number, no angle and no length is written anywhere, and the whole round repeats.',
    ],

    screen: {
      affordances: [
        'One round runs by itself from the needle coming down to the surface giving way, and then starts over.',
        'The claim is checked against two lengths at one scale: the two dotted upward shares set against the arrow pressing from above.',
        'What must be watched is that the pulls never change length. Nothing about the liquid strengthens as the load grows; only the direction of the pull turns.',
        'The accent colour carries one meaning, the force pressing the needle in, so it never competes with the pulls it is being compared against.',
        'The pulls are taken away the instant the surface gives way, because a surface that is no longer there has nothing to pull with.',
        'The picture is drawn through the water rather than above it, so the sunk needle can be seen below the surface while the surface line stays drawn over it.',
      ],
    },

    useWhen: [
      'The article has said the surface acts like a stretched skin and the reader has taken that to mean the skin pulls harder as more is loaded onto it. The pull keeping one length while only its direction turns is the correction.',
      'The reader wants to know why there is a limit at all — why a surface that carries a needle will not carry a coin. The moment the pulls stand vertical, with nowhere left to turn, is that limit shown rather than asserted.',
    ],

    avoidWhen: [
      'The claim is that a curved surface makes the pressure on one side differ from the pressure on the other. No pressure appears in this picture at all.',
      'The subject is how a liquid meets a solid, how far it spreads on it, or the angle it settles at. The needle here is deliberately left unwetted and no angle is marked.',
      'The subject is a drop pulling itself into a ball, or a surface shrinking its own area. The surface here is a long one, held down rather than closing up.',
      'The article is about a liquid climbing a narrow tube, or about where a raised column stops. Nothing rises here; a body is held from below.',
      'The point is the upward push a fluid gives a submerged body, or the liquid pushed aside by it. What the hollow displaces is deliberately left out so that only the pull is in play.',
      'Values are wanted — a tension in newtons per metre, or the angles the surface makes. There is not a number anywhere in the picture.',
    ],

    contrastWith: [
      {
        concept: 'laplace-pressure',
        note: 'One is about the surface’s pull and what it can carry; the other is about what the curvature of that same surface does to the pressure of what it encloses.',
      },
      {
        concept: 'wetting-and-contact-angle',
        note: 'One keeps the solid unwetted and asks how much load the surface will take; the other lets the liquid meet the solid and asks what angle the meeting settles at.',
      },
      {
        concept: 'capillary-action',
        note: 'One has the surface holding a body up from below; the other has it lifting the liquid itself, and the load it works against is the weight of what it has raised.',
      },
      {
        concept: 'buoyancy',
        note: 'One has the surface, and nothing else, doing the carrying; the other has the body under the surface entirely, with the difference between the pushes on its faces doing all the work.',
      },
    ],
  },
};
